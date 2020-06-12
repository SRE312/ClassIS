import os

from flask import Blueprint

fee = Blueprint('fee', __name__)
config = {'FEE_PATH': os.getenv('FEE_PATH')}

from . import svc