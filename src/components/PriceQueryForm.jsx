"use client";
import React, { useState } from 'react';
import { usePriceStore } from '../state/usePriceStore';
import { FaHome, FaChartLine, FaCubes, FaMagic, FaEnvelope, FaBars, FaTimes } from "react-icons/fa";

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
    <form
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10 flex flex-col gap-4 max-w-md mx-auto"
      onSubmit={handleQuery}
    >
      <h2 className="text-xl font-bold mb-2 text-white">Token Price Query</h2>
      <div>
        <label className="block font-medium mb-1 text-gray-200">Token Address</label>
        <input
          className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 transition"
          value={token}
          onChange={e => setToken(e.target.value)}
          name="tokenAddress"
          placeholder="0x..."
        />
      </div>
      <div>
        <label className="block font-medium mb-1 text-gray-200">Network</label>
        <select
          className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 transition"
          value={network}
          onChange={e => setNetwork(e.target.value)}
          name="network"
        >
          {NETWORKS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1 text-gray-200">Timestamp</label>
        <input
          className="w-full bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 transition"
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
          className="bg-blue-900 p-3 text-white font-bold py-2 rounded shadow hover:scale-105 transition"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Query Price'}
        </button>
        <button
          type="button"
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:scale-105 transition"
          onClick={handleSchedule}
          disabled={isLoading}
        >
          {isLoading ? 'Scheduling...' : 'Schedule Full History'}
        </button>
      </div>
      {priceData && (
        <div className="mt-4 p-3 bg-gray-50/10 rounded">
          {priceData.price !== null && (
            <div className="text-lg font-bold text-white">
              Price: <span className="text-blue-300">${priceData.price}</span>
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