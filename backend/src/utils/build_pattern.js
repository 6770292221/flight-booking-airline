import { HeaderInterceptor } from "./header_interceptor.js";
import qs from "qs";

export class RequestConfigBuilder {
    constructor(method) {
        this.config = {
            method: method,
            headers: {},
            maxBodyLength: Infinity,
        };
    }

    setAuth(token) {
        this.config.headers.Authorization = "Bearer " + token;
        return this;
    }

    setContentType(contentType) {
        this.config.headers["Content-Type"] = contentType
        return this;
    }

    setURL(url) {
        this.config.url = url;
        return this;
    }


    setQueryParams(params) {
        this.config.params = params;
        return this;
    }


    setBody(body) {
        this.config.data = qs.stringify({
            grant_type: "client_credentials",
            client_id: "emDc3AJZIDpiGzbP4sUC8GeXdpiWaN0R",
            client_secret: "yOJRWrCoV8DIucIq",
        })
        return this;
    }

    build() {
        return this.config;
    }
}

export default RequestConfigBuilder;
