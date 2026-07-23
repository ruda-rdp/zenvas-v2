"use client";

import { ChatProvider, ChatLauncher, ChatPanel } from "@/components/chat";

export default function GlobalChatWrapper() {
  return (
    <ChatProvider>
      <ChatLauncher />
      <ChatPanel />
    </ChatProvider>
  );
}
