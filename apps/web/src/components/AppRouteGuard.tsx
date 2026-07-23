"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AppRouteGuardProps {
  appId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Route Guard Component
 *
 * Wraps children and redirects to /apps if the required app is not installed.
 * Use this to protect routes that require specific apps.
 *
 * @example
 * ```tsx
 * <AppRouteGuard appId="clients">
 *   <ClientsPage />
 * </AppRouteGuard>
 * ```
 */
export function AppRouteGuard({ appId, children, fallback }: AppRouteGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await fetch(`/api/apps/check?appId=${appId}`);
        const data = await res.json();

        if (data.hasAccess) {
          setHasAccess(true);
        } else {
          router.push("/apps");
        }
      } catch {
        router.push("/apps");
      } finally {
        setIsLoading(false);
      }
    }

    checkAccess();
  }, [appId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook to check if user has access to a specific app
 */
export function useAppAccess(appId: string) {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await fetch(`/api/apps/check?appId=${appId}`);
        const data = await res.json();
        setHasAccess(data.hasAccess ?? false);
      } catch {
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAccess();
  }, [appId]);

  return { hasAccess, isLoading };
}
