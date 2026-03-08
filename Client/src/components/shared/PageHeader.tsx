import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({ title, subtitle, action, breadcrumbs }: PageHeaderProps) {
    return (
        <div className="mb-8 space-y-1">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-muted)] mb-3">
                <Home size={14} className="text-[var(--text-light)]" />
                <ChevronRight size={14} className="text-[var(--text-light)]/60" />
                {breadcrumbs ? (
                    breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={idx}>
                            {crumb.href ? (
                                <a href={crumb.href} className="hover:text-[var(--primary)] transition-colors">{crumb.label}</a>
                            ) : (
                                <span>{crumb.label}</span>
                            )}
                            {idx < breadcrumbs.length - 1 && <ChevronRight size={14} className="text-[var(--text-light)]/60" />}
                        </React.Fragment>
                    ))
                ) : (
                    <span>{title}</span>
                )}
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-[24px] font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-[14px] text-[var(--text-secondary)] mt-1.5 max-w-2xl font-medium">
                            {subtitle}
                        </p>
                    )}
                </div>
                {action && <div className="flex-shrink-0 animate-fade-in">{action}</div>}
            </div>
        </div>
    );
}
