import React, { useState, useMemo } from 'react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    Eye,
    ArrowUpDown,
    MoreVertical,
    ChevronUp
} from 'lucide-react';
import { CustomSelect } from './CustomSelect';

export interface Column<T> {
    header: string;
    key: keyof T | string;
    sortable?: boolean;
    render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    onEdit?: (item: T) => void;
    onDelete?: (id: string | number) => void;
    onView?: (item: T) => void;
    actions?: boolean;
    renderExpanded?: (item: T) => React.ReactNode;
    pageSize?: number;
    selectable?: boolean;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    loading = false,
    onEdit,
    onDelete,
    onView,
    actions = true,
    renderExpanded,
    pageSize = 10,
    selectable = true
}: DataTableProps<T>) {
    const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

    const totalPages = Math.ceil(data.length / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pagedData = useMemo(() => data.slice(startIdx, endIdx), [data, startIdx, endIdx]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);

    const toggleRow = (id: string | number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedRows(newExpanded);
    };

    const toggleSelectAll = () => {
        if (selectedRows.size === pagedData.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(pagedData.map(i => i.id)));
        }
    };

    const toggleSelectRow = (id: string | number) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedRows(newSelected);
    };

    if (loading) {
        return (
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden animate-pulse">
                <div className="h-12 bg-gray-50 border-b border-[var(--border-color)]" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="px-6 py-5 border-b border-[var(--border-light)] last:border-0 flex gap-4">
                        <div className="h-4 bg-gray-100 rounded w-1/4" />
                        <div className="h-4 bg-gray-100 rounded w-1/4" />
                        <div className="h-4 bg-gray-100 rounded w-1/4 ml-auto" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm relative">
            <div className="overflow-x-auto rounded-t-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-[var(--border-color)] bg-white/50">
                            {selectable && (
                                <th className="px-5 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                                        checked={selectedRows.size > 0 && selectedRows.size === pagedData.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                            )}
                            {columns.map((column, idx) => (
                                <th key={idx} className="px-5 py-4 text-[13px] font-bold text-[var(--text-primary)] whitespace-nowrap">
                                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--primary)] transition-colors group">
                                        {column.header}
                                        {column.sortable !== false && (
                                            <ArrowUpDown size={14} className="text-[var(--text-light)] group-hover:text-[var(--primary)] opacity-50 transition-colors" />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && (
                                <th className="px-5 py-4 text-[13px] font-bold text-[var(--text-primary)] text-right whitespace-nowrap uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {pagedData.map((item, idx) => {
                            const isExpanded = expandedRows.has(item.id);
                            const isSelected = selectedRows.has(item.id);

                            return (
                                <React.Fragment key={item.id}>
                                    <tr className={`
                                        border-b border-[var(--border-light)] last:border-0
                                        transition-all duration-200
                                        ${isSelected ? 'bg-blue-50/40' : 'hover:bg-[#f6f9fc]'}
                                        ${isExpanded ? 'bg-gray-50/80 shadow-inner' : ''}
                                    `}>
                                        {selectable && (
                                            <td className="px-5 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                                                    checked={selectedRows.has(item.id)}
                                                    onChange={() => toggleSelectRow(item.id)}
                                                />
                                            </td>
                                        )}
                                        {columns.map((column, colIdx) => (
                                            <td key={colIdx} className="px-5 py-4 text-[14px] text-[var(--text-secondary)] font-medium">
                                                {column.render ? column.render(item, idx) : (item[column.key as keyof T] as React.ReactNode)}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end items-center gap-1">
                                                    {renderExpanded && (
                                                        <button
                                                            onClick={() => toggleRow(item.id)}
                                                            className={`p-1.5 rounded-lg hover:bg-gray-100 text-[var(--text-muted)] transition-all ${isExpanded ? 'text-[var(--primary)] bg-blue-50' : ''}`}
                                                        >
                                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    )}
                                                    {onView && (
                                                        <button onClick={() => onView(item)} className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-blue-50 hover:text-[var(--primary)] transition-colors">
                                                            <Eye size={16} />
                                                        </button>
                                                    )}
                                                    {onEdit && (
                                                        <button
                                                            onClick={() => onEdit(item)}
                                                            className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => onDelete(item.id)}
                                                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
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
                                        <tr className="bg-white/40">
                                            <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="px-12 py-6 border-b border-[var(--border-light)]">
                                                <div className="animate-fade-in bg-white p-4 rounded-xl border border-[var(--border-color)]">
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

            {/* Pagination Footer */}
            {data.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[var(--border-color)] bg-gray-50/30 gap-4 rounded-b-2xl">
                    <div className="flex items-center gap-2">
                        <p className="text-[13px] text-[var(--text-muted)] font-medium whitespace-nowrap">
                            Rows per page:
                        </p>
                        <div className="w-24">
                            <CustomSelect
                                options={[
                                    { value: 10, label: '10' },
                                    { value: 25, label: '25' },
                                    { value: 50, label: '50' }
                                ]}
                                value={pageSize}
                                onChange={() => { }} // Could be implemented later if pageSize becomes state
                                placeholder={pageSize.toString()}
                                direction="top"
                                className="scale-90"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-[13px] text-[var(--text-muted)] font-medium">
                            {startIdx + 1}-{Math.min(endIdx, data.length)} of {data.length}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all disabled:opacity-30"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all disabled:opacity-30"
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
