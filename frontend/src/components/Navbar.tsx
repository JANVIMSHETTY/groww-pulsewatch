import React, { useState } from "react";
import { Activity, SlidersHorizontal, UserCheck, ChevronDown, PlusCircle } from "lucide-react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  activeDeviceId: string;
  lastViewedAt: string;
  defaultWatchlistName: string;
  itemCount: number;
}

interface Props {
  connectionStatus: "CONNECTED" | "CONNECTING" | "DISCONNECTED";
  users: UserProfile[];
  activeUserId: string;
  onSwitchUser: (userId: string) => void;
  onOpenTimeTravel: () => void;
  onCreateUser: (name: string, email: string) => Promise<void>;
}

export const Navbar: React.FC<Props> = ({
  connectionStatus,
  users,
  activeUserId,
  onSwitchUser,
  onOpenTimeTravel,
  onCreateUser,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");

  const activeUser = users.find((u) => u.id === activeUserId) || users[0];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    await onCreateUser(newUserName, newUserEmail);
    setNewUserName("");
    setNewUserEmail("");
    setIsCreatingUser(false);
    setIsDropdownOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-[#12131A]/95 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
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
          <p className="text-xs text-slate-400">Intelligent Market Urgency Engine • Live NSE Stream</p>
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
            {connectionStatus === "CONNECTED" ? "Live Feed (20 Stocks)" : connectionStatus}
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

        {/* Multi-User Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 pl-2 py-1 pr-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-emerald-500/20">
              {activeUser ? getInitials(activeUser.name) : "US"}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                {activeUser?.name || "Select User"}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {activeUser?.defaultWatchlistName} ({activeUser?.itemCount} stocks)
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* User Menu Popup */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#161822] border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn">
              <div className="px-2 py-1.5 border-b border-slate-800/80 mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Switch Active User Profile
                </span>
                <span className="text-[10px] text-slate-500">
                  Each user has their own watchlists, device session, and lastViewedAt timestamp.
                </span>
              </div>

              <div className="space-y-1 max-h-56 overflow-y-auto">
                {users.map((u) => {
                  const isSelected = u.id === activeUserId;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between ${
                        isSelected
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-white"
                          : "hover:bg-slate-800/60 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                          isSelected ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"
                        }`}>
                          {getInitials(u.name)}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{u.defaultWatchlistName} ({u.itemCount})</div>
                        </div>
                      </div>
                      {isSelected && <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Create User Form / Button */}
              <div className="mt-2 pt-2 border-t border-slate-800">
                {isCreatingUser ? (
                  <form onSubmit={handleCreateSubmit} className="p-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCreatingUser(false)}
                        className="px-2.5 py-1 rounded-md text-[11px] text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-md bg-emerald-500 text-slate-950 font-semibold text-[11px] hover:bg-emerald-400"
                      >
                        Create Profile
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsCreatingUser(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create New User Profile</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
