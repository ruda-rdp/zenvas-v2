"use client";

import { useState, useEffect, useRef } from "react";
import { useChat, type ChatChannel, type ChatMessage, type ChatUser } from "@/components/chat/ChatProvider";
import MessageInput from "@/components/chat/MessageInput";
import Link from "next/link";

// Helper function for safe string operations
const getNameInitial = (name: string | null | undefined): string => {
  return (name || "?").charAt(0).toUpperCase();
};

const getNameInitials = (name: string | null | undefined): string => {
  return (name || "?")
    .split(" ")
    .map((n) => n[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function ChatPage() {
  const {
    channels,
    currentChannel,
    messages,
    presence,
    setCurrentChannel,
    createChannel,
    totalUnread,
  } = useChat();

  const [showNewChat, setShowNewChat] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Search users for new DM
  useEffect(() => {
    if (showUserSearch && searchQuery.length > 0) {
      const searchUsers = async () => {
        try {
          const res = await fetch(`/api/chat/users/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data.users || []);
          }
        } catch (error) {
          console.error("Error searching users:", error);
        }
      };
      const debounce = setTimeout(searchUsers, 300);
      return () => clearTimeout(debounce);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, showUserSearch]);

  // Group channels by type
  const directMessages = channels.filter((c) => c.type === "DIRECT");
  const generalChannels = channels.filter((c) => c.type === "GENERAL" || c.type === "TEAM" || c.type === "PROJECT");

  // Start DM with user
  const startDM = async (user: ChatUser) => {
    const channel = await createChannel(user.name || "Chat", "DIRECT", [user.id]);
    if (channel) {
      setCurrentChannel(channel);
    }
    setShowUserSearch(false);
    setShowNewChat(false);
    setSearchQuery("");
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="New chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* New Chat Modal */}
        {showNewChat && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">New Message</span>
              <button
                onClick={() => { setShowNewChat(false); setShowUserSearch(false); setSearchQuery(""); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {showUserSearch ? (
              <div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  autoFocus
                />
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => startDM(user)}
                        className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm">
                          {getNameInitial(user.name)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name || "Unknown"}</div>
                          <div className="text-xs text-gray-500">{user.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowUserSearch(true)}
                className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                + New Direct Message
              </button>
            )}
          </div>
        )}

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto">
          {/* Team Online */}
          {presence && presence.online.length > 0 && (
            <div className="p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">
                Team Online ({presence.online.length})
              </div>
              {presence.online.map((user) => (
                <button
                  key={user.id}
                  onClick={() => startDM(user)}
                  className="w-full px-2 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                      {getNameInitial(user.name)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name || "Unknown"}</div>
                    <div className="text-xs text-green-600">Active now</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Direct Messages */}
          {directMessages.length > 0 && (
            <div className="p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">Direct Messages</div>
              {directMessages.map((channel) => (
                <ChatChannelItem
                  key={channel.id}
                  channel={channel}
                  isActive={currentChannel?.id === channel.id}
                  onClick={() => setCurrentChannel(channel)}
                />
              ))}
            </div>
          )}

          {/* Channels */}
          {generalChannels.length > 0 && (
            <div className="p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">Channels</div>
              {generalChannels.map((channel) => (
                <ChatChannelItem
                  key={channel.id}
                  channel={channel}
                  isActive={currentChannel?.id === channel.id}
                  onClick={() => setCurrentChannel(channel)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {channels.length === 0 && !presence?.online.length && (
            <div className="p-6 text-center">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start by messaging someone</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-full">
        {currentChannel ? (
          <>
            {/* Channel Header */}
            <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                  {currentChannel.type === "DIRECT" ? "💬" : "#"}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{currentChannel.name || "Unnamed"}</h3>
                  <p className="text-xs text-gray-500">
                    {(currentChannel.participants || []).length} participant{(currentChannel.participants || []).length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(currentChannel.participants || []).slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300"
                    title={p.name || "Unknown"}
                  >
                    {getNameInitial(p.name)}
                  </div>
                ))}
                {(currentChannel.participants || []).length > 5 && (
                  <span className="text-xs text-gray-500">+{(currentChannel.participants || []).length - 5}</span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No messages yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Be the first to say something!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessageItem key={message.id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <MessageInput channelId={currentChannel.id} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Welcome to Messages</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Select a conversation or start a new one</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start a conversation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Channel Item Component
function ChatChannelItem({
  channel,
  isActive,
  onClick,
}: {
  channel: ChatChannel;
  isActive: boolean;
  onClick: () => void;
}) {
  const getChannelIcon = () => {
    switch (channel.type) {
      case "DIRECT": return "💬";
      case "PROJECT": return "📁";
      default: return "#";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full px-2 py-3 text-left flex items-center gap-3 rounded-lg transition-colors ${
        isActive ? "bg-blue-100 dark:bg-blue-900/30" : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
        {getChannelIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm truncate ${isActive ? "font-semibold text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"}`}>
            {channel.name || "Unnamed"}
          </span>
          {channel.unreadCount > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {channel.unreadCount > 9 ? "9+" : channel.unreadCount}
            </span>
          )}
        </div>
        {channel.lastMessage && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {channel.lastMessage.user?.name || "Unknown"}: {channel.lastMessage.content?.slice(0, 30) || ""}
          </p>
        )}
      </div>
    </button>
  );
}

// Message Item Component
function ChatMessageItem({ message }: { message: ChatMessage }) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex gap-4 group">
      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0">
        {message.user.avatarUrl ? (
          <img src={message.user.avatarUrl} alt={message.user.name || "User"} className="w-10 h-10 rounded-full" />
        ) : (
          getNameInitials(message.user.name)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-gray-900 dark:text-white">{message.user.name || "Unknown User"}</span>
          <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mt-1 break-words">
          {parseContentWithMentions(message.content, message.mentions)}
        </p>
        {message.replyCount > 0 && (
          <button className="text-xs text-blue-600 hover:text-blue-700 mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            {message.replyCount} {message.replyCount === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>
    </div>
  );
}

function parseContentWithMentions(content: string, mentions: Array<{ id: string; name: string }>) {
  const parts = content.split(/(@\[[^\]]+\])/g);
  
  return parts.map((part, i) => {
    if (part.startsWith("@[")) {
      const match = part.match(/@\[([^:]+):([^\]]+)\]/);
      if (match) {
        return (
          <span key={i} className="text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-1 rounded">
            @{match[2]}
          </span>
        );
      }
    }
    return part;
  });
}
