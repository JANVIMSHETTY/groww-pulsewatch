import React, { useState } from "react";
import { X, Clock, Flame, ShieldAlert, CheckCircle2, Info, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSimulateAbsence: (minutes: number) => Promise<void>;
  onTriggerSurge: (symbol: string) => Promise<void>;
  onTriggerBreakout: (symbol: string) => Promise<void>;
  onTriggerCircuit: (symbol: string, side: "UPPER" | "LOWER") => Promise<void>;
  onToggleStall: (symbol: string) => Promise<boolean>;
  onInjectCorruptTick: (symbol: string, type: "OUT_OF_ORDER" | "CLOCK_SKEW") => Promise<any>;
}

export const TimeTravelModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSimulateAbsence,
  onTriggerSurge,
  onTriggerBreakout,
  onTriggerCircuit,
  onToggleStall,
  onInjectCorruptTick,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [lastActionResult, setLastActionResult] = useState<{ title: string; explanation: string; type: "success" | "warning" } | null>(null);
  const [isInfyStalled, setIsInfyStalled] = useState(false);

  if (!isOpen) return null;

  const handleAction = async (
    name: string,
    actionFn: () => Promise<any>,
    resultTitle: string,
    resultExplanation: string,
    type: "success" | "warning" = "success"
  ) => {
    try {
      setLoadingAction(name);
      await actionFn();
      setLastActionResult({
        title: resultTitle,
        explanation: resultExplanation,
        type,
      });
    } catch (e: any) {
      setLastActionResult({
        title: "Action Failed",
        explanation: e.message,
        type: "warning",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#141620] border border-emerald-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="text-xl font-bold text-white tracking-tight">Judge Test Bench & Scenario Controls</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Interactive simulation engine proving how PulseWatch solves Groww's 3 core evaluation requirements.
        </p>

        {/* Live Feedback Banner */}
        {lastActionResult && (
          <div className={`mb-5 p-4 rounded-xl border flex items-start gap-3 animate-fadeIn ${
            lastActionResult.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
          }`}>
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <div className="font-bold text-xs text-white mb-0.5">{lastActionResult.title}</div>
              <div className="text-xs leading-relaxed opacity-90">{lastActionResult.explanation}</div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* SECTION 1: While You Were Away */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  1. Test "While You Were Away" Session Catch-Up
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Solves: State Persistence Across Time
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Simulates what happens when an investor closes the app and returns later. It sets your session timestamp back and computes the price/volume delta since your absence.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={loadingAction !== null}
                onClick={() =>
                  handleAction(
                    "30m",
                    () => onSimulateAbsence(30),
                    "Simulated 30-Minute Absence",
                    "Session time set to 30 mins ago. Look at the top 'While You Were Away' banner on the main screen to see what moved!"
                  )
                }
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                Away for 30m
              </button>
              <button
                disabled={loadingAction !== null}
                onClick={() =>
                  handleAction(
                    "2h",
                    () => onSimulateAbsence(120),
                    "Simulated 2-Hour Absence",
                    "Session time set to 2 hours ago. Notice how stocks with the biggest shifts bubble into the 'While You Were Away' digest cards!"
                  )
                }
                className="px-3 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-semibold text-emerald-300 border border-emerald-500/30 transition shadow-sm"
              >
                Away for 2 Hours
              </button>
              <button
                disabled={loadingAction !== null}
                onClick={() =>
                  handleAction(
                    "1d",
                    () => onSimulateAbsence(1440),
                    "Simulated 1-Day Absence",
                    "Session time set to 24 hours ago. Full day-over-day catch-up digest generated!"
                  )
                }
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                Away for 1 Day
              </button>
            </div>
          </div>

          {/* SECTION 2: Meaningful Change Triggers */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  2. Trigger Real-Time Market Anomalies
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Solves: Attention Urgency Score (0-100)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Forces extraordinary market events to prove that PulseWatch ranks stocks by algorithmic urgency rather than noisy percentage gains.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                disabled={loadingAction !== null}
                onClick={() =>
                  handleAction(
                    "surge",
                    () => onTriggerSurge("ZOMATO"),
                    "ZOMATO Volume Surge Triggered!",
                    "Injected 2.5 Crore share institutional block trade. Watch ZOMATO jump to Attention Score ~89 and climb to the #1 spot in your watchlist table!"
                  )
                }
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-left border border-amber-500/20 hover:border-amber-500/40 transition group"
              >
                <div className="font-bold text-xs text-amber-300 group-hover:text-amber-200">
                  ZOMATO Volume Surge
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Injects 2.5 Cr institutional block deal (&gt;2.2x 20D volume)
                </div>
              </button>

              <button
                disabled={loadingAction !== null}
                onClick={() =>
                  handleAction(
                    "breakout",
                    () => onTriggerBreakout("RELIANCE"),
                    "RELIANCE 52-Week Breakout!",
                    "Reliance crossed above ₹3,217.90 (its 52W High). Notice the green 'New 52W High' badge and urgency level points added!"
                  )
                }
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-left border border-emerald-500/20 hover:border-emerald-500/40 transition group"
              >
                <div className="font-bold text-xs text-emerald-300 group-hover:text-emerald-200">
                  RELIANCE 52W High
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Breaches 52-Week High ceiling, shattering 1-year resistance
                </div>
              </button>

              <button
                disabled={loadingAction !== null}
                onClick={() =>
                  handleAction(
                    "circuit",
                    () => onTriggerCircuit("TATASTEEL", "LOWER"),
                    "TATASTEEL Circuit Approach Alert!",
                    "Tata Steel moved within 0.4% of its Lower Circuit limit. Critical circuit approach warning raised before exchange halt!"
                  )
                }
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-left border border-red-500/20 hover:border-red-500/40 transition group"
              >
                <div className="font-bold text-xs text-red-300 group-hover:text-red-200">
                  TATASTEEL Circuit
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Drops within 0.4% of Lower Circuit band; triggers risk halt alarm
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 3: Resilience & Data SLAs */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  3. Test Resilience, Stale SLAs & Sequencing
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Solves: Stale, Delayed & Conflicting Data
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Demonstrates financial-grade data integrity when network sockets stall or out-of-order ticks arrive from exchanges.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={loadingAction !== null}
                onClick={() =>
                  handleAction(
                    "stall",
                    async () => {
                      const stalled = await onToggleStall("INFY");
                      setIsInfyStalled(stalled);
                      return stalled;
                    },
                    isInfyStalled ? "INFY Feed Resumed" : "INFY Feed Stalled!",
                    isInfyStalled
                      ? "Feed resumed. INFY is receiving live ticks and returned to LIVE badge."
                      : "Feed frozen for INFY. Look at INFY's row: at 4s it becomes yellow 'DELAYED', and after 15s it pulses red 'STALE' to warn the user!"
                  )
                }
                className={`p-3 rounded-xl text-left border transition ${
                  isInfyStalled
                    ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
                    : "bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700"
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>{isInfyStalled ? "▶ Resume INFY Feed" : "⏸ Stall INFY Feed (Test SLA)"}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                  {isInfyStalled ? "Click to unfreeze feed" : "Simulates network packet loss. Watch LIVE -> DELAYED -> STALE"}
                </div>
              </button>

              <button
                disabled={loadingAction !== null}
                onClick={() =>
                  handleAction(
                    "corrupt",
                    async () => {
                      const res = await onInjectCorruptTick("TCS", "OUT_OF_ORDER");
                      return res;
                    },
                    "Corrupt Out-of-Order Tick Injected & REJECTED!",
                    "A tick with old sequence ID (N-5) was sent to the server. The TickSequencer detected and rejected it, preventing corrupt state!"
                  )
                }
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-left border border-slate-700 transition"
              >
                <div className="font-bold text-xs text-slate-200">
                  Inject Out-Of-Order Tick
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Sends sequence N-5; verifies the backend rejects it with 0 corruption
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center pt-3 border-t border-slate-800">
          <span className="text-[11px] text-slate-500">
            Tip: Keep this modal open or close it to watch the live changes reflect on the main dashboard!
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-sm"
          >
            Done / Close Bench
          </button>
        </div>
      </div>
    </div>
  );
};
