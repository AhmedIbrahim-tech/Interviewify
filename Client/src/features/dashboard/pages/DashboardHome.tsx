"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/features/dashboard/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import {
    FolderOpen,
    FileQuestion,
    Users,
    ArrowUpRight,
    Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import { accountService, StatsDto } from '@/services/accountService';
import { categoryService } from '@/services/categoryService';
import { Category } from '@/types/category';

const DashboardHome = () => {
    const [stats, setStats] = useState<StatsDto | null>(null);
    const [recentCategories, setRecentCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [statsRes, catRes] = await Promise.all([
                    accountService.getStats(),
                    categoryService.getAllCategories(),
                ]);
                if (statsRes.isSuccess && statsRes.data) setStats(statsRes.data);
                if (catRes.isSuccess && catRes.data) {
                    const sorted = [...catRes.data].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 10);
                    setRecentCategories(sorted);
                }
            } catch {
                // leave stats/categories as default
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <DashboardLayout>
            <PageHeader
                title="Dashboard"
                subtitle="Welcome back! Here's what's happening with your platform."
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatsCard
                    title="Total Categories"
                    value={loading ? '—' : (stats?.categoryCount ?? 0)}
                    icon={FolderOpen}
                    color="primary"
                />
                <StatsCard
                    title="Active Questions"
                    value={loading ? '—' : (stats?.questionCount ?? 0)}
                    icon={FileQuestion}
                    color="info"
                />
                <StatsCard
                    title="Registered Users"
                    value={loading ? '—' : (stats?.userCount != null ? stats.userCount : '—')}
                    icon={Users}
                    color="success"
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)]">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-light)]">
                        <div>
                            <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Recent Categories</h3>
                            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Latest learning paths</p>
                        </div>
                        <Link
                            href="/dashboard/categories"
                            className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                        >
                            View All
                            <ArrowUpRight size={13} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--border-light)] bg-[var(--surface-elevated)]">
                                    <th className="px-6 py-3 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Modules</th>
                                    <th className="px-6 py-3 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-[var(--text-muted)] text-sm">Loading…</td>
                                    </tr>
                                ) : recentCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-[var(--text-muted)] text-sm">No categories yet.</td>
                                    </tr>
                                ) : (
                                    recentCategories.map((cat) => (
                                        <tr key={cat.id} className="border-b border-[var(--border-light)] last:border-0 hover:bg-[var(--surface-elevated)] transition-colors">
                                            <td className="px-6 py-3.5">
                                                <span className="text-[13px] font-semibold text-[var(--text-primary)]">{cat.name}</span>
                                            </td>
                                            <td className="px-6 py-3.5 text-[13px] text-[var(--text-secondary)]">{cat.subCategories?.length ?? 0}</td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${cat.isActive !== false ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--warning-light)] text-[var(--warning)]'}`}>
                                                    {cat.isActive !== false ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)] p-6">
                        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-4">Quick links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/dashboard/categories" className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                                    <LinkIcon size={14} /> Categories
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/questions" className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                                    <LinkIcon size={14} /> Questions
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/users" className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                                    <LinkIcon size={14} /> Users
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardHome;
