import React from "react";
import { Activity, SlidersHorizontal } from "lucide-react";

interface Props {
  connectionStatus: "CONNECTED" | "CONNECTING" | "DISCONNECTED";
  lastViewedAt: string | null;
  onOpenTimeTravel: () => void;
  onRefreshCatchUp: () => void;
}

export const Navbar: React.FC<Props> = ({
  connectionStatus,
  onOpenTimeTravel,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#12131A]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          P
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-lg tracking-tight">Groww PulseWatch</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              CODE 2026
            </span>
          </div>
          <p className="text-xs text-slate-400">Intelligent Market Watchlist & Urgency Engine</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <Activity 
            className={`w-3.5 h-3.5 ${
              connectionStatus === "CONNECTED"
                ? "text-emerald-400 animate-pulse"
                : connectionStatus === "CONNECTING"
                ? "text-amber-400"
                : "text-red-400"
            }`} 
          />
          <span className="text-slate-300 font-medium">
            {connectionStatus === "CONNECTED" ? "Feed Streaming" : connectionStatus}
          </span>
        </div>

        {/* Time-Travel Demo Trigger */}
        <button
          onClick={onOpenTimeTravel}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Judge Test Bench</span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-emerald-500/20">
            RS
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-200">Riya Sharma</div>
            <div className="text-[10px] text-slate-400">Retail Pro Investor</div>
          </div>
        </div>
      </div>
    </header>
  );
};
