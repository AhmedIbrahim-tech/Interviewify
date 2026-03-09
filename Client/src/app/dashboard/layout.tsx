'use client';

import { DashboardAuthGuard } from '@/components/layout/DashboardAuthGuard';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardAuthGuard>{children}</DashboardAuthGuard>;
}
