import os
import datetime
import simplejson

from flask import request, current_app, make_response, send_from_directory
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename

from .. import db
from . import fee,config
from .models import Fee
from ..public.models import User
from ..public.mail import send_email
from ..public.utils import record_error
from .app import handle_balance


@fee.route('', methods=['GET'])
def bill():
    try:
        bills = Fee.query.filter_by(stat=1).order_by(Fee.id.desc())
        if bills:
            surplus = bills[0].balance
            amount = bills.count()

            return simplejson.dumps({
                        'bills': [
                            {
                                'item': bill.item,
                                'date': bill.date,
                                'detail': bill.detail,
                                'account': bill.account,
                                'balance': bill.balance

                            } for bill in bills
                        ],
                        'surplus': surplus,
                        'amount': amount
                    })
        else:
            return ''
    except Exception as e:
        record_error(e)
        return '',404


@login_required
@fee.route('', methods=['POST'])
def account():
    fee = Fee()
    try:
        account_form = dict(request.form)
        fee.item = account_form['item']
        account_value = float(account_form['account'])
        fee.payer = current_user.name

        if account_form['action'] == 'disburse':
            fee.date = account_form['date']
            fee.detail = '-'+account_form['detail']
            fee.account = account_value*(-1)
            fee.stat = 0

            fee.balance = 0
            db.session.add(fee)
            db.session.commit()

            uploads_path = config['FEE_PATH'] + str(fee.id)
            os.mkdir(uploads_path)

            for account_file in request.files.getlist('file'):
                base_path = os.path.dirname(config['FEE_PATH'])
                uploads_path = os.path.join(base_path, str(fee.id), secure_filename(account_file.filename))
                account_file.save(uploads_path)

            target = User.query.filter_by(role='生活委员').first().email
            # send_email([target],
            #            current_user.name+'申请报销'+account_form['item'],
            #            '支付详情：'+account_form['detail']+'\n'+'支付金额：'+account_form['account'],
            #            current_app._get_current_object()
            #            )

            return simplejson.dumps({
                'result': '提交成功，等待审核',
                'id':fee.id
            })

        else:
            if current_user.role != '生活委员':
                return '您不具有添加收入记录的权限', 403
            fee.date = datetime.datetime.now(
                            datetime.timezone(
                                datetime.timedelta(hours=8)
                            )
                        ).date()
            fee.detail = account_form['detail']
            fee.account = account_form['account']

            old_balance = Fee.query.filter_by(stat=1).order_by(Fee.id.desc()).first()
            if old_balance:
                old_balance = old_balance.balance
                fee.balance = old_balance + account_value
            else:
                fee.balance = 0 + account_value
            fee.stat=1
            db.session.add(fee)
            db.session.commit()

            return simplejson.dumps({
                'result': '提交成功',
                'id': fee.id
            })

    except Exception as e:
        record_error(e)
        return simplejson.dumps({
            'result': 'error'
        }), 401


@fee.route('/audit', methods=['GET'])
def audit_msg():
    try:
        auditings = Fee.query.filter_by(stat=0).order_by(Fee.id.desc())
        auditeds = Fee.query.filter_by(stat=1).order_by(Fee.id.desc())
        auditfails = Fee.query.filter_by(stat=2).order_by(Fee.id.desc())

        adtings, adteds, adtfails = map(lambda x:[ {
                                            'id': bill.id,
                                            'item': bill.item,
                                            'date': bill.date,
                                            'account': bill.account,
                                            'payer': bill.payer,
                                            'materials': os.listdir(config['FEE_PATH'] + str(bill.id)) if bill.account < 0 else []
                                            }for bill in x],
                                        [auditings, auditeds, auditfails])

        return simplejson.dumps({
            'auditings': adtings,
            'auditeds': adteds,
            'auditfails': adtfails
        })
    except Exception as e:
        record_error(e)
        return '' ,404


@fee.route('<id>/<filename>', methods=['GET'])
def show(id,filename):
    try:
        materials_path = config['FEE_PATH'] + str(id)

        response = make_response(send_from_directory(materials_path, filename, as_attachment=True))
        response.headers["Content-Disposition"] = "attachment; filename={}".format(filename.encode().decode('latin-1'))
        return response

    except Exception as e:
        record_error(e)
        return '' ,404


@login_required
@fee.route('/audit', methods=['POST'])
def audit():
    try:
        if current_user.role != '生活委员':
            return 'no privilege', 403
        payload=simplejson.loads(request.data)
        handle_balance(payload['id'],payload['action'])

        return 'ok',200
    except Exception as e:
        record_error(e)
        return 'BadRequest' ,502