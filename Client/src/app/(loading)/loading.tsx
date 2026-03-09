import React from 'react';

const CardSkeleton = () => (
    <div className="animate-pulse rounded-2xl bg-[var(--card)] p-6 border border-[var(--border-color)]">
        <div className="h-48 rounded-xl bg-[var(--surface-elevated)] mb-6"></div>
        <div className="h-6 w-3/4 bg-[var(--surface-elevated)] rounded mb-4"></div>
        <div className="h-4 w-full bg-[var(--surface-elevated)] rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-[var(--surface-elevated)] rounded"></div>
    </div>
);

const HomeLoading = () => {
    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <header className="mb-12">
                <div className="h-10 w-48 bg-[var(--surface-elevated)] rounded mb-4 animate-pulse"></div>
                <div className="h-4 w-96 bg-[var(--surface-elevated)] rounded animate-pulse"></div>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <CardSkeleton key={i} />
                ))}
            </main>
        </div>
    );
};

export default HomeLoading;
