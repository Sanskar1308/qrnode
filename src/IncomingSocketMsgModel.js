class IncomingSocketMsgModel {
    constructor(action = "", merchantName = "", key = "", posName = "", msg = "") {
        this.action = action;
        this.merchantName = merchantName;
        this.key = key;
        this.posName = posName;
        this.msg = msg;
    }
}

module.exports = IncomingSocketMsgModel;