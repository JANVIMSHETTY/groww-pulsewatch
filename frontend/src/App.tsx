import { useState, useEffect, useCallback } from "react";
import { useMarketFeed } from "./hooks/useMarketFeed.js";
import { Navbar } from "./components/Navbar.js";
import { CatchUpDigest } from "./components/CatchUpDigest.js";
import { WatchlistTable } from "./components/WatchlistTable.js";
import { StockDetailModal } from "./components/StockDetailModal.js";
import { TimeTravelModal } from "./components/TimeTravelModal.js";
import { AddStockModal } from "./components/AddStockModal.js";
import { ProcessedQuote, SessionCatchUpDigest, Watchlist } from "./types/market.js";

export function App() {
  const { quotes: streamQuotes, connectionStatus } = useMarketFeed();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string | null>(null);
  const [digest, setDigest] = useState<SessionCatchUpDigest | null>(null);

  // Modal states
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);
  const [isTimeTravelOpen, setIsTimeTravelOpen] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);

  // Fetch Watchlists
  const fetchWatchlists = useCallback(async () => {
    try {
      const res = await fetch("/api/watchlists");
      const data = await res.json();
      if (data.success && data.watchlists.length > 0) {
        setWatchlists(data.watchlists);
        if (!activeWatchlistId) {
          const defaultWl = data.watchlists.find((w: any) => w.isDefault) || data.watchlists[0];
          setActiveWatchlistId(defaultWl.id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch watchlists:", e);
    }
  }, [activeWatchlistId]);

  // Fetch Catch-Up Digest
  const fetchCatchUpDigest = useCallback(async () => {
    try {
      const res = await fetch("/api/session/catchup");
      const data = await res.json();
      if (data.success) {
        setDigest(data.digest);
      }
    } catch (e) {
      console.error("Failed to fetch catchup digest:", e);
    }
  }, []);

  useEffect(() => {
    fetchWatchlists();
    fetchCatchUpDigest();
  }, [fetchWatchlists, fetchCatchUpDigest]);

  // Merge live stream quotes with active watchlist items
  const activeWatchlist = watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0];
  const watchedSymbols = activeWatchlist ? activeWatchlist.items.map((i) => i.symbol) : [];

  const displayQuotes: ProcessedQuote[] = streamQuotes.filter((q) =>
    watchedSymbols.includes(q.symbol)
  );

  const selectedQuote = streamQuotes.find((q) => q.symbol === selectedStockSymbol) || null;

  // Catch-Up Acknowledge Handler
  const handleAcknowledgeCatchUp = async () => {
    try {
      const res = await fetch("/api/session/catchup/acknowledge", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchCatchUpDigest();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Stock Handler
  const handleAddStock = async (symbol: string) => {
    if (!activeWatchlistId) return;
    try {
      await fetch(`/api/watchlists/${activeWatchlistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      await fetchWatchlists();
      await fetchCatchUpDigest();
    } catch (e) {
      console.error(e);
    }
  };

  // Remove Stock Handler
  const handleRemoveStock = async (symbol: string) => {
    if (!activeWatchlistId) return;
    try {
      await fetch(`/api/watchlists/${activeWatchlistId}/items/${symbol}`, {
        method: "DELETE",
      });
      await fetchWatchlists();
      await fetchCatchUpDigest();
    } catch (e) {
      console.error(e);
    }
  };

  // Simulator Callbacks
  const handleSimulateAbsence = async (minutes: number) => {
    const res = await fetch("/api/session/time-travel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutesAway: minutes }),
    });
    const data = await res.json();
    if (data.success) {
      setDigest(data.digest);
    }
    return data;
  };

  const handleTriggerSurge = async (symbol: string) => {
    const res = await fetch("/api/market/simulate/surge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    });
    return res.json();
  };

  const handleTriggerBreakout = async (symbol: string) => {
    const res = await fetch("/api/market/simulate/breakout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    });
    return res.json();
  };

  const handleTriggerCircuit = async (symbol: string, side: "UPPER" | "LOWER") => {
    const res = await fetch("/api/market/simulate/circuit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, side }),
    });
    return res.json();
  };

  const handleToggleStall = async (symbol: string) => {
    const res = await fetch("/api/market/simulate/stall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    });
    const data = await res.json();
    return data.isStalled;
  };

  const handleInjectCorruptTick = async (symbol: string, type: "OUT_OF_ORDER" | "CLOCK_SKEW") => {
    const res = await fetch("/api/market/simulate/corrupt-tick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, type }),
    });
    return res.json();
  };

  return (
    <div className="min-h-screen bg-[#0F1015] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        connectionStatus={connectionStatus}
        lastViewedAt={digest?.lastViewedAt || null}
        onOpenTimeTravel={() => setIsTimeTravelOpen(true)}
        onRefreshCatchUp={fetchCatchUpDigest}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* While You Were Away Digest Banner */}
        <CatchUpDigest
          digest={digest}
          onAcknowledge={handleAcknowledgeCatchUp}
          onSelectStock={(sym) => setSelectedStockSymbol(sym)}
        />

        {/* Watchlist Table */}
        <WatchlistTable
          quotes={displayQuotes.length > 0 ? displayQuotes : streamQuotes}
          onSelectStock={(sym) => setSelectedStockSymbol(sym)}
          onOpenAddStock={() => setIsAddStockOpen(true)}
          onRemoveStock={handleRemoveStock}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        Groww CODE 2026 Engineering Build â€¢ PulseWatch Smart Market Watchlist Architecture
      </footer>

      {/* Modals */}
      <StockDetailModal
        quote={selectedQuote}
        onClose={() => setSelectedStockSymbol(null)}
      />

      <TimeTravelModal
        isOpen={isTimeTravelOpen}
        onClose={() => setIsTimeTravelOpen(false)}
        onSimulateAbsence={handleSimulateAbsence}
        onTriggerSurge={handleTriggerSurge}
        onTriggerBreakout={handleTriggerBreakout}
        onTriggerCircuit={handleTriggerCircuit}
        onToggleStall={handleToggleStall}
        onInjectCorruptTick={handleInjectCorruptTick}
      />

      <AddStockModal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        onAddStock={handleAddStock}
        existingSymbols={watchedSymbols}
      />
    </div>
  );
}

export default App;
