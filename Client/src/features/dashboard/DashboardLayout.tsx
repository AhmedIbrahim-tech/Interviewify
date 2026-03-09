"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { getFileUrl } from '@/config/api';
import {
    LayoutDashboard,
    FolderOpen,
    FileQuestion,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    Search,
    Bell,
    Menu,
    X,
    ExternalLink,
    ChevronDown,
    User
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { siteConfig } from '@/config/site';

const navSections = [
    {
        label: 'HOME',
        items: [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ]
    },
    {
        label: 'MANAGEMENT',
        items: [
            { href: '/dashboard/categories', label: 'Categories', icon: FolderOpen },
            { href: '/dashboard/questions', label: 'Questions', icon: FileQuestion },
            { href: '/dashboard/users', label: 'Users', icon: Users },
        ]
    },
    {
        label: 'SETTINGS',
        items: [
            { href: '/dashboard/settings', label: 'Account Settings', icon: Settings },
        ]
    }
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleSignOut = async () => {
        await dispatch(logoutUser());
        router.push('/login');
    };

    const avatarUrl = user?.profilePicture
        ? getFileUrl(user.profilePicture)
        : (user?.name
            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=5d87ff&color=fff&size=128&font-size=0.4&bold=true&rounded=true`
            : null);

    // Generate breadcrumb from pathname
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumb = pathSegments.map((segment, index) => ({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: '/' + pathSegments.slice(0, index + 1).join('/')
    }));

    return (
        <div className="flex min-h-screen bg-[var(--bg-body)]">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-[var(--overlay)] z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full z-40 w-[270px] bg-[var(--bg-sidebar)]
                border-r border-[var(--border-color)] flex flex-col
                transition-transform duration-300
                lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-[var(--border-light)]">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[var(--primary)] flex items-center justify-center font-bold text-white text-base shadow-md shadow-[var(--primary)]/20 select-none">
                            I
                        </div>
                        <span className="font-bold text-[var(--text-primary)] text-[17px] tracking-tight">
                            {siteConfig.name}
                        </span>
                    </Link>
                    <button
                        className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--surface-elevated)] text-[var(--text-muted)]"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                    {navSections.map((section) => (
                        <div key={section.label}>
                            <p className="px-3 mb-2 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                {section.label}
                            </p>
                            <div className="space-y-0.5">
                                {section.items
                                    .filter((item) => (item.href === '/dashboard/users' ? user?.role === 'Admin' : true))
                                    .map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all
                                                ${isActive
                                                    ? 'bg-[var(--primary-light)] text-[var(--primary)] font-semibold'
                                                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]'
                                                }
                                            `}
                                        >
                                            <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                                            <span>{item.label}</span>
                                            {isActive && (
                                                <ChevronRight size={14} className="ml-auto opacity-60" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* View Website Link */}
                    <div className="pt-2">
                        <Link
                            href="/"
                            target="_blank"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--primary)] transition-all"
                        >
                            <ExternalLink size={18} strokeWidth={1.8} />
                            <span>View Website</span>
                        </Link>
                    </div>
                </nav>

                {/* User Card */}
                <div className="p-4 border-t border-[var(--border-light)]">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--primary-light)]">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[var(--surface)]">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt={user?.name || 'User'}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="h-full w-full bg-[var(--primary)] flex items-center justify-center text-sm font-bold text-white">
                                    {user?.name?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                                {user?.name || 'Admin'}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] truncate">
                                {user?.role || 'Administrator'}
                            </p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            title="Sign Out"
                            className="p-2 rounded-lg hover:bg-[var(--danger-soft)] text-[var(--danger)] transition-colors flex-shrink-0"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 lg:ml-[270px] flex flex-col min-h-screen">
                {/* Topbar */}
                <header className="sticky top-0 z-20 bg-[var(--bg-topbar)] border-b border-[var(--border-color)] px-6 h-[65px] flex items-center justify-between">
                    {/* Left: menu toggle + breadcrumb */}
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)]"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>

                        {/* Breadcrumb */}
                        <nav className="hidden md:flex items-center gap-1.5 text-[13px]">
                            {breadcrumb.map((crumb, index) => (
                                <React.Fragment key={crumb.href}>
                                    {index > 0 && (
                                        <ChevronRight size={14} className="text-[var(--text-light)]" />
                                    )}
                                    {index === breadcrumb.length - 1 ? (
                                        <span className="font-semibold text-[var(--text-primary)]">
                                            {crumb.label}
                                        </span>
                                    ) : (
                                        <Link href={crumb.href} className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                                            {crumb.label}
                                        </Link>
                                    )}
                                </React.Fragment>
                            ))}
                        </nav>
                    </div>

                    {/* Right: utilities */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        {/* Search */}
                        <div className="hidden md:flex items-center relative">
                            <Search size={16} className="absolute left-3 text-[var(--text-light)]" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-[200px] bg-[var(--bg-body)] border border-[var(--border-color)] rounded-lg py-2 pl-9 pr-4 text-[13px] text-[var(--text-secondary)] placeholder:text-[var(--text-light)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2.5 rounded-lg hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] transition-colors">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[var(--danger)] rounded-full"></span>
                        </button>

                        {/* Divider */}
                        <div className="h-6 w-px bg-[var(--border-color)] mx-1"></div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                                    {avatarUrl ? (
                                        <Image src={avatarUrl} alt={user?.name || ''} width={32} height={32} className="object-cover" unoptimized />
                                    ) : (
                                        <div className="h-full w-full bg-[var(--primary)] flex items-center justify-center text-xs font-bold text-white">
                                            {user?.name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>
                                <ChevronDown size={14} className="text-[var(--text-muted)]" />
                            </button>

                            {/* Dropdown */}
                            {profileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-[240px] bg-[var(--surface-elevated)] rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-lg)] z-20 animate-scale-in overflow-hidden">
                                        <div className="p-4 border-b border-[var(--border-light)]">
                                            <p className="font-semibold text-[var(--text-primary)] text-[14px]">{user?.name || 'Admin'}</p>
                                            <p className="text-[12px] text-[var(--text-muted)]">{user?.email || ''}</p>
                                        </div>
                                        <div className="p-2">
                                            <Link
                                                href="/dashboard/settings"
                                                onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] transition-colors"
                                            >
                                                <User size={16} />
                                                My Profile
                                            </Link>
                                            <Link
                                                href="/dashboard/settings"
                                                onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] transition-colors"
                                            >
                                                <Settings size={16} />
                                                Account Settings
                                            </Link>
                                        </div>
                                        <div className="p-2 border-t border-[var(--border-light)]">
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[13px] text-[var(--danger)] hover:bg-[var(--danger-light)] transition-colors"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:px-10 lg:py-8 overflow-x-hidden">
                    <div className="animate-fade-in w-full h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
