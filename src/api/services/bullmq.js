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

// List of tokens/networks to track (can be loaded from DB/config)
const trackedTokens = [
  // Example:
  // { token: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', network: 'ethereum' },
  // { token: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', network: 'polygon' },
];

// Schedule a repeatable job for 12am IST every day (6:30pm UTC)
(async () => {
  await scheduleQueue.add(
    'daily-fetcher',
    {},
    {
      repeat: {
        cron: '30 18 * * *', // 6:30pm UTC = 12:00am IST
        tz: 'Asia/Kolkata',
      },
      jobId: 'daily-fetcher-job',
    }
  );
})();

export const scheduleWorker = new Worker('schedule', async job => {
  if (job.name === 'daily-fetcher') {
    for (const { token, network } of trackedTokens) {
      try {
        await runHistoryFetchJob(token, network);
        console.log(`[Daily Fetcher] Fetched and stored price for ${token} on ${network}`);
      } catch (err) {
        console.error(`[Daily Fetcher] Error for ${token} on ${network}:`, err);
      }
    }
  } else {
    try {
      const { token, network } = job.data;
      console.log(`[BullMQ Worker] Starting history fetch for token=${token}, network=${network}`);
      await runHistoryFetchJob(token, network);
      console.log(`[BullMQ Worker] Completed history fetch for token=${token}, network=${network}`);
    } catch (err) {
      console.error('[BullMQ Worker] Error processing job:', err);
    }
  }
}, connection); 