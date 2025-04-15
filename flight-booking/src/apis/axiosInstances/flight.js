import config from "../config";
import axios from 'axios';

const flight = axios.create({
    baseURL: `${config.BASE_URL}/flight-core-api`,

    headers: {
        'Content-Type': 'application/json',
    },
});

export default flight;
