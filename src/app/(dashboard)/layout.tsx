import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
        <Topbar
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            orgName: (session.user as { orgName?: string }).orgName,
            role: (session.user as { role?: string }).role,
          }}
        />
        <main className="flex-1 pb-10">{children}</main>
        <footer className="pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Real State. All Rights Reserved.
        </footer>
      </div>
    </div>
  );
}
