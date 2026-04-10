"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TriggerCard } from "@/components/TriggerCard";
import { StatsBar } from "@/components/StatsBar";
import { FilterBar } from "@/components/FilterBar";
import { BatchActions } from "@/components/BatchActions";
import { TriggerDetail } from "@/components/TriggerDetail";

export interface Trigger {
  id: string;
  filename: string;
  name: string;
  type: string;
  detected: string;
  source: string;
  halfLife: string;
  score: number;
  velocity: number;
  relevance: number;
  halfLifeScore: number;
  signal: string;
  whyItMatters: string;
  recommendedAction: string;
  audiences: string[];
  platforms: string[];
  competitiveContext: string;
  relatedTriggers: string[];
  status: "pending" | "approved" | "rejected";
}

export default function Home() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 10]);
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null);
  const [actionInProgress, setActionInProgress] = useState<Set<string>>(new Set());

  const fetchTriggers = useCallback(async () => {
    try {
      const res = await fetch("/api/triggers");
      const data = await res.json();
      setTriggers(data.triggers);
    } catch (e) {
      console.error("Failed to fetch triggers:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTriggers();
  }, [fetchTriggers]);

  const handleAction = async (filename: string, action: "approve" | "reject" | "defer") => {
    setActionInProgress((prev) => new Set(prev).add(filename));
    try {
      const res = await fetch("/api/triggers/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, action }),
      });
      if (res.ok) {
        await fetchTriggers();
        if (selectedTrigger?.filename === filename) {
          setSelectedTrigger(null);
        }
      }
    } finally {
      setActionInProgress((prev) => {
        const next = new Set(prev);
        next.delete(filename);
        return next;
      });
    }
  };

  const handleBatchApprove = async (count: number) => {
    const topN = filteredTriggers.slice(0, count);
    const filenames = topN.map((t) => t.filename);
    try {
      const res = await fetch("/api/triggers/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filenames, action: "approve" }),
      });
      if (res.ok) {
        await fetchTriggers();
      }
    } catch (e) {
      console.error("Batch approve failed:", e);
    }
  };

  const stats = useMemo(() => ({
    pending: triggers.filter((t) => t.status === "pending").length,
    approved: triggers.filter((t) => t.status === "approved").length,
    rejected: triggers.filter((t) => t.status === "rejected").length,
    total: triggers.length,
    avgScore: triggers.filter((t) => t.status === "pending").length > 0
      ? (triggers.filter((t) => t.status === "pending").reduce((sum, t) => sum + t.score, 0) /
        triggers.filter((t) => t.status === "pending").length).toFixed(1)
      : "0",
  }), [triggers]);

  const allAudiences = useMemo(() => {
    const set = new Set<string>();
    triggers.forEach((t) => t.audiences.forEach((a) => set.add(a)));
    return Array.from(set).sort();
  }, [triggers]);

  const allTypes = useMemo(() => {
    const set = new Set<string>();
    triggers.forEach((t) => set.add(t.type));
    return Array.from(set).sort();
  }, [triggers]);

  const filteredTriggers = useMemo(() => {
    return triggers
      .filter((t) => t.status === activeTab)
      .filter((t) => t.score >= scoreRange[0] && t.score <= scoreRange[1])
      .filter((t) => audienceFilter === "all" || t.audiences.some((a) => a.toLowerCase().includes(audienceFilter.toLowerCase())))
      .filter((t) => typeFilter === "all" || t.type.toLowerCase() === typeFilter.toLowerCase())
      .filter((t) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.signal.toLowerCase().includes(q);
      })
      .sort((a, b) => b.score - a.score);
  }, [triggers, activeTab, scoreRange, audienceFilter, typeFilter, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading triggers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-sm font-bold">
                D
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Trigger Triage</h1>
                <p className="text-xs text-zinc-500">Draper GTM Engine</p>
              </div>
            </div>
            <button
              onClick={fetchTriggers}
              className="text-sm px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <StatsBar stats={stats} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pb-8">
        {/* Filters */}
        <FilterBar
          scoreRange={scoreRange}
          onScoreRangeChange={setScoreRange}
          audienceFilter={audienceFilter}
          onAudienceFilterChange={setAudienceFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          allAudiences={allAudiences}
          allTypes={allTypes}
        />

        {/* Batch actions for pending */}
        {activeTab === "pending" && filteredTriggers.length > 0 && (
          <BatchActions
            triggerCount={filteredTriggers.length}
            onBatchApprove={handleBatchApprove}
          />
        )}

        {/* Results count */}
        <div className="mb-4 text-sm text-zinc-500">
          {filteredTriggers.length} trigger{filteredTriggers.length !== 1 ? "s" : ""}
          {activeTab === "pending" && filteredTriggers.length > 0 && (
            <span> · avg score {(filteredTriggers.reduce((s, t) => s + t.score, 0) / filteredTriggers.length).toFixed(1)}</span>
          )}
        </div>

        {/* Trigger list */}
        {filteredTriggers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-lg">No {activeTab} triggers{scoreRange[0] > 0 || scoreRange[1] < 10 || audienceFilter !== "all" ? " matching filters" : ""}</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTriggers.map((trigger) => (
              <TriggerCard
                key={trigger.id}
                trigger={trigger}
                onAction={handleAction}
                onSelect={() => setSelectedTrigger(trigger)}
                isActioning={actionInProgress.has(trigger.filename)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail modal */}
      {selectedTrigger && (
        <TriggerDetail
          trigger={selectedTrigger}
          onClose={() => setSelectedTrigger(null)}
          onAction={handleAction}
          isActioning={actionInProgress.has(selectedTrigger.filename)}
        />
      )}
    </div>
  );
}
