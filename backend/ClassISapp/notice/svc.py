import math
import datetime

import simplejson
from flask import request, current_app
from flask_login import login_required, current_user

from .. import db
from . import notice
from .models import Notice, Msg, Audit
from ..public.models import User
from ..public.user import is_admin
from ..public.utils import record_error
from ..public.pubmsg import pub, send_notice

TIME_LIMIT = 18#0


@login_required
@notice.route('',methods=['POST'])
def notify():
    try:
        if not is_admin(current_user.role):
            return 'no privilege', 403

        payload = simplejson.loads(request.data)

        ret = pub(current_app, current_user, payload['abs'], payload['lvl'], payload['msg'])
        if ret is not None:
            return simplejson.dumps({'notice_id': ret})
        else:
            return 'error', 500

    except Exception as e:
        record_error(e)
        return 'error', 400


@notice.route('<int:id>', methods=['GET'])
def recv(id):
    try:
        id = int(id)
        notice = Notice.query.filter_by(id=id).first()

        if notice:
            return simplejson.dumps({
                'notice': {
                    'notice_id': notice.id,
                    'abs': notice.abs,
                    'notifier': User.query.filter_by(sno=notice.notifier).first().name,
                    'notifier_id': notice.notifier,
                    'notifytime': str(notice.notify_time)[6:16],
                    'msg': Msg.query.filter_by(notice_id=id).first().msg
                }
            })
    except Exception as e:
        record_error(e)
        return '', 404


@login_required
@notice.route('<int:id>', methods=['PUT'])
def edit(id):
    try:
        id = int(id)
        notice = Notice.query.filter_by(id=id).first()
        msg = Msg.query.filter_by(notice_id=id).first()

        if notice:
            if notice.notifier != current_user.sno:
                return 'no privilege', 403
            audit = Audit()
            audit.notifier_name = User.query.filter_by(sno=notice.notifier).first().name
            audit.notice_id = notice.id
            audit.old_abs = notice.abs
            audit.old_msg = msg.msg

            payload = simplejson.loads(request.data)
            notice.abs = payload['abs']
            msg.msg = payload['msg']

            audit.edit_time = datetime.datetime.now(
                                    datetime.timezone(
                                        datetime.timedelta(hours=8)
                                    )
                                )
            audit.new_abs = payload['abs']
            audit.new_msg = payload['msg']

            db.session.add_all([notice,msg,audit])
            db.session.commit()

            send_notice(current_app,notice.id,notice.lvl,notice.abs,msg.msg)

            return simplejson.dumps({
                'notice': {
                    'notice_id': notice.id,
                    'abs': notice.abs,
                    'notifier': User.query.filter_by(sno=notice.notifier).first().name,
                    'notifier_id': notice.notifier,
                    'notifytime': str(notice.notify_time)[6:16],
                    'msg': Msg.query.filter_by(notice_id=id).first().msg
                }
            })
    except Exception as e:
        record_error(e)
        return 'error', 500


@notice.route('log', methods=['GET'])
def audit_log():
    try:
        audits = Audit.query.all()

        return simplejson.dumps({
            'logs': [{
                'name':audit.notifier_name,
                'time': str(audit.edit_time),
                'oldAbs': audit.old_abs,
                'oldMsg': audit.old_msg,
                'newAbs': audit.new_abs,
                'newMsg': audit.new_msg,
                'noticeId': audit.notice_id
            } for audit in audits
            ]
        })
    except Exception as e:
        return simplejson.dumps({
            'logs': [ ],
        })


def ref_handle(qs, parm: str, valtype, default, validate_func):
    try:
        ret = valtype(qs.get(parm))
        ret = validate_func(ret, default)
    except:
        ret = default
    return ret


@notice.route('', methods=['GET'])
def recv_all():
    page = ref_handle(request.args, 'page', int, 1, lambda x, y: x if x > 0 else y)
    size = ref_handle(request.args, 'size', int, 15, lambda x, y: x if x > 0 and x < 50 else y)
    try:
        start = (page - 1) * size
        notifications = Notice.query.order_by(Notice.id.desc())
        amount = notifications.count()
        notifications = notifications[start : start+size]
        # pn = Notice.query.order_by(Notice.id.desc()).paginate(page, size)
        # notifications = pn.items
        # amount = len(notifications)  #总数不对

        return simplejson.dumps({
            'notifications': [
                {
                    'notice_id': notification.id,
                    'notifytime': str(notification.notify_time)[6:16],
                    'abs': notification.abs

                } for notification in notifications
            ],
            'pagination': {
                'page': page,
                'size': size,
                'amount': amount,
                'pages': math.ceil(amount / size)
            }
        })

    except Exception as e:
        record_error(e)
        return 'BadRequest' ,400