"use client";

import React from 'react';
import DashboardLayout from '@/features/dashboard/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import {
    FolderOpen,
    FileQuestion,
    Users,
    TrendingUp,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    HelpCircle,
    BarChart3,
    MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';

const DashboardHome = () => {
    const recentCategories = [
        { id: '1', name: 'C# Advanced Mastery', modules: 12, questions: 85, status: 'Active' },
        { id: '2', name: 'ASP.NET Core Architecture', modules: 8, questions: 120, status: 'Active' },
        { id: '3', name: 'Entity Framework Core', modules: 6, questions: 45, status: 'Draft' },
        { id: '4', name: 'Design Patterns', modules: 10, questions: 95, status: 'Active' },
    ];

    return (
        <DashboardLayout>
            <PageHeader
                title="Dashboard"
                subtitle="Welcome back! Here's what's happening with your platform."
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 stagger-children">
                <StatsCard
                    title="Total Categories"
                    value="12"
                    icon={FolderOpen}
                    color="primary"
                    trend={{ value: '+12%', isUp: true }}
                />
                <StatsCard
                    title="Active Questions"
                    value="450"
                    icon={FileQuestion}
                    color="info"
                    trend={{ value: '+8%', isUp: true }}
                />
                <StatsCard
                    title="Registered Users"
                    value="2,400"
                    icon={Users}
                    color="success"
                    trend={{ value: '+24%', isUp: true }}
                />
                <StatsCard
                    title="Success Rate"
                    value="78%"
                    icon={TrendingUp}
                    color="warning"
                    trend={{ value: '+5%', isUp: true }}
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Categories Table */}
                <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)]">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-light)]">
                        <div>
                            <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Recent Categories</h3>
                            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Latest learning paths added</p>
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
                                <tr className="border-b border-[var(--border-light)] bg-[#f8fafc]">
                                    <th className="px-6 py-3 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Modules</th>
                                    <th className="px-6 py-3 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Questions</th>
                                    <th className="px-6 py-3 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentCategories.map((cat) => (
                                    <tr key={cat.id} className="border-b border-[var(--border-light)] last:border-0 hover:bg-[#f8fafc] transition-colors">
                                        <td className="px-6 py-3.5">
                                            <span className="text-[13px] font-semibold text-[var(--text-primary)]">{cat.name}</span>
                                        </td>
                                        <td className="px-6 py-3.5 text-[13px] text-[var(--text-secondary)]">{cat.modules}</td>
                                        <td className="px-6 py-3.5 text-[13px] text-[var(--text-secondary)]">{cat.questions}</td>
                                        <td className="px-6 py-3.5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${cat.status === 'Active'
                                                ? 'bg-[var(--success-light)] text-[var(--success)]'
                                                : 'bg-[var(--warning-light)] text-[var(--warning)]'
                                                }`}>
                                                {cat.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <button className="p-1.5 rounded-md hover:bg-gray-100 text-[var(--text-muted)] transition-colors">
                                                <MoreHorizontal size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Performance Card */}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 size={16} className="text-[var(--primary)]" />
                            <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">Platform Growth</h3>
                        </div>
                        <p className="text-[12px] text-[var(--text-muted)] mb-5 leading-relaxed">
                            Your Web API modules have seen a <span className="text-[var(--success)] font-semibold">+24%</span> increase in interaction this week.
                        </p>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-[12px] font-medium text-[var(--text-secondary)]">Questions Completed</span>
                                    <span className="text-[12px] font-semibold text-[var(--primary)]">78%</span>
                                </div>
                                <div className="h-2 bg-[var(--bg-body)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--primary)] w-[78%] rounded-full transition-all" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-[12px] font-medium text-[var(--text-secondary)]">User Engagement</span>
                                    <span className="text-[12px] font-semibold text-[var(--success)]">65%</span>
                                </div>
                                <div className="h-2 bg-[var(--bg-body)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--success)] w-[65%] rounded-full transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Help */}
                    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)] p-6">
                        <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mb-4">Quick Resources</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-[13px] text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                                <CheckCircle2 size={16} className="text-[var(--success)] flex-shrink-0 mt-0.5" />
                                <span>How to bulk upload questions?</span>
                            </li>
                            <li className="flex items-start gap-3 text-[13px] text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                                <Clock size={16} className="text-[var(--warning)] flex-shrink-0 mt-0.5" />
                                <span>Schedule system maintenance</span>
                            </li>
                            <li className="flex items-start gap-3 text-[13px] text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary)] transition-colors">
                                <HelpCircle size={16} className="text-[var(--info)] flex-shrink-0 mt-0.5" />
                                <span>Managing user roles & permissions</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardHome;
