from distutils.core import setup

import os, shutil

setup(
    name='ClassIS',
    version='0.9.0',
    description='Class Information Service',
    author='HuangXY',
    author_email='sre312@outlook.com',
    url='https://project.example.com',
    packages=['ClassISapp',
              'ClassISapp/homewk',
              'ClassISapp/notice',
              'ClassISapp/public',
              'ClassISapp/fee',
              'ClassISapp/textbook',
              'ClassISapp/file',
              'ClassISapp/note',
              'ClassISapp/chat'],
    data_files=['manage.py','config.py']
)

#python setup.py sdist --formats=gztar