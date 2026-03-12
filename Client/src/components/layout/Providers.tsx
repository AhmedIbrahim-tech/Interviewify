'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import { setStore } from '@/config/api';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { NotifyToaster } from '@/components/layout/NotifyToaster';
import 'sonner/dist/styles.css';

// Inject store into API client so interceptors can read auth state (avoids circular dependency)
setStore(store);

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <ThemeProvider>
                    {children}
                    <NotifyToaster />
                </ThemeProvider>
            </PersistGate>
        </Provider>
    );
}
