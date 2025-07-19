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
    <form
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10 flex flex-col gap-4 max-w-md mx-auto mt-8"
      onSubmit={handleFetch}
    >
      <h2 className="text-xl font-bold mb-2 text-white">Token Price History</h2>
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
      <button
        type="submit"
        className="bg-blue-900 text-white hover::bg-blue-800 font-bold py-2 rounded shadow hover:scale-105 transition"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Fetch History'}
      </button>
      {history && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2 text-white">Results</h3>
          {history.length === 0 ? (
            <div className="text-gray-500">No history found.</div>
          ) : (
            <table className="w-full text-sm border border-white/10 bg-black/20 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-900/60">
                  <th className="p-2 border border-white/10 text-white">Timestamp</th>
                  <th className="p-2 border border-white/10 text-white">Price</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="hover:bg-blue-900/20 transition">
                    <td className="p-2 border border-white/10 text-gray-200">{new Date(h.timestamp * 1000).toLocaleString()}</td>
                    <td className="p-2 border border-white/10 text-blue-300 font-semibold">${h.price}</td>
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