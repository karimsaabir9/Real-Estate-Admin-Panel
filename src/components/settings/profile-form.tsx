"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { AvatarUpload } from "@/components/avatar-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileUser {
  name: string;
  email: string;
  image?: string | null;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
}

export function ProfileForm() {
  const { data: session } = useSession();
  const user = session?.user as ProfileUser | undefined;

  if (!user) {
    return (
      <div className="space-y-6">
        <Skeleton className="size-16 rounded-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return <ProfileFormInner key={user.email} user={user} />;
}

function ProfileFormInner({ user }: { user: ProfileUser }) {
  const { refetch } = useSession();
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth ?? "");
  const [nationality, setNationality] = useState(user.nationality ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [image, setImage] = useState(user.image ?? "");
  const [loading, setLoading] = useState(false);

  async function handleImageUploaded(url: string) {
    setImage(url);
    const { error } = await authClient.updateUser({ image: url });
    if (error) {
      toast.error(error.message ?? "Unable to save picture");
      return;
    }
    refetch();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.updateUser({
      name,
      phone,
      dateOfBirth,
      nationality,
      address,
    } as Record<string, unknown>);
    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Unable to update profile");
      return;
    }
    toast.success("Profile updated");
    refetch();
  }

  const initials = (name || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Profile Information</p>
        <AvatarUpload imageUrl={image} fallbackText={initials} onUploaded={handleImageUploaded} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user.email} disabled />
        </div>
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Input value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} placeholder="25 January 1990" />
        </div>
        <div className="space-y-2">
          <Label>Nationality</Label>
          <Input value={nationality} onChange={(e) => setNationality(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Update
        </Button>
        <Button type="button" variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  );
}
