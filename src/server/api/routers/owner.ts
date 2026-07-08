import { z } from "zod";
import { eq, count, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { owners, properties } from "@/server/db/schema";

export const ownerRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const allOwners = await ctx.db.query.owners.findMany({
      orderBy: desc(owners.createdAt),
    });

    const counts = await ctx.db
      .select({ ownerId: properties.ownerId, total: count() })
      .from(properties)
      .groupBy(properties.ownerId);

    const countMap = new Map(counts.map((c) => [c.ownerId, c.total]));

    return allOwners.map((o) => ({
      ...o,
      totalProperties: countMap.get(o.id) ?? 0,
    }));
  }),

  create: protectedProcedure
    .input(
      z.object({
        fullName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        address: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db.insert(owners).values(input).returning();
      return row;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        fullName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        address: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const [row] = await ctx.db
        .update(owners)
        .set({ ...rest, updatedAt: new Date() })
        .where(eq(owners.id, id))
        .returning();
      return row;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(owners).where(eq(owners.id, input.id));
      return { success: true };
    }),

  options: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.owners.findMany({
      columns: { id: true, fullName: true },
    });
  }),
});
