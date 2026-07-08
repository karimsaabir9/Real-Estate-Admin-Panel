"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Filter, RotateCcw, Users2 } from "lucide-react";
import { useTRPC } from "@/trpc/react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";

export default function ReportPage() {
  const trpc = useTRPC();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data } = useQuery(
    trpc.report.summary.queryOptions({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    }),
  );

  const rows = useMemo(() => {
    if (!data) return [];
    return [
      {
        totalProperties: data.totalProperties,
        totalOwners: data.totalOwners,
        totalTenants: data.totalTenants,
        totalDeals: data.totalDeals,
        activeDeals: data.activeDeals,
        totalIncome: data.totalIncome,
        completedDeal: data.completedDeals,
        date: formatDate(new Date()),
      },
    ];
  }, [data]);

  function handleExport() {
    if (!data) return;
    const header = [
      "Total Properties",
      "Total Owners",
      "Total Tenants",
      "Total Deals",
      "Active Deals",
      "Total Income",
      "Completed Deal",
    ];
    const row = [
      data.totalProperties,
      data.totalOwners,
      data.totalTenants,
      data.totalDeals,
      data.activeDeals,
      data.totalIncome,
      data.completedDeals,
    ];
    const csv = [header.join(","), row.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    setFrom("");
    setTo("");
  }

  return (
    <div>
      <PageHeader title="Report" />

      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2 font-medium">
          <Users2 className="size-4.5 text-primary" />
          Report
        </div>

        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl bg-secondary/50 p-3">
          <Filter className="mb-2.5 size-4 text-muted-foreground" />

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-background/60"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-background/60"
            />
          </div>

          <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Reset Filter
          </Button>

          <Button variant="outline" className="ml-auto" onClick={handleExport} disabled={!data}>
            <Download className="size-4" />
            Export
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Total properties</TableHead>
                <TableHead>Total owners</TableHead>
                <TableHead>Total tenants</TableHead>
                <TableHead>Total deals</TableHead>
                <TableHead>Active deals</TableHead>
                <TableHead>Total income</TableHead>
                <TableHead>Completed deal</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.totalProperties}</TableCell>
                  <TableCell>{r.totalOwners}</TableCell>
                  <TableCell>{r.totalTenants}</TableCell>
                  <TableCell>{r.totalDeals}</TableCell>
                  <TableCell>{r.activeDeals}</TableCell>
                  <TableCell>{formatCurrency(r.totalIncome)}</TableCell>
                  <TableCell>{r.completedDeal}</TableCell>
                  <TableCell>{r.date}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    No data available
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
