import axios from "axios";
import config from "../../../config";

const bookingAPI = axios.create({
    baseURL: `${config.BASE_URL}/booking-core-api`,
});

bookingAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default bookingAPI;
