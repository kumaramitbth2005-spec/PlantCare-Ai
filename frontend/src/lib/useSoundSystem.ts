"use client";

import { useState, useCallback } from "react";

export type NotificationPreset = "Neural Ping" | "Digital Chime" | "Soft Pop" | "Custom";
export type AlarmPreset = "Hydration Alert" | "Classic Pulse" | "Bio-Rhythm" | "Custom";

class WebAudioSynthesizer {
    private audioCtx: AudioContext | null = null;
    private alarmTimer: ReturnType<typeof setInterval> | null = null;
    private customNotificationBuffer: AudioBuffer | null = null;
    private customAlarmBuffer: AudioBuffer | null = null;

    private init() {
        if (typeof window === "undefined") return;
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
        if (this.audioCtx.state === "suspended") {
            this.audioCtx.resume();
        }
    }

    async setCustomAudio(type: 'notification' | 'alarm', arrayBuffer: ArrayBuffer) {
        this.init();
        if (!this.audioCtx) return;
        try {
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
            if (type === 'notification') {
                this.customNotificationBuffer = audioBuffer;
            } else {
                this.customAlarmBuffer = audioBuffer;
            }
        } catch (error) {
            console.error('Error decoding audio data for', type, error);
            throw error;
        }
    }

    playNotification(volume: number, preset: NotificationPreset = "Neural Ping") {
        this.init();
        if (!this.audioCtx) return;

        const ctx = this.audioCtx;

        if (preset === "Custom" && this.customNotificationBuffer) {
            const source = ctx.createBufferSource();
            source.buffer = this.customNotificationBuffer;
            const gainNode = ctx.createGain();
            gainNode.gain.value = volume;
            source.connect(gainNode);
            gainNode.connect(ctx.destination);
            source.start(ctx.currentTime);
            return;
        }
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Sound profiles
        if (preset === "Neural Ping") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume * 0.4, ctx.currentTime + 0.03);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        } else if (preset === "Digital Chime") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        } else if (preset === "Soft Pop") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        } else {
            // Fallback to Neural Ping if custom buffer is missing
            osc.type = "sine";
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume * 0.4, ctx.currentTime + 0.03);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        }

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + (preset === "Digital Chime" ? 0.4 : 0.3));
    }

    private playAlarmTick(volume: number, preset: AlarmPreset) {
        if (!this.audioCtx) return;
        const ctx = this.audioCtx;

        if (preset === "Custom" && this.customAlarmBuffer) {
            const source = ctx.createBufferSource();
            source.buffer = this.customAlarmBuffer;
            const gainNode = ctx.createGain();
            gainNode.gain.value = volume;
            source.connect(gainNode);
            gainNode.connect(ctx.destination);
            source.start(ctx.currentTime);
            return;
        }

        const playBeep = (freq: number, startDelay: number, duration: number, type: OscillatorType = "triangle") => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
            
            gain.gain.setValueAtTime(0, ctx.currentTime + startDelay);
            gain.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + startDelay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startDelay + duration);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + startDelay);
            osc.stop(ctx.currentTime + startDelay + duration);
        };

        if (preset === "Hydration Alert") {
            playBeep(600, 0, 0.5, "sine"); // Soft droplet sound
            playBeep(800, 0.3, 0.4, "sine");
        } else if (preset === "Bio-Rhythm") {
            playBeep(300, 0, 0.3, "square"); // Pulsating buzz
            playBeep(300, 0.2, 0.3, "square");
        } else {
            // Classic Pulse
            playBeep(880, 0, 0.4, "triangle");
            playBeep(1108.73, 0.15, 0.6, "triangle");
        }
    }

    startAlarm(volume: number, preset: AlarmPreset = "Classic Pulse") {
        this.init();
        if (this.alarmTimer) clearInterval(this.alarmTimer);
        
        this.playAlarmTick(volume, preset);
        this.alarmTimer = setInterval(() => {
            this.playAlarmTick(volume, preset);
        }, preset === "Bio-Rhythm" ? 800 : 1200);
    }

    stopAlarm() {
        if (this.alarmTimer) {
            clearInterval(this.alarmTimer);
            this.alarmTimer = null;
        }
    }
}

const globalSynth = new WebAudioSynthesizer();

export const useSoundSystem = () => {
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

    const [customNotificationName, setCustomNotificationName] = useState<string | null>(null);
    const [customAlarmName, setCustomAlarmName] = useState<string | null>(null);

    const triggerVibration = useCallback((pattern: number | number[]) => {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            try { navigator.vibrate(pattern); } catch { /* ignore */ }
        }
    }, []);

    const loadCustomAudioFromFile = useCallback(async (type: 'notification' | 'alarm', file: File) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            await globalSynth.setCustomAudio(type, arrayBuffer);
            if (type === 'notification') {
                setCustomNotificationName(file.name);
            } else {
                setCustomAlarmName(file.name);
            }
        } catch (error) {
            console.error('Failed to load custom audio for', type, error);
            throw error;
        }
    }, []);

    const playNotification = useCallback((preset: NotificationPreset = "Neural Ping") => {
        if (isMuted) return;
        globalSynth.playNotification(volume, preset);
        triggerVibration([50]);
    }, [isMuted, volume, triggerVibration]);

    const playAlarm = useCallback((preset: AlarmPreset = "Classic Pulse") => {
        if (isMuted || isAlarmPlaying) return;
        setIsAlarmPlaying(true);
        globalSynth.startAlarm(volume, preset);
        triggerVibration([300, 200, 300, 400]);
    }, [isMuted, volume, isAlarmPlaying, triggerVibration]);

    const stopAlarm = useCallback(() => {
        setIsAlarmPlaying(false);
        globalSynth.stopAlarm();
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(0);
        }
    }, []);

    const snoozeAlarm = useCallback((minutes: number = 5, preset: AlarmPreset = "Classic Pulse") => {
        stopAlarm();
        setTimeout(() => { playAlarm(preset); }, minutes * 60 * 1000);
    }, [playAlarm, stopAlarm]);

    return {
        playNotification,
        playAlarm,
        stopAlarm,
        snoozeAlarm,
        isAlarmPlaying,
        isMuted,
        toggleMute: () => setIsMuted(prev => {
            if (!prev) stopAlarm();
            return !prev;
        }),
        volume,
        setVolume,
        loadCustomAudioFromFile,
        customNotificationName,
        customAlarmName
    };
};
