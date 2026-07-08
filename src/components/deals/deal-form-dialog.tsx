"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DealFormValues {
  id?: string;
  propertyId?: string;
  ownerId?: string;
  tenantId?: string;
  dealType: "sale" | "rent" | "lease";
  amount: string;
  dealDate: string;
  paymentMethod: "cash" | "bank" | "card";
  status: "active" | "pending" | "completed" | "inactive";
}

const emptyValues: DealFormValues = {
  propertyId: undefined,
  ownerId: undefined,
  tenantId: undefined,
  dealType: "sale",
  amount: "",
  dealDate: new Date().toISOString().slice(0, 10),
  paymentMethod: "bank",
  status: "pending",
};

export function DealFormDialog({
  open,
  onOpenChange,
  initialValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: DealFormValues;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<DealFormValues>(initialValues ?? emptyValues);
  const isEdit = Boolean(initialValues?.id);

  const { data: properties } = useQuery(trpc.property.options.queryOptions());
  const { data: owners } = useQuery(trpc.owner.options.queryOptions());
  const { data: tenants } = useQuery(trpc.tenant.options.queryOptions());

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: trpc.deal.list.queryKey() });
    queryClient.invalidateQueries({ queryKey: trpc.dashboard.stats.queryKey() });
    queryClient.invalidateQueries({ queryKey: trpc.dashboard.incomeByMonth.queryKey() });
    queryClient.invalidateQueries({ queryKey: trpc.dashboard.weeklyActivity.queryKey() });
    queryClient.invalidateQueries({ queryKey: trpc.dashboard.recentDeals.queryKey() });
    queryClient.invalidateQueries({ queryKey: trpc.report.summary.queryKey() });
  };

  const createMutation = useMutation(
    trpc.deal.create.mutationOptions({
      onSuccess: () => {
        toast.success("Deal added");
        invalidate();
        onOpenChange(false);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const updateMutation = useMutation(
    trpc.deal.update.mutationOptions({
      onSuccess: () => {
        toast.success("Deal updated");
        invalidate();
        onOpenChange(false);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const loading = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      propertyId: values.propertyId || undefined,
      ownerId: values.ownerId || undefined,
      tenantId: values.tenantId || undefined,
      dealType: values.dealType,
      amount: Number(values.amount),
      dealDate: new Date(values.dealDate),
      paymentMethod: values.paymentMethod,
      status: values.status,
    };
    if (isEdit && initialValues?.id) {
      updateMutation.mutate({ id: initialValues.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update Deal" : "Add New Deal"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Property</Label>
            <Select
              value={values.propertyId}
              onValueChange={(v) => setValues((s) => ({ ...s, propertyId: v }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Property" />
              </SelectTrigger>
              <SelectContent>
                {properties?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select
                value={values.ownerId}
                onValueChange={(v) => setValues((s) => ({ ...s, ownerId: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners?.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tenant</Label>
              <Select
                value={values.tenantId}
                onValueChange={(v) => setValues((s) => ({ ...s, tenantId: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Deal Type</Label>
              <Select
                value={values.dealType}
                onValueChange={(v) => setValues((s) => ({ ...s, dealType: v as DealFormValues["dealType"] }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Deal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="lease">Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                placeholder="Enter Amount"
                value={values.amount}
                onChange={(e) => setValues((v) => ({ ...v, amount: e.target.value }))}
                required
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Deal Date</Label>
              <Input
                type="date"
                value={values.dealDate}
                onChange={(e) => setValues((v) => ({ ...v, dealDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={values.paymentMethod}
                onValueChange={(v) =>
                  setValues((s) => ({ ...s, paymentMethod: v as DealFormValues["paymentMethod"] }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={values.status}
              onValueChange={(v) => setValues((s) => ({ ...s, status: v as DealFormValues["status"] }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
