import redisClient from '../utils/redis_utils.js';
import logger from '../utils/logger_utils.js';
export const addToBlacklist = async (token) => {
    try {
        const expiryTime = 86400;
        await redisClient.setEx(token, expiryTime, 'blacklisted');
        logger.info(`Token added to blacklist: ${token}`);
    } catch (error) {
        logger.info('Error adding token to blacklist: ' + error, "error");
    }
};
export const isTokenBlacklisted = async (token) => {
    try {
        const reply = await redisClient.get(token);
        return reply === 'blacklisted';
    } catch (error) {
        logger.info('Error checking token blacklist: ' +  error, "error");
        return false;
    }
};

export const decodeToken = (token) => {
    try {
        const decoded = jwt.decode(token);
        return decoded;
    } catch (error) {
        logger.info('Error decoding token: ' + error,  "error");
        return null;
    }
};
