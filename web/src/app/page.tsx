import React from 'react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-black">Clinic Management Dashboard</h1>
          <p className="text-gray-600">Overview of meetings, payments, and customers.</p>
        </div>
        <div className="flex gap-4">
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">
            Report Payment
          </button>
          <button className="rounded-lg bg-white border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
            New Customer
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Stats Section */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Earnings (This Month)</h3>
          <p className="mt-2 text-3xl font-bold text-black">₪12,400</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Open Meetings</h3>
          <p className="mt-2 text-3xl font-bold text-black">8</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Customers</h3>
          <p className="mt-2 text-3xl font-bold text-black">42</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Meetings */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-black">Recent Meetings</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all">
                <div>
                  <p className="font-medium text-gray-900 text-black">Customer Name {i}</p>
                  <p className="text-sm text-gray-500">Child Meeting • Feb 21, 2026</p>
                </div>
                <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                  Unpaid
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-black">Recent Payments</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all">
                <div>
                  <p className="font-medium text-gray-900 text-black">Payer Name {i}</p>
                  <p className="text-sm text-gray-500">Bit • ₪300 • Feb 20, 2026</p>
                </div>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Confirmed
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
