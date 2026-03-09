'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store';

/** Persisted root state includes _persist added by redux-persist. */
type PersistedRootState = RootState & { _persist?: { rehydrated?: boolean } };

/**
 * Guards /dashboard and all nested routes. Waits for redux-persist rehydration
 * before deciding auth, so a reload does not falsely redirect to /login.
 * Unauthenticated users are redirected to /login once rehydration is complete.
 */
export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const token = useAppSelector((state) => state.auth.token);
    const rehydrated = useAppSelector((state: PersistedRootState) => state._persist?.rehydrated === true);
    const [allowed, setAllowed] = useState<boolean | null>(null);

    useEffect(() => {
        if (!rehydrated) {
            return;
        }
        if (token) {
            setAllowed(true);
            return;
        }
        router.replace('/login');
        setAllowed(false);
    }, [rehydrated, token, router]);

    // Show loading until rehydration is complete, then until we've decided allow/redirect.
    if (!rehydrated || allowed !== true) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--bg-body)]">
                <div className="h-8 w-8 rounded-full border-2 border-[var(--primary)]/30 border-t-[var(--primary)] animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
