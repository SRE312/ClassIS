import React from "react";
import axios from 'axios';
import store from 'store';
import { observable } from 'mobx';
import { message } from "antd";

store.addPlugin(require('store/plugins/expire'));


export default class TextbookService extends React.Component {
    constructor(props) {
        super(props);
        this.instance = axios.create({});
    }

    @observable books = [];
    @observable statshead = [];
    @observable statsinfos = [];

    getSession() {
        return store.get('session',null);
    }

    info() {
        this.instance.get('/apiforjs/textbooks')
            .then(
                response => {
                   this.books = response.data.textbooks;
                }
            )
            .catch(
                error => {
                    message.destroy();
                    message.error("~_~");
                }
            )
    }

    reg(bk) {
        axios.post(
            '/apiforjs/textbooks',{'bk':bk},
            { headers:{'session': this.getSession()} })
            .then(
            response => {
                message.success("教材预订登记成功");
            }
            )
            .catch(
                error => message.error("教材预订登记失败o(╥﹏╥)o")
            );
    }

    stats() {
        this.instance.get('/apiforjs/textbooks/stats')
            .then(
                response => {
                    this.statshead = response.data.statshead;
                    this.statsinfos = response.data.statsinfos;
                }
            )
            .catch(
                error => {
                    message.error("获取不到统计结果");
                }
            );
    }
}
