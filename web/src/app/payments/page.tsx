import React from 'react';

const mockMeetings = [
    { id: 'm1', customerName: 'John Doe', date: '2026-02-21', type: 'CHILD', cost: 300, is_paid: false },
    { id: 'm2', customerName: 'Jane Smith', date: '2026-02-20', type: 'PARENT', cost: 350, is_paid: true },
    { id: 'm3', customerName: 'John Doe', date: '2026-02-18', type: 'CHILD', cost: 300, is_paid: false },
];

const mockPayments = [
    { id: 'p1', payer: 'John Doe', amount: 300, date: '2026-02-20', method: 'BIT' },
    { id: 'p2', payer: 'Jane Smith', amount: 350, date: '2026-02-19', method: 'PAYBOX' },
];

export default function ReconciliationPage() {
    return (
        <div className="p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 text-black">Reconciliation</h1>
                    <p className="text-gray-600">Match payments to meetings to verify accounts.</p>
                </div>
                <div className="flex gap-4">
                    <button className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors">
                        Report New Payment
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Unpaid Meetings Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900 text-black">Unpaid Meetings</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {mockMeetings.filter(m => !m.is_paid).map((meeting) => (
                            <div key={meeting.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-all">
                                <div>
                                    <p className="font-semibold text-gray-900 text-black">{meeting.customerName}</p>
                                    <p className="text-sm text-gray-500">{meeting.date} • {meeting.type}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-blue-600">₪{meeting.cost}</p>
                                    <button className="text-xs text-blue-600 hover:underline">Mark as Paid</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Payments Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900 text-black">Unallocated Payments</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {mockPayments.map((payment) => (
                            <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-all">
                                <div>
                                    <p className="font-semibold text-gray-900 text-black">{payment.payer}</p>
                                    <p className="text-sm text-gray-500">{payment.date} • {payment.method}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">₪{payment.amount}</p>
                                    <button className="text-xs text-green-600 hover:underline">Allocate to Meeting</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
