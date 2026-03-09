"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/features/dashboard/DashboardLayout';
import { siteConfig } from '@/config/site';
import { PageHeader } from '@/components/shared/PageHeader';
import {
    User as UserIcon,
    Lock,
    Mail,
    Save,
    Camera,
    MapPin,
    Globe,
    Briefcase,
    Settings,
    Image as ImageIcon,
    Pen,
    Twitter,
    Facebook,
    Youtube,
    Instagram,
    Plus,
    Users as UsersIcon,
    FileText,
    Grid,
    Heart
} from 'lucide-react';
import { accountService, UpdateProfileDto, ChangePasswordDto } from '@/services/accountService';
import { uploadService } from '@/services/uploadService';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/store/hooks';
import { getFileUrl } from '@/config/api';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { updateCredentials } from '@/store/slices/authSlice';

type SettingsTabId = 'profile';

const SettingsPage = () => {
    const dispatch = useDispatch();
    const { user, token, refreshToken } = useAppSelector(state => state.auth);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<SettingsTabId>('profile');
    const [profileData, setProfileData] = useState<UpdateProfileDto>({
        fullName: '',
        email: '',
        profilePicture: ''
    });
    const [passwordData, setPasswordData] = useState<ChangePasswordDto>({
        currentPassword: '',
        newPassword: ''
    });
    const [counts, setCounts] = useState<{ categories: number; questions: number; users: number | null }>({ categories: 0, questions: 0, users: null });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await accountService.getProfile();
                if (response.isSuccess && response.data) {
                    setProfileData({
                        fullName: response.data.fullName,
                        email: response.data.email,
                        profilePicture: response.data.profilePicture || ''
                    });
                }
            } catch (err) {
                toast.error("Failed to load profile");
            }
        };

        const fetchCounts = async () => {
            try {
                const statsRes = await accountService.getStats();
                if (statsRes.isSuccess && statsRes.data) {
                    setCounts({
                        categories: statsRes.data.categoryCount,
                        questions: statsRes.data.questionCount,
                        users: statsRes.data.userCount ?? null
                    });
                }
            } catch {
                // leave counts at 0
            }
        };

        fetchProfile();
        fetchCounts();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await accountService.updateProfile(profileData);
            if (response.isSuccess) {
                toast.success("Profile updated successfully");
                if (response.data) {
                    dispatch(updateCredentials({
                        user: {
                            id: Number(response.data.id),
                            name: response.data.fullName,
                            email: response.data.email,
                            role: response.data.role,
                            profilePicture: response.data.profilePicture
                        },
                        token: token!,
                        refreshToken: refreshToken!
                    }));
                }
            } else {
                toast.error(response.message || "Update failed");
            }
        } catch (err) {
            toast.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size exceeds 2MB");
            return;
        }

        setLoading(true);
        try {
            const response = await uploadService.upload(file, 'profiles');
            if (response.isSuccess && response.data) {
                const imageUrl = response.data;
                const updateRes = await accountService.updateProfile({
                    ...profileData,
                    profilePicture: imageUrl
                });

                if (updateRes.isSuccess) {
                    toast.success("Image updated successfully");
                    setProfileData(prev => ({ ...prev, profilePicture: imageUrl }));

                    if (user) {
                        dispatch(updateCredentials({
                            user: { ...user, profilePicture: imageUrl },
                            token: token!,
                            refreshToken: refreshToken!
                        }));
                    }
                } else {
                    toast.error(updateRes.message || "Failed to update profile");
                }
            } else {
                toast.error(response.message || "Upload failed");
            }
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <PageHeader
                title="Account Settings"
                breadcrumbs={[{ label: 'Dashboard' }, { label: 'Account Settings' }]}
            />

            {/* Profile Header Card */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden mb-8">
                {/* Cover Photo */}
                <div className="h-[240px] w-full relative group">
                    <Image
                        src="/images/profile-wallpaper.png"
                        alt="Cover"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                </div>

                {/* Profile Meta Section */}
                <div className="px-10 pb-6 relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center md:items-start gap-8 pt-6">
                        {/* Column 1: Stats (Left) */}
                        <div className="flex items-center justify-center md:justify-start gap-8 md:gap-10 order-2 md:order-1 mt-4 md:mt-16">
                            <div className="text-center group cursor-default">
                                <FileText size={18} className="mx-auto mb-2 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                                <p className="text-[18px] font-black text-[var(--text-primary)]">{counts.categories}</p>
                                <p className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Categories</p>
                            </div>
                            <div className="text-center group cursor-default">
                                <UsersIcon size={18} className="mx-auto mb-2 text-gray-400 group-hover:text-[var(--primary)] transition-colors" />
                                <p className="text-[18px] font-black text-[var(--text-primary)]">{counts.questions}</p>
                                <p className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Questions</p>
                            </div>
                            <div className="text-center group cursor-default">
                                <UserIcon size={18} className="mx-auto mb-2 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                <p className="text-[18px] font-black text-[var(--text-primary)]">{counts.users ?? '—'}</p>
                                <p className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Users</p>
                            </div>
                        </div>

                        {/* Column 2: Avatar & Identity (Center) */}
                        <div className="flex flex-col items-center order-1 md:order-2 -mt-20 md:-mt-24">
                            <div className="relative group">
                                <div className="h-[140px] w-[140px] rounded-full p-[3px] bg-linear-to-tr from-blue-500 via-purple-500 to-pink-500 shadow-2xl">
                                    <div className="h-full w-full rounded-full border-[5px] border-white bg-[var(--surface)] overflow-hidden relative">
                                        {profileData.profilePicture ? (
                                            <Image
                                                src={getFileUrl(profileData.profilePicture)}
                                                alt="Avatar"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)]">
                                                <UserIcon size={48} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <label className="absolute bottom-1 right-1 p-2.5 bg-[var(--surface)] rounded-full text-[var(--primary)] border border-[var(--border-color)] cursor-pointer hover:bg-[var(--surface-elevated)] shadow-lg tracking-normal transition-all hover:scale-110 active:scale-95 group-hover:rotate-6">
                                    <Camera size={16} />
                                    <input type="file" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>

                            <div className="text-center mt-5">
                                <h2 className="text-[22px] font-black text-[var(--text-primary)] tracking-tight leading-none mb-1">
                                    {profileData.fullName || 'User Name'}
                                </h2>
                                <p className="text-[13px] text-[var(--text-muted)] font-bold uppercase tracking-[0.1em]">
                                    {user?.role || 'Designer'}
                                </p>
                            </div>
                        </div>

                        {/* Column 3: Socials & Button (Right) */}
                        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 order-3 mt-4 md:mt-16">
                            <div className="flex items-center gap-2 mr-2">
                                <button className="h-8 w-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--muted-text)] flex items-center justify-center hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all shadow-[var(--shadow-sm)]">
                                    <Facebook size={14} fill="currentColor" />
                                </button>
                                <button className="h-8 w-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--muted-text)] flex items-center justify-center hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all shadow-[var(--shadow-sm)]">
                                    <Twitter size={14} fill="currentColor" />
                                </button>
                                <button className="h-8 w-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--muted-text)] flex items-center justify-center hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all shadow-[var(--shadow-sm)]">
                                    <Youtube size={14} fill="currentColor" />
                                </button>
                                <button className="h-8 w-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--muted-text)] flex items-center justify-center hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all shadow-[var(--shadow-sm)]">
                                    <Instagram size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation (Optional - keeping consistent with current app) */}
                    <div className="flex items-center justify-center border-t border-[var(--border-light)] mt-10">
                        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar pt-1">
                            {[
                                { id: 'profile' as const, label: 'Settings', icon: Settings },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-1 py-4 text-[13px] font-black border-b-2 transition-all whitespace-nowrap
                                        ${activeTab === tab.id
                                            ? 'border-[var(--primary)] text-[var(--primary)]'
                                            : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Intro & Photos */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Introduction */}
                    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-7">
                        <h3 className="text-[17px] font-bold text-[var(--text-primary)] mb-5">Introduction</h3>
                        <p className="text-[14px] text-[var(--text-muted)] leading-relaxed mb-6">
                            Hello, I am {profileData.fullName}. I'm a passionate developer focused on building scalable interview systems.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3.5">
                                <div className="p-2 rounded-lg bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                                    <Briefcase size={16} />
                                </div>
                                <span className="text-[13px] text-[var(--text-secondary)] font-medium">Engineer at <strong>{siteConfig.name}</strong></span>
                            </div>
                            <div className="flex items-center gap-3.5">
                                <div className="p-2 rounded-lg bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                                    <Mail size={16} />
                                </div>
                                <span className="text-[13px] text-[var(--text-secondary)] font-medium">{profileData.email}</span>
                            </div>
                            <div className="flex items-center gap-3.5">
                                <div className="p-2 rounded-lg bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                                    <Globe size={16} />
                                </div>
                                <span className="text-[13px] text-[var(--text-secondary)] font-medium">www.interviewify.local</span>
                            </div>
                            <div className="flex items-center gap-3.5">
                                <div className="p-2 rounded-lg bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                                    <MapPin size={16} />
                                </div>
                                <span className="text-[13px] text-[var(--text-secondary)] font-medium">Cairo, Egypt</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Feed or Forms */}
                <div className="lg:col-span-8">
                    <div className="space-y-8">
                        {/* Actual Settings Form */}
                        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm">
                            <div className="px-7 py-5 border-b border-[var(--border-light)]">
                                <h3 className="text-[16px] font-bold text-[var(--text-primary)]">Account Settings</h3>
                            </div>
                            <form onSubmit={handleUpdateProfile} className="p-7 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-bold text-[var(--text-primary)] px-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileData.fullName}
                                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                            className="w-full bg-[var(--bg-body)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-[14px] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-bold text-[var(--text-primary)] px-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            className="w-full bg-[var(--bg-body)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-[14px] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="flex items-center gap-2 px-8 py-3 bg-[var(--primary)] text-white rounded-xl text-[14px] font-bold hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-[var(--primary)]/20 disabled:opacity-60"
                                    >
                                        <Save size={16} />
                                        {loading ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
