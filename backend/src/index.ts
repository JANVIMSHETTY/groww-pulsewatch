import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import path from "path";
import fs from "fs";
import { marketDataService } from "./services/marketDataService.js";
import { marketRoutes } from "./routes/marketRoutes.js";
import { sessionRoutes } from "./routes/sessionRoutes.js";
import { watchlistRoutes } from "./routes/watchlistRoutes.js";

const fastify = Fastify({
  logger: process.env.NODE_ENV === "test" ? false : true,
});

async function bootstrap() {
  try {
    await fastify.register(cors, {
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    });

    await fastify.register(websocket);

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

    await fastify.register(marketRoutes, { prefix: "/api/market" });
    await fastify.register(sessionRoutes, { prefix: "/api/session" });
    await fastify.register(watchlistRoutes, { prefix: "/api/watchlists" });

    fastify.get("/health", async () => {
      return { status: "UP", service: "PulseWatch Ingestion & Analytics Engine", timestamp: new Date().toISOString() };
    });

    // Serve Frontend Static Assets if frontend/dist exists
    const frontendDistPath = path.resolve(process.cwd(), "../frontend/dist");
    const localDistPath = path.resolve(process.cwd(), "frontend/dist");
    const activePath = fs.existsSync(frontendDistPath) ? frontendDistPath : (fs.existsSync(localDistPath) ? localDistPath : null);

    if (activePath) {
      await fastify.register(fastifyStatic, {
        root: activePath,
        prefix: "/",
      });

      fastify.setNotFoundHandler((req, reply) => {
        if (req.raw.url && req.raw.url.startsWith("/api")) {
          reply.status(404).send({ error: "Endpoint not found" });
        } else {
          reply.sendFile("index.html");
        }
      });
      fastify.log.info(`Serving static frontend from: ${activePath}`);
    }

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
