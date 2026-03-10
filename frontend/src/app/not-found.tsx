"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, Leaf } from "lucide-react";

export default function NotFound() {
    // Use stable particles to avoid purity errors with Math.random()
    const particles = [
        { id: 0, x: 20, y: 15, delay: 0, duration: 4 },
        { id: 1, x: 80, y: 45, delay: 1, duration: 6 },
        { id: 2, x: 40, y: 75, delay: 2, duration: 5 },
        { id: 3, x: 10, y: 35, delay: 3, duration: 7 },
        { id: 4, x: 90, y: 85, delay: 0.5, duration: 4.5 },
        { id: 5, x: 60, y: 10, delay: 1.5, duration: 5.5 },
    ];

    return (
        <div className="min-h-screen bg-[#060b16] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center z-10"
            >
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 10,
                        delay: 0.2
                    }}
                    className="relative mb-8"
                >
                    <h1 className="text-[150px] font-black text-white leading-none tracking-tighter opacity-10">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0],
                                y: [0, -10, 0]
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Leaf className="w-24 h-24 text-pink-500" />
                        </motion.div>
                    </div>
                </motion.div>

                <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
                    Lost in the <span className="text-pink-500 italic">Undergrowth?</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-md mx-auto mb-10 font-medium">
                    The specimen you&apos;re looking for seems to have vanished from our database.
                    Let&apos;s get you back to safety.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary flex items-center gap-2 group"
                        >
                            <Home className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                            Return Home
                        </motion.button>
                    </Link>
                    <Link href="/scanner">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest border border-slate-700 transition-all flex items-center gap-2"
                        >
                            <Search className="w-5 h-5" />
                            Run Analysis
                        </motion.button>
                    </Link>
                </div>
            </motion.div>

            {/* Micro-animations: Floating Particles */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute w-1 h-1 bg-pink-500/30 rounded-full"
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay
                    }}
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`
                    }}
                />
            ))}
        </div>
    );
}
