import axios from 'axios';
import config from "../config";


const airport = axios.create({
    baseURL: `${config.BASE_URL}/airport-core-api`,

    headers: {
        'Content-Type': 'application/json',
    },
});

export default airport;
