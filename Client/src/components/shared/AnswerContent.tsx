"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

export type AnswerContentLang = "en" | "ar";

interface AnswerContentProps {
  /** Raw content (Markdown supported). */
  content: string;
  /** Language for direction and optional styling. */
  lang?: AnswerContentLang;
  /** Optional class for the wrapper. */
  className?: string;
  /** If true, use compact typography (e.g. in table expand). */
  compact?: boolean;
}

const emptyPlaceholder = "No answer yet.";

/** Map common markdown language tags to short labels for the code block header. */
const CODE_LANG_LABELS: Record<string, string> = {
  csharp: "C#",
  cs: "C#",
  javascript: "JavaScript",
  js: "JavaScript",
  typescript: "TypeScript",
  ts: "TypeScript",
  sql: "SQL",
  json: "JSON",
  html: "HTML",
  css: "CSS",
  bash: "Bash",
  shell: "Shell",
  xml: "XML",
};

function getCodeBlockLabel(className?: string | null): string {
  if (!className) return "Code";
  const match = className.match(/language-(\w+)/);
  if (!match) return "Code";
  const lang = match[1].toLowerCase();
  return CODE_LANG_LABELS[lang] ?? lang;
}

/**
 * Renders answer content as Markdown with clearly separated code blocks, headings, and paragraphs.
 * Code blocks get a distinct container, label, and strong visual separation from prose.
 */
export function AnswerContent({
  content,
  lang = "en",
  className = "",
  compact = false,
}: AnswerContentProps) {
  const text = (content ?? "").trim() || emptyPlaceholder;
  const isRtl = lang === "ar";
  const isPlaceholder = text === emptyPlaceholder;

  return (
    <div
      className={`answer-content ${compact ? "answer-content--compact" : ""} ${className}`}
      dir={isRtl ? "rtl" : "ltr"}
      data-lang={lang}
    >
      {isPlaceholder ? (
        <p className="answer-content__placeholder">{text}</p>
      ) : (
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="answer-content__p">{children}</p>
            ),
            h1: ({ children }) => (
              <h1 className="answer-content__h1">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="answer-content__h2">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="answer-content__h3">{children}</h3>
            ),
            ul: ({ children }) => (
              <ul className="answer-content__ul">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="answer-content__ol">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="answer-content__li">{children}</li>
            ),
            pre: ({ children }) => {
              let codeLabel = "Code";
              React.Children.forEach(children, (child) => {
                if (React.isValidElement(child)) {
                  const props = child.props as { className?: string };
                  if (props?.className) {
                    codeLabel = getCodeBlockLabel(props.className);
                  }
                }
              });
              return (
                <div className="answer-content__code-wrap" dir="ltr">
                  <span className="answer-content__code-label">{codeLabel}</span>
                  <pre className="answer-content__pre">{children}</pre>
                </div>
              );
            },
            code: ({ className: codeClassName, children, ...rest }) => {
              const isBlock = codeClassName?.includes("language-");
              if (isBlock) {
                return (
                  <code
                    className={`answer-content__code answer-content__code--block ${codeClassName ?? ""}`}
                    {...rest}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <code className="answer-content__code" {...rest}>
                  {children}
                </code>
              );
            },
          }}
        >
          {text}
        </ReactMarkdown>
      )}
    </div>
  );
}
