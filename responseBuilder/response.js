class ResponseItem {
    constructor() {}
}

export default class ResponseItemBuilder {
    constructor() {
        this.responseItem = new ResponseItem();
    }

    setStatus(status) {
        this.responseItem.status = status;
        return this;
    }

    setMessage(message) {
        this.responseItem.message = message;
        return this;
    }

    setData(data) {
        this.responseItem.data = data;
        return this;
    }

    setToken(token) {
        this.responseItem.token = token;
        return this;
    }

    build() {
        return this.responseItem;
    }
}
