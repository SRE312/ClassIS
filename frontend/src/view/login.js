import React from 'react';
import store from 'store';
import { Redirect, Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import { message } from 'antd';
import UserService from '../service/users';
import '../css/index.css';
import 'antd/dist/antd.less'

const userService = new UserService();


export default class Login extends React.Component {
    render(){
        return <_Login service={userService} />
    }
}


@observer
class _Login extends React.Component {
    handleClick(event) {
        event.preventDefault();
        let fm = event.target.form;

        this.props.service.login(
            fm[0].value, fm[1].value
        );
    }
    render() {
        if (this.props.service.ifloggedin) {
            if (store.get('ifloggedin')) {
                return <Redirect to='/home' />;
            }
        }

        if (this.props.service.errmsg) {
            message.info(
                this.props.service.errmsg+"，请检查学号或密码是否正确",
                3,
                () => setTimeout(() => this.props.service.errmsg='', 100),
            );
        }

        return  <div className="logreg-page">
                    <div className="form">
                        <form className="login-form">
                            <input type="text" placeholder="学号"/>
                            <input type="password" placeholder="密码"/>
                            <button onClick={this.handleClick.bind(this)}>登录</button>
                            <p className="message">还没注册? <Link to='/reg'>创建一个账号</Link></p>
                        </form>
                    </div>
                </div>;
    }
}
