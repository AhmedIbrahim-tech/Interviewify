import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Info, Shield, Star } from 'lucide-react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' | 'premium';

interface StatusBadgeProps {
    label: string;
    variant?: BadgeVariant;
    icon?: React.ElementType;
    pulse?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const variantConfig: Record<BadgeVariant, { container: string, text: string, icon: React.ElementType, glow: string }> = {
    success: {
        container: 'bg-emerald-50 border-emerald-100/50',
        text: 'text-emerald-600',
        icon: CheckCircle2,
        glow: 'bg-emerald-400'
    },
    warning: {
        container: 'bg-amber-50 border-amber-100/50',
        text: 'text-amber-600',
        icon: Clock,
        glow: 'bg-amber-400'
    },
    danger: {
        container: 'bg-rose-50 border-rose-100/50',
        text: 'text-rose-600',
        icon: AlertCircle,
        glow: 'bg-rose-400'
    },
    info: {
        container: 'bg-sky-50 border-sky-100/50',
        text: 'text-sky-600',
        icon: Info,
        glow: 'bg-sky-400'
    },
    primary: {
        container: 'bg-indigo-50 border-indigo-100/50',
        text: 'text-indigo-600',
        icon: Shield,
        glow: 'bg-indigo-400'
    },
    premium: {
        container: 'bg-purple-50 border-purple-100/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
        text: 'text-purple-600',
        icon: Star,
        glow: 'bg-purple-400'
    },
    default: {
        container: 'bg-slate-50 border-slate-100/50',
        text: 'text-slate-500',
        icon: Info,
        glow: 'bg-slate-300'
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
    size = 'md'
}: StatusBadgeProps) {
    const config = variantConfig[variant];
    const Icon = CustomIcon || config.icon;

    return (
        <span className={`
            inline-flex items-center font-bold uppercase tracking-wider rounded-xl border
            transition-all duration-300 hover:scale-105 select-none
            ${config.container} ${config.text} ${sizeStyles[size]}
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
