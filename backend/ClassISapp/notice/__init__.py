from flask import Blueprint

notice = Blueprint('notice', __name__)

from . import svc