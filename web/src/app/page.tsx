'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/lib/AdminContext';

export default function Dashboard() {
  const { isAdmin } = useAdmin();
  const [stats, setStats] = useState({
    earnings: 0,
    openMeetings: 0,
    activeCustomers: 0
  });
  const [recentMeetings, setRecentMeetings] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const [manualSplit, setManualSplit] = useState(false);

  // Quick Report State
  const [reportType, setReportType] = useState<'MEETING' | 'PAYMENT'>('MEETING');
  const [formData, setFormData] = useState({
    customer_id: '',
    new_customer_name: '',
    new_customer_phone: '',
    date: new Date().toISOString().split('T')[0],
    type: 'CHILD',
    custom_cost: '',
    amount: '',
    method: 'BIT',
    payer_name: ''
  });

  useEffect(() => {
    fetchDashboardData();
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    // Fetch more details to show them in the form
    const { data } = await supabase.from('customers').select('id, name, cell_phone, tariff_default, tariff_parents, is_split_bill').order('name');
    setCustomers(data || []);
  }

  async function fetchDashboardData() {
    setLoading(true);
    // 1. Fetch Stats
    const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    const { count: meetingCount } = await supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true })
      .or('is_paid.eq.false,is_paid_secondary.eq.false');
    const { data: paymentsData } = await supabase.from('payments').select('amount');

    const totalEarnings = paymentsData?.reduce((sum, p) => sum + p.amount, 0) || 0;

    setStats({
      earnings: totalEarnings,
      openMeetings: meetingCount || 0,
      activeCustomers: customerCount || 0
    });

    // 2. Recent Meetings
    const { data: mData } = await supabase
      .from('meetings')
      .select('id, date, type, is_paid, customer:customers(name)')
      .order('date', { ascending: false })
      .limit(5);

    setRecentMeetings(mData || []);

    // 3. Recent Payments
    const { data: pData } = await supabase
      .from('payments')
      .select('id, date, amount, method, payer_name, screenshot_url')
      .order('date', { ascending: false })
      .limit(5);

    setRecentPayments(pData || []);
    setLoading(false);
  }

  const handleQuickReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalCustomerId = formData.customer_id;

    // Handle New Customer Creation
    if (isNewCustomer) {
      const { data: newCust, error: custError } = await supabase
        .from('customers')
        .insert([{
          name: formData.new_customer_name,
          cell_phone: formData.new_customer_phone,
          tariff_default: 300,
          tariff_parents: 450
        }])
        .select()
        .single();

      if (custError) {
        console.error('Error creating customer:', custError);
        setLoading(false);
        return;
      }
      finalCustomerId = newCust.id;
    }

    // Handle Screenshot Upload
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

    if (reportType === 'MEETING') {
      const selectedCustomer = customers.find(c => c.id === finalCustomerId);
      const isSplitMeeting = manualSplit || (selectedCustomer?.is_split_bill && formData.type === 'CHILD');

      const { error } = await supabase.from('meetings').insert([{
        customer_id: finalCustomerId,
        date: formData.date,
        type: formData.type,
        custom_cost: formData.custom_cost ? parseInt(formData.custom_cost) : null,
        is_paid: false,
        is_paid_secondary: !isSplitMeeting
      }]);
      if (error) console.error(error);
    } else {
      const selectedCustomer = isNewCustomer ? { name: formData.new_customer_name } : customers.find(c => c.id === finalCustomerId);
      const { error } = await supabase.from('payments').insert([{
        customer_id: finalCustomerId,
        date: formData.date,
        amount: parseInt(formData.amount),
        method: formData.method,
        payer_name: formData.payer_name || selectedCustomer?.name || 'Unknown',
        screenshot_url: screenshotUrl || null
      }]);
      if (error) console.error(error);
    }

    setIsModalOpen(false);
    setIsNewCustomer(false);
    setScreenshot(null);
    setManualSplit(false);
    setFormData({
      customer_id: '',
      new_customer_name: '',
      new_customer_phone: '',
      date: new Date().toISOString().split('T')[0],
      type: 'CHILD',
      custom_cost: '',
      amount: '',
      method: 'BIT',
      payer_name: ''
    });
    fetchDashboardData();
    fetchCustomers();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Install Banner (Mobile Only) */}
      <div className="mb-6 md:hidden">
        <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-xl shadow-blue-100 flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-black leading-tight italic">Install for Full App Experience</h3>
            <p className="text-[10px] font-bold opacity-90 mt-1 uppercase tracking-wider">Tap Share <span className="text-sm">⎋</span> then "Add to Home Screen"</p>
          </div>
        </div>
      </div>

      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Therapist Dashboard</h1>
          <p className="text-sm md:text-base text-gray-500">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto rounded-xl bg-blue-600 px-6 py-3 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          + Quick Report
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Earnings</p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">₪{stats.earnings.toLocaleString()}</p>
          <p className="mt-1 text-xs text-green-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Confirmed payments
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Open Meetings</p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">{stats.openMeetings}</p>
          <p className="mt-1 text-xs text-blue-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Pending payment
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Customers</p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">{stats.activeCustomers}</p>
          <p className="mt-1 text-xs text-gray-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> Total registered
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Meetings */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Recent Meetings</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentMeetings.map((meeting) => (
              <div key={meeting.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100">
                <div>
                  <p className="font-bold text-gray-900">{meeting.customer?.name}</p>
                  <p className="text-xs text-gray-500 font-medium">{new Date(meeting.date).toLocaleDateString()} • {meeting.type}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${meeting.is_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {meeting.is_paid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            ))}
            {recentMeetings.length === 0 && <p className="p-8 text-center text-gray-400 text-sm">No meetings recorded yet.</p>}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Recent Payments</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100">
                <div>
                  <p className="font-bold text-gray-900">{payment.payer_name}</p>
                  <p className="text-xs text-gray-500 font-medium tracking-tight">
                    {new Date(payment.date).toLocaleDateString()} • {payment.method}
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
                <p className="font-black text-green-600 text-lg">₪{payment.amount}</p>
              </div>
            ))}
            {recentPayments.length === 0 && <p className="p-8 text-center text-gray-400 text-sm">No payments recorded yet.</p>}
          </div>
        </div>
      </div>

      {/* Quick Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom md:zoom-in duration-300">
            <header className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <div className="flex bg-gray-200 p-1 rounded-xl w-full mr-4">
                <button
                  onClick={() => setReportType('MEETING')}
                  className={`flex-1 py-2 rounded-lg text-sm font-black transition-all ${reportType === 'MEETING' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                >
                  Meeting
                </button>
                <button
                  onClick={() => setReportType('PAYMENT')}
                  className={`flex-1 py-2 rounded-lg text-sm font-black transition-all ${reportType === 'PAYMENT' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                >
                  Payment
                </button>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <form onSubmit={handleQuickReport} className="p-6 space-y-5 pb-10 md:pb-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer</label>
                  <button
                    type="button"
                    onClick={() => setIsNewCustomer(!isNewCustomer)}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-wider hover:underline"
                  >
                    {isNewCustomer ? 'Select Existing' : '+ New Customer'}
                  </button>
                </div>

                {isNewCustomer ? (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <input
                      required
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-black font-bold"
                      value={formData.new_customer_name}
                      onChange={(e) => setFormData({ ...formData, new_customer_name: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Phone (Optional)"
                      className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-black font-bold"
                      value={formData.new_customer_phone}
                      onChange={(e) => setFormData({ ...formData, new_customer_phone: e.target.value })}
                    />
                  </div>
                ) : (
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
                )}
              </div>

              {/* Selected Customer Details */}
              {!isNewCustomer && formData.customer_id && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                  {(() => {
                    const cust = customers.find(c => c.id === formData.customer_id);
                    if (!cust) return null;
                    return (
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <p className="font-black text-gray-400 uppercase tracking-widest mb-1">Contact</p>
                          <p className="font-bold text-gray-700">{cust.cell_phone || 'No phone'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-gray-400 uppercase tracking-widest mb-1">
                            Tariffs {cust.is_split_bill && <span className="text-blue-600 ml-1 font-black">[Splits Bill]</span>}
                          </p>
                          <p className="font-bold text-gray-700">₪{cust.tariff_default} / ₪{cust.tariff_parents}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Date</label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-black font-bold"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              {reportType === 'MEETING' ? (
                <>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Meeting Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['CHILD', 'PARENT', 'PARENTS'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, type })}
                          className={`py-3 rounded-xl border-2 text-xs font-black transition-all ${formData.type === type ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 text-black'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.type === 'CHILD' && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-1">
                      <input
                        type="checkbox"
                        id="manual-split"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={manualSplit}
                        onChange={(e) => setManualSplit(e.target.checked)}
                      />
                      <label htmlFor="manual-split" className="text-[10px] font-black text-blue-800 uppercase tracking-widest cursor-pointer">
                        Split cost 50/50 with secondary parent
                      </label>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Custom Cost (Optional)</label>
                    <input
                      type="number"
                      placeholder="Uses default tariff"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-black font-bold"
                      value={formData.custom_cost}
                      onChange={(e) => setFormData({ ...formData, custom_cost: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Amount (₪)</label>
                      <input
                        required
                        type="number"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-black font-bold text-lg"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Method</label>
                      <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-black font-bold appearance-none"
                        value={formData.method}
                        onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                      >
                        <option value="BIT">Bit</option>
                        <option value="PAYBOX">Paybox</option>
                        <option value="CASH">Cash</option>
                        <option value="BANK_DRAFT">Bank Draft</option>
                      </select>
                    </div>
                  </div>

                  {/* Screenshot Upload for Bit/Paybox */}
                  {(formData.method === 'BIT' || formData.method === 'PAYBOX') && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Screenshot (Optionl)</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="screenshot-upload"
                          onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                        />
                        <label
                          htmlFor="screenshot-upload"
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

                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Payer Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="Defaults to customer"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-black font-bold"
                      value={formData.payer_name}
                      onChange={(e) => setFormData({ ...formData, payer_name: e.target.value })}
                    />
                  </div>
                </>
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
                  className={`flex-1 px-4 py-4 text-white rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 ${reportType === 'MEETING' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-green-600 hover:bg-green-700 shadow-green-100'}`}
                >
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
