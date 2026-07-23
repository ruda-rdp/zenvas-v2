"use client";

import ChatPageWrapper from "@/components/chat/ChatPageWrapper";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <ChatPageWrapper>{children}</ChatPageWrapper>;
}
