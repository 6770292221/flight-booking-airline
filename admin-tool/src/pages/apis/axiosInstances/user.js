// src/apis/axiosInstances/user.js
import axios from 'axios';

const userAPI = axios.create({
    baseURL: 'http://localhost:3001/api/v1/user-core-api',
});

export default userAPI;
