class OutSocketMsgModel {
    constructor(action = "", isResponse = false, msg = "", images = [], audios = []) {
        this.action = action;
        this.isResponse = isResponse;
        this.msg = msg;
        this.images = images;
        this.audios = audios;
    }
}

module.exports = OutSocketMsgModel;