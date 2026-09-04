import React from "react";
import { StalenessStatus } from "../types/market.js";

interface Props {
  status: StalenessStatus;
  latencyMs?: number;
}

export const StalenessBadge: React.FC<Props> = ({ status, latencyMs }) => {
  if (status === "LIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        LIVE
      </span>
    );
  }

  if (status === "DELAYED") {
    return (
      <span 
        title="Tick feed is experiencing latency (4s - 15s)"
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        DELAYED
      </span>
    );
  }

  return (
    <span 
      title="No ticks received for >15s. Data may be frozen or exchange connection dropped."
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
      STALE
    </span>
  );
};
