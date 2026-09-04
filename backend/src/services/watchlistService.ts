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

  public async addSymbol(watchlistId: string, symbol: string) {
    const sym = symbol.toUpperCase();
    const instrument = await prisma.instrument.findUnique({
      where: { symbol: sym },
    });

    if (!instrument) {
      throw new Error(`Instrument ${sym} not supported or found`);
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
