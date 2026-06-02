"use client";

import { motion } from "framer-motion";
import {
    Info,
    Database,
    Cpu,
    CheckCircle2,
    BarChart4,
    Sparkles,
    Sprout,
    TrendingUp,
    Calendar,
    Users,
    Bot,
    Leaf
} from "lucide-react";
import { cn } from "../../lib/utils";

const plantLibraryCards = [
    {
        step: "01",
        name: "Care Intelligence",
        desc: "Analyze plant care complexity and provide personalized maintenance guidance.",
        features: ["Care Level Indicator (Easy / Medium / Hard)", "Indoor vs Outdoor Compatibility", "Water & Sunlight Requirements"],
        icon: Sprout
    },
    {
        step: "02",
        name: "Growth Analytics",
        desc: "Monitor plant growth and health using AI-powered insights.",
        features: ["Plant Growth Analysis", "Health Score Tracking", "Growth Timeline"],
        icon: TrendingUp
    },
    {
        step: "03",
        name: "Maintenance Center",
        desc: "Manage all recurring plant care activities from one place.",
        features: ["Repotting Reminder", "Pruning Schedule", "Recommended Tools & Fertilizers"],
        icon: Calendar
    },
    {
        step: "04",
        name: "Community Hub",
        desc: "Connect with plant lovers and share experiences.",
        features: ["Plant Photo Sharing", "Community Discussions", "Expert Tips"],
        icon: Users
    },
    {
        step: "05",
        name: "AI Plant Assistant",
        desc: "Voice-powered AI assistant for instant plant support.",
        features: ["Voice Queries", "Disease Detection", "Personalized Care Recommendations"],
        icon: Bot
    }
];

