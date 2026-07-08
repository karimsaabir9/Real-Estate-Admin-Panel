"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Handshake, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { DealFormDialog, type DealFormValues } from "@/components/deals/deal-form-dialog";
import { formatCurrency, formatDate } from "@/lib/format";

export default function DealsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editValues, setEditValues] = useState<DealFormValues | undefined>();
  const [deleteId, setDeleteId] = useState<string | undefined>();

  const { data: deals, isLoading } = useQuery(trpc.deal.list.queryOptions());

  const deleteMutation = useMutation(
    trpc.deal.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Deal deleted");
        queryClient.invalidateQueries({ queryKey: trpc.deal.list.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.dashboard.stats.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.dashboard.incomeByMonth.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.dashboard.weeklyActivity.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.dashboard.recentDeals.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.report.summary.queryKey() });
        setDeleteId(undefined);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const filtered = deals?.filter((d) =>
    (d.property?.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (d.tenant?.fullName ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Deals"
        action={
          <Button
            onClick={() => {
              setEditValues(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add
          </Button>
        }
      />

      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <Handshake className="size-4.5 text-primary" />
            Deals
          </div>
          <Input
            placeholder="Search"
            className="max-w-xs bg-secondary/60"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Deal Type</TableHead>
                <TableHead>Amount ($)</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.property?.title ?? "—"}</TableCell>
                  <TableCell>{d.owner?.fullName ?? "—"}</TableCell>
                  <TableCell>{d.tenant?.fullName ?? "—"}</TableCell>
                  <TableCell className="capitalize">{d.dealType}</TableCell>
                  <TableCell>{formatCurrency(Number(d.amount))}</TableCell>
                  <TableCell>{formatDate(d.dealDate)}</TableCell>
                  <TableCell className="capitalize">{d.paymentMethod}</TableCell>
                  <TableCell>
                    <StatusBadge status={d.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-emerald-600 hover:text-emerald-600"
                        onClick={() => {
                          setEditValues({
                            id: d.id,
                            propertyId: d.property?.id,
                            ownerId: d.owner?.id,
                            tenantId: d.tenant?.id,
                            dealType: d.dealType,
                            amount: d.amount,
                            dealDate: new Date(d.dealDate).toISOString().slice(0, 10),
                            paymentMethod: d.paymentMethod,
                            status: d.status,
                          });
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(d.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && filtered?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    No deals found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DealFormDialog
        key={formOpen ? (editValues?.id ?? "new") : "closed"}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={editValues}
      />
      <DeleteConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(o) => !o && setDeleteId(undefined)}
        title="Are you sure you want to delete this Deal?"
        description="This action cannot be undone. This deal will be deleted forever."
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate({ id: deleteId })}
      />
    </div>
  );
}
