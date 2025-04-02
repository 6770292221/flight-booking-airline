import axios from "axios";


const airlineAPI = axios.create({
    baseURL: "http://localhost:3001/api/v1/airline-core-api",
});

airlineAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default airlineAPI;
