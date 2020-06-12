import React from 'react';
import store from 'store';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import {
    Form,
    Input,
    Button,
    message,
    Row,
    Col,
    Radio,
    Layout,
    List,
    Card,
    Icon
} from 'antd';
import { inject } from '../service/utils';
import NoticeService from '../service/notices';
import 'antd/dist/antd.less'

const { Sider, Content } = Layout;
const { TextArea } = Input;
const { Meta } = Card;
const noticeService = new NoticeService();


export class Notice extends React.Component {
    render() {
        return (
            <Layout style={{padding: 32}}>
                <Recvall service={noticeService} />
                <Notify service={noticeService} />
            </Layout>
        );
    }
}


@inject({ noticeService })
@observer
class Recvall extends React.Component {
    constructor(props) {
        super(props);
        props.noticeService.recvall('?page=1&size=7');
    }

    handleChange(pageNo, pageSize) {
        let search = "?page=" + pageNo + "&size=" + pageSize;
        this.props.noticeService.recvall(search);
    }

    url(pg, size) {
        return '?page=' + pg + '&size=' + size;
    }
    
    itemRender(current, type, originalElement) {
        if (current == 0) {
            return originalElement;
        }

        if (type == 'page') {
            return <Link to={this.url(current,7)}>{current}</Link>;
        }

        if (type=='prev') {
            return <Link to={this.url(current,7)} className='ant-pagination-item-link'>&lt;</Link>;
        }

        if (type=='next') {
            return <Link to={this.url(current,7)} className='ant-pagination-item-link'>&gt;</Link>;
        }

        return originalElement;
    }

    render() {
        let data = this.props.noticeService.notifications;
        if (data.length) {
            const pagination = this.props.noticeService.pagination;
            return (
                <Content>
                    <Row ><Col span={18} offset={4} >
                        <List bordered={true} dataSource={data} renderItem={
                            item => (<List.Item>
                                        <List.Item.Meta
                                            title={<Link to={ '/notices/'+ item.notice_id }> {item.notifytime} {item.abs}</Link>}
                                        />
                                    </List.Item>)
                            } 
                            pagination={{
                                current:pagination.page,
                                pageSize:pagination.size,
                                total:pagination.amount,
                                onChange:this.handleChange.bind(this),
                                itemRender:this.itemRender.bind(this),
                            }}
                        />
                    </Col></Row>
                </Content>
            );
        } else{
            return (<Content></Content>)
        }
        
    }
}


@inject({ noticeService })
@observer
class Notify extends React.Component {
    constructor(props){
        super(props);
    }

    state = {
        value: 2,
        editorState: null
      };

    
    onChange = e => {
        this.setState({
          value: e.target.value,
        });
      };
    
    handleClick = (event) => {
        event.preventDefault();
        let fm = event.target;  //event.target本身就是form了，故不用再.form

        this.props.service.notify(fm[0].value, this.state.value, fm[4].value);
    };

    render() {
        if (this.props.service.nmsg) {
            message.info (
                this.props.service.nmsg,
                3,
                () => setTimeout(() => this.props.service.nmsg='',100),
            );
        }
        
        return (
            <Sider width={312} style={{ background: '#ffadd2' }}>
                <Row ><Col span={20} offset={2} >
                <Form layout="vertical" onSubmit={this.handleClick.bind(this)}>
                    <Form.Item label="通知概要" labelCol={{ span:8 }} wrapperCol={{ span:24 }}>
                        <Input placeholder="通知：" />
                    </Form.Item>

                    <Form.Item label="级别" labelCol={{ span:16 }} wrapperCol={{ span:24 }}>
                        <Radio.Group defaultValue="2" onChange={this.onChange} >
                            <Radio.Button value="1">紧急</Radio.Button>
                            <Radio.Button value="2">重要</Radio.Button>
                            <Radio.Button value="3">一般</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item label="通知内容" labelCol={{ span:8 }} wrapperCol={{ span:24 }}>

                        <TextArea rows={3} />
                    </Form.Item>

                    <Form.Item wrapperCol={{ span:14, offset:8 }}>
                        <Button type="primary"
                                htmlType="submit"
                                style={{background: "#eb2f96",borderColor:"#eb2f96"}}
                        >发布通知</Button>
                    </Form.Item>
                </Form>
                </Col></Row>
            </Sider>
        );
    }
}


