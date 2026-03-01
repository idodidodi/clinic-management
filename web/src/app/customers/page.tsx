'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Customer {
    id: string;
    name: string;
    cell_phone: string | null;
    email: string | null;
    tariff_default: number;
    tariff_parents: number;
    is_split_bill: boolean;
}

import { useAdmin } from '@/lib/AdminContext';

export default function CustomersPage() {
    const { isAdmin } = useAdmin();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    // ... (keep state)
    const [formData, setFormData] = useState({
        name: '',
        cell_phone: '',
        email: '',
        tariff_default: 300,
        tariff_parents: 450,
        is_split_bill: false
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        setLoading(true);
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching customers:', error);
        } else {
            setCustomers(data || []);
        }
        setLoading(false);
    }

    const handleOpenModal = (customer: Customer | null = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                name: customer.name,
                cell_phone: customer.cell_phone || '',
                email: customer.email || '',
                tariff_default: customer.tariff_default,
                tariff_parents: customer.tariff_parents,
                is_split_bill: customer.is_split_bill || false
            });
        } else {
            setEditingCustomer(null);
            setFormData({
                name: '',
                cell_phone: '',
                email: '',
                tariff_default: 300,
                tariff_parents: 450,
                is_split_bill: false
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (editingCustomer) {
            // Update
            const { error } = await supabase
                .from('customers')
                .update(formData)
                .eq('id', editingCustomer.id);

            if (error) console.error('Error updating customer:', error);
        } else {
            // Create
            const { error } = await supabase
                .from('customers')
                .insert([formData]);

            if (error) console.error('Error creating customer:', error);
        }

        handleCloseModal();
        fetchCustomers();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;

        setLoading(true);
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting customer:', error);
        }
        fetchCustomers();
    };

    return (
        <div className="p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-sans tracking-tight">Customer Management</h1>
                    <p className="text-gray-600">
                        {isAdmin ? 'Full control over client details and tariffs.' : 'View client directory and add new customers.'}
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors shadow-md font-bold"
                >
                    + Add New Customer
                </button>
            </header>

            {loading && customers.length === 0 ? (
                <div className="flex justify-center p-12 text-gray-400">Loading customers...</div>
            ) : (
                <>
                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {customers.map((customer) => (
                            <div key={customer.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                                        <p className="text-sm text-gray-500">{customer.cell_phone || 'No phone'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Tariffs</p>
                                        <p className="text-sm font-bold text-blue-600">₪{customer.tariff_default} / ₪{customer.tariff_parents}</p>
                                    </div>
                                </div>

                                {isAdmin ? (
                                    <div className="flex gap-2 pt-2 border-t border-gray-50">
                                        <button
                                            onClick={() => handleOpenModal(customer)}
                                            className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(customer.id)}
                                            className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-2 bg-gray-50 rounded-xl text-gray-400 text-[10px] font-black uppercase tracking-wider mt-2">
                                        Admin access required to edit
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-hidden bg-white shadow-sm border border-gray-200 rounded-xl">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Tariffs</th>
                                    {isAdmin && <th className="px-6 py-3 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{customer.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{customer.cell_phone || 'N/A'}</div>
                                            <div className="text-xs text-gray-400">{customer.email || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                            ₪{customer.tariff_default} / ₪{customer.tariff_parents}
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleOpenModal(customer)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4 font-bold"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer.id)}
                                                    className="text-red-600 hover:text-red-900 font-bold"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {customers.length === 0 && (
                        <div className="p-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200 shadow-sm">
                            No customers found. Start by adding one!
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <header className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-black"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-black"
                                        value={formData.cell_phone}
                                        onChange={(e) => setFormData({ ...formData, cell_phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-black"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Tariff (₪)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-black"
                                        value={formData.tariff_default}
                                        onChange={(e) => setFormData({ ...formData, tariff_default: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Tariff (₪)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-black"
                                        value={formData.tariff_parents}
                                        onChange={(e) => setFormData({ ...formData, tariff_parents: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <input
                                    type="checkbox"
                                    id="is_split_bill"
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={formData.is_split_bill}
                                    onChange={(e) => setFormData({ ...formData, is_split_bill: e.target.checked })}
                                />
                                <label htmlFor="is_split_bill" className="text-sm font-bold text-blue-900 cursor-pointer">
                                    Split bill 50/50 between parents
                                    <span className="block text-[10px] font-medium text-blue-700 uppercase tracking-tight mt-0.5">
                                        Child meetings will require two payments
                                    </span>
                                </label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : (editingCustomer ? 'Save Changes' : 'Add Customer')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
