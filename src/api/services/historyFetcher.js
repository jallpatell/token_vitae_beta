import { getContractCreationBlock, fetchTokenPrice } from './alchemy.js';
import Price from './priceModel.js';
import redis from './redis.js';
import { scheduleQueue } from './bullmq.js';

// Helper: get all daily midnight IST unix timestamps from start to today
function generateDailyMidnightISTTimestamps(startTimestamp) {
  const MS_PER_DAY = 86400 * 1000;
  const now = new Date();
  // Set to today's midnight IST
  const todayIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  todayIST.setHours(0, 0, 0, 0);
  const todayUnix = Math.floor(todayIST.getTime() / 1000);

  // Start at first midnight IST after contract creation
  let d = new Date(startTimestamp * 1000);
  d = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  d.setHours(0, 0, 0, 0);
  let ts = Math.floor(d.getTime() / 1000);

  const timestamps = [];
  while (ts <= todayUnix) {
    timestamps.push(ts);
    ts += 86400; // next day
  }
  return timestamps;
}

// Helper: sleep for ms
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: upsert daily price in MongoDB
async function storeDailyPrice({ token, network, date, price, source }) {
  await Price.updateOne(
    { token, network, date },
    {
      $set: {
        token,
        network,
        date,
        price,
        source,
      },
    },
    { upsert: true }
  );
}

// Main orchestrator
export async function runHistoryFetchJob(token, network) {
  // 1. Get contract creation block
  const creationBlock = await getContractCreationBlock(token, network);
  const creationTimestamp = Number(creationBlock.timestamp);
  // 2. Generate daily midnight IST timestamps
  const timestamps = 1752905400;
  // 3. For each timestamp, fetch price (with batching)
  const BATCH_SIZE = 15;
  for (let i = 0; i < timestamps.length; i += BATCH_SIZE) {
    const batch = timestamps.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (ts) => {
      // Try to fetch price using the same logic as /price
      let price = null;
      let source = 'alchemy';
      try {
        price = await fetchTokenPrice(token, network, ts);
      } catch (e) {
        // If price not found, try interpolation
        source = 'interpolated';
        // Find before/after prices in DB
        const before = await Price.findOne({ token, network, date: { $lt: ts } }).sort({ date: -1 });
        const after = await Price.findOne({ token, network, date: { $gt: ts } }).sort({ date: 1 });
        if (before && after) {
          const ratio = (ts - before.date) / (after.date - before.date);
          price = before.price + (after.price - before.price) * ratio;
        } else if (before || after) {
          price = (before || after).price;
          source = 'approximate';
        } else {
          price = null;
        }
      }
      if (price !== null) {
        await storeDailyPrice({ token, network, date: ts, price, source });
        // Also cache in Redis
        const cacheKey = `price:${token}:${network}:${ts}`;
        await redis.set(cacheKey, price, 'EX', 300);
      }
    }));
    // Respect Alchemy rate limit
    if (i + BATCH_SIZE < timestamps.length) await sleep(1000);
  }
}

// Schedule a repeatable job for 12am IST every day
// 12am IST = 6:30pm UTC (the day before)
await scheduleQueue.add(
  'daily-fetcher',
  {}, // job data (can be empty, or include a list of tokens/networks)
  {
    repeat: {
      cron: '30 18 * * *', // 6:30pm UTC = 12:00am IST
      tz: 'Asia/Kolkata'
    },
    jobId: 'daily-fetcher-job'
  }
); 