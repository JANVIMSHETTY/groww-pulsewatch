import React, { useState } from "react";
import { ProcessedQuote } from "../types/market.js";
import { formatINR, formatPercent, formatVolume, getAttentionColor } from "../utils/formatters.js";
import { StalenessBadge } from "./StalenessBadge.js";
import { ArrowUpDown, Flame, AlertCircle, Sparkles, Plus, Trash2 } from "lucide-react";

interface Props {
  quotes: ProcessedQuote[];
  onSelectStock: (symbol: string) => void;
  onOpenAddStock: () => void;
  onRemoveStock: (symbol: string) => void;
}

type SortField = "ATTENTION" | "SYMBOL" | "PRICE" | "CHANGE" | "VOLUME";

export const WatchlistTable: React.FC<Props> = ({
  quotes,
  onSelectStock,
  onOpenAddStock,
  onRemoveStock,
}) => {
  const [sortField, setSortField] = useState<SortField>("ATTENTION");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    let comp = 0;
    if (sortField === "ATTENTION") comp = b.attentionScore - a.attentionScore;
    else if (sortField === "SYMBOL") comp = a.symbol.localeCompare(b.symbol);
    else if (sortField === "PRICE") comp = b.price - a.price;
    else if (sortField === "CHANGE") comp = b.dayChangePct - a.dayChangePct;
    else if (sortField === "VOLUME") comp = b.volumeMultiple - a.volumeMultiple;
    return sortAsc ? -comp : comp;
  });

  return (
    <div className="bg-[#12131A] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base">Watchlist & Urgency Monitor</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
              {quotes.length} stocks
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked dynamically by Urgency / Attention Priority rather than raw % noise.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSort("ATTENTION")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
              sortField === "ATTENTION"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Sort by Attention</span>
          </button>

          <button
            onClick={onOpenAddStock}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/40">
              <th 
                className="py-3 px-5 cursor-pointer hover:text-white"
                onClick={() => handleSort("SYMBOL")}
              >
                <div className="flex items-center gap-1">
                  <span>Instrument</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th 
                className="py-3 px-4 cursor-pointer hover:text-white"
                onClick={() => handleSort("PRICE")}
              >
                <div className="flex items-center gap-1">
                  <span>LTP</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th 
                className="py-3 px-4 cursor-pointer hover:text-white"
                onClick={() => handleSort("CHANGE")}
              >
                <div className="flex items-center gap-1">
                  <span>Day Change</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th 
                className="py-3 px-4 cursor-pointer hover:text-white"
                onClick={() => handleSort("VOLUME")}
              >
                <div className="flex items-center gap-1">
                  <span>20D Vol Anomaly</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4">52W & Circuit Proximity</th>

              <th className="py-3 px-4">Data Freshness SLA</th>

              <th 
                className="py-3 px-5 cursor-pointer hover:text-white text-right"
                onClick={() => handleSort("ATTENTION")}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Attention Urgency</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/50 text-xs font-normal">
            {sortedQuotes.map((q) => {
              const isGain = q.dayChangePct >= 0;
              const attStyle = getAttentionColor(q.attentionScore);
              const is52WHigh = q.price >= q.fiftyTwoWeekHigh;
              const is52WLow = q.price <= q.fiftyTwoWeekLow;
              const isNearCircuit = q.distanceToUpperCircuitPct <= 1.2 || q.distanceToLowerCircuitPct <= 1.2;

              return (
                <tr
                  key={q.symbol}
                  className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectStock(q.symbol)}
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-slate-200 text-xs">
                        {q.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-white text-sm group-hover:text-emerald-400 transition">
                          <span>{q.symbol}</span>
                          <span className="text-[10px] font-normal text-slate-400 uppercase">
                            {q.activeExchange}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                          {q.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-semibold text-white text-sm">
                    {formatINR(q.price)}
                  </td>

                  <td className="py-4 px-4">
                    <div className={`font-semibold text-xs ${isGain ? "text-emerald-400" : "text-red-400"}`}>
                      {formatPercent(q.dayChangePct)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isGain ? "+" : ""}{formatINR(q.dayChange)}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        q.volumeMultiple >= 2.2
                          ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                          : q.volumeMultiple >= 1.5
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-300"
                      }`}>
                        {q.volumeMultiple.toFixed(1)}x
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({formatVolume(q.volume)})
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      {is52WHigh ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded w-fit">
                          <Sparkles className="w-3 h-3" /> New 52W High
                        </span>
                      ) : is52WLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded w-fit">
                          <AlertCircle className="w-3 h-3" /> New 52W Low
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {(( (q.fiftyTwoWeekHigh - q.price) / q.fiftyTwoWeekHigh ) * 100).toFixed(1)}% to 52W H
                        </span>
                      )}

                      {isNearCircuit && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded w-fit animate-pulse">
                          Circuit Band ({Math.min(q.distanceToUpperCircuitPct, q.distanceToLowerCircuitPct)}%)
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <StalenessBadge status={q.stalenessStatus} />
                  </td>

                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            q.attentionScore >= 70
                              ? "bg-red-500"
                              : q.attentionScore >= 45
                              ? "bg-amber-400"
                              : "bg-slate-500"
                          }`}
                          style={{ width: `${q.attentionScore}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold w-6 ${attStyle.text}`}>
                        {q.attentionScore}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[170px] ml-auto mt-0.5">
                      {q.attentionBreakdown.primaryReason}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onRemoveStock(q.symbol)}
                      title="Remove from watchlist"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
