import { HeaderInterceptor } from "../utils/header_interceptor.js";

export const updateAireports = async (req, res) => {
    try {
        await HeaderInterceptor.fetchToken();
        HeaderInterceptor.setConfigOffer(req.body, );

    }catch(error) {
        console.log(error)
    }
}