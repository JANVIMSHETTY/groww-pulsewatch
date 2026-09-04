import { prisma } from "../db/client.js";
import { marketDataService } from "./marketDataService.js";
import { SessionCatchUpDigest } from "../types/market.js";

export class SessionService {
  public async getCatchUpDigest(userId: string): Promise<SessionCatchUpDigest> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        watchlists: {
          where: { isDefault: true },
          include: { items: true },
        },
      },
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const defaultWatchlist = user.watchlists[0];
    const watchedSymbols = defaultWatchlist ? defaultWatchlist.items.map((i) => i.symbol) : [];

    const now = new Date();
    const lastViewed = user.lastViewedAt;
    const timeAwayMs = now.getTime() - lastViewed.getTime();
    const timeAwayMinutes = Math.max(1, Math.round(timeAwayMs / 60000));

    // Fetch baseline snapshot for each watched symbol closest to lastViewedAt
    const movers: SessionCatchUpDigest["topMoversSinceLastSeen"] = [];
    const allQuotes = marketDataService.getQuotes();

    for (const symbol of watchedSymbols) {
      const quote = marketDataService.getQuote(symbol);
      if (!quote) continue;

      // Find closest snapshot
      const snapshot = await prisma.tickSnapshot.findFirst({
        where: {
          symbol,
          timestamp: { lte: lastViewed },
        },
        orderBy: { timestamp: "desc" },
      });

      const priceThen = snapshot ? snapshot.price : quote.previousClose;
      const priceNow = quote.price;
      const changeSinceSeenPct = Number((((priceNow - priceThen) / priceThen) * 100).toFixed(2));
      const volumeSurgePct = Math.round((quote.volumeMultiple - 1) * 100);

      let keyHighlight = "Price in steady consolidation";
      if (quote.activeEvents.length > 0) {
        keyHighlight = quote.activeEvents[0].headline;
      } else if (Math.abs(changeSinceSeenPct) >= 2.0) {
        keyHighlight = `${changeSinceSeenPct > 0 ? "+" : ""}${changeSinceSeenPct}% price shift since last check`;
      } else if (quote.volumeMultiple >= 1.5) {
        keyHighlight = `Volume picked up (+${volumeSurgePct}%)`;
      }

      movers.push({
        symbol: quote.symbol,
        name: quote.name,
        priceThen,
        priceNow,
        changeSinceSeenPct,
        volumeSurgePct,
        keyHighlight,
        attentionScore: quote.attentionScore,
      });
    }

    // Sort by attention score descending (most urgent first)
    movers.sort((a, b) => b.attentionScore - a.attentionScore);

    const itemsRequiringAttention = movers.filter((m) => m.attentionScore >= 45).length;
    const criticalEvents = marketDataService.getActiveEvents();

    return {
      lastViewedAt: lastViewed.toISOString(),
      currentTimestamp: now.toISOString(),
      timeAwayMinutes,
      totalWatchlistItems: watchedSymbols.length,
      itemsRequiringAttention,
      criticalEvents: criticalEvents.slice(0, 5),
      topMoversSinceLastSeen: movers,
    };
  }

  public async updateLastViewed(userId: string, timestamp?: Date) {
    const time = timestamp ?? new Date();
    await prisma.user.update({
      where: { id: userId },
      data: { lastViewedAt: time },
    });

    // Record a new snapshot at this timestamp for future comparisons
    const quotes = marketDataService.getQuotes();
    for (const q of quotes) {
      await prisma.tickSnapshot.create({
        data: {
          symbol: q.symbol,
          price: q.price,
          volume: q.volume,
          timestamp: time,
        },
      });
    }

    return { success: true, newLastViewedAt: time.toISOString() };
  }

  public async simulateTimeTravel(userId: string, minutesAway: number) {
    // Set user's lastViewedAt back by minutesAway
    const pastTime = new Date(Date.now() - minutesAway * 60 * 1000);
    await prisma.user.update({
      where: { id: userId },
      data: { lastViewedAt: pastTime },
    });

    // Create a snapshot in the past for accurate comparison
    const quotes = marketDataService.getQuotes();
    for (const q of quotes) {
      // Simulate historical variance
      const variance = (Math.random() - 0.48) * 0.03;
      const historicPrice = Number((q.price * (1 - variance)).toFixed(2));
      const historicVolume = Math.floor(q.volume * 0.5);

      await prisma.tickSnapshot.create({
        data: {
          symbol: q.symbol,
          price: historicPrice,
          volume: historicVolume,
          timestamp: pastTime,
        },
      });
    }

    return this.getCatchUpDigest(userId);
  }
}

export const sessionService = new SessionService();
