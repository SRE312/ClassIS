from .. import db


class HomeWk(db.Model):
    __tablename__ = 'homewks'

    id = db.Column(db.Integer, primary_key=True)
    course = db.Column(db.String(24), nullable=False)
    deadline = db.Column(db.DateTime, nullable=False)
    tch_email = db.Column(db.String(64), nullable=True)
    requirement = db.Column(db.UnicodeText, nullable=False)

    def __repr__(self):
        return '<homework {} {} {} {} >'.format(
            self.id, self.course, self.deadline, self.requirement)

    __str__ = __repr__