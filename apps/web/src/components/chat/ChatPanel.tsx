"use client";

import { useState, useEffect, useRef } from "react";
import { useChat, type ChatChannel, type ChatMessage, type ChatUser } from "./ChatProvider";
import MessageInput from "./MessageInput";

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

export default function ChatPanel() {
  const {
    channels,
    currentChannel,
    messages,
    presence,
    isOpen,
    closeChat,
    setCurrentChannel,
    createChannel,
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
  const generalChannels = channels.filter((c) => c.type === "GENERAL" || c.type === "TEAM");

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

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-96 h-[550px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-4 py-3 bg-blue-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="font-semibold">Messages</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className="hover:bg-blue-700 rounded p-1 transition-colors"
            title="New chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button onClick={closeChat} className="hover:bg-blue-700 rounded p-1 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {showNewChat && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowUserSearch(true)}
                className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                + New Direct Message
              </button>
            </div>
          )}

          {showUserSearch && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                autoFocus
              />
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => startDM(user)}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs">
                        {getNameInitial(user.name)}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{user.name || "Unknown"}</span>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => { setShowUserSearch(false); setSearchQuery(""); }}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {/* Online Users */}
            {presence && presence.online.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-1">
                  Team Online ({presence.online.length})
                </div>
                {presence.online.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => startDM(user)}
                    className="w-full px-2 py-1.5 text-left flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <div className="relative">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs text-white">
                        {getNameInitial(user.name)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-50 dark:border-gray-900" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{user.name || "Unknown"}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Direct Messages */}
            {directMessages.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-1">Direct Messages</div>
                {directMessages.map((channel) => (
                  <ChannelItem
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
              <div className="p-2">
                <div className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-1">Channels</div>
                {generalChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isActive={currentChannel?.id === channel.id}
                    onClick={() => setCurrentChannel(channel)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentChannel ? (
            <>
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currentChannel.type === "DIRECT" ? "💬 " : "# "}
                    {currentChannel.name || "Unnamed"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {currentChannel.participants.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs"
                      title={p.name || "Unknown"}
                    >
                      {getNameInitial(p.name)}
                    </div>
                  ))}
                  {currentChannel.participants.length > 3 && (
                    <span className="text-xs text-gray-500">+{currentChannel.participants.length - 3}</span>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageItem key={message.id} message={message} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <MessageInput channelId={currentChannel.id} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Choose from the list or start a new chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Channel List Item Component
function ChannelItem({
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
      className={`w-full px-2 py-2 text-left flex items-center gap-2 rounded-lg transition-colors ${
        isActive ? "bg-blue-100 dark:bg-blue-900/30" : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <span className="text-sm">{getChannelIcon()}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm truncate ${isActive ? "text-blue-700 dark:text-blue-300 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
            {channel.name || "Unnamed"}
          </span>
          {channel.unreadCount > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {channel.unreadCount > 9 ? "9+" : channel.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// Message Item Component
function MessageItem({ message }: { message: ChatMessage }) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-medium flex-shrink-0">
          {message.user.avatarUrl ? (
            <img src={message.user.avatarUrl} alt={message.user.name || "User"} className="w-8 h-8 rounded-full" />
          ) : (
            getNameInitials(message.user.name)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-gray-900 dark:text-white text-sm">
              {message.user.name || "Unknown User"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(message.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 break-words">
            {parseContentWithMentions(message.content, message.mentions)}
          </p>
          {message.replyCount > 0 && (
            <button className="text-xs text-blue-600 hover:text-blue-700 mt-1">
              {message.replyCount} {message.replyCount === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      </div>

      {message.replies && message.replies.length > 0 && (
        <div className="ml-12 pl-3 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
          {message.replies.map((reply) => (
            <div key={reply.id} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xs font-medium flex-shrink-0">
                {reply.user.avatarUrl ? (
                  <img src={reply.user.avatarUrl} alt={reply.user.name || "User"} className="w-6 h-6 rounded-full" />
                ) : (
                  getNameInitials(reply.user.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-gray-900 dark:text-white text-xs">
                    {reply.user.name || "Unknown User"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(reply.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5 break-words">
                  {parseContentWithMentions(reply.content, reply.mentions)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
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
