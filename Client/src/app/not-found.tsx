"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { siteConfig } from "@/config/site";

const NOT_FOUND_CONFIG = {
  image: { src: "/images/error400-cover.png", alt: "404 Not Found", size: 500 },
  title: { code: "404", label: "LOST" },
  message:
    "The page you're looking for has vanished into the binary void. Let's get you back on track.",
  actions: {
    back: "Back",
    home: "Go to home",
    homeHref: "/",
  },
  get brand() {
    return siteConfig.brandEngine;
  },
};

export default function NotFound() {
  const router = useRouter();
  const { image, title, message, actions, brand } = NOT_FOUND_CONFIG;

  return (
    <div className="page-not-found">
      <div className="page-not-found__orb-top" aria-hidden />
      <div className="page-not-found__orb-bottom" aria-hidden />

      <main className="page-not-found__main">
        <div className="page-not-found__image-wrap">
          <div className="page-not-found__image-glow" aria-hidden />
          <Image
            src={image.src}
            alt={image.alt}
            width={image.size}
            height={image.size}
            className="page-not-found__image animate-float"
            priority
          />
        </div>

        <h1 className="page-not-found__title">
          <span style={{ color: "var(--primary-text)" }}>{title.code}</span>
          <span className="page-not-found__title-divider" />
          <span style={{ color: "var(--primary)" }}>{title.label}</span>
        </h1>

        <p className="page-not-found__message">{message}</p>

        <div className="page-not-found__actions">
          <button
            type="button"
            onClick={() => router.back()}
            className="page-not-found__btn page-not-found__btn--primary"
          >
            <FiArrowLeft className="w-4 h-4" />
            {actions.back}
          </button>
          <Link
            href={actions.homeHref}
            className="page-not-found__btn page-not-found__btn--secondary"
          >
            <FiSearch className="w-4 h-4" />
            {actions.home}
          </Link>
        </div>
      </main>

      <footer className="page-not-found__footer">
        <div className="page-not-found__footer-icon">I</div>
        <span className="page-not-found__footer-brand">{brand}</span>
      </footer>
    </div>
  );
}
