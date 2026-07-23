"use client";

import { ChatProvider } from "@/components/chat";

export default function ChatPageWrapper({ children }: { children: React.ReactNode }) {
  return <ChatProvider>{children}</ChatProvider>;
}
