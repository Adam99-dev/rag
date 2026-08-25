import Redis from 'ioredis';
import 'dotenv/config';

const client = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null
});

export default client;