"use client";

import Link from "next/link";

export default function WebhooksSettingsPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/settings" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          ← Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
        <p className="text-gray-600 mt-1">Send real-time events to your endpoints</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">🌐</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-gray-600 mb-6">
          Webhooks will be available soon. You&apos;ll be able to:
        </p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-600 mb-6">
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>Configure webhook URLs for events</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>Choose which events to send</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>View webhook delivery logs</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>Retry failed deliveries</span>
          </li>
        </ul>
        <Link
          href="/settings"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Settings
        </Link>
      </div>
    </div>
  );
}
