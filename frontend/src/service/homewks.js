import axios from 'axios';
import store from 'store';
import {observable} from 'mobx';
import {message} from "antd";

store.addPlugin(require('store/plugins/expire'));


export default class HomewkService{
    constructor() { };

    @observable hmsg = '';
    @observable homeworks = [];
    @observable amount = 0;
    @observable role = '';
    @observable homework = {
        homework_id:0,
        ddl:'',
        requirement:''
    };

    config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    };

    getSession() {
        return store.get('session',null);
    }

    seeall() {
        axios.get('/apiforjs/homewks')
        .then(
            response => { 
               this.homeworks = response.data.homeworks;
               this.amount = response.data.amount;
               this.role = response.data.role;
            }
        )
        .catch(
            error => {
                this.hmsg = "貌似没有作业哦~~";
            }
        );
    }

    view(id) {
        axios.get('/apiforjs/homewks/'+id)
        .then(
            response => { 
               this.homework = response.data.homewk;
            }
        )
        .catch(
            error => {
                this.hmsg = "作业要求获取失败o(╥﹏╥)o";
            }
        )
    }

    inform(course, deadline, email, requirement) {
        axios.post(
            '/apiforjs/homewks',
            { course:course, deadline:deadline, email:email, requirement:requirement},
            { headers:{ 'session': this.getSession() } }
        )
        .then(
            response => {
                this.hmsg = "成功发布了作业通知";
                this.seeall();
            }
        )
        .catch(
            error => {
                this.hmsg = "作业发布失败";
            }
        )
    }

    uploadHomeWK(id, fd) {
        axios.post('/apiforjs/homewks/'+id, fd, this.config)
        .then(
            () => {
                this.setState({
                    fileList: [],
                    uploading: false,
                });
                    message.success('提交成功');
            }
        )
        .catch(
            () => {
                this.setState({
                    uploading: false
                });
                message.error('提交失败');
            }
        )
    }
}
