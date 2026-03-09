"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { questionService } from "@/services/questionService";
import { Question } from "@/types/question";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ChevronLeft, ChevronRight, Menu, X, BookOpen, Terminal, Layers, Home } from "lucide-react";

const QuestionDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [siblings, setSiblings] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await questionService.getQuestionById(Number(id));
        if (response.isSuccess) {
          const currentQ = response.data;
          setQuestion(currentQ);
          const siblingsRes = await questionService.getQuestionsBySubCategory(currentQ.subCategoryId);
          if (siblingsRes.isSuccess) setSiblings(siblingsRes.data);
        } else {
          toast.error(response.message);
        }
      } catch {
        toast.error("Failed to load question details");
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

  const progressPercent = siblings.length ? ((currentIndex + 1) / siblings.length) * 100 : 0;

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
              <span className="page-question__sidebar-item-title">{s.title}</span>
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
          <Link href="/" className="page-question__sidebar-home">
            <span className="page-question__sidebar-home-icon">
              <Home size={14} />
            </span>
            Home Dashboard
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

          <article style={{ marginBottom: "4rem" }}>
            <div className="page-question__article-header">
              <div className="page-question__article-icon-wrap">
                <Terminal size={24} />
              </div>
              <div>
                <span className="page-question__article-label">Question</span>
                <h1 className="page-question__article-title">{question.title}</h1>
              </div>
            </div>
            <div className="page-question__badges">
              <span className="page-question__badge">{question.categoryName}</span>
              <span className="page-question__badge page-question__badge--accent">{question.subCategoryName}</span>
            </div>
          </article>

          <section>
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
              <div className="page-question__answer-body">
                {question.answer || "No answer has been added yet."}
              </div>
            </div>
          </section>
        </div>

        <div className="page-question__nav-bar">
          <div className="page-question__nav-inner">
            <button
              type="button"
              disabled={!prevQuestion}
              onClick={() => prevQuestion && navigateTo(String(prevQuestion.id))}
              className="page-question__nav-btn"
              aria-label="Previous question"
            >
              <ChevronLeft size={28} strokeWidth={3} />
            </button>
            <div className="page-question__nav-center">
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.25rem" }}>
                <span className="page-question__nav-current">{currentIndex + 1}</span>
                <span className="page-question__nav-total">/ {siblings.length}</span>
              </div>
              <div className="page-question__nav-progress-wrap">
                <div
                  className="page-question__nav-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              disabled={!nextQuestion}
              onClick={() => nextQuestion && navigateTo(String(nextQuestion.id))}
              className="page-question__nav-btn"
              aria-label="Next question"
            >
              <ChevronRight size={28} strokeWidth={3} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionDetailPage;