export default function WorkspacePage() {
    return (
        <div className="max-w-7xl mx-auto space-y-12 px-4 sm:px-6 lg:px-8 pb-24">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-3 bg-gradient-to-br from-emerald-500 to-green-600",
                            "rounded-2xl shadow-xl shadow-emerald-500/20 shrink-0"
                        )}>
                            <Leaf className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter break-words">
                            Plant <span className="text-pink-500 italic">Library</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold ml-16 text-lg">
                        Your comprehensive hub for botanical intelligence and plant care.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Project Overview */}
                <div className="lg:col-span-8 space-y-10">
                    <div className={cn(
                        "glass-card p-10 bg-gradient-to-br from-slate-900 to-slate-800",
                        "text-white border-none shadow-[0_30px_60px_-15px_rgba(30,27,28,0.3)]",
                        "rounded-[3rem] relative overflow-hidden group"
                    )}>
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000 transform-gpu">
                            <Sparkles className="w-32 h-32" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black mb-6 flex items-center gap-3 tracking-tight break-words">
                            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 shrink-0">
                                <Info className="w-6 h-6 text-emerald-400" />
                            </div>
                            Library Overview
                        </h3>
                        <p className="text-slate-300 leading-relaxed font-bold text-sm sm:text-lg mb-10 max-w-2xl break-words whitespace-normal">
                            The Plant Library integrates AI-driven analytics, community insights, and personalized care schedules to ensure every plant thrives under optimal conditions.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-10 border-t border-white/10">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Species Indexed</p>
                                <p className="text-lg font-black text-white">10,000+</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Care Guides</p>
                                <p className="text-lg font-black text-white">Advanced</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">AI Precision</p>
                                <p className="text-lg font-black text-pink-400">99.2%</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 px-2 tracking-tight">
                            <Sprout className="w-6 h-6 text-emerald-500" />
                            🌿 Plant Library
                        </h3>
                        <div className="space-y-6">
                            {plantLibraryCards.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    key={item.step}
                                    className={cn(
                                        "glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6 sm:gap-8 bg-white/80",
                                        "dark:bg-slate-900 border-slate-100 dark:border-emerald-500/10",
                                        "shadow-xl rounded-[2.5rem] group hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all relative overflow-hidden transform-gpu will-change-transform"
                                    )}
                                >
                                    {/* Card Number Background Watermark */}
                                    <div className="absolute -right-4 -top-6 text-[120px] font-black text-slate-50 dark:text-slate-800/50 opacity-50 pointer-events-none select-none z-0 transition-transform group-hover:scale-110">
                                        {item.step}
                                    </div>
                                    
                                    <div className="relative z-10 p-5 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 shrink-0 shadow-inner group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    
                                    <div className="flex-1 relative z-10 w-full min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                            <h4 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors break-words whitespace-normal">{item.name}</h4>
                                            <div className={cn(
                                                "flex items-center justify-center gap-2 px-3 py-1.5 bg-pink-500 self-start sm:self-auto shrink-0",
                                                "text-white text-[9px] font-black rounded-xl",
                                                "uppercase tracking-widest shadow-lg shadow-pink-500/20"
                                            )}>
                                                <CheckCircle2 className="w-3 h-3" />
                                                Active
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold mb-6 break-words whitespace-normal">{item.desc}</p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {item.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-white/5 hover:border-emerald-500/20 transition-colors min-w-0">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-tight break-words whitespace-normal flex-1">
                                                        {feature}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )})}
                        </div>
                    </div>
                </div>

                {/* Sidebar Technical Stats */}
                <div className="lg:col-span-4 space-y-8">
                    <div className={cn(
                        "glass-card p-8 bg-white/80 dark:bg-slate-900",
                        "border-slate-100 dark:border-emerald-500/10 shadow-xl rounded-[2.5rem]"
                    )}>
                        <h3 className="text-xs font-black text-slate-900 dark:text-emerald-400 mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
                            <Database className="w-5 h-5" />
                            Botanical Database
                        </h3>
                        <div className="p-6 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-500/10 mb-6">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Global Index</p>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">Verified Plant Compendium</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-bold">Total Species</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">10,245</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-bold">Community Guides</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">45,120</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-bold">Data Fidelity</span>
                                <span className="text-sm font-black text-pink-500">Maximum</span>
                            </div>
                        </div>
                    </div>

                    <div className={cn(
                        "glass-card p-8 bg-gradient-to-br from-emerald-600 to-green-700",
                        "text-white border-none shadow-2xl shadow-emerald-500/30 rounded-[2.5rem]"
                    )}>
                        <h3 className="text-xs font-black mb-6 uppercase tracking-[0.2em] flex items-center gap-3">
                            <Cpu className="w-5 h-5 text-emerald-200" />
                            AI Ecosystem
                        </h3>
                        <div className="space-y-4">
                            {[
                                { l: "Vision Engine", v: "Pathology Scanner" },
                                { l: "NLP Core", v: "Bot Assistant" },
                                { l: "Analytics", v: "Growth Prediction" }
                            ].map(x => (
                                <div key={x.l} className="p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/15 transition-all">
                                    <p className="text-[9px] font-black text-emerald-200 uppercase tracking-widest mb-1">{x.l}</p>
                                    <p className="text-xs font-black tracking-tight">{x.v}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cn(
                        "glass-card p-8 bg-white/80 dark:bg-slate-900",
                        "border-slate-100 dark:border-pink-500/10 shadow-xl rounded-[2.5rem]"
                    )}>
                        <h3 className="text-xs font-black text-slate-900 dark:text-pink-400 mb-8 flex items-center gap-3 uppercase tracking-[0.2em]">
                            <BarChart4 className="w-5 h-5" />
                            Community Engagement
                        </h3>
                        <div className="space-y-8">
                            {[
                                { l: "Daily Active Users", v: "85%", c: "from-emerald-400 to-emerald-600" },
                                { l: "Care Success Rate", v: "94%", c: "from-pink-400 to-rose-500" },
                                { l: "Guided Plants", v: "91%", c: "from-emerald-500 to-green-500" }
                            ].map(x => (
                                <div key={x.l} className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black px-1">
                                        <span className="text-slate-400 uppercase tracking-widest">{x.l}</span>
                                        <span className="text-slate-800 dark:text-white">{x.v}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: x.v }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className={cn("h-full rounded-full bg-gradient-to-r shadow-lg", x.c)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
