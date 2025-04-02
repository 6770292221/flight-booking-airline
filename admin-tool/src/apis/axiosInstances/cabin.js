import axios from "axios";
import config from "../config";


const cabinAPI = axios.create({
    baseURL: `${config.BASE_URL}/cabin-core-api`,
});

cabinAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default cabinAPI;
