import redis from 'redis';
import dotenv from 'dotenv';
import logger from '../utils/logger_utils.js';
dotenv.config({ path: "./src/config/config.env" });


const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },
    password: process.env.REDIS_PASSWORD,
});



client.on('connect', () => {
    logger.info('Redis connected successfully');
});

client.on('error', (err) => {
    logger.error('Redis connection failed:' + err);
});


export default client;

