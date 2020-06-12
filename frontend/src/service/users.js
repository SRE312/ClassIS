import React from 'react';
import axios from 'axios';
import store from 'store';
import {observable} from 'mobx';

store.addPlugin(require('store/plugins/expire'));


export default class UserService {
    @observable ifloggedin = false;
    @observable errmsg = '';

    login (sno, password) {
        axios.post('/apiforjs/login', {
            sno:parseInt(sno),
            password:password
        })
        .then(
            response => {
                store.set('ifloggedin', true, (new Date()).getTime()+(2*3600*1000));
                store.set('role', response.data.user['role'], (new Date()).getTime()+(2*3600*1000));
                store.set('sno', response.data.user['sno'].toString(), (new Date()).getTime()+(2*3600*1000));
                this.ifloggedin = true;
            }
        )
        .catch(
            error => {
                this.errmsg = '登录错误';
            }
        )
    }

    reg (sno, name, email, role, password) {
        axios.post('/apiforjs/reg', {
            sno:parseInt(sno),
            name:name,
            email:email,
            role:role,
            password:password
        })
        .then(
            response => {
                store.set('token', response.data.token, (new Date()).getTime()+(24*3600*1000));
                this.ifloggedin = true;
            }
        )
        .catch(
            error => {
                this.errmsg = '注册失败';
            }
        );
    }
}
