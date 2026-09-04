import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { marketDataService } from "./services/marketDataService.js";
import { marketRoutes } from "./routes/marketRoutes.js";
import { sessionRoutes } from "./routes/sessionRoutes.js";
import { watchlistRoutes } from "./routes/watchlistRoutes.js";

const fastify = Fastify({
  logger: process.env.NODE_ENV === "test" ? false : true,
});

async function bootstrap() {
  try {
    // 1. Enable CORS for local dev frontend
    await fastify.register(cors, {
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    });

    // 2. Enable WebSockets
    await fastify.register(websocket);

    // 3. Register WebSocket Endpoint
    fastify.register(async function (fastify) {
      fastify.get("/ws/market", { websocket: true }, (socket, req) => {
        fastify.log.info("Client connected to /ws/market");
        marketDataService.subscribe(socket);

        socket.on("close", () => {
          fastify.log.info("Client disconnected from /ws/market");
          marketDataService.unsubscribe(socket);
        });

        socket.on("message", (message: any) => {
          try {
            const data = JSON.parse(message.toString());
            if (data.type === "PING") {
              socket.send(JSON.stringify({ type: "PONG", timestamp: Date.now() }));
            }
          } catch (e) {
            // Ignore malformed ping
          }
        });
      });
    });

    // 4. Register HTTP REST API Routes
    await fastify.register(marketRoutes, { prefix: "/api/market" });
    await fastify.register(sessionRoutes, { prefix: "/api/session" });
    await fastify.register(watchlistRoutes, { prefix: "/api/watchlists" });

    // Health check
    fastify.get("/health", async () => {
      return { status: "UP", service: "PulseWatch Ingestion & Analytics Engine", timestamp: new Date().toISOString() };
    });

    // 5. Initialize In-Memory Market State and Simulator
    await marketDataService.initialize();

    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
    const HOST = "0.0.0.0";

    await fastify.listen({ port: PORT, host: HOST });
    console.log(`\n======================================================`);
    console.log(`🚀 PulseWatch Engine running on http://localhost:${PORT}`);
    console.log(`⚡ WebSocket Stream available at ws://localhost:${PORT}/ws/market`);
    console.log(`======================================================\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

bootstrap();
