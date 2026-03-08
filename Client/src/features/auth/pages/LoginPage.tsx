"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { loginUser } from '@/store/slices/authSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Code2, Users2, CheckCircle2, Trophy, Terminal, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
        <div className="flex min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
            {/* Left - Branded Panel */}
            <div className="hidden lg:flex lg:w-[45%] relative bg-[#050505] overflow-hidden border-r border-white/5">
                {/* Visual Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px]" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
                </div>

                {/* Grid Pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                {/* Floating Decorative Icons */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[20%] right-[15%] text-indigo-500/20 animate-bounce transition-all duration-3000">
                        <Terminal size={120} strokeWidth={0.5} />
                    </div>
                    <div className="absolute bottom-[15%] left-[10%] text-blue-500/20 animate-pulse">
                        <Code2 size={160} strokeWidth={0.5} />
                    </div>
                    <div className="absolute top-[50%] left-[20%] text-white/5">
                        <ShieldCheck size={80} strokeWidth={0.5} />
                    </div>
                </div>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col justify-between p-16 h-full w-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 w-fit group">
                        <div className="h-11 w-11 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
                            I
                        </div>
                        <span className="text-white font-black text-[22px] tracking-tight">
                            Interview<span className="text-indigo-500">ify</span>
                        </span>
                    </Link>

                    {/* Main Content Area */}
                    <div className="max-w-lg">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-indigo-400 text-[11px] font-black uppercase tracking-widest mb-8">
                            <Sparkles size={14} className="animate-sparkle" />
                            Elite Platform for .NET Engineers
                        </div>

                        <h2 className="text-[44px] font-black text-white leading-[1.1] mb-6 tracking-tight">
                            Master Your Next <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">Technical Interview</span>
                        </h2>

                        <p className="text-gray-400 text-[16px] leading-relaxed mb-12 font-medium">
                            Join a community of <span className="text-white font-bold">5,000+ engineers</span>. Get personalized roadmaps,
                            real-time code reviews, and land your dream role.
                        </p>

                        {/* Feature Highlights with Icons */}
                        <div className="space-y-6">
                            {[
                                { icon: Code2, title: "Expert Code Guidance", desc: "Step-by-step solutions for complex algorithms", color: "bg-blue-500/10 text-blue-400" },
                                { icon: Trophy, title: "Leaderboard Access", desc: "Compete with top-tier .NET specialists", color: "bg-indigo-500/10 text-indigo-400" },
                                { icon: CheckCircle2, title: "Verified Questions", desc: "Curated by FAANG senior architects", color: "bg-emerald-500/10 text-emerald-400" }
                            ].map((feat, i) => (
                                <div key={i} className="flex items-start gap-4 group cursor-default">
                                    <div className={`p-2.5 rounded-xl ${feat.color} border border-white/5 group-hover:scale-110 transition-transform`}>
                                        <feat.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-white text-[15px] font-bold leading-none mb-1.5">{feat.title}</h4>
                                        <p className="text-gray-500 text-xs font-medium">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-8">
                        <p className="text-gray-600 text-[11px] font-black uppercase tracking-widest">
                            © 2025 Interviewify Platform
                        </p>
                        <div className="flex gap-4">
                            <div className="h-1 w-8 rounded-full bg-indigo-600"></div>
                            <div className="h-1 w-4 rounded-full bg-white/10"></div>
                            <div className="h-1 w-4 rounded-full bg-white/10"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right - Login Form */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-center px-6 lg:px-24 py-16 bg-[#fafafa]">
                <div className="w-full max-w-[440px]">
                    {/* Brand Identifier (Mobile & Tablet) */}
                    <div className="lg:hidden flex items-center gap-3 mb-12">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-600/20">
                            I
                        </div>
                        <span className="font-extrabold text-[#050505] text-[20px] tracking-tight">Interviewify</span>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-[32px] font-black text-[#050505] tracking-tight mb-3">Welcome Back</h1>
                        <p className="text-[15px] text-gray-500 font-medium">
                            Enter your credentials to manage your expert dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="block text-[13px] font-black text-[#050505] uppercase tracking-wider px-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Mail size={18} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-[14px] text-[#050505] font-semibold placeholder:text-gray-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all shadow-sm group-hover:border-gray-300"
                                    placeholder="admin@interviewify.local"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="block text-[13px] font-black text-[#050505] uppercase tracking-wider">
                                    Password
                                </label>
                                <Link href="#" className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Lock size={18} strokeWidth={2.5} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-14 text-[14px] text-[#050505] font-semibold placeholder:text-gray-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all shadow-sm group-hover:border-gray-300"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-all"
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
                                    <div className="h-5 w-5 bg-white border-2 border-gray-200 rounded-md peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all"></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-white scale-0 peer-checked:scale-100 transition-transform">
                                        <CheckCircle2 size={12} strokeWidth={3} />
                                    </div>
                                </div>
                                <span className="text-[13px] text-gray-600 font-bold group-hover:text-[#050505] transition-colors select-none">Stay logged in</span>
                            </label>
                        </div>

                        {/* Submit Action */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group relative flex items-center justify-center gap-3 py-4 bg-[#050505] hover:bg-[#151515] text-white rounded-2xl text-[15px] font-black transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <span>Verifying Access...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Sign in to Dashboard</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Social Auth Divider */}
                    <div className="relative my-12 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative inline-block px-4 bg-[#fafafa] text-[11px] font-black text-gray-400 uppercase tracking-widest">
                            Authorized Access Only
                        </div>
                    </div>

                    <p className="text-center text-[12px] text-gray-400 font-medium">
                        Don't have an expert account? <Link href="#" className="text-indigo-600 font-bold hover:underline underline-offset-4">Learn about joining the team</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
