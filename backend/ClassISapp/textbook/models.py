from .. import db


class Textbook(db.Model):
    __tablename__ = 'textbooks'

    bookname = db.Column(db.Text)
    ibsn = db.Column(db.String(20), nullable=False, primary_key=True)
    press = db.Column(db.Text, nullable=False)
    edition = db.Column(db.Text, nullable=False)
    chiefeditor = db.Column(db.Text, nullable=False)
    course = db.Column(db.Text, nullable=False)
