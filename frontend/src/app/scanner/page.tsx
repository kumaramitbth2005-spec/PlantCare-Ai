"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
    Upload,
    X,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Search,
    Zap,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/lib/NotificationContext";

// API Configuration - Using Node Backend Proxy
const API_URL = "http://localhost:8000/api/detection/detect";

export default function ScannerPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [scanStep, setScanStep] = useState<string>("");
    const [result, setResult] = useState<{
        plant: string;
        disease: string;
        confidence: number;
        type: string;
        description: string;
        treatment: string;
        ai_insights?: string;
        is_demo?: boolean;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { addNotification } = useNotifications();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    });

    const handleScan = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setScanStep("Uploading intelligence...");

        const formData = new FormData();
        formData.append("file", file);

        try {
            setTimeout(() => setScanStep("Isolating bio-markers..."), 800);
            setTimeout(() => setScanStep("Cross-referencing neural data..."), 1600);

            const token = localStorage.getItem('pc_token');
            const response = await axios.post(API_URL, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.data.status === 'success') {
                const scanData = response.data.data.scan;
                setResult(scanData);
            } else {
                setError(response.data.message || "Neural link failure. Check AI backend.");
            }
        } catch (err) {
            const error = err as Error;
            console.error("Scan Error:", error);
            setError("Connection lost. Ensure the AI system is running locally.");
        } finally {
            setLoading(false);
            setScanStep("");
        }
    };

    const handleOrder = () => {
        addNotification({
            title: "Order Initiated",
            description: "The recommended treatment has been added to your transmission logs.",
            type: "info"
        });
        setTimeout(() => {
            router.push('/profile?tab=orders');
        }, 1500);
    };

    const clear = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 px-4 sm:px-8 pb-24">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "px-3 py-1 bg-pink-500/10 text-pink-500 text-[10px]",
                            "font-black uppercase tracking-[0.3em] rounded-full border border-pink-500/20"
                        )}>
                            AI Diagnostics
                        </span>
                        <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-4">
                        Neural
                        <span className="text-pink-500">Scanner</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl text-sm sm:text-lg leading-relaxed">
                        High-precision plant pathology identification. Backed by transfer learning and 87k+ expert-verified specimens.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                <div className="xl:col-span-7 space-y-8">
                    <div
                        {...getRootProps()}
                        className={cn(
                            "group relative overflow-hidden border-2 border-dashed rounded-[3rem]",
                            "p-6 transition-all duration-700 flex flex-col items-center",
                            "justify-center min-h-[300px] md:min-h-[400px] cursor-pointer shadow-sm",
                            isDragActive
                                ? "border-pink-500 bg-pink-50/30"
                                : "border-slate-100 dark:border-pink-500/10 hover:border-pink-400 hover:bg-pink-50/10 dark:hover:bg-pink-500/5",
                            preview && "p-2 min-h-0 aspect-[4/3] sm:aspect-video"
                        )}
                    >
                        <input {...getInputProps()} />

                        <AnimatePresence mode="wait">
                            {preview ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "relative w-full h-full rounded-[2rem] overflow-hidden",
                                        "shadow-[0_30px_60px_-15px_rgba(236,72,153,0.3)]"
                                    )}
                                >
                                    <Image
                                        src={preview}
                                        alt="Specimen"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); clear(); }}
                                        className={cn(
                                            "absolute top-6 right-6 p-3 bg-white/90 dark:bg-black/60",
                                            "backdrop-blur-xl rounded-2xl text-slate-900 dark:text-pink-100",
                                            "hover:scale-110 active:scale-90 transition-all shadow-2xl z-20",
                                            "border border-white/50"
                                        )}
                                    >
                                        <X className="w-6 h-6" />
                                    </button>

                                    {loading && (
                                        <div className="absolute inset-0 bg-pink-500/20 backdrop-blur-[4px] flex flex-col items-center justify-center text-white p-8">
                                            <Loader2 className="w-16 h-16 animate-spin mb-6 text-pink-400" />
                                            <div className={cn(
                                                "bg-slate-900/80 px-6 py-3 rounded-2xl text-sm",
                                                "font-black tracking-widest uppercase backdrop-blur-2xl",
                                                "border border-white/10 shadow-2xl"
                                            )}>
                                                {scanStep}
                                            </div>
                                            <motion.div
                                                animate={{ top: ["0%", "100%", "0%"] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                className={cn(
                                                    "absolute left-0 right-0 h-1 bg-gradient-to-r",
                                                    "from-transparent via-pink-400 to-transparent",
                                                    "shadow-[0_0_30px_rgba(236,72,153,1)] opacity-80 pointer-events-none"
                                                )}
                                            />
                                            <div className="absolute inset-x-0 bottom-10 flex justify-center">
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Decrypting Bio-Pattern</span>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center space-y-8 max-w-sm"
                                >
                                    <div className={cn(
                                        "w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-pink-50",
                                        "to-pink-100 dark:from-pink-900/20 dark:to-pink-900/10",
                                        "text-pink-500 flex items-center justify-center mx-auto",
                                        "group-hover:scale-110 group-hover:rotate-6 transition-all duration-700",
                                        "shadow-inner border border-pink-100 dark:border-pink-500/10"
                                    )}>
                                        <Upload className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Supply Specimen</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-bold leading-relaxed px-4">
                                            Drag leaf image for deep neural analysis. Neural engine identifies 38+ pathology states.
                                        </p>
                                    </div>
                                    <div className="flex justify-center gap-3">
                                        {["8k RES", "ALPHA", "BIO"].map(tag => (
                                            <span
                                                key={tag}
                                                className={cn(
                                                    "px-3 py-1 bg-slate-100/50 dark:bg-pink-500/5 rounded-lg",
                                                    "text-[9px] font-black tracking-widest text-slate-400",
                                                    "border border-slate-100 dark:border-pink-500/10"
                                                )}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-100",
                                    "dark:border-rose-900/30 text-rose-600 dark:text-rose-400",
                                    "rounded-3xl text-sm font-black tracking-tight flex",
                                    "items-center gap-5 shadow-sm"
                                )}
                            >
                                <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        disabled={!file || loading}
                        onClick={handleScan}
                        className={cn(
                            "w-full relative overflow-hidden bg-slate-900 dark:bg-pink-600",
                            "text-white py-6 rounded-[2rem] font-black text-xl",
                            "disabled:opacity-50 disabled:cursor-not-allowed transition-all",
                            "hover:translate-y-[-2px] active:translate-y-[1px]",
                            "shadow-[0_20px_40px_-10px_rgba(236,72,153,0.3)] group"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <span className="relative z-10 flex items-center justify-center gap-4">
                            {loading ? "Decrypting Specimen..." : "Initiate Bio-Scan"}
                            <Zap className={cn("w-6 h-6 transition-all duration-300", !loading && "group-hover:scale-125 group-hover:fill-white")} />
                        </span>
                    </button>
                </div>

                <div className="xl:col-span-5 h-full">
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={cn(
                                    "glass-card h-full p-6 sm:p-10 space-y-6 sm:space-y-10 bg-white dark:bg-[#1a1215]",
                                    "border border-slate-100 dark:border-pink-500/10 flex flex-col rounded-[3rem]",
                                    "shadow-[0_40px_80px_-20px_rgba(30,27,28,0.1)]"
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "px-3 py-1 bg-pink-500 text-white text-[9px] font-black",
                                                "uppercase tracking-widest rounded-lg shadow-lg shadow-pink-500/20"
                                            )}>
                                                Identified
                                            </span>
                                            {result.is_demo && (
                                                <span className={cn(
                                                    "px-3 py-1 bg-amber-500 text-white text-[9px] font-black",
                                                    "uppercase tracking-widest rounded-lg shadow-lg shadow-amber-500/20"
                                                )}>
                                                    Demo Mode
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter capitalize leading-none">{result.plant}</h2>
                                    </div>
                                    <div className={cn(
                                        "bg-slate-50 dark:bg-pink-500/5 p-3 sm:p-5 rounded-[2rem]",
                                        "border border-slate-100 dark:border-pink-500/10 flex flex-col",
                                        "items-center justify-center min-w-[80px] sm:min-w-[100px] shadow-inner"
                                    )}>
                                        <span className="text-2xl sm:text-4xl font-black text-pink-600 dark:text-pink-400">{result.confidence}%</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Confidence</span>
                                    </div>
                                </div>

                                <div className={cn(
                                    "p-6 sm:p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border-b-4",
                                    "shadow-xl transition-all duration-700",
                                    (result.disease || "").toLowerCase() === 'healthy'
                                        ? "bg-emerald-50/30 border-emerald-500 text-emerald-900 dark:bg-emerald-500/5 dark:text-emerald-400"
                                        : "bg-pink-50/50 border-pink-500 text-pink-900 dark:bg-pink-500/10 dark:text-pink-400"
                                )}>
                                    <div className={cn(
                                        "p-4 sm:p-5 rounded-2xl shadow-lg",
                                        (result.disease || "").toLowerCase() === 'healthy' ? "bg-emerald-500 text-white" : "bg-pink-600 text-white"
                                    )}>
                                        {(result.disease || "").toLowerCase() === 'healthy' ? <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" /> : <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />}
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Diagnosis Findings</p>
                                        <p className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">{result.disease}</p>
                                    </div>
                                </div>

                                <div className="space-y-8 flex-1">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="p-5 bg-slate-50/50 dark:bg-pink-500/5 rounded-2xl border border-slate-100 dark:border-pink-500/10">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Profile</p>
                                            <p className="font-black text-slate-800 dark:text-slate-200 text-lg">{result.type || "Biological"}</p>
                                        </div>
                                        <div className="p-5 bg-slate-50/50 dark:bg-pink-500/5 rounded-2xl border border-slate-100 dark:border-pink-500/10">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Severity Zone</p>
                                            <p className="font-black text-rose-500 text-lg">LEVEL 03</p>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "bg-slate-900/5 dark:bg-pink-500/5 p-6 rounded-[2rem]",
                                        "border border-slate-100 dark:border-pink-500/10 relative overflow-hidden"
                                    )}>
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <Sparkles className="w-16 h-16" />
                                        </div>
                                        <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-900 dark:text-pink-300 mb-4 uppercase tracking-[0.2em]">
                                            Bio-Analytical Intelligence
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold">
                                            {result.description}
                                        </p>
                                    </div>

                                    {result.treatment && (
                                        <div className={cn(
                                            "p-8 bg-gradient-to-br from-pink-600 to-rose-700",
                                            "text-white rounded-[2.5rem] shadow-2xl relative",
                                            "overflow-hidden group/order"
                                        )}>
                                            <div className={cn(
                                                "absolute top-0 right-0 p-6 opacity-20",
                                                "group-hover/order:scale-125 transition-transform duration-700"
                                            )}>
                                                <CheckCircle2 className="w-20 h-20" />
                                            </div>
                                            <h4 className="text-[10px] font-black text-pink-200 uppercase tracking-[0.3em] mb-4">
                                                RECOVERY PROTOCOL
                                            </h4>
                                            <p className="text-base leading-relaxed font-black italic tracking-tight mb-6">
                                                &quot;{result.treatment}&quot;
                                            </p>
                                            <button
                                                onClick={handleOrder}
                                                className={cn(
                                                    "w-full py-4 bg-white text-pink-600 rounded-2xl",
                                                    "font-black text-xs uppercase tracking-widest shadow-xl",
                                                    "flex items-center justify-center gap-3 hover:bg-pink-50",
                                                    "transition-all active:scale-95"
                                                )}
                                            >
                                                <Zap className="w-4 h-4" />
                                                Direct Purchase & Deploy
                                            </button>
                                        </div>
                                    )}

                                    {result.ai_insights && (
                                        <div className={cn(
                                            "bg-indigo-900/5 dark:bg-indigo-500/10 p-6 rounded-[2rem]",
                                            "border border-indigo-100 dark:border-indigo-500/20 relative overflow-hidden mt-6"
                                        )}>
                                            <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-500">
                                                <Sparkles className="w-16 h-16" />
                                            </div>
                                            <h4 className="flex items-center gap-2 text-[10px] font-black text-indigo-900 dark:text-indigo-400 mb-4 uppercase tracking-[0.2em]">
                                                <Zap className="w-3 h-3" /> Core AI Diagnostic & Recovery Insights
                                            </h4>
                                            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium space-y-4">
                                                {result.ai_insights.split('\n').map((line, idx) => (
                                                    <p key={idx}>{line}</p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 grid grid-cols-2 gap-5">
                                    <button className={cn(
                                        "py-5 bg-slate-900 dark:bg-slate-800 text-white",
                                        "text-[10px] font-black uppercase tracking-[0.2em]",
                                        "rounded-2xl hover:bg-black transition-all shadow-xl"
                                    )}>
                                        PDF Dossier
                                    </button>
                                    <button
                                        onClick={clear}
                                        className={cn(
                                            "py-5 bg-white dark:bg-pink-500/10 text-slate-900",
                                            "dark:text-white text-[10px] font-black uppercase",
                                            "tracking-[0.2em] rounded-2xl border border-slate-200",
                                            "dark:border-pink-500/10 hover:bg-slate-50 transition-all"
                                        )}
                                    >
                                        Reset Array
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className={cn(
                                "glass-card h-full min-h-[550px] flex flex-col items-center",
                                "justify-center text-center p-12 space-y-10 bg-white/40",
                                "dark:bg-pink-500/5 border border-slate-100 dark:border-pink-500/10",
                                "shadow-2xl rounded-[4rem]"
                            )}>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-pink-400/30 blur-[100px] rounded-full group-hover:bg-pink-500/40 transition-all duration-1000" />
                                    <div className={cn(
                                        "w-32 h-32 rounded-[3.5rem] bg-white dark:bg-slate-900",
                                        "flex items-center justify-center relative border",
                                        "border-slate-100 dark:border-pink-500/20 shadow-2xl",
                                        "group-hover:scale-110 transition-transform duration-700"
                                    )}>
                                        <Search className="w-12 h-12 text-pink-500/30 dark:text-pink-500/50" />
                                        <motion.div
                                            animate={{ opacity: [0.1, 0.4, 0.1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-4 border-4 border-pink-500/20 rounded-full"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Awaiting Input</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed text-sm max-w-xs mx-auto">
                                        The neural engine is online. Supply a bio-specimen (leaf image) to initiate deep analysis and disease detection.
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-4 w-full">
                                    {[
                                        { l: "TRAINED", v: "14+" },
                                        { l: "MODELS", v: "38+" },
                                        { l: "PRECISION", v: "99%" }
                                    ].map(x => (
                                        <div
                                            key={x.l}
                                            className={cn(
                                                "p-4 bg-white dark:bg-pink-500/5 rounded-3xl",
                                                "border border-white dark:border-pink-500/10 shadow-sm"
                                            )}
                                        >
                                            <p className="text-base font-black text-slate-900 dark:text-white tracking-widest">{x.v}</p>
                                            <p className="text-[8px] font-black text-pink-500/60 uppercase tracking-widest mt-1">{x.l}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
