import os

from flask import Blueprint

file = Blueprint('file', __name__)
config = {'FILE_PATH': os.getenv('FILE_PATH'),
          'PATH_PREFIX':os.getenv('PATH_PREFIX')}

from . import svc