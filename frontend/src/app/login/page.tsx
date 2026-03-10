"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const { login } = useAuth();
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#060b16] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Animations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{
                    opacity: 0,
                    y: 20
                }}
                animate={{
                    opacity: 1,
                    y: 0
                }}
                className="w-full max-w-md relative z-10"
            >
                <div
                    className={cn(
                        "glass-card p-6 sm:p-10 bg-[#0a1120]/80 backdrop-blur-2xl",
                        "border border-white/5 shadow-2xl rounded-[2.5rem] sm:rounded-[3rem] text-center"
                    )}
                >
                    <div
                        className={cn(
                            "inline-flex p-4 bg-gradient-to-br from-pink-500 to-rose-600",
                            "rounded-3xl mb-8 shadow-xl shadow-pink-500/20"
                        )}
                    >
                        <Zap className="w-10 h-10 text-white fill-white/10" />
                    </div>

                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
                        PlantCare{" "}
                        <span className="text-pink-500">
                            AI
                        </span>
                    </h1>
                    <p className="text-slate-400 font-bold mb-10">
                        {t('auth.welcomeBack')}
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 text-left"
                    >
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                {t('auth.email')}
                            </label>
                            <div className="relative group">
                                <Mail
                                    className={cn(
                                        "absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4",
                                        "text-slate-500 group-focus-within:text-pink-500 transition-colors"
                                    )}
                                />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="researcher@plantcare.ai"
                                    className={cn(
                                        "w-full bg-white/5 border border-white/5 rounded-2xl py-4",
                                        "pl-14 pr-6 text-sm font-bold text-white placeholder:text-slate-600",
                                        "focus:ring-4 focus:ring-pink-500/10 outline-none transition-all",
                                        "focus:bg-white/10"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {t('auth.password')}
                                </label>
                                <Link
                                    href="/forgot-password"
                                    virtual-link="true"
                                    className={cn(
                                        "text-[10px] font-black text-pink-500 uppercase tracking-[0.2em]",
                                        "hover:text-pink-400 transition-colors bg-pink-500/5 px-2 py-1",
                                        "rounded-md border border-pink-500/10"
                                    )}
                                >
                                    {t('auth.forgotPassword')}
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock
                                    className={cn(
                                        "absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4",
                                        "text-slate-500 group-focus-within:text-pink-500 transition-colors"
                                    )}
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={cn(
                                        "w-full bg-white/5 border border-white/5 rounded-2xl py-4",
                                        "pl-14 pr-12 text-sm font-bold text-white placeholder:text-slate-600",
                                        "focus:ring-4 focus:ring-pink-500/10 outline-none transition-all",
                                        "focus:bg-white/10"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-pink-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    scale: 0.95
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1
                                }}
                                className={cn(
                                    "p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl",
                                    "flex items-center gap-3 text-rose-500 text-xs font-bold"
                                )}
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className={cn(
                                "w-full bg-gradient-to-r from-pink-500 to-rose-600",
                                "text-white font-black py-4 rounded-2xl shadow-xl",
                                "shadow-pink-500/20 flex items-center justify-center gap-2",
                                "group hover:scale-[1.02] active:scale-95 transition-all",
                                "disabled:opacity-50 disabled:scale-100"
                            )}
                        >
                            {loading ? t('auth.loggingIn') : (
                                <>
                                    {t('auth.login')}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 flex flex-col gap-4 items-center">
                        <Link
                            href="/register"
                            className="text-sm font-bold text-slate-500 hover:text-pink-400 transition-colors"
                        >
                            {t('auth.dontHaveAccount')}
                        </Link>

                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                            <ShieldCheck className="w-3 h-3 text-pink-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                Secure Neural Link Phase-II
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
