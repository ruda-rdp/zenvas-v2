"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

// Types
export interface ChatUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
  lastActiveAt?: string | null;
  role?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  mentions: Array<{ id: string; name: string }>;
  parentId?: string | null;
  replyCount: number;
  replies?: ChatMessage[];
  user: ChatUser;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isSystem?: boolean;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: "GENERAL" | "TEAM" | "PROJECT" | "DIRECT";
  avatarUrl?: string | null;
  unreadCount: number;
  lastReadAt?: string | null;
  lastMessage?: ChatMessage | null;
  participants: ChatUser[];
  createdAt: string;
  updatedAt: string;
}

interface PresenceData {
  online: ChatUser[];
  idle: ChatUser[];
  offline: ChatUser[];
  total: number;
}

interface ChatContextType {
  // State
  channels: ChatChannel[];
  currentChannel: ChatChannel | null;
  messages: ChatMessage[];
  presence: PresenceData | null;
  isOpen: boolean;
  isLoading: boolean;
  totalUnread: number;
  
  // Actions
  setCurrentChannel: (channel: ChatChannel | null) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (content: string, mentions?: Array<{ id: string; name: string }>, parentId?: string) => Promise<void>;
  markAsRead: (channelId: string) => Promise<void>;
  createChannel: (name: string, type: string, participantIds?: string[]) => Promise<ChatChannel | null>;
  refreshChannels: () => Promise<void>;
  refreshMessages: (channelId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [presence, setPresence] = useState<PresenceData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const presenceRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate total unread
  const totalUnread = channels.reduce((sum, ch) => sum + ch.unreadCount, 0);

  // Fetch channels
  const refreshChannels = useCallback(async () => {
    if (status !== "authenticated") return;
    
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels || []);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  }, [status]);

  // Fetch messages for a channel
  const refreshMessages = useCallback(async (channelId: string) => {
    if (status !== "authenticated") return;
    
    try {
      const res = await fetch(`/api/chat/${channelId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [status]);

  // Fetch presence
  const fetchPresence = useCallback(async () => {
    if (status !== "authenticated") return;
    
    try {
      const res = await fetch("/api/chat/presence");
      if (res.ok) {
        const data = await res.json();
        setPresence(data);
      }
    } catch (error) {
      console.error("Error fetching presence:", error);
    }
  }, [status]);

  // Update presence (heartbeat)
  const updatePresence = useCallback(async () => {
    if (status !== "authenticated") return;
    
    try {
      await fetch("/api/chat/presence", { method: "POST" });
    } catch (error) {
      console.error("Error updating presence:", error);
    }
  }, [status]);

  // Send message
  const sendMessage = useCallback(async (
    content: string,
    mentions?: Array<{ id: string; name: string }>,
    parentId?: string
  ) => {
    if (!currentChannel || status !== "authenticated") return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chat/${currentChannel.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mentions, parentId }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        refreshChannels();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentChannel, status, refreshChannels]);

  // Mark channel as read
  const markAsRead = useCallback(async (channelId: string) => {
    try {
      await fetch(`/api/chat/${channelId}/read`, { method: "POST" });
      setChannels((prev) =>
        prev.map((ch) =>
          ch.id === channelId ? { ...ch, unreadCount: 0 } : ch
        )
      );
      if (currentChannel?.id === channelId) {
        setCurrentChannel((prev) => prev ? { ...prev, unreadCount: 0 } : null);
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }, [currentChannel]);

  // Create channel
  const createChannel = useCallback(async (
    name: string,
    type: string,
    participantIds?: string[]
  ): Promise<ChatChannel | null> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, participantIds }),
      });
      
      if (res.ok) {
        const data = await res.json();
        refreshChannels();
        return data.channel;
      }
    } catch (error) {
      console.error("Error creating channel:", error);
    }
    return null;
  }, [refreshChannels]);

  // Open/close chat
  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);

  // Set current channel and load messages
  const handleSetCurrentChannel = useCallback(async (channel: ChatChannel | null) => {
    setCurrentChannel(channel);
    if (channel) {
      await refreshMessages(channel.id);
      await markAsRead(channel.id);
    } else {
      setMessages([]);
    }
  }, [refreshMessages, markAsRead]);

  // Initial load
  useEffect(() => {
    if (status === "authenticated") {
      refreshChannels();
      fetchPresence();
      updatePresence();
    }
  }, [status, refreshChannels, fetchPresence, updatePresence]);

  // Polling for updates
  useEffect(() => {
    if (status !== "authenticated") return;

    // Poll channels every 10 seconds
    pollingRef.current = setInterval(() => {
      refreshChannels();
      if (currentChannel) {
        refreshMessages(currentChannel.id);
      }
    }, 10000);

    // Poll presence every 30 seconds
    presenceRef.current = setInterval(() => {
      fetchPresence();
      updatePresence();
    }, 30000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (presenceRef.current) clearInterval(presenceRef.current);
    };
  }, [status, refreshChannels, refreshMessages, currentChannel, fetchPresence, updatePresence]);

  const value: ChatContextType = {
    channels,
    currentChannel,
    messages,
    presence,
    isOpen,
    isLoading,
    totalUnread,
    setCurrentChannel: handleSetCurrentChannel,
    openChat,
    closeChat,
    toggleChat,
    sendMessage,
    markAsRead,
    createChannel,
    refreshChannels,
    refreshMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
