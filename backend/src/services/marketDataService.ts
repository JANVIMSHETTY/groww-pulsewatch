import { Instrument } from "@prisma/client";
import { prisma } from "../db/client.js";
import { TickSequencer } from "../engine/tickSequencer.js";
import { MultiExchangeConflictResolver } from "../engine/conflictResolver.js";
import { MeaningfulChangeDetector } from "../engine/changeDetector.js";
import { AttentionScorer } from "../engine/attentionScorer.js";
import { MarketSimulator } from "../engine/marketSimulator.js";
import { ProcessedQuote, RawTick, MeaningfulChangeEvent, StalenessStatus } from "../types/market.js";
import { WebSocket } from "ws";

export class MarketDataService {
  private instruments = new Map<string, Instrument>();
  private liveQuotes = new Map<string, ProcessedQuote>();
  private activeEvents = new Map<string, MeaningfulChangeEvent[]>();
  
  private tickSequencer = new TickSequencer();
  private conflictResolver = new MultiExchangeConflictResolver();
  private changeDetector = new MeaningfulChangeDetector();
  private attentionScorer = new AttentionScorer();
  public simulator = new MarketSimulator();

  private subscribers = new Set<WebSocket>();
  private broadcastInterval: NodeJS.Timeout | null = null;

  public async initialize() {
    const dbInstruments = await prisma.instrument.findMany();
    for (const inst of dbInstruments) {
      this.registerInstrument(inst);
    }

    this.simulator.startStreaming(800, (tick) => {
      this.handleIncomingTick(tick);
    });

    this.broadcastInterval = setInterval(() => {
      this.checkStalenessAndBroadcast();
    }, 1000);

    console.log(`MarketDataService initialized with ${this.instruments.size} instruments.`);
  }

  public registerInstrument(inst: Instrument) {
    this.instruments.set(inst.symbol, inst);

    if (!this.liveQuotes.has(inst.symbol)) {
      const initialQuote: ProcessedQuote = {
        symbol: inst.symbol,
        name: inst.name,
        exchange: "NSE",
        sector: inst.sector,
        price: inst.previousClose,
        dayOpen: inst.dayOpen,
        previousClose: inst.previousClose,
        dayHigh: Math.max(inst.dayOpen, inst.previousClose),
        dayLow: Math.min(inst.dayOpen, inst.previousClose),
        dayChange: 0,
        dayChangePct: 0,
        volume: Math.floor(inst.baselineVolume20D * 0.45),
        baselineVolume20D: inst.baselineVolume20D,
        volumeMultiple: 1.0,
        fiftyTwoWeekHigh: inst.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: inst.fiftyTwoWeekLow,
        upperCircuit: inst.upperCircuit,
        lowerCircuit: inst.lowerCircuit,
        distanceToUpperCircuitPct: Number((((inst.upperCircuit - inst.previousClose) / inst.upperCircuit) * 100).toFixed(2)),
        distanceToLowerCircuitPct: Number((((inst.previousClose - inst.lowerCircuit) / inst.lowerCircuit) * 100).toFixed(2)),
        stalenessStatus: "LIVE",
        lastTickTimestamp: Date.now(),
        sequenceId: 1000,
        isConflictResolved: false,
        activeExchange: "NSE",
        attentionScore: 10,
        attentionBreakdown: {
          volumeComponent: 0,
          priceVelocityComponent: 0,
          levelViolationComponent: 0,
          circuitProximityComponent: 0,
          totalScore: 10,
          primaryReason: "Market open normal tracking",
        },
        activeEvents: [],
      };
      this.liveQuotes.set(inst.symbol, initialQuote);
    }

    this.simulator.registerStock(inst.symbol, inst.previousClose, inst.baselineVolume20D);
  }

