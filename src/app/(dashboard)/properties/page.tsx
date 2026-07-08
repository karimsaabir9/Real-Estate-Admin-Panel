"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Eye, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import {
  PropertyFormDialog,
  type PropertyFormValues,
} from "@/components/properties/property-form-dialog";
import {
  PropertyViewDialog,
  type PropertyViewData,
} from "@/components/properties/property-view-dialog";
import { formatCurrency } from "@/lib/format";

export default function PropertiesPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editValues, setEditValues] = useState<PropertyFormValues | undefined>();
  const [viewProperty, setViewProperty] = useState<PropertyViewData | undefined>();
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | undefined>();

  const { data: properties, isLoading } = useQuery(trpc.property.list.queryOptions());

  const deleteMutation = useMutation(
    trpc.property.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Property deleted");
        queryClient.invalidateQueries({ queryKey: trpc.property.list.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.dashboard.stats.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.dashboard.topProperties.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.report.summary.queryKey() });
        setDeleteId(undefined);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const filtered = properties?.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Properties"
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
            <Building2 className="size-4.5 text-primary" />
            Properties
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
                <TableHead>Property Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price ($)</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="flex items-center gap-2.5 font-medium">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage src={p.imageUrl ?? undefined} />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-xs text-primary">
                        {p.title.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {p.title}
                  </TableCell>
                  <TableCell>{p.type?.name ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell>{p.location}</TableCell>
                  <TableCell>{formatCurrency(Number(p.price))}</TableCell>
                  <TableCell>{p.owner?.fullName ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-primary hover:text-primary"
                        onClick={() => {
                          setViewProperty(p);
                          setViewOpen(true);
                        }}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-emerald-600 hover:text-emerald-600"
                        onClick={() => {
                          setEditValues({
                            id: p.id,
                            title: p.title,
                            typeId: p.type?.id,
                            location: p.location,
                            price: p.price,
                            status: p.status,
                            ownerId: p.owner?.id,
                            imageUrl: p.imageUrl ?? "",
                            description: p.description ?? "",
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
                        onClick={() => setDeleteId(p.id)}
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
                    No properties found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <PropertyFormDialog
        key={formOpen ? (editValues?.id ?? "new") : "closed"}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={editValues}
      />
      <PropertyViewDialog open={viewOpen} onOpenChange={setViewOpen} property={viewProperty} />
      <DeleteConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(o) => !o && setDeleteId(undefined)}
        title="Are you sure you want to delete this Property?"
        description="This action cannot be undone. This property will be deleted forever."
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate({ id: deleteId })}
      />
    </div>
  );
}
