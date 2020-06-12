import React from 'react';
import store from 'store';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import {Layout, Menu, Icon} from 'antd';
import Login from './view/login';
import Reg from './view/reg';
import {Notice, Recv, Editlog}  from './view/notice';
import {Homewk, View}  from './view/homewk';
import {Textbook, Rst, Stats}  from './view/textbook';
import {Fee}  from './view/fee';
import {File,Myfile}  from './view/file';
import {Note}  from './view/note';
import {Chat}  from './view/chat';
import 'antd/dist/antd.less'

const { SubMenu } = Menu;
const { Header, Content, Footer } = Layout;


function Home() {
    if (store.get('ifloggedin')) {
        return  <SubMenu
                      title={
                        <span className="submenu-title-wrapper">
                          <Link to="/home"><Icon type="home" style={{color: "#8f2ed1"}}/>个人空间</Link>
                        </span>
                      }
                  >
                          <Menu.Item key="exit"><Link to="/exit"><Icon type="exit"/>退出</Link></Menu.Item>
                  </SubMenu>
    }
    else {
        return  <SubMenu
                  title={
                    <span className="submenu-title-wrapper">
                      <Link to="/login" style={{color: "#8f2ed1"}}><Icon type="login" />登录或注册</Link>
                    </span>
                  }
              >
              <Menu.Item key="login">
                <Link to="/login"><Icon type="login" />登录</Link>
              </Menu.Item>
              <Menu.Item key="reg">
                <Link to="/reg"><Icon type="user" />注册</Link>
              </Menu.Item>
            </SubMenu>
    }
}

const Welcome = () => {
    setTimeout(() => {ReactDOM.render(<App />, document.getElementById('root'))},500);
    return(<div><h2>欢迎访问ClassIS</h2></div>);
};

const Exit = () => {
    store.remove('ifloggedin','role');
    ReactDOM.render(<App />, document.getElementById('root'));
    return <Redirect to='/' />;
};


function App() {
    return (
        <Router>
            <Layout>
                <Header>

                    <Menu mode="horizontal" style={{lineHeight: '64px', padding: 0}} theme='light'>
                        <Menu.Item key="logo"> <img src='images/cis.png' height="52" width="110" padding='0'/>
                        </Menu.Item>
                        <SubMenu
                          title={
                            <span className="submenu-title-wrapper">
                              <Link to="/notices" style={{color: "#f5222d"}}><Icon type="mail"  />通知</Link>
                            </span>
                          }
                        >
                            <Menu.Item key="notice">
                                <Link to="/notices" style={{color: "#f5222d"}}><Icon type="mail"/> 通知</Link>
                            </Menu.Item>
                            <Menu.Item key="notice">
                                <Link to="/editlog" style={{color: "#f5222d"}}><Icon type="mail"/> 修改日志</Link>
                            </Menu.Item>
                        </SubMenu>

                        <Menu.Item key="homewk">
                            <Link to="/homewks" style={{color: "#fa8c16"}}><Icon type="form" />作业</Link>
                        </Menu.Item>

                        <Menu.Item key="fee">
                            <Link to="/fee" style={{color: "#faad14"}}><Icon type="money-collect" />班费</Link>
                        </Menu.Item>
                        <SubMenu
                          title={
                            <span className="submenu-title-wrapper">
                              <Link to="/textbook" style={{color: "#52c41a"}}><Icon type="read"  />教材订购</Link>
                            </span>
                          }
                        >
                        <Menu.Item key="textbook">
                            <Link to="/textbook" ><Icon type="read"/>教材订购</Link>
                        </Menu.Item>
                        <Menu.Item key="textbook">
                            <Link to="/stats"><Icon type="read"/>统计结果</Link>
                        </Menu.Item>
                        <Menu.Item key="textbook">
                            <Link to="/rst"><Icon type="read"/>重置任务</Link>
                        </Menu.Item>
                        </SubMenu>

                        <Menu.Item key="note">
                            <Link to="/note" style={{color: "#1890ff"}}><Icon type="profile"/> 随堂讲义</Link>
                        </Menu.Item>

                        <SubMenu
                          title={
                            <span className="submenu-title-wrapper">
                              <Link to="/file" style={{color: "#1890ff"}}><Icon type="file"  />文件管理</Link>
                            </span>
                          }
                        >
                        <Menu.Item key="file">
                            <Link to="/file" style={{color: "#2f54eb"}}><Icon type="file"/> 文件管理</Link>
                        </Menu.Item>
                        <Menu.Item key="usb">
                            <Link to="/myfile" style={{color: "#2f54eb"}}><Icon type="usb"/> 我的文件</Link>
                        </Menu.Item>
                        </SubMenu>

                        <Menu.Item key="chat">
                            <Link to="/chat" style={{color: "#722ed1"}}><Icon type="team"/> 在线交流</Link>
                        </Menu.Item>


                        {Home()}
                    </Menu>
                </Header>

                <Content style={{padding: 0, minHeight: 658}}>
                    <div className="site-layout-content">
                        <Route exact path="/" component={Notice}/>
                        <Route exact path="/notices" component={Notice}/>
                        <Route exact path="/notices/:id" component={Recv}/>
                        <Route path="/editlog" component={Editlog}/>
                        <Route exact path="/homewks" component={Homewk}/>
                        <Route exact path="/homewks/:id" component={View}/>
                        <Route exact path="/fee" component={Fee}/>
                        <Route path="/textbook" component={Textbook}/>
                        <Route path="/stats" component={Stats}/>
                        <Route path="/rst" component={Rst}/>
                        <Route path="/note" component={Note}/>
                        <Route path="/file" component={File}/>
                        <Route path="/myfile" component={Myfile}/>
                        <Route path="/chat" component={Chat}/>
                        <Route path="/login" component={Login}/>
                        <Route path="/reg" component={Reg}/>
                        <Route path="/home" component={Welcome}/>
                        <Route path="/exit" component={Exit}/>
                    </div>
                </Content>

                <Footer style={{padding: 0, background: "#fff", textAlign: 'center'}}>
                    ClassIS
                </Footer>
            </Layout>
        </Router>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
