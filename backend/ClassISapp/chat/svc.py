from datetime import datetime

import simplejson
from flask import request
from flask_socketio import emit
from flask_socketio import join_room

from .. import websocket
from . import chat,config
from ..public.models import User
from ..public.utils import record_error

CHAT_ROOM = 'online_chat'


@websocket.on('connect', namespace='/chats/ws')
def join():
    try:
        join_room(CHAT_ROOM)
        emit('recvMsg', {'msgs': simplejson.dumps([])})
    except Exception as e:
        record_error(e)


@chat.route('', methods=['POST'])
def send_online_msg():
    try:
        user_msg = simplejson.loads(request.data)
        name = User.query.filter_by(sno=int(user_msg['sno'])).first().name
        now = datetime.now().strftime("%b %d %Y %H:%M:%S")
        msgs = simplejson.dumps([{'author':{'name':name,'sno':user_msg['sno']},
                                 'avatar': config['CHAT_HEAD_URL']+user_msg['sno']+'.png',
                                 'content': user_msg['msg'],
                                 'datetime': now}])
        emit('recvMsg', {'msgs': msgs}, room=CHAT_ROOM, namespace='/chats/ws')
        return ''
    except Exception as e:
        record_error(e)
        return ''

