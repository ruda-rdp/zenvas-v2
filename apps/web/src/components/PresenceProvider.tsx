"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface PresenceStatus {
  [userId: string]: "online" | "away" | "offline";
}

interface PresenceContextType {
  presence: PresenceStatus;
  refreshPresence: () => Promise<void>;
  isOnline: (userId: string) => boolean;
}

const PresenceContext = createContext<PresenceContextType>({
  presence: {},
  refreshPresence: async () => {},
  isOnline: () => false,
});

export function usePresence() {
  return useContext(PresenceContext);
}

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [presence, setPresence] = useState<PresenceStatus>({});
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const refreshPresence = useCallback(async () => {
    if (!isAuthed) return; // Don't hit the authenticated endpoint while logged out
    try {
      const res = await fetch("/api/team/heartbeat");
      if (res.ok) {
        const data = await res.json();
        const statusMap: PresenceStatus = {};
        data.presence.forEach((p: { userId: string; status: "online" | "away" | "offline" }) => {
          statusMap[p.userId] = p.status;
        });
        setPresence(statusMap);
      }
    } catch (err) {
      console.error("Error fetching presence:", err);
    }
  }, [isAuthed]);

  const sendHeartbeat = useCallback(async () => {
    if (!isAuthed) return;
    try {
      await fetch("/api/team/heartbeat", { method: "POST" });
    } catch (err) {
      console.error("Error sending heartbeat:", err);
    }
  }, [isAuthed]);

  const isOnline = useCallback((userId: string) => {
    return presence[userId] === "online";
  }, [presence]);

  // Initial fetch + heartbeat + polling only run while authenticated.
  useEffect(() => {
    if (!isAuthed) return;
    refreshPresence();
    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 2 * 60 * 1000);
    const refreshInterval = setInterval(refreshPresence, 30 * 1000);
    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(refreshInterval);
    };
  }, [isAuthed, refreshPresence, sendHeartbeat]);

  return (
    <PresenceContext.Provider value={{ presence, refreshPresence, isOnline }}>
      {children}
    </PresenceContext.Provider>
  );
}
