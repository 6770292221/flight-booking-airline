import axios from "axios";
import config from "../../../config";

const airportAPI = axios.create({
    baseURL: `${config.BASE_URL}/airport-core-api`,
});

airportAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default airportAPI;
