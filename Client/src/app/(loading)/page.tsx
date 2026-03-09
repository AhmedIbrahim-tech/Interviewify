"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCategories } from "@/store/slices/categorySlice";
import { logout, logoutUser } from "@/store/slices/authSlice";
import CategoryCard from "@/components/CategoryCard";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { siteConfig } from "@/config/site";
import { LayoutDashboard, User, LogOut, LogIn } from "lucide-react";
import { Category } from "@/types/category";

export default function Home() {
  const dispatch = useAppDispatch();
  const { items: categories, loading, error } = useAppSelector((state) => state.categories);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchCategories({ activeOnly: true }));
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(logout());
  };

  const filteredData = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      (typeof cat.description === "string" && cat.description.toLowerCase().includes(search.toLowerCase()))
  );

  const showEmptyOrError = !loading && (categories.length === 0 || error);
  const handleRetry = () => dispatch(fetchCategories());

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--primary-text)] font-sans selection:bg-[var(--primary)]/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-10 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="h-8 w-8 rounded-lg overflow-hidden flex-shrink-0 block group-hover:scale-110 transition-transform bg-[var(--primary)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="" className="h-full w-full object-contain" />
            </span>
            <span className="font-bold text-lg tracking-tight">Interview<span className="text-[var(--primary)]">ify</span> <span className="text-[10px] font-black bg-[var(--primary-light)] text-[var(--primary)] px-2 py-0.5 rounded ml-2 uppercase tracking-tighter">.NET Core</span></span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-4 border-l border-[var(--border-color)] pl-5 ml-1">
                <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-[var(--muted-text)] hover:text-[var(--primary)] transition-colors">
                  <LayoutDashboard size={16} strokeWidth={2.5} />
                  Dashboard
                </Link>
                <span className="flex items-center gap-2 text-xs font-bold text-[var(--primary)]">
                  <User size={16} strokeWidth={2.5} />
                  {user?.name}
                </span>
                <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-[var(--danger)]/90 hover:text-[var(--danger)] transition-colors">
                  <LogOut size={16} strokeWidth={2.5} />
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all transform hover:scale-105 active:scale-95">
                <LogIn size={16} strokeWidth={2.5} />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header Section like "My Projects" */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Master <span className="text-[var(--primary)]">.NET Core</span> Interviews</h1>
          </div>
          <p className="text-[var(--muted-text)] text-sm font-medium">Explore curated paths for C#, ASP.NET Core, and Distributed Systems architecture.</p>
        </div>

        {/* Filter Section */}
        <div className="mb-16 p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border-color)] shadow-[var(--shadow-lg)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-5">
              <h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                Filter Categories
              </h2>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search for roles, skills, or tech..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[var(--input)] border border-[var(--input-border)] rounded-2xl py-4 pl-12 pr-4 text-sm text-[var(--primary-text)] placeholder:text-[var(--muted-text)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all outline-none group-hover:border-[var(--border-color)]"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-text)] group-focus-within:text-[var(--primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="lg:col-span-7">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-text)] mb-4 px-1">Specialization</h2>
              <div className="flex flex-wrap gap-3">
                {['All Tech', 'C#', 'Web API', 'Architecture', 'SQL', 'EF Core'].map((tag, idx) => (
                  <button
                    key={tag}
                    onClick={() => tag === 'All Tech' ? setSearch('') : setSearch(tag)}
                    className={`px-5 py-2.5 rounded-xl border text-[10px] font-extrabold uppercase tracking-widest transition-all ${(tag === 'All Tech' && search === '') || search.toLowerCase() === tag.toLowerCase()
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 scale-105'
                      : 'bg-[var(--surface-elevated)] border-[var(--border-color)] text-[var(--muted-text)] hover:text-[var(--primary-text)] hover:border-[var(--primary)]/50'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grouped by Specialization */}
        <div className="space-y-24">
          {loading && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse" />
                <div className="h-6 w-48 bg-[var(--surface-elevated)] rounded-lg animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-96 rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] animate-pulse" />
                ))}
              </div>
            </section>
          )}
          {showEmptyOrError && (
            <section className="py-20 px-6 rounded-3xl bg-[var(--surface)] border border-[var(--border-color)] text-center">
              {error ? (
                <>
                  <p className="text-[var(--danger)] font-bold mb-2">Something went wrong loading categories.</p>
                  <p className="text-[var(--muted-text)] text-sm mb-6">{error}</p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="px-6 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-bold transition-all"
                  >
                    Try again
                  </button>
                </>
              ) : (
                <p className="text-[var(--muted-text)] font-medium">No categories available yet.</p>
              )}
            </section>
          )}

          {!loading && !showEmptyOrError && (() => {
            const sections: { title: string; keywords: string[]; items: Category[] }[] = [
              { title: "C# Essentials", keywords: ["c#", "dotnet", ".net", "basic", "fundamental"], items: [] },
              { title: "Web & API Development", keywords: ["api", "web", "asp", "middleware", "rest"], items: [] },
              { title: "Data & Persistence", keywords: ["ef", "entity", "sql", "database", "query", "persistence"], items: [] },
              { title: "Architecture & Design", keywords: ["arch", "design", "pattern", "system", "solid", "clean"], items: [] },
              { title: "General Technical", keywords: [], items: [] },
            ];

            filteredData.forEach(cat => {
              const lowerName = cat.name.toLowerCase();
              const found = sections.find(s => s.keywords.some(k => lowerName.includes(k)));
              if (found) found.items.push(cat);
              else sections[sections.length - 1].items.push(cat);
            });

            return sections.filter(s => s.items.length > 0).map((sect, sIdx) => (
              <section key={sect.title}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" />
                    <h2 className="text-xl font-bold tracking-tight">{sect.title}</h2>
                    <span className="text-[10px] font-black bg-[var(--surface-elevated)] text-[var(--muted-text)] px-2 py-0.5 rounded uppercase tracking-widest border border-[var(--border-color)] ml-2">
                      {sect.items.length} Modules
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-[var(--border-color)] mx-8 hidden md:block" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sect.items.map((category, index) => (
                    <CategoryCard key={category.id} category={category} index={sIdx + index} />
                  ))}
                </div>
              </section>
            ));
          })()}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-20 border-t border-[var(--border-color)] bg-[var(--background-secondary)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold">I</div>
              <span className="font-bold text-lg tracking-tight">Interview<span className="text-[var(--primary)]">ify</span></span>
            </div>
            <p className="text-[var(--muted-text)] text-sm max-w-sm leading-relaxed">The premier interview preparation platform for .NET Core specialists. Bridge the gap between coding and landing your dream role at top tech companies.</p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[var(--primary-text)] mb-6">Platform</h4>
            <ul className="space-y-4 text-xs font-bold text-[var(--muted-text)]">
              <li className="cursor-default">Question Bank</li>
              <li className="cursor-default opacity-75">Mock Interviews <span className="text-[10px] normal-case">(coming later)</span></li>
              <li className="cursor-default opacity-75">Roadmaps <span className="text-[10px] normal-case">(coming later)</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[var(--primary-text)] mb-6">Company</h4>
            <ul className="space-y-4 text-xs font-bold text-[var(--muted-text)]">
              <li className="cursor-default opacity-75">About Us <span className="text-[10px] normal-case">(coming later)</span></li>
              <li className="cursor-default opacity-75">Contact <span className="text-[10px] normal-case">(coming later)</span></li>
              <li className="cursor-default opacity-75">Privacy Policy <span className="text-[10px] normal-case">(coming later)</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-[var(--border-color)] flex justify-between items-center">
          <p className="text-[10px] text-[var(--muted-text)] font-bold uppercase tracking-widest">{siteConfig.copyright}</p>
          <div className="flex gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-8 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface)] transition-all" />)}
          </div>
        </div>
      </footer>
    </div>
  );
}
