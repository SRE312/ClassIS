import os
import time
import sched

from zipfile import ZipFile, ZIP_DEFLATED

from . import config
from ..public.mail import send_email
from ..public.utils import record_error


def hand_job(hid, tch_email, course, app_obj):
    """上交作业

    :param id: 作业id
    :param tch_email: 老师邮箱
    :param course: 课程
    :param app_obj: 当前处理请求的app对象
    :return:
    """
    try:
        path = config['HOMEWK_PATH']+hid
        hwklists = os.listdir(path)

        os.chdir(path)
        zfile_name = course+'-'+hid+'-homework.zip'
        with ZipFile(zfile_name, 'a', compression=ZIP_DEFLATED) as zfile:
            for hwk in hwklists:
                zfile.write(hwk)
        subject = config['CLASS_NAME'] + course + "作业"
        body = subject
        zfile_path = path + '/' + zfile_name
        send_email([tch_email], subject, body, app_obj, zfile_path)

    except Exception as e:
        record_error(e)
        return 'error'

def cron(hid, ddl, tch_email, course, appobj):
    scheduler = sched.scheduler(time.time, time.sleep)
    scheduler.enterabs(ddl, 1, hand_job,(hid, tch_email, course, appobj))
    scheduler.run()

