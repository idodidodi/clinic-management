'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

interface AdminContextType {
    isAdmin: boolean;
    user: any;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // Verify if email is in the authorized_users table
                const { data: authData } = await supabase
                    .from('authorized_users')
                    .select('email')
                    .eq('email', session.user.email)
                    .single();

                const hasAccess = !!authData;
                setUser(session.user);
                setIsAdmin(hasAccess);
            } else {
                setUser(null);
                setIsAdmin(false);
                if (pathname !== '/login') {
                    router.push('/login');
                }
            }
            setLoading(false);
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const { data: authData } = await supabase
                    .from('authorized_users')
                    .select('email')
                    .eq('email', session.user.email)
                    .single();

                const hasAccess = !!authData;
                setUser(session.user);
                setIsAdmin(hasAccess);
            } else {
                setUser(null);
                setIsAdmin(false);
                if (pathname !== '/login') {
                    router.push('/login');
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [pathname, router]);

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <AdminContext.Provider value={{ isAdmin, user, loading, signOut }}>
            {!loading && children}
            {loading && (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Verifying Identity...</p>
                    </div>
                </div>
            )}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}
