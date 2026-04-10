"use client";

import type { Trigger } from "@/app/page";

interface TriggerDetailProps {
  trigger: Trigger;
  onClose: () => void;
  onAction: (filename: string, action: "approve" | "reject" | "defer") => void;
  isActioning: boolean;
}

function scoreColor(score: number): string {
  if (score >= 8) return "text-green-400";
  if (score >= 6) return "text-amber-400";
  if (score >= 4) return "text-orange-400";
  return "text-red-400";
}

export function TriggerDetail({ trigger, onClose, onAction, isActioning }: TriggerDetailProps) {
  const isPending = trigger.status === "pending";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-zinc-800">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xl font-bold tabular-nums ${scoreColor(trigger.score)}`}>
                {trigger.score}/10
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{trigger.type}</span>
            </div>
            <h2 className="text-lg font-semibold leading-snug">{trigger.name}</h2>
            <div className="flex flex-wrap gap-2 mt-2 text-xs text-zinc-500">
              {trigger.detected && <span>📅 {trigger.detected}</span>}
              {trigger.source && <span>📡 {trigger.source}</span>}
              {trigger.halfLife && <span>⏱ {trigger.halfLife}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Sub-scores */}
          {(trigger.velocity > 0 || trigger.relevance > 0 || trigger.halfLifeScore > 0) && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Velocity", value: trigger.velocity },
                { label: "Relevance", value: trigger.relevance },
                { label: "Half-life", value: trigger.halfLifeScore },
              ].filter(s => s.value > 0).map((s) => (
                <div key={s.label} className="text-center p-2 rounded-lg bg-zinc-800/50">
                  <div className={`text-lg font-bold ${scoreColor(s.value)}`}>{s.value}</div>
                  <div className="text-[10px] text-zinc-500">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Signal */}
          {trigger.signal && (
            <section>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Signal</h3>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{trigger.signal}</p>
            </section>
          )}

          {/* Why it matters */}
          {trigger.whyItMatters && (
            <section>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Why It Matters</h3>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{trigger.whyItMatters}</p>
            </section>
          )}

          {/* Recommended action */}
          {trigger.recommendedAction && (
            <section>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Recommended Action</h3>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{trigger.recommendedAction}</p>
            </section>
          )}

          {/* Platforms & Audiences */}
          <div className="flex flex-wrap gap-3">
            {trigger.platforms.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Platforms</h3>
                <div className="flex flex-wrap gap-1.5">
                  {trigger.platforms.map((p) => (
                    <span key={p} className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-300">{p}</span>
                  ))}
                </div>
              </section>
            )}
            {trigger.audiences.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Audiences</h3>
                <div className="flex flex-wrap gap-1.5">
                  {trigger.audiences.map((a) => (
                    <span key={a} className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-400">{a}</span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Related */}
          {trigger.relatedTriggers.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Related Triggers</h3>
              <div className="flex flex-wrap gap-1.5">
                {trigger.relatedTriggers.map((r) => (
                  <span key={r} className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 font-mono">{r}</span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Action footer */}
        {isPending && (
          <div className="border-t border-zinc-800 p-4 flex gap-3">
            <button
              onClick={() => onAction(trigger.filename, "approve")}
              disabled={isActioning}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-500 text-white transition-all disabled:opacity-50"
            >
              ✓ Approve
            </button>
            <button
              onClick={() => onAction(trigger.filename, "reject")}
              disabled={isActioning}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 transition-all disabled:opacity-50"
            >
              ✗ Reject
            </button>
            <button
              onClick={() => onAction(trigger.filename, "defer")}
              disabled={isActioning}
              className="py-2.5 px-4 rounded-xl text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-all disabled:opacity-50"
            >
              ⏸ Defer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
