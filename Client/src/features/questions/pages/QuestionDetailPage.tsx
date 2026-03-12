"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { questionService } from "@/services/questionService";
import { subCategoryService } from "@/services/subCategoryService";
import { Question } from "@/types/question";
import { SubCategory } from "@/types/category";
import { AnswerContent } from "@/components/shared/AnswerContent";
import { notify } from "@/lib/notify";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ChevronLeft, ChevronRight, Menu, X, BookOpen, Terminal, Layers, Home, ArrowLeft, FolderOpen } from "lucide-react";
import { getQuestionLevelLabel } from "@/constants/questionLevels";

type AnswerLang = "en" | "ar";

const QuestionDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [siblings, setSiblings] = useState<Question[]>([]);
  const [modules, setModules] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [answerLang, setAnswerLang] = useState<AnswerLang>("ar");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await questionService.getQuestionById(Number(id));
        if (response.isSuccess) {
          const currentQ = response.data;
          setQuestion(currentQ);
          const [siblingsRes, modulesRes] = await Promise.all([
            questionService.getQuestionsBySubCategory(currentQ.subCategoryId),
            subCategoryService.getSubCategoriesByCategoryId(currentQ.categoryId),
          ]);
          if (siblingsRes.isSuccess) setSiblings(siblingsRes.data);
          if (modulesRes.isSuccess) setModules(modulesRes.data);
        } else {
          notify.error(response.message);
        }
      } catch {
        notify.error("Failed to load question details");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id]);

  const currentIndex = siblings.findIndex((s) => String(s.id) === String(id));
  const nextQuestion = currentIndex !== -1 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;
  const prevQuestion = currentIndex !== -1 && currentIndex > 0 ? siblings[currentIndex - 1] : null;

  const navigateTo = (qid: string) => {
    router.push(`/question/${qid}`);
  };

  if (loading) {
    return (
      <div className="page-question" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }
  if (!question) return null;

  const hasEn = Boolean(question.answer?.trim());
  const hasAr = Boolean(question.answerAr?.trim());
  const hasBoth = hasEn && hasAr;
  const effectiveLang: AnswerLang = hasBoth ? answerLang : hasAr ? "ar" : "en";

  return (
    <div className="page-question">
      {isSidebarOpen && (
        <div className="page-question__overlay" onClick={() => setIsSidebarOpen(false)} aria-hidden />
      )}

      <aside
        className={`page-question__sidebar ${isSidebarOpen ? "page-question__sidebar--open" : ""}`}
      >
        <div className="page-question__sidebar-header">
          <div>
            <h2 className="page-question__sidebar-title">Interactive Index</h2>
            <h3 className="page-question__sidebar-subtitle">{question.subCategoryName}</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="page-question__sidebar-close"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="page-question__sidebar-list no-scrollbar">
          {siblings.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                navigateTo(String(s.id));
                if (typeof window !== "undefined" && window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`page-question__sidebar-item ${id === s.id ? "page-question__sidebar-item--active" : ""}`}
            >
              <span className="page-question__sidebar-item-num">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="page-question__sidebar-item-title" dir={effectiveLang === "ar" && s.titleAr?.trim() ? "rtl" : "ltr"}>
                {effectiveLang === "ar" && s.titleAr?.trim() ? s.titleAr : s.title}
              </span>
            </button>
          ))}
          {siblings.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
              <p style={{ color: "var(--muted-text)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                No siblings found
              </p>
            </div>
          )}
        </div>

        <div className="page-question__sidebar-footer">
          <Link href={`/subcategory/${question.subCategoryId}`} className="page-question__sidebar-back">
            <span className="page-question__sidebar-back-icon">
              <ArrowLeft size={14} />
            </span>
            Back to module
          </Link>
          <Link href="/" className="page-question__sidebar-home">
            <span className="page-question__sidebar-home-icon">
              <Home size={14} />
            </span>
            Home
          </Link>
        </div>
      </aside>

      <main className="page-question__main">
        <div className="page-question__bg-orb page-question__bg-orb--1" aria-hidden />
        <div className="page-question__bg-orb page-question__bg-orb--2" aria-hidden />

        <div className="page-question__mobile-bar">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="page-question__mobile-menu-btn"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="page-question__mobile-step">
            <span className="page-question__mobile-step-label">Curated Step</span>
            <span className="page-question__mobile-step-value">
              {currentIndex + 1} / {siblings.length}
            </span>
          </div>
        </div>

        <div className="page-question__content">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`page-question__toggle-btn ${isSidebarOpen ? "page-question__toggle-btn--open" : ""}`}
            aria-label={isSidebarOpen ? "Close index" : "Open index"}
          >
            {isSidebarOpen ? <X size={28} /> : <Layers size={28} />}
          </button>

          <div className="page-question__reading">
            <article className="page-question__article">
              <div className="page-question__article-header">
                <div className="page-question__article-icon-wrap">
                  <Terminal size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="page-question__article-label-group">
                    <span className="page-question__article-label">Technical Challenge</span>
                    <div className="page-question__article-label-dot" />
                  </div>
                  {effectiveLang === "ar" && question.titleAr?.trim() ? (
                    <h1 className="page-question__article-title page-question__article-title--rtl" dir="rtl">
                      {question.titleAr}
                    </h1>
                  ) : (
                    <h1 className="page-question__article-title">{question.title}</h1>
                  )}
                </div>
              </div>
              <div className="page-question__badges">
                <span className="page-question__badge">
                   <FolderOpen size={12} />
                   {question.categoryName}
                </span>
                <span className="page-question__badge page-question__badge--accent">
                   <Layers size={12} />
                   {question.subCategoryName}
                </span>
                {question.level != null && (
                  <span className="page-question__badge">
                    {getQuestionLevelLabel(question.level)}
                  </span>
                )}
              </div>
            </article>

            <section className="page-question__answer-section">
              {(hasEn || hasAr) ? (
                <div className="page-question__answer-card">
                  <div className="page-question__answer-header">
                    <div className="page-question__answer-icon">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h2 className="page-question__answer-heading">Answer</h2>
                      <p className="page-question__answer-sub">
                        {hasBoth ? "Model answer and explanation" : hasAr ? "الإجابة والشرح" : "Model answer and explanation"}
                      </p>
                    </div>
                  </div>
                  {hasBoth && (
                    <div className="page-question__answer-tabs" role="tablist" aria-label="Answer language">
                      {[
                        { value: "ar" as const, label: "العربية", panelId: "answer-panel-ar", tabId: "answer-tab-ar" },
                        { value: "en" as const, label: "English", panelId: "answer-panel-en", tabId: "answer-tab-en" },
                      ].map((tab) => (
                        <button
                          key={tab.value}
                          type="button"
                          role="tab"
                          aria-selected={effectiveLang === tab.value}
                          aria-controls={tab.panelId}
                          id={tab.tabId}
                          className={`page-question__answer-tab ${effectiveLang === tab.value ? "page-question__answer-tab--active" : ""}`}
                          onClick={() => setAnswerLang(tab.value)}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="page-question__answer-body custom-scrollbar">
                    {hasAr && (
                      <div
                        id="answer-panel-ar"
                        role="tabpanel"
                        aria-labelledby="answer-tab-ar"
                        dir="rtl"
                        className={`page-question__answer-tab-panel ${effectiveLang === "ar" ? "page-question__answer-tab-panel--active" : ""}`}
                      >
                        <AnswerContent content={question.answerAr!} lang="ar" />
                      </div>
                    )}
                    {hasEn && (
                      <div
                        id="answer-panel-en"
                        role="tabpanel"
                        aria-labelledby="answer-tab-en"
                        dir="ltr"
                        className={`page-question__answer-tab-panel ${effectiveLang === "en" ? "page-question__answer-tab-panel--active" : ""}`}
                      >
                        <AnswerContent content={question.answer!} lang="en" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="page-question__answer-card">
                  <div className="page-question__answer-header">
                    <div className="page-question__answer-icon">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h2 className="page-question__answer-heading">Answer</h2>
                      <p className="page-question__answer-sub">Model answer and explanation</p>
                    </div>
                  </div>
                  <div className="page-question__answer-body custom-scrollbar">
                    <p className="answer-content__placeholder">No answer has been added yet.</p>
                  </div>
                </div>
              )}
            </section>

            {/* Inline question navigation – compact, part of reading flow */}
            {siblings.length > 0 && (
              <nav className="page-question__nav-wrap" aria-label="Question navigation">
                <div className="page-question__nav-inner">
                  <button
                    type="button"
                    disabled={!prevQuestion}
                    onClick={() => prevQuestion && navigateTo(String(prevQuestion.id))}
                    className="page-question__nav-btn"
                    aria-label="Previous question"
                  >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                  </button>
                  <span className="page-question__nav-label">
                    <span className="page-question__nav-current">{currentIndex + 1}</span>
                    <span className="page-question__nav-sep">/</span>
                    <span className="page-question__nav-total">{siblings.length}</span>
                  </span>
                  <button
                    type="button"
                    disabled={!nextQuestion}
                    onClick={() => nextQuestion && navigateTo(String(nextQuestion.id))}
                    className="page-question__nav-btn"
                    aria-label="Next question"
                  >
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </nav>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionDetailPage;
