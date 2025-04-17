import axios from 'axios';
import config from '../config';
import { handle201CreateBooking, handle400Error, handle401Redirect, handle404Error } from '../utils/axiosInterceptorHelper';

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
    (response) => {
        if (response.status === 201) {
            handle201CreateBooking();
        }
        return response;
    },
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            handle401Redirect();
        }

        if (status === 404) {
            handle404Error();
        }

        if (status === 400) {
            handle400Error(error);
        }

        return Promise.reject(error);
    }
);


export default booking;