import React from 'react';
import store from 'store';
import {observer} from 'mobx-react';
import {
    Form,
    Input,
    Statistic,
    Button,
    message,
    Row,
    Col,
    Layout,
    Upload,
    Icon,
    Tree,
    Radio,
    DatePicker,
    Select,
    Switch
} from 'antd';
import {inject} from '../service/utils';
import FileService from '../service/files';
import '../css/index.css'
import 'antd/dist/antd.less'

const { Content } = Layout;
const { Search } = Input;
const { DirectoryTree } = Tree;
const { Option } = Select;
const fileService = new FileService();
let name = '';
let suffix = [];
let uploadTime = ['',''];


export class File extends React.Component {
    render() {
        return <_File service={fileService} />;
    }
}


@inject({ fileService })
@observer
class _File extends React.Component  {
    constructor(props) {
        super(props);
        props.fileService.getSuffix();
    }

    state = {
        startValue: null,
        endValue: null,
        endOpen: false,
        batch: false,
        batchList: [],
        trees: [],
        orderChange: false,
    };

    fileTree = this.props.fileService.fileTree.bind(this);
    search = this.props.fileService.search.bind(this);
    myFile = this.props.fileService.myFile.bind(this);

    onSearch = (value) => {
        name=value;
        this.search(name,suffix,uploadTime);
    };

    handleChange = (value) => {
        suffix=value;
        this.search(name,suffix,uploadTime);
    };

    onChange = (field, value) => {
        this.setState({ [field]: value });
        this.search(name,suffix,uploadTime);
    };

    disabledStartDate = startValue => {
        const { endValue } = this.state;
        if (!startValue || !endValue) {
                              return false;
                            }
        return startValue.valueOf() > endValue.valueOf();
    };

    disabledEndDate = endValue => {
        const { startValue } = this.state;
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
    };

    onStartChange = value => {
        uploadTime[0]=value;
        this.onChange('startValue', value);
    };

    onEndChange = value => {
        uploadTime[1]=value;
        this.onChange('endValue', value);
    };

    handleStartOpenChange = open => {
        if (!open) {
          this.setState({ endOpen: true });
        }
    };

    handleEndOpenChange = open => {
        this.setState({ endOpen: open });
    };

    onSelect = (key,node) =>{(node.node.props.isLeaf && !this.state.batch)?window.open(key):console.log('---') };
    onCheck = (checkedKeys) => { this.setState({batchList: checkedKeys}) };
    onClick = () => {this.state.batchList.map((key)=>window.open(key));console.log(this.state.batchList)};

    render() {
        const { startValue, endValue, endOpen, batch, trees, orderChange } = this.state;
        let id = store.get('sno');
        let suffixList=this.props.fileService.suffixList;

        return  <Content style={{ background: '#adc6ff', minHeight: "658px", padding: '30px'}}>
            <Row gutter={[15,15]}>
                <Col span={7} >
                    <Search placeholder="input search text" onSearch={this.onSearch.bind(this)} enterButton />
                </Col>
                <Col span={4} >
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="后缀名"
                        onChange={this.handleChange.bind(this)}
                      >
                          {suffixList.map((item)=> <Option key={item}>{item}</Option>)}
                      </Select>
               </Col>
                <Col span={8} >
                    {"上传时间："}
                    <DatePicker
                      disabledDate={this.disabledStartDate}
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      value={startValue}
                      placeholder="最早"
                      onChange={this.onStartChange.bind(this)}
                      onOpenChange={this.handleStartOpenChange}
                    />
                    <DatePicker
                      disabledDate={this.disabledEndDate}
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      value={endValue}
                      placeholder="最晚"
                      onChange={this.onEndChange.bind(this)}
                      open={endOpen}
                      onOpenChange={this.handleEndOpenChange}
                    />
                </Col>

            </Row>
            <Row gutter={[5, 5]} >
                <Col span={8} >
                    <div>{"排序："}
                    <Radio.Group defaultValue="a" buttonStyle="solid">
                        <Radio.Button value="a"
                                      style={{ lightingColor: '#adc6ff'}}
                                      onClick={
                                          ()=>{ this.setState({orderChange: !orderChange});
                                                orderChange? this.fileTree('path','SORT'):
                                                this.fileTree('path','REVERSE')}
                                                }
                        >路径</Radio.Button>
                        <Radio.Button value="b"
                                      onClick={
                                          ()=>{ this.setState({orderChange: !orderChange});
                                                orderChange? this.fileTree('filename','SORT'):
                                                this.fileTree('filename','REVERSE')}
                                                }
                        >文件名</Radio.Button>
                        <Radio.Button value="c"
                                      onClick={
                                          ()=>{ this.setState({orderChange: !orderChange});
                                                orderChange? this.fileTree('suffix','SORT'):
                                                this.fileTree('suffix','REVERSE')}
                                                }
                        >后缀名</Radio.Button>
                        <Radio.Button value="d"
                                      onClick={
                                          ()=>{ this.setState({orderChange: !orderChange});
                                                orderChange? this.fileTree('modify','SORT'):
                                                this.fileTree('modify','REVERSE')}
                                                }
                        >修改时间</Radio.Button>
                        <Radio.Button value="e"
                                      onClick={
                                          ()=>{ this.setState({orderChange: !orderChange});
                                                orderChange? this.fileTree('upload','SORT'):
                                                this.fileTree('upload','REVERSE')}
                                                }
                        >上传时间</Radio.Button>
                    </Radio.Group></div>
                </Col>

                <Col span={3}>
                    <Button type="primary"
                            shape="round"
                            icon="usb"
                            onClick={this.myFile}
                    >查看我的文件</Button>
                </Col>

                <Col span={2}>
                    <Button type="primary" shape="round" icon="cloud-download"
                            onClick={this.onClick}
                    >下载</Button>
                </Col>
                <Col span={2}>
                    {"批量 "}<Switch checkedChildren="开" unCheckedChildren="关" onClick={()=>{this.setState({batch: !batch})}} />
                </Col>
            </Row>


                <Row gutter={[15, 15]} >
                    <Col span={18} >{trees.length !=0 ?
                        <DirectoryTree multiple
                               defaultExpandAll
                               onExpand={this.onExpand}
                               checkable={batch}
                               onCheck={this.onCheck.bind(this)}
                               onSelect={this.onSelect}
                               treeData={trees}
                        >
                        </DirectoryTree>:this.props.fileService.fileTree.bind(this)('path','SORT')}
                    </Col>

                </Row>
            </Content>
    }
}


