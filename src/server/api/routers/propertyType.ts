import { z } from "zod";
import { eq, count, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { propertyTypes, properties } from "@/server/db/schema";

export const propertyTypeRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const types = await ctx.db.query.propertyTypes.findMany({
      orderBy: desc(propertyTypes.createdAt),
    });

    const counts = await ctx.db
      .select({ typeId: properties.typeId, total: count() })
      .from(properties)
      .groupBy(properties.typeId);

    const countMap = new Map(counts.map((c) => [c.typeId, c.total]));

    return types.map((t) => ({
      ...t,
      totalProperties: countMap.get(t.id) ?? 0,
    }));
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        status: z.enum(["active", "inactive"]).default("active"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db.insert(propertyTypes).values(input).returning();
      return row;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1),
        description: z.string().optional(),
        status: z.enum(["active", "inactive"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const [row] = await ctx.db
        .update(propertyTypes)
        .set({ ...rest, updatedAt: new Date() })
        .where(eq(propertyTypes.id, id))
        .returning();
      return row;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(propertyTypes).where(eq(propertyTypes.id, input.id));
      return { success: true };
    }),
});
