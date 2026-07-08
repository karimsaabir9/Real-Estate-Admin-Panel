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
import { Textarea } from "@/components/ui/textarea";
import { ImageDropzone } from "@/components/image-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PropertyFormValues {
  id?: string;
  title: string;
  typeId?: string;
  location: string;
  price: string;
  status: "available" | "rented" | "sold";
  ownerId?: string;
  imageUrl?: string;
  description?: string;
}

const emptyValues: PropertyFormValues = {
  title: "",
  typeId: undefined,
  location: "",
  price: "",
  status: "available",
  ownerId: undefined,
  imageUrl: "",
  description: "",
};

export function PropertyFormDialog({
  open,
  onOpenChange,
  initialValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: PropertyFormValues;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<PropertyFormValues>(initialValues ?? emptyValues);
  const isEdit = Boolean(initialValues?.id);

  const { data: owners } = useQuery(trpc.owner.options.queryOptions());
  const { data: types } = useQuery(trpc.propertyType.list.queryOptions());

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: trpc.property.list.queryKey() });
    queryClient.invalidateQueries({ queryKey: trpc.property.options.queryKey() });
    queryClient.invalidateQueries({ queryKey: trpc.dashboard.stats.queryKey() });
    queryClient.invalidateQueries({ queryKey: trpc.dashboard.topProperties.queryKey() });
    queryClient.invalidateQueries({ queryKey: trpc.report.summary.queryKey() });
  };

  const createMutation = useMutation(
    trpc.property.create.mutationOptions({
      onSuccess: () => {
        toast.success("Property created");
        invalidate();
        onOpenChange(false);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const updateMutation = useMutation(
    trpc.property.update.mutationOptions({
      onSuccess: () => {
        toast.success("Property updated");
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
      title: values.title,
      typeId: values.typeId || undefined,
      location: values.location,
      price: Number(values.price),
      status: values.status,
      ownerId: values.ownerId || undefined,
      imageUrl: values.imageUrl || undefined,
      description: values.description || undefined,
    };

    if (isEdit && initialValues?.id) {
      updateMutation.mutate({ id: initialValues.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update Property" : "Add New Property"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Property Title</Label>
            <Input
              placeholder="Enter Property Title"
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={values.typeId}
                onValueChange={(v) => setValues((s) => ({ ...s, typeId: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {types?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="Enter Location"
                value={values.location}
                onChange={(e) => setValues((v) => ({ ...v, location: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input
                type="number"
                placeholder="Enter Price"
                value={values.price}
                onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))}
                required
                min={0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={values.status}
              onValueChange={(v) =>
                setValues((s) => ({ ...s, status: v as PropertyFormValues["status"] }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Property Image</Label>
            <ImageDropzone
              value={values.imageUrl}
              onChange={(url) => setValues((v) => ({ ...v, imageUrl: url }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Enter Description..."
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              rows={3}
            />
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
