import axios from 'axios';
import config from "../config";

const booking = axios.create({
    baseURL: `${config.BASE_URL}/booking-core-api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default booking;
