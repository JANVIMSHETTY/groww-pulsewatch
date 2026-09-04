import { RawTick, Exchange } from "../types/market.js";

export interface SimulatedStockState {
  symbol: string;
  exchange: Exchange;
  currentPrice: number;
  cumulativeVolume: number;
  sequenceId: number;
  isStalled: boolean; // Simulates network feed outage
  forcedSurge: boolean;
}

export class MarketSimulator {
  private stocks = new Map<string, SimulatedStockState>();
  private tickInterval: NodeJS.Timeout | null = null;
  private onTickCallback: ((tick: RawTick) => void) | null = null;

  public initialize(initialStocks: { symbol: string; initialPrice: number; baselineVolume: number }[]) {
    for (const stock of initialStocks) {
      this.stocks.set(stock.symbol, {
        symbol: stock.symbol,
        exchange: "NSE",
        currentPrice: stock.initialPrice,
        cumulativeVolume: Math.floor(stock.baselineVolume * 0.45), // ~45% elapsed day volume
        sequenceId: 1000,
        isStalled: false,
        forcedSurge: false,
      });
    }
  }

  public startStreaming(intervalMs: number = 800, onTick: (tick: RawTick) => void) {
    this.onTickCallback = onTick;
    if (this.tickInterval) clearInterval(this.tickInterval);

    this.tickInterval = setInterval(() => {
      this.generateTickBatch();
    }, intervalMs);
  }

  public stopStreaming() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  private generateTickBatch() {
    if (!this.onTickCallback) return;

    for (const [symbol, state] of this.stocks.entries()) {
      if (state.isStalled) continue; // Feed freeze simulation

      // 80% chance of a tick per interval to simulate natural arrival rate
      if (Math.random() > 0.8) continue;

      state.sequenceId += 1;

      // Realistic price movement: -0.15% to +0.15%
      let pctMove = (Math.random() - 0.49) * 0.003;
      let volumeDelta = Math.floor(1000 + Math.random() * 8000);

      if (state.forcedSurge) {
        // High momentum scenario
        pctMove = 0.006 + Math.random() * 0.008; // strong up-move
        volumeDelta = Math.floor(150000 + Math.random() * 300000); // huge institutional volume
      }

      state.currentPrice = Number((state.currentPrice * (1 + pctMove)).toFixed(2));
      state.cumulativeVolume += volumeDelta;

      const tick: RawTick = {
        symbol: state.symbol,
        exchange: state.exchange,
        price: state.currentPrice,
        volume: state.cumulativeVolume,
        lastTradedQty: volumeDelta,
        timestamp: Date.now(),
        sequenceId: state.sequenceId,
      };

      this.onTickCallback(tick);

      // Occasionally generate a BSE counterpart tick to test conflict resolution
      if (Math.random() > 0.85) {
        const bseVariance = (Math.random() - 0.5) * 0.004; // small spread between exchanges
        const bseTick: RawTick = {
          symbol: state.symbol,
          exchange: "BSE",
          price: Number((state.currentPrice * (1 + bseVariance)).toFixed(2)),
          volume: Math.floor(state.cumulativeVolume * 0.25), // BSE typically has ~20-30% of NSE volume
          lastTradedQty: Math.floor(volumeDelta * 0.25),
          timestamp: Date.now() - Math.floor(Math.random() * 150),
          sequenceId: state.sequenceId,
        };
        this.onTickCallback(bseTick);
      }
    }
  }

  // Judge Scenario Controls
  public triggerVolumeSpike(symbol: string) {
    const stock = this.stocks.get(symbol.toUpperCase());
    if (stock) {
      stock.forcedSurge = true;
      stock.cumulativeVolume += 25000000; // instant massive block trade
      setTimeout(() => {
        if (stock) stock.forcedSurge = false;
      }, 15000); // 15 seconds surge
    }
  }

  public triggerBreakout(symbol: string, targetPrice: number) {
    const stock = this.stocks.get(symbol.toUpperCase());
    if (stock) {
      stock.currentPrice = targetPrice;
      stock.cumulativeVolume += 5000000;
    }
  }

  public triggerCircuitApproach(symbol: string, circuitPrice: number) {
    const stock = this.stocks.get(symbol.toUpperCase());
    if (stock) {
      // Set to 0.4% from circuit limit
      stock.currentPrice = Number((circuitPrice * 0.996).toFixed(2));
    }
  }

  public toggleStallFeed(symbol: string): boolean {
    const stock = this.stocks.get(symbol.toUpperCase());
    if (stock) {
      stock.isStalled = !stock.isStalled;
      return stock.isStalled;
    }
    return false;
  }

  public injectCorruptedTick(symbol: string, type: "OUT_OF_ORDER" | "CLOCK_SKEW"): RawTick | null {
    const stock = this.stocks.get(symbol.toUpperCase());
    if (!stock) return null;

    if (type === "OUT_OF_ORDER") {
      return {
        symbol: stock.symbol,
        exchange: stock.exchange,
        price: stock.currentPrice,
        volume: stock.cumulativeVolume,
        lastTradedQty: 500,
        timestamp: Date.now() - 10000,
        sequenceId: stock.sequenceId - 5, // Old sequence number
      };
    } else {
      return {
        symbol: stock.symbol,
        exchange: stock.exchange,
        price: stock.currentPrice,
        volume: stock.cumulativeVolume,
        lastTradedQty: 500,
        timestamp: Date.now() + 120000, // 2 minutes in future
        sequenceId: stock.sequenceId + 10,
      };
    }
  }

  public getStockState(symbol: string) {
    return this.stocks.get(symbol.toUpperCase());
  }
}
