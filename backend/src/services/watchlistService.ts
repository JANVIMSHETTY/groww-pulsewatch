import { prisma } from "../db/client.js";
import { marketDataService } from "./marketDataService.js";

export class WatchlistService {
  public async getWatchlists(userId: string) {
    const watchlists = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        items: {
          include: { instrument: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return watchlists.map((wl) => ({
      id: wl.id,
      name: wl.name,
      isDefault: wl.isDefault,
      items: wl.items.map((item) => {
        const liveQuote = marketDataService.getQuote(item.symbol);
        return {
          id: item.id,
          symbol: item.symbol,
          name: item.instrument.name,
          exchange: item.instrument.exchange,
          sector: item.instrument.sector,
          quote: liveQuote,
          addedAt: item.addedAt,
        };
      }),
    }));
  }

  public async addSymbol(watchlistId: string, symbol: string, customName?: string, customPrice?: number) {
    const sym = symbol.toUpperCase().trim();
    let instrument = await prisma.instrument.findUnique({
      where: { symbol: sym },
    });

    // If instrument doesn't exist yet, auto-register it!
    if (!instrument) {
      const price = customPrice ?? (Math.floor(100 + Math.random() * 2500));
      const baselineVolume = 5000000;
      instrument = await prisma.instrument.create({
        data: {
          symbol: sym,
          name: customName || `${sym} Industries Ltd`,
          exchange: "NSE",
          sector: "Equities / Diversified",
          dayOpen: price,
          previousClose: price,
          fiftyTwoWeekHigh: Number((price * 1.25).toFixed(2)),
          fiftyTwoWeekLow: Number((price * 0.75).toFixed(2)),
          upperCircuit: Number((price * 1.10).toFixed(2)),
          lowerCircuit: Number((price * 0.90).toFixed(2)),
          baselineVolume20D: baselineVolume,
        },
      });

      // Register with live market service
      await marketDataService.registerInstrument(instrument);
    }

    return prisma.watchlistItem.upsert({
      where: {
        watchlistId_symbol: { watchlistId, symbol: sym },
      },
      update: {},
      create: {
        watchlistId,
        symbol: sym,
      },
    });
  }

  public async removeSymbol(watchlistId: string, symbol: string) {
    return prisma.watchlistItem.deleteMany({
      where: {
        watchlistId,
        symbol: symbol.toUpperCase(),
      },
    });
  }

  public async createWatchlist(userId: string, name: string) {
    return prisma.watchlist.create({
      data: {
        userId,
        name,
        isDefault: false,
      },
    });
  }
}

export const watchlistService = new WatchlistService();
