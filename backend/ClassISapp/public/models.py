import bcrypt

from flask_login import UserMixin

from .. import db
from .. import login_manager


class User(UserMixin, db.Model):
    __tablename__ = 'users'

    sno = db.Column(db.Integer, primary_key=True)  #max_length=10
    name = db.Column(db.String(20), nullable=False)
    role = db.Column(db.String(10), nullable=True)
    email = db.Column(db.String(64), unique=True, nullable=False)
    passwd = db.Column(db.String(128), nullable=False)

    notices = db.relationship('Notice', backref='user')

    @property
    def id(self):
        return self.sno

    @property
    def password(self):
        raise AttributeError('password is an unreadable attribute')

    @password.setter
    def password(self, password):
        self.passwd = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    def verify_password(self, password):
        return bcrypt.checkpw(password.encode(), self.passwd.encode())

    def __repr__(self):
        return '<user {} {} {} {}>'.format(self.sno, self.name, self.role, self.email)

    __str__=__repr__

@login_manager.user_loader
def load_user(sno):
    return User.query.get(int(sno))

