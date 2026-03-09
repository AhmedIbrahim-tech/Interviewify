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

const actionButtonBase =
    "flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 cursor-pointer";

export default function NotFound() {
    const router = useRouter();
    const { image, title, message, actions, brand } = NOT_FOUND_CONFIG;

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--primary-text)] flex flex-col items-center justify-center px-6 text-center border-t border-[var(--border-color)]">
            {/* Ambient background orbs */}
            <div
                className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--primary)]/20 rounded-full blur-[100px]"
                aria-hidden
            />
            <div
                className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-[100px]"
                aria-hidden
            />

            <main className="relative z-10 max-w-2xl">
                {/* Illustration */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div
                            className="absolute inset-0 bg-[var(--primary)]/30 rounded-full blur-2xl animate-pulse"
                            aria-hidden
                        />
                        <Image
                            src={image.src}
                            alt={image.alt}
                            width={image.size}
                            height={image.size}
                            className="relative drop-shadow-[0_0_30px_var(--primary)]/30 animate-float rounded-2xl"
                            priority
                        />
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-6xl font-black tracking-tighter mb-4 flex items-center justify-center gap-4">
                    <span className="text-[var(--primary-text)]">{title.code}</span>
                    <span className="h-10 w-px bg-[var(--border-color)] hidden sm:block" />
                    <span className="text-[var(--primary)]">{title.label}</span>
                </h1>

                <p className="text-[var(--muted-text)] text-lg font-medium mb-12 max-w-md mx-auto leading-relaxed">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className={`${actionButtonBase} bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-[0_0_20px_var(--primary)]/30`}
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        {actions.back}
                    </button>
                    <Link
                        href={actions.homeHref}
                        className={`${actionButtonBase} bg-[var(--surface-elevated)] hover:bg-[var(--surface)] border border-[var(--border-color)] text-[var(--primary-text)]`}
                    >
                        <FiSearch className="w-4 h-4" />
                        {actions.home}
                    </Link>
                </div>
            </main>

            {/* Brand footer */}
            <footer className="mt-20 flex items-center gap-2 opacity-50">
                <div className="h-6 w-6 rounded-md bg-[var(--primary)] flex items-center justify-center text-[10px] font-bold text-white">
                    I
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{brand}</span>
            </footer>
        </div>
    );
}
