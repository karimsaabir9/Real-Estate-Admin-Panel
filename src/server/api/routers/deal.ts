import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { deals } from "@/server/db/schema";

const dealInput = z.object({
  propertyId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  tenantId: z.string().uuid().optional(),
  dealType: z.enum(["sale", "rent", "lease"]).default("sale"),
  amount: z.coerce.number().positive(),
  dealDate: z.coerce.date(),
  paymentMethod: z.enum(["cash", "bank", "card"]).default("bank"),
  status: z.enum(["active", "pending", "completed", "inactive"]).default("pending"),
});

export const dealRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.deals.findMany({
      orderBy: desc(deals.createdAt),
      with: {
        property: { columns: { id: true, title: true } },
        owner: { columns: { id: true, fullName: true } },
        tenant: { columns: { id: true, fullName: true } },
      },
    });
  }),

  create: protectedProcedure
    .input(dealInput)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .insert(deals)
        .values({ ...input, amount: input.amount.toString() })
        .returning();
      return row;
    }),

  update: protectedProcedure
    .input(dealInput.extend({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const [row] = await ctx.db
        .update(deals)
        .set({ ...rest, amount: rest.amount.toString(), updatedAt: new Date() })
        .where(eq(deals.id, id))
        .returning();
      return row;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(deals).where(eq(deals.id, input.id));
      return { success: true };
    }),
});
