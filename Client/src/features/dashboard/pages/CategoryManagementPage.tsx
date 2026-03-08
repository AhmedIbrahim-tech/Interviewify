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
    Eye,
    Pencil,
    Trash2,
    FolderOpen,
    GitBranch,
    Grid,
    Shield,
    ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory
} from '@/store/slices/categorySlice';
import { toast } from 'react-toastify';
import { fetchSubCategories, addSubCategory, editSubCategory, removeSubCategory } from '@/store/slices/subCategorySlice';
import { fetchCategories as fetchCategoriesLookup } from '@/store/slices/lookupSlice';
import { Category, SubCategory } from '@/types/category';
import Image from 'next/image';
import Link from 'next/link';
import { getCategoryImage } from '@/utils/imageHelpers';

const CategoryManagementPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { items: categories, loading, error } = useAppSelector(state => state.categories);

    const [activeMainTab, setActiveMainTab] = useState<'categories' | 'subcategories'>('categories');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [subFormData, setSubFormData] = useState({ name: '', categoryId: '' });
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [confirmState, setConfirmState] = useState<{ open: boolean; id: number | null; type: 'category' | 'subcategory' }>({ open: false, id: null, type: 'category' });
    const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
    const [viewingSubCategory, setViewingSubCategory] = useState<SubCategory | null>(null);

    const { items: subCategories, loading: subLoading } = useAppSelector(state => state.subCategories);
    const { categories: categoryLookups } = useAppSelector(state => state.lookups);

    const subColumns: Column<SubCategory>[] = [
        {
            header: 'Sub Category',
            key: 'name',
            render: (sub: SubCategory) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--info-light)]">
                        <GitBranch size={16} className="text-[var(--info)]" />
                    </div>
                    <span className="font-semibold text-[var(--text-primary)]">{sub.name}</span>
                </div>
            )
        },
        {
            header: 'Parent Category',
            key: 'categoryName',
            render: (sub: SubCategory) => (
                <StatusBadge label={sub.categoryName || 'General'} variant="primary" />
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: () => <StatusBadge label="Active" variant="success" />
        }
    ];

    const renderGridItem = (cat: Category, idx: number, actions?: React.ReactNode) => (
        <div key={cat.id} className="group/card relative bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-7 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-[var(--primary)]/20 transition-all duration-500">
            {/* Background Decorative Icon */}
            <div className="absolute -right-8 -bottom-8 text-[var(--primary)]/5 -rotate-12 group-hover/card:scale-110 transiton-transform duration-700 pointer-events-none">
                <FolderOpen size={160} strokeWidth={1} />
            </div>

            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="p-4 rounded-[1.5rem] bg-[var(--primary-light)] shadow-sm group-hover/card:rotate-6 transition-transform duration-500">
                    <FolderOpen size={24} className="text-[var(--primary)]" />
                </div>
                {actions}
            </div>

            <div className="relative z-10">
                <h3 className="text-[19px] font-bold text-[var(--text-primary)] mb-3 group-hover/card:text-[var(--primary)] transition-colors duration-300 tracking-tight">
                    {cat.name}
                </h3>

                {/* Sub Categories Tags */}
                <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                    {(cat.subCategories ?? (cat as any).SubCategories)?.slice(0, 3).map((s: any) => (
                        <span key={s.id} className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100/50 text-[11px] font-bold text-[var(--text-secondary)] shadow-sm">
                            {s.name}
                        </span>
                    ))}
                    {(cat.subCategories ?? (cat as any).SubCategories)?.length > 3 && (
                        <span className="px-3 py-1.5 rounded-xl bg-[var(--primary-light)]/30 text-[11px] font-extrabold text-[var(--primary)] self-center shadow-sm">
                            +{(cat.subCategories ?? (cat as any).SubCategories).length - 3}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-gray-100/80">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/50 text-blue-600 text-[12px] font-bold">
                        <GitBranch size={14} />
                        <span>{(cat.subCategories ?? (cat as any).SubCategories)?.length || 0} Paths</span>
                    </div>
                    <Link
                        href={`/dashboard/subcategories?search=${encodeURIComponent(cat.name)}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 text-[12px] font-bold text-white hover:bg-black transition-all duration-300 shadow-lg shadow-gray-200"
                    >
                        <Eye size={14} />
                        View
                    </Link>
                </div>
            </div>
        </div>
    );

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchSubCategories());
        dispatch(fetchCategoriesLookup());
    }, [dispatch]);

    const handleDelete = async () => {
        if (confirmState.id === null) return;
        try {
            const id = confirmState.id;
            const type = confirmState.type;
            setConfirmState({ ...confirmState, open: false });

            let resultAction;
            if (type === 'category') {
                resultAction = await dispatch(removeCategory(Number(id)));
            } else {
                resultAction = await dispatch(removeSubCategory(Number(id)));
            }

            if (removeCategory.fulfilled.match(resultAction) || removeSubCategory.fulfilled.match(resultAction)) {
                toast.success(`${type === 'category' ? 'Category' : 'Sub category'} deleted successfully`);
            } else {
                toast.error(resultAction.payload as string || "Delete failed");
            }
        } catch (err) {
            toast.error("An unexpected error occurred");
        }
    };

    const handleOpenModal = (cat: Category | null = null) => {
        if (cat) {
            setEditingCategory(cat);
            setFormData({ name: cat.name, description: cat.description || '' });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleOpenSubModal = (sub: SubCategory | null = null) => {
        if (sub) {
            setEditingSubCategory(sub);
            setSubFormData({ name: sub.name, categoryId: sub.categoryId.toString() });
        } else {
            setEditingSubCategory(null);
            setSubFormData({ name: '', categoryId: categories[0]?.id?.toString() || '' });
        }
        setIsSubModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let resultAction;
            if (editingCategory) {
                resultAction = await dispatch(editCategory({ id: Number(editingCategory.id), data: formData }));
            } else {
                resultAction = await dispatch(addCategory(formData));
            }

            if (addCategory.fulfilled.match(resultAction) || editCategory.fulfilled.match(resultAction)) {
                toast.success(`Category ${editingCategory ? 'updated' : 'created'} successfully`);
                setIsModalOpen(false);
            } else {
                toast.error(resultAction.payload as string || "Operation failed");
            }
        } catch (err) {
            toast.error("Operation failed");
        }
    };

    const handleSubSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let resultAction;
            if (editingSubCategory) {
                resultAction = await dispatch(editSubCategory({
                    id: Number(editingSubCategory.id),
                    data: { name: subFormData.name }
                }));
            } else {
                resultAction = await dispatch(addSubCategory({
                    name: subFormData.name,
                    categoryId: parseInt(subFormData.categoryId)
                }));
            }

            if (addSubCategory.fulfilled.match(resultAction) || editSubCategory.fulfilled.match(resultAction)) {
                toast.success(`Sub category ${editingSubCategory ? 'updated' : 'created'} successfully`);
                setIsSubModalOpen(false);
            } else {
                toast.error(resultAction.payload as string || "Operation failed");
            }
        } catch (err) {
            toast.error("Operation failed");
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(search.toLowerCase())
    );

    const filteredSubCategories = subCategories.filter(sub =>
        sub.name.toLowerCase().includes(search.toLowerCase()) ||
        sub.categoryName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <PageHeader
                title="Categories"
                subtitle="Manage your interview learning categories and paths."
                action={
                    <button
                        onClick={() => activeMainTab === 'categories' ? handleOpenModal() : handleOpenSubModal()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-[13px] font-medium transition-colors shadow-md shadow-[var(--primary)]/20"
                    >
                        <Plus size={16} />
                        Add {activeMainTab === 'categories' ? 'Category' : 'Sub Category'}
                    </button>
                }
            />

            {/* Overview Stickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 stagger-children">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:border-[var(--primary)]/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] group-hover:scale-110 transition-transform">
                            <FolderOpen size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{categories.length}</p>
                        <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Total Categories</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                            <GitBranch size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[22px] font-extrabold text-[var(--text-primary)]">
                            {categories.reduce((acc, cat) => acc + ((cat.subCategories ?? (cat as any).SubCategories)?.length || 0), 0)}
                        </p>
                        <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Active Paths</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:border-amber-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                            <FolderOpen size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{categories.length}</p>
                        <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Full Categories</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:border-purple-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                            <Shield size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[22px] font-extrabold text-[var(--text-primary)]">Premium</p>
                        <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Account Type</p>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white border border-gray-100 rounded-xl w-fit mb-6 shadow-sm">
                <button
                    onClick={() => setActiveMainTab('categories')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all
                        ${activeMainTab === 'categories' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                    <FolderOpen size={16} />
                    Categories
                </button>
                <button
                    onClick={() => setActiveMainTab('subcategories')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all
                        ${activeMainTab === 'subcategories' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                    <GitBranch size={16} />
                    Sub Categories
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-[360px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" />
                    <input
                        type="text"
                        placeholder={`Search ${activeMainTab === 'categories' ? 'categories' : 'sub categories'}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg py-2.5 pl-10 pr-4 text-[13px] text-[var(--text-secondary)] placeholder:text-[var(--text-light)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-gray-50'}`}
                        title="Grid View"
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-gray-50'}`}
                        title="Table View"
                    >
                        <Grid size={16} />
                    </button>
                </div>
            </div>

            {activeMainTab === 'categories' ? (
                <>
                    {viewMode === 'grid' ? (
                        <DataGrid
                            data={filteredCategories}
                            loading={loading}
                            renderItem={renderGridItem}
                            onEdit={handleOpenModal}
                            onView={(cat) => setViewingCategory(cat)}
                            onDelete={(id) => setConfirmState({ open: true, id: Number(id), type: 'category' })}
                            emptyIcon={FolderOpen}
                        />
                    ) : (
                        <DataTable
                            data={filteredCategories}
                            onView={(cat) => setViewingCategory(cat)}
                            columns={[
                                {
                                    header: 'Category',
                                    key: 'name',
                                    render: (cat: Category) => (
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-[var(--primary-light)]">
                                                <FolderOpen size={16} className="text-[var(--primary)]" />
                                            </div>
                                            <span className="font-semibold text-[var(--text-primary)]">{cat.name}</span>
                                        </div>
                                    )
                                },
                                {
                                    header: 'Paths',
                                    key: 'subCategories',
                                    render: (cat: Category) => (
                                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-wider">
                                            {(cat.subCategories ?? (cat as any).SubCategories)?.length || 0} Paths
                                        </span>
                                    )
                                },
                                {
                                    header: 'Status',
                                    key: 'status',
                                    render: () => <StatusBadge label="Active" variant="success" />
                                }
                            ]}
                            loading={loading}
                            onEdit={handleOpenModal}
                            onDelete={(id) => setConfirmState({ open: true, id: Number(id), type: 'category' })}
                        />
                    )}
                </>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <DataGrid
                            data={filteredSubCategories}
                            loading={subLoading}
                            onEdit={handleOpenSubModal}
                            onView={(sub) => setViewingSubCategory(sub)}
                            onDelete={(id) => setConfirmState({ open: true, id: Number(id), type: 'subcategory' })}
                            emptyIcon={GitBranch}
                            renderItem={(sub: SubCategory, _: number, actions?: React.ReactNode) => (
                                <div key={sub.id} className="group bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)] p-5 hover:shadow-[var(--shadow-md)] hover:border-[var(--primary)]/20 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2.5 rounded-xl bg-[var(--info-light)]">
                                            <GitBranch size={18} className="text-[var(--info)]" />
                                        </div>
                                        {actions}
                                    </div>
                                    <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--primary)] transition-colors">{sub.name}</h3>
                                    <StatusBadge label={sub.categoryName || 'General'} variant="primary" />
                                </div>
                            )}
                        />
                    ) : (
                        <DataTable
                            data={filteredSubCategories}
                            columns={subColumns}
                            loading={subLoading}
                            onView={(sub) => setViewingSubCategory(sub)}
                            onEdit={handleOpenSubModal}
                            onDelete={(id) => setConfirmState({ open: true, id: Number(id), type: 'subcategory' })}
                        />
                    )}
                </>
            )}

            {/* Empty States */}
            {((activeMainTab === 'categories' && !loading && filteredCategories.length === 0) ||
                (activeMainTab === 'subcategories' && !subLoading && filteredSubCategories.length === 0)) && (
                    <div className="py-16 text-center bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
                        <div className="inline-flex p-4 rounded-full bg-[var(--bg-body)] mb-4">
                            {activeMainTab === 'categories' ? <FolderOpen size={28} className="text-[var(--text-light)]" /> : <GitBranch size={28} className="text-[var(--text-light)]" />}
                        </div>
                        <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-1">No items found</h3>
                        <p className="text-[13px] text-[var(--text-muted)]">Try adjusting your search or create a new one.</p>
                    </div>
                )}

            {/* Modal - Side Drawer Style */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Light clear overlay */}
                    <div className="absolute inset-0 bg-[var(--primary)]/5" onClick={() => setIsModalOpen(false)} />

                    <div className="absolute inset-y-0 right-0 w-full max-w-[520px] bg-white border-l border-gray-100 shadow-[-20px_0_50px_-20px_rgba(0,0,0,0.1)] animate-slide-in-right flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 flex-shrink-0">
                            <div>
                                <h2 className="text-[19px] font-extrabold text-[var(--text-primary)] tracking-tight">
                                    {editingCategory ? 'Edit' : 'Create'} Category
                                </h2>
                                <p className="text-[12px] text-[var(--text-muted)] mt-1 font-medium">Update category details and learning paths.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2.5 rounded-xl hover:bg-gray-50 text-[var(--text-muted)] transition-all hover:rotate-90 active:scale-90"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">
                                        Category Name
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors">
                                            <FolderOpen size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Advanced C# Mastery"
                                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-[14px] font-semibold text-[var(--text-primary)] placeholder:text-gray-400 focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">
                                        Description <span className="text-gray-400 font-normal lowercase">(optional)</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Briefly describe what candidates will learn in this category..."
                                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3.5 px-5 text-[14px] font-medium text-[var(--text-primary)] placeholder:text-gray-400 focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all resize-none shadow-sm leading-relaxed"
                                    />
                                </div>

                                {editingCategory && (
                                    <div className="p-4 rounded-xl bg-[var(--primary-light)]/40 border border-[var(--primary)]/10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <GitBranch size={14} className="text-[var(--primary)]" />
                                            <p className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider">
                                                Active Paths ({(editingCategory.subCategories || (editingCategory as any).SubCategories)?.length || 0})
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {(editingCategory.subCategories ?? (editingCategory as any).SubCategories)?.map((s: any) => (
                                                <span key={s.id} className="px-3 py-1 rounded-lg bg-white shadow-sm text-[11px] font-bold text-[var(--text-secondary)]">
                                                    {s.name}
                                                </span>
                                            ))}
                                            {(!(editingCategory.subCategories ?? (editingCategory as any).SubCategories) || (editingCategory.subCategories ?? (editingCategory as any).SubCategories).length === 0) && (
                                                <p className="text-[12px] text-[var(--text-muted)] italic">No paths created yet</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3.5 rounded-xl border border-gray-200 text-[14px] font-bold text-[var(--text-secondary)] hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-6 py-3.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[14px] font-bold transition-all shadow-lg shadow-[var(--primary)]/25 active:scale-95"
                                >
                                    {editingCategory ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sub Category Modal - Side Drawer Style */}
            {isSubModalOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-[var(--primary)]/5" onClick={() => setIsSubModalOpen(false)} />
                    <div className="absolute inset-y-0 right-0 w-full max-w-[500px] bg-white border-l border-gray-100 shadow-[-20px_0_50px_-20px_rgba(0,0,0,0.1)] animate-slide-in-right flex flex-col">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 flex-shrink-0">
                            <div>
                                <h2 className="text-[19px] font-extrabold text-[var(--text-primary)] tracking-tight">
                                    {editingSubCategory ? 'Edit' : 'Create'} Sub Category
                                </h2>
                                <p className="text-[12px] text-[var(--text-muted)] mt-1 font-medium">Define a new sub-category for your learning path.</p>
                            </div>
                            <button onClick={() => setIsSubModalOpen(false)} className="p-2.5 rounded-xl hover:bg-gray-50 text-[var(--text-muted)] transition-all hover:rotate-90">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                            <div className="space-y-4">
                                <div>
                                    <LookupSelect
                                        type="categories"
                                        label="Parent Category"
                                        value={subFormData.categoryId}
                                        onChange={(val) => setSubFormData({ ...subFormData, categoryId: val.toString() })}
                                        disabled={!!editingSubCategory}
                                        icon={FolderOpen}
                                        placeholder="Select Parent Category"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">Sub Category Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors">
                                            <GitBranch size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            value={subFormData.name}
                                            onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                                            placeholder="e.g. ASP.NET Middleware"
                                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-[14px] font-semibold text-[var(--text-primary)] placeholder:text-gray-400 focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsSubModalOpen(false)}
                                    className="flex-1 px-6 py-3.5 rounded-xl border border-gray-200 text-[14px] font-bold text-[var(--text-secondary)] hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-6 py-3.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[14px] font-bold transition-all shadow-lg shadow-[var(--primary)]/25 active:scale-95"
                                >
                                    {editingSubCategory ? 'Update Path' : 'Create Path'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmState.open}
                onClose={() => setConfirmState({ ...confirmState, open: false })}
                onConfirm={handleDelete}
                title={`Delete ${confirmState.type === 'category' ? 'Category' : 'Sub Category'}`}
                message={`Are you sure you want to delete this ${confirmState.type === 'category' ? 'category' : 'sub category'}? This action cannot be undone.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                type="danger"
            />

            {/* Category View Modal */}
            {viewingCategory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setViewingCategory(null)} />
                    <div className="relative w-full max-w-[650px] bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                        {/* Header Section */}
                        <div className="relative h-48 bg-[var(--primary)] flex-shrink-0">
                            {viewingCategory.image ? (
                                <Image src={viewingCategory.image} alt={viewingCategory.name} fill className="object-cover opacity-60" unoptimized />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] opacity-90" />
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />

                            <button onClick={() => setViewingCategory(null)} className="absolute top-6 right-6 p-3 rounded-2xl bg-white/20 hover:bg-white/40 text-white transition-all backdrop-blur-md z-10">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-10 pb-10 -mt-16 relative z-10 overflow-y-auto custom-scrollbar">
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-4 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
                                        <FolderOpen size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-[28px] font-black tracking-tight text-[var(--text-primary)] leading-tight">{viewingCategory.name}</h2>
                                        <StatusBadge label="Active Category" variant="success" size="sm" pulse className="mt-1" />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <section>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 flex items-center gap-2">
                                            Description
                                            <div className="h-px flex-1 bg-gray-100" />
                                        </h4>
                                        <p className="text-[15px] text-[var(--text-secondary)] font-medium leading-relaxed bg-gray-50/50 p-5 rounded-2xl border border-gray-100/50">
                                            {viewingCategory.description || "No description provided for this category."}
                                        </p>
                                    </section>

                                    <section>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                                            Learning Paths ({(viewingCategory.subCategories ?? (viewingCategory as any).SubCategories)?.length || 0})
                                            <div className="h-px flex-1 bg-gray-100" />
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(viewingCategory.subCategories ?? (viewingCategory as any).SubCategories)?.map((sub: any) => (
                                                <div key={sub.id} className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-[var(--primary)]/30 hover:shadow-md transition-all flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-gray-50 text-gray-400">
                                                        <GitBranch size={16} />
                                                    </div>
                                                    <span className="text-[13px] font-bold text-[var(--text-primary)]">{sub.name}</span>
                                                </div>
                                            ))}
                                            {(!(viewingCategory.subCategories ?? (viewingCategory as any).SubCategories) || (viewingCategory.subCategories ?? (viewingCategory as any).SubCategories).length === 0) && (
                                                <div className="col-span-2 py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                    <p className="text-[13px] font-bold text-gray-400">No paths established yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => setViewingCategory(null)}
                                            className="px-8 py-3.5 rounded-2xl bg-gray-900 text-white text-[14px] font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
                                        >
                                            Dismiss Preview
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SubCategory View Modal */}
            {viewingSubCategory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setViewingSubCategory(null)} />
                    <div className="relative w-full max-w-[500px] bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] p-10 animate-scale-in">
                        <button onClick={() => setViewingSubCategory(null)} className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all">
                            <X size={20} />
                        </button>

                        <div className="text-center mb-10">
                            <div className="inline-flex p-5 rounded-[2rem] bg-[var(--primary-light)] text-[var(--primary)] mb-6 shadow-sm">
                                <GitBranch size={40} />
                            </div>
                            <h2 className="text-[26px] font-black tracking-tight text-[var(--text-primary)] leading-tight mb-2">
                                {viewingSubCategory.name}
                            </h2>
                            <p className="text-[14px] text-[var(--text-muted)] font-semibold">Specialized Learning Path</p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-3xl bg-gray-50/50 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Parent Category</span>
                                    <StatusBadge label="Linked" variant="primary" size="sm" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-white shadow-sm border border-gray-100 text-[var(--primary)]">
                                        <FolderOpen size={20} />
                                    </div>
                                    <span className="text-[16px] font-extrabold text-[var(--text-primary)]">
                                        {viewingSubCategory.categoryName || "General Domain"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-3xl bg-blue-50/50 border border-blue-100/50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Status</p>
                                    <p className="text-[14px] font-black text-blue-600">Operational</p>
                                </div>
                                <div className="p-5 rounded-3xl bg-emerald-50/50 border border-emerald-100/50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Accessibility</p>
                                    <p className="text-[14px] font-black text-emerald-600">Public View</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setViewingSubCategory(null)}
                                className="w-full py-4 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[15px] font-bold transition-all shadow-lg shadow-[var(--primary)]/20 active:scale-[0.98] mt-4"
                            >
                                Close Inspection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CategoryManagementPage;
