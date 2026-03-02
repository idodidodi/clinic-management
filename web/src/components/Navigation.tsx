'use client';

import React from 'react';
import Link from 'next/link';
import { useAdmin } from '@/lib/AdminContext';

export function Navigation({ children }: { children: React.ReactNode }) {
    const { isAdmin, signOut, user } = useAdmin();
    const isLocalhost = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    return (
        <div className="flex min-h-screen bg-gray-50 pb-20 md:pb-0 font-sans">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-8 hidden md:flex h-screen sticky top-0">
                <div className="text-xl font-bold text-blue-600 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">CM</div>
                        <span>Clinic Manager</span>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 flex-grow">
                    <Link href="/" className="px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-semibold transition-all flex items-center gap-3">
                        <span className="text-xl">📊</span> Dashboard
                    </Link>
                    <Link href="/customers" className="px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-semibold transition-all flex items-center gap-3">
                        <span className="text-xl">👥</span> Customers
                    </Link>
                    <Link href="/payments" className="px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-semibold transition-all flex items-center gap-3">
                        <span className="text-xl">💰</span> Reconciliation
                    </Link>
                </nav>

                {/* Admin/User Info in Sidebar (Desktop) */}
                <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Signed In As</p>
                        <p className="text-xs font-bold text-gray-700 truncate mb-3">{user?.email}</p>
                        <button
                            onClick={signOut}
                            className="w-full py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border-2 bg-white border-gray-100 text-red-600 hover:border-red-200 hover:bg-red-50"
                        >
                            Sign Out 🚪
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden min-h-screen">
                {children}
            </main>

            {/* Mobile Bottom Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center md:hidden z-50 backdrop-blur-md bg-white/80">
                <Link href="/" className="flex flex-col items-center gap-1 text-gray-600 active:text-blue-600 transition-colors">
                    <span className="text-2xl">📊</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
                </Link>
                <Link href="/customers" className="flex flex-col items-center gap-1 text-gray-600 active:text-blue-600 transition-colors">
                    <span className="text-2xl">👥</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Clients</span>
                </Link>
                <Link href="/payments" className="flex flex-col items-center gap-1 text-gray-600 active:text-blue-600 transition-colors">
                    <span className="text-2xl">💰</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Cash</span>
                </Link>
                {/* Mobile Sign Out */}
                <button
                    onClick={signOut}
                    className="flex flex-col items-center gap-1 text-gray-400 opacity-50 active:text-red-600 transition-colors"
                >
                    <span className="text-2xl">🚪</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Exit</span>
                </button>
            </nav>
        </div>
    );
}
