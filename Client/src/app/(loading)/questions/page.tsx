"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { questionService } from "@/services/questionService";
import { QuestionListItem } from "@/types/question";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getQuestionLevelLabel } from "@/constants/questionLevels";

const PAGE_SIZE = 20;

export default function QuestionsBankPage() {
  const searchParams = useSearchParams();
  const levelParam = searchParams.get("level");
  const categoryParam = searchParams.get("categoryId");
  const pageParam = searchParams.get("page");

  const [items, setItems] = useState<QuestionListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(() => {
    const p = pageParam ? parseInt(pageParam, 10) : 1;
    return Number.isNaN(p) || p < 1 ? 1 : p;
  });
  const [level, setLevel] = useState<number | null>(() => {
    if (levelParam === null) return null;
    const n = parseInt(levelParam, 10);
    return Number.isNaN(n) ? null : n;
  });
  const [loading, setLoading] = useState(true);

  /* Sync level and page from URL so level tabs and pagination links work correctly */
  useEffect(() => {
    const p = pageParam ? parseInt(pageParam, 10) : 1;
    setPage(Number.isNaN(p) || p < 1 ? 1 : p);
  }, [pageParam]);
  useEffect(() => {
    if (levelParam === null) setLevel(null);
    else {
      const n = parseInt(levelParam, 10);
      setLevel(Number.isNaN(n) ? null : n);
    }
  }, [levelParam]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await questionService.getQuestionsPaged({
        categoryId: categoryParam ? parseInt(categoryParam, 10) : undefined,
        level: level ?? undefined,
        isActive: true,
        page,
        pageSize: PAGE_SIZE,
        sortBy: "CreatedAt",
        sortDescending: false,
      });
      if (res.isSuccess && res.data) {
        setItems(res.data.items);
        setTotalCount(res.data.totalCount);
      }
    } catch {
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, level, categoryParam]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const displayTitle = (q: QuestionListItem) => (q.titleAr?.trim() ? q.titleAr : q.title);
  const isRtl = (q: QuestionListItem) => Boolean(q.titleAr?.trim());

  return (
    <div className="page-questions-bank">
      <div className="page-questions-bank__wrap">
        <Link href="/" className="page-questions-bank__back">
          ← Back to home
        </Link>
        <h1 className="page-questions-bank__title">Question Bank</h1>
        <p className="page-questions-bank__desc">
          Browse questions by level. Use the home page to filter by category and module.
        </p>
        <div className="page-questions-bank__meta">
          {!loading && (
            <div className="page-questions-bank__stats">
              <div className="page-questions-bank__stat-card">
                <span className="page-questions-bank__stat-label">Total Questions</span>
                <span className="page-questions-bank__stat-value">{totalCount}</span>
              </div>
              {level !== null && (
                <div className="page-questions-bank__stat-card page-questions-bank__stat-card--filter">
                  <span className="page-questions-bank__stat-label">Current Level</span>
                  <span className="page-questions-bank__stat-value">{getQuestionLevelLabel(level)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="page-questions-bank__filter-bar">
          <span className="page-questions-bank__filter-label">Filter by Level:</span>
          <div className="page-questions-bank__level-tabs">
            <Link
              href="/questions"
              className={`page-questions-bank__tab ${level === null ? "page-questions-bank__tab--active" : ""}`}
            >
              All Levels
            </Link>
            {[0, 1, 2, 3].map((val) => (
              <Link
                key={val}
                href={`/questions?level=${val}`}
                className={`page-questions-bank__tab ${level === val ? "page-questions-bank__tab--active" : ""}`}
              >
                {getQuestionLevelLabel(val)}
              </Link>
            ))}
          </div>
        </div>

        <div className="page-questions-bank__list-outer">
          {loading ? (
            <div className="page-questions-bank__loading">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="page-questions-bank__list">
              {items.map((q, idx) => (
                <Link key={q.id} href={`/question/${q.id}`} className="page-questions-bank__card">
                  <span className="page-questions-bank__card-num">
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </span>
                  <div className="page-questions-bank__card-content">
                    <h3 className="page-questions-bank__card-title" dir={isRtl(q) ? "rtl" : "ltr"}>
                      {displayTitle(q)}
                    </h3>
                    <div className="page-questions-bank__card-meta">
                      {q.categoryName && <span>{q.categoryName}</span>}
                      {q.subCategoryName && <span>{q.subCategoryName}</span>}
                      {q.level != null && <span>{getQuestionLevelLabel(q.level)}</span>}
                    </div>
                  </div>
                  <ArrowRight size={18} className="page-questions-bank__card-arrow" />
                </Link>
              ))}
              {items.length === 0 && (
                <div className="page-questions-bank__empty">
                  <p>No questions found for this filter.</p>
                </div>
              )}
            </div>
          )}

          {totalPages > 1 && !loading && (
            <div className="page-questions-bank__pagination">
              <span className="page-questions-bank__pagination-range">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
              </span>
              <div className="page-questions-bank__pagination-btns">
                <Link
                  href={page <= 1 ? "/questions" : `/questions?page=${page - 1}${level != null ? `&level=${level}` : ""}`}
                  className={`page-questions-bank__pagination-btn ${page <= 1 ? "page-questions-bank__pagination-btn--disabled" : ""}`}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </Link>
                <span className="page-questions-bank__pagination-page">
                  {page} / {totalPages}
                </span>
                <Link
                  href={page >= totalPages ? "#" : `/questions?page=${page + 1}${level != null ? `&level=${level}` : ""}`}
                  className={`page-questions-bank__pagination-btn ${page >= totalPages ? "page-questions-bank__pagination-btn--disabled" : ""}`}
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
