import React from "react";
import axios from 'axios';
import store from 'store';
import { observable } from 'mobx';
import { message } from "antd";


export default class FileService extends React.Component {
    constructor(props) {
        super(props);
        this.instance = axios.create({});
    }

    @observable suffixList = [];
    id = store.get('sno');
    config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    };

    fileTree(sortord,order) {
        axios.get('/apiforjs/files',{headers:{'Sortord':sortord,'Order':order}})
        .then(
            response => {
                this.setState({trees:response.data.trees});
            }
        )
        .catch(
            error => {
                message.error('共享文件获取失败 ~_~',1)
            }
        );
    }

    myFile() {
        axios.get('/apiforjs/files/'+this.id,{ headers:{'session': store.get('session',null)} })
        .then(
            response => {
                this.setState({trees:response.data.myFileTree});
            }
        )
        .catch(
            error => {
                message.error('我的文件获取失败 ~_~ (您是否已经登录？）',1)
            }
        );
    }

    getSuffix() {
        axios.get('/apiforjs/files/suffix')
        .then(
            response => {
                this.suffixList = response.data.suffixList;
            }
        )
        .catch(
            error => {
                message.error('获取后缀名失败',1)
            }
        );
    }

    search(name,suffix,uploadTime) {
        axios.post('/apiforjs/files',
            {name:name,suffix:suffix,uploadTime:uploadTime})
        .then(
            response => {
                this.setState({trees:response.data.searchTree});
            }
        )
        .catch(
            error => {
                message.error('查找不到',1)
            }
        );
    }

    mkdir(fd) {
        axios.post('/apiforjs/files/'+this.id, fd,
            { headers:{'session': store.get('session',null),'Content-Type': 'multipart/form-data'}})
        .then(
            response => {
                this.setState({trees:response.data.myFileTree});
            }
        )
        .catch(
            error => {
                message.error('新建目录失败',1)
            }
        );
    }

    addFile(fd) {
        axios.post('/apiforjs/files/'+this.id, fd, this.config)
        .then(
            response =>{
                this.setState({trees:response.data.myFileTree});
            }
        )
        .catch(
            (error) => {
                message.error('文件上传失败',1)
            }
        );
    }

    rmFile(fd) {
        axios.post('/apiforjs/files/'+this.id, fd,
            { headers:{'session': store.get('session',null),'Content-Type': 'multipart/form-data'}})
        .then(
            response =>{
                this.setState({trees:response.data.myFileTree});
            }
        )
        .catch(
            (error) => {
                message.error('文件删除失败',1)
            }
        );
    }
}
