"use client";

interface StatsBarProps {
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    avgScore: string;
  };
  activeTab: "pending" | "approved" | "rejected";
  onTabChange: (tab: "pending" | "approved" | "rejected") => void;
}

export function StatsBar({ stats, activeTab, onTabChange }: StatsBarProps) {
  const tabs = [
    {
      key: "pending" as const,
      label: "Pending",
      count: stats.pending,
      color: "text-amber-400",
      bgActive: "bg-amber-500/10 border-amber-500/50",
      emoji: "⏳",
    },
    {
      key: "approved" as const,
      label: "Approved",
      count: stats.approved,
      color: "text-green-400",
      bgActive: "bg-green-500/10 border-green-500/50",
      emoji: "✅",
    },
    {
      key: "rejected" as const,
      label: "Rejected",
      count: stats.rejected,
      color: "text-red-400",
      bgActive: "bg-red-500/10 border-red-500/50",
      emoji: "❌",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`
              flex flex-col items-center p-3 sm:p-4 rounded-xl border transition-all duration-200
              ${activeTab === tab.key
                ? tab.bgActive
                : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900"
              }
            `}
          >
            <span className="text-lg sm:text-xl mb-1">{tab.emoji}</span>
            <span className={`text-2xl sm:text-3xl font-bold tabular-nums ${tab.color}`}>
              {tab.count}
            </span>
            <span className="text-xs text-zinc-500 mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "pending" && stats.pending > 0 && (
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-zinc-500">
          <span>Avg score: <span className="text-zinc-300 font-medium">{stats.avgScore}/10</span></span>
          <span>·</span>
          <span>Total processed: <span className="text-zinc-300 font-medium">{stats.approved + stats.rejected}</span></span>
        </div>
      )}
    </div>
  );
}
