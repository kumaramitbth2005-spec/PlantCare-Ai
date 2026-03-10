"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    History as HistoryIcon,
    Search,
    Filter,
    Download,
    Trash2,
    ExternalLink,
    ChevronRight,
    Calendar,
    X,
    Share2,
    Copy,
    CheckCircle2,
    AlertCircle,
    ArrowUp,
    ArrowDown
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "@/lib/AuthContext";

type ScanRecord = {
    _id: string;
    plant: string;
    disease: string;
    type: string;
    confidence: number;
    createdAt: string;
};

export default function HistoryPage() {
    const { user } = useAuth();
    const [records, setRecords] = useState<ScanRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSpecies, setSelectedSpecies] = useState("All Species");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [isSpeciesOpen, setIsSpeciesOpen] = useState(false);

    // Modal States
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [shareData, setShareData] = useState<ScanRecord | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const speciesOptions = ["All Species", "Tomato", "Potato", "Apple", "Corn", "Pepper", "Grape", "Strawberry", "Brinjal", "Ladyfinger", "Orange", "Blueberry", "Cherry", "Peach", "Raspberry", "Soybean", "Squash"];

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem("pc_token");
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/detection/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.status === 'success') {
                    setRecords(res.data.data.history);
                }
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchHistory();
    }, [user]);

    const filteredRecords = useMemo(() => {
        const result = records.filter(record => {
            const matchesSearch =
                record._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.plant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.type.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesSpecies = selectedSpecies === "All Species" || record.plant === selectedSpecies;

            return matchesSearch && matchesSpecies;
        });

        return result.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });
    }, [records, searchQuery, selectedSpecies, sortOrder]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const token = localStorage.getItem("pc_token");
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/detection/${deleteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecords(prev => prev.filter(r => r._id !== deleteId));
            setDeleteId(null);
        } catch (err) {
            console.error("Error deleting record:", err);
        }
    };

    const handleShare = (record: ScanRecord) => {
        setShareData(record);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 px-4 sm:px-6 pb-20">
            {/* Header section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-lg shadow-pink-500/20">
                            <HistoryIcon className="w-8 h-8 text-white" />
                        </div>
                        Diagnostic <span className="text-pink-500 italic">Journal</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold ml-16">
                        Intelligence logs for all specimens analyzed by the neural engine.
                    </p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-pink-500/10 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-pink-50 transition-all shadow-sm">
                        <Download className="w-4 h-4 text-pink-500" />
                        Export Archive
                    </button>
                </div>
            </header>

            <div className="glass-card shadow-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-pink-500/10 transition-colors duration-300">
                {/* Search & Filters Controls */}
                <div className="p-8 border-b border-slate-50 dark:border-pink-500/5 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400 group-focus-within:scale-110 transition-transform" />
                        <input
                            type="text"
                            placeholder="Search specimen records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-pink-500/5 border border-slate-100 dark:border-pink-500/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-4 focus:ring-pink-500/10 transition-all outline-none text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Species Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsSpeciesOpen(!isSpeciesOpen)}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-pink-500/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-pink-500 transition-all border border-transparent hover:border-pink-500/10"
                            >
                                <Filter className="w-4 h-4" />
                                {selectedSpecies}
                            </button>
                            <AnimatePresence>
                                {isSpeciesOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsSpeciesOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-2"
                                        >
                                            {speciesOptions.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => {
                                                        setSelectedSpecies(opt);
                                                        setIsSpeciesOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full text-left px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors",
                                                        selectedSpecies === opt ? "bg-pink-500 text-white" : "text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-white/5"
                                                    )}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Chronological Sort */}
                        <button
                            onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                            className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-pink-500/20 group"
                        >
                            {sortOrder === "newest" ? <ArrowDown className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> : <ArrowUp className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />}
                            Chronological
                        </button>
                    </div>
                </div>

                {/* Main Records Table */}
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-pink-50/20 dark:bg-pink-500/5 text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">
                                <th className="px-8 py-5">Specimen Data</th>
                                <th className="px-8 py-5">Plant Type</th>
                                <th className="px-8 py-5">Diagnosis Findings</th>
                                <th className="px-8 py-5">Bio-Metrics</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-pink-500/5">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-10 bg-slate-50/50 dark:bg-white/5" />
                                    </tr>
                                ))
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                                        No specimen records found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((item, index) => (
                                    <motion.tr
                                        key={item._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-pink-50/40 dark:hover:bg-pink-500/5 transition-all duration-300 group"
                                    >
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-black text-slate-900 dark:text-white tracking-widest">
                                                #PC-{item._id.slice(-4).toUpperCase()}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Calendar className="w-3 h-3 text-pink-400" />
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    {format(new Date(item.createdAt), 'yyyy-MM-dd')} • {format(new Date(item.createdAt), 'hh:mm aa')}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-pink-100 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 font-black text-sm border border-pink-500/10 group-hover:scale-110 transition-transform">
                                                    {item.plant[0]}
                                                </div>
                                                <span className="text-sm font-black text-slate-700 dark:text-slate-200">{item.plant}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-2.5 h-2.5 rounded-full shadow-sm animate-pulse",
                                                    item.type === 'Healthy' ? "bg-emerald-400" : item.type === 'Bacterial' ? "bg-amber-500" : "bg-rose-500"
                                                )} />
                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-300 tracking-tight">{item.disease}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="w-32 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-1000",
                                                            item.confidence >= 95 ? "bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]" : item.confidence >= 85 ? "bg-pink-400" : "bg-rose-400"
                                                        )}
                                                        style={{ width: `${item.confidence}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                                                    {item.confidence}% Precision Index
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border-2",
                                                item.type === 'Healthy' ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" :
                                                    item.type === 'Fungal' ? "bg-rose-500/5 text-rose-600 border-rose-500/20" :
                                                        "bg-amber-500/5 text-amber-600 border-amber-500/20"
                                            )}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleShare(item)}
                                                    className="p-3 bg-pink-500 text-white rounded-2xl shadow-lg shadow-pink-500/10 hover:scale-110 transition-transform"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(item._id)}
                                                    className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination summary */}
                {!isLoading && (
                    <div className="p-8 bg-slate-50/30 dark:bg-pink-500/5 flex items-center justify-between border-t border-slate-50 dark:border-pink-500/5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            Displaying <span className="text-pink-500">{filteredRecords.length}</span> of {records.length} diagnostic reports
                        </p>
                    </div>
                )}
            </div>

            {/* Modals Overlay */}
            <AnimatePresence>
                {/* Delete Confirmation Modal */}
                {deleteId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 inset-x-0 h-2 bg-rose-500" />
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center">
                                    <AlertCircle className="w-10 h-10 text-rose-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Confirm Deletion</h3>
                                    <p className="text-slate-500 mt-2 font-medium">Are you sure you want to delete this record? This action cannot be undone.</p>
                                </div>
                                <div className="flex gap-4 w-full">
                                    <button onClick={() => setDeleteId(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancel</button>
                                    <button onClick={handleDelete} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-colors">Delete Now</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Share Modal */}
                {shareData && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShareData(null)} />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 inset-x-0 h-2 bg-pink-500" />
                            <button onClick={() => setShareData(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-pink-500 transition-colors"><X className="w-5 h-5" /></button>
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-pink-50 dark:bg-pink-500/10 rounded-3xl flex items-center justify-center">
                                        <Share2 className="w-8 h-8 text-pink-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Share Diagnostics</h3>
                                        <p className="text-xs text-pink-500/60 font-black uppercase tracking-widest mt-1">Intelligence Report</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share Options</p>
                                    <button
                                        onClick={() => copyToClipboard(`${window.location.origin}/report/${shareData._id}`)}
                                        className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl group hover:border-pink-500/30 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-pink-500"><Copy className="w-4 h-4" /></div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Copy Record Link</span>
                                        </div>
                                        {isCopied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />}
                                    </button>

                                    <button className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl group hover:border-pink-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-pink-500"><Download className="w-4 h-4" /></div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Download PDF Report</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <button className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl group hover:border-pink-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-pink-500"><ExternalLink className="w-4 h-4" /></div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">View Diagnostic View</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
