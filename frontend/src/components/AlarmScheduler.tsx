"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useSoundSystem, AlarmPreset } from "@/lib/useSoundSystem";
import { BellRing, X, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AlarmScheduler() {
    const { user } = useAuth();
    const { playAlarm, stopAlarm, snoozeAlarm, isAlarmPlaying } = useSoundSystem();
    const lastFiredTime = useRef<Record<string, string>>({});
    
    // Check alarm schedule every 10 seconds
    useEffect(() => {
        if (!user) return;

        const checkInterval = setInterval(() => {
            const now = new Date();
            const currentHours = now.getHours().toString().padStart(2, '0');
            const currentMins = now.getMinutes().toString().padStart(2, '0');
            const currentTimeStr = `${currentHours}:${currentMins}`;
            const todayStr = now.toDateString();

            // Extract User Settings
            const waterEnabled = user.plantReminders?.water?.enabled;
            const waterTime = user.plantReminders?.water?.reminderTime;
            
            const fertEnabled = user.plantReminders?.fertilizer?.enabled;
            const fertTime = user.plantReminders?.fertilizer?.reminderTime;

            const ringtoneSettings = (user.ringtoneSettings || {}) as any;
            const isAlarmOffGlobally = ringtoneSettings.alarmSoundEnabled === false;
            
            if (isAlarmOffGlobally) return;

            const selectedPreset = (ringtoneSettings.selectedAlarmRingtone as AlarmPreset) || "Classic Pulse";

            const triggerIfMatch = (scheduledTime: string | undefined, type: string) => {
                if (!scheduledTime) return;
                const fireKey = `${type}-${todayStr}`;
                
                // If it's the exact minute, and we haven't fired it yet today at this minute
                if (currentTimeStr === scheduledTime && lastFiredTime.current[fireKey] !== currentTimeStr) {
                    lastFiredTime.current[fireKey] = currentTimeStr;
                    playAlarm(selectedPreset);
                }
            };

            if (waterEnabled) triggerIfMatch(waterTime, "water");
            if (fertEnabled) triggerIfMatch(fertTime, "fert");

        }, 10000); // 10s precision

        return () => clearInterval(checkInterval);
    }, [user, playAlarm]);

    // Handle initial browser interaction block
    // Audio usually requires the user to click at least once before it can play background schedules.
    // By wrapping the site in event listeners briefly, we ensure the AudioContext is "unlocked".
    useEffect(() => {
        const unlockAudio = () => {
             // Just initializing dummy audio context internally happens via the first user click
             // handled by standard browser policies. We don't necessarily play something, 
             // but user interaction on the site unlocks the tab.
        };
        window.addEventListener('click', unlockAudio, { once: true });
        window.addEventListener('touchstart', unlockAudio, { once: true });
        return () => {
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
        };
    }, []);

    return (
        <AnimatePresence>
            {isAlarmPlaying && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed right-4 top-4 z-[9999] p-5 w-80 bg-slate-900/90 dark:bg-black/90 backdrop-blur-xl rounded-[2rem] border border-white/10 dark:border-pink-500/20 shadow-2xl overflow-hidden"
                >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500 animate-pulse" />
                    
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-pink-500 text-white rounded-2xl shadow-lg shadow-pink-500/30 animate-pulse">
                            <BellRing className="w-6 h-6" />
                        </div>
                        <div className="flex-1 mt-1">
                            <h4 className="font-black text-white text-sm tracking-widest uppercase">Protocol Alarm</h4>
                            <p className="text-xs text-slate-400 font-bold mt-1">A scheduled plant care task requires your attention.</p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => stopAlarm()} 
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                        >
                            <X className="w-3 h-3" /> Dismiss
                        </button>
                        <button 
                            onClick={() => snoozeAlarm(5)} 
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                        >
                            <Timer className="w-3 h-3" /> Snooze
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
