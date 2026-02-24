'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Meeting {
    id: string;
    customer_name: string;
    date: string;
    type: string;
    cost: number;
}

interface Payment {
    id: string;
    payer_name: string;
    amount: number;
    date: string;
    method: string;
}

export default function ReconciliationPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State for New Payment
    const [formData, setFormData] = useState({
        customer_id: '',
        payer_name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'BIT'
    });

    useEffect(() => {
        fetchData();
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        const { data } = await supabase.from('customers').select('id, name').order('name');
        setCustomers(data || []);
    }

    async function fetchData() {
        setLoading(true);
        // Fetch unpaid meetings with customer names
        const { data: meetingsData, error: meetingsError } = await supabase
            .from('meetings')
            .select(`
          id,
          date,
          type,
          custom_cost,
          customer:customers(name, tariff_default)
        `)
            .eq('is_paid', false)
            .order('date', { ascending: false });

        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .order('date', { ascending: false });

        if (!meetingsError && meetingsData) {
            setMeetings(meetingsData.map((m: any) => ({
                id: m.id,
                customer_name: m.customer.name,
                date: new Date(m.date).toLocaleDateString(),
                type: m.type,
                cost: m.custom_cost || m.customer.tariff_default
            })));
        }

        if (!paymentsError && paymentsData) {
            setPayments(paymentsData.map((p: any) => ({
                id: p.id,
                payer_name: p.payer_name,
                amount: p.amount,
                date: new Date(p.date).toLocaleDateString(),
                method: p.method
            })));
        }

        setLoading(false);
    }

    const handleMarkAsPaid = async (id: string) => {
        const { error } = await supabase
            .from('meetings')
            .update({ is_paid: true })
            .eq('id', id);

        if (error) console.error('Error marking as paid:', error);
        fetchData();
    };

    const handleReportPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const selectedCustomer = customers.find(c => c.id === formData.customer_id);

        const { error } = await supabase.from('payments').insert([{
            customer_id: formData.customer_id,
            payer_name: formData.payer_name || selectedCustomer?.name || 'Unknown',
            amount: parseInt(formData.amount),
            date: formData.date,
            method: formData.method
        }]);

        if (error) console.error('Error reporting payment:', error);

        setIsModalOpen(false);
        setFormData({
            customer_id: '',
            payer_name: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            method: 'BIT'
        });
        fetchData();
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
            <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Reconciliation</h1>
                    <p className="text-sm md:text-base text-gray-500">Match payments to meetings and verify accounts.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full md:w-auto rounded-xl bg-green-600 px-6 py-3 text-white font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 active:scale-95"
                >
                    <span className="text-xl">+</span> Report Payment
                </button>
            </header>

            {loading && meetings.length === 0 ? (
                <div className="flex justify-center p-12 text-gray-400 text-sm font-medium animate-pulse">Syncing with database...</div>
            ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Unpaid Meetings Section - Hidden on Mobile (Reporting Mode) */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900">Unpaid Meetings</h2>
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase">{meetings.length} Total</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {meetings.map((meeting) => (
                                <div key={meeting.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-all active:bg-gray-100">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="font-bold text-gray-900 truncate">{meeting.customer_name}</p>
                                        <p className="text-xs text-gray-500 font-medium">{meeting.date} • {meeting.type}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <p className="font-black text-blue-600 text-lg leading-none">₪{meeting.cost}</p>
                                        <button
                                            onClick={() => handleMarkAsPaid(meeting.id)}
                                            className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-100 font-black uppercase tracking-wider transition-colors"
                                        >
                                            Mark Paid
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {meetings.length === 0 && (
                                <div className="p-12 text-center text-gray-400 bg-white">
                                    <div className="text-3xl mb-2">🎉</div>
                                    <p className="text-sm font-medium">All meetings are paid!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Payments Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900">Recent Payments</h2>
                            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase">{payments.length} Logged</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {payments.map((payment) => (
                                <div key={payment.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-all active:bg-gray-100">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="font-bold text-gray-900 truncate">{payment.payer_name}</p>
                                        <p className="text-xs text-gray-500 font-medium">{payment.date} • {payment.method}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-green-600 text-lg">₪{payment.amount}</p>
                                    </div>
                                </div>
                            ))}
                            {payments.length === 0 && (
                                <div className="p-12 text-center text-gray-400 bg-white text-sm font-medium">
                                    No payments found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
                    <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom md:zoom-in duration-300">
                        <header className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Report Payment</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </header>

                        <form onSubmit={handleReportPayment} className="p-6 space-y-5 pb-10 md:pb-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Customer</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-black font-bold appearance-none"
                                    value={formData.customer_id}
                                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                >
                                    <option value="">Select a customer</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Payer Name (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Defaults to customer name"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all text-black font-bold"
                                    value={formData.payer_name}
                                    onChange={(e) => setFormData({ ...formData, payer_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Amount (₪)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all text-black font-bold text-lg"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all text-black font-bold"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['BIT', 'PAYBOX', 'CASH', 'BANK_DRAFT'].map((method) => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, method })}
                                            className={`py-3 rounded-xl border-2 text-[10px] font-black transition-all uppercase tracking-wider ${formData.method === method ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 text-black'}`}
                                        >
                                            {method.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-4 border-2 border-gray-100 rounded-2xl text-gray-500 font-black text-sm active:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-4 bg-green-600 text-white rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 shadow-green-100"
                                >
                                    Save Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
