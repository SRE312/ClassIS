import os

import simplejson
from flask import request

from . import note,config
from ..public.utils import record_error
from .app import gen_notetree, cmp_handle

NUM_PER_ROW=3


@note.route('', methods=['GET'])
def note_tree():
    try:
        gen_filelist = []
        gen_notetree(config['NOTE_PATH'], gen_filelist)
        if gen_filelist:
            mod = len(gen_filelist ) % NUM_PER_ROW
            index = -1 * mod
            list_item = zip(*[iter(gen_filelist)] * NUM_PER_ROW)

            note_list = [list(i) for i in list_item]
            note_list.append(gen_filelist[index:]) if mod != 0 else note_list

            return simplejson.dumps({'noteTrees': note_list})
        else:
            return '', 404
    except Exception as e:
        record_error(e)
        return '', 500


@note.route('', methods=['POST'])
def before_sync():
    try:
        if request.headers['TOKEN'] != config['SYNC_TOKEN']:
            return 'no privilege', 403

        payload = simplejson.loads(request.data)
        dir_list = payload['dir_list']
        file_dict = payload['file_dict']

        cmp_handle(config['NOTE_PATH'],dir_list,file_dict)

        for dir in dir_list:
            new_dir = config['NOTE_PATH']+dir
            if not os.path.exists(new_dir):
                os.makedirs(new_dir)

        return simplejson.dumps({'need_sync':list(file_dict.keys())})
    except Exception as e:
        record_error(e)
        return '', 500


@note.route('', methods=['PUT'])
def sync():
    try:
        if request.headers['TOKEN'] != config['SYNC_TOKEN']:
            return 'no privilege', 403
        upload_file = request.files["file"]
        uploads_path = config['NOTE_PATH']+upload_file.filename
        upload_file.save(uploads_path)

        return ''
    except Exception as e:
        record_error(e)
        return '', 500