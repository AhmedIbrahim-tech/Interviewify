"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';

interface Option {
    value: string | number;
    label: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    icon?: LucideIcon;
    disabled?: boolean;
    label?: string;
    className?: string;
    direction?: 'top' | 'bottom';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select option",
    icon: Icon,
    disabled = false,
    label,
    className = "",
    direction = 'bottom'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(opt => opt.value.toString() === value.toString());

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`w-full ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-[12px] font-bold text-[var(--text-muted)] mb-2 uppercase tracking-widest">
                    {label}
                </label>
            )}
            <div className="relative">
                {/* Trigger */}
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        w-full flex items-center justify-between
                        bg-[var(--input)] border rounded-xl py-2.5 ${Icon ? 'pl-11' : 'px-4'} pr-4
                        text-[13px] font-semibold transition-all duration-200
                        ${disabled ? 'opacity-50 cursor-not-allowed bg-[var(--surface-elevated)]' : 'cursor-pointer hover:border-[var(--primary)]/50'}
                        ${isOpen ? 'border-[var(--primary)] ring-4 ring-[var(--primary)]/5 shadow-sm' : 'border-[var(--input-border)] shadow-sm'}
                    `}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        {Icon && (
                            <div className={`absolute left-4 transition-colors ${isOpen ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>
                                <Icon size={18} />
                            </div>
                        )}
                        <span className={`truncate ${selectedOption ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                    </div>
                    <ChevronDown
                        size={18}
                        className={`text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--primary)]' : ''}`}
                    />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className={`
                        absolute z-[100] w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl shadow-[var(--shadow-lg)] py-2 animate-scale-in
                        ${direction === 'top' ? 'bottom-full mb-2' : 'mt-2'}
                    `}>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {placeholder && !selectedOption && (
                                <div
                                    className="px-4 py-2.5 text-[13px] text-[var(--text-muted)] font-medium border-b border-[var(--border-light)] mb-1"
                                >
                                    {placeholder}
                                </div>
                            )}
                            {options.length === 0 ? (
                                <div className="px-4 py-3 text-[12px] text-[var(--text-muted)] italic text-center">
                                    No options available
                                </div>
                            ) : (
                                options.map((option) => (
                                    <div
                                        key={option.value}
                                        onClick={() => handleSelect(option.value)}
                                        className={`
                                            px-4 py-2.5 mx-2 rounded-lg text-[13px] cursor-pointer font-semibold transition-all duration-200
                                            ${option.value.toString() === value.toString()
                                                ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20 scale-[1.02]'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'}
                                        `}
                                    >
                                        {option.label}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
