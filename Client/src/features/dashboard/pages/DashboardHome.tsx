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

            <div className="page-dashboard__stats">
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

            <div className="page-dashboard__main-grid">
                <div className="page-dashboard__card page-dashboard__col-span-2">
                    <div className="page-dashboard__card-header">
                        <div>
                            <h3 className="page-dashboard__card-title">Recent Categories</h3>
                            <p className="page-dashboard__card-subtitle">Latest learning paths</p>
                        </div>
                        <Link href="/dashboard/categories" className="page-dashboard__card-link">
                            View All
                            <ArrowUpRight size={13} />
                        </Link>
                    </div>
                    <div className="page-dashboard__table-wrap">
                        <table className="page-dashboard__table">
                            <thead>
                                <tr>
                                    <th className="page-dashboard__th">Name</th>
                                    <th className="page-dashboard__th">Modules</th>
                                    <th className="page-dashboard__th">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="page-dashboard__cell-center">Loading…</td>
                                    </tr>
                                ) : recentCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="page-dashboard__cell-center">No categories yet.</td>
                                    </tr>
                                ) : (
                                    recentCategories.map((cat) => (
                                        <tr key={cat.id} className="page-dashboard__row">
                                            <td className="page-dashboard__td">
                                                <span className="page-dashboard__cell-name">{cat.name}</span>
                                            </td>
                                            <td className="page-dashboard__td page-dashboard__cell-muted">{cat.subCategories?.length ?? 0}</td>
                                            <td className="page-dashboard__td">
                                                <span className={`page-dashboard__badge ${cat.isActive !== false ? 'page-dashboard__badge--success' : 'page-dashboard__badge--warning'}`}>
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
                    <div className="page-dashboard__sidebar-card">
                        <h3 className="page-dashboard__sidebar-title">Quick links</h3>
                        <ul className="page-dashboard__quick-links">
                            <li>
                                <Link href="/dashboard/categories" className="page-dashboard__quick-link">
                                    <LinkIcon size={14} /> Categories
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/questions" className="page-dashboard__quick-link">
                                    <LinkIcon size={14} /> Questions
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/users" className="page-dashboard__quick-link">
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
