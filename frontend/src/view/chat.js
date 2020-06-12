import React from 'react';
import store from 'store';
import { Socket, Event } from 'react-socket-io';
import {
    Input,
    message,
    Row,
    Col,
    Layout,
    Card,
    Comment,
} from 'antd';
import { inject } from '../service/utils';
import ChatService from '../service/chats';
import '../css/index.css';
import 'antd/dist/antd.less';

const { Content } = Layout;
const { Search } = Input;
const chatService = new ChatService();
const uri = 'ws://project.example.com/chats/ws';
const options = { transports: ['websocket'] };


export class Chat extends React.Component {
    render() {
        return <_Chat service={chatService}/>;
    }
}


@inject({ chatService })
export class _Chat extends React.Component  {
    constructor(props){
        super(props);
    }

    emit = this.props.chatService.emit.bind(this);

    state = { msgs: [], sendValue:'' };

    sendMsg = (inputText) => {
        if(inputText) {
            this.emit(inputText,store.get('sno'));
            this.setState({sendValue: null});
        }
    };

    unLoginInfo = () => { message.error('您未登录') };

    onMessage = (message) => {
        this.setState({
             msgs: this.state.msgs.concat( eval("("+message.msgs+")") )
            }
        )
    };

    render() {
        const { msgs } = this.state;
        let mySno = store.get('sno');

        return  <Content style={{ background: '#d3adf7', minHeight: "658px", padding: '30px'}}>
                <Row><Col span={8} offset={8}><Socket uri={uri} options={options}>
                    <Card style={{ width: 500 }}
                          actions={[<Search enterButton="发送消息"
                                            value={this.state.sendValue}
                                            onChange={(e) => this.setState({sendValue: e.target.value})}
                                            onSearch={value => {this.sendMsg(value)}}/>]}
                    >{msgs.length?<Card style={{ width: 460, height:380, overflow: "auto"}}>
                                      {msgs.map((msg)=>
                                            <Comment author={mySno!=msg.author.sno?msg.author.name:'我'}
                                                     avatar={msg.avatar}
                                                     content={msg.content}
                                                     datetime={msg.datetime}
                                            />)}
                                    </Card>:<div>{this.mySno?this.unLoginInfo():<div></div>}</div>}
                                    <Event event='recvMsg' handler={this.onMessage.bind(this)} />
                    </Card></Socket>
                </Col></Row>
                </Content>
    }
}
