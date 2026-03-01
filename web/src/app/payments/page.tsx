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
    screenshot_url?: string;
}

import { useAdmin } from '@/lib/AdminContext';

export default function ReconciliationPage() {
    const { isAdmin } = useAdmin();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [screenshot, setScreenshot] = useState<File | null>(null);

    // ... (keep state)
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
        const { data } = await supabase.from('customers').select('id, name, cell_phone, tariff_default, tariff_parents').order('name');
        setCustomers(data || []);
    }

    async function fetchData() {
        setLoading(true);
        // Fetch meetings with at least one unpaid part
        const { data: meetingsData, error: meetingsError } = await supabase
            .from('meetings')
            .select(`
          id,
          date,
          type,
          custom_cost,
          is_paid,
          is_paid_secondary,
          customer:customers(name, tariff_default, is_split_bill)
        `)
            .or('is_paid.eq.false,is_paid_secondary.eq.false')
            .order('date', { ascending: false });

        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .order('date', { ascending: false });

        if (!meetingsError && meetingsData) {
            const flattenedMeetings: Meeting[] = [];

            meetingsData.forEach((m: any) => {
                const totalCost = m.custom_cost || m.customer.tariff_default;
                const isSplit = m.customer.is_split_bill && m.type === 'CHILD';

                if (isSplit) {
                    // Add Part 1 if unpaid
                    if (!m.is_paid) {
                        flattenedMeetings.push({
                            id: `${m.id}_p1`,
                            customer_name: `${m.customer.name} (Part 1)`,
                            date: new Date(m.date).toLocaleDateString(),
                            type: m.type,
                            cost: totalCost / 2
                        });
                    }
                    // Add Part 2 if unpaid
                    if (!m.is_paid_secondary) {
                        flattenedMeetings.push({
                            id: `${m.id}_p2`,
                            customer_name: `${m.customer.name} (Part 2)`,
                            date: new Date(m.date).toLocaleDateString(),
                            type: m.type,
                            cost: totalCost / 2
                        });
                    }
                } else {
                    // Non-split meeting
                    flattenedMeetings.push({
                        id: m.id,
                        customer_name: m.customer.name,
                        date: new Date(m.date).toLocaleDateString(),
                        type: m.type,
                        cost: totalCost
                    });
                }
            });
            setMeetings(flattenedMeetings);
        }

        if (!paymentsError && paymentsData) {
            setPayments(paymentsData.map((p: any) => ({
                id: p.id,
                payer_name: p.payer_name,
                amount: p.amount,
                date: new Date(p.date).toLocaleDateString(),
                method: p.method,
                screenshot_url: p.screenshot_url
            })));
        }

        setLoading(false);
    }

    const handleMarkAsPaid = async (composedId: string) => {
        const [id, part] = composedId.split('_');

        let updateData = {};
        if (part === 'p1') {
            updateData = { is_paid: true };
        } else if (part === 'p2') {
            updateData = { is_paid_secondary: true };
        } else {
            // Non-split
            updateData = { is_paid: true, is_paid_secondary: true };
        }

        const { error } = await supabase
            .from('meetings')
            .update(updateData)
            .eq('id', id);

        if (error) console.error('Error marking as paid:', error);
        fetchData();
    };

    const handleReportPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const selectedCustomer = customers.find(c => c.id === formData.customer_id);

        let screenshotUrl = '';
        if (screenshot && (formData.method === 'BIT' || formData.method === 'PAYBOX')) {
            const fileName = `${Date.now()}_${screenshot.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('payment-screenshots')
                .upload(fileName, screenshot);

            if (uploadError) {
                console.error('Error uploading screenshot:', uploadError);
            } else if (uploadData) {
                const { data: publicUrlData } = supabase.storage
                    .from('payment-screenshots')
                    .getPublicUrl(uploadData.path);
                screenshotUrl = publicUrlData.publicUrl;
            }
        }

        const { error } = await supabase.from('payments').insert([{
            customer_id: formData.customer_id,
            payer_name: formData.payer_name || selectedCustomer?.name || 'Unknown',
            amount: parseInt(formData.amount),
            date: formData.date,
            method: formData.method,
            screenshot_url: screenshotUrl || null
        }]);

        if (error) console.error('Error reporting payment:', error);

        setIsModalOpen(false);
        setScreenshot(null);
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                        {isAdmin ? 'Reconciliation' : 'Payments'}
                    </h1>
                    <p className="text-sm md:text-base text-gray-500">
                        {isAdmin ? 'Match payments to meetings and verify accounts.' : 'Logged payments and on-the-go reporting.'}
                    </p>
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
                <div className={`grid grid-cols-1 gap-8 ${isAdmin ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'}`}>
                    {/* Unpaid Meetings Section - Admin Only */}
                    {isAdmin && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                    )}

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
                                        <p className="text-xs text-gray-500 font-medium">
                                            {payment.date} • {payment.method}
                                            {payment.screenshot_url && (
                                                <a
                                                    href={payment.screenshot_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="ml-2 text-blue-600 hover:underline font-bold"
                                                >
                                                    [View Screenshot 📸]
                                                </a>
                                            )}
                                        </p>
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

                        <form onSubmit={handleReportPayment} className="p-6 space-y-5 pb-10 md:pb-6 text-black">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Customer</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all text-black font-bold appearance-none"
                                    value={formData.customer_id}
                                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                >
                                    <option value="">Select a customer</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Customer Details Summary */}
                            {formData.customer_id && (
                                <div className="p-4 bg-green-50 rounded-xl border border-green-100 animate-in fade-in slide-in-from-top-2">
                                    {(() => {
                                        const cust = customers.find(c => c.id === formData.customer_id);
                                        if (!cust) return null;
                                        return (
                                            <div className="flex justify-between items-center text-xs">
                                                <div>
                                                    <p className="font-black text-green-400 uppercase tracking-widest mb-1">Contact</p>
                                                    <p className="font-bold text-green-800">{cust.cell_phone || 'No phone'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-green-400 uppercase tracking-widest mb-1">Tariffs</p>
                                                    <p className="font-bold text-green-800">₪{cust.tariff_default} / ₪{cust.tariff_parents}</p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

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

                            {/* Screenshot Upload for Bit/Paybox */}
                            {(formData.method === 'BIT' || formData.method === 'PAYBOX') && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Screenshot (Optional)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            id="payment-screenshot-upload"
                                            onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                                        />
                                        <label
                                            htmlFor="payment-screenshot-upload"
                                            className={`w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${screenshot ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-blue-200 hover:bg-blue-50'}`}
                                        >
                                            <span className="text-xl">{screenshot ? '✅' : '📸'}</span>
                                            <span className="text-xs font-bold truncate">
                                                {screenshot ? screenshot.name : `Upload ${formData.method} Screenshot`}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

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
