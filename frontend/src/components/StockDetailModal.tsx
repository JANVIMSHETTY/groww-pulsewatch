import React from "react";
import { ProcessedQuote } from "../types/market.js";
import { formatINR, formatPercent, getAttentionColor } from "../utils/formatters.js";
import { StalenessBadge } from "./StalenessBadge.js";
import { X, Flame, Activity } from "lucide-react";

interface Props {
  quote: ProcessedQuote | null;
  onClose: () => void;
}

export const StockDetailModal: React.FC<Props> = ({ quote, onClose }) => {
  if (!quote) return null;

  const isGain = quote.dayChangePct >= 0;
  const attStyle = getAttentionColor(quote.attentionScore);

  const dayRangePct = Math.min(
    100,
    Math.max(
      0,
      ((quote.price - quote.dayLow) / Math.max(0.01, quote.dayHigh - quote.dayLow)) * 100
    )
  );

  const yearRangePct = Math.min(
    100,
    Math.max(
      0,
      ((quote.price - quote.fiftyTwoWeekLow) /
        Math.max(0.01, quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) *
        100
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#141620] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start justify-between pr-10 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold text-white tracking-tight">{quote.symbol}</h2>
              <StalenessBadge status={quote.stalenessStatus} />
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {quote.activeExchange}
              </span>
            </div>
            <p className="text-sm text-slate-400">{quote.name} • {quote.sector}</p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-white">{formatINR(quote.price)}</div>
            <div className={`text-sm font-semibold flex items-center justify-end gap-1 ${isGain ? "text-emerald-400" : "text-red-400"}`}>
              {formatPercent(quote.dayChangePct)} ({formatINR(quote.dayChange)})
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${attStyle.border} ${attStyle.bg} mb-6`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-400" />
              <span className="font-bold text-white text-sm">Attention Urgency Score</span>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${attStyle.badge}`}>
              {quote.attentionScore} / 100
            </span>
          </div>

          <p className="text-xs text-slate-300 font-medium mb-3">
            <span className="text-slate-400">Primary Urgency Trigger: </span>
            {quote.attentionBreakdown.primaryReason}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-[11px]">
            <div className="bg-slate-900/60 p-2.5 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase">Volume Multiple</span>
              <span className="font-bold text-slate-200 text-sm">
                {quote.attentionBreakdown.volumeComponent} <span className="text-[10px] text-slate-500">/ 30</span>
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">
                {quote.volumeMultiple.toFixed(1)}x avg
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase">Price Velocity</span>
              <span className="font-bold text-slate-200 text-sm">
                {quote.attentionBreakdown.priceVelocityComponent} <span className="text-[10px] text-slate-500">/ 30</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {Math.abs(quote.dayChangePct).toFixed(1)}% move
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase">Level Breakout</span>
              <span className="font-bold text-slate-200 text-sm">
                {quote.attentionBreakdown.levelViolationComponent} <span className="text-[10px] text-slate-500">/ 25</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {quote.price >= quote.fiftyTwoWeekHigh ? "52W High Crossed" : "Within range"}
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase">Circuit Proximity</span>
              <span className="font-bold text-slate-200 text-sm">
                {quote.attentionBreakdown.circuitProximityComponent} <span className="text-[10px] text-slate-500">/ 15</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {Math.min(quote.distanceToUpperCircuitPct, quote.distanceToLowerCircuitPct)}% to limit
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Day Low: {formatINR(quote.dayLow)}</span>
              <span className="text-slate-200 font-semibold">Today's Range</span>
              <span>Day High: {formatINR(quote.dayHigh)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 relative">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${dayRangePct}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>52W Low: {formatINR(quote.fiftyTwoWeekLow)}</span>
              <span className="text-slate-200 font-semibold">52-Week Range</span>
              <span>52W High: {formatINR(quote.fiftyTwoWeekHigh)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 relative">
              <div
                className="bg-teal-400 h-2 rounded-full transition-all"
                style={{ width: `${yearRangePct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Exchange Feed Reconciliation</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Active: {quote.activeExchange}</span>
              {quote.isConflictResolved && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400">
                  Reconciled (NSE/BSE)
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              Sequence #{quote.sequenceId} • Latency {Math.max(0, Date.now() - quote.lastTickTimestamp)}ms
            </span>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Exchange Risk Circuit Limits</span>
            <div className="flex items-center justify-between font-semibold">
              <span className="text-red-400">Lower: {formatINR(quote.lowerCircuit)}</span>
              <span className="text-emerald-400">Upper: {formatINR(quote.upperCircuit)}</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              10% standard exchange band from previous close
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Detected Market Events Log</span>
          </h4>

          {quote.activeEvents.length > 0 ? (
            <div className="space-y-2">
              {quote.activeEvents.map((evt) => (
                <div key={evt.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">{evt.headline}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      evt.severity === "CRITICAL" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {evt.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{evt.details}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No extraordinary threshold breaches logged for this session.</p>
          )}
        </div>
      </div>
    </div>
  );
};