@inject({ noticeService })
@observer
export class Recv extends React.Component {
    constructor(props) {
        super(props);// 匹配
        let { id = -1 } = props.match.params; // {id:'1'}
        props.noticeService.recv(id);
    }

    state = { edit: 0 };
    id = store.get('sno');

    handleClick = (event) => {
        event.preventDefault();
        let fm = event.target;

        this.props.noticeService.edit(
            this.props.match.params.id, fm[0].value, fm[3].value
        );
    };

    render() {
        const { edit } = this.state;
        let s = this.props.noticeService;
        let sn = s.notification;

        if (s.nmsg) {
            message.info(
                s.nmsg,
                3,
                ()=> setTimeout(() => s.nmsg='',500)
            );
        }

        let recvd = {
            notify_id:sn.notify_id,
            abs:sn.abs,
            notifier:sn.notifier,
            notifier_id:sn.notifier_id,
            notifytime:sn.notifytime,
            msg:sn.msg
        };  //注意：键不要加引号

        if (recvd.abs) {
            return (
                <Row gutter={[4, 4]}><Col span={16} offset={3} style={{padding: 32}}>
                <Form onSubmit={this.handleClick.bind(this)}>
                    <Card  title={
                                <div>
                                    <Icon   type="exclamation-circle"
                                            theme="twoTone"
                                            twoToneColor="#f5222d"
                                    />{edit ?   <Form.Item>
                                                    <Input defaultValue={recvd.abs}/>
                                                </Form.Item> : recvd.abs
                                        }
                                </div>
                            }
                           bordered={true}
                           style={{width: 800}}
                    >
                        <Meta description={
                            <div>
                                <Icon type="user"/>
                                {recvd.notifier}{" "}发布于{" "}
                                <Icon type="clock-circle" theme="twoTone" twoToneColor="#2f54eb"/>
                                {recvd.notifytime}
                                {"      "}{recvd.notifier_id == this.id?<div>
                                <Button onClick={()=>this.setState({edit: 1})}>{"修改"}</Button>
                                <Button onClick={() => this.setState({edit: 0})}>{"查看"}</Button>
                                </div>:<div></div>}
                            </div>}
                        />
                        <br/>
                        <Icon type="alert" theme="twoTone" twoToneColor="#1890ff"/>
                        {edit ? <Form.Item>
                            <TextArea rows={3} defaultValue={recvd.msg}/>
                        </Form.Item> : recvd.msg}

                        {edit ? <Form.Item wrapperCol={{span: 14, offset: 8}}>
                            <Button type="primary"
                                    htmlType="submit"
                                    style={{background: "#eb2f96", borderColor: "#eb2f96"}}
                            >修改通知</Button>
                        </Form.Item> : <div></div>}
                    </Card>
                </Form>
                </Col></Row>);
        }
        else {
            return <div></div>;
        }
    }
}


@inject({ noticeService })
@observer
export class Editlog extends React.Component {
    constructor(props) {
        super(props);
    }

    state = { editLogs:[] };

    audit = this.props.noticeService.audit.bind(this);

    render() {
        const {editLogs} = this.state;

        return <Content style={{ background: '#ffa39e', minHeight: 658, padding:32}}>
                    {editLogs.length?editLogs.map((item)=>
                                    <pre>
                                        {item.name}
                                        于{item.time}
                                        将<br />{'                 '}
                                        {'摘要：'}{item.oldAbs}{'--详细通知：'}{item.oldMsg}
                                        {'    '}修改为<br />{'                 '}
                                        {'摘要：'}{item.newAbs}{'--详细通知：'}{item.newMsg}
                                    </pre>):this.audit()}
                </Content>
    }
}
