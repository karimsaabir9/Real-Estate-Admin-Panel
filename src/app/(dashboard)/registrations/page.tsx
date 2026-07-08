"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
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
import { TypeFormDialog, type TypeFormValues } from "@/components/registrations/type-form-dialog";

export default function RegistrationsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editValues, setEditValues] = useState<TypeFormValues | undefined>();
  const [deleteId, setDeleteId] = useState<string | undefined>();

  const { data: types, isLoading } = useQuery(trpc.propertyType.list.queryOptions());

  const deleteMutation = useMutation(
    trpc.propertyType.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Type deleted");
        queryClient.invalidateQueries({ queryKey: trpc.propertyType.list.queryKey() });
        setDeleteId(undefined);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const filtered = types?.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Registrations"
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
            <ClipboardList className="size-4.5 text-primary" />
            Type
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
                <TableHead>Type ID</TableHead>
                <TableHead>Type Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Total Properties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.description ?? "—"}</TableCell>
                  <TableCell>{t.totalProperties}</TableCell>
                  <TableCell>
                    <StatusBadge status={t.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-emerald-600 hover:text-emerald-600"
                        onClick={() => {
                          setEditValues({
                            id: t.id,
                            name: t.name,
                            description: t.description ?? "",
                            status: t.status,
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
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No types found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TypeFormDialog
        key={formOpen ? (editValues?.id ?? "new") : "closed"}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={editValues}
      />
      <DeleteConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(o) => !o && setDeleteId(undefined)}
        title="Are you sure you want to delete this Type?"
        description="This action cannot be undone. This type will be deleted forever."
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate({ id: deleteId })}
      />
    </div>
  );
}
