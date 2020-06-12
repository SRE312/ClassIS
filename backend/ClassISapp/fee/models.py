from .. import db


class Fee(db.Model):
    __tablename__ = 'fees'

    id = db.Column(db.Integer, primary_key=True)
    item = db.Column(db.String(20), nullable=False)
    date = db.Column(db.String(10), nullable=False)
    detail = db.Column(db.String(20), nullable=True)
    account = db.Column(db.Float, nullable=False)
    balance = db.Column(db.Float, nullable=False)
    payer = db.Column(db.String(8), nullable=False)
    stat = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return '<fee {} {} {} {} {}>'.format(
            self.id, self.item, self.date, self.detail, self.balance)

    __str__ = __repr__