import os

from flask import Blueprint

public = Blueprint('public', __name__)
config = {'CORPID': os.getenv('WECHAT_CORPORATION_ID'),
          'AGENTID': os.getenv('WECHAT_AGENTID'),
          'SECRET': os.getenv('WECHAT_SECRET')}

from . import user
