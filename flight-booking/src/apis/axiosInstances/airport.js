import axios from 'axios';

const airport = axios.create({
    baseURL: 'http://localhost:3001/api/v1/airport-core-api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default airport;
