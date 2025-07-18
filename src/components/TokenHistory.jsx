"use client";
import React, { useState } from 'react';

const NETWORKS = [
  { label: 'Ethereum', value: 'ethereum' },
  { label: 'Polygon', value: 'polygon' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function TokenHistory() {
  const [token, setToken] = useState('');
  const [network, setNetwork] = useState(NETWORKS[0].value);
  const [timestamp, setTimestamp] = useState('');
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const validate = () => {
    if (!/^0x[a-fA-F0-9]{40,}$/.test(token)) return 'Enter a valid token address';
    if (!network) return 'Select a network';
    if (!timestamp) return 'Enter a timestamp';
    return null;
  };

  const handleFetch = async (e) => {
    e.preventDefault();
    setError(null);
    setHistory(null);
    const err = validate();
    if (err) return setError(err);
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify({
          token,
          network,
          timestamp: Math.floor(new Date(timestamp).getTime() / 1000),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="max-w-md mx-auto p-6 bg-black rounded shadow space-y-4 mt-8" onSubmit={handleFetch}>
      <h2 className="text-xl font-bold mb-2">Token Price History</h2>
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
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Fetch History'}
      </button>
      {history && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Results</h3>
          {history.length === 0 ? (
            <div className="text-gray-500">No history found.</div>
          ) : (
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Timestamp</th>
                  <th className="p-2 border">Price</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{new Date(h.timestamp * 1000).toLocaleString()}</td>
                    <td className="p-2 border">${h.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </form>
  );
} 