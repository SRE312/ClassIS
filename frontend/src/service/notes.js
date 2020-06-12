import React from "react";
import axios from 'axios';
import { message } from "antd";


export default class NoteService extends React.Component {
    constructor(props) {
        super(props);
        this.instance = axios.create({});
    }

    noteTree() {
        axios.get('/apiforjs/notes')
        .then(
            response => {
                this.setState({ noteTrees:response.data.noteTrees });
            }
        )
        .catch(
            error => {
                message.error('随堂笔记获取失败 ~_~')
            }
        );
    }
}
