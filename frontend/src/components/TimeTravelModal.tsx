import React, { useState } from "react";
import { X, Clock, Flame, ShieldAlert, CheckCircle2 } from "lucide-react";

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInfyStalled, setIsInfyStalled] = useState(false);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAction = async (name: string, fn: () => Promise<any>) => {
    try {
      setLoadingAction(name);
      const res = await fn();
      if (typeof res === "string") showToast(res);
      else if (res && res.message) showToast(res.message);
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#141620] border border-emerald-500/30 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="text-xl font-bold text-white tracking-tight">Judge Test Bench & Scenario Controls</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Interactively test session persistence, data staleness SLAs, and anomaly detection algorithms.
        </p>

        {toastMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                1. Test "While You Were Away" Session Catch-Up
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Sets your session timestamp back in time to simulate logging in after hours of absence.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={loadingAction !== null}
                onClick={() => handleAction("30m", () => onSimulateAbsence(30))}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                Away for 30m
              </button>
              <button
                disabled={loadingAction !== null}
                onClick={() => handleAction("2h", () => onSimulateAbsence(120))}
                className="px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-semibold text-emerald-300 border border-emerald-500/30 transition"
              >
                Away for 2 Hours
              </button>
              <button
                disabled={loadingAction !== null}
                onClick={() => handleAction("1d", () => onSimulateAbsence(1440))}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                Away for 1 Day
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                2. Trigger Real-Time Market Anomalies
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Forces real-time algorithmic triggers to test attention score re-ranking.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                disabled={loadingAction !== null}
                onClick={() => handleAction("surge", () => onTriggerSurge("ZOMATO"))}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-amber-300 border border-amber-500/20 transition flex flex-col items-center text-center"
              >
                <span className="font-bold">ZOMATO Volume Surge</span>
                <span className="text-[9px] text-slate-400">Injects 2.5 Cr block trade</span>
              </button>

              <button
                disabled={loadingAction !== null}
                onClick={() => handleAction("breakout", () => onTriggerBreakout("RELIANCE"))}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-emerald-300 border border-emerald-500/20 transition flex flex-col items-center text-center"
              >
                <span className="font-bold">RELIANCE 52W High</span>
                <span className="text-[9px] text-slate-400">Breaches ₹3,217.90 level</span>
              </button>

              <button
                disabled={loadingAction !== null}
                onClick={() => handleAction("circuit", () => onTriggerCircuit("TATASTEEL", "LOWER"))}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-red-300 border border-red-500/20 transition flex flex-col items-center text-center"
              >
                <span className="font-bold">TATASTEEL Circuit</span>
                <span className="text-[9px] text-slate-400">Pushes within 0.4% lower band</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                3. Test Resilience, Stale SLAs & Sequencing
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Demonstrates data integrity defenses against dropped sockets and jitter.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={loadingAction !== null}
                onClick={() =>
                  handleAction("stall", async () => {
                    const stalled = await onToggleStall("INFY");
                    setIsInfyStalled(stalled);
                    return stalled ? "INFY feed stalled. Watch badge turn DELAYED then STALE." : "INFY feed resumed.";
                  })
                }
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                  isInfyStalled
                    ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                }`}
              >
                {isInfyStalled ? "Resume INFY Feed" : "Stall INFY Feed (Test SLA)"}
              </button>

              <button
                disabled={loadingAction !== null}
                onClick={() =>
                  handleAction("corrupt", async () => {
                    const res = await onInjectCorruptTick("TCS", "OUT_OF_ORDER");
                    return res.message;
                  })
                }
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                Inject Out-Of-Order Tick
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Bench
          </button>
        </div>
      </div>
    </div>
  );
};
