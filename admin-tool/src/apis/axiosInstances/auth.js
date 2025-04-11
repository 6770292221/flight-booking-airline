// src/apis/axiosInstances/user.js
import axios from 'axios';
import config from "../config";

const userAPI = axios.create({
    baseURL: `${config.BASE_URL}/user-core-api`,
});

export default userAPI;
