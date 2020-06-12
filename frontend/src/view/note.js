import React from 'react';
import {observer} from 'mobx-react';
import {
    Button,
    Row,
    Col,
    Layout,
    Card,
    Tree,
    Switch
} from 'antd';
import { inject } from '../service/utils';
import NoteService from '../service/notes';
import '../css/index.css'
import 'antd/dist/antd.less'

const { Content } = Layout;
const { DirectoryTree } = Tree;
const noteService = new NoteService();


export class Note extends React.Component {
    render() {
        return <_Note service={noteService} />;
    }
}


@inject({ noteService })
@observer
class _Note extends React.Component  {
    constructor(props){
        super(props);
    }

    state = {
        batch: false,
        noteTrees: [],
        downloadList: []
    };

    onSelect = (key,node) =>{(node.node.props.isLeaf && !this.state.batch)?window.open(key):console.log('---') };
    onCheck = (checkedKeys) => { this.setState({downloadList: checkedKeys}); };
    onClick = () => {this.state.downloadList.map((key)=>window.open(key))};

    render() {
        const { batch, noteTrees } = this.state;
        return  <Content style={{ background: '#91d5ff', minHeight: "658px", padding: '30px'}}>
            <Row><Col span={2}>
                    {"批量 "}<Switch checkedChildren="开"
                                    unCheckedChildren="关"
                                    onClick={()=>{this.setState({batch: !batch})}} />
                </Col>
                <Col span={2}>
                    <Button type="primary" shape="round" icon="cloud-download"
                            onClick={this.onClick}
                    >下载</Button>
                </Col>
            </Row>
            { noteTrees.length !=0 ? noteTrees.map((noteItem)=>(
                <Row gutter={[15, 15]} > { noteItem.map((treeItem)=>(
                    <Col span={7} ><Card >
                        <DirectoryTree multiple
                                       onExpand={this.onExpand}
                                       treeData={treeItem}
                                       checkable={batch}
                                       onCheck={this.onCheck.bind(this)}
                                       onSelect={this.onSelect}
                        >
                        </DirectoryTree>
                    </Card></Col>))}
                </Row>)):this.props.noteService.noteTree.bind(this)() }
            </Content>
    }
}
