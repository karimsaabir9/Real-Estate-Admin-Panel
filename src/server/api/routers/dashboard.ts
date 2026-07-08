import { count, sum, desc, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { properties, owners, tenants, deals } from "@/server/db/schema";

export const dashboardRouter = createTRPCRouter({
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [[propCount], [tenantCount], [ownerCount], [dealCount], [income]] =
      await Promise.all([
        ctx.db.select({ total: count() }).from(properties),
        ctx.db.select({ total: count() }).from(tenants),
        ctx.db.select({ total: count() }).from(owners),
        ctx.db.select({ total: count() }).from(deals),
        ctx.db.select({ total: sum(deals.amount) }).from(deals),
      ]);

    return {
      totalProperties: propCount?.total ?? 0,
      activeTenants: tenantCount?.total ?? 0,
      registeredOwners: ownerCount?.total ?? 0,
      ongoingDeals: dealCount?.total ?? 0,
      totalIncome: Number(income?.total ?? 0),
    };
  }),

  incomeByMonth: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        month: sql<string>`to_char(${deals.dealDate}, 'Mon')`,
        monthNum: sql<number>`extract(month from ${deals.dealDate})`,
        total: sum(deals.amount),
      })
      .from(deals)
      .groupBy(sql`to_char(${deals.dealDate}, 'Mon')`, sql`extract(month from ${deals.dealDate})`)
      .orderBy(sql`extract(month from ${deals.dealDate})`);

    return rows.map((r) => ({ month: r.month, total: Number(r.total ?? 0) }));
  }),

  recentDeals: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.deals.findMany({
      orderBy: desc(deals.createdAt),
      limit: 5,
      with: {
        property: { columns: { id: true, title: true } },
        owner: { columns: { id: true, fullName: true } },
        tenant: { columns: { id: true, fullName: true } },
      },
    });
  }),

  recentTenants: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.tenants.findMany({
      orderBy: desc(tenants.createdAt),
      limit: 5,
      with: {
        property: { columns: { id: true, title: true } },
      },
    });
  }),

  topProperties: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.properties.findMany({
      orderBy: desc(properties.price),
      limit: 10,
      columns: { id: true, title: true, price: true, imageUrl: true },
    });
  }),

  weeklyActivity: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        dow: sql<number>`extract(dow from ${deals.dealDate})`,
        dealType: deals.dealType,
        total: count(),
      })
      .from(deals)
      .groupBy(sql`extract(dow from ${deals.dealDate})`, deals.dealType);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = days.map((day, i) => {
      const rent = rows
        .filter((r) => Number(r.dow) === i && r.dealType !== "sale")
        .reduce((acc, r) => acc + r.total, 0);
      const sold = rows
        .filter((r) => Number(r.dow) === i && r.dealType === "sale")
        .reduce((acc, r) => acc + r.total, 0);
      return { day, rent, sold };
    });

    const rentTotal = result.reduce((acc, r) => acc + r.rent, 0);
    const soldTotal = result.reduce((acc, r) => acc + r.sold, 0);

    return { byDay: result, rentTotal, soldTotal };
  }),
});
