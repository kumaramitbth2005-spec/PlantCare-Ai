"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
    LayoutDashboard,
    Scan,
    History,
    FolderKanban,
    LogOut,
    Zap,
    Cpu,
    MessageSquare,
    HelpCircle,
    ChevronDown,
    Settings,
    RefreshCw,
    User,
    Sparkles,
    Languages,
    Lock,
    Sliders,
    MapPin,
    Bell,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/lib/NotificationContext";

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const { t } = useLanguage();
    const { user, logout } = useAuth();
    const { addNotification } = useNotifications();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const triggerUpdate = () => {
        addNotification({
            title: t('notifications.newUpdate') || "Sync Protocol Initiated",
            description: t('notifications.updateDesc') || "Connecting to central matrix to download latest botanical algorithms.",
            type: 'update'
        });
    };
    const [isActivityOpen, setIsActivityOpen] = useState(pathname.startsWith('/activity'));
    const [isSettingsOpen, setIsSettingsOpen] = useState(pathname === '/profile' || pathname.includes('aboutDeveloper'));

    if (!user) return null;

    const menuItems = [
        { icon: LayoutDashboard, label: t('sidebar.dashboard'), href: "/dashboard" },
        { icon: Scan, label: t('sidebar.scanner'), href: "/scanner" },
        { icon: History, label: t('sidebar.history'), href: "/history" },
        { icon: FolderKanban, label: t('sidebar.workspace'), href: "/workspace" },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] xl:hidden"
                    />
                )}
            </AnimatePresence>

            <aside className={cn(
                "fixed left-0 top-0 h-screen w-72 bg-white dark:bg-slate-900 xl:bg-card", // Solid background on mobile
                "text-foreground z-60 flex flex-col shadow-2xl",
                "transition-all duration-300 ease-in-out",
                "xl:translate-x-0", // Always show on desktop
                isOpen ? "translate-x-0" : "-translate-x-full" // Toggle on mobile
            )}>
                {/* Close Button - Mobile Only */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 xl:hidden z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Logo Area - STICKY at top */}
                <div className={cn(
                    "flex items-center gap-3 px-9 py-8 mobile-xs:py-10 xl:py-6", // Increased padding on mobile
                    "sticky top-0 z-10 bg-white dark:bg-slate-900 xl:bg-card"
                )}>
                    <div className={cn(
                        "bg-gradient-to-br from-pink-500 to-rose-600",
                        "p-2.5 rounded-2xl shadow-xl shadow-pink-500/20"
                    )}>
                        <Zap className="w-7 h-7 text-white fill-white/10" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tighter leading-none text-foreground">
                            PlantCare
                        </span>
                        <span className={cn(
                            "text-[10px] font-black tracking-[0.4em]",
                            "uppercase text-pink-400 mt-1"
                        )}>
                            AI Systems
                        </span>
                    </div>
                </div>

                {/* Navigation - SCROLLABLE */}
                <nav className="flex-1 space-y-3 px-6 overflow-y-auto scrollbar-hide pb-6">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-4 px-6 py-4 rounded-[1.25rem]",
                                    "transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-gradient-to-r from-pink-500/20 to-transparent text-pink-400 font-bold"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-pink-500 dark:hover:text-pink-300"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-nav-pill"
                                        className={cn(
                                            "absolute left-0 w-1.5 h-8 rounded-full",
                                            "bg-gradient-to-b from-pink-400 to-pink-600"
                                        )}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <item.icon className={cn(
                                    "w-6 h-6 transition-all duration-300",
                                    isActive
                                        ? "text-pink-400 scale-110"
                                        : "group-hover:scale-110 group-hover:text-pink-400 dark:group-hover:text-pink-200"
                                )} />
                                <span className="text-sm font-bold tracking-tight">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    {/* Settings Section */}
                    <div className="pt-3 space-y-3">
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={cn(
                                "w-full flex items-center justify-between px-6 py-4 rounded-[1.25rem]",
                                "transition-all duration-300 group relative overflow-hidden",
                                isSettingsOpen || pathname === '/profile'
                                    ? "bg-gradient-to-r from-pink-500/10 to-transparent text-pink-400 font-bold"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-pink-500 dark:hover:text-pink-300"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <Settings className={cn(
                                    "w-6 h-6 transition-all duration-300",
                                    isSettingsOpen || pathname === '/profile'
                                        ? "text-pink-400 scale-110"
                                        : "group-hover:scale-110 group-hover:text-pink-400 dark:group-hover:text-pink-200"
                                )} />
                                <span className="text-sm font-bold tracking-tight">
                                    {t('sidebar.settings') || 'Settings'}
                                </span>
                            </div>
                            <ChevronDown className={cn(
                                "w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-300",
                                isSettingsOpen ? "rotate-180 text-pink-500" : ""
                            )} />
                        </button>

                        <div className="overflow-hidden">
                            <motion.div
                                initial={false}
                                animate={{
                                    height: isSettingsOpen ? "auto" : 0,
                                    opacity: isSettingsOpen ? 1 : 0
                                }}
                                className="space-y-1.5"
                            >
                                {[
                                    { id: 'profile', icon: User, label: t('profile.personalProfile') },
                                    { id: 'language', icon: Languages, label: t('profile.language') },
                                    { id: 'privacy', icon: Lock, label: t('profile.privacyGrid') },
                                    { id: 'theme', icon: Sliders, label: t('profile.theme') },
                                    { id: 'addresses', icon: MapPin, label: t('profile.addresses') },
                                    { id: 'reminders', icon: Bell, label: t('profile.reminders') },
                                    { id: 'scannerSettings', icon: Settings, label: t('profile.scannerSettings') },
                                    { id: 'aboutDeveloper', icon: Sparkles, label: t('profile.aboutDeveloper') || 'About Developer' }
                                ].map((item) => {
                                    const tab = searchParams.get('tab');
                                    const subHref = item.id === 'profile' ? '/profile' : `/profile?tab=${item.id}`;
                                    const isItemActive = item.id === 'profile'
                                        ? pathname === '/profile' && !tab
                                        : pathname === '/profile' && tab === item.id;

                                    return (
                                        <Link
                                            key={item.id}
                                            href={subHref}
                                            onClick={onClose}
                                            className={cn(
                                                "flex items-center gap-3 px-5 py-2.5 rounded-xl mx-2",
                                                "transition-all duration-300 group relative",
                                                isItemActive
                                                    ? "text-pink-400 font-bold bg-pink-500/5 shadow-sm"
                                                    : "text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "w-4 h-4 transition-all",
                                                isItemActive ? "text-pink-400" : "text-slate-400 group-hover:text-pink-400"
                                            )} />
                                            <span className="text-[11px] font-bold tracking-tight uppercase">
                                                {item.label}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </motion.div>
                        </div>
                    </div>

                    {/* My Activity Section */}
                    <div className="pt-6 mt-6 space-y-3">
                        <button
                            onClick={() => setIsActivityOpen(!isActivityOpen)}
                            className="w-full flex items-center justify-between px-6 py-2 group"
                        >
                            <span className={cn(
                                "text-xs font-black uppercase tracking-[0.2em]",
                                "text-slate-500 dark:text-slate-400 group-hover:text-pink-400 transition-colors"
                            )}>
                                {t('sidebar.myActivity')}
                            </span>
                            <ChevronDown className={cn(
                                "w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-300",
                                isActivityOpen ? "rotate-180 text-pink-500" : ""
                            )} />
                        </button>

                        <div className="overflow-hidden">
                            <motion.div
                                initial={false}
                                animate={{
                                    height: isActivityOpen ? "auto" : 0,
                                    opacity: isActivityOpen ? 1 : 0
                                }}
                                className="space-y-3"
                            >
                                {[
                                    { icon: MessageSquare, label: t('sidebar.review'), href: "/activity/review" },
                                    { icon: HelpCircle, label: t('sidebar.qa'), href: "/activity/qa" },
                                ].map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={onClose}
                                            className={cn(
                                                "flex items-center gap-4 px-6 py-3.5 rounded-2xl",
                                                "transition-all duration-300 group relative",
                                                isActive
                                                    ? "text-pink-400 font-bold bg-pink-500/5"
                                                    : "text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "w-5 h-5 transition-all",
                                                isActive ? "text-pink-400" : "group-hover:text-pink-400 dark:group-hover:text-pink-200"
                                            )} />
                                            <span className="text-xs font-bold tracking-tight">
                                                {item.label}
                                            </span>
                                        </Link>
                                    );
                                })}

                                {/* Neural Engine - inside My Activity */}
                                <div className={cn(
                                    "bg-gradient-to-br from-pink-500/5 to-transparent p-5",
                                    "rounded-3xl border border-border mx-2 mt-3"
                                )}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Cpu className="w-4 h-4 text-pink-400" />
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            "text-slate-600 dark:text-slate-300"
                                        )}>
                                            Neural Engine
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "88%" }}
                                            className="h-full bg-pink-500"
                                        />
                                    </div>
                                    <p className={cn(
                                        "text-[9px] mt-2 font-bold",
                                        "text-slate-500 dark:text-slate-500",
                                        "uppercase tracking-tighter text-right"
                                    )}>
                                        88% Load
                                    </p>
                                </div>

                                {/* Check for Updates - inside My Activity */}
                                <button
                                    onClick={() => {
                                        triggerUpdate();
                                        onClose?.();
                                    }}
                                    className={cn(
                                        "flex items-center gap-4 w-full px-6 py-4",
                                        "text-slate-600 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-slate-100 dark:hover:bg-white/5",
                                        "rounded-2xl transition-all duration-300 group"
                                    )}
                                >
                                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                    <span className="text-sm font-bold">
                                        Check for Updates
                                    </span>
                                </button>

                                {/* Terminate Session - inside My Activity */}
                                <button
                                    onClick={() => {
                                        logout();
                                        onClose?.();
                                    }}
                                    className={cn(
                                        "flex items-center gap-4 w-full px-6 py-4",
                                        "text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/5",
                                        "rounded-2xl transition-all duration-300 group"
                                    )}
                                >
                                    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    <span className="text-sm font-bold">
                                        {t('sidebar.logout')}
                                    </span>
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    );
}
