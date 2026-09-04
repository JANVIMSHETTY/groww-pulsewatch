import React, { useState, useEffect } from "react";
import { X, Search, Plus, Check, Sparkles } from "lucide-react";
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
  onAddStock: (symbol: string, customName?: string, customPrice?: number) => Promise<void>;
  existingSymbols: string[];
}

export const AddStockModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddStock,
  existingSymbols,
}) => {
  const [activeTab, setActiveTab] = useState<"CATALOG" | "CUSTOM">("CATALOG");
  const [instruments, setInstruments] = useState<InstrumentItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Custom stock form
  const [customSymbol, setCustomSymbol] = useState("");
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");

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

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSymbol) return;
    setLoading(true);
    const price = customPrice ? parseFloat(customPrice) : undefined;
    await onAddStock(customSymbol.toUpperCase().trim(), customName.trim() || undefined, price);
    setCustomSymbol("");
    setCustomName("");
    setCustomPrice("");
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#141620] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Add Stock to Watchlist</h3>
        <p className="text-xs text-slate-400 mb-4">Choose from 20+ master equities or register any custom stock symbol</p>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("CATALOG")}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === "CATALOG"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Indian Master Catalog ({instruments.length} Stocks)
          </button>
          <button
            onClick={() => setActiveTab("CUSTOM")}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "CUSTOM"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Add Custom Symbol</span>
          </button>
        </div>

        {activeTab === "CATALOG" ? (
          <>
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by ticker, name, or sector (e.g. SBIN, ITC, IT, Auto)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
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
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {item.sector}
                        </span>
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
          </>
        ) : (
          /* Custom Stock Form */
          <form onSubmit={handleCustomSubmit} className="space-y-3.5 py-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Stock Ticker Symbol <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. PAYTM, JIOFIN, IRFC, HAL"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Company Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Jio Financial Services Ltd"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Initial Baseline Price (₹) (Optional)
              </label>
              <input
                type="number"
                step="0.05"
                placeholder="e.g. 340.50 (randomized if empty)"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <p className="text-[10px] text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              💡 PulseWatch will automatically compute 52-week high/low bands, standard 10% exchange circuits, and 20-day volume baseline, then start broadcasting real-time streaming ticks for your custom stock immediately!
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !customSymbol}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add & Start Live Streaming"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
