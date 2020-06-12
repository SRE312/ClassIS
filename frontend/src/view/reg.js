import React from 'react';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';
import { message } from 'antd';
import UserService from '../service/users';
import '../css/index.css';
import 'antd/dist/antd.less'

const userService = new UserService();


export default class Reg extends React.Component {
    render() {
        return <_Reg service={userService} />
    }
}


@observer
class _Reg extends React.Component {
    handleClick(event) {
        event.preventDefault();
        let fm = event.target.form;

        if (fm[4].value == fm[5].value) {
            this.props.service.reg(
                fm[0].value, fm[1].value,
                fm[2].value, fm[3].value,
                fm[4].value
            );
        }
        else {
            this.props.service.errmsg='密码不一致';
        }
    }

    render() {
        if (this.props.service.ifloggedin) {
            return <Redirect to='/' />;
        }

        if (this.props.service.errmsg) {
            message.info(
                this.props.service.errmsg+"，请检查输入的信息是否正确",
                3,
                () => setTimeout(() => this.props.service.errmsg='',100)
            );
        }

        return  <div className="logreg-page">
                    <div className="form">
                        <form className="login-form">
                            <input type="text" placeholder="学号"/>
                            <input type="text" placeholder="姓名"/>
                            <input type="text" placeholder="邮箱"/>
                            <input type="text" placeholder="职务"/>
                            <input type="password" placeholder="密码"/>
                            <input type="password" placeholder="确认密码"/>
                            <button onClick={this.handleClick.bind(this)}>注册</button>
                        </form>
                    </div>
                </div>;
    };
}
