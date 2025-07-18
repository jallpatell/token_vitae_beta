import { Queue, Worker } from 'bullmq';

const connection = {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
};

export const scheduleQueue = new Queue('schedule', connection);

export const scheduleWorker = new Worker('schedule', async job => {
  // For now, just log the job data
  console.log('[BullMQ Worker] Processing job:', job.data);
  // TODO: Implement price history fetching and caching
}, connection); 