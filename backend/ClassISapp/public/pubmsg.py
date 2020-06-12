import datetime
import threading

from .. import db
from ..notice.models import Notice,Msg
from .models import User
from .mail import send_email
from .wechat import send_wechat
from .utils import record_error

TIME_LIMIT = 180


def send_notice(app,id,lvl,abs,message):
    """根据通知级别发送微信或邮件通知

    :param app: 正处理请求的app
    :param id:
    :param lvl: 通知的级别
    :param abs: 通知摘要
    :param message: 通知内容
    :return:
    """
    if lvl <= 2:
        send_wechat('@all', abs + '\n\n' + message)  #紧急以及重要级别的通知则发送微信通知

    if lvl <= 1:
        etarget = []
        emails = User.query.with_entities(User.email).all()
        for e in emails:
            etarget.append(e[0])

        email_thread = threading.Thread(target=send_email,
                                        name='send-email-job-worker-' + str(id),
                                        args=(etarget,
                                              abs,
                                              message,
                                              app._get_current_object()
                                              ),
                                        daemon=False
                                        )
        email_thread.start()


def pub(app,user,abs,lvl,message):
    """保存并发送通知

    :param app: 正处理请求的app
    :param user: 发布者
    :param abs: 通知摘要
    :param lvl: 通知的级别
    :param message: 通知内容
    :return:
    """
    try:
        notify = Notice()
        msg = Msg()

        now = datetime.datetime.now(
            datetime.timezone(
                datetime.timedelta(hours=8)
            )
        )
        now_time = datetime.datetime.timestamp(now)
        last = Notice.query.filter_by(notifier=user.sno).order_by(Notice.notify_time.desc()).first()
        if last:
            last_time = datetime.datetime.timestamp(last.notify_time)
            interval = now_time - last_time
            if interval < TIME_LIMIT:
                return "too frequently", 413

        notify.abs = abs
        notify.notify_time = now
        notify.lvl = lvl
        notify.notifier = user.sno

        db.session.add(notify)
        db.session.commit()

        msg.msg = message
        msg.notice_id = notify.id

        # db.session.add_all([notify,msg])
        db.session.add(msg)
        db.session.commit()

        send_notice(app,notify.id,lvl,abs,message)

        return notify.id
    except Exception as e:
        record_error(e)
        return None