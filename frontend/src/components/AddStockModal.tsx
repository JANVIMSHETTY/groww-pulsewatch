import React, { useState, useEffect } from "react";
import { X, Search, Plus, Check } from "lucide-react";
import { formatINR } from "../utils/formatters.js";

interface InstrumentItem {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  previousClose: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddStock: (symbol: string) => Promise<void>;
  existingSymbols: string[];
}

export const AddStockModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddStock,
  existingSymbols,
}) => {
  const [instruments, setInstruments] = useState<InstrumentItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/market/instruments")
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setInstruments(d.instruments);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = instruments.filter(
    (i) =>
      i.symbol.toLowerCase().includes(query.toLowerCase()) ||
      i.name.toLowerCase().includes(query.toLowerCase()) ||
      i.sector.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#141620] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Add Stock to Watchlist</h3>
        <p className="text-xs text-slate-400 mb-4">Search Indian equities across NSE and BSE</p>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search e.g. RELIANCE, TCS, ZOMATO..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* List */}
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {filtered.map((item) => {
            const isAlreadyAdded = existingSymbols.includes(item.symbol);
            return (
              <div
                key={item.symbol}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs">{item.symbol}</span>
                    <span className="text-[10px] text-slate-400">{item.exchange}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{item.name}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-300">
                    {formatINR(item.previousClose)}
                  </span>
                  <button
                    disabled={isAlreadyAdded || loading}
                    onClick={async () => {
                      setLoading(true);
                      await onAddStock(item.symbol);
                      setLoading(false);
                    }}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                      isAlreadyAdded
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                    }`}
                  >
                    {isAlreadyAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
