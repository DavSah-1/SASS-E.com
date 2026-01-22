import { z } from "zod";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./notification";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  updateCurrency: protectedProcedure
    .input(
      z.object({
        currency: z.string().length(3, "Currency code must be 3 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        return { success: false, error: "Database not available" };
      }

      await db
        .update(users)
        .set({ preferredCurrency: input.currency })
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),
});
