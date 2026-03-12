"use client";

import React, { useState } from "react";
import { X, FileQuestion, CheckCircle2 } from "lucide-react";
import { Question } from "@/types/question";
import { AnswerContent } from "@/components/shared/AnswerContent";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LevelBadge } from "@/components/shared/LevelBadge";

type AnswerLang = "en" | "ar";

const ANSWER_TABS: { value: AnswerLang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

type QuestionViewModalProps = {
  question: Question;
  onClose: () => void;
};

export function QuestionViewModal({ question, onClose }: QuestionViewModalProps) {
  const [answerLang, setAnswerLang] = useState<AnswerLang>("ar");

  const hasEn = Boolean(question.answer?.trim());
  const hasAr = Boolean(question.answerAr?.trim());
  const hasBoth = hasEn && hasAr;
  const effectiveLang: AnswerLang = hasBoth ? answerLang : hasAr ? "ar" : "en";
  const hasAnswer = hasEn || hasAr;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-[min(1200px,94vw)] h-[94vh] max-h-[94vh] bg-[var(--card)] rounded-[2rem] sm:rounded-[3rem] shadow-[var(--shadow-lg)] overflow-hidden animate-scale-in flex flex-col">
        {/* Fixed header */}
        <header className="flex-shrink-0 px-8 sm:px-12 pt-8 sm:pt-10 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-8 right-8 p-2.5 rounded-2xl text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-all z-10"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-[var(--primary-light)] text-[var(--primary)] shadow-sm flex-shrink-0">
              <FileQuestion size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-[var(--info-soft)] text-[var(--info)] text-[10px] font-black uppercase tracking-widest border border-[var(--info)]/20">
                  {question.categoryName}
                </span>
                <span className="px-3 py-1 rounded-full bg-[var(--surface-elevated)] text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest border border-[var(--border-color)]">
                  {question.subCategoryName}
                </span>
                {question.level != null && (
                  <LevelBadge level={question.level} size="sm" />
                )}
              </div>
              <h2 className="text-[24px] font-black tracking-tight text-[var(--text-primary)] leading-tight">
                {question.title}
              </h2>
              {question.titleAr?.trim() && (
                <p dir="rtl" className="text-[15px] font-semibold text-[var(--text-muted)] mt-2 leading-relaxed text-right">
                  {question.titleAr}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable answer only */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-8 sm:px-12">
          <section className="p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-color)]">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={14} className="text-[var(--primary)] flex-shrink-0" />
              <h4 className="text-[12px] font-black uppercase tracking-wider text-[var(--primary)]">
                Answer
              </h4>
            </div>
            {hasBoth && (
              <div className="flex gap-1 mb-4" role="tablist" aria-label="Answer language">
                {ANSWER_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={effectiveLang === tab.value}
                    onClick={() => setAnswerLang(tab.value)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                      effectiveLang === tab.value
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--text-muted)] hover:bg-[var(--bg-card)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
            {hasAnswer ? (
              <>
                {hasEn && effectiveLang === "en" && (
                  <AnswerContent content={question.answer!} lang="en" />
                )}
                {hasAr && effectiveLang === "ar" && (
                  <AnswerContent content={question.answerAr!} lang="ar" />
                )}
              </>
            ) : (
              <p className="text-[14px] text-[var(--text-muted)] italic">
                No answer yet.
              </p>
            )}
          </section>
        </div>

        {/* Fixed footer */}
        <footer className="flex-shrink-0 flex items-center justify-between px-8 sm:px-12 py-6 border-t border-[var(--border-light)] bg-[var(--card)]">
          <div className="flex items-center gap-4 text-[12px] text-[var(--text-muted)]">
            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
            <StatusBadge
              label={question.isActive ? "Published" : "Draft"}
              variant={question.isActive ? "success" : "warning"}
              size="sm"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-[var(--danger)] text-white text-[14px] font-semibold hover:bg-[var(--danger-hover)] transition-all"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
