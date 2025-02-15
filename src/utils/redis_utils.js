import redis from 'redis';
import logger from './logger_utils.js';
import dotenv from 'dotenv';
dotenv.config({ path: "./src/config/config.env" });


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
    logger.info('Redis connected successfully');
});

client.on('error', (err) => {
    logger.error('Redis connection failed:', err);
});


export default client;

