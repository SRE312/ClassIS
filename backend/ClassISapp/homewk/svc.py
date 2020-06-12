import os
import threading
import simplejson

from flask import request, current_app
from flask_login import login_required, current_user
#from werkzeug.utils import secure_filename

from .. import db
from . import homewk,config
from .models import HomeWk
from ..public.pubmsg import pub
from ..public.utils import record_error
from .app import cron


@login_required
@homewk.route('',methods=['POST'])
def inform():
    try:
        if current_user.role != '学习委员':
            return 'no privilege', 403
        payload = simplejson.loads(request.data)
        homewk = HomeWk()
        homewk.course = payload['course']
        homewk.deadline = payload['deadline']
        if payload['email'] != '':
            homewk.tch_email = payload['email']
        homewk.requirement = payload['requirement']

        db.session.add(homewk)
        db.session.commit()

        if payload['email'] != '':
            hid = str(homewk.id)
            ddl = homewk.deadline.timestamp()
            uploads_path =config['HOMEWK_PATH']+hid
            os.mkdir(uploads_path)

            cron_thread = threading.Thread(target=cron,
                                           name='handjob-worker-'+hid,
                                           args=(hid,
                                                 ddl,
                                                 payload['email'],
                                                 payload['course'],
                                                 current_app._get_current_object()
                                                 ),
                                           daemon=False
                                           )
            cron_thread.start()

        pub_abs = homewk.course + '的作业需要在 '+ str(homewk.deadline) + ' 前完成'
        detail = '作业要求：'+ homewk.requirement

        pub(current_app, current_user, pub_abs, 2, detail)

        return simplejson.dumps({'homewk_id': homewk.id})

    except Exception as e:
        record_error(e)
        return '', 500


@homewk.route('', methods=['GET'])
def see():
    try:
        homeworks = HomeWk.query.order_by(HomeWk.id.desc())
        amount = homeworks.count()
        try:
            role = current_user.role
        except:
            role = "AnonymousUser"

        return simplejson.dumps({
            'homeworks': [
                {
                    'homework_id': homework.id,
                    'ddl': str(homework.deadline)[:16],
                    'requirement': homework.requirement,
                    'course': homework.course

                } for homework in homeworks
            ],
            'amount': amount,
            'role': role })
    except Exception as e:
        return '' ,404


@homewk.route('/<int:id>', methods=['GET'])
def view(id):
    try:
        id = int(id)
        homewk = HomeWk.query.filter_by(id=id).first()

        if homewk:
            return simplejson.dumps({
                'homewk': {
                    'course': homewk.course,
                    'deadline': str(homewk.deadline)[:16],
                    'requirement': homewk.requirement
                }
            })
    except Exception as e:
        record_error(e)
        return '', 404


@login_required
@homewk.route('/<int:id>', methods=['POST'])
def upload(id):
    try:
        stu_homework_file = request.files["file"]
        base_path = os.path.dirname(config['HOMEWK_PATH'])
        uploads_path = os.path.join(base_path, str(id), stu_homework_file.filename)  #secure_filename(stu_homework_file.filename
        stu_homework_file.save(uploads_path)

        return simplejson.dumps({
            'result': 'submitted successfully'
        })
    except Exception as e:
        record_error(e)
        return simplejson.dumps({
            'result': 'error'
        }), 401

