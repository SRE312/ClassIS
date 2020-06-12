import os

from flask import Blueprint

note = Blueprint('note', __name__)
config = {'NOTE_PATH': os.getenv('NOTE_PATH'),
          'PATH_PREFIX':os.getenv('PATH_PREFIX'),
          'SYNC_TOKEN':os.getenv('SYNC_TOKEN')}

from . import svc