"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { questionService } from "@/services/questionService";
import { subCategoryService } from "@/services/subCategoryService";
import { Question } from "@/types/question";
import { SubCategory } from "@/types/category";
import { toast } from "react-toastify";
import { ArrowRight } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const SubCategoryQuestionsPage = () => {
  const { id } = useParams();
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const [subRes, quesRes] = await Promise.all([
          subCategoryService.getSubCategoryById(Number(id)),
          questionService.getQuestionsBySubCategory(Number(id)),
        ]);
        if (subRes.isSuccess) setSubCategory(subRes.data);
        if (quesRes.isSuccess) setQuestions(quesRes.data);
        if (!subRes.isSuccess) {
          toast.error(subRes.message || "Module not found");
        }
      } catch {
        toast.error("Failed to load module");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="page-subcategory" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }

  const categoryId = subCategory?.categoryId ?? questions[0]?.categoryId;
  const categoryName = questions[0]?.categoryName ?? "Topic";
  const moduleName = subCategory?.name ?? questions[0]?.subCategoryName ?? "Module";

  return (
    <div className="page-subcategory">
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
            Questions and answers for this module. Click a question to view the full solution.
          </p>
        </div>

        <div className="page-subcategory__list">
          {questions.map((q, idx) => (
            <Link key={q.id} href={`/question/${q.id}`} className="page-subcategory__question-card">
              <div className="page-subcategory__question-inner">
                <div className="page-subcategory__question-left">
                  <span className="page-subcategory__question-num">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="page-subcategory__question-title">{q.title}</h3>
                </div>
                <div className="page-subcategory__question-right">
                  <span className="page-subcategory__question-view">View</span>
                  <ArrowRight size={16} style={{ color: "var(--accent)" }} />
                </div>
              </div>
            </Link>
          ))}
          {questions.length === 0 && (
            <div className="page-subcategory__empty">
              <p>No questions in this module yet.</p>
              <p>Content may be added later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubCategoryQuestionsPage;
