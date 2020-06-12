import os

from flask import Flask
from flask_mail import Mail
from flask_moment import Moment
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_session import Session
from flask_redis import FlaskRedis
from flask_socketio import SocketIO
from flask_cors import CORS

from config import config


mail = Mail()
moment = Moment()
db = SQLAlchemy()
cache = FlaskRedis()
websocket = SocketIO(cors_allowed_origins='*')
login_manager = LoginManager()
login_manager.session_protection = 'basic'
login_manager.login_view = 'public.login'


def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    Session(app)

    mail.init_app(app)
    moment.init_app(app)
    db.init_app(app)
    cache.init_app(app)
    login_manager.init_app(app)
    CORS(app)
    websocket.init_app(app=app, async_mode=None)

    from ClassISapp.public import public as public_blueprint
    from ClassISapp.notice import notice as notice_blueprint
    from ClassISapp.homewk import homewk as homewk_blueprint
    from ClassISapp.fee import fee as fee_blueprint
    from ClassISapp.textbook import textbook as textbook_blueprint
    from ClassISapp.file import file as file_blueprint
    from ClassISapp.note import note as note_blueprint
    from ClassISapp.chat import chat as chat_blueprint
    app.register_blueprint(public_blueprint)
    app.register_blueprint(notice_blueprint, url_prefix='/notices')
    app.register_blueprint(homewk_blueprint, url_prefix='/homewks')
    app.register_blueprint(fee_blueprint, url_prefix='/fees')
    app.register_blueprint(textbook_blueprint, url_prefix='/textbooks')
    app.register_blueprint(file_blueprint, url_prefix='/files')
    app.register_blueprint(note_blueprint, url_prefix='/notes')
    app.register_blueprint(chat_blueprint, url_prefix='/chats')

    return app

app = create_app(os.getenv('FLASK_CONFIG') or 'default')
