 
"use client";
import React, { useState } from 'react';
import { usePriceStore } from '../state/usePriceStore';

const NETWORKS = [
  { label: 'Ethereum', value: 'ethereum' },
  { label: 'Polygon', value: 'polygon' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
 
export default function PriceQueryForm() {
  const [token, setToken] = useState('');
  const [network, setNetwork] = useState(NETWORKS[0].value);
  const [timestamp, setTimestamp] = useState('');
  const {
    priceData, isLoading, error, setPriceData, setIsLoading, setError
  } = usePriceStore();

  const validate = () => {
    if (!/^0x[a-fA-F0-9]{40,}$/.test(token)) return 'Enter a valid token address';
    if (!network) return 'Select a network';
    if (!timestamp) return 'Enter a timestamp';
    return null;
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    setError(null);
    const err = validate();
    if (err) return setError(err);
    setIsLoading(true);
    setPriceData(null);
    try {
      const res = await fetch(`${API_BASE}/price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify({ token, network, timestamp: Math.floor(new Date(timestamp).getTime() / 1000) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch price');
      setPriceData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    setError(null);
    const err = validate();
    if (err) return setError(err);
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify({ token, network })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule job');
      setPriceData({ price: null, source: 'scheduled', ...data });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="max-w-md mx-auto p-6 bg-black rounded shadow space-y-4" onSubmit={handleQuery}>
      <div>
        <label className="block font-medium mb-1">Token Address</label>
        <input
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
          value={token}
          onChange={e => setToken(e.target.value)}
          name="tokenAddress"
          placeholder="0x..."
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Network</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={network}
          onChange={e => setNetwork(e.target.value)}
          name="network"
        >
          {NETWORKS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Timestamp</label>
        <input
          className="w-full border px-3 py-2 rounded"
          type="datetime-local"
          value={timestamp}
          onChange={e => setTimestamp(e.target.value)}
          name="timestamp"
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex space-x-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Query Price'}
        </button>
        <button
          type="button"
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleSchedule}
          disabled={isLoading}
        >
          {isLoading ? 'Scheduling...' : 'Schedule Full History'}
        </button>
      </div>
      {priceData && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          {priceData.price !== null && (
            <div className="text-lg font-bold">
              Price: <span className="text-blue-700">${priceData.price}</span>
            </div>
          )}
          {priceData.source && (
            <div className="mt-1">
              Source: <span className={
                priceData.source === 'cache' ? 'bg-yellow-200 text-yellow-800 px-2 py-1 rounded' :
                priceData.source === 'alchemy' ? 'bg-blue-200 text-blue-800 px-2 py-1 rounded' :
                priceData.source === 'interpolated' ? 'bg-purple-200 text-purple-800 px-2 py-1 rounded' :
                priceData.source === 'db' ? 'bg-green-200 text-green-800 px-2 py-1 rounded' :
                'bg-gray-200 text-gray-800 px-2 py-1 rounded'
              }>{priceData.source}</span>
            </div>
          )}
          {priceData.status === 'scheduled' && (
            <div className="mt-2 text-green-700">History fetch scheduled! Job ID: {priceData.jobId}</div>
          )}
        </div>
      )}
    </form>
  );
} 