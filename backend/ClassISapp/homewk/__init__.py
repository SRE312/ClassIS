import os

from flask import Blueprint

homewk = Blueprint('homewk', __name__)
config = {'HOMEWK_PATH': os.getenv('HOMEWK_PATH'),
          'CLASS_NAME': os.getenv('CLASS_NAME')}

from . import svc