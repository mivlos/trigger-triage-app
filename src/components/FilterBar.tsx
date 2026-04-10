"use client";

interface FilterBarProps {
  scoreRange: [number, number];
  onScoreRangeChange: (range: [number, number]) => void;
  audienceFilter: string;
  onAudienceFilterChange: (audience: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  allAudiences: string[];
  allTypes: string[];
}

export function FilterBar({
  scoreRange,
  onScoreRangeChange,
  audienceFilter,
  onAudienceFilterChange,
  typeFilter,
  onTypeFilterChange,
  searchQuery,
  onSearchQueryChange,
  allAudiences,
  allTypes,
}: FilterBarProps) {
  return (
    <div className="mb-4 space-y-3">
      {/* Search */}
      <input
        type="text"
        placeholder="Search triggers..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors"
      />

      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        {/* Score min */}
        <div className="flex items-center gap-1.5 bg-zinc-900 rounded-lg border border-zinc-800 px-2.5 py-1.5">
          <label className="text-xs text-zinc-500 whitespace-nowrap">Score ≥</label>
          <select
            value={scoreRange[0]}
            onChange={(e) => onScoreRangeChange([Number(e.target.value), scoreRange[1]])}
            className="bg-transparent text-sm text-zinc-200 focus:outline-none cursor-pointer"
          >
            {Array.from({ length: 11 }, (_, i) => (
              <option key={i} value={i} className="bg-zinc-900">{i}</option>
            ))}
          </select>
        </div>

        {/* Score max */}
        <div className="flex items-center gap-1.5 bg-zinc-900 rounded-lg border border-zinc-800 px-2.5 py-1.5">
          <label className="text-xs text-zinc-500 whitespace-nowrap">Score ≤</label>
          <select
            value={scoreRange[1]}
            onChange={(e) => onScoreRangeChange([scoreRange[0], Number(e.target.value)])}
            className="bg-transparent text-sm text-zinc-200 focus:outline-none cursor-pointer"
          >
            {Array.from({ length: 11 }, (_, i) => (
              <option key={i} value={i} className="bg-zinc-900">{i}</option>
            ))}
          </select>
        </div>

        {/* Audience */}
        <div className="flex items-center gap-1.5 bg-zinc-900 rounded-lg border border-zinc-800 px-2.5 py-1.5">
          <label className="text-xs text-zinc-500">Audience</label>
          <select
            value={audienceFilter}
            onChange={(e) => onAudienceFilterChange(e.target.value)}
            className="bg-transparent text-sm text-zinc-200 focus:outline-none cursor-pointer max-w-[120px]"
          >
            <option value="all" className="bg-zinc-900">All</option>
            {allAudiences.map((a) => (
              <option key={a} value={a} className="bg-zinc-900">{a}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div className="flex items-center gap-1.5 bg-zinc-900 rounded-lg border border-zinc-800 px-2.5 py-1.5">
          <label className="text-xs text-zinc-500">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="bg-transparent text-sm text-zinc-200 focus:outline-none cursor-pointer max-w-[120px]"
          >
            <option value="all" className="bg-zinc-900">All</option>
            {allTypes.map((t) => (
              <option key={t} value={t} className="bg-zinc-900">{t}</option>
            ))}
          </select>
        </div>

        {/* Clear */}
        {(scoreRange[0] > 0 || scoreRange[1] < 10 || audienceFilter !== "all" || typeFilter !== "all" || searchQuery) && (
          <button
            onClick={() => {
              onScoreRangeChange([0, 10]);
              onAudienceFilterChange("all");
              onTypeFilterChange("all");
              onSearchQueryChange("");
            }}
            className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1.5 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
