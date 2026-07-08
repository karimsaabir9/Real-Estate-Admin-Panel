import { createTRPCRouter } from "@/server/api/trpc";
import { propertyTypeRouter } from "@/server/api/routers/propertyType";
import { ownerRouter } from "@/server/api/routers/owner";
import { propertyRouter } from "@/server/api/routers/property";
import { tenantRouter } from "@/server/api/routers/tenant";
import { dealRouter } from "@/server/api/routers/deal";
import { dashboardRouter } from "@/server/api/routers/dashboard";
import { reportRouter } from "@/server/api/routers/report";

export const appRouter = createTRPCRouter({
  propertyType: propertyTypeRouter,
  owner: ownerRouter,
  property: propertyRouter,
  tenant: tenantRouter,
  deal: dealRouter,
  dashboard: dashboardRouter,
  report: reportRouter,
});

export type AppRouter = typeof appRouter;
