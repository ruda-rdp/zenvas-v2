"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useChat, type ChatUser } from "./ChatProvider";

interface MessageInputProps {
  channelId: string;
  onReply?: (messageId: string) => void;
  parentId?: string | null;
  onCancelReply?: () => void;
}

interface MentionUser {
  id: string;
  name: string;
}

export default function MessageInput({ channelId, parentId, onCancelReply }: MessageInputProps) {
  const { sendMessage, isLoading } = useChat();
  const [content, setContent] = useState("");
  const [mentions, setMentions] = useState<MentionUser[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionUsers, setMentionUsers] = useState<ChatUser[]>([]);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

  // Search users when typing mention
  useEffect(() => {
    if (showMentionDropdown && mentionSearch.length >= 0) {
      const searchUsers = async () => {
        try {
          const res = await fetch(`/api/chat/users/search?q=${encodeURIComponent(mentionSearch)}`);
          if (res.ok) {
            const data = await res.json();
            setMentionUsers(data.users || []);
            setSelectedMentionIndex(0);
          }
        } catch (error) {
          console.error("Error searching users:", error);
        }
      };
      const debounce = setTimeout(searchUsers, 200);
      return () => clearTimeout(debounce);
    }
  }, [mentionSearch, showMentionDropdown]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    // Check if user is typing a mention
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@([^@]*)$/);
    
    if (mentionMatch) {
      setShowMentionDropdown(true);
      setMentionSearch(mentionMatch[1]);
      setMentionStartIndex(cursorPos - mentionMatch[0].length);
    } else {
      setShowMentionDropdown(false);
      setMentionSearch("");
    }
    
    setContent(value);
  };

  // Insert mention into text
  const insertMention = (user: ChatUser) => {
    const beforeMention = content.slice(0, mentionStartIndex);
    const afterMention = content.slice(inputRef.current?.selectionStart || mentionStartIndex);
    const mentionText = `@[${user.id}:${user.name}] `;
    
    const newContent = beforeMention + mentionText + afterMention;
    setContent(newContent);
    setMentions((prev) => [...prev, { id: user.id, name: user.name }]);
    setShowMentionDropdown(false);
    setMentionSearch("");
    setSelectedMentionIndex(0);
    
    // Focus back on input
    setTimeout(() => {
      const newCursorPos = mentionStartIndex + mentionText.length;
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      inputRef.current?.focus();
    }, 0);
  };

  // Handle keyboard navigation in mention dropdown
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionDropdown && mentionUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedMentionIndex((prev) => 
          prev < mentionUsers.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedMentionIndex((prev) => 
          prev > 0 ? prev - 1 : mentionUsers.length - 1
        );
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(mentionUsers[selectedMentionIndex]);
      } else if (e.key === "Escape") {
        setShowMentionDropdown(false);
        setMentionSearch("");
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Send message
  const handleSend = async () => {
    if (!content.trim() || isLoading) return;
    
    await sendMessage(content, mentions, parentId || undefined);
    setContent("");
    setMentions([]);
    setShowMentionDropdown(false);
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 relative">
      {/* Reply indicator */}
      {parentId && (
        <div className="mb-2 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
          <span className="text-xs text-blue-600 dark:text-blue-400">
            Replying to a message
          </span>
          <button
            onClick={onCancelReply}
            className="text-blue-600 hover:text-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Mention dropdown */}
      {showMentionDropdown && mentionUsers.length > 0 && (
        <div
          ref={mentionDropdownRef}
          className="absolute bottom-full left-4 right-4 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50"
        >
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-700">
            Mention someone
          </div>
          {mentionUsers.map((user, index) => (
            <button
              key={user.id}
              onClick={() => insertMention(user)}
              className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                index === selectedMentionIndex ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm text-gray-900 dark:text-white">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (use @ to mention)"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={1}
            disabled={isLoading}
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />
        </div>
        <button
          type="submit"
          disabled={!content.trim() || isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
      
      {/* Hint */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Type <span className="text-blue-500">@</span> to mention team members
      </p>
    </div>
  );
}