@inject({ fileService })
@observer
export class Myfile extends React.Component  {
    constructor(props) {
        super(props);
        props.fileService.getSuffix();
    }

    state = {
        fileList: [],
        uploading: false,
        batch: false,
        batchList: [],
        trees: [],
        currentPath:'/'
    };

    myFile = this.props.fileService.myFile.bind(this);
    search = this.props.fileService.search.bind(this);
    mkdir = this.props.fileService.mkdir.bind(this);
    addFile = this.props.fileService.addFile.bind(this);
    rmFile = this.props.fileService.rmFile.bind(this);
    id = store.get('sno');

    onSearch = (value) => {
        name=value;
        this.search(name,suffix,uploadTime);
    }

    handleChange = (value) => {
        suffix=value;
        this.search(name,suffix,uploadTime);
    }

    onRightClick = (click) => {
        !click.node.props.isLeaf?this.setState({
            currentPath:click.node.props.eventKey.replace('/file/'+this.id,'')
        }):console.log(click.node.props.eventKey)};
    onSelect = (key,node) =>{(node.node.props.isLeaf && !this.state.batch)?window.open(key):console.log('---') };
    onCheck = (checkedKeys) => { this.setState({batchList: checkedKeys}) };
    onClick = () => {this.state.batchList.map((key)=>window.open(key));console.log(this.state.batchList)};
    mkdirClick = (event) => {
        event.preventDefault();
        const fd = new FormData();
        let fm = event.target.form;

        fd.append("action", 'mkdir');
        fd.append('pwd',this.state.currentPath);
        fd.append('dir',fm[0].value);

        this.mkdir(fd);
    };

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
            message.success(`${info.file.name} 文件上传成功`);
        } else if (status === 'error') {
                    this.setState({
                uploading: false,
        });
            message.error(`${info.file.name} 文件上传失败`);
        }
    };

    addFileClick = (event) => {
        event.preventDefault();
        const {fileList} = this.state;
        const fd = new FormData();

        fileList.forEach(file => {
            fd.append("file", file['file']);
        });
        fd.append('pwd',this.state.currentPath);
        fd.append("action", 'addFile');
        this.addFile(fd);
    };

    rmFileClick = (event) => {
        event.preventDefault();
        const fd = new FormData();

        fd.append("action", 'rmFile');
        fd.append("rmList", this.state.batchList);

        this.rmFile(fd);
    };

    render() {
        const { batch, trees, currentPath,fileList } = this.state;

        return  (
            <Content style={{ background: '#adc6ff', minHeight: "658px", padding: '30px'}}>
            <Row gutter={[5, 5]} >
                <Col span={3}>
                    <Button type="primary"
                            shape="round"
                            icon="usb"
                            onClick={this.myFile}
                    >查看我的文件</Button>
                </Col>
                <Col span={3}>
                    <Statistic title="当前目录" value={currentPath} />
                </Col>

                <Form>
                    <Col span={3}>
                    <Form.Item>
                        <Input placeholder="新建目录" />
                    </Form.Item>
                    </Col>
                    <Col span={1}>
                    <Form.Item>
                        <Button onClick={this.mkdirClick}>
                              <Icon type="folder-add" />
                        </Button>
                    </Form.Item>
                    </Col>
                </Form>

                <Form onSubmit={this.addFileClick}>
                    <Col span={1}>
                        <Form.Item>
                             <Upload
                                  customRequest={this.beforeUpload}
                                  onRemove={this.onRemove}
                                  withCredentials={true}
                                  multiple={true}
                                  onChange={this.onChange}
                                  {...fileList}
                                >
                                 <Icon type="file-add" />
                             </Upload>
                        </Form.Item>
                    </Col>
                    <Col span={2}>
                        <Form.Item>
                            <Button htmlType="submit">
                                {"开始上传"}
                                <Icon type="upload" />
                            </Button>
                        </Form.Item>
                    </Col>
                </Form>
                <Col span={1}>
                    <Button onClick={this.rmFileClick}>
                      <Icon type="delete" />
                    </Button>
                </Col>

                <Col span={2}>
                    <Button type="primary" shape="round" icon="cloud-download"
                            onClick={this.onClick}
                    >下载</Button>
                </Col>
                <Col span={2}>
                    {"批量 "}<Switch checkedChildren="开" unCheckedChildren="关" onClick={()=>{this.setState({batch: !batch})}} />
                </Col>
            </Row>


            <Row gutter={[15, 15]} >
                <Col span={18} >{trees.length !=0 ?
                    <DirectoryTree multiple
                           defaultExpandAll
                           onExpand={this.onExpand}
                           onRightClick={this.onRightClick.bind(this)}
                           checkable={batch}
                           onCheck={this.onCheck.bind(this)}
                           onSelect={this.onSelect}
                           treeData={trees}
                    >
                    </DirectoryTree>:this.myFile('path','SORT')}
                </Col>

            </Row>
            </Content>);
    }
}
