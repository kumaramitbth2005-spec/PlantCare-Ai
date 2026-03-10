"use client";

import { motion } from "framer-motion";
import {
    ShieldCheck,
    Users,
    Activity,
    HardDrive,
    Cpu,
    TrendingUp,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminStats = [
    { label: "Total Users", value: "842", icon: Users, color: "blue", trend: "+12" },
    { label: "Monthly Scans", value: "4,291", icon: Activity, color: "emerald", trend: "+18%" },
    { label: "Model Refinement", value: "v2.4.1", icon: Cpu, color: "purple", trend: "Latest" },
    { label: "Server Uptime", value: "99.98%", icon: HardDrive, color: "orange", trend: "Stable" },
];

export default function AdminPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded-xl">
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Admin Control Center
                    </h1>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        System Status
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500 font-bold mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Operational
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminStats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{
                            opacity: 0,
                            scale: 0.9
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1
                        }}
                        transition={{
                            delay: i * 0.1
                        }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div
                                className={cn(
                                    "p-2.5 rounded-xl",
                                    stat.color === 'emerald' && "bg-emerald-500/10 text-emerald-500",
                                    stat.color === 'blue' && "bg-blue-500/10 text-blue-500",
                                    stat.color === 'purple' && "bg-purple-500/10 text-purple-500",
                                    stat.color === 'orange' && "bg-orange-500/10 text-orange-500",
                                )}
                            >
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                            {stat.label}
                        </p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">
                            {stat.value}
                        </h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card overflow-hidden">
                    <div
                        className={cn(
                            "p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"
                        )}
                    >
                        <h3 className="text-lg font-bold text-slate-900">
                            User Management
                        </h3>
                        <div className="relative">
                            <Search
                                className={cn(
                                    "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                                )}
                            />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className={cn(
                                    "bg-white border rounded-full py-1.5 pl-9 pr-4",
                                    "text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                                )}
                            />
                        </div>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr
                                className={cn(
                                    "text-slate-400 text-[10px] font-black uppercase tracking-widest",
                                    "border-b border-slate-100"
                                )}
                            >
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Active Workspace</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 italic font-medium">
                            {[1, 2, 3, 4].map((i) => (
                                <tr
                                    key={i}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-200" />
                                            <span className="text-xs font-bold text-slate-700">
                                                user_{i}@example.com
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={cn(
                                                "px-2 py-0.5 bg-emerald-100 text-emerald-700",
                                                "text-[10px] font-black rounded-full uppercase"
                                            )}
                                        >
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 tracking-tight">
                                        Industrial Research Group A
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            className={cn(
                                                "text-[10px] font-black text-indigo-500 hover:underline uppercase"
                                            )}
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">
                            Model Performance
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span>Inference Latency</span>
                                    <span className="text-emerald-500">142ms</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[15%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span>GPU Utilization</span>
                                    <span className="text-indigo-500">42%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[42%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-slate-900 text-white border-none">
                        <h3
                            className={cn(
                                "text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2"
                            )}
                        >
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            Recent Alerts
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-tighter mb-1">
                                    Server Warning • 2m ago
                                </p>
                                <p className="text-xs leading-tight opacity-80 italic">
                                    Worker #4 experienced high I/O wait during sync.
                                </p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter mb-1">
                                    Backup Success • 1h ago
                                </p>
                                <p className="text-xs leading-tight opacity-80 italic">
                                    Daily database snapshot completed successfully.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
