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
    GitBranch,
    Eye,
    FolderOpen,
    Grid,
    Shield,
    ChevronDown
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/categorySlice';
import {
    fetchSubCategories,
    addSubCategory,
    editSubCategory,
    removeSubCategory
} from '@/store/slices/subCategorySlice';
import { SubCategory } from '@/types/category';
import { toast } from 'react-toastify';

const SubCategoryManagementPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialSearch = searchParams.get('search') || '';
    const dispatch = useAppDispatch();
    const { items: subCategories, loading: subLoading } = useAppSelector(state => state.subCategories);
    const { items: categories, loading: catLoading } = useAppSelector(state => state.categories);

    const loading = subLoading || catLoading;
    const [search, setSearch] = useState(initialSearch);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
    const [formData, setFormData] = useState({ name: '', categoryId: '' });
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [confirmState, setConfirmState] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [viewingSubCategory, setViewingSubCategory] = useState<SubCategory | null>(null);

    const columns: Column<SubCategory>[] = [
        {
            header: 'Sub Category',
            key: 'name',
            render: (sub: SubCategory) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--info-light)]">
                        <GitBranch size={16} className="text-[var(--info)]" />
                    </div>
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">{sub.name}</span>
                </div>
            )
        },
        {
            header: 'Category',
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

    const renderGridItem = (sub: SubCategory, _: number, actions?: React.ReactNode) => (
        <div key={sub.id} className="group/card relative bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-7 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-[var(--primary)]/20 transition-all duration-500">
            {/* Background Decorative Icon */}
            <div className="absolute -right-8 -bottom-8 text-[var(--primary)]/5 -rotate-12 group-hover/card:scale-110 transiton-transform duration-700 pointer-events-none">
                <GitBranch size={160} strokeWidth={1} />
            </div>

            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="p-4 rounded-[1.5rem] bg-[var(--primary-light)] shadow-sm group-hover/card:rotate-6 transition-transform duration-500">
                    <GitBranch size={24} className="text-[var(--primary)]" />
                </div>
                {actions}
            </div>

            <div className="relative z-10">
                <h3 className="text-[19px] font-bold text-[var(--text-primary)] mb-4 group-hover/card:text-[var(--primary)] transition-colors duration-300 tracking-tight">
                    {sub.name}
                </h3>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100/50 text-[11px] font-bold text-[var(--text-secondary)] shadow-sm w-fit mb-6">
                    <Grid size={12} className="opacity-60" />
                    {sub.categoryName || 'General Path'}
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-gray-100/80">
                    <StatusBadge label="Operational" variant="success" pulse size="sm" />
                    <Link
                        href={`/dashboard/questions?search=${encodeURIComponent(sub.name)}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 text-[11px] font-bold text-white hover:bg-black transition-all duration-300 shadow-lg shadow-gray-200"
                    >
                        <Eye size={14} />
                        Details
                    </Link>
                </div>
            </div>
        </div>
    );

    useEffect(() => {
        dispatch(fetchSubCategories());
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleDelete = async (id: number) => {
        try {
            setConfirmState({ open: false, id: null });
            const resultAction = await dispatch(removeSubCategory(id));
            if (removeSubCategory.fulfilled.match(resultAction)) {
                toast.success("Sub category deleted successfully");
            } else {
                toast.error(resultAction.payload as string || "Delete failed");
            }
        } catch (err) {
            toast.error("An unexpected error occurred");
        }
    };

    const handleOpenModal = (sub: SubCategory | null = null) => {
        if (sub) {
            setEditingSubCategory(sub);
            setFormData({ name: sub.name, categoryId: sub.categoryId.toString() });
        } else {
            setEditingSubCategory(null);
            setFormData({ name: '', categoryId: categories[0]?.id?.toString() || '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let resultAction;
            if (editingSubCategory) {
                resultAction = await dispatch(editSubCategory({
                    id: Number(editingSubCategory.id),
                    data: { name: formData.name }
                }));
            } else {
                resultAction = await dispatch(addSubCategory({
                    name: formData.name,
                    categoryId: parseInt(formData.categoryId)
                }));
            }

            if (addSubCategory.fulfilled.match(resultAction) || editSubCategory.fulfilled.match(resultAction)) {
                toast.success(`Sub category ${editingSubCategory ? 'updated' : 'created'} successfully`);
                setIsModalOpen(false);
            } else {
                toast.error(resultAction.payload as string || "Operation failed");
            }
        } catch (err) {
            toast.error("Operation failed");
        }
    };

    const filteredSubCategories = subCategories.filter(sub =>
        sub.name.toLowerCase().includes(search.toLowerCase()) ||
        sub.categoryName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <PageHeader
                title="Sub Categories"
                subtitle="Manage learning paths within each category."
                action={
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-[13px] font-medium transition-colors shadow-md shadow-[var(--primary)]/20"
                    >
                        <Plus size={16} />
                        Add Sub Category
                    </button>
                }
            />

            {/* Sub Categories Overview Stickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-[14px] font-bold text-blue-600 mb-1">{subCategories.length}</p>
                        <p className="text-[12px] text-blue-500/80 font-semibold uppercase tracking-wider">Total Paths</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm">
                        <GitBranch size={20} />
                    </div>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-[14px] font-bold text-emerald-600 mb-1">{categories.length}</p>
                        <p className="text-[12px] text-emerald-500/80 font-semibold uppercase tracking-wider">Parent Categories</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl text-emerald-600 shadow-sm">
                        <FolderOpen size={20} />
                    </div>
                </div>
                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-[14px] font-bold text-purple-600 mb-1">Active</p>
                        <p className="text-[12px] text-purple-500/80 font-semibold uppercase tracking-wider">Deployment</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl text-purple-600 shadow-sm">
                        <Eye size={20} />
                    </div>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-[14px] font-bold text-amber-600 mb-1">98%</p>
                        <p className="text-[12px] text-amber-500/80 font-semibold uppercase tracking-wider">Completion</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl text-amber-600 shadow-sm">
                        <Plus size={20} />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-[360px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" />
                    <input
                        type="text"
                        placeholder="Search sub categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg py-2.5 pl-10 pr-4 text-[13px] text-[var(--text-secondary)] placeholder:text-[var(--text-light)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-gray-50'}`}
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-gray-50'}`}
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <DataGrid
                    data={filteredSubCategories}
                    loading={loading}
                    renderItem={renderGridItem}
                    onEdit={handleOpenModal}
                    onView={(sub) => setViewingSubCategory(sub)}
                    onDelete={(id) => setConfirmState({ open: true, id: Number(id) })}
                    emptyIcon={GitBranch}
                />
            ) : (
                <DataTable
                    data={filteredSubCategories}
                    columns={columns}
                    loading={loading}
                    onView={(sub) => setViewingSubCategory(sub)}
                    onEdit={handleOpenModal}
                    onDelete={(id) => setConfirmState({ open: true, id: Number(id) })}
                />
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-[440px] bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-lg)] animate-scale-in">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-light)]">
                            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
                                {editingSubCategory ? 'Edit' : 'Create'} Sub Category
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-[var(--text-muted)] transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <LookupSelect
                                    type="categories"
                                    label="Parent Category"
                                    value={formData.categoryId}
                                    onChange={(val) => setFormData({ ...formData, categoryId: val.toString() })}
                                    disabled={!!editingSubCategory}
                                    icon={FolderOpen}
                                    placeholder="Select Category"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5">Sub Category Name</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. ASP.NET Middleware"
                                    className="w-full bg-[var(--bg-body)] border border-[var(--border-color)] rounded-lg py-2.5 px-4 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-light)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] outline-none transition-all"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--border-color)] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-4 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[13px] font-medium transition-colors shadow-md shadow-[var(--primary)]/20"
                                >
                                    {editingSubCategory ? 'Save Changes' : 'Create'}
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
                title="Delete Sub Category"
                message="Are you sure you want to delete this sub category? This action cannot be undone."
                confirmText="Yes, Delete"
                cancelText="Cancel"
                type="danger"
            />

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

export default SubCategoryManagementPage;
