import { z } from "zod";
import { and, count, gte, lte, sum } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { properties, owners, tenants, deals } from "@/server/db/schema";

export const reportRouter = createTRPCRouter({
  summary: protectedProcedure
    .input(
      z.object({
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.from) conditions.push(gte(deals.dealDate, input.from));
      if (input.to) conditions.push(lte(deals.dealDate, input.to));
      const where = conditions.length ? and(...conditions) : undefined;

      const [[propCount], [ownerCount], [tenantCount], dealStats] =
        await Promise.all([
          ctx.db.select({ total: count() }).from(properties),
          ctx.db.select({ total: count() }).from(owners),
          ctx.db.select({ total: count() }).from(tenants),
          ctx.db
            .select({
              status: deals.status,
              total: count(),
              income: sum(deals.amount),
            })
            .from(deals)
            .where(where)
            .groupBy(deals.status),
        ]);

      const totalDeals = dealStats.reduce((acc, s) => acc + s.total, 0);
      const activeDeals =
        dealStats.find((s) => s.status === "active")?.total ?? 0;
      const completedDeals =
        dealStats.find((s) => s.status === "completed")?.total ?? 0;
      const totalIncome = dealStats.reduce(
        (acc, s) => acc + Number(s.income ?? 0),
        0,
      );

      return {
        totalProperties: propCount?.total ?? 0,
        totalOwners: ownerCount?.total ?? 0,
        totalTenants: tenantCount?.total ?? 0,
        totalDeals,
        activeDeals,
        completedDeals,
        totalIncome,
      };
    }),
});
