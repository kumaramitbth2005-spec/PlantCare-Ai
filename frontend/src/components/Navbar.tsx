"use client";

import { Bell, Search, Trash2, Clock, X, Menu, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useNotifications } from "@/lib/NotificationContext";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import Image from "next/image";

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { t } = useLanguage();
    const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
    const { user } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setShowNotifications(false);
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!user) return null;

    return (
        <header className={cn(
            "h-20 bg-background/80 backdrop-blur-xl border-b border-border",
            "sticky top-0 z-50 px-4 sm:px-10 flex items-center justify-between transition-colors duration-300"
        )}>
            {/* Mobile Menu & Logo */}
            <div className="flex items-center gap-4 xl:hidden">
                <button
                    onClick={onMenuClick}
                    className="p-3 bg-card border border-border rounded-2xl text-slate-600 dark:text-slate-400"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white fill-white/10" />
                    </div>
                    <span className="text-lg font-black tracking-tighter text-foreground whitespace-nowrap hidden mobile-xs:block">
                        PlantCare
                    </span>
                </div>
            </div>

            {/* Search Bar - hidden on very small screens */}
            <div className="relative w-full max-w-[450px] group hidden md:block">
                <Search className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4",
                    "text-pink-500/60 group-focus-within:text-pink-400 transition-colors"
                )} />
                <input
                    type="text"
                    placeholder={t('navbar.search')}
                    className={cn(
                        "w-full bg-input border border-border rounded-2xl py-3 group-hover:bg-white/10 dark:group-hover:bg-white/5",
                        "pl-12 pr-6 text-sm font-bold text-foreground placeholder:text-slate-500",
                        "focus:ring-4 focus:ring-pink-500/10 focus:bg-white/10 dark:focus:bg-white/5",
                        "focus:border-pink-500/20 transition-all outline-none shadow-inner"
                    )}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className={cn(
                        "px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10",
                        "text-[10px] text-slate-400 dark:text-slate-500 font-black"
                    )}>
                        ⌘
                    </span>
                    <span className={cn(
                        "px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10",
                        "text-[10px] text-slate-400 dark:text-slate-500 font-black"
                    )}>
                        K
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={cn(
                                "p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400",
                                "hover:text-pink-400 transition-all relative group"
                            )}
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className={cn(
                                    "absolute top-3 right-3 w-2 h-2 bg-pink-500",
                                    "rounded-full border-2 border-background animate-pulse"
                                )} />
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <>
                                    {/* Backdrop for closing on click outside */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowNotifications(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className={cn(
                                            "absolute top-full right-0 mt-4 w-[420px] max-w-[calc(100vw-2rem)]",
                                            "bg-white dark:bg-slate-900 z-50",
                                            "border border-slate-200 dark:border-pink-500/10 rounded-[2.5rem] shadow-2xl overflow-hidden",
                                            "flex flex-col origin-top-right"
                                        )}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-pink-500 to-rose-600" />
                                        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                                {t('notifications.title')}
                                            </h3>
                                            <div className="flex items-center gap-4">
                                                {notifications.length > 0 && (
                                                    <button
                                                        onClick={clearAll}
                                                        className={cn(
                                                            "text-[10px] font-black text-pink-500/60",
                                                            "hover:text-pink-500 uppercase tracking-widest",
                                                            "transition-colors flex items-center gap-1"
                                                        )}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Clear
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setShowNotifications(false)}
                                                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-pink-500 transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="max-h-[450px] overflow-y-auto custom-scrollbar pb-10">
                                            {notifications.length === 0 ? (
                                                <div className="p-10 text-center">
                                                    <p className="text-xs text-slate-500 font-bold">
                                                        {t('notifications.noNotifications')}
                                                    </p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        className={cn(
                                                            "p-5 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5",
                                                            "transition-colors cursor-pointer group relative",
                                                            !notif.read && "bg-pink-500/5 dark:bg-pink-500/10"
                                                        )}
                                                        onClick={() => markAsRead(notif.id)}
                                                    >
                                                        <div className="flex gap-4">
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                                                                notif.type === 'update'
                                                                    ? "bg-pink-500/10 text-pink-500"
                                                                    : "bg-blue-500/10 text-blue-500"
                                                            )}>
                                                                <Bell className="w-5 h-5" />
                                                            </div>
                                                            <div className="space-y-1.5 flex-1">
                                                                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                                                                    {notif.title}
                                                                </p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                                                    {notif.description}
                                                                </p>
                                                                <div className={cn(
                                                                    "flex items-center gap-1.5 text-[9px] text-slate-400",
                                                                    "font-black uppercase tracking-widest pt-2"
                                                                )}>
                                                                    <Clock className="w-3 h-3" />
                                                                    {formatTime(notif.time)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {!notif.read && (
                                                            <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                                                <div className="w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="h-10 w-[1px] bg-border mx-2 hidden sm:block" />

                <div className="flex items-center gap-4 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-foreground leading-none tracking-tight">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[10px] text-pink-500/60 font-black uppercase tracking-widest mt-1.5">
                            {user.accountType}
                        </p>
                    </div>
                    <Link
                        href="/profile"
                        className={cn(
                            "relative w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600",
                            "flex items-center justify-center text-white font-black text-sm",
                            "shadow-lg shadow-pink-500/20 ring-2 ring-white/10 group cursor-pointer",
                            "hover:scale-110 transition-transform uppercase overflow-hidden"
                        )}
                    >
                        {user.profilePhoto ? (
                            <Image
                                src={user.profilePhoto}
                                alt="Profile"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <>{user.firstName[0]}{user.lastName[0]}</>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}
