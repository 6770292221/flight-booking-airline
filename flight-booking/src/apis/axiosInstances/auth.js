import axios from 'axios';
import config from "../config";
import { handle401Redirect } from '../utils/axiosInterceptorHelper';

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
        if (error.response?.status === 401) {
            handle401Redirect();
        }
        return Promise.reject(error);
    }
);

export default auth;
