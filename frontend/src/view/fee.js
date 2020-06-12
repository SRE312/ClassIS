import React from 'react';
import { observer } from 'mobx-react';
import {
    Form,
    Tabs,
    Input,
    Timeline,
    Popover,
    Statistic,
    Button,
    Collapse,
    InputNumber,
    message,
    Row,
    Col,
    Upload,
    Icon,
    Card,
    DatePicker
} from 'antd';
import { inject } from '../service/utils';
import FeeService from '../service/fees';
import '../css/index.css'
import 'antd/dist/antd.less'

const { TabPane } = Tabs;
const { Panel } = Collapse;
const InputGroup = Input.Group;
const feeService = new FeeService();


export class Fee extends React.Component {
    render() {
        return <_Fee service={feeService} />;
    }
}


@inject({ feeService })
@observer
class _Fee extends React.Component  {
    constructor(props) {
        super(props);
        props.feeService.bill();
        props.feeService.auditmsg();
    }

    state = {
        fileList: [],
        uploading: false,
        visible: false,
    };

    ingPanelStyle = {
        background: '#faad14',
        borderRadius: 5,
        marginBottom: 2,
        border: 0,
        overflow: 'hidden',
    };

    edPanelStyle = {
        background: '#ffe58f',
        borderRadius: 8,
        marginBottom: 5,
        border: 0,
        overflow: 'hidden',
    };

    failPanelStyle = {
        background: '#fffbe6',
        borderRadius: 4,
        marginBottom: 0,
        border: 0,
        overflow: 'hidden',
    };

    onRemove = file => {
        this.setState(state => {
            const index = state.fileList.indexOf(file);
            const newFileList = state.fileList.slice();
            newFileList.splice(index, 1);
            return {
                fileList: newFileList
            };
        })
      };

    beforeUpload = file => {
        this.setState(state =>( {
          fileList: [...state.fileList, file]
        }));
        return false;
    };

    onChange = info => {
        const { status } = info.file;
        if (status !== 'uploading') {
            console.log(info.file, info.fileList);
        }

        if (status === 'done') {
            this.setState({
                  fileList: [],
                  uploading: false,
                });
            message.success(`${info.file.name} 材料提交成功`);
        } else if (status === 'error') {
            this.setState({ uploading: false });
            message.error(`${info.file.name} 材料提交失败`);
        }
    }

    onAddSubmit = (event) => {
        event.preventDefault();
        const fd = new FormData();
        let fm = event.target;

        fd.append('item',fm[0].value);
        fd.append('detail',fm[1].value);
        fd.append('account',fm[2].value);
        fd.append('action','income');

        this.props.feeService.add(fd);

    };

    onSubmit = (event) => {
        event.preventDefault();
        const fd = new FormData();
        const {fileList} = this.state;
        let fm = event.target;

        fileList.forEach(file => {
            fd.append("file", file['file']);
        });
        fd.append('item', fm[0].value);
        fd.append('date', fm[1].value);
        fd.append('detail', fm[2].value);
        fd.append('account', fm[3].value);
        fd.append('action', 'disburse');

        this.props.feeService.reimburse(fd);
        this.setState({
            uploading: true
        });
    };

