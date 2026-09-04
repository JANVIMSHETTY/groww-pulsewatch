# PulseWatch Backend Engine

The core market data ingestion, sequencing, and algorithmic urgency engine for Groww PulseWatch.

## Architecture

* **Fastify (Node.js + TypeScript)**: High-throughput async web and WebSocket server.
* **Prisma + SQLite (WAL Mode)**: Relational model for Users, Watchlists, Instruments, and Tick Snapshots. Easily upgradeable to PostgreSQL.
* **WebSocket Stream (`/ws/market`)**: Real-time tick broadcast throttled to 1000ms snapshots to prevent browser render starvation.

## Core Modules

* `src/engine/tickSequencer.ts`: Enforces sequence monotonicity ($N > N_{\text{last}}$), clock skew validation, and data freshness SLA classification (`LIVE` <4s, `DELAYED` 4-15s, `STALE` >15s).
* `src/engine/conflictResolver.ts`: Multi-exchange (NSE vs BSE) liquidity matching and arbitrage spread detection.
* `src/engine/changeDetector.ts`: Algorithmic threshold detection for Volume Anomalies ($\ge 2.2\times$), 52W High/Low breakouts, Circuit limit proximity ($\le 1.2\%$), and 5-min Rate of Change (RoC) flash velocity.
* `src/engine/attentionScorer.ts`: 0–100 urgency score ranking formula.
* `src/engine/marketSimulator.ts`: High-frequency market simulator modeled after NSE/BSE microstructure with controllable anomaly scenarios.
* `src/services/sessionService.ts`: "While You Were Away" catch-up delta generator.

## Commands

```bash
# Install dependencies
npm install

# Push Prisma schema to SQLite
npx prisma db push

# Seed 20 Indian instruments and 3 user profiles
npm run prisma:seed

# Run automated Vitest test suite
npm run test

# Run development server with hot-reload
npm run dev

# Build and start production server
npm run build
npm run start
```
