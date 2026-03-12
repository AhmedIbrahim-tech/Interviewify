"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { questionService } from "@/services/questionService";
import { subCategoryService } from "@/services/subCategoryService";
import { QuestionListItem } from "@/types/question";
import { SubCategory } from "@/types/category";
import { notify } from "@/lib/notify";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { QUESTION_LEVELS, QUESTION_LEVEL_VALUES, getQuestionLevelLabel } from "@/constants/questionLevels";

const PAGE_SIZE = 15;

const SubCategoryQuestionsPage = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const levelParam = searchParams.get("level");
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  // Sync state from URL
  useEffect(() => {
    const p = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    setPage(Number.isNaN(p) || p < 1 ? 1 : p);
    
    const l = searchParams.get("level");
    if (l === null) setLevelFilter(null);
    else {
      const n = parseInt(l, 10);
      setLevelFilter(Number.isNaN(n) ? null : n);
    }
  }, [searchParams]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const subRes = await subCategoryService.getSubCategoryById(Number(id));
      if (subRes.isSuccess) setSubCategory(subRes.data);

      const res = await questionService.getQuestionsPaged({
        subCategoryId: Number(id),
        level: levelFilter ?? undefined,
        isActive: true,
        page,
        pageSize: PAGE_SIZE,
        sortBy: "CreatedAt",
        sortDescending: false,
      });
      if (res.isSuccess && res.data) {
        setQuestions(res.data.items);
        setTotalCount(res.data.totalCount);
      } else if (!subRes.isSuccess) {
        notify.error(subRes.message || "Module not found");
      }
    } catch {
      notify.error("Failed to load module");
    } finally {
      setLoading(false);
    }
  }, [id, levelFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const categoryId = subCategory?.categoryId ?? questions[0]?.categoryId;
  const categoryName = questions[0]?.categoryName ?? "Topic";
  const moduleName = subCategory?.name ?? questions[0]?.subCategoryName ?? "Module";
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const displayTitle = (q: QuestionListItem) => (q.titleAr?.trim() ? q.titleAr : q.title);
  const isRtl = (q: QuestionListItem) => Boolean(q.titleAr?.trim());

  return (
    <div className="page-subcategory page-subcategory--with-pagination">
      <div className="page-subcategory__wrap">
        <Link
          href={categoryId ? `/category/${categoryId}` : "/"}
          className="page-subcategory__back"
        >
          <span className="page-subcategory__back-arrow">←</span> Back to {categoryName}
        </Link>

        <div className="page-subcategory__header">
          <div className="page-subcategory__label-row">
            <span className="page-subcategory__label-dot" />
            <span className="page-subcategory__label-text">Module</span>
          </div>
          <h1 className="page-subcategory__title">{moduleName}</h1>
          <p className="page-subcategory__desc">
            Questions and answers for this module. Filter by level or click a question to view the full solution.
          </p>

        <div className="page-subcategory__filter-bar">
          <span className="page-subcategory__level-label">Level Filter:</span>
          <div className="page-subcategory__level-chips">
            <Link
              href={`/subcategory/${id}`}
              className={`page-subcategory__level-chip ${levelFilter === null ? "page-subcategory__level-chip--active" : ""}`}
            >
              All Levels
            </Link>
            {QUESTION_LEVELS.map(({ value, label }) => {
              const val = QUESTION_LEVEL_VALUES[value];
              return (
                <Link
                  key={value}
                  href={`/subcategory/${id}?level=${val}`}
                  className={`page-subcategory__level-chip ${levelFilter === val ? "page-subcategory__level-chip--active" : ""}`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        </div>

        <div className="page-subcategory__list-outer">
          <div className="page-subcategory__list page-subcategory__list--scrollable">
            {loading ? (
              <div className="page-subcategory__loading">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {questions.map((q, idx) => (
                  <Link key={q.id} href={`/question/${q.id}`} className="page-subcategory__question-card">
                    <div className="page-subcategory__question-inner">
                      <div className="page-subcategory__question-left">
                        <span className="page-subcategory__question-num">
                          {String((page - 1) * PAGE_SIZE + idx + 1).padStart(2, "0")}
                        </span>
                        <h3 className="page-subcategory__question-title" dir={isRtl(q) ? "rtl" : "ltr"}>
                          {displayTitle(q)}
                        </h3>
                        {q.level != null && (
                          <span className="page-subcategory__question-level">{getQuestionLevelLabel(q.level)}</span>
                        )}
                      </div>
                      <div className="page-subcategory__question-right">
                        <span className="page-subcategory__question-view">View</span>
                        <ArrowRight size={16} style={{ color: "var(--accent)" }} />
                      </div>
                    </div>
                  </Link>
                ))}
                {!loading && questions.length === 0 && (
                  <div className="page-subcategory__empty">
                    <p>No questions in this module{levelFilter != null ? " for this level" : ""} yet.</p>
                    <p>Content may be added later.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {!loading && totalCount > PAGE_SIZE && (
            <div className="page-subcategory__pagination">
              <span className="page-subcategory__pagination-range">
                Displaying <strong>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)}</strong> of <strong>{totalCount}</strong> items
              </span>
              <div className="page-subcategory__pagination-btns">
                <Link
                  href={page <= 1 ? "#" : `/subcategory/${id}?page=${page - 1}${levelFilter !== null ? `&level=${levelFilter}` : ""}`}
                  className={`page-subcategory__pagination-btn ${page <= 1 ? "page-subcategory__pagination-btn--disabled" : ""}`}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </Link>
                <span className="page-subcategory__pagination-page">
                  {page} <span className="text-[var(--text-muted)] opacity-50 mx-1">/</span> {totalPages}
                </span>
                <Link
                  href={page >= totalPages ? "#" : `/subcategory/${id}?page=${page + 1}${levelFilter !== null ? `&level=${levelFilter}` : ""}`}
                  className={`page-subcategory__pagination-btn ${page >= totalPages ? "page-subcategory__pagination-btn--disabled" : ""}`}
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
};

export default SubCategoryQuestionsPage;
