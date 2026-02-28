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
        const stored = localStorage.getItem('clinic_admin_session');
        if (stored === 'true') {
            setIsAdminState(true);
        }
    }, []);

    const setIsAdmin = (value: boolean) => {
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
