import os
import hashlib
import http.client
from urllib3 import encode_multipart_formdata

import simplejson
from apscheduler.schedulers.blocking import BlockingScheduler


SYNC_DIR="D:\Desktop\syncdir\\"
DOMAIN = "project.example.com"
PORT = 443
URL = "/apiforpy/notes"
SYNC_TOKEN = "Example1234567890AbcdefuItKlsymH"
INTERVAL = 60 * 15

def synclisting(filepath,dirlist,filedict):
    """生成本地文件的同步清单

    :param filepath:
    :param dirlist: 待同步的目录列表
    :param filedict: 待同步的文件字典（{'路径':文件的md5})
    :return: None
    """
    dir_files = os.scandir(filepath)
    for entry in dir_files:
        if entry.is_dir():
            synclisting(entry,dirlist,filedict)
            dir_elem = entry.path.replace(SYNC_DIR,'/').replace('\\','/')
            dirlist.append(dir_elem)
        else:
            with open(entry.path, 'rb') as f:
                data = f.read()
            file_md5 = hashlib.md5(data).hexdigest()
            file_key = entry.path.replace(SYNC_DIR,'/').replace('\\','/')
            filedict[file_key] = file_md5

def send_listing(filepath,domain,port,url,token):
    """发送同步清单

    :param filepath: 本地同步路径
    :param domain: 远程地址
    :param port: 远程端口
    :param url: 同步服务api的url
    :param token: 认证令牌
    :return: 需要同步上传的文件列表need_sync
    """
    try:
        dir_list = []
        file_dict = dict()
        synclisting(filepath, dir_list, file_dict)

        body = simplejson.dumps({'dir_list': dir_list, 'file_dict': file_dict})

        browser = http.client.HTTPSConnection(domain,port)
        browser.request("POST", url,
                        body=body,
                        headers={'token':token},
                        encode_chunked=False)
        response = browser.getresponse()
        need_sync = simplejson.loads(response.read())['need_sync']
        browser.close()

        return need_sync
    except Exception as e:
        with open('E:/test/error.log','a') as f:
            f.write(str(e)+'\r\n')
        return None

def syncjob(filepath,domain,port,url,token):
    """同步作业

    :param filepath: 本地同步路径
    :param domain: 远程地址
    :param port: 远程端口
    :param url: 同步服务api的url
    :param token: 认证令牌
    :return: None
    """
    try:
        need_sync = send_listing(filepath,domain,port,url,token)
        if need_sync:
            for path in need_sync:
                remote_path = ''.join(path)
                file_localpath = remote_path.replace('/',SYNC_DIR,1)
                browser = http.client.HTTPSConnection(domain, port)

                with open(file_localpath,'rb') as f:
                    data = { 'file': (path, f.read()) }
                    encode_data = encode_multipart_formdata(data)
                    file_data = encode_data[0]
                    content_type = encode_data[1]

                    headers = {'token': token, 'Content-type': content_type}
                    browser.request("PUT", url,
                                    headers=headers,
                                    body=file_data,
                                    encode_chunked=False)
                    browser.close()
    except Exception as e:
        with open('E:/test/error.log','a') as f:
            f.write(str(e)+'\r\n')

if __name__ == "__main__":
    scheduler = BlockingScheduler()
    scheduler.add_job(syncjob, 'interval',
                      seconds=INTERVAL,
                      args=[SYNC_DIR, DOMAIN, PORT, URL, SYNC_TOKEN],
                      id='sync-job')
    scheduler.start()

