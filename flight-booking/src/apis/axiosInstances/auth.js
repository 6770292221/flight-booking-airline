import config from "../config";
import axios from 'axios';

const auth = axios.create({
    baseURL: `${config.BASE_URL}/user-core-api`,
    headers: {
        'Content-Type': 'application/json',
    },
});
export default auth;
