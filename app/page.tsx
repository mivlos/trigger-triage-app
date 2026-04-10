'use client';

import { useEffect, useState } from 'react';

interface Trigger {
  id: string;
  name: string;
  score: number;
  audience?: string;
  message?: string;
  platforms?: string[];
  content: string;
}

interface Stats {
  pending: number;
  avgScore: string;
  byScore: {
    high: number;
    medium: number;
    low: number;
  };
}

export default function Home() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterScore, setFilterScore] = useState(0);
  const [approved, setApproved] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);

  useEffect(() => {
    loadTriggers();
  }, []);

  async function loadTriggers() {
    try {
      setLoading(true);
      const res = await fetch('/api/triggers');
      if (!res.ok) throw new Error('Failed to load triggers');
      const data = await res.json();
      setTriggers(data.triggers);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function handleApprove(id: string) {
    setApproved([...approved, id]);
    setTriggers(triggers.filter(t => t.id !== id));
  }

  function handleReject(id: string) {
    setRejected([...rejected, id]);
    setTriggers(triggers.filter(t => t.id !== id));
  }

  function handleQuickApprove(topN: number) {
    const toApprove = triggers.slice(0, topN).map(t => t.id);
    setApproved([...approved, ...toApprove]);
    setTriggers(triggers.slice(topN));
  }

  const filtered = triggers.filter(t => t.score >= filterScore).sort((a, b) => b.score - a.score);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-lg text-gray-700">Loading triggers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎯 Trigger Triage</h1>
          <p className="text-lg text-gray-700">Approve or reject pending GTM triggers</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-3xl font-bold text-indigo-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-3xl font-bold text-green-600">{stats.byScore.high}</div>
              <div className="text-sm text-gray-600">HIGH (8.0+)</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-3xl font-bold text-yellow-600">{stats.byScore.medium}</div>
              <div className="text-sm text-gray-600">MEDIUM (6-8)</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-3xl font-bold text-blue-600">{stats.avgScore}</div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </div>
          </div>
        )}

        {/* Actions & Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by minimum score:
              </label>
              <div className="flex gap-2">
                {[0, 6, 7, 8, 9].map(score => (
                  <button
                    key={score}
                    onClick={() => setFilterScore(score)}
                    className={`px-3 py-2 rounded text-sm font-medium transition ${
                      filterScore === score
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {score === 0 ? 'All' : `${score}+`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick approve:
              </label>
              <div className="flex gap-2">
                {[3, 5, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => handleQuickApprove(n)}
                    className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition"
                  >
                    Top {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Approved: <span className="font-bold text-green-600">{approved.length}</span> | Rejected:{' '}
            <span className="font-bold text-red-600">{rejected.length}</span> | Remaining:{' '}
            <span className="font-bold text-blue-600">{triggers.length}</span>
          </div>
        </div>

        {/* Triggers List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-lg text-gray-600">No triggers to review</p>
            </div>
          ) : (
            filtered.map(trigger => (
              <div
                key={trigger.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-white font-bold text-lg ${
                          trigger.score >= 8
                            ? 'bg-red-600'
                            : trigger.score >= 6
                            ? 'bg-yellow-600'
                            : 'bg-blue-600'
                        }`}
                      >
                        {trigger.score.toFixed(1)}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">{trigger.name}</h3>
                    </div>
                    {trigger.message && (
                      <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Message:</span> {trigger.message}
                      </p>
                    )}
                    {trigger.audience && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold">Audience:</span> {trigger.audience}
                      </p>
                    )}
                    {trigger.platforms && trigger.platforms.length > 0 && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Platforms:</span> {trigger.platforms.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <details className="mb-4 cursor-pointer">
                  <summary className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    View full content →
                  </summary>
                  <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <pre className="text-xs text-gray-700 overflow-auto max-h-64 whitespace-pre-wrap break-words">
                      {trigger.content}
                    </pre>
                  </div>
                </details>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(trigger.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleReject(trigger.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
