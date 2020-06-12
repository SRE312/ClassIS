import os
import glob

import simplejson
from flask import request
from flask_login import login_required, current_user

from . import textbook
from ..public.utils import record_error
from .models import Textbook
from . import app


@login_required
@textbook.route('/rst', methods=['GET'])
def rst():
    if current_user.role != '生活委员':
        return 'no privilege', 403
    try:
        # glob匹配压缩文件路径
        os.chdir(app.config['BK_PATH'])
        datafile = ''.join(glob.glob(r"*数据.rar*"))
        app.un_rar(datafile)

        # 使用通配符匹配教材信息表的路径信息
        excel_file = ''.join(glob.glob(r"*教材计划数据/*大学城*"))
        app.handle_excel(excel_file, app.config['CLASS_NAME'])

        app.update_db()

        return 'Reset Sucessfully', 200

    except Exception as e:
        record_error(e)
        return '' ,500


@textbook.route('', methods=['GET'])
def info():
    try:
        books = Textbook.query.all()
        amount = len(books)

        return simplejson.dumps({
            'textbooks': [
                {
                    'bkname': book.bookname,
                    'ibsn': book.ibsn,
                    'press': book.press,
                    'edition': book.edition,
                    'chiefeditor': book.chiefeditor,
                    'course': book.course
                } for book in books
            ],
            'amount': amount
        })
    except Exception as e:
        record_error(e)
        return '' ,404


@login_required
@textbook.route('', methods=['POST'])
def reg():
    try:
        payload = simplejson.loads(request.data)
        bk=payload['bk']
        app.insert_to_db(current_user.sno,bk)
        return '',200
    except Exception as e:
        record_error(e)
        return '' ,500


@textbook.route('stats', methods=['GET'])
def statsinfo():
    try:
        rethead, rets = app.stats()
        return simplejson.dumps({
            'statsinfos': [
                ret for ret in rets
            ],
            'statshead': rethead
        })
    except Exception as e:
        record_error(e)
        return simplejson.dumps({
            'statsinfos': [ ],
            'statshead': [ ]
        })