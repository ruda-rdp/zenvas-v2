import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
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
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Global Chat */}
      <GlobalChatWrapper />
    </div>
  );
}
