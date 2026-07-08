import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { properties } from "@/server/db/schema";

const propertyInput = z.object({
  title: z.string().min(1),
  typeId: z.string().uuid().optional(),
  location: z.string().min(1),
  price: z.coerce.number().positive(),
  status: z.enum(["available", "rented", "sold"]).default("available"),
  ownerId: z.string().uuid().optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
});

export const propertyRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.properties.findMany({
      orderBy: desc(properties.createdAt),
      with: {
        owner: { columns: { id: true, fullName: true } },
        type: { columns: { id: true, name: true } },
      },
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.properties.findFirst({
        where: eq(properties.id, input.id),
        with: {
          owner: { columns: { id: true, fullName: true } },
          type: { columns: { id: true, name: true } },
        },
      });
    }),

  create: protectedProcedure
    .input(propertyInput)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .insert(properties)
        .values({ ...input, price: input.price.toString() })
        .returning();
      return row;
    }),

  update: protectedProcedure
    .input(propertyInput.extend({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const [row] = await ctx.db
        .update(properties)
        .set({ ...rest, price: rest.price.toString(), updatedAt: new Date() })
        .where(eq(properties.id, id))
        .returning();
      return row;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(properties).where(eq(properties.id, input.id));
      return { success: true };
    }),

  options: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.properties.findMany({
      columns: { id: true, title: true },
    });
  }),
});
