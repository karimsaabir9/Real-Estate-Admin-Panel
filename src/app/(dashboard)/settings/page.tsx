"use client";

import { Settings as SettingsIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { SecurityForm } from "@/components/settings/security-form";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" />

      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2 font-medium">
          <SettingsIcon className="size-4.5 text-primary" />
          Settings
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6 w-full max-w-md">
            <TabsTrigger value="profile" className="flex-1">
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1">
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>
          <TabsContent value="security">
            <SecurityForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
