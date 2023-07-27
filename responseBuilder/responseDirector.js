import ResponseItemBuilder from "./response.js";

let instance;

// Singleton Response Director
class ResponseDirector {
    constructor() {
        if (instance) {
            return instance;
        }
        this.instance = instance;
        instance = this;
    }

    getInstance() {
        return this.instance;
    }

    createSuccessResponse(message, data) {
        let builder = new ResponseItemBuilder();
        let response = builder
            .setStatus("success")
            .setMessage(message)
            .setData(data)
            .build();
        return response;
    }

    createErrorResponse(message) {
        let builder = new ResponseItemBuilder();
        let response = builder
            .setStatus("error")
            .setMessage(message)
            .setData(null)
            .build();
        return response;
    }
}

const singletonDirector = Object.freeze(new ResponseDirector());
export default singletonDirector;
