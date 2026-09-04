export function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatVolume(volume: number): string {
  if (volume >= 10000000) {
    return `${(volume / 10000000).toFixed(2)} Cr`;
  }
  if (volume >= 100000) {
    return `${(volume / 100000).toFixed(2)} L`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)} K`;
  }
  return volume.toLocaleString("en-IN");
}

export function formatPercent(val: number): string {
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(2)}%`;
}

export function getAttentionColor(score: number): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  if (score >= 70) {
    return {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/30",
      badge: "bg-red-500 text-white",
    };
  }
  if (score >= 45) {
    return {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
      badge: "bg-amber-500 text-slate-900",
    };
  }
  return {
    bg: "bg-slate-800/40",
    text: "text-slate-400",
    border: "border-slate-800",
    badge: "bg-slate-700 text-slate-300",
  };
}

export function formatMinutesAgo(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  if (hours < 24) return remMin > 0 ? `${hours}h ${remMin}m ago` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
