import React from 'react';
import { Package, Inbox, Pencil, Trash2, Eye, MoreVertical } from 'lucide-react';

interface DataGridProps<T> {
    data: T[];
    loading?: boolean;
    columns?: 1 | 2 | 3 | 4;
    emptyIcon: React.ElementType;
    emptyTitle?: string;
    emptySubtitle?: string;
    onEdit?: (item: T) => void;
    onDelete?: (id: string | number) => void;
    onView?: (item: T) => void;
    actions?: boolean;
    renderItem: (item: T, index: number, actionButtons?: React.ReactNode) => React.ReactNode;
}

export function DataGrid<T extends { id: string | number }>({
    data,
    loading = false,
    renderItem,
    columns = 3,
    emptyIcon: EmptyIcon = Inbox,
    emptyTitle = "No items found",
    emptySubtitle = "There is no data to display at the moment.",
    onEdit,
    onDelete,
    onView,
    actions = true
}: DataGridProps<T>) {

    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    };

    const renderActions = (item: T) => {
        if (!actions) return null;
        return (
            <div className="flex items-center gap-1.5 p-1.5 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border-light)] backdrop-blur-sm shadow-sm group-hover/card:bg-[var(--card)] group-hover/card:shadow-md transition-all duration-300">
                {onView && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onView(item); }}
                        className="p-2 rounded-xl text-[var(--info)] hover:bg-[var(--info-light)] hover:scale-110 active:scale-90 transition-all duration-200"
                        title="View Details"
                    >
                        <Eye size={17} />
                    </button>
                )}
                {onEdit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                        className="p-2 rounded-xl text-[var(--warning)] hover:bg-[var(--warning-light)] hover:scale-110 active:scale-90 transition-all duration-200"
                        title="Edit Item"
                    >
                        <Pencil size={17} />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        className="p-2 rounded-xl text-[var(--danger)] hover:bg-[var(--danger-light)] hover:scale-110 active:scale-90 transition-all duration-200"
                        title="Delete Item"
                    >
                        <Trash2 size={17} />
                    </button>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`grid ${gridCols[columns]} gap-6`}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border-color)] shadow-[var(--shadow-card)] p-7 overflow-hidden relative min-h-[220px] flex flex-col"
                    >
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[var(--surface-elevated)] to-transparent" />
                        <div className="flex items-center justify-between mb-6">
                            <div className="h-14 w-14 rounded-2xl bg-[var(--surface-elevated)] animate-pulse" />
                            <div className="flex gap-2">
                                <div className="h-10 w-10 rounded-xl bg-[var(--surface-elevated)] animate-pulse" />
                                <div className="h-10 w-10 rounded-xl bg-[var(--surface-elevated)] animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="h-5 bg-[var(--surface-elevated)] rounded-lg w-3/4 animate-pulse" />
                            <div className="h-4 bg-[var(--surface-elevated)] rounded-lg w-1/2 animate-pulse" />
                        </div>
                        <div className="h-12 bg-[var(--surface-elevated)] rounded-2xl w-full mt-auto animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="py-28 flex flex-col items-center justify-center text-center bg-[var(--card)] rounded-[3.5rem] border border-dashed border-[var(--border-color)] shadow-[var(--shadow-card)]">
                <div className="p-10 rounded-[3rem] bg-[var(--surface-elevated)] text-[var(--text-muted)] mb-8 relative border border-[var(--border-light)]">
                    <div className="absolute inset-0 bg-[var(--primary)]/5 rounded-full blur-[80px] animate-pulse" />
                    <EmptyIcon size={64} className="relative z-10 drop-shadow-sm" />
                </div>
                <h3 className="text-[24px] font-black text-[var(--text-primary)] mb-2.5 tracking-tight">{emptyTitle}</h3>
                <p className="text-[16px] text-[var(--text-muted)] max-w-[380px] leading-relaxed font-medium">
                    {emptySubtitle}
                </p>
            </div>
        );
    }

    return (
        <div className={`grid ${gridCols[columns]} gap-7 stagger-children`}>
            {data.map((item, index) => (
                <div key={item.id} className="group/card">
                    {renderItem(item, index, renderActions(item))}
                </div>
            ))}
        </div>
    );
}
