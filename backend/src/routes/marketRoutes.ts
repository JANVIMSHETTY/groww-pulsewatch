import { FastifyInstance } from "fastify";
import { marketDataService } from "../services/marketDataService.js";
import { z } from "zod";

export async function marketRoutes(fastify: FastifyInstance) {
  fastify.get("/quotes", async () => {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      quotes: marketDataService.getQuotes(),
    };
  });

  fastify.get("/quotes/:symbol", async (request, reply) => {
    const { symbol } = request.params as { symbol: string };
    const quote = marketDataService.getQuote(symbol);
    if (!quote) {
      return reply.status(404).send({ success: false, error: "Symbol not found" });
    }
    return { success: true, quote };
  });

  fastify.get("/events", async () => {
    return {
      success: true,
      events: marketDataService.getActiveEvents(),
    };
  });

  fastify.get("/instruments", async () => {
    return {
      success: true,
      instruments: marketDataService.getInstruments(),
    };
  });

  // Judge Simulation Scenarios
  fastify.post("/simulate/surge", async (request) => {
    const schema = z.object({ symbol: z.string() });
    const { symbol } = schema.parse(request.body);
    marketDataService.simulator.triggerVolumeSpike(symbol);
    return { success: true, message: `Forced volume surge triggered on ${symbol.toUpperCase()}` };
  });

  fastify.post("/simulate/breakout", async (request) => {
    const schema = z.object({ symbol: z.string(), targetPrice: z.number().optional() });
    const { symbol, targetPrice } = schema.parse(request.body);
    const quote = marketDataService.getQuote(symbol);
    const price = targetPrice ?? (quote ? quote.fiftyTwoWeekHigh + 5.0 : 500);
    marketDataService.simulator.triggerBreakout(symbol, price);
    return { success: true, message: `52-Week Breakout triggered on ${symbol} at ₹${price}` };
  });

  fastify.post("/simulate/circuit", async (request) => {
    const schema = z.object({ symbol: z.string(), side: z.enum(["UPPER", "LOWER"]).default("LOWER") });
    const { symbol, side } = schema.parse(request.body);
    const quote = marketDataService.getQuote(symbol);
    if (!quote) throw new Error("Symbol not found");
    const target = side === "UPPER" ? quote.upperCircuit : quote.lowerCircuit;
    marketDataService.simulator.triggerCircuitApproach(symbol, target);
    return { success: true, message: `Circuit approach (${side}) triggered on ${symbol}` };
  });

  fastify.post("/simulate/stall", async (request) => {
    const schema = z.object({ symbol: z.string() });
    const { symbol } = schema.parse(request.body);
    const isStalled = marketDataService.simulator.toggleStallFeed(symbol);
    return { success: true, symbol, isStalled, message: isStalled ? "Feed paused (will become DELAYED then STALE)" : "Feed resumed" };
  });

  fastify.post("/simulate/corrupt-tick", async (request) => {
    const schema = z.object({ symbol: z.string(), type: z.enum(["OUT_OF_ORDER", "CLOCK_SKEW"]) });
    const { symbol, type } = schema.parse(request.body);
    const tick = marketDataService.simulator.injectCorruptedTick(symbol, type);
    if (!tick) throw new Error("Symbol not found");
    const accepted = marketDataService.handleIncomingTick(tick);
    return {
      success: true,
      injectedTick: tick,
      acceptedBySequencer: accepted,
      message: accepted ? "Tick accepted" : `Corrupt ${type} tick successfully detected and REJECTED by TickSequencer`,
    };
  });
}