    render(){
        const { fileList } = this.state;
        let billsData = this.props.feeService.bills;
        let surplus = this.props.feeService.surplus;
        let adtings = this.props.feeService.auditings;
        let adteds = this.props.feeService.auditeds;
        let adtfails = this.props.feeService.auditfails;
        const uploadButton = (  <div>
                                    <Icon type="plus" />
                                    <div className="ant-upload-text">Upload</div>
                                </div>
                        );

        return  (
            <Tabs animated={true} type="card"  defaultActiveKey={"1"} style={{padding: "32px"}}>
            <TabPane tab={<span><Icon type="account-book" theme="twoTone" twoToneColor="#52c41a" />班级账单</span>} key="1">
              <Row justify="center" type="flex"><Col span={8} offset={7}>
                  <Statistic title="班费余额"
                    value={surplus}
                     prefix={<Icon type="bar-chart" />}
                  /></Col>
              </Row>
              <br/>
              <Row justify="center" type="flex"><Col span={9} >
              <Timeline mode="alternate">
                  <Timeline.Item
                      dot={ <Popover
                          title="班费+"
                          trigger="click"
                          content={
                            <Form onSubmit={this.onAddSubmit.bind(this)} >
                            <Form.Item
                                       labelCol={{ span:4 }}
                                       labelAlign={"left"}
                                       colon={false}
                            >
                                 <div><Icon type="tag" theme="twoTone" />
                                    {" "}{"收入项目: "}
                                    <Input style={{ width: '72%' }} /></div>

                                 <InputGroup compact  style={{ width: 350 }}>
                                    <div><Icon type="schedule" theme="twoTone" />{" "}{"收入状况: "}
                                        <Input style={{ width: '25%' }}/>{" "}
                                    <Icon type="schedule" theme="twoTone" />{" "}{"收入金额: "}
                                        <InputNumber style={{ width: '25%' }} /></div>
                                 </InputGroup>
                            </Form.Item>
                            <Form.Item>
                                <div align="center"><Button type="primary" htmlType="submit">add</Button></div>
                            </Form.Item>
                            </Form>
                           }>
                                <Button type="link" style={{backgroundColor:'#f0f2f5'}} >
                                    <Icon type="plus-square" theme="twoTone" twoToneColor="#722ed1" />
                                </Button>
                            </Popover>
                      }
                  >
                  </Timeline.Item>

                  {billsData.map((item, index)=>(
                  <Timeline.Item
                      dot={item.account<0?
                          <Icon type="minus-circle" style={{backgroundColor:'#f0f2f5'}} theme="twoTone" twoToneColor="#f5222d"/>:
                          <Icon type="plus-circle" style={{backgroundColor:'#f0f2f5'}} theme="twoTone" twoToneColor="#52c41a"/>
                      }
                      wrapperCol={{ span:14, offset:21 }}
                  >
                    <Popover
                        title={<div>
                            <Icon type="tag" theme="twoTone" twoToneColor="#13c2c2"/>当前余额：{item.balance}</div>}
                        content={<div>
                            <Icon type="calendar" theme="twoTone" twoToneColor="#52c41a"/>时间：{item.date}<br />
                            <Icon type="shop" theme="twoTone" twoToneColor="#a0d911"/>{item.account<0?"支出":"收入"}项目:{item.item}<br />
                            <Icon type="shopping" theme="twoTone" twoToneColor="#fa8c16"/>{item.account<0?"支出":"收入"}状况：{item.detail}<br />
                            <Icon type="red-envelope" theme="twoTone" twoToneColor="#f5222d"/>{item.account<0?"支出":"收入"}金额：{Math.abs(item.account)}<br />
                        </div>}
                        placement={(index)%2 ?"right":"left"}
                    >
                    <Button type="Default" >
                        <Icon type="calendar" theme="twoTone" twoToneColor="#52c41a"/>{item.date}
                        <Icon type="dollar" theme="twoTone" twoToneColor="#fa8c16"/>{item.account}
                    </Button>
                    </Popover>
                </Timeline.Item>))}
              </Timeline>
              </Col></Row>
            </TabPane>


            <TabPane tab={<span><Icon type="fund" theme="twoTone" twoToneColor="#eb2f96" />我要报销</span>} key="2">
              <Row gutter={[5, 5]} ><Col span={5} offset={7} >
                  <Form onSubmit={this.onSubmit.bind(this)} >
                        <Card
                            title={
                                <Form.Item label={
                                    <div><Icon type="tag" theme="twoTone" />
                                    {" "}{"支出项目:"}</div>}
                                           labelCol={{ span:4 }}
                                           wrapperCol={{ span:16 }}
                                           labelAlign={"left"}
                                           colon={false}
                                >
                                    <Input />
                                </Form.Item>
                            }
                            bordered={true} style={{ width: 600 }}
                            headStyle={{ height:70 }}
                        >
                            <Form.Item label={
                                <div><Icon type="schedule" theme="twoTone" />
                                {"详细信息："}</div>}
                                       labelCol={{ span:4 }}
                                       wrapperCol={{ span:20 }}
                                       labelAlign={"left"}
                                       colon={false}
                            >
                                <div><Icon type="schedule" theme="twoTone" />
                                    {"  "}{"日期: "}<DatePicker /></div>
                                <InputGroup compact>
                                    <div><Icon type="schedule" theme="twoTone" />{"支出状况: "}
                                    <Input style={{ width: '60%' }}/></div>
                                    <div><Icon type="schedule" theme="twoTone" />{"支出金额: "}
                                        <InputNumber /></div>
                                </InputGroup>
                            </Form.Item>


                             <Form.Item label={
                                <div><Icon type="schedule" theme="twoTone" />
                                {"报销材料："}</div>}
                                       labelCol={{ span:4 }}
                                       wrapperCol={{ span:19 }}
                                       labelAlign={"left"}
                                       colon={false}
                            ><div  className="clearfix">
                                 <Upload
                                  customRequest={this.beforeUpload}
                                  onRemove={this.onRemove}
                                  listType="picture-card"
                                  className= 'upload-list-inline'
                                  withCredentials={true}
                                  multiple={true}
                                  onChange={this.onChange}
                                  {...fileList}
                                >

                                      { uploadButton}
                                 </Upload></div>
                             </Form.Item>

                            <Form.Item wrapperCol={{ offset:10 }}>
                                <Button type="primary" htmlType="submit">提交报销申请</Button>
                            </Form.Item>
                        </Card>
                  </Form>
            </Col></Row>
            </TabPane>


            <TabPane tab={<span><Icon type="eye" theme="twoTone" />审核</span>} key="4">
                <Collapse
                    bordered={false}
                    expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
                >{adtings.map((item)=>(
                    <Panel header={"(待审核......) "+item.item} style={this.ingPanelStyle}>
                        <p>{"时间："}{item.date}</p>
                        <p>{"   支付人："}{item.payer}{"   支出金额："}{Math.abs(item.account)}{"  "}
                            {item.materials.length != 0 ?
                        <Popover trigger="click"
                                 content={
                                     item.materials.map((file)=>(
                                         <Card
                                            hoverable
                                            style={{ width: 360 }}
                                            cover={<img alt="example" src={"/apiforjs/fees/"+item.id+"/"+file} />}
                                          >
                                          </Card>
                                    ))}
                        ><Button type="primary" style={{background: "#fa8c16",borderColor:"#ffd591"}}>查看材料</Button>
                        </Popover>:<div></div>}
                        </p>
                        <p>
                            <Button type="primary"
                                    style={{background: "#a0d911",borderColor:"#eaff8f"}}
                                    onClick={()=>this.props.feeService.audit(item.id,'pass')}>通过审核</Button>
                            {"   "}
                            <Button type="primary"
                                    style={{background: "#fa541c",borderColor:"#ffbb96"}}
                                    onClick={()=>this.props.feeService.audit(item.id,'reject')}>拒绝</Button>
                        </p>
                    </Panel>))}
              </Collapse>

              <Collapse
                  bordered={false}
                  expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
              >{adteds.map((item)=>(
                    <Panel header={"(已审核) "+item.item} style={this.edPanelStyle}>
                        <p>{"时间："}{item.date}</p>
                        <p>{item.account<0?"   支付人：":"   班费管理者："}{item.payer}{item.account < 0 ?"   支出":"   收入"+"金额："}{Math.abs(item.account)}{"  "}
                            {item.materials.length != 0 ?
                        <Popover trigger="click"
                                 content={
                                     item.materials.map((file)=>(
                                         <Card
                                            hoverable
                                            style={{ width: 360 }}
                                            cover={<img alt="example" src={"/apiforjs/fees/"+item.id+"/"+file} />}
                                          >
                                          </Card>
                                    ))}
                        >
                           <Button type="primary" style={{background: "#faad14",borderColor:"#ffd591"}}>查看材料</Button>
                        </Popover>:<div></div>}
                        </p>
                    </Panel>))}
              </Collapse>

              <Collapse
                  bordered={false}
                  expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
                >{adtfails.map((item)=>(
                    <Panel header={"(审核未通过) "+item.item} style={this.failPanelStyle}>
                        <p>{"时间："}{item.date}</p>
                        <p>{item.account<0?"   支付人：":"   班费管理者："}{item.payer}{item.account < 0 ?"   支出":"   收入"+"金额："}{Math.abs(item.account)}{"  "}
                            {item.materials.length != 0 ?
                        <Popover trigger="click"
                                 content={
                                     item.materials.map((file)=>(
                                         <Card
                                            hoverable
                                            style={{ width: 360 }}
                                            cover={<img alt="example" src={"/apiforjs/fees/"+item.id+"/"+file} />}
                                          >
                                          </Card>
                                    ))}
                        >
                           <Button type="primary" style={{background: "#ffe58f",borderColor:"#ffd591"}}>查看材料</Button>
                        </Popover>:<div></div>}
                        </p>
                    </Panel>))}
              </Collapse>
            </TabPane>

            </Tabs>
        )}
}

