const redis = require('redis');
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis error:', err));

redisClient.connect().then(() => {
  console.log('Redis connected');
});

module.exports = redisClient;
