import React from "react";
import { Inbox, Pencil, Trash2, Eye } from "lucide-react";

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
    actions = true,
}: DataGridProps<T>) {
    const colsClass = `data-grid data-grid--cols-${columns}`;

    const renderActions = (item: T) => {
        if (!actions) return null;
        return (
            <div className="data-grid__actions">
                {onView && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(item);
                        }}
                        className="data-grid__action-btn data-grid__action-btn--view"
                        title="View"
                    >
                        <Eye size={17} />
                    </button>
                )}
                {onEdit && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                        }}
                        className="data-grid__action-btn data-grid__action-btn--edit"
                        title="Edit"
                    >
                        <Pencil size={17} />
                    </button>
                )}
                {onDelete && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                        }}
                        className="data-grid__action-btn data-grid__action-btn--delete"
                        title="Delete"
                    >
                        <Trash2 size={17} />
                    </button>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className={colsClass}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="data-grid__card data-grid__card--loading">
                        <div className="data-grid__loading-shimmer" aria-hidden />
                        <div className="data-grid__loading-top">
                            <div className="data-grid__loading-placeholder" />
                            <div className="data-grid__loading-btns">
                                <div className="data-grid__loading-btn" />
                                <div className="data-grid__loading-btn" />
                            </div>
                        </div>
                        <div className="data-grid__loading-lines">
                            <div className="data-grid__loading-line data-grid__loading-line--wide" />
                            <div className="data-grid__loading-line data-grid__loading-line--short" />
                        </div>
                        <div className="data-grid__loading-bar" />
                    </div>
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="data-grid__empty">
                <div className="data-grid__empty-icon-wrap">
                    <EmptyIcon size={64} className="relative z-10" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.05))" }} />
                </div>
                <h3 className="data-grid__empty-title">{emptyTitle}</h3>
                <p className="data-grid__empty-subtitle">{emptySubtitle}</p>
            </div>
        );
    }

    return (
        <div className={`${colsClass} stagger-children`}>
            {data.map((item, index) => (
                <div key={item.id} className="group/card">
                    {renderItem(item, index, renderActions(item))}
                </div>
            ))}
        </div>
    );
}
