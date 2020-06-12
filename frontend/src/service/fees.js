import React from "react";
import axios from 'axios';
import store from 'store';
import { observable } from 'mobx';
import { message } from "antd";


export default class FeeService extends React.Component {
    constructor(props) {
        super(props);
        this.instance = axios.create({ });
    }

    @observable fmsg = '';
    @observable bills = [];
    @observable surplus = 0;
    @observable amount = 0;
    @observable auditings = [];
    @observable auditeds = [];
    @observable auditfails = [];

    config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    };

    getSession() {
        return store.get('session',null);
    }

    bill() {
        this.instance.get('/apiforjs/fees')
        .then(
            response => {
                this.amount = response.data.amount;
                this.bills = response.data.bills;
                this.surplus = response.data.surplus;
            }
        )
        .catch(
            error => {
                this.fmsg = "~_~";
            }
        );
    }

    /**
     * 提交报销材料
     * @function reimburse
     * @param {formData} fd - 报销信息表单数据
     */
    reimburse(fd) {
        axios.post('/apiforjs/fees', fd, this.config)
        .then(
            response =>{
                message.success('报销申请已提交，请留意后续审核结果');
                this.auditmsg();
            }
        )
        .catch(
            () => {
                message.error('提交失败');
            }
        );
    }

    /**
     * 收入记录
     * @function add
     * @param {formData} fd - 收入信息
     */
    add(fd) {
        axios.post('/apiforjs/fees', fd, this.config)
        .then(
            response =>{
                message.success('收入记录已提交');
                this.bill();
                this.auditmsg();
            }
        )
        .catch(
            (error) => {
                message.error('提交失败'+error);
            }
        );
    }


    /**
     * 获取审核信息
     * @function auditmsg
     */
    auditmsg() {
        this.instance.get('/apiforjs/fees/audit')
            .then(
                response => {
                    this.auditings = response.data.auditings;
                    this.auditeds = response.data.auditeds;
                    this.auditfails = response.data.auditfails;
                }
            )
            .catch(
                error => {
                    this.fmsg = "~_~";
                }
            )
    }

    audit(id,action) {
        if (store.get('role') == '生活委员') {
            this.instance.post('/apiforjs/fees/audit',{ id:id,action:action })
                .then(
                    response => {
                        message.info("已将审核结果提交至服务器");
                        this.auditmsg();
                        this.bill();
                    }
                )
                .catch(
                    error => {
                        this.fmsg = "~_~";
                    }
                );
        }
        else {
            message.error('您不具有审核权限');
        }
    }
}
