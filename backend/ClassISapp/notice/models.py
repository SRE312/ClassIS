from .. import db


class Notice(db.Model):
    __tablename__ = 'notices'

    id = db.Column(db.Integer, primary_key=True)
    abs = db.Column(db.String(48), nullable=False)
    notify_time = db.Column(db.DateTime, nullable=False)  #通知发布的时间
    lvl = db.Column(db.Integer, nullable=False, default=2)
    notifier = db.Column(db.Integer, db.ForeignKey('users.sno'))

    msg = db.relationship('Msg', backref='notice')

    def __repr__(self):
        return '<notice {} {} {} {} {} >'.format(
            self.id, self.abs, self.notify_time, self.lvl, self.notifier)

    __str__ = __repr__


class Msg(db.Model):
    __tablename__ = 'msg'

    id = db.Column(db.Integer, primary_key=True)
    notice_id = db.Column(db.Integer, db.ForeignKey('notices.id'))
    msg = db.Column(db.UnicodeText, nullable=True)

    def __repr__(self):
        return '<msg id: {} msg: {}'.format(self.id, self.msg[:32])

    __str__ = __repr__

class Audit(db.Model):
    __tablename__ = 'audit'

    id = db.Column(db.Integer, primary_key=True)
    notice_id = db.Column(db.Integer)
    notifier_name = db.Column(db.String(20))
    edit_time = db.Column(db.DateTime, nullable=False)
    old_abs = db.Column(db.String(48), nullable=False)
    new_abs = db.Column(db.String(48), nullable=False)
    old_msg = db.Column(db.UnicodeText, nullable=True)
    new_msg = db.Column(db.UnicodeText, nullable=True)

