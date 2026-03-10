"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, KeyRound, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
    const { forgotPassword, resetPassword } = useAuth();
    const { t } = useLanguage();

    const [step, setStep] = useState(1); // 1: Contact, 2: OTP & New Password, 3: Success
    const [contact, setContact] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await forgotPassword(contact);
            setStep(2);
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await resetPassword(otp, newPassword);
            setStep(3);
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
                        <KeyRound className="w-10 h-10 text-white fill-white/10" />
                    </div>

                    <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
                        {t('auth.resetPassword')}
                    </h1>
                    <p className="text-slate-400 font-bold mb-10 text-sm">
                        {step === 1 ? "Enter your email or phone number to receive a secure OTP link." : step === 2 ? t('auth.otpSent') : t('auth.passwordResetSuccess')}
                    </p>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.form
                                key="step1"
                                initial={{
                                    opacity: 0,
                                    x: -20
                                }}
                                animate={{
                                    opacity: 1,
                                    x: 0
                                }}
                                exit={{
                                    opacity: 0,
                                    x: 20
                                }}
                                onSubmit={handleSendOtp}
                                className="space-y-6 text-left"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        Email or Phone Number
                                    </label>
                                    <div className="relative group">
                                        <Mail
                                            className={cn(
                                                "absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4",
                                                "text-slate-500 group-focus-within:text-pink-500 transition-colors"
                                            )}
                                        />
                                        <input
                                            type="text"
                                            required
                                            value={contact}
                                            onChange={(e) => setContact(e.target.value)}
                                            placeholder="researcher@plantcare.ai / 9876543210"
                                            className={cn(
                                                "w-full bg-white/5 border border-white/5 rounded-2xl py-4",
                                                "pl-14 pr-6 text-sm font-bold text-white placeholder:text-slate-600",
                                                "focus:ring-4 focus:ring-pink-500/10 outline-none transition-all",
                                                "focus:bg-white/10"
                                            )}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div
                                        className={cn(
                                            "p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl",
                                            "flex items-center gap-3 text-rose-500 text-xs font-bold"
                                        )}
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className={cn(
                                        "w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black py-4",
                                        "rounded-2xl shadow-xl shadow-pink-500/20 flex items-center justify-center gap-2",
                                        "group hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                    )}
                                >
                                    {loading ? "Processing..." : t('auth.sendOtp')}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.form
                                key="step2"
                                initial={{
                                    opacity: 0,
                                    x: -20
                                }}
                                animate={{
                                    opacity: 1,
                                    x: 0
                                }}
                                exit={{
                                    opacity: 0,
                                    x: 20
                                }}
                                onSubmit={handleResetPassword}
                                className="space-y-6 text-left"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        {t('auth.enterOtp')}
                                    </label>
                                    <div className="relative group">
                                        <ShieldCheck
                                            className={cn(
                                                "absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4",
                                                "text-slate-500 group-focus-within:text-pink-500 transition-colors"
                                            )}
                                        />
                                        <input
                                            type="text"
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="123456"
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
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        {t('auth.newPassword')}
                                    </label>
                                    <div className="relative group">
                                        <Lock
                                            className={cn(
                                                "absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4",
                                                "text-slate-500 group-focus-within:text-pink-500 transition-colors"
                                            )}
                                        />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
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
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-pink-500 transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div
                                        className={cn(
                                            "p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl",
                                            "flex items-center gap-3 text-rose-500 text-xs font-bold"
                                        )}
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className={cn(
                                        "w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black py-4",
                                        "rounded-2xl shadow-xl shadow-pink-500/20 flex items-center justify-center gap-2",
                                        "group hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                    )}
                                >
                                    {loading ? t('auth.resetting') : t('auth.resetPassword')}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.form>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{
                                    opacity: 0,
                                    scale: 0.95
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1
                                }}
                                className="space-y-8"
                            >
                                <div className="flex justify-center">
                                    <CheckCircle2 className="w-20 h-20 text-green-500" />
                                </div>
                                <h1 className="text-2xl font-black text-white">
                                    {t('auth.passwordResetSuccess')}
                                </h1>
                                <Link
                                    href="/login"
                                    className={cn(
                                        "block w-full bg-white/5 border border-white/10 text-white",
                                        "font-black py-4 rounded-2xl hover:bg-white/10 transition-all"
                                    )}
                                >
                                    {t('auth.backToLogin')}
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step !== 3 && (
                        <div className="mt-8">
                            <Link
                                href="/login"
                                className={cn(
                                    "text-sm font-bold text-slate-500 hover:text-pink-400 transition-colors"
                                )}
                            >
                                {t('auth.backToLogin')}
                            </Link>
                        </div>
                    )}

                </div>
            </motion.div>
        </div>
    );
}