  public handleIncomingTick(tick: RawTick): boolean {
    const symbol = tick.symbol.toUpperCase();
    const instrument = this.instruments.get(symbol);
    if (!instrument) return false;

    const validation = this.tickSequencer.validateAndSequence(tick);
    if (!validation.isValid) {
      return false;
    }

    const recon = this.conflictResolver.reconcile(tick);
    const resolvedTick = recon.preferredTick;

    const events = this.changeDetector.evaluateChanges(instrument, resolvedTick);
    if (events.length > 0) {
      this.activeEvents.set(symbol, events);
    }

    const current = this.liveQuotes.get(symbol)!;
    const price = resolvedTick.price;
    const dayChange = Number((price - instrument.previousClose).toFixed(2));
    const dayChangePct = Number(((dayChange / instrument.previousClose) * 100).toFixed(2));
    const dayHigh = Math.max(current.dayHigh, price);
    const dayLow = Math.min(current.dayLow, price);

    const expectedVolByNow = instrument.baselineVolume20D * 0.5;
    const volumeMultiple = Number((resolvedTick.volume / Math.max(1, expectedVolByNow)).toFixed(2));

    const distToUpper = Math.max(0, ((instrument.upperCircuit - price) / instrument.upperCircuit) * 100);
    const distToLower = Math.max(0, ((price - instrument.lowerCircuit) / instrument.lowerCircuit) * 100);
    const minCircuitDist = Math.min(distToUpper, distToLower);

    const isBreakout = price >= instrument.fiftyTwoWeekHigh || price <= instrument.fiftyTwoWeekLow;

    const activeEvts = this.activeEvents.get(symbol) ?? [];
    const breakdown = this.attentionScorer.computeScore(
      price,
      instrument.previousClose,
      volumeMultiple,
      isBreakout,
      minCircuitDist,
      activeEvts
    );

    const updatedQuote: ProcessedQuote = {
      ...current,
      price,
      exchange: resolvedTick.exchange,
      dayHigh,
      dayLow,
      dayChange,
      dayChangePct,
      volume: resolvedTick.volume,
      volumeMultiple,
      distanceToUpperCircuitPct: Number(distToUpper.toFixed(2)),
      distanceToLowerCircuitPct: Number(distToLower.toFixed(2)),
      stalenessStatus: validation.staleness,
      lastTickTimestamp: resolvedTick.timestamp,
      sequenceId: resolvedTick.sequenceId,
      isConflictResolved: recon.isConflictResolved,
      activeExchange: resolvedTick.exchange,
      attentionScore: breakdown.totalScore,
      attentionBreakdown: breakdown,
      activeEvents: activeEvts,
    };

    this.liveQuotes.set(symbol, updatedQuote);
    return true;
  }

  private checkStalenessAndBroadcast() {
    const now = Date.now();
    for (const [symbol, quote] of this.liveQuotes.entries()) {
      const latency = now - quote.lastTickTimestamp;
      const status: StalenessStatus = this.tickSequencer.calculateStaleness(latency);
      if (quote.stalenessStatus !== status) {
        quote.stalenessStatus = status;
      }
    }

    if (this.subscribers.size === 0) return;

    const payload = JSON.stringify({
      type: "MARKET_UPDATE",
      timestamp: new Date().toISOString(),
      quotes: Array.from(this.liveQuotes.values()),
    });

    for (const client of this.subscribers) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  public subscribe(ws: WebSocket) {
    this.subscribers.add(ws);
    ws.send(
      JSON.stringify({
        type: "INITIAL_STATE",
        timestamp: new Date().toISOString(),
        quotes: Array.from(this.liveQuotes.values()),
      })
    );
  }

  public unsubscribe(ws: WebSocket) {
    this.subscribers.delete(ws);
  }

  public getQuotes(): ProcessedQuote[] {
    return Array.from(this.liveQuotes.values());
  }

  public getQuote(symbol: string): ProcessedQuote | undefined {
    return this.liveQuotes.get(symbol.toUpperCase());
  }

  public getInstruments(): Instrument[] {
    return Array.from(this.instruments.values());
  }

  public getActiveEvents(): MeaningfulChangeEvent[] {
    const all: MeaningfulChangeEvent[] = [];
    for (const evts of this.activeEvents.values()) {
      all.push(...evts);
    }
    return all.sort((a, b) => b.timestamp - a.timestamp);
  }
}

export const marketDataService = new MarketDataService();
