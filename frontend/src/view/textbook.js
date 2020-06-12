import React from 'react';
import axios from 'axios';
import store from 'store';
import { observer } from 'mobx-react';
import {
    Form,
    Tabs,
    Input,
    Button,
    Collapse,
    message,
    Layout,
    Upload,
    Card,
    Popconfirm,
    Carousel,
    Checkbox,
} from 'antd';
import { inject } from '../service/utils';
import TextbookService from '../service/textbooks';
import '../css/index.css';
import 'antd/dist/antd.less'

const { Content } = Layout;
const textbookService = new TextbookService();


@inject({ textbookService })
@observer
export class Rst extends React.Component {
    render() {
        return  <Content style={{ background: '#b7eb8f', minHeight: 658, padding:32}}>
                {store.get('role') == '生活委员'? <Popconfirm
                    placement="bottom"
                    title="确定要重置教材订购的任务吗?"
                    okText="是" cancelText="否"
                    disabled={false}
                    onConfirm={()=>{axios.get('/apiforjs/textbooks/rst');
                    message.success('重置任务已提交至服务端');
                    this.props.textbookService.stats();
                    this.props.textbookService.info()}}>
                    <Button type="danger"  shape="round">重置任务</Button>
                    </Popconfirm>:<Popconfirm
                        placement="bottom"
                        title="查看原因？"
                        okText="是" cancelText="否"
                        onConfirm={()=>{message.error('负责教材管理的班委才能发起重置任务');}}>
                    <Button style={{background: "#fff",
                                        padding: "20px 30px 80px 30px",
                                        display: "inline-block",
                                        textAlign: "center",
                                        fontSize: "40px",
                                        color: "red",
                                        borderRadius: "24px"}}
                                disabled={true}
                        >重置任务
                    </Button></Popconfirm>}
                </Content>
    }
}


export class Textbook extends React.Component {
    render() {
        return <_Textbook service={textbookService} />;
    }
}


@inject({ textbookService })
@observer
class _Textbook extends React.Component {
    constructor(props) {
        super(props);
        props.textbookService.info();
    }

    onSubmit = (event) => {
        event.preventDefault();
        let fm = event.target;
        let list = [];
        for (let i=0;i<6;i++){
            if(fm[i]['checked']){
                list.push(fm[i]['value'])
            }
        }
        this.props.textbookService.reg(list);
        message.info("您需支付: "+list.length*5+" 元的订金");
    };

    render() {
        let booksData = this.props.textbookService.books;

        return (<Content style={{ background: '#b7eb8f', minHeight: 658, padding:32}}>
            <Carousel effect="fade" ref={pg => {this.slider = pg}}>
                <div><br /><br /><br /><br /><br />
                    <Button style={{background: "#92d14f",
                                    padding: "20px 30px 80px 30px",
                                    display: "inline-block",
                                    textAlign: "center",
                                    fontSize: "40px",
                                    color: "#fff",
                                    borderRadius: "24px"}}
                            onClick={()=>{this.slider.slick.slickGoTo(1);}}
                    >查看教材信息
                    </Button><br /><br /><br /><br /><br /><br />
                    <Button style={{background: "#ffc000",
                                    padding: "20px 70px 80px 70px",
                                    display: "inline-block",
                                    textAlign: "center",
                                    fontSize: "40px",
                                    color: "#fff",
                                    borderRadius: "24px"}}
                            onClick={()=>{this.slider.slick.slickGoTo(2);}}
                    >教材登记
                    </Button><br /><br /><br /><br /><br /><br /><br /><br />
                </div>
                <div>
                    <table border="1" align="center" >
                        <tr>
                            <th>教材名称</th>
                            <th>ISBN号</th>
                            <th>出版社</th>
                            <th>版次</th>
                            <th>主编</th>
                            <th>课程名称</th>
                        </tr>{booksData.map((item)=>(
                        <tr>
                            <td>{item.bkname}</td>
                            <td>{item.ibsn}</td>
                            <td>{item.press}</td>
                            <td>{item.edition}</td>
                            <td>{item.chiefeditor}</td>
                            <td>{item.course}</td>
                        </tr>))}
                        </table>
                </div>

                <div ><Form onSubmit={this.onSubmit.bind(this)}>
                    <Form.Item >
                        <table style={{textAlign:"left", margin: "auto", border: 5}}>{booksData.map((item)=>(
                        <tr><Checkbox value={item.bkname} style={{fontSize: "22px"}}>{item.bkname}</Checkbox></tr> ))}
                        </table></Form.Item>

                    <Form.Item>
                        <Button style={{background: "#52c41a",
                                    padding: "12.5px 43.75px 50px 43.75px",
                                    display: "inline-block",
                                    textAlign: "center",
                                    fontSize: "25px",
                                    color: "#fff",
                                    borderRadius: "14px"}}
                                htmlType="submit"

                        >提交
                        </Button>
                    </Form.Item></Form>
                </div>
            </Carousel></Content>
        )
    }
}


@inject({ textbookService })
@observer
export class Stats extends React.Component {
    constructor(props) {
        super(props);
        props.textbookService.stats();
    }

    render() {
        let tbHead = this.props.textbookService.statshead;
        let statsData = this.props.textbookService.statsinfos;

        return  <Content style={{ background: '#b7eb8f', minHeight: 658, padding:32}}>
                    <table border="1" align="center" style={{textAlign:"center"}}>
                        <tr>{tbHead.map((item)=>(
                                <th>{item}</th>)
                        )}
                        </tr>{statsData.map((item)=>(
                            <tr>{item.map((t)=>(<td>{t}</td>))}
                            </tr>))}
                    </table>
                </Content>
    }
}
