import os

from redis import Redis

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    #DEBUG = True
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    SQLALCHEMY_COMMIT_TEARDOWN = True

    SECRET_KEY = os.getenv('SECRET_KEY')

    SESSION_TYPE = 'redis'
    SESSION_REDIS = Redis(
        host=os.getenv('REDIS_IP'),
        port=os.getenv('REDIS_PORT'),
        db=0
    )
    SESSION_USE_SIGNER = True
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = 3600*8

    REDIS_URL = os.getenv('REDIS_URL')

    MAIL_SERVER = 'smtp.example.com'
    MAIL_PORT = 465
    MAIL_USE_TLS = False
    MAIL_USE_SSL = True
    MAIL_USERNAME = os.getenv('MAIL_ACCOUNT')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')

    @staticmethod
    def init_app(app):
        pass


class DevConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv('DEV_DATABASE_URL')

class ProdConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv('PROD_DATABASE_URL')

config = {
    'dev': DevConfig,
    'prod': ProdConfig,
    'default': DevConfig
}