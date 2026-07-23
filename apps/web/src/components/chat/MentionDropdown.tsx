"use client";

import { type ChatUser } from "./ChatProvider";

interface MentionDropdownProps {
  users: ChatUser[];
  selectedIndex: number;
  onSelect: (user: ChatUser) => void;
  searchQuery: string;
}

export default function MentionDropdown({
  users,
  selectedIndex,
  onSelect,
  searchQuery,
}: MentionDropdownProps) {
  if (users.length === 0) {
    return (
      <div className="px-3 py-2 text-sm text-gray-500">
        No users found
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
      <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-700">
        {searchQuery ? `Results for "${searchQuery}"` : "Team members"}
      </div>
      {users.map((user, index) => (
        <button
          key={user.id}
          onClick={() => onSelect(user)}
          className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${
            index === selectedIndex ? "bg-blue-50 dark:bg-blue-900/20" : ""
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-900 dark:text-white truncate">{user.name}</div>
            {user.role && (
              <div className="text-xs text-gray-500">{user.role}</div>
            )}
          </div>
          {index === selectedIndex && (
            <span className="text-xs text-blue-600">Press Enter</span>
          )}
        </button>
      ))}
    </div>
  );
}
