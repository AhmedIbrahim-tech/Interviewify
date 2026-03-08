"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiSearch } from "react-icons/fi";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6 text-center ring-1 ring-white/5">
            {/* Decorative Blur Orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-900/10 rounded-full blur-[100px]" />

            <div className="relative z-10 max-w-2xl">
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-600/30 rounded-full blur-2xl animate-pulse" />
                        <Image
                            src="/images/404-illustration.png"
                            alt="404 Illustration"
                            width={500}
                            height={500}
                            className="relative drop-shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-float rounded-2xl"
                            priority
                        />
                    </div>
                </div>

                <h1 className="text-6xl font-black tracking-tighter mb-4 flex items-center justify-center gap-4">
                    <span className="text-white">404</span>
                    <span className="h-10 w-px bg-white/10 hidden sm:block" />
                    <span className="text-indigo-500">LOST</span>
                </h1>

                <p className="text-gray-400 text-lg font-medium mb-12 max-w-md mx-auto leading-relaxed">
                    The page you're looking for has vanished into the binary void. Let's get you back on track.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-sm font-black transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.3)] uppercase tracking-widest cursor-pointer"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <Link
                        href="/dashboard/questions"
                        className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-black transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest"
                    >
                        <FiSearch className="w-4 h-4" />
                        Explore Questions
                    </Link>
                </div>
            </div>

            {/* Footer watermark */}
            <div className="mt-20 flex items-center gap-2 opacity-50">
                <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center text-[10px] font-bold">I</div>
                <span className="text-[10px] font-black uppercase tracking-widest">Interviewify Engine</span>
            </div>
        </div>
    );
}
