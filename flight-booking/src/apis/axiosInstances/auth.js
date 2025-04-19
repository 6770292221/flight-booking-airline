import axios from 'axios';
import config from "../config";
import { handle401Redirect, handle400Error } from '../utils/axiosInterceptorHelper';

const auth = axios.create({
    baseURL: `${config.BASE_URL}/user-core-api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

auth.interceptors.request.use((config) => {
    const skipAuthPaths = [
        '/auth/login',
        '/auth/email-otp/verify',
        '/register',
    ];

    if (!skipAuthPaths.includes(config.url)) {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
    }

    return config;
});

auth.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            handle401Redirect();
        }

        if (status === 400) {
            handle400Error(error);
        }

        return Promise.reject(error);
    }
);


export default auth;
