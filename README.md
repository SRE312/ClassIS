# ClassIS ![](https://raw.githubusercontent.com/wiki/SRE312/ClassIS/images/license.png) ![](https://raw.githubusercontent.com/wiki/SRE312/ClassIS/images/flask.png) ![](https://raw.githubusercontent.com/wiki/SRE312/ClassIS/images/react.png) ![](https://raw.githubusercontent.com/wiki/SRE312/ClassIS/images/antd.png)  
<img align="middle" src="https://raw.githubusercontent.com/wiki/SRE312/ClassIS/images/logo.png"></img>  
ClassIS即Class Information Service，班级信息服务  
* 采用前后端分离的开发模式  
* 后端使用Flask框架，提供一些Restful风格的API接口  
* 前端使用React框架，并结合mobx进行状态管理、选用antd作为UI组件库、使用axios实现Ajax  
* 提供班级通知、作业管理、班费管理、教材订购、随堂讲义、文件管理、在线交流等功能  
* 界面见 [wiki](https://github.com/SRE312/ClassIS/wiki)
## 项目背景
> 解决当前处理班级事务所面临的问题，为班级中信息的有效分发、获取、处理、共享等提供便利。  
## 安装
### 1. 数据库
> ①安装MySQL和Redis  

> ②运行数据库服务  

> ③创建数据库并授予用户权限  

### 2. 前端程序编译及部署
> ①安装npm (6.1.0以上版本)  

> ②进入到frontend/  
> > npm i  
> > npm run build  

> ③将编译后目录frontend/dist/ 下的index.html和js文件放到服务器项目路径下

### 3. 后端程序部署 
> ①安装python (3.5.0以上版本) 虚拟环境  

> ②安装依赖到的包 
> > pip install -r requirements  

> ③参考 operations/env 配置系统环境  

> ④实现数据库迁移  
> > 创建迁移仓库  python manage.py db init  
> > 创建迁移脚本  python manage.py db migrate  
> > 将迁移应用到数据库  python manage.py db upgrade  

> ⑤通过uwsgi或直接通过manage.py启动程序  

> ⑥operations/autosync.py在本地运行，用于将同步指定目录下的文件同步到服务器（可选），使用时需要修改autosync.py里的同步口令SYNC_TOKEN 
### 4. 配置Nginx并运行
### 5. 完成
## 使用
使用浏览器访问网站即可使用
## 参与贡献方式
[Open an issue](github.com/SRE312/ClassIS/issues/new) or submit PRs.
## 开源协议
[LGPL](https://github.com/SRE312/ClassIS/blob/master/LICENSE) © SRE312
