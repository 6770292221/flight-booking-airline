import axios from 'axios';
import config from '../config';
import { handle401Redirect } from '../utils/axiosInterceptorHelper';

const payment = axios.create({
    baseURL: `${config.BASE_URL}/payment-core-api`,
    headers: { 'Content-Type': 'application/json' },
});

payment.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

payment.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            handle401Redirect();
        }
        return Promise.reject(error);
    }
);

export default payment;
