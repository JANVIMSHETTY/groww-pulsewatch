# PulseWatch: The Smart Market Urgency Watchlist
### Built for Groww CODE 2026 Engineering Build Challenge

[![Tests](https://img.shields.io/badge/Tests-13%2F13%20Passed-00D09C?style=for-the-badge)](https://github.com/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20Event--Driven-5367FF?style=for-the-badge)](https://github.com/)
[![License](https://img.shields.io/badge/Fintech-SLA%20Verified-EB5B3C?style=for-the-badge)](https://github.com/)

---

## 100-Word Product Pitch

> Most stock watchlists are noisy spreadsheets of green and red numbers that force investors to guess what matters. **PulseWatch** re-engineers the watchlist into an active market urgency engine. Instead of passive prices, PulseWatch computes a real-time **Attention Score (0–100)** driven by institutional volume anomalies (≥2.5x 20D volume), 52-week breakouts, circuit band proximity, and flash momentum. When users return, our **"While You Were Away"** delta engine highlights the exact macro shifts that occurred during their absence. Backed by strict monotonic tick sequencing, multi-exchange (NSE/BSE) reconciliation, and freshness SLAs, PulseWatch surfaces signal over noise.

---

## Why PulseWatch? The Engineering Philosophy

When Groww asked: *"Don't build the obvious watchlist. Build the version you believe should exist — and be ready to explain why"*, we analyzed the cognitive bottleneck of modern retail investing:
1. **Raw Percentage Change is Noise:** A stock moving +2.1% on thin liquidity is irrelevant noise. A stock moving +1.8% on 3.5x average volume or breaking a 1-year resistance ceiling is an institutional catalyst.
2. **Session Blindness:** When an investor closes the app at 11:00 AM and returns at 2:30 PM, they shouldn't have to manually inspect 20 intraday charts to figure out what happened in between.
3. **Data Integrity Failure in Volatile Markets:** In real Indian exchanges (NSE/BSE), WebSocket packets arrive out of order, clock drift happens, and internet connections stall. Without strict sequencing and freshness SLAs, users make irreversible financial decisions on stale quotes.

---

## Core Engineering Pillars

### 1. The Meaningful Change Engine
We mathematically quantify market changes beyond arbitrary thresholds:
* **Volume Anomaly Ratio ($V_R$):**
  $$V_R = \frac{\text{Current Cumulative Volume}}{\text{Baseline 20D Volume} \times (\text{Session Elapsed Fraction})}$$
  If $V_R \ge 2.2\times$, it triggers a `VOLUME_SURGE` alert, flagging block deals or abnormal institutional order flow.
* **Key Technical Level Violations:**
  Breach of 52-week High/Low triggers `BREAKOUT_52W_HIGH` or `BREAKOUT_52W_LOW`.
* **Circuit Breaker Band Proximity:**
  If LTP is within $\le 1.2\%$ of Upper or Lower 10% circuit limits, it triggers `CIRCUIT_APPROACH` before exchange trading freeze occurs.
* **Rate of Change (RoC) Velocity:**
  Tracks a rolling 5-minute price buffer; a $\ge 1.8\%$ move in $<5$ minutes triggers `RAPID_ROC_ACCELERATION`.

### 2. The Dynamic Attention Score (0 – 100)
Rather than forcing users to sort alphabetically or by percentage, the Attention Engine ranks securities by combined urgency:

$$\text{Attention Score} = S_{\text{vol}} (0-30) + S_{\text{velocity}} (0-30) + S_{\text{breakout}} (0-25) + S_{\text{circuit}} (0-15)$$

Every score is 100% transparent and explainable in the UI, breaking down each sub-component so the user understands *why* a stock bubbled to the top.

### 3. "While You Were Away" Session Delta Engine
* User state tracks persistent device sessions and `lastViewedAt` timestamps.
* On session resumption, the backend queries historical snapshots closest to $T_{\text{lastSeen}}$ and calculates exact price/volume deltas and logged events across the interval.
* Users can acknowledge and mark caught up, or use the **Judge Test Bench** to simulate leaving for 30 minutes, 2 hours, or 1 day.

### 4. Fintech Resilience & Freshness SLAs
* **Monotonic Tick Sequencing:** Exchange ticks carry monotonic `sequenceId`. The `TickSequencer` rejects out-of-order ticks ($N \le N_{\text{last}}$) and checks clock skew ($>30\text{s}$ future skew rejection).
* **Multi-Exchange (NSE vs BSE) Reconciliation:** Tracks quotes across both exchanges; detects cross-exchange arbitrage discrepancies ($\ge 0.4\%$ spread) and deterministically selects the primary liquidity exchange.
* **Data Freshness SLA Badges:**
  - `LIVE` (Green pulse): Latency $< 4000\text{ms}$.
  - `DELAYED` (Amber warning): Latency $4\text{s} - 15\text{s}$.
  - `STALE` (Red alert): Latency $> 15\text{s}$ (no ticks received; alerts user of potential feed freeze).

---

## Architectural Decisions & Trade-Offs

| Decision | Alternative Considered | Why We Chose It (The Engineering Trade-off) |
| :--- | :--- | :--- |
| **Node.js / Fastify + TypeScript** | Express.js / Python Flask | Fastify offers ~3x the throughput of Express, built-in schema validation, and native async/WebSocket integration for high-frequency market updates. |
| **In-Memory Quote Store + SQLite WAL Mode (Prisma)** | Heavy PostgreSQL + Redis cluster | For 10-hour execution and deterministic zero-dependency local judge evaluation, SQLite WAL mode with Prisma provides full ACID transactions and snapshot diffing without forcing judges to configure external DB daemons. Upgrading to Postgres requires changing only 1 line in `schema.prisma`. |
| **Throttled WebSocket Broadcast (1000ms)** | Raw Tick Fanout per microsecond | Emitting 500 ticks/sec to a browser causes JavaScript main thread starvation and UI stutter. Throttling state diffs to 1-second intervals provides smooth 60fps rendering while preserving zero data loss in the backend sequence book. |
| **Dynamic Attention Ranking** | Static Sorting by Gainers/Losers | A stock up +0.5% with 4x volume breaking 52W high is vastly more critical than a penny stock up +3% on 2 trades. Urgency ranking saves user capital. |

---

## System Architecture Diagram

```
                       +-----------------------------------+
                       |    Simulated Market Feed Engine   |
                       |  - Multi-exchange (NSE & BSE)     |
                       |  - Realistic Geometric Drift      |
                       |  - Controllable Anomaly Injections|
                       +-----------------+-----------------+
                                         | Raw Ticks
                                         v
                       +-----------------------------------+
                       |      PulseWatch Core Backend      |
                       |  -------------------------------  |
                       |  1. TickSequencer (SLA & Order)   |
                       |  2. ConflictResolver (NSE vs BSE) |
                       |  3. MeaningfulChangeDetector      |
                       |  4. AttentionScorer (0 - 100)     |
                       |  5. Session Catch-Up Delta Engine |
                       +-----------------+-----------------+
                                         |
                        +----------------+----------------+
                        |                                 |
                        v                                 v
               +-----------------+              +-----------------+
               |  SQLite / WAL   |              | WebSockets / SSE|
               |  - User sessions|              | - Real-time push|
               |  - Watchlists   |              | - Throttled diff|
               |  - Snapshots    |              +--------+--------+
               +-----------------+                       |
                                                         v
                                       +-----------------------------------+
                                       |       Groww-Themed Frontend       |
                                       |    (React 19 + Vite + Tailwind)   |
                                       |  - "While You Were Away" Digest   |
                                       |  - Attention Priority Table       |
                                       |  - SLA Freshness Status Badges    |
                                       |  - Judge Interactive Test Bench   |
                                       +-----------------------------------+
```

---

## Quick Start (Run Locally in 60 Seconds)

### Prerequisites
* Node.js v18+ (Node v22 recommended)
* npm

### 1. Clone and Install
```bash
git clone <repo-url>
cd groww
```

### 2. Setup Backend
```bash
cd backend
npm install
npx prisma db push
npx tsx src/db/seed.ts
npm run start
```
*Backend runs on `http://localhost:4000` with WebSocket at `ws://localhost:4000/ws/market`.*

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## Automated Test Verification

All domain engines have 100% unit test coverage using Vitest:
```bash
cd backend
npm run test
```
**Test Results (13/13 Passing):**
* `tickSequencer.test.ts`: Monotonic sequence ordering, out-of-order tick rejection, duplicate rejection, clock skew rejection, SLA latency calculation.
* `conflictResolver.test.ts`: Single-feed pass-through, multi-exchange liquidity matching, arbitrage spread detection.
* `changeDetector.test.ts`: Volume surge detection, 52W high breakout, circuit proximity alerting.
* `attentionScorer.test.ts`: Urgency ranking formula validation.

---

## Docker Deployment (Single Command)

```bash
docker-compose up --build
```
*Frontend will be accessible at `http://localhost:3000` and backend at `http://localhost:4000`.*

---

## How Judges Can Evaluate the Build (Interactive Test Bench)

Click the **"Judge Test Bench"** button in the top navigation bar of the web app to test all edge cases live:

1. **Test Session Persistence ("While You Were Away"):**
   - Click **"Away for 2 Hours"** or **"Away for 1 Day"**.
   - The UI immediately surfaces the **"While You Were Away"** digest banner, highlighting what changed in the market between your last check and now.
   - Click **"Mark as Caught Up"** to record your new session baseline.
2. **Test Real-Time Attention Re-ranking:**
   - Click **"ZOMATO Volume Surge"**: Injects a 2.5 Crore share block trade. Watch Zomato's attention score jump to >85 and bubble to the top of the table in real time with an amber/red volume badge.
   - Click **"RELIANCE 52W High"**: Breaches the 52W high level (₹3,217.90), triggering the `BREAKOUT_52W_HIGH` badge.
   - Click **"TATASTEEL Circuit"**: Pushes price within 0.4% of the lower circuit band, triggering an immediate critical circuit warning.
3. **Test Data Freshness SLAs & Sequencer Defense:**
   - Click **"Stall INFY Feed"**: Freezes ticks for Infosys. Watch the SLA badge transition from green `LIVE` to yellow `DELAYED` (at 4s), and to pulsing red `STALE` (at 15s).
   - Click **"Inject Out-Of-Order Tick"**: Injects tick with sequence $N-5$. The backend `TickSequencer` blocks and rejects it, protecting the order book from corruption.

---

## Defense & FAQ (Groww Engineering Questions)

**Q: How would this scale to 10 million concurrent users and 5,000 instruments?**
> **A:** Currently, quotes are maintained in an in-memory O(1) state hash on the server. At 10M users:
> 1. **Exchange Ingestion Cluster:** Dedicated Go or Rust microservices consume raw multicast exchange feeds (NSE NOW/NEAT) and publish clean ticks into an Apache Kafka topic partitioned by `symbol`.
> 2. **Stream Processing (Flink / In-Memory Aggregator):** Apache Flink evaluates sliding window metrics (20D volume multiples, RoC velocity) and publishes enriched quotes to a Redis Cluster.
> 3. **WebSocket Fan-Out Layer:** Stateless Node.js / Go WebSocket gateway nodes subscribe to Redis Pub/Sub channels for active symbols. Because users share watchlists of the same ~5,000 liquid stocks, we fan out updates using symbol channel subscriptions rather than calculating deltas per user.
> 4. **Session Catch-Up on Demand:** When an inactive user opens the app, the catch-up digest is computed *on-demand* by querying time-series snapshots (TimescaleDB / ClickHouse) for their ~20 watched stocks, requiring zero background CPU when the user is offline.

**Q: How do you handle network disconnections on mobile devices?**
> **A:** The frontend includes an automatic exponential backoff reconnection loop. While disconnected, the UI displays a warning banner and freezes stale prices rather than showing outdated quotes as live. Upon reconnection, the client sends a session sync request to receive the catch-up delta for the disconnection window.

---

*Engineered with precision for Groww CODE 2026.*
