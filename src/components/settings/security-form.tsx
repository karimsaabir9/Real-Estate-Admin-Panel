"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SecurityForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const checks = [
    { label: "Minimum 8 characters.", valid: newPassword.length >= 8 },
    {
      label: "Use combination of uppercase and lowercase letters.",
      valid: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
    },
    {
      label: "Use of special characters (e.g., !, @, #, $, %).",
      valid: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    const { error } = await authClient.changePassword({
      currentPassword: oldPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Unable to update password");
      return;
    }

    toast.success("Password updated");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <p className="text-sm font-medium text-muted-foreground">Password</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Old Password</Label>
          <Input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>New Password</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label>Confirm Password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        {checks.map((c) => (
          <div
            key={c.label}
            className={`flex items-center gap-1.5 text-xs ${c.valid ? "text-emerald-600" : "text-muted-foreground"}`}
          >
            <Check className="size-3.5" />
            {c.label}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Update Password
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
