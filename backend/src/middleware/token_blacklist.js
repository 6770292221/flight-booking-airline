import redisClient from '../utils/redis_utils.js';

export const isTokenBlacklisted = async (token) => {
    try {
        const reply = await redisClient.get(`blacklist:${token}`);
        return reply === 'blacklist';
    } catch (error) {
        console.error('Error checking token blacklist:', error);
        return false;
    }
};