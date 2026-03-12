"use client";

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const typeStyles = {
        danger: {
            icon: 'bg-[var(--danger-light)] text-[var(--danger)]',
            button: 'bg-[var(--danger)] hover:bg-[var(--danger-hover)] text-white shadow-md shadow-[var(--danger)]/20'
        },
        warning: {
            icon: 'bg-[var(--warning-light)] text-[var(--warning)]',
            button: 'bg-[var(--warning)] hover:opacity-90 text-white shadow-md shadow-[var(--warning)]/20'
        },
        info: {
            icon: 'bg-[var(--info-light)] text-[var(--info)]',
            button: 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-md shadow-[var(--primary)]/20'
        }
    };

    const style = typeStyles[type];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 mt-[65px]">
            {/* Very light clear overlay */}
            <div className="absolute inset-0 bg-[var(--primary)]/[0.03]" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-[420px] bg-[var(--card)] rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-lg)] animate-scale-in overflow-hidden">
                {/* Accent line */}
                <div className={`h-1.5 w-full ${type === 'danger' ? 'bg-[var(--danger)]' : type === 'warning' ? 'bg-[var(--warning)]' : 'bg-[var(--primary)]'}`} />

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-all"
                >
                    <X size={18} />
                </button>

                <div className="p-8 text-center">
                    {/* Icon */}
                    <div className={`inline-flex p-4 rounded-2xl ${style.icon} mb-6`}>
                        <AlertTriangle size={28} />
                    </div>

                    <h3 className="text-[17px] font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
                    <p className="text-[13px] text-[var(--text-muted)] leading-relaxed mb-6">{message}</p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--danger)] text-[13px] font-medium text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${style.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
