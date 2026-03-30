"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle, Briefcase, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const { register } = useAuth();
    const { t } = useLanguage();
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [accountType, setAccountType] = useState("researcher");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await register({
                firstName,
                middleName,
                lastName,
                contactNumber,
                email,
                password,
                accountType
            });
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#060b16] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-600/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.95
                }}
                animate={{
                    opacity: 1,
                    scale: 1
                }}
                className="w-full max-w-2xl relative z-10"
            >
                <div
                    className={cn(
                        "glass-card p-6 sm:p-10 bg-[#0a1120]/80 backdrop-blur-2xl",
                        "border border-white/5 shadow-2xl rounded-[2.5rem] sm:rounded-[3rem]"
                    )}
                >
                    <div className="flex flex-col items-center text-center mb-10">
                        <div
                            className={cn(
                                "inline-flex p-4 bg-gradient-to-br from-pink-500 to-rose-600",
                                "rounded-3xl mb-6 shadow-xl shadow-pink-500/20"
                            )}
                        >
                            <Zap className="w-8 h-8 text-white fill-white/10" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                            {t('auth.createAccount')}
                        </h1>
                        <p className="text-slate-400 font-bold">
                            Join the global botanical research network.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <div className="space-y-2 col-span-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                {t('auth.firstName')}
                            </label>
                            <div className="relative group">
                                <User
                                    className={cn(
                                        "absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4",
                                        "text-slate-500 group-focus-within:text-pink-500 transition-colors"
                                    )}
                                />
                                <input
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="John"
                                    className={cn(
                                        "w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl py-4",
                                        "pl-14 pr-6 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600",
                                        "focus:ring-4 focus:ring-pink-500/20 outline-none transition-all",
                                        "focus:bg-slate-100 dark:focus:bg-white/10"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                {t('auth.middleName')} <span className="text-slate-400 normal-case tracking-normal text-[8px]">(Optional)</span>
                            </label>
                            <div className="relative group">
                                <User
                                    className={cn(
                                        "absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4",
                                        "text-slate-500 group-focus-within:text-pink-500 transition-colors"
                                    )}
                                />
                                <input
                                    type="text"
                                    value={middleName}
                                    onChange={(e) => setMiddleName(e.target.value)}
                                    placeholder="Quincy"
                                    className={cn(
                                        "w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl py-4",
                                        "pl-14 pr-6 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600",
                                        "focus:ring-4 focus:ring-pink-500/20 outline-none transition-all",
                                        "focus:bg-slate-100 dark:focus:bg-white/10"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                {t('auth.lastName')}
                            </label>
                            <div className="relative group">
                                <User
                                    className={cn(
                                        "absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4",
                                        "text-slate-500 group-focus-within:text-pink-500 transition-colors"
                                    )}
                                />
                                <input
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Doe"
                                    className={cn(
                                        "w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl py-4",
                                        "pl-14 pr-6 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600",
                                        "focus:ring-4 focus:ring-pink-500/20 outline-none transition-all",
                                        "focus:bg-slate-100 dark:focus:bg-white/10"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                {t('auth.contactNumber')}
                            </label>
                            <div className="relative group">
                                <ShieldCheck
                                    className={cn(
                                        "absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4",
                                        "text-slate-500 group-focus-within:text-pink-500 transition-colors"
                                    )}
                                />
                                <input
                                    type="tel"
                                    required
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className={cn(
                                        "w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl py-4",
                                        "pl-14 pr-6 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600",
                                        "focus:ring-4 focus:ring-pink-500/20 outline-none transition-all",
                                        "focus:bg-slate-100 dark:focus:bg-white/10"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-1">
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
                                    placeholder="john@research.ai"
                                    className={cn(
                                        "w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl py-4",
                                        "pl-14 pr-6 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600",
                                        "focus:ring-4 focus:ring-pink-500/20 outline-none transition-all",
                                        "focus:bg-slate-100 dark:focus:bg-white/10"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                {t('auth.password')}
                            </label>
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
                                        "w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl py-4",
                                        "pl-14 pr-12 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600",
                                        "focus:ring-4 focus:ring-pink-500/20 outline-none transition-all",
                                        "focus:bg-slate-100 dark:focus:bg-white/10"
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

                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                {t('auth.role') || "Research Role"}
                            </label>
                            <div className="relative group">
                                <Briefcase
                                    className={cn(
                                        "absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4",
                                        "text-slate-500 group-focus-within:text-pink-500 transition-colors"
                                    )}
                                />
                                <select
                                    value={accountType}
                                    onChange={(e) => setAccountType(e.target.value)}
                                    className={cn(
                                        "w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl py-4",
                                        "pl-14 pr-6 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all",
                                        "focus:ring-4 focus:ring-pink-500/20 focus:bg-slate-100 dark:focus:bg-white/10",
                                        "appearance-none cursor-pointer"
                                    )}
                                >
                                    <option
                                        value="researcher"
                                        className="bg-[#0a1120]"
                                    >
                                        {t('auth.roleResearcher')}
                                    </option>
                                    <option
                                        value="user"
                                        className="bg-[#0a1120]"
                                    >
                                        {t('auth.roleUser')}
                                    </option>
                                    <option
                                        value="admin"
                                        className="bg-[#0a1120]"
                                    >
                                        {t('auth.roleAdmin')}
                                    </option>
                                </select>
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
                                    "col-span-1 md:col-span-2 p-4 bg-rose-500/10",
                                    "border border-rose-500/20 rounded-2xl flex items-center",
                                    "gap-3 text-rose-500 text-xs font-bold"
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
                                "col-span-1 md:col-span-2 bg-gradient-to-r from-pink-500 to-rose-600",
                                "text-white font-black py-4 rounded-2xl shadow-xl",
                                "shadow-pink-500/20 flex items-center justify-center gap-2",
                                "group hover:scale-[1.01] active:scale-95 transition-all",
                                "disabled:opacity-50"
                            )}
                        >
                            {loading ? t('auth.registering') : (
                                <>
                                    {t('auth.signup')}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 flex flex-col gap-4 items-center">
                        <Link
                            href="/login"
                            className="text-sm font-bold text-slate-500 hover:text-pink-400 transition-colors"
                        >
                            {t('auth.alreadyHaveAccount')}
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
