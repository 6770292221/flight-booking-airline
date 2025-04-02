import axios from "axios";
import config from "../../../config";


const airlineAPI = axios.create({
    baseURL: `${config.BASE_URL}/airline-core-api`,
});

airlineAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default airlineAPI;
