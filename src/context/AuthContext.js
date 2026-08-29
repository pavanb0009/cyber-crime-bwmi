import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(isSupabaseConfigured);
    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }
        let active = true;
        void supabase.auth.getSession().then(({ data }) => {
            if (!active)
                return;
            setUser(data.session?.user ?? null);
            setLoading(false);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });
        return () => {
            active = false;
            listener.subscription.unsubscribe();
        };
    }, []);
    const value = useMemo(() => ({
        user,
        loading,
        configured: isSupabaseConfigured,
        async signIn(email, password) {
            if (!supabase)
                throw new Error('Online login is not configured yet.');
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error)
                throw error;
        },
        async signUp(email, password) {
            if (!supabase)
                throw new Error('Online login is not configured yet.');
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error)
                throw error;
            return { confirmationRequired: !data.session };
        },
        async signOut() {
            if (!supabase)
                return;
            const { error } = await supabase.auth.signOut();
            if (error)
                throw error;
        },
    }), [loading, user]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth must be used inside AuthProvider.');
    return context;
}
