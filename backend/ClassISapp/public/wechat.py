import json
import requests

from . import config

corpid=config['CORPID']
appsecret=config['SECRET']
agentid=config['AGENTID']


def send_wechat(to_user, message):
    """发送微信通知

    :param to_user: 通知接收者
    :param message: 通知
    :return:
    """

    # 获取访问令牌
    token_url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=' + corpid + '&corpsecret=' + appsecret
    req = requests.get(token_url)
    access_token = req.json()['access_token']

    msg_send_url = 'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=' + access_token

    params = {
        "touser": to_user,
        "msgtype": "text",
        "agentid": agentid,
        "text": {
            "content": message
        },
        "safe": 0
    }
    req=requests.post(msg_send_url, data=json.dumps(params))
    return req

