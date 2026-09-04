import React from "react";
import { SessionCatchUpDigest, ProcessedQuote } from "../types/market.js";
import { formatINR, formatPercent, formatMinutesAgo, getAttentionColor } from "../utils/formatters.js";
import { Sparkles, CheckCircle2, TrendingUp, TrendingDown, Clock } from "lucide-react";

interface Props {
  digest: SessionCatchUpDigest | null;
  streamQuotes: ProcessedQuote[];
  onAcknowledge: () => void;
  onSelectStock: (symbol: string) => void;
}

export const CatchUpDigest: React.FC<Props> = ({
  digest,
  streamQuotes,
  onAcknowledge,
  onSelectStock,
}) => {
  if (!digest) return null;

  // Merge live stream quotes so the cards stay 100% live and in sync with the table
  const liveMovers = digest.topMoversSinceLastSeen.map((m) => {
    const liveQuote = streamQuotes.find((q) => q.symbol === m.symbol);
    if (!liveQuote) return m;

    const livePrice = liveQuote.price;
    const changeSinceSeenPct = Number(
      (((livePrice - m.priceThen) / m.priceThen) * 100).toFixed(2)
    );

    let liveHighlight = m.keyHighlight;
    if (liveQuote.activeEvents.length > 0) {
      liveHighlight = liveQuote.activeEvents[0].headline;
    } else if (liveQuote.attentionBreakdown.primaryReason) {
      liveHighlight = liveQuote.attentionBreakdown.primaryReason;
    }

    return {
      ...m,
      priceNow: livePrice,
      changeSinceSeenPct,
      attentionScore: liveQuote.attentionScore,
      keyHighlight: liveHighlight,
    };
  });

  // Dynamically sort by live attention score descending
  liveMovers.sort((a, b) => b.attentionScore - a.attentionScore);

  const urgentMovers = liveMovers.filter((m) => m.attentionScore >= 40);
  const topThree = urgentMovers.length > 0 ? urgentMovers.slice(0, 3) : liveMovers.slice(0, 3);

  return (
    <section className="bg-gradient-to-b from-[#181A24] to-[#12131A] rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden mb-6">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              While You Were Away
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Last active: {formatMinutesAgo(digest.timeAwayMinutes)}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {digest.itemsRequiringAttention > 0
              ? `${digest.itemsRequiringAttention} ${digest.itemsRequiringAttention === 1 ? "stock has" : "stocks have"} meaningful activity demanding your attention`
              : "Markets have stayed relatively calm across your watchlist"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ranked deltas between your last session baseline and live market order flow.
          </p>
        </div>

        <button
          onClick={onAcknowledge}
          className="flex items-center gap-2 self-start md:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Mark as Caught Up</span>
        </button>
      </div>

      {/* Live Sorted Top-3 Cards */}
      {topThree.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
          {topThree.map((mover, index) => {
            const isGain = mover.changeSinceSeenPct >= 0;
            const style = getAttentionColor(mover.attentionScore);

            return (
              <div
                key={mover.symbol}
                onClick={() => onSelectStock(mover.symbol)}
                className={`cursor-pointer group relative p-4 rounded-xl border ${style.border} ${style.bg} hover:border-emerald-500/40 transition flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-base group-hover:text-emerald-400 transition">
                          {mover.symbol}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${style.badge}`}>
                          Score {mover.attentionScore}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          #{index + 1} Priority
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                        {mover.name}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-white text-sm">
                        {formatINR(mover.priceNow)}
                      </div>
                      <div className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${isGain ? "text-emerald-400" : "text-red-400"}`}>
                        {isGain ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {formatPercent(mover.changeSinceSeenPct)}
                      </div>
                    </div>
                  </div>

                  {/* Highlight pill */}
                  <div className="mt-2.5 p-2 rounded-lg bg-[#12131A]/60 border border-slate-800/60 text-[11px] text-slate-300">
                    <span className="font-medium text-slate-200 block mb-0.5">Shift Highlight:</span>
                    <span className="text-slate-400 leading-tight block">{mover.keyHighlight}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Baseline: {formatINR(mover.priceThen)}</span>
                  <span className="text-emerald-400 font-medium group-hover:underline">View Analysis &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
          No extreme volatility or circuit events detected during your absence. All positions are trading within normal tolerances.
        </div>
      )}
    </section>
  );
};
