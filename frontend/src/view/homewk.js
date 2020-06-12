import React from 'react';
import store from 'store';
import moment from 'moment';
import { Link } from 'react-router-dom';
import {
    Form,
    DatePicker,
    TimePicker,
    Input,
    Button,
    message,
    Row,
    Col,
    Layout,
    Upload,
    Icon,
    Card,
    Select
} from 'antd';
import { observer } from 'mobx-react';
import { inject } from '../service/utils';
import HomewkService from '../service/homewks';
import 'antd/dist/antd.less'

const { Content } = Layout;
const { TextArea } = Input;
const { Meta } = Card;
const { Dragger } = Upload;
const { Option } = Select;
const format = 'HH:mm';
const homewkService = new HomewkService();


@observer
export class Homewk extends React.Component {
    render() {
        if ( store.get('role') != '学习委员') {
            return <Seeall service={homewkService}/>;
        }
        else{
            return <div><br /><Inform service={homewkService}/><Seeall service={homewkService}/></div>;
        }
    }
}


@inject({ homewkService })
@observer
class Seeall extends React.Component  {
    constructor(props) {
        super(props);
        props.homewkService.seeall();
    }
  
    render() {
        let data = this.props.homewkService.homeworks;
        if (data.length) {
            const amount = this.props.homewkService.amount;

            return (
                <Content style={{ background: '#fff7e6', minHeight: "658px"}}>
                    <div style={{ padding: '30px' }}>
                        <Row gutter={60}>{data.map((item)=>(
                            <Col span={7} >
                                <Card title= {"截止时间："+item.ddl}>
                                    <p>{<Link to={ '/homewks/'+ item.homework_id } >{item.course} </Link>} </p>
                                </Card>
                            </Col>))}
                        </Row>
                    </div>
                </Content>
            );
        }
        else {
            return (<Content></Content>);
        }
    }
}


@inject({ homewkService })
@observer
class Inform extends React.Component {
    constructor(props){
        super(props);
    }

    state = {
        value: 2,
      };

    emailSuffix = '';

    onChange = e => {
        this.setState({
          value: e.target.value,
        });
      };

    selectAfter = (
      <Select defaultValue="@ " style={{ width: 135 }} onChange={(value) => this.emailSuffix=value}>
        <Option value="@139.com">@139.com</Option>
        <Option value="@163.com">@163.com</Option>
        <Option value="@foxmail.com">@foxmail.com</Option>
        <Option value="@qq.com">@qq.com</Option>
      </Select>
    );

    handleClick(event) {
        event.preventDefault();
        let fm = event.target;

        if (fm[3].value == '') {
            this.props.homewkService.inform(
                fm[0].value, fm[1].value+' '+fm[2].value+':00','', fm[4].value
            );
        }
        else {
            this.props.homewkService.inform(
                fm[0].value, fm[1].value+' '+fm[2].value+':00',fm[3].value+this.emailSuffix, fm[4].value
            );
        }
    }

    render() {
        if (this.props.homewkService.hmsg) {
            message.info(
                this.props.service.hmsg,
                3,
            () => setTimeout(() => this.props.homewkService.hmsg='',100)
            );
        }
        
        return (
            <Row ><Col span={8} offset={8} >
                <Form layout="vertical" onSubmit={this.handleClick.bind(this)}>
                    <Form.Item label="课程" labelCol={{ span:3 }} wrapperCol={{ span:20 }}>
                        <Input  />
                    </Form.Item>

                    <Form.Item label="截止时间" labelCol={{ span:3 }} wrapperCol={{ span:20 }}>
                        <DatePicker  />
                        <TimePicker defaultValue={moment('12:00', format)} format={format} />
                    </Form.Item>


                    <Form.Item label="教师邮箱" labelCol={{ span:3 }} wrapperCol={{ span:20 }}>
                        <Input addonAfter={this.selectAfter}  />
                    </Form.Item>

                    <Form.Item label="作业要求" labelCol={{ span:3 }} wrapperCol={{ span:20 }}>
                        <TextArea rows={3} />
                    </Form.Item>

                    <Form.Item wrapperCol={{ span:12, offset:9 }}>
                        <Button type="primary" htmlType="submit">发布作业通知</Button>
                    </Form.Item>
                </Form>
            </Col></Row>
        );
    }
}


@inject({ homewkService })
@observer
export class View extends React.Component {
    constructor(props) {
        super(props);
        let { id = -1 } = props.match.params;
        props.homewkService.view(id);
    }

    state = {
        fileList: [],
        uploading: false
    };

    uploadHomeWK = this.props.homewkService.uploadHomeWK.bind(this);

    onRemove = file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
     };

    beforeUpload = file => {
        this.setState(state => ({
          fileList: [...state.fileList, file],
        }));
        return false;
    }

    onChange = info => {
        const { status } = info.file;
        if (status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (status === 'done') {
            message.success(`${info.file.name} 作业提交成功`);
        } else if (status === 'error') {
            message.error(`${info.file.name} 作业提交失败`);
        }
    }

    startUpload = (event) => {
        event.preventDefault();
        let {id} = this.props.match.params;
        const {fileList} = this.state;
        const fd = new FormData();
        fileList.forEach(file => {
            fd.append("file", file['file']);
        });

        this.setState({
            uploading: true
        });

        this.uploadHomeWK(id,fd);
    };

    render() {
        let s = this.props.homewkService;
        let sn = s.homework;

        if (s.hmsg) {
            message.info(s.hmsg, 3, ()=> setTimeout(() => s.hmsg='',1000));
        }

        let homewkinfo = {
            course:sn.course,
            ddl:sn.deadline,
            requirement:sn.requirement,
        };

        if (homewkinfo.course){
            return (
                <Content style={{ background: '#fff7e6', minHeight: "658px", padding: '30px'}}>
                <Row gutter={[5, 5]} ><Col span={5} offset={7} >
                    <Card title={homewkinfo.course} bordered={true} style={{ width: 600 }} >
                    <Icon type="clock-circle" theme="twoTone" /><Meta description={"截止日期："+homewkinfo.ddl} />
                    <br />
                    <p><Icon type="schedule" theme="twoTone" /> {homewkinfo.requirement}</p>
                    <Form onSubmit={this.startUpload.bind(this)} >
                        <Form.Item >
                            <Dragger
                                name='hwkfile'
                                //multiple={true}
                                onRemove={this.onRemove}
                                customRequest={this.beforeUpload}
                                onChange={this.onChange}
                                withCredentials={true}
                            >
                                <p className="ant-upload-drag-icon"><Icon type="inbox" /></p>
                                <p className="ant-upload-text">可以将文件拖入到此区域</p>
                                <p className="ant-upload-hint">作业已完成？那就提交作业吧</p>
                                <Icon type="upload" />
                            </Dragger>
                        </Form.Item>
                        <Form.Item >
                            <Button
                              type="primary"
                              //onClick={this.startUpload}
                              disabled={this.state.fileList.length === 0}
                              loading={this.state.uploading}
                              style={{ marginTop: 16 }}
                              htmlType="submit"
                            >
                              {this.state.uploading ? '提交作业中' : '开始提交'}
                            </Button>
                        </Form.Item>
                    </Form>
                    </Card>
                </Col></Row>
                </Content>
            );
        }
        else {
            return <div></div>;
        }
    }
}
