import React, { useState, useMemo } from "react";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    Eye,
    ArrowUpDown,
    ChevronUp,
    ExternalLink,
    ToggleLeft,
} from "lucide-react";
import { CustomSelect } from "./CustomSelect";

export interface Column<T> {
    header: string;
    key: keyof T | string;
    sortable?: boolean;
    render?: (item: T, index: number) => React.ReactNode;
}

export type SortDirection = "asc" | "desc";

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    onEdit?: (item: T) => void;
    onDelete?: (id: string | number) => void;
    onView?: (item: T) => void;
    onToggleStatus?: (item: T) => void;
    onOpenInBank?: (item: T) => void;
    actions?: boolean;
    renderExpanded?: (item: T) => React.ReactNode;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
    selectable?: boolean;
    sortKey?: string;
    sortDirection?: SortDirection;
    onSort?: (key: string, direction: SortDirection) => void;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    loading = false,
    onEdit,
    onDelete,
    onView,
    onToggleStatus,
    onOpenInBank,
    actions = true,
    renderExpanded,
    pageSize: initialPageSize = 10,
    onPageSizeChange,
    selectable = true,
    sortKey,
    sortDirection,
    onSort,
}: DataTableProps<T>) {
    const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
    const [internalPageSize, setInternalPageSize] = useState(initialPageSize);
    const pageSize = onPageSizeChange ? initialPageSize : internalPageSize;
    const setPageSize = onPageSizeChange ?? setInternalPageSize;

    const totalPages = Math.ceil(data.length / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pagedData = useMemo(() => data.slice(startIdx, endIdx), [data, startIdx, endIdx]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);

    const handlePageSizeChange = (value: number) => {
        setPageSize(value);
        setCurrentPage(1);
        onPageSizeChange?.(value);
    };

    const handleSort = (key: string) => {
        if (!onSort || columns.find((c) => (c.key as string) === key)?.sortable === false) return;
        const next = sortKey === key && sortDirection === "desc" ? "asc" : "desc";
        onSort(key, next);
    };

    const toggleRow = (id: string | number) => {
        const next = new Set(expandedRows);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedRows(next);
    };

    const toggleSelectAll = () => {
        if (selectedRows.size === pagedData.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(pagedData.map((i) => i.id)));
        }
    };

    const toggleSelectRow = (id: string | number) => {
        const next = new Set(selectedRows);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedRows(next);
    };

    if (loading) {
        return (
            <div className="data-table__loading">
                <div className="data-table__loading-header" />
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="data-table__loading-row">
                        <div className="data-table__loading-cell" />
                        <div className="data-table__loading-cell" />
                        <div className="data-table__loading-cell" />
                        <div className="data-table__loading-cell" style={{ maxWidth: "12%" }} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="data-table">
            <div className="data-table__scroll">
                <table className="data-table__table">
                    <thead className="data-table__thead">
                        <tr>
                            {selectable && (
                                <th className="data-table__th data-table__th--checkbox">
                                    <input
                                        type="checkbox"
                                        className="data-table__checkbox"
                                        checked={selectedRows.size > 0 && selectedRows.size === pagedData.length}
                                        onChange={toggleSelectAll}
                                        aria-label="Select all"
                                    />
                                </th>
                            )}
                            {columns.map((col, idx) => {
                                const key = col.key as string;
                                const isSorted = sortKey === key;
                                return (
                                    <th key={idx} className="data-table__th">
                                        <span
                                            className="data-table__th-sort"
                                            role={col.sortable !== false && onSort ? "button" : undefined}
                                            onClick={col.sortable !== false && onSort ? () => handleSort(key) : undefined}
                                            onKeyDown={col.sortable !== false && onSort ? (e) => e.key === "Enter" && handleSort(key) : undefined}
                                            tabIndex={col.sortable !== false && onSort ? 0 : undefined}
                                        >
                                            {col.header}
                                            {col.sortable !== false && (
                                                isSorted ? (
                                                    sortDirection === "desc" ? <ChevronDown size={14} aria-hidden /> : <ChevronUp size={14} aria-hidden />
                                                ) : (
                                                    <ArrowUpDown size={14} style={{ opacity: 0.6 }} aria-hidden />
                                                )
                                            )}
                                        </span>
                                    </th>
                                );
                            })}
                            {actions && (
                                <th className="data-table__th data-table__th--actions">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="data-table__tbody">
                        {pagedData.map((item, idx) => {
                            const isExpanded = expandedRows.has(item.id);
                            const isSelected = selectedRows.has(item.id);
                            const rowNum = startIdx + idx + 1;

                            return (
                                <React.Fragment key={item.id}>
                                    <tr
                                        className={`data-table__tr ${isSelected ? "data-table__tr--selected" : ""} ${isExpanded ? "data-table__tr--expanded" : ""}`}
                                    >
                                        {selectable && (
                                            <td className="data-table__td data-table__td--checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="data-table__checkbox"
                                                    checked={selectedRows.has(item.id)}
                                                    onChange={() => toggleSelectRow(item.id)}
                                                    aria-label={`Select row ${rowNum}`}
                                                />
                                            </td>
                                        )}
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className="data-table__td">
                                                {col.render
                                                    ? col.render(item, idx)
                                                    : (item[col.key as keyof T] as React.ReactNode)}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="data-table__td">
                                                <div className="data-table__actions">
                                                    {renderExpanded && (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleRow(item.id)}
                                                            className={`data-table__expand-btn ${isExpanded ? "data-table__expand-btn--active" : ""}`}
                                                            title={isExpanded ? "Collapse" : "Expand"}
                                                            aria-expanded={isExpanded}
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronUp size={16} />
                                                            ) : (
                                                                <ChevronDown size={16} />
                                                            )}
                                                        </button>
                                                    )}
                                                    {onView && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onView(item)}
                                                            className="data-table__action-btn data-table__action-btn--view"
                                                            title="View"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    )}
                                                    {onOpenInBank && (
                                                        <a
                                                            href={`/question/${item.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="data-table__action-btn data-table__action-btn--view"
                                                            title="Open in question bank"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    )}
                                                    {onToggleStatus && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onToggleStatus(item)}
                                                            className="data-table__action-btn data-table__action-btn--edit"
                                                            title="Toggle status"
                                                        >
                                                            <ToggleLeft size={16} />
                                                        </button>
                                                    )}
                                                    {onEdit && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onEdit(item)}
                                                            className="data-table__action-btn data-table__action-btn--edit"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onDelete(item.id)}
                                                            className="data-table__action-btn data-table__action-btn--delete"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                    {isExpanded && renderExpanded && (
                                        <tr className="data-table__expanded-row">
                                            <td
                                                colSpan={
                                                    columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                                                }
                                                className="data-table__expanded-cell"
                                            >
                                                <div className="data-table__expanded-inner">
                                                    {renderExpanded(item)}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {data.length > 0 && (
                <div className="data-table__pagination">
                    <div className="flex items-center gap-2">
                        <span className="data-table__pagination-label">Rows per page:</span>
                        <div className="w-24">
                            <CustomSelect
                                options={[
                                    { value: 10, label: "10" },
                                    { value: 25, label: "25" },
                                    { value: 50, label: "50" },
                                ]}
                                value={pageSize}
                                onChange={(val) => handlePageSizeChange(Number(val))}
                                placeholder={String(pageSize)}
                                direction="top"
                                className="scale-90"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="data-table__pagination-range">
                            {startIdx + 1}-{Math.min(endIdx, data.length)} of {data.length}
                        </span>
                        <div className="data-table__pagination-nav">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="data-table__pagination-btn"
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                type="button"
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="data-table__pagination-btn"
                                aria-label="Next page"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
