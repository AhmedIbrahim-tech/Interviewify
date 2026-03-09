"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser } from '@/store/slices/authSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Code2, Users2, CheckCircle2, FolderOpen, Terminal, ShieldCheck, Home } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { RootState } from '@/store';

type PersistedRootState = RootState & { _persist?: { rehydrated?: boolean } };

const LoginPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const token = useAppSelector((state) => state.auth.token);
    const rehydrated = useAppSelector((state: PersistedRootState) => state._persist?.rehydrated === true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (rehydrated && token) {
            router.replace('/dashboard');
        }
    }, [rehydrated, token, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await dispatch(loginUser({ email, password })).unwrap();
            toast.success("Login successful!");
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err || "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen selection:bg-[var(--primary-light)] selection:text-[var(--primary)]">
            {/* Left - Branded Panel */}
            <div className="hidden lg:flex lg:w-[45%] relative bg-[var(--background)] overflow-hidden border-r border-[var(--border-color)]">
                {/* Visual Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[var(--primary)]/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--primary)]/10 rounded-full blur-[100px]" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
                </div>

                {/* Grid Pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                {/* Floating Decorative Icons */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[20%] right-[15%] text-[var(--primary)]/20 animate-bounce transition-all duration-3000">
                        <Terminal size={120} strokeWidth={0.5} />
                    </div>
                    <div className="absolute bottom-[15%] left-[10%] text-[var(--primary)]/20 animate-pulse">
                        <Code2 size={160} strokeWidth={0.5} />
                    </div>
                    <div className="absolute top-[50%] left-[20%] text-[var(--primary-text)]/5">
                        <ShieldCheck size={80} strokeWidth={0.5} />
                    </div>
                </div>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col justify-between p-16 h-full w-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 w-fit group">
                        <div className="h-11 w-11 rounded-2xl bg-[var(--primary)] flex items-center justify-center font-black text-white text-xl shadow-lg shadow-[var(--primary)]/30 group-hover:scale-110 transition-transform">
                            I
                        </div>
                        <span className="text-[var(--primary-text)] font-black text-[22px] tracking-tight">
                            Interview<span className="text-[var(--primary)]">ify</span>
                        </span>
                    </Link>

                    {/* Main Content Area */}
                    <div className="max-w-lg">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-color)] backdrop-blur-md text-[var(--primary)] text-[11px] font-black uppercase tracking-widest mb-8">
                            <Sparkles size={14} className="animate-sparkle" />
                            Elite Platform for .NET Engineers
                        </div>

                        <h2 className="text-[44px] font-black text-[var(--primary-text)] leading-[1.1] mb-6 tracking-tight">
                            Master Your Next <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--info)]">Technical Interview</span>
                        </h2>

                        <p className="text-[var(--muted-text)] text-[16px] leading-relaxed mb-12 font-medium">
                            Structured .NET Core interview prep. Browse categories, modules, and curated Q&A — or sign in to manage content and users.
                        </p>

                        {/* Feature Highlights with Icons */}
                        <div className="space-y-6">
                            {[
                                { icon: Code2, title: "Structured Q&A", desc: "Categories, modules, and step-by-step answers", color: "bg-[var(--info-light)] text-[var(--info)]" },
                                { icon: FolderOpen, title: "Browse by Topic", desc: "C#, ASP.NET Core, and distributed systems", color: "bg-[var(--primary-light)] text-[var(--primary)]" },
                                { icon: CheckCircle2, title: "Curated Content", desc: "Manage categories and questions from the dashboard", color: "bg-[var(--success-light)] text-[var(--success)]" }
                            ].map((feat, i) => (
                                <div key={i} className="flex items-start gap-4 group cursor-default">
                                    <div className={`p-2.5 rounded-xl ${feat.color} border border-[var(--border-color)] group-hover:scale-110 transition-transform`}>
                                        <feat.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-[var(--primary-text)] text-[15px] font-bold leading-none mb-1.5">{feat.title}</h4>
                                        <p className="text-[var(--muted-text)] text-xs font-medium">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-8">
                        <p className="text-[var(--muted-text)] text-[11px] font-black uppercase tracking-widest">
                            {siteConfig.copyrightPlatform}
                        </p>
                        <div className="flex gap-4">
                            <div className="h-1 w-8 rounded-full bg-[var(--primary)]"></div>
                            <div className="h-1 w-4 rounded-full bg-[var(--border-color)]"></div>
                            <div className="h-1 w-4 rounded-full bg-[var(--border-color)]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right - Login Form */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center px-6 lg:px-24 py-16 bg-[var(--background)] relative">
                {/* Theme toggle - top right */}
                <div className="absolute top-6 right-6 lg:top-8 lg:right-8">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-[440px]">
                    <div className="lg:hidden flex items-center gap-3 mb-12">
                        <div className="h-10 w-10 rounded-xl bg-[var(--primary)] flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-[var(--primary)]/20">
                            I
                        </div>
                        <span className="font-extrabold text-[var(--primary-text)] text-[20px] tracking-tight">{siteConfig.name}</span>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-[32px] font-black text-[var(--primary-text)] tracking-tight mb-3">Welcome Back</h1>
                        <p className="text-[15px] text-[var(--muted-text)] font-medium">
                            Enter your credentials to access the dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="block text-[13px] font-black text-[var(--primary-text)] uppercase tracking-wider px-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                                    <Mail size={18} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[var(--input)] border border-[var(--input-border)] rounded-2xl py-4 pl-12 pr-4 text-[14px] text-[var(--primary-text)] font-semibold placeholder:text-[var(--text-muted)] focus:ring-4 focus:ring-[var(--primary-light)] focus:border-[var(--primary)] outline-none transition-all shadow-sm group-hover:border-[var(--border-color)]"
                                    placeholder="admin@interviewify.local"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="block text-[13px] font-black text-[var(--primary-text)] uppercase tracking-wider">
                                    Password
                                </label>
                                <Link href="#" className="text-[12px] font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                                    <Lock size={18} strokeWidth={2.5} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[var(--input)] border border-[var(--input-border)] rounded-2xl py-4 pl-12 pr-14 text-[14px] text-[var(--primary-text)] font-semibold placeholder:text-[var(--text-muted)] focus:ring-4 focus:ring-[var(--primary-light)] focus:border-[var(--primary)] outline-none transition-all shadow-sm group-hover:border-[var(--border-color)]"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Options Section */}
                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className="h-5 w-5 bg-[var(--input)] border-2 border-[var(--input-border)] rounded-md peer-checked:bg-[var(--primary)] peer-checked:border-[var(--primary)] transition-all"></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-white scale-0 peer-checked:scale-100 transition-transform">
                                        <CheckCircle2 size={12} strokeWidth={3} />
                                    </div>
                                </div>
                                <span className="text-[13px] text-[var(--secondary-text)] font-bold group-hover:text-[var(--primary-text)] transition-colors select-none">Stay logged in</span>
                            </label>
                        </div>

                        {/* Submit Action */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group relative flex items-center justify-center gap-3 py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-2xl text-[15px] font-black transition-all shadow-xl shadow-[var(--shadow-md)] active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <span>Verifying Access...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Sign in</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Social Auth Divider */}
                    <div className="relative my-12 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[var(--border)]"></div>
                        </div>
                        <div className="relative inline-block px-4 bg-[var(--background-secondary)] text-[11px] font-black text-[var(--muted-text)] uppercase tracking-widest">
                            Authorized Access Only
                        </div>
                    </div>

                    <p className="text-center text-[12px] text-[var(--muted-text)] font-medium">
                        Don&apos;t have an account? Contact your admin for access.
                    </p>

                    <div className="mt-10 flex flex-col items-center gap-3">
                        <span className="text-[11px] font-semibold text-[var(--muted-text)] uppercase tracking-widest">or</span>
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[14px] font-bold text-[var(--primary-text)] bg-[var(--surface)] border border-[var(--border-color)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary-light)]/50 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)]/20 transition-colors">
                                <Home size={18} strokeWidth={2.5} />
                            </span>
                            <span>Back to site</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
