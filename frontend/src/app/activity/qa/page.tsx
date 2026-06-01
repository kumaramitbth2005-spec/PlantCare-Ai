"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    MessageSquare,
    ShieldCheck,
    Droplets,
    Leaf,
    Sprout,
    Send,
    CheckCircle2,
    Info
} from "lucide-react";
import { useNotifications } from "../../../lib/NotificationContext";
import { cn } from "@/lib/utils";

export default function QAPage() {
    const { addNotification } = useNotifications();
    const [query, setQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setSubmitted(true);
        addNotification({
            title: "Transmission Logged",
            description: "Your botanical query has been queued for neural processing.",
            type: 'info'
        });
    };

    const categories = [
        {
            title: "Daily Care",
            icon: Sprout,
            color: "text-green-500",
            bg: "bg-green-500/10",
            options: [
                "Essential light exposure levels",
                "Temperature tolerance parameters",
                "Pruning and maintenance protocols"
            ]
        },
        {
            title: "Hydration Logic",
            icon: Droplets,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            options: [
                "Optimal watering frequency",
                "Humidity control strategies",
                "Systemic drought mitigation"
            ]
        },
        {
            title: "Nutrient Infusion",
            icon: Leaf,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            options: [
                "Fertilizer dosage calculations",
                "Soil pH stabilization",
                "Micronutrient deficiency signs"
            ]
        }
    ];

    if (submitted) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card p-12 bg-card border border-border rounded-[3rem] space-y-8"
                >
                    <div className="w-24 h-24 bg-pink-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-12 h-12 text-pink-500" />
                    </div>
                    <h2 className="text-4xl font-black text-foreground tracking-tighter">Query Transmitted</h2>
                    <p className="text-slate-600 dark:text-slate-400 font-bold text-lg max-w-md mx-auto leading-relaxed">
                        Your custom logic query has been sent to the botanical expert network. Expect a neural reply within 2-4 planetary hours.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="px-10 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-border rounded-2xl text-xs font-black text-foreground uppercase tracking-widest transition-all"
                    >
                        New Consult
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 pb-32">
            <header className="mb-12">
                <h1 className="text-5xl font-black text-foreground tracking-tighter mb-4">
                    Botanical <span className="text-pink-500 italic">About Plant</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-lg max-w-2xl">
                    Interact with our neural experts for real-time diagnostics and plant care optimization.
                </p>
            </header>

            {/* Knowledge Nodes - Multi-Column Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {categories.map((cat, i) => (
                    <motion.div
                        key={cat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-8 bg-card border border-border rounded-[2.5rem] flex flex-col"
                    >
                        <div className={cn("inline-flex p-4 rounded-2xl w-fit mb-6", cat.bg)}>
                            <cat.icon className={cn("w-6 h-6", cat.color)} />
                        </div>
                        <h3 className="text-xl font-black text-foreground uppercase tracking-wider mb-6">{cat.title}</h3>
                        <div className="space-y-3 flex-1">
                            {cat.options.map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setQuery(prev => prev + (prev ? "\n" : "") + option)}
                                    className={cn(
                                        "w-full text-left p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10",
                                        "border border-border rounded-2xl text-xs font-bold",
                                        "text-slate-600 dark:text-slate-400 hover:text-foreground transition-all group"
                                    )}
                                >
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 text-pink-500">→</span>
                                    {option}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Custom Query Form */}
            <div className="glass-card bg-card border border-border rounded-[3rem] overflow-hidden">
                <div className="p-10 border-b border-border">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-pink-500 rounded-2xl shadow-lg shadow-pink-500/20">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">Ask me Here Any Query about Plant</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Direct Expert Transmission</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="relative">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Initialize your query... (e.g., How to stabilize pH for Monstera Deliciosa?)"
                                className={cn(
                                    "w-full h-48 bg-input border border-border rounded-[2rem]",
                                    "p-8 text-foreground font-bold text-base outline-none focus:ring-4",
                                    "focus:ring-pink-500/10 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-700"
                                )}
                            />
                            <div className="absolute bottom-6 right-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                Neural Link Active
                            </div>
                        </div>

                        <div className="flex justify-center flex-col items-center gap-6">
                            <button
                                type="submit"
                                disabled={isSubmitting || !query.trim()}
                                className={cn(
                                    "w-full max-w-md py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em]",
                                    "flex items-center justify-center gap-4 transition-all active:scale-95",
                                    "shadow-2xl overflow-hidden relative group",
                                    isSubmitting || !query.trim()
                                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-pink-500/30 hover:shadow-pink-500/50"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="animate-spin">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
                                        Summite
                                    </>
                                )}
                            </button>

                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" />
                                Responses are verified by senior field pathologists
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Info Hint */}
            <div className="mt-12 p-8 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] flex items-center gap-6">
                <div className="bg-blue-500/10 p-4 rounded-2xl">
                    <Info className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                    If you&apos;re unsure what to ask, select a <span className="text-foreground font-black">Knowledge Node</span> from the grid above to pre-fill your transmission parameters. Our AI interprets categorized data faster for priority processing.
                </p>
            </div>
        </div>
    );
}

function Zap({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
    );
}
