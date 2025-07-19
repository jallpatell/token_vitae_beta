import { createPublicClient, http } from 'viem';
import { mainnet, polygon } from 'viem/chains';
import dotenv from 'dotenv';
dotenv.config();

import { ethers } from 'ethers';

const ETHEREUM_RPC_URL = process.env.ALCHEMY_ETHEREUM_RPC_URL;
const POLYGON_RPC_URL = process.env.ALCHEMY_POLYGON_RPC_URL;

const clients = {
  ethereum: createPublicClient({ chain: mainnet, transport: http(ETHEREUM_RPC_URL) }),
  polygon: createPublicClient({ chain: polygon, transport: http(POLYGON_RPC_URL) }),
};

// Chainlink feed mapping: { [network]: { [token]: feedAddress } }
const CHAINLINK_FEEDS = {
  ethereum: {
    // ETH/USD
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
    // USDC/USD
    '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
  },
  polygon: {
    // ETH/USD
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619': '0xdf0Fb4e4F928d2dCB76f438575fDD8682386e13C',
    // USDC/USD
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': '0xfeafcF0cd387E7e7D5cB7AaaC0C3F4E9bB1b5aB8',
  },
};

const aggregatorV3InterfaceABI = [
  {
    "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }],
    "name": "getRoundData",
    "outputs": [
      { "internalType": "uint80", "name": "roundId", "type": "uint80" },
      { "internalType": "int256", "name": "answer", "type": "int256" },
      { "internalType": "uint256", "name": "startedAt", "type": "uint256" },
      { "internalType": "uint256", "name": "updatedAt", "type": "uint256" },
      { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "latestRoundData",
    "outputs": [
      { "internalType": "uint80", "name": "roundId", "type": "uint80" },
      { "internalType": "int256", "name": "answer", "type": "int256" },
      { "internalType": "uint256", "name": "startedAt", "type": "uint256" },
      { "internalType": "uint256", "name": "updatedAt", "type": "uint256" },
      { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export function hasChainlinkFeed(token, network) {
  return Boolean(CHAINLINK_FEEDS[network] && CHAINLINK_FEEDS[network][token]);
}

export async function fetchChainlinkPrice(token, network, timestamp) {
  const feedAddress = CHAINLINK_FEEDS[network]?.[token];
  if (!feedAddress) throw new Error('No Chainlink feed for this token/network');
  const provider = new ethers.providers.JsonRpcProvider(
    network === 'ethereum' ? ETHEREUM_RPC_URL : POLYGON_RPC_URL
  );
  const priceFeed = new ethers.Contract(feedAddress, aggregatorV3InterfaceABI, provider);
  // Binary search for roundId near timestamp
  const latest = await priceFeed.latestRoundData();
  let low = 1n;
  let high = latest.roundId;
  let best = latest;
  while (low <= high) {
    const mid = (low + high) / 2n;
    try {
      const round = await priceFeed.getRoundData(mid);
      if (Number(round.updatedAt) === timestamp) return Number(round.answer) / 1e8;
      if (Number(round.updatedAt) < timestamp) {
        low = mid + 1n;
        best = round;
      } else {
        high = mid - 1n;
        if (Math.abs(Number(round.updatedAt) - timestamp) < Math.abs(Number(best.updatedAt) - timestamp)) {
          best = round;
        }
      }
    } catch (e) {
      high = mid - 1n;
    }
  }
  return Number(best.answer) / 1e8;
}

const UNISWAP_V3_FACTORY = {
  ethereum: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  polygon:  '0x1F98431c8aD98523631AE4a59f267346ea31F984'
};
const USDC = {
  ethereum: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  polygon:  '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
};
const WETH = {
  ethereum: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  polygon:  '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
};
const FEE_TIERS = [500, 3000, 10000];

// Helper: get block number by timestamp (binary search)
export async function getBlockNumberByTimestamp(client, targetTimestamp) {
  let latestBlock = await client.getBlock();
  let low = 0n;
  let high = latestBlock.number;
  let closestBlock = latestBlock;
  while (low <= high) {
    const mid = (low + high) / 2n;
    const block = await client.getBlock({ blockNumber: mid });
    if (!block) break;
    if (block.timestamp === targetTimestamp) {
      return block.number;
    }
    if (block.timestamp < targetTimestamp) {
      low = mid + 1n;
      closestBlock = block;
    } else {
      high = mid - 1n;
      if (Math.abs(Number(block.timestamp) - targetTimestamp) < Math.abs(Number(closestBlock.timestamp) - targetTimestamp)) {
        closestBlock = block;
      }
    }
  }
  return closestBlock.number;
}

// Helper: find Uniswap V3 pool
async function findUniswapV3Pool(client, tokenA, tokenB, blockNumber) {
  for (const fee of FEE_TIERS) {
    const pool = await client.readContract({
      address: UNISWAP_V3_FACTORY[client.chain.name.toLowerCase()],
      abi: [{
        name: 'getPool',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'tokenA', type: 'address' },
          { name: 'tokenB', type: 'address' },
          { name: 'fee', type: 'uint24' }
        ],
        outputs: [{ name: 'pool', type: 'address' }]
      }],
      functionName: 'getPool',
      args: [tokenA, tokenB, fee],
      blockNumber
    });
    if (pool && pool !== '0x0000000000000000000000000000000000000000') {
      return { pool, fee };
    }
  }
  return null;
}

// Helper: get token decimals
async function getTokenDecimals(client, token, blockNumber) {
  try {
    return await client.readContract({
      address: token,
      abi: [{
        name: 'decimals',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }]
      }],
      functionName: 'decimals',
      blockNumber
    });
  } catch {
    return 18; // fallback
  }
}

// Helper: get price from Uniswap V3 pool slot0
async function getUniswapV3Price(client, pool, token0, token1, decimals0, decimals1, blockNumber) {
  const slot0 = await client.readContract({
    address: pool,
    abi: [{
      name: 'slot0',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [
        { name: 'sqrtPriceX96', type: 'uint160' },
        { name: '', type: 'int24' },
        { name: '', type: 'uint16' },
        { name: '', type: 'uint16' },
        { name: '', type: 'uint16' },
        { name: '', type: 'uint16' },
        { name: '', type: 'uint8' },
        { name: '', type: 'bool' }
      ]
    }],
    functionName: 'slot0',
    blockNumber
  });
  const sqrtPriceX96 = slot0[0];
  // Price calculation
  const price = (Number(sqrtPriceX96) ** 2) / 2 ** 192 * (10 ** (decimals1 - decimals0));
  return price;
}

// Main: fetch real token price at timestamp
export async function fetchTokenPrice(token, network, timestamp) {
  const client = clients[network];
  if (!client) throw new Error('Unsupported network');
  // 1. Find closest block
  const blockNumber = await getBlockNumberByTimestamp(client, timestamp);
  // 2. Try direct pool: token/USDC
  let poolInfo = await findUniswapV3Pool(client, token, USDC[network], blockNumber);
  let price = null;
  if (poolInfo) {
    // Get token0/token1 order
    const poolContract = poolInfo.pool;
    const token0 = await client.readContract({
      address: poolContract,
      abi: [{ name: 'token0', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] }],
      functionName: 'token0',
      blockNumber
    });
    const token1 = await client.readContract({
      address: poolContract,
      abi: [{ name: 'token1', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] }],
      functionName: 'token1',
      blockNumber
    });
    const decimals0 = await getTokenDecimals(client, token0, blockNumber);
    const decimals1 = await getTokenDecimals(client, token1, blockNumber);
    price = await getUniswapV3Price(client, poolContract, token0, token1, decimals0, decimals1, blockNumber);
    return price;
  }
  // 3. Fallback: token/WETH then WETH/USDC
  // token/WETH
  let poolInfo1 = await findUniswapV3Pool(client, token, WETH[network], blockNumber);
  let poolInfo2 = await findUniswapV3Pool(client, WETH[network], USDC[network], blockNumber);
  if (poolInfo1 && poolInfo2) {
    // token/WETH price
    const pool1 = poolInfo1.pool;
    const token0_1 = await client.readContract({
      address: pool1,
      abi: [{ name: 'token0', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] }],
      functionName: 'token0',
      blockNumber
    });
    const token1_1 = await client.readContract({
      address: pool1,
      abi: [{ name: 'token1', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] }],
      functionName: 'token1',
      blockNumber
    });
    const decimals0_1 = await getTokenDecimals(client, token0_1, blockNumber);
    const decimals1_1 = await getTokenDecimals(client, token1_1, blockNumber);
    const price1 = await getUniswapV3Price(client, pool1, token0_1, token1_1, decimals0_1, decimals1_1, blockNumber);
    // WETH/USDC price
    const pool2 = poolInfo2.pool;
    const token0_2 = await client.readContract({
      address: pool2,
      abi: [{ name: 'token0', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] }],
      functionName: 'token0',
      blockNumber
    });
    const token1_2 = await client.readContract({
      address: pool2,
      abi: [{ name: 'token1', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] }],
      functionName: 'token1',
      blockNumber
    });
    const decimals0_2 = await getTokenDecimals(client, token0_2, blockNumber);
    const decimals1_2 = await getTokenDecimals(client, token1_2, blockNumber);
    const price2 = await getUniswapV3Price(client, pool2, token0_2, token1_2, decimals0_2, decimals1_2, blockNumber);
    // Final price = price1 * price2
    price = price1 * price2;
    return price;
  }
  throw new Error('No Uniswap V3 pool found for this token');
}

// Get contract creation block using binary search
export async function getContractCreationBlock(token, network) {
  const client = clients[network];
  if (!client) throw new Error('Unsupported network');
  // Get latest block number
  const latestBlock = await client.getBlock();
  let low = 0n;
  let high = latestBlock.number;
  let creationBlock = null;
  while (low <= high) {
    const mid = (low + high) / 2n;
    const code = await client.getBytecode({ address: token, blockNumber: mid });
    if (code) {
      creationBlock = mid;
      high = mid - 1n;
    } else {
      low = mid + 1n;
    }
  }
  if (creationBlock === null) throw new Error('Contract creation block not found');
  // Get block details
  const block = await client.getBlock({ blockNumber: creationBlock });
  return block;
} 