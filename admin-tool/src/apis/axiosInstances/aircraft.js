import axios from "axios";
import config from "../config";

const aircraftAPI = axios.create({
    baseURL: `${config.BASE_URL}/aircraft-core-api`,
});

aircraftAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default aircraftAPI;
