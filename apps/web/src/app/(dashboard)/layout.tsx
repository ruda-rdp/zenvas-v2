import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { NotificationBell } from "@/components/NotificationBell";
import GlobalChatWrapper from "@/components/chat/GlobalChatWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch installed packages and apps for the organization
  let installedPackages: string[] = [];
  let installedApps: string[] = [];
  if (session.user.organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { packages: true, apps: true },
    });
    installedPackages = org?.packages || [];
    installedApps = org?.apps || [];
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <DashboardSidebar
        user={session.user}
        installedPackages={installedPackages}
        installedApps={installedApps}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Notifications */}
        <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      
      {/* Global Chat */}
      <GlobalChatWrapper />
    </div>
  );
}
