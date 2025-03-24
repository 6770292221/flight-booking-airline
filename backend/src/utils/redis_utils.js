import redis from 'redis';
import dotenv from 'dotenv';
import { Logger } from '../state/logger_state.js';
dotenv.config({ path: "./src/config/config.env" });

const logger = new Logger()
const host = process.env.REDIS_HOST
const port = process.env.REDIS_PORT
const password = process.env.REDIS_PASSWORD

const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },
    password: process.env.REDIS_PASSWORD,
});



client.on('connect', () => {
    logger.log('Redis connected successfully');
});

client.on('error', (err) => {
    logger.log('Redis connection failed:', "error");
});


export default client;

