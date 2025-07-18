import { Queue, Worker } from 'bullmq';
import { runHistoryFetchJob } from './historyFetcher.js';

const connection = {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
};

export const scheduleQueue = new Queue('schedule', connection);

export const scheduleWorker = new Worker('schedule', async job => {
  try {
    const { token, network } = job.data;
    console.log(`[BullMQ Worker] Starting history fetch for token=${token}, network=${network}`);
    await runHistoryFetchJob(token, network);
    console.log(`[BullMQ Worker] Completed history fetch for token=${token}, network=${network}`);
  } catch (err) {
    console.error('[BullMQ Worker] Error processing job:', err);
  }
}, connection); 