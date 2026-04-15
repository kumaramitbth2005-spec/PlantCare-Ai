"use client";

import { motion } from "framer-motion";
import {
    Zap,
    AlertTriangle,
    CheckCircle2,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Activity
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import Link from "next/link";
import { cn } from "../../lib/utils";
import api from "@/lib/api";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { format } from "date-fns";

// Register ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

type DashboardData = {
    totalScans: number;
    healthyCount: number;
    diseasedCount: number;
    diseaseStats: { _id: string; count: number }[];
};

type ScanRecord = {
    _id: string;
    plant: string;
    disease: string;
    type: string;
    confidence: number;
    createdAt: string;
};

interface StatData {
    label: string;
    value: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    color: string;
    trend: string;
    trendUp: boolean;
}

function StatCard({ stat, index }: { stat: StatData, index: number }) {
    const ColorIcon = stat.icon;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", damping: 15 }}
            className="glass-card p-8 flex flex-col gap-6 shadow-sm hover:shadow-pink-500/10 border border-pink-500/5 dark:border-pink-500/10"
        >
            <div className="flex items-center justify-between">
                <div className={cn(
                    "p-3 rounded-2xl shadow-lg shadow-pink-500/10",
                    stat.color === 'pink' && "bg-gradient-to-br from-pink-500 to-pink-600 text-white",
                    stat.color === 'rose' && "bg-gradient-to-br from-rose-500 to-rose-600 text-white",
                    stat.color === 'fuchsia' && "bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-white",
                )}>
                    <ColorIcon className="w-6 h-6" />
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-tighter",
                    stat.trendUp ? "bg-pink-100 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                )}>
                    {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.trend}
                </div>
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{stat.value}</h3>
            </div>
        </motion.div>
    );
}

