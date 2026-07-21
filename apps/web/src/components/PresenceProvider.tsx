"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

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

  const refreshPresence = useCallback(async () => {
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
  }, []);

  // Send heartbeat every 2 minutes to keep presence updated
  const sendHeartbeat = useCallback(async () => {
    try {
      await fetch("/api/team/heartbeat", { method: "POST" });
    } catch (err) {
      console.error("Error sending heartbeat:", err);
    }
  }, []);

  const isOnline = useCallback((userId: string) => {
    return presence[userId] === "online";
  }, [presence]);

  // Initial fetch
  useEffect(() => {
    let ignore = false;

    async function fetchPresence() {
      try {
        const res = await fetch("/api/team/heartbeat");
        if (res.ok && !ignore) {
          const data = await res.json();
          const statusMap: PresenceStatus = {};
          data.presence.forEach((p: { userId: string; status: "online" | "away" | "offline" }) => {
            statusMap[p.userId] = p.status;
          });
          setPresence(statusMap);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error fetching presence:", err);
        }
      }
    }

    fetchPresence();
    return () => { ignore = true; };
  }, []);

  // Send heartbeat every 2 minutes
  useEffect(() => {
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [sendHeartbeat]);

  // Refresh presence every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshPresence, 30 * 1000);
    return () => clearInterval(interval);
  }, [refreshPresence]);

  return (
    <PresenceContext.Provider value={{ presence, refreshPresence, isOnline }}>
      {children}
    </PresenceContext.Provider>
  );
}
