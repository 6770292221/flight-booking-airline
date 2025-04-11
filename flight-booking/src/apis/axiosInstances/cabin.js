import config from "../config";
import axios from 'axios';

const cabin = axios.create({
    baseURL: `${config.BASE_URL}/cabin-core-api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default cabin;
