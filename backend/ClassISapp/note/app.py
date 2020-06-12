import os
import hashlib

from . import config
from ..public.utils import rm

PATH_PREFIX=config['PATH_PREFIX']
PATH_ROOT=config['NOTE_PATH']


def gen_notetree(filepath, gen_filelist):
    """生成随堂笔记文件树

    :param filepath:
    :param gen_filelist: 随堂笔记文件树列表
    :return:
    """
    files = os.scandir(filepath)
    for entry in files:
        if entry.is_dir():
            child_list = []
            gen_notetree(entry.path, child_list)
            entry_path = ''.join(entry.path)
            gen_filelist.append({'key': entry_path.replace(PATH_PREFIX,''),
                                 'title': entry.name,
                                 'children': child_list,
                                 'isLeaf': 0})
        else:
            entry_path = ''.join(entry.path)
            gen_filelist.append({'key': entry_path.replace(PATH_PREFIX,''),
                                 'title': entry.name,
                                 'isLeaf': 1})


def cmp_handle(path,dirlist,filedict):
    """比较客户端和服务端同步目录的文件差异

    :param path:
    :param dirlist:
    :param filedict:
    :return:
    """
    files = os.scandir(path)
    for entry in files:
        if entry.is_dir():
            dirpath = ''.join(entry.path)  #！！！须使用join
            dir = dirpath.replace(PATH_ROOT,'/').replace('\\','/')
            if dir in dirlist:
                cmp_handle(entry.path,dirlist,filedict)
                dirlist.remove(dir)
            else:
                rm(entry.path)

        else:
            with open(entry.path, 'rb') as f:
                data = f.read()
            filepath = ''.join(entry.path)
            file_md5 = hashlib.md5(data).hexdigest()
            file_key = filepath.replace(PATH_ROOT,'/').replace('\\','/')
            if file_key in filedict:
                filedict.pop(file_key) if file_md5 == filedict[file_key] else os.remove(entry.path)
            else:
                os.remove(entry.path)