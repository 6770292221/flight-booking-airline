import axios from 'axios';

const flight = axios.create({
    baseURL: 'http://localhost:3001/api/v1/flight-core-api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default flight;
