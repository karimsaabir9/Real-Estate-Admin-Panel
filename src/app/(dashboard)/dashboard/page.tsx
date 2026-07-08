"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2, Users, UserRound, Wallet, Handshake } from "lucide-react";
import { useTRPC } from "@/trpc/react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { IncomeChart } from "@/components/dashboard/income-chart";
import { RentChart } from "@/components/dashboard/rent-chart";
import { ActivityDonut } from "@/components/dashboard/activity-donut";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import Link from "next/link";

export default function DashboardPage() {
  const trpc = useTRPC();

  const { data: stats } = useQuery(trpc.dashboard.stats.queryOptions());
  const { data: income } = useQuery(trpc.dashboard.incomeByMonth.queryOptions());
  const { data: weekly } = useQuery(trpc.dashboard.weeklyActivity.queryOptions());
  const { data: recentDeals } = useQuery(trpc.dashboard.recentDeals.queryOptions());
  const { data: recentTenants } = useQuery(trpc.dashboard.recentTenants.queryOptions());
  const { data: topProperties } = useQuery(trpc.dashboard.topProperties.queryOptions());

  return (
    <div>
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Properties"
          value={stats ? String(stats.totalProperties) : "—"}
          icon={Building2}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Active Tenants"
          value={stats ? String(stats.activeTenants) : "—"}
          icon={UserRound}
          iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        />
        <StatCard
          title="Registered Owners"
          value={stats ? String(stats.registeredOwners) : "—"}
          icon={Users}
          iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
        />
        <StatCard
          title="Total Income"
          value={stats ? formatCurrency(stats.totalIncome) : "—"}
          icon={Wallet}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Ongoing Deals"
          value={stats ? String(stats.ongoingDeals) : "—"}
          icon={Handshake}
          iconClassName="bg-red-500/10 text-red-600 dark:text-red-400"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-1">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium">Income Overview</h3>
          </div>
          <p className="text-2xl font-semibold">
            {income ? formatCurrency(income.reduce((a, b) => a + b.total, 0)) : "—"}
          </p>
          {income ? <IncomeChart data={income} /> : <Skeleton className="h-64 w-full" />}
        </div>

        <div className="glass rounded-2xl p-5 lg:col-span-1">
          <h3 className="mb-2 font-medium">Total Rent</h3>
          <p className="text-2xl font-semibold">
            {weekly ? weekly.rentTotal : "—"}
          </p>
          {weekly ? (
            <RentChart data={weekly.byDay} />
          ) : (
            <Skeleton className="h-52 w-full" />
          )}
        </div>

        <div className="glass rounded-2xl p-5 lg:col-span-1">
          <h3 className="mb-2 font-medium">Daily Activity</h3>
          {weekly ? (
            <ActivityDonut rent={weekly.rentTotal} sold={weekly.soldTotal} />
          ) : (
            <Skeleton className="h-52 w-full" />
          )}
          <div className="mt-2 flex items-center justify-center gap-6 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-primary" /> Rent:{" "}
              {weekly?.rentTotal ?? 0}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[var(--chart-3)]" /> Sold:{" "}
              {weekly?.soldTotal ?? 0}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium">Recent Deals</h3>
            <Link href="/deals" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDeals?.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">{deal.property?.title ?? "—"}</TableCell>
                    <TableCell>{deal.tenant?.fullName ?? "—"}</TableCell>
                    <TableCell>{deal.owner?.fullName ?? "—"}</TableCell>
                    <TableCell>{formatCurrency(Number(deal.amount))}</TableCell>
                    <TableCell>
                      <StatusBadge status={deal.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {recentDeals?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No deals yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium">Top Properties</h3>
            <Link href="/properties" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {topProperties?.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-xs text-primary">
                      {p.title.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{p.title}</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(Number(p.price))}</span>
              </div>
            ))}
            {topProperties?.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No properties yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="glass mt-4 rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium">Tenant Activities</h3>
          <Link href="/tenants" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant Name</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Move-in Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTenants?.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.fullName}</TableCell>
                  <TableCell>{t.property?.title ?? "—"}</TableCell>
                  <TableCell>{t.moveInDate ? formatDate(t.moveInDate) : "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={t.paymentStatus} />
                  </TableCell>
                </TableRow>
              ))}
              {recentTenants?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No tenants yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
