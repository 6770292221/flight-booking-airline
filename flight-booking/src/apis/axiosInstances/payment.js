import axios from 'axios';
import config from '../config';

const payment = axios.create({
    baseURL: `${config.BASE_URL}/payment-core-api`,
    headers: {
        'Content-Type': 'application/json',
    },
});


export default payment;
