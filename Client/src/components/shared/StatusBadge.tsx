import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Info, Shield, Star } from 'lucide-react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' | 'premium' | 'secondary';

interface StatusBadgeProps {
    label: string;
    variant?: BadgeVariant;
    icon?: React.ElementType;
    pulse?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/* Semantic tokens so badges work in light and dark mode */
const variantConfig: Record<BadgeVariant, { container: string, text: string, icon: React.ElementType, glow: string }> = {
    success: {
        container: 'bg-[var(--success-light)] border-[var(--success)]/30',
        text: 'text-[var(--success)]',
        icon: CheckCircle2,
        glow: 'bg-[var(--success)]'
    },
    warning: {
        container: 'bg-[var(--warning-light)] border-[var(--warning)]/30',
        text: 'text-[var(--warning)]',
        icon: Clock,
        glow: 'bg-[var(--warning)]'
    },
    danger: {
        container: 'bg-[var(--danger-light)] border-[var(--danger)]/30',
        text: 'text-[var(--danger)]',
        icon: AlertCircle,
        glow: 'bg-[var(--danger)]'
    },
    info: {
        container: 'bg-[var(--info-light)] border-[var(--info)]/30',
        text: 'text-[var(--info)]',
        icon: Info,
        glow: 'bg-[var(--info)]'
    },
    primary: {
        container: 'bg-[var(--primary-light)] border-[var(--primary)]/30',
        text: 'text-[var(--primary)]',
        icon: Shield,
        glow: 'bg-[var(--primary)]'
    },
    premium: {
        container: 'bg-[var(--primary-light)] border-[var(--primary)]/40 shadow-[0_0_15px_var(--primary)]/20',
        text: 'text-[var(--primary)]',
        icon: Star,
        glow: 'bg-[var(--primary)]'
    },
    default: {
        container: 'bg-[var(--surface-elevated)] border-[var(--border-color)]',
        text: 'text-[var(--text-muted)]',
        icon: Info,
        glow: 'bg-[var(--text-muted)]'
    },
    secondary: {
        container: 'bg-[var(--surface-elevated)] border-[var(--border-color)]',
        text: 'text-[var(--text-muted)]',
        icon: Clock,
        glow: 'bg-[var(--text-muted)]'
    },
};

const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-[11px] gap-1.5',
    lg: 'px-3 py-1.5 text-[12px] gap-2',
};

export function StatusBadge({
    label,
    variant = 'default',
    icon: CustomIcon,
    pulse = false,
    size = 'md',
    className = ''
}: StatusBadgeProps) {
    const config = variantConfig[variant] ?? variantConfig.default;
    const Icon = CustomIcon || config.icon;

    return (
        <span className={`
            inline-flex items-center font-bold uppercase tracking-wider rounded-xl border
            transition-all duration-300 hover:scale-105 select-none
            ${config.container} ${config.text} ${sizeStyles[size]} ${className}
        `}>
            {pulse && (
                <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.glow}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${config.glow}`}></span>
                </span>
            )}
            <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} strokeWidth={2.5} />
            {label}
        </span>
    );
}
