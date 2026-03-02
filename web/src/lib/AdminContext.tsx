'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AdminContextType {
    isAdmin: boolean;
    setIsAdmin: (value: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdminState] = useState(false);

    useEffect(() => {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocal) {
            setIsAdminState(false);
            localStorage.removeItem('clinic_admin_session');
            return;
        }

        const stored = localStorage.getItem('clinic_admin_session');
        if (stored === 'true') {
            setIsAdminState(true);
        }
    }, []);

    const setIsAdmin = (value: boolean) => {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocal && value) {
            alert('Admin mode is only available on localhost.');
            return;
        }
        setIsAdminState(value);
        localStorage.setItem('clinic_admin_session', value ? 'true' : 'false');
    };

    return (
        <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
            {children}
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
