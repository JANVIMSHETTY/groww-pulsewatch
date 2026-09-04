import { useState, useEffect, useCallback } from "react";
import { useMarketFeed } from "./hooks/useMarketFeed.js";
import { Navbar, UserProfile } from "./components/Navbar.js";
import { CatchUpDigest } from "./components/CatchUpDigest.js";
import { WatchlistTable } from "./components/WatchlistTable.js";
import { StockDetailModal } from "./components/StockDetailModal.js";
import { TimeTravelModal } from "./components/TimeTravelModal.js";
import { AddStockModal } from "./components/AddStockModal.js";
import { ProcessedQuote, SessionCatchUpDigest, Watchlist } from "./types/market.js";

export function App() {
  const { quotes: streamQuotes, connectionStatus } = useMarketFeed();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>("usr_groww_001");
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string | null>(null);
  const [digest, setDigest] = useState<SessionCatchUpDigest | null>(null);

  // Modal states
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);
  const [isTimeTravelOpen, setIsTimeTravelOpen] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/session/users");
      const data = await res.json();
      if (data.success && data.users.length > 0) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error("Failed to fetch users:", e);
    }
  }, []);

  // Fetch Watchlists for Active User
  const fetchWatchlists = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/watchlists?userId=${userId}`);
      const data = await res.json();
      if (data.success && data.watchlists.length > 0) {
        setWatchlists(data.watchlists);
        const defaultWl = data.watchlists.find((w: any) => w.isDefault) || data.watchlists[0];
        setActiveWatchlistId(defaultWl.id);
      }
    } catch (e) {
      console.error("Failed to fetch watchlists:", e);
    }
  }, []);

  // Fetch Catch-Up Digest for Active User
  const fetchCatchUpDigest = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/session/catchup?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setDigest(data.digest);
      }
    } catch (e) {
      console.error("Failed to fetch catchup digest:", e);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (activeUserId) {
      fetchWatchlists(activeUserId);
      fetchCatchUpDigest(activeUserId);
    }
  }, [activeUserId, fetchWatchlists, fetchCatchUpDigest]);

  // User Switcher Handler
  const handleSwitchUser = (userId: string) => {
    setActiveUserId(userId);
  };

  // Create User Handler
  const handleCreateUser = async (name: string, email: string) => {
    try {
      const res = await fetch("/api/session/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchUsers();
        setActiveUserId(data.user.id);
      }
    } catch (e) {
      console.error("Error creating user:", e);
    }
  };

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
      const res = await fetch("/api/session/catchup/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUserId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCatchUpDigest(activeUserId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Stock Handler (supports custom stocks!)
  const handleAddStock = async (symbol: string, customName?: string, customPrice?: number) => {
    if (!activeWatchlistId) return;
    try {
      await fetch(`/api/watchlists/${activeWatchlistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, customName, customPrice }),
      });
      await fetchWatchlists(activeUserId);
      await fetchCatchUpDigest(activeUserId);
      await fetchUsers();
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
      await fetchWatchlists(activeUserId);
      await fetchCatchUpDigest(activeUserId);
      await fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  // Simulator Callbacks
  const handleSimulateAbsence = async (minutes: number) => {
    const res = await fetch("/api/session/time-travel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutesAway: minutes, userId: activeUserId }),
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
      {/* Top Navbar with Multi-User Switcher */}
      <Navbar
        connectionStatus={connectionStatus}
        users={users}
        activeUserId={activeUserId}
        onSwitchUser={handleSwitchUser}
        onOpenTimeTravel={() => setIsTimeTravelOpen(true)}
        onCreateUser={handleCreateUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* While You Were Away Digest Banner */}
        <CatchUpDigest
          digest={digest}
          streamQuotes={streamQuotes}
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
        Groww CODE 2026 Engineering Build â€¢ PulseWatch Smart Market Watchlist Architecture â€¢ Multi-User Persistent Session Engine
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
