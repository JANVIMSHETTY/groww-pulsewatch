import { FastifyInstance } from "fastify";
import { sessionService } from "../services/sessionService.js";
import { z } from "zod";

export async function sessionRoutes(fastify: FastifyInstance) {
  const DEFAULT_USER_ID = "usr_groww_001";

  // Get "While You Were Away" catch-up digest
  fastify.get("/catchup", async (request) => {
    const { userId } = (request.query as { userId?: string }) || {};
    const digest = await sessionService.getCatchUpDigest(userId || DEFAULT_USER_ID);
    return { success: true, digest };
  });

  // Acknowledge session and reset "last seen" to now
  fastify.post("/catchup/acknowledge", async (request) => {
    const { userId } = (request.body as { userId?: string }) || {};
    const result = await sessionService.updateLastViewed(userId || DEFAULT_USER_ID);
    return { ...result };
  });

  // Time-travel simulator for judges
  fastify.post("/time-travel", async (request) => {
    const schema = z.object({
      minutesAway: z.number().min(1).max(10080), // up to 7 days
      userId: z.string().optional(),
    });
    const { minutesAway, userId } = schema.parse(request.body);
    const digest = await sessionService.simulateTimeTravel(userId || DEFAULT_USER_ID, minutesAway);
    return {
      success: true,
      message: `Simulated absence of ${minutesAway} minutes (${(minutesAway / 60).toFixed(1)} hrs)`,
      digest,
    };
  });
}
