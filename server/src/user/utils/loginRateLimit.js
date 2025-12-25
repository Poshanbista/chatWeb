import redisClient from "../../redisconfig/redis.js";


const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 1 * 60; //block for 1 min

export const checkLoginAttemps = async (key) => {
    const attempts = await redisClient.get(key);

    if (attempts && parseInt(attempts) >= MAX_ATTEMPTS) {
        const ttl = await redisClient.ttl(key);
        return {
            blocked: true,
            waitTime: ttl
        };
    };
    return {
        blocked: false
    }
}

export const recordFailedAttempt = async (key) => {
    const attempts = await redisClient.incr(key);

    if (attempts == 5) {
        await redisClient.expire(key, BLOCK_TIME);
    }
}

export const resetAttempts = async (key) => {
    await redisClient.del(key);
}