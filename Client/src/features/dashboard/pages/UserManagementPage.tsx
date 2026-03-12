"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/features/dashboard/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { DataGrid } from '@/components/shared/DataGrid';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LookupSelect } from '@/components/shared/LookupSelect';
import {
    Plus,
    Search,
    LayoutGrid,
    List,
    X,
    Pencil,
    Trash2,
    Mail,
    Shield,
    ToggleLeft,
    ToggleRight,
    Upload,
    Camera,
    User as UserIcon,
    Users as UsersIcon,
    ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchUsers, addUser, editUser, removeUser, toggleUserStatus } from '@/store/slices/userSlice';
import { fetchRoles } from '@/store/slices/lookupSlice';
import { User } from '@/types/user';
import { notify } from '@/lib/notify';
import { uploadService } from '@/services/uploadService';
import { getFileUrl } from '@/config/api';
import Image from 'next/image';

export interface UserFormState {
    fullName: string;
    email: string;
    role: string;
    password: string;
    profilePicture: string;
    imageFile?: File | null;
}

const UserManagementPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { items: users, loading, error } = useAppSelector(state => state.users);
    const { roles } = useAppSelector(state => state.lookups);

    useEffect(() => {
        if (user && user.role !== 'Admin') {
            router.replace('/dashboard');
        }
    }, [user, router]);

    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormState>({
        fullName: '',
        email: '',
        role: 'User',
        password: '',
        profilePicture: '',
        imageFile: null
    });
    const [confirmState, setConfirmState] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user?.role === 'Admin') {
            dispatch(fetchUsers());
        }
        dispatch(fetchRoles());
    }, [dispatch, user?.role]);

    const columns: Column<User>[] = [
        {
            header: 'User',
            key: 'fullName',
            render: (user: User) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-semibold text-[13px] overflow-hidden relative flex-shrink-0">
                        {user.profilePicture ? (
                            <Image src={getFileUrl(user.profilePicture)} alt={user.fullName} fill className="object-cover" unoptimized />
                        ) : (
                            user.fullName.charAt(0)
                        )}
                    </div>
                    <div>
                        <p className="text-[13px] font-semibold text-[var(--text-primary)]">{user.fullName}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{user.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Role',
            key: 'role',
            render: (user: User) => (
                <StatusBadge
                    label={user.role}
                    variant={user.role === 'Admin' ? 'primary' : 'default'}
                />
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (user: User) => (
                <button
                    onClick={() => dispatch(toggleUserStatus(Number(user.id)))}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${user.status === 'Active'
                        ? 'bg-[var(--success-light)] text-[var(--success)] hover:opacity-90'
                        : 'bg-[var(--danger-light)] text-[var(--danger)] hover:opacity-90'
                        }`}
                >
                    {user.status === 'Active' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    {user.status}
                </button>
            )
        }
    ];

    const renderGridItem = (user: User, _: number, actions?: React.ReactNode) => (
        <div key={user.id} className="group/card relative bg-[var(--card)] rounded-[2.5rem] border border-[var(--border-color)] shadow-[var(--shadow-card)] p-6 overflow-hidden hover:shadow-[var(--shadow-lg)] hover:border-[var(--primary)]/20 transition-all duration-500">
            {/* Background Decorative Icon */}
            <div className="absolute -right-8 -bottom-8 text-[var(--primary)]/5 -rotate-12 group-hover/card:scale-110 transiton-transform duration-700 pointer-events-none">
                <Shield size={160} strokeWidth={1} />
            </div>

            {/* Soft Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="h-16 w-16 rounded-[1.5rem] bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-[22px] overflow-hidden relative shadow-inner group-hover/card:rotate-3 transition-transform duration-500">
                    {user.profilePicture ? (
                        <Image src={getFileUrl(user.profilePicture)} alt={user.fullName} fill className="object-cover" unoptimized />
                    ) : (
                        user.fullName.charAt(0)
                    )}
                </div>
                {actions}
            </div>

            <div className="relative z-10">
                <h3 className="text-[18px] font-bold text-[var(--text-primary)] mb-1 group-hover/card:text-[var(--primary)] transition-colors duration-300 tracking-tight">{user.fullName}</h3>
                <p className="text-[13px] text-[var(--text-muted)] mb-5 flex items-center gap-1.5 font-medium">
                    <Mail size={14} className="opacity-70" /> {user.email}
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-[var(--border-light)]">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] shadow-sm">
                            <Shield size={14} />
                        </div>
                        <StatusBadge label={user.role} variant={user.role === 'Admin' ? 'primary' : 'default'} pulse={user.role === 'Admin'} />
                    </div>
                    <button
                        onClick={() => dispatch(toggleUserStatus(Number(user.id)))}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all duration-300 ${user.status === 'Active'
                            ? 'bg-[var(--success-light)] text-[var(--success)]'
                            : 'bg-[var(--danger-light)] text-[var(--danger)]'
                            } hover:shadow-md active:scale-95`}
                    >
                        {user.status}
                    </button>
                </div>
            </div>
        </div>
    );

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, userId?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            notify.error("File size exceeds 2MB");
            return;
        }

        if (userId) {
            setUploading(true);
            try {
                const response = await uploadService.upload(file, 'profiles');
                if (response.isSuccess) {
                    const imageUrl = response.data;
                    await dispatch(editUser({
                        id: userId,
                        data: { ...formData, profilePicture: imageUrl }
                    }));
                    notify.success("Image uploaded");
                    dispatch(fetchUsers());
                } else {
                    notify.error(response.message || "Upload failed");
                }
            } catch (err) {
                notify.error("Upload failed");
            } finally {
                setUploading(false);
            }
        } else {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePicture: reader.result as string }));
            };
            reader.readAsDataURL(file);
            (formData as any).imageFile = file;
        }
    };

    const handleOpenModal = (user: User | null = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                password: '',
                profilePicture: user.profilePicture || '',
                imageFile: null
            });
        } else {
            setEditingUser(null);
            setFormData({
                fullName: '',
                email: '',
                role: 'User',
                password: '',
                profilePicture: '',
                imageFile: null
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let resultAction;
            if (editingUser) {
                const { imageFile: _, ...updateData } = formData;
                resultAction = await dispatch(editUser({
                    id: Number(editingUser.id),
                    data: updateData
                }));
            } else {
                let profilePicture = formData.profilePicture;
                if (formData.imageFile) {
                    const uploadRes = await uploadService.upload(formData.imageFile, 'profiles');
                    if (uploadRes.isSuccess) {
                        profilePicture = uploadRes.data!;
                    }
                }
                const { imageFile: __, ...createData } = formData;
                resultAction = await dispatch(addUser({
                    ...createData,
                    profilePicture
                }));
            }

            if (addUser.fulfilled.match(resultAction) || editUser.fulfilled.match(resultAction)) {
                setIsModalOpen(false);
                notify.success(`User ${editingUser ? 'updated' : 'created'} successfully`);
            } else {
                notify.error(resultAction.payload as string || "Operation failed");
            }
        } catch (err) {
            notify.error("Operation failed");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setConfirmState({ open: false, id: null });
            const resultAction = await dispatch(removeUser(id));
            if (removeUser.fulfilled.match(resultAction)) {
                notify.success("User removed successfully");
            } else {
                notify.error(resultAction.payload as string || "Delete failed");
            }
        } catch (err) {
            notify.error("Operation failed");
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <PageHeader
                title="Users"
                subtitle="Manage user accounts and access levels."
                action={
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-[13px] font-medium transition-colors shadow-md shadow-[var(--primary)]/20"
                    >
                        <Plus size={16} />
                        Add User
                    </button>
                }
            />

            {/* Overview Stickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 stagger-children">
                <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm hover:border-[var(--primary)]/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] group-hover:scale-110 transition-transform">
                            <UsersIcon size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{users.length}</p>
                        <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Total Users</p>
                    </div>
                </div>
                <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm hover:border-[var(--success)]/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-[var(--success-soft)] text-[var(--success)] group-hover:scale-110 transition-transform">
                            <Shield size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{users.filter(u => u.status === 'Active').length}</p>
                        <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Active Users</p>
                    </div>
                </div>
                <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm hover:border-[var(--primary)]/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] group-hover:scale-110 transition-transform">
                            <UserIcon size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{users.filter(u => u.role === 'Admin').length}</p>
                        <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Administrators</p>
                    </div>
                </div>
                <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm hover:border-[var(--warning)]/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-[var(--warning-soft)] text-[var(--warning)] group-hover:scale-110 transition-transform">
                            <X size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{users.filter(u => u.status !== 'Active').length}</p>
                        <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Suspended</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-[360px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg py-2.5 pl-10 pr-4 text-[13px] text-[var(--text-secondary)] placeholder:text-[var(--text-light)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-elevated)]'}`}
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-elevated)]'}`}
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <DataGrid
                    data={filteredUsers}
                    loading={loading}
                    renderItem={renderGridItem}
                    onView={(user) => setViewingUser(user)}
                    onEdit={handleOpenModal}
                    onDelete={(id) => setConfirmState({ open: true, id: Number(id) })}
                    emptyIcon={Shield}
                />
            ) : (
                <DataTable
                    data={filteredUsers}
                    columns={columns}
                    loading={loading}
                    onView={(user) => setViewingUser(user)}
                    onEdit={handleOpenModal}
                    onDelete={(id) => setConfirmState({ open: true, id: Number(id) })}
                />
            )}

            {/* Modal */}
            {/* Modal - Side Drawer Style */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Light clear overlay */}
                    <div className="absolute inset-0 bg-[var(--primary)]/5" onClick={() => setIsModalOpen(false)} />

                    <div className="absolute inset-y-0 right-0 w-full max-w-[500px] bg-[var(--card)] border-l border-[var(--border-color)] shadow-[var(--shadow-lg)] animate-slide-in-right flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-light)] flex-shrink-0">
                            <div>
                                <h2 className="text-[19px] font-extrabold text-[var(--text-primary)] tracking-tight">
                                    {editingUser ? 'Edit' : 'Create'} User
                                </h2>
                                <p className="text-[12px] text-[var(--text-muted)] mt-1 font-medium">Manage user access and profile details.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2.5 rounded-xl hover:bg-[var(--surface-elevated)] text-[var(--text-muted)] transition-all hover:rotate-90"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-[var(--background)]">
                            {/* Avatar Upload */}
                            <div className="flex justify-center mb-4">
                                <div className="relative group">
                                    <div className="h-24 w-24 rounded-3xl bg-[var(--surface)] flex items-center justify-center text-[var(--primary)] font-bold text-[28px] overflow-hidden relative border-2 border-[var(--border-color)] shadow-sm transition-all group-hover:border-[var(--primary)]/30 group-hover:scale-[1.02]">
                                        {formData.profilePicture ? (
                                            <Image
                                                src={formData.profilePicture.startsWith('data:') ? formData.profilePicture : getFileUrl(formData.profilePicture)}
                                                alt="Avatar"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 opacity-40">
                                                <UserIcon size={32} />
                                                <span className="text-[10px] uppercase tracking-tighter">Photo</span>
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 p-2 bg-[var(--primary)] rounded-xl cursor-pointer text-white hover:bg-[var(--primary-hover)] transition-all shadow-lg hover:rotate-12 active:scale-90">
                                        <Camera size={14} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e, editingUser ? Number(editingUser.id) : undefined)}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                                            <UserIcon size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            placeholder="John Doe"
                                            className="w-full bg-[var(--input)] border border-[var(--input-border)] rounded-xl py-3 pl-11 pr-4 text-[13px] font-semibold text-[var(--text-primary)] focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[12px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="user@interviewify.com"
                                            className="w-full bg-[var(--input)] border border-[var(--input-border)] rounded-xl py-3 pl-11 pr-4 text-[13px] font-semibold text-[var(--text-primary)] focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <LookupSelect
                                            type="roles"
                                            label="Role"
                                            value={formData.role}
                                            onChange={(val) => setFormData({ ...formData, role: val.toString() })}
                                            icon={Shield}
                                            placeholder="Select Role"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">
                                            Password {editingUser && <span className="text-[var(--text-muted)] font-normal shadow-none lowercase">(optional)</span>}
                                        </label>
                                        <input
                                            type="password"
                                            required={!editingUser}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full bg-[var(--input)] border border-[var(--input-border)] rounded-xl py-3 px-4 text-[13px] font-semibold text-[var(--text-primary)] focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-[var(--border-light)] mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3.5 rounded-xl border border-[var(--border-color)] text-[14px] font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-6 py-3.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[14px] font-bold transition-all shadow-lg shadow-[var(--primary)]/25 active:scale-95"
                                >
                                    {editingUser ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmState.open}
                onClose={() => setConfirmState({ open: false, id: null })}
                onConfirm={() => confirmState.id !== null && handleDelete(confirmState.id)}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Yes, Delete"
                cancelText="Cancel"
                type="danger"
            />

            {/* User View Modal */}
            {viewingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-md" onClick={() => setViewingUser(null)} />
                    <div className="relative w-full max-w-[500px] bg-[var(--card)] rounded-[3rem] shadow-[var(--shadow-lg)] overflow-hidden animate-scale-in flex flex-col">
                        <div className="px-10 py-10 relative">
                            <button onClick={() => setViewingUser(null)} className="absolute top-8 right-8 p-2.5 rounded-2xl text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--primary-text)] transition-all z-10">
                                <X size={20} />
                            </button>

                            <div className="text-center mb-10">
                                <div className="inline-block relative mb-6">
                                    <div className="h-32 w-32 rounded-[2.5rem] bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-black text-[42px] overflow-hidden relative shadow-md">
                                        {viewingUser.profilePicture ? (
                                            <Image src={getFileUrl(viewingUser.profilePicture)} alt={viewingUser.fullName} fill className="object-cover" unoptimized />
                                        ) : (
                                            viewingUser.fullName.charAt(0)
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[var(--card)] shadow-lg border border-[var(--border-color)]">
                                        <StatusBadge label={viewingUser.status} variant={viewingUser.status === 'Active' ? 'success' : 'danger'} size="sm" pulse={viewingUser.status === 'Active'} />
                                    </div>
                                </div>
                                <h2 className="text-[28px] font-black tracking-tight text-[var(--text-primary)] leading-tight mb-2">
                                    {viewingUser.fullName}
                                </h2>
                                <p className="text-[14px] text-[var(--text-muted)] font-semibold flex items-center justify-center gap-2">
                                    <Mail size={16} /> {viewingUser.email}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border-color)] shadow-inner">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Account Role</p>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-[var(--surface)] shadow-sm border border-[var(--border-light)] text-[var(--primary)]">
                                                <Shield size={18} />
                                            </div>
                                            <span className="text-[16px] font-extrabold text-[var(--text-primary)]">{viewingUser.role}</span>
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border-color)] shadow-inner">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">User ID</p>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-[var(--surface)] shadow-sm border border-[var(--border-light)] text-[var(--text-muted)]">
                                                <UserIcon size={18} />
                                            </div>
                                            <span className="text-[16px] font-extrabold text-[var(--text-primary)]">#{viewingUser.id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-[2.5rem] bg-[var(--primary-light)]/50 border border-[var(--border-color)] flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[var(--shadow-md)]">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-black text-[var(--text-primary)]">Security Clearance</p>
                                            <p className="text-[12px] font-bold text-[var(--text-secondary)]">{viewingUser.role === 'Admin' ? 'Universal System Access' : 'Standard Member Privileges'}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setViewingUser(null)}
                                    className="w-full py-4 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[15px] font-bold transition-all shadow-xl shadow-[var(--shadow-md)] active:scale-[0.98] mt-4"
                                >
                                    Dismiss Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default UserManagementPage;
