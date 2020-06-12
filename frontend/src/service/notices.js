import axios from 'axios';
import store from 'store';
import { observable } from 'mobx';
import { message } from "antd";

store.addPlugin(require('store/plugins/expire'));


export default class NoticeService {
    @observable nmsg = '';
    @observable notifications = [];
    @observable logs = [];
    @observable pagination = { page:1, size:3, pages:0, amount:0 };
    @observable notification= {
        notify_id:0,
        abs:"t0",
        notifier:"u0",
        notifier_id:0,
        notifytime:1584437026.071648,
        msg: "0"
    };

    getSession() {
        return store.get('session',null);
    }

    recvall(search) {
        axios.get('/apiforjs/notices'+search)
        .then(
            response => { 
               this.notifications = response.data.notifications;
               this.pagination = response.data.pagination;
            }
        )
        .catch(
            error => {
                this.nmsg = "通知被外星人劫持了";
            }
        );
    }

    recv(id) {
        axios.get('/apiforjs/notices/'+id)
        .then(
            response => { 
               this.notification = response.data.notice;
            }
        )
        .catch(
            error => {
                this.nmsg = "通知被外星人劫持了";
            }
        );
    }

    notify(abs, lvl, msg) {
        axios.post(
            '/apiforjs/notices',
            { abs:abs, lvl:parseInt(lvl), msg:msg },
            { headers:{ 'session': this.getSession() } }
        )
        .then(
            response => {
                this.nmsg = "发布通知成功";
                this.recvall('?page=1&size=5');
            }
        )
        .catch(
            error => {
                this.nmsg = "外星人干扰了通知的发布";
            }
        )
    }

    edit(id, abs, msg) {
        axios.put(
            '/apiforjs/notices/'+id,
            { abs:abs, msg:msg},
            { headers:{ 'session': this.getSession() } }
        )
        .then(
            response => {
                message.success('修改成功',1);
                this.notification = response.data.notice;
            }
        )
        .catch(
            error => {
                message.error('修改失败',1);
            }
        )
    }

    audit() {
        axios.get('/apiforjs/notices/log')
            .then(
                response => {
                    this.setState({editLogs:response.data.logs});
                }
            )
            .catch(
                error => {
                    message.error("获取不到修改日志");
                }
            );
    }
}
