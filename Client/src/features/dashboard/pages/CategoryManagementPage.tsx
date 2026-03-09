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
    X,
    Eye,
    FolderOpen,
    GitBranch,
    Grid
} from 'lucide-react';
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

const CategoryManagementPage = () => {
    const dispatch = useAppDispatch();
    const { items: categories, loading, error } = useAppSelector(state => state.categories);

    const [activeMainTab, setActiveMainTab] = useState<'categories' | 'modules'>('categories');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', isActive: true });
    const [subFormData, setSubFormData] = useState({ name: '', categoryId: '' });
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [confirmState, setConfirmState] = useState<{ open: boolean; id: number | null; type: 'category' | 'module' }>({ open: false, id: null, type: 'category' });
    const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
    const [viewingSubCategory, setViewingSubCategory] = useState<SubCategory | null>(null);

    const { items: subCategories, loading: subLoading } = useAppSelector(state => state.subCategories);
    const { categories: categoryLookups } = useAppSelector(state => state.lookups);

    const subColumns: Column<SubCategory>[] = [
        {
            header: 'Module',
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
            header: 'Category',
            key: 'categoryName',
            render: (sub: SubCategory) => (
                <span className="text-[13px] font-medium text-[var(--text-secondary)]">{sub.categoryName || '—'}</span>
            )
        }
    ];

    const renderGridItem = (cat: Category, idx: number, actions?: React.ReactNode) => (
        <div key={cat.id} className="group/card relative bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] shadow-[var(--shadow-card)] p-7 overflow-hidden hover:shadow-[var(--shadow-lg)] hover:border-[var(--primary)]/20 transition-all duration-500">
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
                    {cat.subCategories?.slice(0, 3).map((s: SubCategory) => (
                        <span key={s.id} className="px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)]/50 text-[11px] font-bold text-[var(--text-secondary)] shadow-sm">
                            {s.name}
                        </span>
                    ))}
                    {cat.subCategories && cat.subCategories.length > 3 && (
                        <span className="px-3 py-1.5 rounded-xl bg-[var(--primary-light)]/30 text-[11px] font-extrabold text-[var(--primary)] self-center shadow-sm">
                            +{cat.subCategories.length - 3}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-[var(--border-color)]/80">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--info-soft)] text-[var(--info)] text-[12px] font-bold">
                        <GitBranch size={14} />
                        <span>{cat.subCategories?.length ?? 0} Modules</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => { setActiveMainTab('modules'); setSearch(cat.name); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-[12px] font-bold text-white hover:bg-[var(--primary-hover)] transition-all duration-300 shadow-[var(--shadow-md)]"
                    >
                        <Eye size={14} />
                        View modules
                    </button>
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
                toast.success(`${type === 'category' ? 'Category' : 'Module'} deleted successfully`);
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
            setFormData({ name: cat.name, description: cat.description ?? '', isActive: cat.isActive !== false });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '', isActive: true });
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
            const payload = { name: formData.name, description: formData.description || null, isActive: formData.isActive };
            if (editingCategory) {
                resultAction = await dispatch(editCategory({ id: Number(editingCategory.id), data: payload }));
            } else {
                resultAction = await dispatch(addCategory(payload));
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
                title="Categories & Modules"
                subtitle="Manage topics (categories) and their modules. Modules hold questions."
                action={
                    <button
                        onClick={() => activeMainTab === 'categories' ? handleOpenModal() : handleOpenSubModal()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-[13px] font-medium transition-colors shadow-md shadow-[var(--primary)]/20"
                    >
                        <Plus size={16} />
                        Add {activeMainTab === 'categories' ? 'Category' : 'Module'}
                    </button>
                }
            />

            {/* Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[22px] font-extrabold text-[var(--text-primary)]">{categories.length}</p>
                            <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Categories</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                            <FolderOpen size={20} />
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[22px] font-extrabold text-[var(--text-primary)]">
                                {categories.reduce((acc, cat) => acc + (cat.subCategories?.length ?? 0), 0)}
                            </p>
                            <p className="text-[12px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">Modules</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[var(--success-soft)] text-[var(--success)]">
                            <GitBranch size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[var(--card)] border border-[var(--border-color)] rounded-xl w-fit mb-6 shadow-sm">
                <button
                    onClick={() => setActiveMainTab('categories')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all
                        ${activeMainTab === 'categories' ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                    <FolderOpen size={16} />
                    Categories
                </button>
                <button
                    onClick={() => setActiveMainTab('modules')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all
                        ${activeMainTab === 'modules' ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                    <GitBranch size={16} />
                    Modules
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-[360px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" />
                    <input
                        type="text"
                        placeholder={`Search ${activeMainTab === 'categories' ? 'categories' : 'modules'}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg py-2.5 pl-10 pr-4 text-[13px] text-[var(--text-secondary)] placeholder:text-[var(--text-light)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-elevated)]'}`}
                        title="Grid View"
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-elevated)]'}`}
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
                                    header: 'Modules',
                                    key: 'subCategories',
                                    render: (cat: Category) => (
                                        <span className="px-2.5 py-1 rounded-full bg-[var(--info-soft)] text-[var(--info)] text-[11px] font-bold uppercase tracking-wider">
                                            {cat.subCategories?.length ?? 0} modules
                                        </span>
                                    )
                                },
                                {
                                    header: 'Status',
                                    key: 'status',
                                    render: (cat: Category) => (
                                        <StatusBadge
                                            label={cat.isActive !== false ? 'Active' : 'Inactive'}
                                            variant={cat.isActive !== false ? 'success' : 'secondary'}
                                        />
                                    )
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
                            onDelete={(id) => setConfirmState({ open: true, id: Number(id), type: 'module' })}
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
                                    <StatusBadge label={sub.categoryName || '—'} variant="primary" />
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
                            onDelete={(id) => setConfirmState({ open: true, id: Number(id), type: 'module' })}
                        />
                    )}
                </>
            )}

            {/* Empty States */}
            {((activeMainTab === 'categories' && !loading && filteredCategories.length === 0) ||
                (activeMainTab === 'modules' && !subLoading && filteredSubCategories.length === 0)) && (
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

                    <div className="absolute inset-y-0 right-0 w-full max-w-[520px] bg-[var(--card)] border-l border-[var(--border-color)] shadow-[var(--shadow-lg)] animate-slide-in-right flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-light)] flex-shrink-0">
                            <div>
                                <h2 className="text-[19px] font-extrabold text-[var(--text-primary)] tracking-tight">
                                    {editingCategory ? 'Edit' : 'Create'} Category
                                </h2>
                                <p className="text-[12px] text-[var(--text-muted)] mt-1 font-medium">Categories are topics; add modules inside them for questions.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2.5 rounded-xl hover:bg-[var(--surface-elevated)] text-[var(--text-muted)] transition-all hover:rotate-90 active:scale-90"
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
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                                            <FolderOpen size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Advanced C# Mastery"
                                            className="w-full bg-[var(--surface-elevated)]/50 border border-[var(--border-color)] rounded-xl py-3.5 pl-12 pr-4 text-[14px] font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:bg-[var(--input)] focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">
                                        Description <span className="text-[var(--text-muted)] font-normal lowercase">(optional)</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Briefly describe what candidates will learn in this category..."
                                        className="w-full bg-[var(--surface-elevated)]/50 border border-[var(--border-color)] rounded-xl py-3.5 px-5 text-[14px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:bg-[var(--input)] focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all resize-none shadow-sm leading-relaxed"
                                    />
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="rounded border-[var(--border-color)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                    />
                                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">Active (visible on public site)</span>
                                </label>

                                {editingCategory && (
                                    <div className="p-4 rounded-xl bg-[var(--primary-light)]/40 border border-[var(--primary)]/10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <GitBranch size={14} className="text-[var(--primary)]" />
                                            <p className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider">
                                                Modules ({(editingCategory.subCategories?.length ?? 0)})
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {editingCategory.subCategories?.map((s: SubCategory) => (
                                                <span key={s.id} className="px-3 py-1 rounded-lg bg-[var(--surface)] shadow-sm text-[11px] font-bold text-[var(--text-secondary)]">
                                                    {s.name}
                                                </span>
                                            ))}
                                            {(!editingCategory.subCategories || editingCategory.subCategories.length === 0) && (
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
                                    className="flex-1 px-6 py-3.5 rounded-xl border border-[var(--border-color)] text-[14px] font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:border-[var(--border-color)] transition-all active:scale-95"
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
                    <div className="absolute inset-y-0 right-0 w-full max-w-[500px] bg-[var(--card)] border-l border-[var(--border-color)] shadow-[var(--shadow-lg)] animate-slide-in-right flex flex-col">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-light)] flex-shrink-0">
                            <div>
                                <h2 className="text-[19px] font-extrabold text-[var(--text-primary)] tracking-tight">
                                    {editingSubCategory ? 'Edit' : 'Create'} Module
                                </h2>
                                <p className="text-[12px] text-[var(--text-muted)] mt-1 font-medium">Modules belong to a category and contain questions.</p>
                            </div>
                            <button onClick={() => setIsSubModalOpen(false)} className="p-2.5 rounded-xl hover:bg-[var(--surface-elevated)] text-[var(--text-muted)] transition-all hover:rotate-90">
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
                                    <label className="block text-[12px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">Module name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                                            <GitBranch size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            value={subFormData.name}
                                            onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                                            placeholder="e.g. ASP.NET Middleware"
                                            className="w-full bg-[var(--surface-elevated)]/50 border border-[var(--border-color)] rounded-xl py-3.5 pl-12 pr-4 text-[14px] font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:bg-[var(--input)] focus:ring-4 focus:ring-[var(--primary)]/5 focus:border-[var(--primary)] outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsSubModalOpen(false)}
                                    className="flex-1 px-6 py-3.5 rounded-xl border border-[var(--border-color)] text-[14px] font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:border-[var(--border-color)] transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-6 py-3.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[14px] font-bold transition-all shadow-lg shadow-[var(--primary)]/25 active:scale-95"
                                >
                                    {editingSubCategory ? 'Update Module' : 'Create Module'}
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
                    <div className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-md" onClick={() => setViewingCategory(null)} />
                    <div className="relative w-full max-w-[650px] bg-[var(--card)] rounded-[3rem] shadow-[var(--shadow-lg)] overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                        {/* Header Section */}
                        <div className="relative h-48 bg-[var(--primary)] flex-shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] opacity-90" />
                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--card)] to-transparent" />

                            <button onClick={() => setViewingCategory(null)} className="absolute top-6 right-6 p-3 rounded-2xl bg-[var(--surface)]/80 hover:bg-[var(--surface)] text-[var(--primary-text)] transition-all backdrop-blur-md z-10">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-10 pb-10 -mt-16 relative z-10 overflow-y-auto custom-scrollbar">
                            <div className="bg-[var(--card)] rounded-3xl p-8 shadow-sm border border-[var(--border-color)]">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-4 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
                                        <FolderOpen size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-[28px] font-black tracking-tight text-[var(--text-primary)] leading-tight">{viewingCategory.name}</h2>
                                        <StatusBadge label={viewingCategory.isActive !== false ? 'Active' : 'Inactive'} variant={viewingCategory.isActive !== false ? 'success' : 'secondary'} size="sm" className="mt-1" />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <section>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 flex items-center gap-2">
                                            Description
                                            <div className="h-px flex-1 bg-[var(--border-light)]" />
                                        </h4>
                                        <p className="text-[15px] text-[var(--text-secondary)] font-medium leading-relaxed bg-[var(--surface-elevated)]/50 p-5 rounded-2xl border border-[var(--border-color)]/50">
                                            {viewingCategory.description || "No description provided for this category."}
                                        </p>
                                    </section>

                                    <section>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 flex items-center gap-2">
                                            Modules ({(viewingCategory.subCategories?.length ?? 0)})
                                            <div className="h-px flex-1 bg-[var(--border-light)]" />
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {viewingCategory.subCategories?.map((sub: SubCategory) => (
                                                <div key={sub.id} className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--card)] hover:border-[var(--primary)]/30 hover:shadow-md transition-all flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-[var(--surface-elevated)] text-[var(--text-muted)]">
                                                        <GitBranch size={16} />
                                                    </div>
                                                    <span className="text-[13px] font-bold text-[var(--text-primary)]">{sub.name}</span>
                                                </div>
                                            ))}
                                            {(!viewingCategory.subCategories || viewingCategory.subCategories.length === 0) && (
                                                <div className="col-span-2 py-8 text-center bg-[var(--surface-elevated)] rounded-2xl border border-dashed border-[var(--border-color)]">
                                                    <p className="text-[13px] font-bold text-[var(--text-muted)]">No modules yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => setViewingCategory(null)}
                                            className="px-8 py-3.5 rounded-2xl bg-[var(--primary)] text-white text-[14px] font-bold hover:bg-[var(--primary-hover)] transition-all active:scale-95 shadow-[var(--shadow-md)]"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Module View Modal */}
            {viewingSubCategory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-md" onClick={() => setViewingSubCategory(null)} />
                    <div className="relative w-full max-w-[500px] bg-[var(--card)] rounded-2xl shadow-[var(--shadow-lg)] p-8 animate-scale-in border border-[var(--border-color)]">
                        <button onClick={() => setViewingSubCategory(null)} className="absolute top-4 right-4 p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] transition-all">
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
                                <GitBranch size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">{viewingSubCategory.name}</h2>
                                <p className="text-[13px] text-[var(--text-muted)]">Category: {viewingSubCategory.categoryName || '—'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setViewingSubCategory(null)}
                            className="w-full py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[14px] font-semibold transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CategoryManagementPage;
