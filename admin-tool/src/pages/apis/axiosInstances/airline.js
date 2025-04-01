import axios from "axios";


const cabinAPI = axios.create({
    baseURL: "http://localhost:3001/api/v1/airline-core-api",
});

cabinAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default cabinAPI;
