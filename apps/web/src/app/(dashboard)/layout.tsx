import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { NotificationBell } from "@/components/NotificationBell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <DashboardSidebar user={session.user} />
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
    </div>
  );
}
