import axios from 'axios';

export default class ChatService {
    constructor() {
    }

    emit(inputText, sno) {
        axios.post('/apiforjs/chats', {
            msg: inputText,
            sno: sno,
        })
    }
}