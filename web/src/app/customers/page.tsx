import React from 'react';

const mockCustomers = [
    { id: '1', name: 'John Doe', cell_phone: '050-1234567', email: 'john@example.com', tariff_default: 300, tariff_parents: 450 },
    { id: '2', name: 'Jane Smith', cell_phone: '052-7654321', email: 'jane@example.com', tariff_default: 250, tariff_parents: 350 },
    { id: '3', name: 'Robert Brown', cell_phone: '054-0000000', email: 'robert@example.com', tariff_default: 300, tariff_parents: 450 },
];

export default function CustomersPage() {
    return (
        <div className="p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 text-black">Customer Management</h1>
                    <p className="text-gray-600">Full control over client details and tariffs.</p>
                </div>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">
                    Add New Customer
                </button>
            </header>

            <div className="overflow-hidden bg-white shadow-sm border border-gray-200 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Tariff</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Tariff</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mockCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 text-black">{customer.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{customer.cell_phone}</div>
                                    <div className="text-sm text-gray-400">{customer.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-black font-semibold">
                                    ₪{customer.tariff_default}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-black font-semibold">
                                    ₪{customer.tariff_parents}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                    <button className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
