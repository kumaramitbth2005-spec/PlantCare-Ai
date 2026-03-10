"use client";

import { motion } from "framer-motion";
import {
    FolderKanban,
    Info,
    Database,
    Cpu,
    CheckCircle2,
    Layers,
    BarChart4,
    Sparkles
} from "lucide-react";
import { cn } from "../../lib/utils";

const pipelineSteps = [
    { step: "01", name: "Data Acquisition", desc: "Aggregated 87,035 high-fidelity leaf specimens across 38 specific pathology classes.", status: "completed" },
    { step: "02", name: "Bio-Normalization", desc: "Real-time image correction, 224x224 spectral mapping, and high-order data augmentation.", status: "completed" },
    { step: "03", name: "Neural Training", desc: "MobileNetV2 feature extraction with deep dense head optimization using Transfer Learning.", status: "completed" },
    { step: "04", name: "Stress Validation", desc: "Verified 98.4% diagnostic accuracy against bacterial, fungal, and viral infections in wild samples.", status: "completed" },
    { step: "05", name: "Global Deployment", desc: "Edge-optimized microservices using Node.js, Next.js 15, and Python-integrated AI kernels.", status: "completed" },
];

export default function WorkspacePage() {
    return (
        <div className="max-w-7xl mx-auto space-y-12 px-4 sm:px-8 pb-24">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-3 bg-gradient-to-br from-pink-500 to-rose-600",
                            "rounded-2xl shadow-xl shadow-pink-500/20"
                        )}>
                            <FolderKanban className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Intelligence <span className="text-pink-500 italic">Workspace</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold ml-16 text-lg">
                        Detailed technical schematics and development pipeline for the AI Neural Model.
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
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                            <Sparkles className="w-32 h-32" />
                        </div>
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3 tracking-tight">
                            <div className="p-2 bg-pink-500/10 rounded-xl">
                                <Info className="w-6 h-6 text-pink-400" />
                            </div>
                            Mission Protocol
                        </h3>
                        <p className="text-slate-300 leading-relaxed font-bold text-lg mb-10 max-w-2xl">
                            PlantCare AI represents the pinnacle of Agri-Tech intelligence. By utilizing Deep Neural Networks and Transfer Learning, we&apos;ve developed an engine capable of instantaneous pathology detection with research-grade precision.
                        </p>
                        <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/10">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Neural Core</p>
                                <p className="text-lg font-black text-white">MobileNet V2</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Diagnostic Scope</p>
                                <p className="text-lg font-black text-white">38 Classes</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Signal Latency</p>
                                <p className="text-lg font-black text-pink-400">&lt; 150ms</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 px-2 tracking-tight">
                            <Layers className="w-6 h-6 text-pink-500" />
                            Development Pipeline
                        </h3>
                        <div className="space-y-6">
                            {pipelineSteps.map((item, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    key={item.step}
                                    className={cn(
                                        "glass-card p-8 flex items-start gap-8 bg-white/80",
                                        "dark:bg-slate-900 border-slate-100 dark:border-pink-500/10",
                                        "shadow-xl rounded-[2.5rem] group hover:translate-x-2 transition-all"
                                    )}
                                >
                                    <div className="text-4xl font-black text-slate-100 dark:text-pink-900/20 group-hover:text-pink-500 transition-colors pt-2">
                                        {item.step}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">{item.name}</h4>
                                            <div className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 bg-pink-500",
                                                "text-white text-[9px] font-black rounded-xl",
                                                "uppercase tracking-widest shadow-lg shadow-pink-500/20"
                                            )}>
                                                <CheckCircle2 className="w-3 h-3" />
                                                Verified
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Technical Stats */}
                <div className="lg:col-span-4 space-y-8">
                    <div className={cn(
                        "glass-card p-8 bg-white/80 dark:bg-slate-900",
                        "border-slate-100 dark:border-pink-500/10 shadow-xl rounded-[2.5rem]"
                    )}>
                        <h3 className="text-xs font-black text-slate-900 dark:text-pink-400 mb-6 flex items-center gap-3 uppercase tracking-[0.2em]">
                            <Database className="w-5 h-5" />
                            Specimen Corpus
                        </h3>
                        <div className="p-6 bg-pink-50 dark:bg-pink-500/5 rounded-2xl border border-pink-500/10 mb-6">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Source Repository</p>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-200">Global Plant Pathology Dataset</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-bold">Total Specimens</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">87,032</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-bold">Training Set</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">80% (69,460)</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-bold">Normalization</span>
                                <span className="text-sm font-black text-pink-500">Optimized</span>
                            </div>
                        </div>
                    </div>

                    <div className={cn(
                        "glass-card p-8 bg-gradient-to-br from-pink-600 to-rose-700",
                        "text-white border-none shadow-2xl shadow-pink-500/30 rounded-[2.5rem]"
                    )}>
                        <h3 className="text-xs font-black mb-6 uppercase tracking-[0.2em] flex items-center gap-3">
                            <Cpu className="w-5 h-5 text-pink-200" />
                            Tech Architecture
                        </h3>
                        <div className="space-y-4">
                            {[
                                { l: "Interface Layer", v: "Next.js 15 / Tailwind v4" },
                                { l: "Logic Kernel", v: "Express.js / Node / JWT" },
                                { l: "Neural Core", v: "TensorFlow / Flask / OpenCV" }
                            ].map(x => (
                                <div key={x.l} className="p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/15 transition-all">
                                    <p className="text-[9px] font-black text-pink-200 uppercase tracking-widest mb-1">{x.l}</p>
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
                            Model Efficacy
                        </h3>
                        <div className="space-y-8">
                            {[
                                { l: "Precision", v: "98.4%", c: "from-pink-400 to-pink-600" },
                                { l: "Recall Index", v: "97.9%", c: "from-slate-700 to-slate-900" },
                                { l: "F1 Score Matrix", v: "98.1%", c: "from-rose-500 to-pink-500" }
                            ].map(x => (
                                <div key={x.l} className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black px-1">
                                        <span className="text-slate-400 uppercase tracking-widest">{x.l}</span>
                                        <span className="text-pink-500">{x.v}</span>
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