export default function Dashboard() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [history, setHistory] = useState<ScanRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setFetchError(null);
            try {
                const [statsRes, historyRes] = await Promise.all([
                    api.get('/detection/stats'),
                    api.get('/detection/history')
                ]);

                if (statsRes.data.status === 'success') {
                    setData(statsRes.data.data);
                }
                if (historyRes.data.status === 'success') {
                    setHistory(historyRes.data.data.history.slice(0, 5));
                }
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                setFetchError("Unable to load live dashboard data. Check network connection.");
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const statsConfig = [
        { label: "Total Scans", value: data?.totalScans.toLocaleString() || "0", icon: Activity, color: "pink", trend: "+12%", trendUp: true },
        { label: "Diseases Detected", value: data?.diseasedCount.toLocaleString() || "0", icon: AlertTriangle, color: "rose", trend: "+5%", trendUp: true },
        { label: "Healthy Plants", value: data?.healthyCount.toLocaleString() || "0", icon: CheckCircle2, color: "fuchsia", trend: "-2%", trendUp: false },
        { label: "Model Accuracy", value: "98.2%", icon: Zap, color: "pink", trend: "+0.4%", trendUp: true },
    ];

    const doughnutData = {
        labels: ['Fungal', 'Bacterial', 'Viral', 'Healthy'],
        datasets: [
            {
                data: [
                    data?.diseaseStats?.find?.(s => s._id === 'Fungal')?.count || 0,
                    data?.diseaseStats?.find?.(s => s._id === 'Bacterial')?.count || 0,
                    data?.diseaseStats?.find?.(s => s._id === 'Virus')?.count || 0,
                    data?.diseaseStats?.find?.(s => s._id === 'Healthy')?.count || 0,
                ],
                backgroundColor: [
                    'rgba(236, 72, 153, 0.8)', // Primary Pink
                    'rgba(244, 114, 182, 0.8)', // Light Pink
                    'rgba(190, 24, 93, 0.8)',   // Rose 700
                    'rgba(30, 27, 28, 0.1)',    // Neutral
                ],
                hoverOffset: 15,
                borderWidth: 0,
            },
        ],
    };

    // Generate dynamic chart data from history (Group by date over the last 6 days or so)
    const recentScans = [...history].reverse(); // oldest first for left-to-right chart
    const chartLabels = recentScans.length > 0 
        ? recentScans.map(scan => format(new Date(scan.createdAt), 'MMM dd'))
        : ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6']; // Fallback empty state
    
    // Use confidence or simply uniform count 1 for demonstration if no custom logic exists
    // Lets use confidence score for a visually interesting graph, or just count. 
    // Here we'll plot the confidence score of recent scans.
    const chartDataPoints = recentScans.length > 0
        ? recentScans.map(scan => scan.confidence) 
        : [0, 0, 0, 0, 0, 0]; // Fallback empty state

    const lineData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Confidence Level (%)',
                data: chartDataPoints,
                fill: true,
                borderColor: 'rgb(236, 72, 153)',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                tension: 0.4,
                pointBackgroundColor: '#ec4899',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
            },
        ],
    };
    return (
        <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Overview{" "}
                        <span className="text-pink-500 italic">
                            {t('sidebar.dashboard')}
                        </span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Monitoring plant health metrics across active zones.
                    </p>
                </div>
                <Link href="/scanner">
                    <button className="btn-primary w-full sm:w-auto text-sm group shadow-pink-500/40">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Start New Analysis
                    </button>
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {statsConfig.map((stat, i) => (
                    <StatCard
                        key={stat.label}
                        stat={stat}
                        index={i}
                    />
                ))}
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                    <span className="text-sm font-bold text-slate-500 tracking-widest uppercase animate-pulse">Initializing Data Stream...</span>
                </div>
            )}

            {!isLoading && fetchError && (
                <div className="glass-card p-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto border-rose-500/20 bg-rose-500/5">
                    <AlertTriangle className="w-12 h-12 text-rose-500 mb-4 opacity-80" />
                    <h3 className="text-xl font-black text-rose-500 tracking-tight mb-2">Connection Timeout</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-6">{fetchError}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="btn-primary px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600"
                    >
                        Retry Connection
                    </button>
                </div>
            )}

            {!isLoading && !fetchError && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Main Chart */}
                        <div className="lg:col-span-2 glass-card p-8 shadow-xl bg-white dark:bg-[#1a1215]/50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                        Activity Analysis
                                    </h3>
                                    <p className="text-xs text-pink-500/60 font-bold uppercase tracking-[0.2em] mt-1">
                                        Intelligence Report
                                    </p>
                                </div>
                                <div
                                    className={cn(
                                        "flex items-center gap-2 bg-pink-50 dark:bg-pink-900/10",
                                        "p-1.5 rounded-xl self-start sm:self-auto"
                                    )}
                                >
                                    <button
                                        className={cn(
                                            "px-5 py-2 text-xs font-black uppercase tracking-widest",
                                            "bg-white dark:bg-pink-500 text-pink-600 dark:text-white",
                                            "rounded-lg shadow-sm transition-all"
                                        )}
                                    >
                                        6 Months
                                    </button>
                                    <button
                                        className={cn(
                                            "px-5 py-2 text-xs font-black uppercase tracking-widest",
                                            "text-slate-400 dark:text-slate-500",
                                            "hover:text-pink-500 transition-all"
                                        )}
                                    >
                                        1 Year
                                    </button>
                                </div>
                            </div>
                            <div className="h-[350px] w-full">
                                <Line
                                    data={lineData}
                                    options={{
                                        maintainAspectRatio: false,
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                display: false
                                            },
                                            tooltip: {
                                                backgroundColor: '#1e1b1c',
                                                titleFont: {
                                                    size: 14,
                                                    weight: 'bold'
                                                },
                                                bodyFont: {
                                                    size: 12
                                                },
                                                padding: 12,
                                                cornerRadius: 8,
                                                displayColors: false
                                            }
                                        },
                                        scales: {
                                            y: {
                                                grid: {
                                                    display: true,
                                                    color: 'rgba(236, 72, 153, 0.05)'
                                                },
                                                ticks: {
                                                    color: "#94a3b8",
                                                    font: {
                                                        weight: 'bold'
                                                    }
                                                }
                                            },
                                            x: {
                                                grid: {
                                                    display: false
                                                },
                                                ticks: {
                                                    color: "#94a3b8",
                                                    font: {
                                                        weight: 'bold'
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Distribution Chart */}
                        <div className="glass-card p-8 flex flex-col shadow-xl bg-white dark:bg-[#1a1215]/50">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                                Category Split
                            </h3>
                            <p className="text-xs text-pink-500/60 font-bold uppercase tracking-[0.2em] mb-8">
                                Pathogen Intelligence
                            </p>
                            <div className="flex-1 flex items-center justify-center p-6 relative">
                                <div className="w-full max-w-[220px] aspect-square relative z-10">
                                    <Doughnut
                                        data={doughnutData}
                                        options={{
                                            maintainAspectRatio: false,
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    display: false
                                                }
                                            },
                                            cutout: '82%',
                                            spacing: 5,
                                        }}
                                    />
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                                        1,000+
                                    </span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Reports
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6 mt-10">
                                {doughnutData.labels.map((label, i) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-3"
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full shadow-sm"
                                            style={{
                                                backgroundColor: doughnutData.datasets[0].backgroundColor[i]
                                            }}
                                        />
                                        <span
                                            className={cn(
                                                "text-[10px] font-black uppercase tracking-widest",
                                                "text-slate-500 dark:text-slate-400"
                                            )}
                                        >
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div
                        className={cn(
                            "glass-card overflow-hidden shadow-2xl bg-white dark:bg-[#1a1215]/50",
                            "border border-slate-100 dark:border-pink-500/10"
                        )}
                    >
                        <div className="p-8 border-b border-slate-50 dark:border-pink-500/5 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                Recent Intelligence{" "}
                                <span className="text-pink-500">
                                    Logs
                                </span>
                            </h3>
                            <Link
                                href="/history"
                                className={cn(
                                    "text-pink-600 text-xs font-black uppercase tracking-[0.2em]",
                                    "hover:opacity-80 transition-all border-b-2 border-pink-500/20 pb-1"
                                )}
                            >
                                View Full Log
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr
                                        className={cn(
                                            "bg-pink-50/20 dark:bg-pink-500/5",
                                            "text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]"
                                        )}
                                    >
                                        <th className="px-8 py-5">
                                            Specimen
                                        </th>
                                        <th className="px-8 py-5">
                                            Diagnostic / Findings
                                        </th>
                                        <th className="px-8 py-5">
                                            Certainty Index
                                        </th>
                                        <th className="px-8 py-5 text-right">
                                            Timeframe
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-pink-500/5">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-10 text-center text-slate-400 font-medium">
                                                No recent scans found. Start your first analysis!
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((scan) => (
                                            <tr
                                                key={scan._id}
                                                className="hover:bg-pink-50/30 dark:hover:bg-pink-500/5 transition-all duration-300 group"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className={cn(
                                                                "w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-500/10",
                                                                "flex items-center justify-center text-pink-600 dark:text-pink-400",
                                                                "font-black text-sm shadow-inner group-hover:scale-110 transition-transform"
                                                            )}
                                                        >
                                                            {scan.plant[0]}
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                                                                {scan.plant}
                                                            </span>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                                Ref ID: {scan._id.slice(-6).toUpperCase()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={cn(
                                                                "w-2.5 h-2.5 rounded-full shadow-sm animate-pulse",
                                                                scan.type === 'Healthy' ? "bg-fuchsia-400" : "bg-pink-500"
                                                            )}
                                                        />
                                                        <span className="text-sm text-slate-600 dark:text-slate-400 font-bold">
                                                            {scan.disease} ({scan.type})
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="w-32 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                        <motion.div
                                                            initial={{
                                                                width: 0
                                                            }}
                                                            animate={{
                                                                width: `${scan.confidence}%`
                                                            }}
                                                            transition={{
                                                                duration: 1.5,
                                                                delay: 0.2
                                                            }}
                                                            className={cn(
                                                                "h-full rounded-full shadow-[0_0_10px_rgba(236,72,153,0.3)]",
                                                                scan.type === 'Healthy' ? "bg-fuchsia-500" : "bg-pink-500"
                                                            )}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 mt-2 block tracking-widest">
                                                        {scan.confidence}% CONFIDENCE
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                        {format(new Date(scan.createdAt), 'MMM dd, hh:mm aa')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
