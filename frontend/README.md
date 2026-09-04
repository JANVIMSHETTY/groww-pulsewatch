# PulseWatch Frontend Dashboard

The Groww-themed market dashboard and real-time urgency monitoring interface.

## Tech Stack

* **React 19 + TypeScript**: Modern React architecture.
* **Vite 6**: Instant HMR and optimized production bundling.
* **Tailwind CSS**: Groww dark/light palette (`#00D09C` emerald green accent, slate backgrounds).
* **Lucide React**: Financial and status iconography.

## Key UI Components

* `CatchUpDigest.tsx`: The hero "While You Were Away" timeline summarizing macro movements since user was last active.
* `WatchlistTable.tsx`: Attention-ranked stock table with volume multiples, 52W status badges, and SLA freshness pills (`LIVE`, `DELAYED`, `STALE`).
* `Navbar.tsx`: Features live WebSocket connection indicator and multi-user profile switcher (Riya, Aarav, Priya, or custom).
* `StockDetailModal.tsx`: Comprehensive deep-dive inspector showing mathematical attention score breakdown, day & 52-week progress bars, and exchange risk bands.
* `TimeTravelModal.tsx`: The interactive **Judge Test Bench** for evaluating time travel, volume surges, breakouts, circuit approach, feed stalls, and out-of-order tick rejection.
* `AddStockModal.tsx`: Add from 20+ master equities or register any custom stock ticker.

## Commands

```bash
# Install dependencies
npm install

# Run Vite dev server (runs on port 3000, proxies /api and /ws to port 4000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
