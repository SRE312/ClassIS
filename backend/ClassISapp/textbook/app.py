import platform

import pandas as pd
import pymysql
if platform.system() == "Windows":
    from unrar import rarfile
elif platform.system() == "Linux":
    import rarfile
else:
    import rarfile

from .. import db
from . import config
from .models import Textbook


def un_rar(filename):
    """解压函数

    :param filename:
    :return:
    """
    rar=rarfile.RarFile(filename)
    rar.extractall(path=config['BK_PATH'])


def handle_excel(file,classname):
    """处理教材Excel文件，筛选出本班文件

    :param file:
    :param classname: 班级名称
    :return:
    """
    # 读取excel文件
    book = pd.read_excel(file, skiprows=1, header=0)

    # 筛选信息
    book = book[(book.行政班名称 == classname) & (book.教材使用情况 == "征订")]
    book = book[['教材名称', 'ISBN号', '出版社', '版次', '主编', '课程名称']]

    # 生成新表
    book.to_excel(config['BK_PATH']+"\\textbook.xls", sheet_name="0", index=False, header=True)


def update_db():
    """更新数据库

    :return:
    """

    # 连接数据库并删除数据库中的旧表/视图
    mysql_con = pymysql.connect( host=config['DB_HOST'],
                                 user=config['DB_USER'],
                                 password=config['DB_PASSWORD'],
                                 database=config['DB_NAME'],
                                 port=config['DB_PORT'],
                                 use_unicode=True, charset="utf8")
    mysql_con.autocommit(True)

    try:
        with mysql_con.cursor() as db_cursor:
            rm_oldtb = """DROP VIEW IF EXISTS statistics"""
            db_cursor.execute(rm_oldtb)
            rm_oldtb = """DROP TABLES IF EXISTS registration"""
            db_cursor.execute(rm_oldtb)

            # 将读取到的excel文件创建成数据库中的一张表
            # textbooks表用于教材信息展示
            oldtb = Textbook.query.all()
            for record in oldtb:
                db.session.delete(record)
            db.session.commit()

            book = pd.read_excel(config['BK_PATH']+"\\textbook.xls", header=0)

            for i in range(0, len(book)):
                tb = Textbook()
                tb.bookname, tb.ibsn, tb.press, tb.edition, tb.chiefeditor, tb.course = [book[x][i] for x in book]
                db.session.add(tb)
            db.session.commit()

            series = pd.Series(book['教材名称'])
            booksnum = series.size
            reg_crt = """ CREATE TABLE registration (sno INT(11) UNIQUE, """
            stats_view_crt = """CREATE VIEW statistics("""
            stats_view_slc = """) AS SELECT """
            stats_view_from = """FROM registration"""

            # 字符串拼接生成创建登记表及统计视图的SQL语句
            for i in range(booksnum):
                nospace = series[i].replace(' ', '')
                reg_crt = reg_crt + "`" + nospace + "`" + " TINYINT CHECK(" + "`" + nospace + "` " + " BETWEEN 0 AND 1), "
                stats_view_crt = stats_view_crt + "`" + nospace + "`,"
                stats_view_slc = stats_view_slc + "SUM(`" + nospace + "`),"

            reg_crt = reg_crt + """ FOREIGN KEY(sno) REFERENCES users(sno)) DEFAULT CHARSET=utf8"""
            stats_view_crt = stats_view_crt.strip(",")
            stats_view_slc = stats_view_slc.strip(",")
            stats_view = stats_view_crt + stats_view_slc + stats_view_from

            db_cursor.execute(reg_crt)
            db_cursor.execute(stats_view)
    finally:
        mysql_con.close()


def insert_to_db(usersno, bklist):
    """插入同学选书列表到数据库

    :param usersno: 学号
    :param bklist: 选书列表
    :return:
    """
    mysql_con = pymysql.connect( host=config['DB_HOST'],
                                 user=config['DB_USER'],
                                 password=config['DB_PASSWORD'],
                                 database=config['DB_NAME'],
                                 port=config['DB_PORT'],
                                 use_unicode=True, charset="utf8")
    mysql_con.autocommit(True)
    insert_sql = "REPLACE INTO registration VALUES("+str(usersno)
    try:
        with mysql_con.cursor() as db_cursor:
            colnum_query = """SELECT count(*) FROM information_schema.COLUMNS WHERE table_name="registration";"""
            colname_query = """SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE table_name="registration";"""
            db_cursor.execute(colnum_query)
            colnum=db_cursor.fetchone()[0]
            db_cursor.execute(colname_query)
            colname=[cn[0] for cn in db_cursor.fetchall()]

            for i in range(1,colnum):
                value = "1" if colname[i] in bklist else "0"
                insert_sql += ","+value
            insert_sql += ")"

            db_cursor.execute(insert_sql)

    finally:
        mysql_con.close()


def stats():
    """生成统计信息

    :return: 统计结果
    """
    mysql_con = pymysql.connect( host=config['DB_HOST'],
                                 user=config['DB_USER'],
                                 password=config['DB_PASSWORD'],
                                 database=config['DB_NAME'],
                                 port=config['DB_PORT'],
                                 use_unicode=True, charset="utf8")
    mysql_con.autocommit(True)
    purchase_info_sql = "SELECT u.name, r.* FROM users AS u, registration AS r WHERE u.sno=r.sno"
    stats_sql = "SELECT * FROM statistics"
    total = ['','总计']
    statsret = []
    try:
        with mysql_con.cursor() as db_cursor:
            colname_query = """SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE table_name="registration";"""
            db_cursor.execute(colname_query)
            colname = [cn[0] for cn in db_cursor.fetchall()]
            colname = ['学号','姓名']+colname[1:]

            db_cursor.execute(purchase_info_sql)
            purchase_info = db_cursor.fetchall()
            for pinfo in purchase_info:
                p = []
                p.append(pinfo[1])
                p.append(pinfo[0])
                p.extend(pinfo[2:])
                statsret.append(p)
            db_cursor.execute(stats_sql)
            statsinfo=db_cursor.fetchall()[0]
            for ret in statsinfo:
                total.append(int(ret))
            statsret.append(total)

            return colname,statsret
    finally:
        mysql_con.close()