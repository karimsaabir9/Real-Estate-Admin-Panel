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

export interface TenantFormValues {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  occupation?: string;
  propertyId?: string;
  paymentStatus: "paid" | "unpaid" | "pending" | "inactive";
}

const emptyValues: TenantFormValues = {
  fullName: "",
  email: "",
  phone: "",
  occupation: "",
  propertyId: undefined,
  paymentStatus: "pending",
};

export function TenantFormDialog({
  open,
  onOpenChange,
  initialValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: TenantFormValues;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<TenantFormValues>(initialValues ?? emptyValues);
  const isEdit = Boolean(initialValues?.id);

  const { data: properties } = useQuery(trpc.property.options.queryOptions());

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: trpc.tenant.list.queryKey() });
    queryClient.invalidateQueries({ queryKey: trpc.tenant.options.queryKey() });
    queryClient.invalidateQueries({ queryKey: trpc.dashboard.stats.queryKey() });
    queryClient.invalidateQueries({ queryKey: trpc.dashboard.recentTenants.queryKey() });
    queryClient.invalidateQueries({ queryKey: trpc.report.summary.queryKey() });
  };

  const createMutation = useMutation(
    trpc.tenant.create.mutationOptions({
      onSuccess: () => {
        toast.success("Tenant added");
        invalidate();
        onOpenChange(false);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const updateMutation = useMutation(
    trpc.tenant.update.mutationOptions({
      onSuccess: () => {
        toast.success("Tenant updated");
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
      fullName: values.fullName,
      email: values.email,
      phone: values.phone || undefined,
      occupation: values.occupation || undefined,
      propertyId: values.propertyId || undefined,
      paymentStatus: values.paymentStatus,
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
          <DialogTitle>{isEdit ? "Update Tenant" : "Add New Tenant"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              placeholder="Enter Full Name"
              value={values.fullName}
              onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter Email"
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                placeholder="Enter Phone number"
                value={values.phone}
                onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Occupation</Label>
              <Input
                placeholder="Enter Occupation"
                value={values.occupation}
                onChange={(e) => setValues((v) => ({ ...v, occupation: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Rented Property</Label>
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
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={values.paymentStatus}
              onValueChange={(v) =>
                setValues((s) => ({ ...s, paymentStatus: v as TenantFormValues["paymentStatus"] }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
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
