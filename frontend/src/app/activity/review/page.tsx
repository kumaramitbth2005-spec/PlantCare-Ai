"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Star,
    Send,
    Info,
    CheckCircle2
} from "lucide-react";
import { useNotifications } from "../../../lib/NotificationContext";
import { cn } from "@/lib/utils";

export default function ReviewPage() {
    const { addNotification } = useNotifications();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            addNotification({
                title: "Rating Required",
                description: "Please select a neural satisfaction level before submitting.",
                type: 'alert'
            });
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setSubmitted(true);
        addNotification({
            title: "Review Transmitted",
            description: "Your feedback has been integrated into our collective intelligence.",
            type: 'info'
        });
    };

    if (submitted) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card p-12 bg-card border border-border rounded-[3rem] space-y-8"
                >
                    <div className="w-24 h-24 bg-green-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-4xl font-black text-foreground tracking-tighter">Transmission Successful</h2>
                    <p className="text-slate-600 dark:text-slate-400 font-bold text-lg max-w-md mx-auto leading-relaxed">
                        Thank you for your review. Your insights help us refine the PlantCare AI systems for all researchers.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="px-10 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-border rounded-2xl text-xs font-black text-foreground uppercase tracking-widest transition-all"
                    >
                        Submit Another Review
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 pb-32">
            <header className="mb-12">
                <h1 className="text-5xl font-black text-foreground tracking-tighter mb-4">
                    User <span className="text-pink-500 italic">Experience</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-lg max-w-2xl">
                    How is your experience with the PlantCare AI platform? Share your thoughts to help us evolve.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Rating Section */}
                <div className="glass-card p-10 bg-card border border-border rounded-[3rem] space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Satisfactory Level</label>
                        <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="p-1 focus:outline-none transition-transform hover:scale-125 active:scale-95"
                                >
                                    <Star
                                        className={cn(
                                            "w-10 h-10 transition-all duration-300",
                                            (hover || rating) >= star
                                                ? "text-pink-500 fill-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                                                : "text-slate-300 dark:text-slate-700"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feedback Area */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Detailed Transmission</label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Describe your journey, challenges, or appreciation..."
                            className={cn(
                                "w-full h-48 bg-input border border-border rounded-[2rem]",
                                "p-8 text-foreground font-bold text-base outline-none focus:ring-4",
                                "focus:ring-pink-500/10 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-700"
                            )}
                        />
                    </div>
                </div>

                {/* Guidance Section */}
                <div className={cn(
                    "glass-card p-10 bg-gradient-to-br from-indigo-500/5 to-pink-500/5",
                    "border border-border rounded-[3rem] flex flex-col md:flex-row gap-8 items-start"
                )}>
                    <div className="p-4 bg-indigo-500/10 rounded-2xl">
                        <Info className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xl font-black text-foreground italic">Not sure what to post?</h4>
                        <p className="text-slate-600 dark:text-slate-500 font-bold text-sm leading-relaxed">
                            Think about our <span className="text-foreground font-black">AI Accuracy</span> in identifying pathogens, the <span className="text-foreground font-black">UI Design</span> smoothness, or the <span className="text-foreground font-black">Performance</span> of our neural grid. Every detail helps!
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {["AI Precision", "Interface Polish", "Operation Speed", "Sync Features"].map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setFeedback(prev => prev + (prev ? " " : "") + tag)}
                                    className={cn(
                                        "px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10",
                                        "border border-border rounded-xl text-[10px] font-black text-foreground",
                                        "uppercase tracking-widest transition-all"
                                    )}
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="flex justify-center pt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                            "w-full max-w-md py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em]",
                            "flex items-center justify-center gap-4 transition-all active:scale-95",
                            "shadow-2xl overflow-hidden relative group",
                            isSubmitting
                                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-pink-500/30 hover:shadow-pink-500/50"
                        )}
                    >
                        {isSubmitting ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                                <Zap className="w-5 h-5" />
                            </motion.div>
                        ) : (
                            <>
                                <Send className="w-5 h-5 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
                                Submit Pulse Review
                            </>
                        )}
                    </button>
                </div>
            </form>
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
