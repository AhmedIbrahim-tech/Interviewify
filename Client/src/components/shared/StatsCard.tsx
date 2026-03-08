import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    trend?: {
        value: string;
        isUp: boolean;
    };
}

const colorMap = {
    primary: {
        bg: 'bg-[var(--primary-light)]',
        text: 'text-[var(--primary)]',
    },
    success: {
        bg: 'bg-[var(--success-light)]',
        text: 'text-[var(--success)]',
    },
    warning: {
        bg: 'bg-[var(--warning-light)]',
        text: 'text-[var(--warning)]',
    },
    danger: {
        bg: 'bg-[var(--danger-light)]',
        text: 'text-[var(--danger)]',
    },
    info: {
        bg: 'bg-[var(--info-light)]',
        text: 'text-[var(--info)]',
    }
};

export function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
    const colors = colorMap[color];

    return (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)] p-5 hover:shadow-[var(--shadow-md)] transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-[12px] font-medium text-[var(--text-muted)] mb-1">{title}</p>
                    <h3 className="text-[22px] font-bold text-[var(--text-primary)]">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <Icon size={22} className={colors.text} />
                </div>
            </div>
            {trend && (
                <div className="flex items-center gap-1.5">
                    {trend.isUp ? (
                        <TrendingUp size={14} className="text-[var(--success)]" />
                    ) : (
                        <TrendingDown size={14} className="text-[var(--danger)]" />
                    )}
                    <span className={`text-[12px] font-medium ${trend.isUp ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                        {trend.value}
                    </span>
                    <span className="text-[12px] text-[var(--text-light)]">vs last month</span>
                </div>
            )}
        </div>
    );
}
