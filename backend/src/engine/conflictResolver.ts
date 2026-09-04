import { RawTick, Exchange } from "../types/market.js";

export interface ReconciliationResult {
  preferredTick: RawTick;
  alternativeTick?: RawTick;
  isConflictResolved: boolean;
  priceDiscrepancyPct: number;
  arbitrageFlag: boolean;
  reconciliationNotes: string;
}

export class MultiExchangeConflictResolver {
  // Store latest quote per exchange
  private exchangeBook = new Map<string, { NSE?: RawTick; BSE?: RawTick }>();

  public reconcile(incomingTick: RawTick): ReconciliationResult {
    const symbol = incomingTick.symbol.toUpperCase();
    let book = this.exchangeBook.get(symbol);
    if (!book) {
      book = {};
      this.exchangeBook.set(symbol, book);
    }

    // Update book with incoming
    book[incomingTick.exchange] = incomingTick;

    const nse = book.NSE;
    const bse = book.BSE;

    // Single feed present so far
    if (!nse || !bse) {
      return {
        preferredTick: incomingTick,
        isConflictResolved: false,
        priceDiscrepancyPct: 0,
        arbitrageFlag: false,
        reconciliationNotes: `Single active feed from ${incomingTick.exchange}`,
      };
    }

    // Both NSE and BSE feeds are present: reconcile
    const priceDiff = Math.abs(nse.price - bse.price);
    const avgPrice = (nse.price + bse.price) / 2;
    const priceDiscrepancyPct = (priceDiff / avgPrice) * 100;
    const arbitrageFlag = priceDiscrepancyPct >= 0.4; // 0.4% discrepancy is material

    // Selection logic:
    // 1. Freshness: If one feed is > 5s fresher than the other, pick the fresher feed
    const ageDiffMs = Math.abs(nse.timestamp - bse.timestamp);
    if (ageDiffMs > 5000) {
      const fresher = nse.timestamp > bse.timestamp ? nse : bse;
      const older = nse.timestamp > bse.timestamp ? bse : nse;
      return {
        preferredTick: fresher,
        alternativeTick: older,
        isConflictResolved: true,
        priceDiscrepancyPct: Number(priceDiscrepancyPct.toFixed(2)),
        arbitrageFlag,
        reconciliationNotes: `Reconciled based on latency: ${fresher.exchange} is ${Math.round(ageDiffMs / 1000)}s fresher`,
      };
    }

    // 2. Liquidity preference: NSE default unless BSE volume is > 1.5x
    let preferred: RawTick;
    let alternative: RawTick;
    if (bse.volume > nse.volume * 1.5) {
      preferred = bse;
      alternative = nse;
    } else {
      preferred = nse;
      alternative = bse;
    }

    return {
      preferredTick: preferred,
      alternativeTick: alternative,
      isConflictResolved: true,
      priceDiscrepancyPct: Number(priceDiscrepancyPct.toFixed(2)),
      arbitrageFlag,
      reconciliationNotes: arbitrageFlag 
        ? `Arbitrage alert: ${priceDiscrepancyPct.toFixed(2)}% spread between NSE (₹${nse.price}) and BSE (₹${bse.price})`
        : `Reconciled: selected ${preferred.exchange} based on primary liquidity`,
    };
  }

  public getExchangeBook(symbol: string) {
    return this.exchangeBook.get(symbol.toUpperCase());
  }
}
