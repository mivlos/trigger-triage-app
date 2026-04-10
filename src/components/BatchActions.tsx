"use client";

import { useState } from "react";

interface BatchActionsProps {
  triggerCount: number;
  onBatchApprove: (count: number) => void;
}

export function BatchActions({ triggerCount, onBatchApprove }: BatchActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [batchSize, setBatchSize] = useState(5);

  const presets = [3, 5, 10].filter((n) => n <= triggerCount);
  if (triggerCount > 10 && !presets.includes(triggerCount)) {
    presets.push(triggerCount);
  }

  return (
    <div className="mb-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-zinc-400">
          <span className="font-medium text-zinc-300">Quick approve</span> top-scored triggers
        </div>

        {!showConfirm ? (
          <div className="flex gap-2">
            {presets.map((n) => (
              <button
                key={n}
                onClick={() => {
                  setBatchSize(n);
                  setShowConfirm(true);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600/15 text-green-400 hover:bg-green-600/25 border border-green-600/20 transition-all"
              >
                Top {n}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-400">
              Approve top {batchSize} triggers?
            </span>
            <button
              onClick={() => {
                onBatchApprove(batchSize);
                setShowConfirm(false);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-500 transition-all"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 transition-all"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
