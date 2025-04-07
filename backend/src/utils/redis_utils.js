// utils/redis_client.js
import redis from "redis";
import dotenv from "dotenv";
import logger from "../utils/logger_utils.js";

dotenv.config({ path: "./src/config/config.env" });

class RedisClient {
    static instance;

    constructor() {
        if (RedisClient.instance) {
            return RedisClient.instance;
        }

        this.client = redis.createClient({
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
            },
            password: process.env.REDIS_PASSWORD,
        });

        this.client.on("connect", () => {
            logger.info("Redis connected successfully");
        });

        this.client.on("error", (err) => {
            logger.error("Redis connection failed: " + err);
        });

        RedisClient.instance = this;
    }

    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    getClient() {
        return this.client;
    }
}

export default RedisClient.getInstance().getClient();
