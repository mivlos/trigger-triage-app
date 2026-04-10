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

const ScoreBadge = ({ score }: { score: number }) => {
  let bgColor = 'bg-blue-600';
  let label = 'LOW';
  
  if (score >= 8) {
    bgColor = 'bg-red-600';
    label = 'HIGH';
  } else if (score >= 6) {
    bgColor = 'bg-yellow-500';
    label = 'MED';
  }
  
  return (
    <div className={`${bgColor} text-white rounded-full w-16 h-16 flex flex-col items-center justify-center flex-shrink-0`}>
      <div className="text-2xl font-bold">{score.toFixed(1)}</div>
      <div className="text-xs font-semibold">{label}</div>
    </div>
  );
};

export default function Home() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterScore, setFilterScore] = useState(0);
  const [approved, setApproved] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
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
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-zinc-700 border-t-red-600"></div>
          <p className="mt-6 text-zinc-300 text-lg">Loading triggers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Trigger Triage</h1>
              <p className="text-zinc-400">Approve or reject pending GTM triggers</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-red-500">{filtered.length}</div>
              <div className="text-sm text-zinc-400">Awaiting Decision</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 text-red-200 px-6 py-4 m-6 rounded-lg">
          <div className="font-semibold">Error loading triggers</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Pending', value: stats.pending, color: 'from-zinc-700 to-zinc-800' },
              { label: 'HIGH (8+)', value: stats.byScore.high, color: 'from-red-700 to-red-800' },
              { label: 'MED (6-8)', value: stats.byScore.medium, color: 'from-yellow-700 to-yellow-800' },
              { label: 'Avg Score', value: stats.avgScore, color: 'from-blue-700 to-blue-800' },
            ].map((stat, idx) => (
              <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 border border-zinc-700`}>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-zinc-400 mt-2 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-3">Filter by Score</label>
              <div className="flex gap-2 flex-wrap">
                {[0, 6, 7, 8, 9].map(score => (
                  <button
                    key={score}
                    onClick={() => setFilterScore(score)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      filterScore === score
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {score === 0 ? 'All' : `${score}+`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-3">Quick Approve</label>
              <div className="flex gap-2">
                {[3, 5, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => handleQuickApprove(n)}
                    className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition"
                  >
                    Top {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-3">Status</label>
              <div className="text-sm">
                <div>✓ <span className="text-green-400">{approved.length}</span> Approved</div>
                <div>✗ <span className="text-red-400">{rejected.length}</span> Rejected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Triggers List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <p className="text-zinc-400 text-lg">No triggers to review</p>
            </div>
          ) : (
            filtered.map(trigger => (
              <div
                key={trigger.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition"
              >
                <div className="flex gap-6 mb-4">
                  <ScoreBadge score={trigger.score} />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{trigger.name}</h3>
                    {trigger.message && (
                      <p className="text-zinc-400 text-sm mb-2">"{trigger.message}"</p>
                    )}
                    {trigger.audience && (
                      <p className="text-xs text-zinc-500">
                        👥 <span className="text-zinc-400">{trigger.audience}</span>
                      </p>
                    )}
                  </div>
                </div>

                {trigger.content && (
                  <details className="mb-4 cursor-pointer">
                    <summary className="text-sm text-zinc-500 hover:text-zinc-400 font-medium py-2">
                      View full content →
                    </summary>
                    <div className="mt-3 p-4 bg-zinc-950 rounded border border-zinc-800">
                      <pre className="text-xs text-zinc-500 overflow-auto max-h-48 whitespace-pre-wrap break-words">
                        {trigger.content.substring(0, 500)}...
                      </pre>
                    </div>
                  </details>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(trigger.id)}
                    className="flex-1 px-4 py-3 bg-green-700 hover:bg-green-600 text-white rounded-lg font-medium transition"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleReject(trigger.id)}
                    className="flex-1 px-4 py-3 bg-red-700 hover:bg-red-600 text-white rounded-lg font-medium transition"
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
