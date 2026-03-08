import React from 'react';

const CardSkeleton = () => (
    <div className="animate-pulse rounded-2xl bg-white dark:bg-white/5 p-6 border border-gray-100 dark:border-white/10">
        <div className="h-48 rounded-xl bg-gray-200 dark:bg-zinc-800 mb-6"></div>
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded mb-4"></div>
        <div className="h-4 w-full bg-gray-200 dark:bg-zinc-800 rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-zinc-800 rounded"></div>
    </div>
);

const HomeLoading = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-black p-8">
            <header className="mb-12">
                <div className="h-10 w-48 bg-gray-200 dark:bg-zinc-800 rounded mb-4 animate-pulse"></div>
                <div className="h-4 w-96 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
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
