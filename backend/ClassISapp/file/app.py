import os
from . import config
from datetime import datetime

TIME_FORMAT="%Y-%m-%d %H:%M:%S"
PATH_PREFIX=config['PATH_PREFIX']


def change_pathprefix(gen_filelist,order):
    new_filelist = []
    for item in gen_filelist:
        if 'children' in item:
            new_filelist.extend(item['children'])
    #new_filelist.sort(key=lambda elem: (True, elem['title']) if 'children' in elem else (False, elem['title']) ,reverse=False)
    new_filelist.sort(key=lambda elem: elem['title'], reverse=order)
    new_filelist.sort(key=lambda elem: True if 'children' in elem else False, reverse=True)
    return {'key': '/file', 'title': 'file', 'children':new_filelist}

def gen_filetree(filepath, gen_filelist, order):
    files = os.scandir(filepath)
    for entry in files:
        if entry.is_dir():
            child_list = []
            gen_filetree(entry.path, child_list, order)
            gen_filelist.append({'key': entry.path.replace(PATH_PREFIX,''), 'title': entry.name, 'children': child_list, 'isLeaf': 0})
        else:
            gen_filelist.append({'key': entry.path.replace(PATH_PREFIX,''), 'title': entry.name, 'isLeaf': 1})
        # filelist.sort(key=lambda elem: (True, elem['title']) if 'children' in elem else (False, elem['title']), reverse=False)
        gen_filelist.sort(key=lambda elem: elem['title'], reverse=order)
        gen_filelist.sort(key=lambda elem: True if 'children' in elem else False, reverse=True)

def gen_filetree_by_path(filepath, filelist:list, order):
    gen_filelist = []
    gen_filetree(filepath, gen_filelist, order)
    filelist.append(change_pathprefix(gen_filelist, order))


def gen_filetree_by_name(filepath, filelist:list, order):
    files = os.scandir(filepath)
    for entry in files:
        if entry.is_dir():
            gen_filetree_by_name(entry.path, filelist, order)
        else:
            filelist.append({'key':entry.path.replace(PATH_PREFIX,''), 'title':entry.name, 'isLeaf': 1})
    filelist.sort(key=lambda elem: elem['title'], reverse=order)

def gen_filetree_by_suffix(filepath, filelist:list, order, suffix_set):
    new_filelist = []
    def gen_suffix_filetree(filepath,suffix_set):
        files = os.scandir(filepath)
        for entry in files:
            if entry.is_dir():
                gen_suffix_filetree(entry.path, suffix_set)
            else:
                new_filelist.append({'key': entry.path.replace(PATH_PREFIX,''), 'title': entry.name, 'isLeaf': 1})
                suffix_set.add(entry.name.split('.')[-1])
    gen_suffix_filetree(filepath, suffix_set)
    for suffix in suffix_set:
        child_list = []
        for leaf in new_filelist:
            if leaf['title'].split('.')[-1] == suffix:
                child_list.append(leaf)
        child_list.sort(key=lambda elem: elem['title'], reverse=order)
        filelist.append({'key': suffix, 'title': suffix, 'children': child_list, 'isLeaf': 0})
    filelist.sort(key=lambda elem: elem['title'], reverse=order)

def gen_filetree_by_modify(filepath, filelist:list, order):
    files = os.scandir(filepath)
    for entry in files:
        if entry.is_dir():
            gen_filetree_by_modify(entry.path, filelist, order)
        else:
            filelist.append({'key': entry.path.replace(PATH_PREFIX,''),
                             'title': datetime.utcfromtimestamp(entry.stat().st_mtime).strftime(TIME_FORMAT)+'  '+
                                      entry.name,
                             'isLeaf': 1, 'modifyTime': entry.stat().st_mtime})
    filelist.sort(key=lambda elem: elem['modifyTime'], reverse=order)

def gen_filetree_by_upload(filepath, filelist:list, order):
    files = os.scandir(filepath)
    for entry in files:
        if entry.is_dir():
            gen_filetree_by_upload(entry.path, filelist, order)
        else:
            filelist.append({'key': entry.path.replace(PATH_PREFIX,''),
                             'title': datetime.utcfromtimestamp(entry.stat().st_atime).strftime(TIME_FORMAT)+'  '+
                                      entry.name,
                             'isLeaf': 1, 'uploadTime': entry.stat().st_atime})
    filelist.sort(key=lambda elem: elem['uploadTime'], reverse=order)

def gen_suffixset(filepath,suffix_set):
    files = os.scandir(filepath)
    for entry in files:
        if entry.is_dir():
            gen_suffixset(entry.path, suffix_set)
        else:
            suffix_set.add(entry.name.split('.')[-1])

def filter_suffix(filepath,suffix,suffixlist):
    files = os.scandir(filepath)
    for entry in files:
        if entry.is_dir():
            filter_suffix(entry.path, suffix, suffixlist)
        else:
            if entry.name.split('.')[-1] in suffix:
                suffixlist.append({'key': entry.path.replace(PATH_PREFIX,''),
                                 'title': entry.name,
                                 'isLeaf': 1, 'uploadTime': entry.stat().st_atime})
def no_filter(filepath,suffixlist):
    files = os.scandir(filepath)
    for entry in files:
        if entry.is_dir():
            no_filter(entry.path, suffixlist)
        else:
            suffixlist.append({'key': entry.path.replace(PATH_PREFIX,''),
                             'title': entry.name,
                             'isLeaf': 1, 'uploadTime': entry.stat().st_atime})

def search_app(filepath, name, suffix, uploadTime, filelist):
    format = "%Y-%m-%dT%H:%M:%S"
    start_time = datetime.strptime(uploadTime[0][0:19],format).timestamp() if uploadTime[0] != '' else 0
    end_time = datetime.strptime(uploadTime[1][0:19],format).timestamp() if uploadTime[1] != '' else 9999999999
    filter_by_suffix_list = []
    filter_by_time_list = []

    if not suffix:
        no_filter(filepath, filter_by_suffix_list)
    else:
        filter_suffix(filepath, suffix, filter_by_suffix_list)

    if uploadTime[0] or uploadTime[1]:
        for item in filter_by_suffix_list:
            if item['uploadTime'] > start_time and item['uploadTime'] < end_time:
                filter_by_time_list.append(item)
    else:
        filter_by_time_list.extend(filter_by_suffix_list)

    if name:
        for item in filter_by_time_list:
            if item['title'].find(name) != -1:
                filelist.append(item)
    else:
        filelist.extend(filter_by_time_list)
