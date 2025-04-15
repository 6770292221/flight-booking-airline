import axios from 'axios';
import config from '../config';
import { handle401Redirect, handle404Error } from '../utils/axiosInterceptorHelper';

const booking = axios.create({
    baseURL: `${config.BASE_URL}/booking-core-api`,
    headers: { 'Content-Type': 'application/json' },
});

booking.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});
booking.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            handle401Redirect();
        }

        if (status === 404) {
            handle404Error();
        }

        return Promise.reject(error);
    }
);

export default booking;
