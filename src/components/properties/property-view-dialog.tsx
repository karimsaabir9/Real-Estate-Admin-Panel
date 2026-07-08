"use client";

import { Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/format";

export interface PropertyViewData {
  id: string;
  title: string;
  location: string;
  price: string;
  status: string;
  description?: string | null;
  imageUrl?: string | null;
  owner?: { fullName: string } | null;
  type?: { name: string } | null;
}

export function PropertyViewDialog({
  open,
  onOpenChange,
  property,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: PropertyViewData;
}) {
  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>View Property</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
            {property.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={property.imageUrl} alt={property.title} className="size-full object-cover" />
            ) : (
              <Building2 className="size-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ID: {property.id.slice(0, 8).toUpperCase()}</p>
            <h3 className="text-lg font-semibold">{property.title}</h3>
            <StatusBadge status={property.status} />
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="font-medium">{property.type?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="font-medium">{property.location}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Owner</p>
            <p className="font-medium">{property.owner?.fullName ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="font-medium">{formatCurrency(Number(property.price))}</p>
          </div>
        </div>

        {property.description && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="text-sm">{property.description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
