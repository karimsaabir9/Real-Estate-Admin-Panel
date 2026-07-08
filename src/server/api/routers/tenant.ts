import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { tenants } from "@/server/db/schema";

const tenantInput = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  occupation: z.string().optional(),
  propertyId: z.string().uuid().optional(),
  paymentStatus: z
    .enum(["paid", "unpaid", "pending", "inactive"])
    .default("pending"),
  moveInDate: z.coerce.date().optional(),
});

export const tenantRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.tenants.findMany({
      orderBy: desc(tenants.createdAt),
      with: {
        property: { columns: { id: true, title: true } },
      },
    });
  }),

  create: protectedProcedure
    .input(tenantInput)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db.insert(tenants).values(input).returning();
      return row;
    }),

  update: protectedProcedure
    .input(tenantInput.extend({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const [row] = await ctx.db
        .update(tenants)
        .set({ ...rest, updatedAt: new Date() })
        .where(eq(tenants.id, id))
        .returning();
      return row;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(tenants).where(eq(tenants.id, input.id));
      return { success: true };
    }),

  options: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.tenants.findMany({
      columns: { id: true, fullName: true },
    });
  }),
});
