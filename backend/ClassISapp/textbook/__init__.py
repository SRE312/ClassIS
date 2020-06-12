import os

from flask import Blueprint

textbook = Blueprint('textbook', __name__)
config = {'CLASS_NAME': os.getenv('CLASS_NAME'),
          'DB_HOST': os.getenv('DB_HOST'),
          'DB_USER': os.getenv('DB_USER'),
          'DB_PASSWORD': os.getenv('DB_PASSWORD'),
          'DB_NAME': os.getenv('DB_NAME'),
          'DB_PORT': int(os.getenv('DB_PORT')),
          'BK_PATH': os.getenv('BK_PATH')}

from . import svc