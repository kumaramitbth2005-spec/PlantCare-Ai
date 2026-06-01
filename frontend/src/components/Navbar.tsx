"use client";

import { Bell, Search, Trash2, Clock, X, Menu, Zap, User, LayoutDashboard, Scan, History, FolderKanban, LogOut, MessageSquare, HelpCircle, Settings, RefreshCw, Sparkles, Languages, Lock, Sliders, MapPin, AlarmClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useNotifications } from "@/lib/NotificationContext";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BASE_URL } from "@/lib/api";

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { t } = useLanguage();
    const { notifications, unreadCount, markAsRead, clearAll, addNotification } = useNotifications();
    const { user, logout } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);

    const getProfilePhotoUrl = (photoPath: string | undefined | null) => {
        if (!photoPath || photoPath === 'default.jpg') return null;
        if (photoPath.startsWith('http://') || photoPath.startsWith('https://') || photoPath.startsWith('data:')) {
            return photoPath;
        }
        return `${BASE_URL}${photoPath.startsWith('/') ? '' : '/'}${photoPath}`;
    };
    
    // --- Alarm Implementation ---
    const [isAlarmActive, setIsAlarmActive] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!user) return;
        if (isAlarmActive && user.ringtoneSettings?.alarmSoundEnabled !== false) {
            const audioPath = user.ringtoneSettings?.selectedAlarmRingtone || '/audio/alarm_1.mp3';
            if (!audioRef.current) {
                audioRef.current = new Audio(audioPath);
                audioRef.current.loop = true;
            }
            audioRef.current.play().catch(e => console.log('Alarm playback failed:', e));
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }
    }, [isAlarmActive, user]);
    
    useEffect(() => {
        if (!user || !user.plantReminders?.water?.enabled) return;

        const checkAlarm = () => {
            const now = new Date();
            const lastWateredStr = user.plantReminders?.water?.lastTransmission;
            if (!lastWateredStr) return;
            
            const lastWatered = new Date(lastWateredStr);
            const frequency = user.plantReminders?.water?.frequency ?? 2;
            const reminderTime = user.plantReminders?.water?.reminderTime || "09:00";
            
            // Calculate next watering date
            const nextWateringDate = new Date(lastWatered);
            nextWateringDate.setDate(lastWatered.getDate() + frequency);
            
            const [hours, minutes] = reminderTime.split(':').map(Number);
            nextWateringDate.setHours(hours, minutes, 0, 0);

            // If current time is past or equal to next watering date/time
            if (now >= nextWateringDate) {
                if (!isAlarmActive) {
                    setIsAlarmActive(true);
                    addNotification({
                        title: "Hydration Protocol Alert",
                        description: "The botanical matrix indicates your specimens require hydration immediately.",
                        type: 'update'
                    });
                }
            } else {
                setIsAlarmActive(false);
            }
        };

        const interval = setInterval(checkAlarm, 60000); // Check every minute
        checkAlarm(); // Initial check

        return () => clearInterval(interval);
    }, [user, isAlarmActive, addNotification]);
    
    // --- Search Implementation ---
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchDropdownRef = useRef<HTMLDivElement>(null);

    const searchIndex = [
        // Main Navigation
        { id: 'dashboard', title: t('sidebar.dashboard') || 'Home Overview', path: '/dashboard', icon: LayoutDashboard, desc: 'View your main activity and analytics' },
        { id: 'scanner', title: t('sidebar.scanner') || 'AI Diagnostics Scanner', path: '/scanner', icon: Scan, desc: 'Scan plants for diseases and get instant results' },
        { id: 'history', title: t('sidebar.history') || 'Mission Logs', path: '/history', icon: History, desc: 'View past diagnostic history and reports' },
        { id: 'workspace', title: t('sidebar.workspace') || 'Workspace', path: '/workspace', icon: FolderKanban, desc: 'Manage your active projects and tasks' },
        
        // Settings & Profile
        { id: 'profile', title: t('profile.personalProfile') || 'Personal Profile', path: '/profile', icon: User, desc: 'Manage your personal account details' },
        { id: 'language', title: t('profile.language') || 'Language Settings', path: '/profile?tab=language', icon: Languages, desc: 'Change the application language' },
        { id: 'privacy', title: t('profile.privacyGrid') || 'Privacy & Security', path: '/profile?tab=privacy', icon: Lock, desc: 'Manage your data privacy and security' },
        { id: 'theme', title: t('profile.theme') || 'Appearance & Theme', path: '/profile?tab=theme', icon: Sliders, desc: 'Customize the visual look of the app' },
        { id: 'addresses', title: t('profile.addresses') || 'Saved Locations', path: '/profile?tab=addresses', icon: MapPin, desc: 'Manage your saved addresses and farms' },
        { id: 'reminders', title: t('profile.reminders') || 'Notification Preferences', path: '/profile?tab=reminders', icon: Bell, desc: 'Configure when and how you are alerted' },
        { id: 'scannerSettings', title: t('profile.scannerSettings') || 'Scanner Configuration', path: '/profile?tab=scannerSettings', icon: Settings, desc: 'Adjust AI model and camera settings' },
        { id: 'aboutDeveloper', title: t('profile.aboutDeveloper') || 'About Developer', path: '/profile?tab=aboutDeveloper', icon: Sparkles, desc: 'Learn more about the creators' },

        // Activity
        { id: 'review', title: t('sidebar.review') || 'My Reviews', path: '/activity/review', icon: MessageSquare, desc: 'View your submitted feedback and ratings' },
        { id: 'qa', title: t('sidebar.qa') || 'Q&A Forum', path: '/activity/qa', icon: HelpCircle, desc: 'Ask questions and help the community' },

        // Quick Actions
        { id: 'update', title: 'Check for Updates', action: 'update', icon: RefreshCw, desc: 'Sync with the central matrix for the latest algorithms' },
        { id: 'logout', title: t('sidebar.logout') || 'Log out', action: 'logout', icon: LogOut, desc: 'Securely completely exit your current session' }
    ];

    const filteredSearch = searchIndex.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        function handleGlobalKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setShowNotifications(false);
                setIsSearchOpen(false);
            }
        }
        document.addEventListener("keydown", handleGlobalKeyDown);
        return () => document.removeEventListener("keydown", handleGlobalKeyDown);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node) &&
                searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    interface SearchItem {
        id: string;
        title: string;
        path?: string;
        action?: string;
        desc: string;
        icon: React.ElementType;
    }

    const handleSearchSelect = (item: SearchItem) => {
        setSearchQuery("");
        setIsSearchOpen(false);
        if (item.action === 'logout') {
            logout();
        } else if (item.action === 'update') {
            addNotification({
                title: t('notifications.newUpdate') || "Sync Protocol Initiated",
                description: t('notifications.updateDesc') || "Connecting to central matrix to download latest botanical algorithms.",
                type: 'update'
            });
        } else if (item.path) {
            router.push(item.path);
        }
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredSearch.length > 0) {
                handleSearchSelect(filteredSearch[0]);
            }
        }
    };
    // ----------------------------

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!user) return null;

    return (
        <header className={cn(
            "h-20 bg-background/80 backdrop-blur-xl",
            "fixed top-0 right-0 left-0 xl:left-72 z-50 px-4 sm:px-10 flex items-center justify-between transition-all duration-300",
            "shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
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
                    "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10",
                    "text-pink-500/60 group-focus-within:text-pink-400 transition-colors"
                )} />
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={t('navbar.search')}
                    className={cn(
                        "w-full bg-input border border-border rounded-2xl py-3 group-hover:bg-white/10 dark:group-hover:bg-white/5",
                        "pl-12 pr-6 text-sm font-bold text-foreground placeholder:text-slate-500",
                        "focus:ring-4 focus:ring-pink-500/10 focus:bg-white/10 dark:focus:bg-white/5",
                        "focus:border-pink-500/20 transition-all outline-none shadow-inner relative z-10"
                    )}
                />
                
                {/* Keyboard Shortcut Hint */}
                {!searchQuery && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10 pointer-events-none">
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
                )}

                {/* Search Dropdown */}
                <AnimatePresence>
                    {isSearchOpen && searchQuery.length > 0 && (
                        <motion.div
                            ref={searchDropdownRef}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            className="absolute top-14 left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                        >
                            <div className="max-h-[350px] overflow-y-auto p-2 space-y-1">
                                {filteredSearch.length > 0 ? (
                                    filteredSearch.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSearchSelect(item)}
                                                className="w-full text-left flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group/item focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800/50"
                                            >
                                                <div className="p-2.5 bg-pink-50 dark:bg-pink-500/10 rounded-xl text-pink-500 group-hover/item:bg-pink-100 dark:group-hover/item:bg-pink-500/20 transition-colors flex-shrink-0">
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="p-6 text-center">
                                        <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">No results found</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Try searching for &quot;Scanner&quot;, &quot;History&quot;, or &quot;Dashboard&quot;.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
                <div className="flex items-center gap-2">
                    {/* Alarm Clock */}
                    {user?.plantReminders?.water?.enabled && (
                        <div className="relative">
                            <button
                                className={cn(
                                    "p-3 rounded-2xl transition-all relative group",
                                    isAlarmActive 
                                        ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30 animate-pulse" 
                                        : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-pink-400"
                                )}
                                onClick={() => router.push('/profile?tab=reminders')}
                                title={isAlarmActive ? "Alarm Triggered: Hydration Required" : "Hydration Alarm Active"}
                            >
                                <AlarmClock className={cn("w-5 h-5", isAlarmActive && "animate-bounce")} />
                                {isAlarmActive && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                                    </span>
                                )}
                            </button>
                        </div>
                    )}

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
                                            "fixed inset-x-4 top-24 sm:absolute sm:inset-auto sm:top-full sm:right-0 sm:mt-4",
                                            "sm:w-[420px] bg-white dark:bg-slate-900 z-50",
                                            "border border-slate-200 dark:border-pink-500/10 rounded-[2.5rem] shadow-2xl overflow-hidden",
                                            "flex flex-col origin-top sm:origin-top-right"
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
                        {getProfilePhotoUrl(user.profilePhoto) ? (
                            <Image
                                src={getProfilePhotoUrl(user.profilePhoto)!}
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
