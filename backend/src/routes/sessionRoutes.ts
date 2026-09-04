import { FastifyInstance } from "fastify";
import { sessionService } from "../services/sessionService.js";
import { prisma } from "../db/client.js";
import { z } from "zod";

export async function sessionRoutes(fastify: FastifyInstance) {
  // List all available user profiles
  fastify.get("/users", async () => {
    const users = await prisma.user.findMany({
      include: {
        watchlists: {
          where: { isDefault: true },
          include: { items: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        activeDeviceId: u.activeDeviceId,
        lastViewedAt: u.lastViewedAt.toISOString(),
        defaultWatchlistName: u.watchlists[0]?.name || "My Watchlist",
        itemCount: u.watchlists[0]?.items.length || 0,
      })),
    };
  });

  // Create a new user profile
  fastify.post("/users", async (request) => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    });
    const { name, email } = schema.parse(request.body);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        activeDeviceId: "device_web_client",
        lastViewedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        watchlists: {
          create: {
            name: `${name}'s Watchlist`,
            isDefault: true,
          },
        },
      },
      include: { watchlists: true },
    });

    return { success: true, user };
  });

  // Get "While You Were Away" catch-up digest
  fastify.get("/catchup", async (request) => {
    const { userId } = (request.query as { userId?: string }) || {};
    const effectiveUserId = userId || "usr_groww_001";
    const digest = await sessionService.getCatchUpDigest(effectiveUserId);
    return { success: true, digest };
  });

  // Acknowledge session and reset "last seen" to now
  fastify.post("/catchup/acknowledge", async (request) => {
    const { userId } = (request.body as { userId?: string }) || {};
    const effectiveUserId = userId || "usr_groww_001";
    const result = await sessionService.updateLastViewed(effectiveUserId);
    return { ...result };
  });

  // Time-travel simulator for judges
  fastify.post("/time-travel", async (request) => {
    const schema = z.object({
      minutesAway: z.number().min(1).max(10080),
      userId: z.string().optional(),
    });
    const { minutesAway, userId } = schema.parse(request.body);
    const effectiveUserId = userId || "usr_groww_001";
    const digest = await sessionService.simulateTimeTravel(effectiveUserId, minutesAway);
    return {
      success: true,
      message: `Simulated absence of ${minutesAway} minutes (${(minutesAway / 60).toFixed(1)} hrs)`,
      digest,
    };
  });
}
