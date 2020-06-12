import os

import simplejson
from flask import request
from flask_login import login_user

from .. import db
from . import public
from .utils import record_error
from .models import User

CLASS_CADRES = {"班长", "团支书", "学习委员", "副班长", "纪律委员", "生活委员", "宣传委员", "体育委员", "组织委员"}


def is_admin(role):
    return True if role in CLASS_CADRES else False


@public.route('/login', methods=['GET','POST'])
def login():
    try:
        payload = simplejson.loads(request.data)
        sno = payload['sno']
        user = User.query.filter_by(sno=sno).first()

        if user and user.verify_password(payload['password']):
            login_user(user)
            ret = simplejson.dumps({
                    'user':{
                        'sno':user.sno,
                        'name':user.name,
                        'email':user.email,
                        'role':user.role
                    }
                })

        return ret
    except Exception as e:
        return "Login failed", 401


@public.route('/reg', methods=['GET','POST'])
def reg():
    try:
        payload = simplejson.loads(request.data)
        sno = payload['sno']
        query_ret = User.query.filter_by(sno=sno).first()
        if query_ret:
            return '', 500

        name = payload['name']
        role = payload['role']
        email = payload['email']
        passwd = payload['password']

        user = User(sno=sno)
        user.name = name
        user.role = role
        user.email = email
        user.password = passwd

        db.session.add(user)
        db.session.commit()

        uid = str(user.id)
        user_path = os.getenv('FILE_PATH') + uid
        os.mkdir(user_path)

        login_user(user)
        ret = simplejson.dumps({
            'user': {
                'sno': user.sno,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        })

        return ret
    except Exception as e:
        record_error(e)
        return "fail to register", 401


