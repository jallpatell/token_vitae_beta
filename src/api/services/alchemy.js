import axios from 'axios';

// Map token address and network to CoinGecko coin ID
const COINGECKO_IDS = {
  ethereum: {
    // USDC
    '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'usd-coin',
    // ETH
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': 'ethereum',
  },
  polygon: {
    // USDC
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': 'usd-coin',
    // WETH
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619': 'ethereum',
  },
};

// Fetch historical price from CoinGecko
export async function fetchCoinGeckoPrice(token, network, timestamp) {
  const id = COINGECKO_IDS[network]?.[token];
  if (!id) throw new Error('No CoinGecko ID mapping for this token/network');
  // CoinGecko expects date as dd-mm-yyyy
  const date = new Date(timestamp * 1000);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const dateStr = `${day}-${month}-${year}`;
  const url = `https://api.coingecko.com/api/v3/coins/${id}/history?date=${dateStr}`;
  const resp = await axios.get(url);
  const price = resp.data?.market_data?.current_price?.usd;
  if (typeof price !== 'number') throw new Error('No price found from CoinGecko');
  return price;
}

// Get contract creation block using binary search
export async function getContractCreationBlock(token, network) {
  // This function is no longer directly related to price fetching,
  // but keeping it as it was in the original file.
  // It would require a client object which is no longer available.
  // For now, returning a placeholder or throwing an error.
  // A proper implementation would involve a viem client or similar.
  console.warn("getContractCreationBlock is deprecated and no longer functional without a client.");
  return null;
} 