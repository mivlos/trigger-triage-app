"use client";

import type { Trigger } from "@/app/page";

interface TriggerCardProps {
  trigger: Trigger;
  onAction: (filename: string, action: "approve" | "reject" | "defer") => void;
  onSelect: () => void;
  isActioning: boolean;
}

function scoreColor(score: number): string {
  if (score >= 8) return "text-green-400";
  if (score >= 6) return "text-amber-400";
  if (score >= 4) return "text-orange-400";
  return "text-red-400";
}

function scoreBg(score: number): string {
  if (score >= 8) return "bg-green-500/10 border-green-500/30";
  if (score >= 6) return "bg-amber-500/10 border-amber-500/30";
  if (score >= 4) return "bg-orange-500/10 border-orange-500/30";
  return "bg-red-500/10 border-red-500/30";
}

function typeEmoji(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("trend")) return "📈";
  if (t.includes("model")) return "🤖";
  if (t.includes("competitor")) return "⚔️";
  if (t.includes("product")) return "📦";
  if (t.includes("feature")) return "✨";
  return "📋";
}

export function TriggerCard({ trigger, onAction, onSelect, isActioning }: TriggerCardProps) {
  const isPending = trigger.status === "pending";

  return (
    <div
      className={`
        group rounded-xl border transition-all duration-200 overflow-hidden
        ${isPending
          ? "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900"
          : trigger.status === "approved"
            ? "border-green-900/30 bg-green-950/20"
            : "border-red-900/30 bg-red-950/20"
        }
      `}
    >
      <div className="p-4">
        {/* Top row: score + name + type */}
        <div className="flex items-start gap-3">
          {/* Score badge */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg border flex flex-col items-center justify-center ${scoreBg(trigger.score)}`}>
            <span className={`text-lg font-bold tabular-nums leading-none ${scoreColor(trigger.score)}`}>
              {trigger.score || "—"}
            </span>
            <span className="text-[10px] text-zinc-500">/10</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{typeEmoji(trigger.type)}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{trigger.type}</span>
              {trigger.detected && (
                <span className="text-xs text-zinc-600 hidden sm:inline">{trigger.detected}</span>
              )}
            </div>
            <button
              onClick={onSelect}
              className="text-left text-sm sm:text-base font-medium text-zinc-100 hover:text-orange-400 transition-colors line-clamp-2 leading-snug"
            >
              {trigger.name}
            </button>

            {/* Signal preview */}
            <p className="text-xs text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">
              {trigger.signal.slice(0, 200)}
              {trigger.signal.length > 200 ? "..." : ""}
            </p>

            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {trigger.platforms.slice(0, 4).map((p) => (
                <span key={p} className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400">
                  {p}
                </span>
              ))}
              {trigger.audiences.slice(0, 2).map((a) => (
                <span key={a} className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400/80">
                  {a}
                </span>
              ))}
            </div>

            {/* Sub-scores */}
            {(trigger.velocity > 0 || trigger.relevance > 0) && (
              <div className="flex gap-3 mt-2 text-[10px] text-zinc-600">
                {trigger.velocity > 0 && <span>Velocity: {trigger.velocity}</span>}
                {trigger.relevance > 0 && <span>Relevance: {trigger.relevance}</span>}
                {trigger.halfLifeScore > 0 && <span>Half-life: {trigger.halfLifeScore}</span>}
              </div>
            )}
          </div>

          {/* Action buttons */}
          {isPending && (
            <div className="flex-shrink-0 flex flex-col gap-1.5 sm:flex-row sm:gap-2 ml-2">
              <button
                onClick={() => onAction(trigger.filename, "approve")}
                disabled={isActioning}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30 transition-all disabled:opacity-50"
              >
                ✓
              </button>
              <button
                onClick={() => onAction(trigger.filename, "reject")}
                disabled={isActioning}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30 transition-all disabled:opacity-50"
              >
                ✗
              </button>
              <button
                onClick={() => onAction(trigger.filename, "defer")}
                disabled={isActioning}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-700/30 text-zinc-400 hover:bg-zinc-700/50 border border-zinc-700/30 transition-all disabled:opacity-50 hidden sm:block"
              >
                ⏸
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
