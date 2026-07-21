"use client";

import Link from "next/link";

export default function BillingSettingsPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/settings" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          ← Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="text-gray-600 mt-1">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Current Plan</h2>
            <p className="text-3xl font-bold text-blue-600 mt-2">Free</p>
            <p className="text-sm text-gray-500 mt-1">Phase 1 - Foundation</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Features */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">💳</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Premium Plans Coming Soon</h2>
        <p className="text-gray-600 mb-6">
          Soon you&apos;ll be able to upgrade your plan to unlock:
        </p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-600 mb-6">
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>Unlimited brands and clients</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>Priority Odoo integration</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>Advanced analytics and reports</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>Custom domain for client portal</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>Priority support</span>
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
