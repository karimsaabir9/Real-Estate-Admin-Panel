"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, UserRound } from "lucide-react";
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
import { TenantFormDialog, type TenantFormValues } from "@/components/tenants/tenant-form-dialog";
import { formatDate } from "@/lib/format";

export default function TenantsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editValues, setEditValues] = useState<TenantFormValues | undefined>();
  const [deleteId, setDeleteId] = useState<string | undefined>();

  const { data: tenants, isLoading } = useQuery(trpc.tenant.list.queryOptions());

  const deleteMutation = useMutation(
    trpc.tenant.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Tenant deleted");
        queryClient.invalidateQueries({ queryKey: trpc.tenant.list.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.dashboard.stats.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.dashboard.recentTenants.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.report.summary.queryKey() });
        setDeleteId(undefined);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const filtered = tenants?.filter((t) =>
    t.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Tenants"
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
            <UserRound className="size-4.5 text-primary" />
            Tenants
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
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone number</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Rented property</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.fullName}</TableCell>
                  <TableCell>{t.email}</TableCell>
                  <TableCell>{t.phone ?? "—"}</TableCell>
                  <TableCell>{t.occupation ?? "—"}</TableCell>
                  <TableCell>{t.property?.title ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={t.paymentStatus} />
                  </TableCell>
                  <TableCell>{formatDate(t.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-emerald-600 hover:text-emerald-600"
                        onClick={() => {
                          setEditValues({
                            id: t.id,
                            fullName: t.fullName,
                            email: t.email,
                            phone: t.phone ?? "",
                            occupation: t.occupation ?? "",
                            propertyId: t.property?.id,
                            paymentStatus: t.paymentStatus,
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
                        onClick={() => setDeleteId(t.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && filtered?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    No tenants found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TenantFormDialog
        key={formOpen ? (editValues?.id ?? "new") : "closed"}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={editValues}
      />
      <DeleteConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(o) => !o && setDeleteId(undefined)}
        title="Are you sure you want to delete this Tenant?"
        description="This action cannot be undone. This tenant will be deleted forever."
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate({ id: deleteId })}
      />
    </div>
  );
}
