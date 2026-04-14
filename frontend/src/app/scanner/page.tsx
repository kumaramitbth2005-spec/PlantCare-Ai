"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
    Upload,
    X,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Search,
    Zap,
    Sparkles,
    Video,
    FlipHorizontal,
    CameraOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/lib/NotificationContext";
import { useSoundSystem, NotificationPreset } from "@/lib/useSoundSystem";
import { useAuth } from "@/lib/AuthContext";

// API Configuration - Using Node Backend Proxy
const API_URL = `http://${typeof window !== "undefined" ? window.location.hostname : "localhost"}:8000/api/detection/detect`;

export default function ScannerPage() {
    const { user } = useAuth();
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
    
    // Camera State
    const [useCamera, setUseCamera] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [isCameraFront, setIsCameraFront] = useState(false);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);

    const handleVideoRef = useCallback((node: HTMLVideoElement | null) => {
        videoRef.current = node;
        if (node && cameraStream && node.srcObject !== cameraStream) {
            node.srcObject = cameraStream;
            node.onloadedmetadata = () => {
                node.play().catch(console.error);
            };
        }
    }, [cameraStream]);

    const router = useRouter();
    const { addNotification } = useNotifications();
    const { playNotification } = useSoundSystem();

    const stopCamera = useCallback(() => {
        setCameraStream((prevStream) => {
            if (prevStream) {
                prevStream.getTracks().forEach((track) => track.stop());
            }
            return null;
        });
    }, []);

    const startCamera = useCallback(async (frontCam: boolean) => {
        setError(null);
        try {
            stopCamera(); // ensure previous is stopped
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: frontCam ? "user" : "environment" },
                audio: false
            });
            setCameraStream(stream);
        } catch (err) {
            console.error("Camera access denied or error:", err);
            setError("Camera permission denied or device not found. Check system permissions.");
            setUseCamera(false);
        }
    }, [stopCamera]);

    useEffect(() => {
        if (useCamera && !preview) {
            startCamera(isCameraFront);
        } else {
            stopCamera();
        }
    }, [useCamera, isCameraFront, preview, startCamera, stopCamera]);

    useEffect(() => {
        return () => stopCamera(); // Cleanup on unmount
    }, [stopCamera]);

    const capturePhoto = useCallback(() => {
        if (videoRef.current && cameraStream) {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                if (isCameraFront) {
                    ctx.translate(canvas.width, 0);
                    ctx.scale(-1, 1);
                }
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        setCapturedBlob(blob);
                        setCapturedPhotoUrl(URL.createObjectURL(blob));
                    }
                }, "image/jpeg", 0.9);
            }
        }
    }, [cameraStream, isCameraFront]);

    const handleRetake = () => {
        setCapturedBlob(null);
        setCapturedPhotoUrl(null);
    };

    const handleConfirmCapture = () => {
        if (capturedBlob) {
            const newFile = new File([capturedBlob], "camera-capture.jpg", { type: "image/jpeg" });
            setFile(newFile);
            setPreview(URL.createObjectURL(newFile));
            setResult(null);
            setError(null);
            setUseCamera(false);
            setCapturedBlob(null);
            setCapturedPhotoUrl(null);
            stopCamera();
            handleScan(newFile); // initiate scan immediately
        }
    };

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

    const handleScan = async (fileToScanOrEvent?: File | React.MouseEvent | unknown) => {
        let targetFile = file;
        if (fileToScanOrEvent && fileToScanOrEvent instanceof File) {
            targetFile = fileToScanOrEvent;
        }

        if (!targetFile) return;
        setLoading(true);
        setError(null);
        setScanStep("Uploading intelligence...");

        const formData = new FormData();
        formData.append("file", targetFile);

        try {
            setTimeout(() => setScanStep("Isolating bio-markers..."), 800);
            setTimeout(() => setScanStep("Cross-referencing neural data..."), 1600);
            playNotification((user?.ringtoneSettings?.selectedNotificationRingtone as NotificationPreset) || "Soft Pop");

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
                playNotification((user?.ringtoneSettings?.selectedNotificationRingtone as NotificationPreset) || "Neural Ping");
            } else {
                setError(response.data.message || "Neural link failure. Check AI backend.");
            }
        } catch (err: unknown) {
            const error = err as { response?: { status?: number; data?: { message?: string } } };
            console.error("Scan Error:", error);
            
            if (error.response?.status === 401) {
                setError("Authentication required or session expired. Redirecting to login...");
                setTimeout(() => router.push('/login'), 2000);
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Connection lost. Please ensure the backend server is running.");
            }
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
                <div className="xl:col-span-7 space-y-8 min-w-0">
                    
                    {/* Camera Toggle Section */}
                    <div 
                        onClick={() => {
                            setUseCamera(!useCamera);
                            if (preview) clear();
                        }}
                        className={cn(
                            "p-6 rounded-[2rem] border border-slate-100 dark:border-pink-500/10",
                            "bg-white dark:bg-[#1a1215] flex flex-col sm:flex-row items-center justify-between gap-4",
                            "shadow-sm transition-all duration-300 cursor-pointer hover:border-pink-300 dark:hover:border-pink-500/30 hover:shadow-md",
                            useCamera && "border-pink-300 dark:border-pink-500/30"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-3 rounded-2xl transition-all duration-500",
                                useCamera 
                                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20 scale-110" 
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                            )}>
                                {useCamera ? <Video className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    Camera Option 
                                    {useCamera && <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />}
                                </h3>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Select Primary Neural Input Device</p>
                            </div>
                        </div>
                    </div>

                    <div
                        {...getRootProps({
                            onClick: (e) => {
                                if (useCamera) e.stopPropagation();
                            }
                        })}
                        className={cn(
                            "group relative overflow-hidden transition-all duration-700 flex flex-col items-center justify-center cursor-pointer w-full max-w-full",
                            !useCamera && "border-2 border-dashed rounded-[3rem] shadow-sm",
                            useCamera && !preview && "rounded-[2.5rem] bg-black shadow-2xl",
                            !useCamera && isDragActive
                                ? "border-pink-500 bg-pink-50/30"
                                : !useCamera ? "border-slate-100 dark:border-pink-500/10 hover:border-pink-400 hover:bg-pink-50/10 dark:hover:bg-pink-500/5" : "",
                            (preview || useCamera) ? (useCamera && !preview ? "p-0 aspect-[3/4] sm:aspect-video" : "p-2 aspect-[4/3] sm:aspect-video") : "p-6 min-h-[300px] md:min-h-[400px]"
                        )}
                    >
                        {!useCamera && <input {...getInputProps()} disabled={useCamera} />}

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
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); clear(); }}
                                        className={cn(
                                            "absolute top-6 right-6 p-3 bg-white/90 dark:bg-black/60",
                                            "backdrop-blur-xl rounded-2xl text-slate-900 dark:text-pink-100",
                                            "hover:scale-110 active:scale-90 transition-all shadow-2xl z-50",
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
                            ) : useCamera ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden"
                                >
                                    {capturedPhotoUrl ? (
                                        <div className="absolute inset-0 z-0">
                                            <Image src={capturedPhotoUrl} alt="Captured" fill className="object-cover" unoptimized />
                                        </div>
                                    ) : (
                                        <video
                                            ref={handleVideoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className={cn(
                                                "absolute inset-0 w-full h-full object-cover transition-transform duration-300 z-0",
                                                isCameraFront ? "-scale-x-100" : ""
                                            )}
                                        />
                                    )}
                                    
                                    {/* Scan Overlay Rectangle */}
                                    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
                                        <div className="w-[85%] sm:w-[60%] aspect-square relative rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]">
                                            
                                            {/* Scanning Line overlaying just the square box */}
                                            {!capturedPhotoUrl && !loading && (
                                                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                                                    <motion.div 
                                                        animate={{ top: ["0%", "100%", "0%"] }}
                                                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                                        className="absolute left-0 right-0 h-1 bg-pink-500 shadow-[0_0_30px_rgba(236,72,153,1)]"
                                                    />
                                                </div>
                                            )}

                                            {/* Neon Corners */}
                                            <div className="absolute -top-1 -left-1 w-12 h-12 border-t-[6px] border-l-[6px] border-pink-500 rounded-tl-3xl opacity-90" />
                                            <div className="absolute -top-1 -right-1 w-12 h-12 border-t-[6px] border-r-[6px] border-pink-500 rounded-tr-3xl opacity-90" />
                                            <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-[6px] border-l-[6px] border-pink-500 rounded-bl-3xl opacity-90" />
                                            <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-[6px] border-r-[6px] border-pink-500 rounded-br-3xl opacity-90" />
                                        </div>
                                    </div>

                                    {/* Camera Controls (Always above overlay) */}
                                    <div className="absolute bottom-6 inset-x-0 w-full px-6 z-50">
                                        {!capturedPhotoUrl ? (
                                            <div className="flex items-center justify-between w-full max-w-sm mx-auto">
                                                {/* Switch Camera Button */}
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsCameraFront(!isCameraFront); }}
                                                    className="w-14 h-14 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white backdrop-blur-md hover:bg-black/60 active:scale-95 transition-all pointer-events-auto shadow-lg"
                                                >
                                                    <FlipHorizontal className="w-6 h-6" />
                                                </button>
                                                
                                                {/* Circular Capture Button with Ripple Animation Design */}
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); capturePhoto(); }}
                                                    className="relative w-20 h-20 flex items-center justify-center rounded-full border-[3px] border-white/30 hover:border-white/50 bg-black/20 group outline-none pointer-events-auto"
                                                >
                                                    <div className="w-[3.5rem] h-[3.5rem] bg-white rounded-full group-active:scale-90 group-active:opacity-80 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
                                                </button>

                                                {/* Empty space for flex balance */}
                                                <div className="w-14 h-14" />
                                            </div>
                                        ) : (
                                            <div className="flex justify-between gap-4 w-full max-w-md mx-auto pointer-events-auto">
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRetake(); }}
                                                    className="flex-1 py-4 bg-black/60 backdrop-blur-xl rounded-2xl text-white font-black text-sm uppercase tracking-widest border border-white/20 hover:bg-black/80 active:scale-95 transition-all shadow-xl"
                                                >
                                                    Retake
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleConfirmCapture(); }}
                                                    className="flex-1 py-4 bg-pink-500 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(236,72,153,0.5)] active:scale-95 transition-all"
                                                >
                                                    Scan
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Loading State Overlay over camera */}
                                    {loading && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white z-[60]">
                                            <Loader2 className="w-12 h-12 animate-spin mb-4 text-pink-500" />
                                            <p className="font-black tracking-widest uppercase text-sm">Initiating Scan Sequence...</p>
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
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Scan Plant Image</h3>
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

                <div className="xl:col-span-5 h-full min-w-0">
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
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Treatment Suggestion</h3>
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
