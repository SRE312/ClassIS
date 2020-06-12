import os
from datetime import datetime

def rm(path):
    if os.path.isfile(path):
        os.remove(path)
    elif os.path.isdir(path):
        for children in os.listdir(path):
            child_path = os.path.join(path, children)
            rm(child_path)
        os.rmdir(path)


def record_error(error):
    with open('/tmp/error.log', 'a') as f:
        f.write(datetime.now().strftime('%Y-%m-%d %H:%M:%S - ')+str(error) + '\r\n')