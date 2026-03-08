"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCategories } from "@/store/slices/categorySlice";
import { logout, logoutUser } from "@/store/slices/authSlice";
import CategoryCard from "@/components/CategoryCard";
import Link from "next/link";

export default function Home() {
  const dispatch = useAppDispatch();
  const { items: categories, loading, error } = useAppSelector((state) => state.categories);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(logout());
  };

  const mockCategories = [
    {
      id: "1",
      name: "C# Mastery",
      description: "Deep dive into LINQ, async/await, memory management, and advanced language features.",
      image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=2128&auto=format&fit=crop",
      subCategories: [
        { id: "s1", name: "Generics & Collections", categoryId: "1" },
        { id: "s2", name: "Asynchronous Programming", categoryId: "1" },
        { id: "s3", name: "Memory Management (GC)", categoryId: "1" },
        { id: "s3_1", name: "Expression Trees", categoryId: "1" }
      ]
    },
    {
      id: "2",
      name: "ASP.NET Core",
      description: "Middleware, dependency injection, high-performance APIs, and security best practices.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
      subCategories: [
        { id: "s4", name: "Middleware Pipeline", categoryId: "2" },
        { id: "s5", name: "Dependency Injection", categoryId: "2" },
        { id: "s6", name: "Authentication & Authorization", categoryId: "2" },
        { id: "s6_1", name: "Web API Performance", categoryId: "2" }
      ]
    },
    {
      id: "3",
      name: "Entity Framework Core",
      description: "Query optimization, value conversions, shadow properties, and migration strategies.",
      image: "https://images.unsplash.com/photo-1544383335-cce351cc0f3a?q=80&w=2021&auto=format&fit=crop",
      subCategories: [
        { id: "s7", name: "Eager vs Lazy Loading", categoryId: "3" },
        { id: "s8", name: "Concurrency Filtering", categoryId: "3" },
        { id: "s9", name: "Shadow Properties", categoryId: "3" },
        { id: "s9_1", name: "Raw SQL Queries", categoryId: "3" }
      ]
    }
  ];

  const displayData = categories.length > 0 ? categories : mockCategories;
  const filteredData = displayData.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-600/30">
      {/* Navbar Integration from Image */}
      <nav className="fixed top-0 w-full z-10 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">I</div>
            <span className="font-bold text-lg tracking-tight">Interview<span className="text-indigo-500">ify</span> <span className="text-[10px] font-black bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded ml-2 uppercase tracking-tighter">.NET Core</span></span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/explore" className="text-xs font-bold text-gray-400 hover:text-white transition-colors">Questions</Link>
            <Link href="/community" className="text-xs font-bold text-gray-400 hover:text-white transition-colors">Roadmaps</Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-4 border-l border-white/10 pl-6 ml-2">
                <Link href="/dashboard" className="text-xs font-bold text-gray-400 hover:text-indigo-400 transition-colors mr-2">Dashboard</Link>
                <span className="text-xs font-bold text-indigo-400">{user?.name}</span>
                <button onClick={handleLogout} className="text-xs font-bold text-red-500/80 hover:text-red-500 transition-colors">Logout</button>
              </div>
            ) : (
              <Link href="/login" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold transition-all transform hover:scale-105 active:scale-95">Expert Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header Section like "My Projects" */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-500">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Master <span className="text-indigo-500">.NET Core</span> Interviews</h1>
          </div>
          <p className="text-gray-500 text-sm font-medium">Explore curated paths for C#, ASP.NET Core, and Distributed Systems architecture.</p>
        </div>

        {/* Filter Section like in Image */}
        <div className="mb-16 p-8 rounded-3xl bg-white/[0.02] border border-white/5 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-5">
              <h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Filter Categories
              </h2>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search for roles, skills, or tech..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none group-hover:border-white/10"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="lg:col-span-7">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-1">Specialization</h2>
              <div className="flex flex-wrap gap-3">
                {['All Tech', 'C#', 'Web API', 'Architecture', 'SQL', 'EF Core'].map((tag, idx) => (
                  <button
                    key={tag}
                    onClick={() => tag === 'All Tech' ? setSearch('') : setSearch(tag)}
                    className={`px-5 py-2.5 rounded-xl border text-[10px] font-extrabold uppercase tracking-widest transition-all ${(tag === 'All Tech' && search === '') || search.toLowerCase() === tag.toLowerCase()
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105'
                      : 'bg-[#0a0a0c] border-white/5 text-gray-400 hover:text-white hover:border-indigo-500/50'
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
          {error && (
            <div className="p-4 mb-8 bg-red-900/10 text-red-500 rounded-2xl border border-red-900/20 text-xs font-bold">
              {error} - Loading offline cache.
            </div>
          )}

          {loading && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                <div className="h-6 w-48 bg-white/5 rounded-lg animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-96 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
                ))}
              </div>
            </section>
          )}
          {!loading && (() => {
            const sections = [
              { title: "C# Essentials", keywords: ["c#", "dotnet", ".net", "basic", "fundamental"], items: [] as any[] },
              { title: "Web & API Development", keywords: ["api", "web", "asp", "middleware", "rest"], items: [] as any[] },
              { title: "Data & Persistence", keywords: ["ef", "entity", "sql", "database", "query", "persistence"], items: [] as any[] },
              { title: "Architecture & Design", keywords: ["arch", "design", "pattern", "system", "solid", "clean"], items: [] as any[] },
              { title: "General Technical", keywords: [], items: [] as any[] },
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
                    <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                    <h2 className="text-xl font-bold tracking-tight">{sect.title}</h2>
                    <span className="text-[10px] font-black bg-white/5 text-gray-500 px-2 py-0.5 rounded uppercase tracking-widest border border-white/5 ml-2">
                      {sect.items.length} Modules
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-white/5 mx-8 hidden md:block" />
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

      {/* Footer from Image Style */}
      <footer className="mt-20 py-20 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">I</div>
              <span className="font-bold text-lg tracking-tight">Interview<span className="text-indigo-600">ify</span></span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed">The premier interview preparation platform for .NET Core specialists. Bridge the gap between coding and landing your dream role at top tech companies.</p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-6">Platform</h4>
            <ul className="space-y-4 text-xs font-bold text-gray-500">
              <li className="hover:text-blue-500 transition-all cursor-pointer">Question Bank</li>
              <li className="hover:text-blue-500 transition-all cursor-pointer">Mock Interviews</li>
              <li className="hover:text-blue-500 transition-all cursor-pointer">Roadmaps</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-6">Company</h4>
            <ul className="space-y-4 text-xs font-bold text-gray-500">
              <li className="hover:text-blue-500 transition-all cursor-pointer">About Us</li>
              <li className="hover:text-blue-500 transition-all cursor-pointer">Contact</li>
              <li className="hover:text-blue-500 transition-all cursor-pointer">Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex justify-between items-center">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">© 2025 Interviewify. All rights reserved.</p>
          <div className="flex gap-4">
            {/* Social Icons Placeholder */}
            {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 transition-all" />)}
          </div>
        </div>
      </footer>
    </div>
  );
}
