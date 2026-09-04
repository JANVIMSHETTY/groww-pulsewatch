import { FastifyInstance } from "fastify";
import { watchlistService } from "../services/watchlistService.js";
import { z } from "zod";

export async function watchlistRoutes(fastify: FastifyInstance) {
  const DEFAULT_USER_ID = "usr_groww_001";

  fastify.get("/", async (request) => {
    const { userId } = (request.query as { userId?: string }) || {};
    const watchlists = await watchlistService.getWatchlists(userId || DEFAULT_USER_ID);
    return { success: true, watchlists };
  });

  fastify.post("/:id/items", async (request) => {
    const { id } = request.params as { id: string };
    const schema = z.object({
      symbol: z.string(),
      customName: z.string().optional(),
      customPrice: z.number().optional(),
    });
    const { symbol, customName, customPrice } = schema.parse(request.body);

    const item = await watchlistService.addSymbol(id, symbol, customName, customPrice);
    return { success: true, item };
  });

  fastify.delete("/:id/items/:symbol", async (request) => {
    const { id, symbol } = request.params as { id: string; symbol: string };
    await watchlistService.removeSymbol(id, symbol);
    return { success: true, message: `Removed ${symbol.toUpperCase()} from watchlist` };
  });

  fastify.post("/", async (request) => {
    const schema = z.object({ name: z.string().min(1), userId: z.string().optional() });
    const { name, userId } = schema.parse(request.body);
    const watchlist = await watchlistService.createWatchlist(userId || DEFAULT_USER_ID, name);
    return { success: true, watchlist };
  });
}
