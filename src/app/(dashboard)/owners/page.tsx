"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
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
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { OwnerFormDialog, type OwnerFormValues } from "@/components/owners/owner-form-dialog";
import { formatDate } from "@/lib/format";

export default function OwnersPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editValues, setEditValues] = useState<OwnerFormValues | undefined>();
  const [deleteId, setDeleteId] = useState<string | undefined>();

  const { data: owners, isLoading } = useQuery(trpc.owner.list.queryOptions());

  const deleteMutation = useMutation(
    trpc.owner.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Owner deleted");
        queryClient.invalidateQueries({ queryKey: trpc.owner.list.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.dashboard.stats.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.report.summary.queryKey() });
        setDeleteId(undefined);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const filtered = owners?.filter((o) =>
    o.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Owners"
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
            <Users className="size-4.5 text-primary" />
            Owners
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
                <TableHead>Address</TableHead>
                <TableHead>Total properties</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.fullName}</TableCell>
                  <TableCell>{o.email}</TableCell>
                  <TableCell>{o.phone ?? "—"}</TableCell>
                  <TableCell>{o.address ?? "—"}</TableCell>
                  <TableCell>{o.totalProperties}</TableCell>
                  <TableCell>{formatDate(o.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-emerald-600 hover:text-emerald-600"
                        onClick={() => {
                          setEditValues({
                            id: o.id,
                            fullName: o.fullName,
                            email: o.email,
                            phone: o.phone ?? "",
                            address: o.address ?? "",
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
                        onClick={() => setDeleteId(o.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && filtered?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No owners found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <OwnerFormDialog
        key={formOpen ? (editValues?.id ?? "new") : "closed"}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={editValues}
      />
      <DeleteConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(o) => !o && setDeleteId(undefined)}
        title="Are you sure you want to delete this owner?"
        description="This action cannot be undone. This owner will be deleted forever."
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate({ id: deleteId })}
      />
    </div>
  );
}
