import os

import simplejson
from flask_login import login_required
from flask import request

from .. import cache
from . import file,config
from ..public.utils import rm, record_error
from .app import  (gen_filetree, gen_filetree_by_path, change_pathprefix,
                   gen_filetree_by_name, gen_filetree_by_suffix, gen_filetree_by_modify,
                   gen_filetree_by_upload, gen_suffixset, search_app)

EXPIRE = 600


@file.route('', methods=['GET'])
def file_tree():
    try:
        sortord = request.environ['HTTP_SORTORD']  #排序方式
        order = False if request.environ['HTTP_ORDER']=='SORT' else True

        cache_key = sortord+request.environ['HTTP_ORDER']
        cache_value = cache.get(cache_key)  #先从Redis中查看是否有缓存结果
        if cache_value:
            return cache_value
        else:
            file_list = []

            if sortord == 'path':
                gen_filetree_by_path(config['FILE_PATH'],file_list,order)
            elif sortord == 'filename':
                gen_filetree_by_name(config['FILE_PATH'],file_list,order)
            elif sortord == 'suffix':
                suffix_set = set()
                gen_filetree_by_suffix(config['FILE_PATH'], file_list, order, suffix_set)
            elif sortord == 'modify':
                gen_filetree_by_modify(config['FILE_PATH'], file_list, order)
            elif sortord == 'upload':
                gen_filetree_by_upload(config['FILE_PATH'], file_list, order)
            else:
                gen_filetree_by_path(config['FILE_PATH'], file_list, order)
                file_list = change_pathprefix(file_list, order)

            cache.set(cache_key, simplejson.dumps({'trees': file_list}),EXPIRE)

            return cache.get(cache_key)
    except Exception as e:
        record_error(e)
        return '', 500


@file.route('/suffix', methods=['GET'])
def suffix():
    try:
        cache_key = 'suffixset'
        cache_value = cache.get(cache_key)
        if cache_value :
            return cache_value
        else:
            suffix_set = set()
            gen_suffixset(config['FILE_PATH'],suffix_set)
            cache.set(cache_key,simplejson.dumps({'suffixList': list(suffix_set)}),600)
            return cache.get(cache_key)
    except Exception as e:
        record_error(e)
        return '', 500


@file.route('', methods=['POST'])
def search():
    try:
        payload = simplejson.loads(request.data)
        file_list = []
        search_app(config['FILE_PATH'], payload['name'],payload['suffix'],payload['uploadTime'], file_list)

        return simplejson.dumps({'searchTree': file_list})
    except Exception as e:
        record_error(e)
        return '', 500


@login_required
@file.route('/<int:id>', methods=['GET'])
def myfile(id):
    """查看我的文件"""
    try:
        file_list = []
        order = True
        path=config['FILE_PATH']+'/'+str(id)
        gen_filetree(path, file_list, order)

        ret = [{'key': '/', 'title': '我的文件', 'children':file_list}]
        return simplejson.dumps({'myFileTree': ret})
    except Exception as e:
        record_error(e)
        return '', 500


@login_required
@file.route('/<int:id>', methods=['POST'])
def myfile_manage(id):
    """管理我的文件"""
    try:
        payload = request.form
        if payload['action'] == 'mkdir':
            new_dir=os.path.join(config['FILE_PATH']+str(id)+payload['pwd'],payload['dir'])
            os.mkdir(new_dir)
        elif payload['action'] == 'addFile':
            for add_file in request.files.getlist('file'):
                basepath = config['FILE_PATH']+str(id)+payload['pwd']
                uploads_path = os.path.join(basepath,add_file.filename)
                add_file.save(uploads_path)
        elif payload['action'] == 'rmFile':
            for item in payload['rmList'].split(','):
                path = os.path.join(config['FILE_PATH'],item.replace('file/',''))
                if os.path.exists(path) :
                    rm(path)

        file_list = []
        order = True
        path=config['FILE_PATH']+str(id)
        gen_filetree(path, file_list, order)
        ret = [{'key': '/', 'title': '我的文件', 'children':file_list}]

        return simplejson.dumps({'myFileTree': ret})
    except Exception as e:
        record_error(e)
        return '', 500
