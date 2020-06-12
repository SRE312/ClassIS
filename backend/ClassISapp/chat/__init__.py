import os

from flask import Blueprint

chat = Blueprint('chats', __name__)
config = {'CHAT_HEAD_URL': os.getenv('CHAT_HEAD_URL')}

from . import svc