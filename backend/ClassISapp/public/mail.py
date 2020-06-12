import os

from flask_mail import Message

from .. import mail
from .utils import record_error


def send_email(target, subject, email_body, app_obj, file_path=''):
    """发送邮件

    :param target: 目标地址
    :param subject: 主题
    :param email_body: 邮件正文
    :param app_obj: 正处理请求的app对象
    :param file_path: 附件文件路径
    :return:
    """
    try:
        app = app_obj
        msg = Message(subject,
                      sender=os.getenv('MAIL_ACCOUNT'),
                      recipients=target)
        msg.body = email_body
        if file_path:
            with app.open_resource(file_path) as email_attach_file:
                msg.attach("homework.zip", "application/zip",
                           data=email_attach_file.read())

        with app.app_context():
            mail.send(msg)

        return 'success'

    except Exception as e:
        record_error(e)
        return 'error'