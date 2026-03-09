"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCategories } from "@/store/slices/categorySlice";
import { logout, logoutUser } from "@/store/slices/authSlice";
import CategoryCard from "@/components/cards/CategoryCard";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
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
    <div className="page-home">
      <nav className="page-home__nav">
        <div className="page-home__nav-inner">
          <Link href="/" className="page-home__logo-link">
            <span className="page-home__logo-icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="" />
            </span>
            <span className="page-home__brand">
              Interview<span className="page-home__brand-accent">ify</span>{" "}
              <span className="page-home__badge">.NET Core</span>
            </span>
          </Link>

          <div className="page-home__nav-actions">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="page-home__nav-divider page-home__nav-actions">
                <Link href="/dashboard" className="page-home__nav-link">
                  <LayoutDashboard size={16} strokeWidth={2.5} />
                  Dashboard
                </Link>
                <span className="page-home__nav-user">
                  <User size={16} strokeWidth={2.5} />
                  {user?.name}
                </span>
                <button type="button" onClick={handleLogout} className="page-home__nav-logout">
                  <LogOut size={16} strokeWidth={2.5} />
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="page-home__btn-signin">
                <LogIn size={16} strokeWidth={2.5} />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="page-home__main">
        <div className="page-home__hero">
          <div className="page-home__hero-inner">
            <div className="page-home__hero-icon-wrap">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <h1 className="page-home__hero-title">
              Master <span className="page-home__brand-accent">.NET Core</span> Interviews
            </h1>
          </div>
          <p className="page-home__hero-desc">
            Explore curated paths for C#, ASP.NET Core, and Distributed Systems architecture.
          </p>
        </div>

        <div className="page-home__filter">
          <div className="page-home__filter-grid">
            <div className="page-home__filter-col-5">
              <h2 className="page-home__filter-label">
                <span className="page-home__filter-label-dot" />
                Filter Categories
              </h2>
              <div className="page-home__search-wrap">
                <input
                  type="text"
                  placeholder="Search for roles, skills, or tech..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="page-home__search-input"
                />
                <svg className="page-home__search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="page-home__filter-col-7">
              <h2 className="page-home__filter-label page-home__filter-label-muted">Specialization</h2>
              <div className="page-home__tags">
                {["All Tech", "C#", "Web API", "Architecture", "SQL", "EF Core"].map((tag) => {
                  const isActive =
                    (tag === "All Tech" && search === "") || search.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => (tag === "All Tech" ? setSearch("") : setSearch(tag))}
                      className={`page-home__tag ${isActive ? "page-home__tag--active" : "page-home__tag--inactive"}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="page-home__sections">
          {loading && (
            <section>
              <div className="page-home__loading-row">
                <div className="page-home__loading-dot" />
                <div className="page-home__loading-bar" />
              </div>
              <div className="page-home__grid">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="page-home__loading-card" />
                ))}
              </div>
            </section>
          )}
          {showEmptyOrError && (
            <section className="page-home__empty">
              {error ? (
                <>
                  <p className="page-home__empty-error">Something went wrong loading categories.</p>
                  <p className="page-home__empty-message">{error}</p>
                  <button type="button" onClick={handleRetry} className="page-home__btn-retry">
                    Try again
                  </button>
                </>
              ) : (
                <p className="page-home__empty-message" style={{ marginBottom: 0 }}>
                  No categories available yet.
                </p>
              )}
            </section>
          )}

          {!loading &&
            !showEmptyOrError &&
            (() => {
              const sections: { title: string; keywords: string[]; items: Category[] }[] = [
                { title: "C# Essentials", keywords: ["c#", "dotnet", ".net", "basic", "fundamental"], items: [] },
                { title: "Web & API Development", keywords: ["api", "web", "asp", "middleware", "rest"], items: [] },
                { title: "Data & Persistence", keywords: ["ef", "entity", "sql", "database", "query", "persistence"], items: [] },
                { title: "Architecture & Design", keywords: ["arch", "design", "pattern", "system", "solid", "clean"], items: [] },
                { title: "General Technical", keywords: [], items: [] },
              ];

              filteredData.forEach((cat) => {
                const lowerName = cat.name.toLowerCase();
                const found = sections.find((s) => s.keywords.some((k) => lowerName.includes(k)));
                if (found) found.items.push(cat);
                else sections[sections.length - 1].items.push(cat);
              });

              return sections
                .filter((s) => s.items.length > 0)
                .map((sect, sIdx) => (
                  <section key={sect.title}>
                    <div className="page-home__section-header">
                      <div className="page-home__section-header-left">
                        <div className="page-home__section-dot" />
                        <h2 className="page-home__section-title">{sect.title}</h2>
                        <span className="page-home__section-badge">{sect.items.length} Modules</span>
                      </div>
                      <div className="page-home__section-divider" />
                    </div>
                    <div className="page-home__grid">
                      {sect.items.map((category, index) => (
                        <CategoryCard key={category.id} category={category} index={sIdx + index} />
                      ))}
                    </div>
                  </section>
                ));
            })()}
        </div>
      </main>

      <footer className="page-home__footer">
        <div className="page-home__footer-inner">
          <div className="page-home__footer-brand-col">
            <div className="page-home__footer-logo">
              <div className="page-home__footer-logo-icon">I</div>
              <span className="page-home__brand">
                Interview<span className="page-home__brand-accent">ify</span>
              </span>
            </div>
            <p className="page-home__footer-desc">
              The premier interview preparation platform for .NET Core specialists. Bridge the gap between
              coding and landing your dream role at top tech companies.
            </p>
          </div>
          <div>
            <h4 className="page-home__footer-heading">Platform</h4>
            <ul className="page-home__footer-links">
              <li>Question Bank</li>
              <li style={{ opacity: 0.75 }}>Mock Interviews (coming later)</li>
              <li style={{ opacity: 0.75 }}>Roadmaps (coming later)</li>
            </ul>
          </div>
          <div>
            <h4 className="page-home__footer-heading">Company</h4>
            <ul className="page-home__footer-links">
              <li style={{ opacity: 0.75 }}>About Us (coming later)</li>
              <li style={{ opacity: 0.75 }}>Contact (coming later)</li>
              <li style={{ opacity: 0.75 }}>Privacy Policy (coming later)</li>
            </ul>
          </div>
        </div>
        <div className="page-home__footer-bottom">
          <p className="page-home__footer-copy">{siteConfig.copyright}</p>
          <div className="page-home__footer-socials">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="page-home__footer-social-item" />
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
