"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { categoryService } from "@/services/categoryService";
import { Category, SubCategory } from "@/types/category";
import { toast } from "react-toastify";
import Image from "next/image";
import { getCategoryImage } from "@/utils/imageHelpers";
import { questionService } from "@/services/questionService";
import { Question } from "@/types/question";
import { Sparkles, ArrowRight, BookOpen, Terminal, Layers } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const CategoryDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, quesRes] = await Promise.all([
          categoryService.getCategoryById(Number(id)),
          questionService.getQuestionsByCategory(Number(id)),
        ]);
        if (catRes.isSuccess) setCategory(catRes.data);
        if (quesRes.isSuccess) setQuestions(quesRes.data);
        if (!catRes.isSuccess) {
          toast.error(catRes.message);
          router.push("/");
        }
      } catch {
        toast.error("Failed to load category experience");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id, router]);

  const handleStartJourney = () => {
    if (questions.length > 0) {
      router.push(`/question/${questions[0].id}`);
    } else {
      toast.info("Questions are being prepared for this category.");
    }
  };

  if (loading) {
    return (
      <div className="page-category" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }
  if (!category) return null;

  return (
    <div className="page-category">
      <div className="page-category__wrap">
        <Link href="/" className="page-category__back">
          <span className="page-category__back-icon">←</span>
          Back to All Tracks
        </Link>

        <div className="page-category__hero-grid">
          <div className="page-category__hero-image-wrap">
            <Image
              src={getCategoryImage(category.name, undefined, Number(category.id))}
              alt={category.name}
              fill
              className="page-category__hero-image"
            />
            <div className="page-category__hero-overlay" />
            <div className="page-category__hero-badge-wrap">
              <div className="page-category__hero-badge-inner">
                <Sparkles size={24} />
              </div>
            </div>
          </div>

          <div>
            <div className="page-category__label-row">
              <span className="page-category__label-dot" />
              <span className="page-category__label-text">Learning Path</span>
            </div>
            <h1 className="page-category__title">{category.name}</h1>
            <p className="page-category__desc">
              {category.description ||
                "Master the core concepts and advanced techniques needed to excel in your technical interviews for this domain."}
            </p>
            <div className="page-category__actions">
              <button type="button" onClick={handleStartJourney} className="page-category__btn page-category__btn--primary">
                Start Journey <ArrowRight size={16} strokeWidth={3} />
              </button>
              <button type="button" className="page-category__btn page-category__btn--secondary">
                <BookOpen size={16} /> Library
              </button>
            </div>
          </div>
        </div>

        <div className="page-category__section">
          <div className="page-category__section-header">
            <div className="page-category__section-title-row">
              <div className="page-category__section-icon-wrap">
                <Layers size={20} />
              </div>
              <h2 className="page-category__section-heading">Modules</h2>
            </div>
            <span className="page-category__section-badge">
              {category.subCategories?.length || 0} modules
            </span>
          </div>
          <div className="page-category__modules-grid">
            {category.subCategories?.map((sub: SubCategory, idx: number) => (
              <Link key={sub.id} href={`/subcategory/${sub.id}`} className="page-category__module-card">
                <div>
                  <div className="page-category__module-num">
                    Module {String(idx + 1).padStart(2, "0")}
                  </div>
                  <h3 className="page-category__module-title">{sub.name}</h3>
                  <span className="page-category__module-cta">
                    Explore Module <ArrowRight size={12} strokeWidth={3} />
                  </span>
                </div>
                <div className="page-category__module-deco">
                  <Terminal size={120} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="page-category__section">
          <div className="page-category__section-header">
            <div className="page-category__section-title-row">
              <div className="page-category__section-icon-wrap page-category__section-icon-wrap--accent">
                <Terminal size={20} />
              </div>
              <h2 className="page-category__section-heading">Questions</h2>
            </div>
            <span className="page-category__section-badge page-category__section-badge--accent">
              {questions.length} questions
            </span>
          </div>
          <div className="page-category__questions-list">
            {questions.map((q, idx) => (
              <Link key={q.id} href={`/question/${q.id}`} className="page-category__question-card">
                <div className="page-category__question-inner">
                  <div className="page-category__question-left">
                    <div className="page-category__question-num">
                      <span className="page-category__question-num-label">Ques</span>
                      <span className="page-category__question-num-val">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="page-category__question-meta">
                      <span className="page-category__question-tag">{q.subCategoryName}</span>
                      <h3 className="page-category__question-heading">{q.title}</h3>
                    </div>
                  </div>
                  <div className="page-category__question-right">
                    <div className="page-category__question-hint">
                      <span className="page-category__question-hint-label">Expert Insights Available</span>
                      <span className="page-category__question-hint-sub">Mastery Check</span>
                    </div>
                    <div className="page-category__question-arrow">
                      <ArrowRight size={20} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {questions.length === 0 && (
              <div className="page-category__empty-questions">
                <p>Curating detailed challenges for this category.</p>
                <p>Check back shortly for premium content.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailsPage;
