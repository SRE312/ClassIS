from flask import current_app
from flask_login import current_user

from .. import db
from .models import Fee
from ..public.pubmsg import pub


def handle_balance(id,action):
    fee = Fee.query.filter_by(id=id).first()
    if action == 'pass':
        before_balance  = Fee.query.filter_by(stat=1).filter(Fee.id<id).order_by(Fee.id.desc()).first().balance

        if before_balance:
            fee.balance = before_balance + fee.account
        else:
            fee.balance = 0 + fee.account
        fee.stat = 1
        db.session.add(fee)
        db.session.commit()

        pubabs = '新增一笔支出'
        detail = '支出项目： '+ fee.item + '  \n'+'支出金额： ' + str(abs(fee.account))
        pub(current_app, current_user, pubabs , 3, detail)

        mid_balance = fee.balance
        mid_id = fee.id
        while True:
            after = Fee.query.filter_by(stat=1).filter(Fee.id>mid_id).first()
            if after:
                after.balance = mid_balance + after.account
                db.session.add(after)
                db.session.commit()
                mid_balance = after.balance
                mid_id = after.id

            else: break
    else:
        fee.stat = 2
        db.session.add(fee)
        db.session.commit()

    return None