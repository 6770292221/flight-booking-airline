import axios from "axios";

const bookingAPI = axios.create({
    baseURL: "http://localhost:3001/api/v1/booking-core-api",
});

bookingAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default bookingAPI;
