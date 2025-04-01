import axios from "axios";


const aircraftAPI = axios.create({
    baseURL: "http://localhost:3001/api/v1/aircraft-core-api",
});

aircraftAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default aircraftAPI;
