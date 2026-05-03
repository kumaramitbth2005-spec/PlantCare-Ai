"use client";
/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import {
    User as UserIcon,
    Shield,
    Bell,
    Lock,
    Save,
    Camera,
    Zap,
    MapPin,
    Trophy,
    Languages,
    RefreshCw,
    LogOut,
    Settings,
    Sliders,
    Sparkles,
    Search,
    Image as ImageIcon,
    Music,
    Trash2
} from "lucide-react";
import NextImage from "next/image";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/lib/LanguageContext';
import { useNotifications } from '@/lib/NotificationContext';
import { useAuth } from '@/lib/AuthContext';
import { useSoundSystem, NotificationPreset, AlarmPreset } from '@/lib/useSoundSystem';
import { useTheme } from "@/lib/ThemeContext";
import { Language } from "@/lib/translations";
import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import api, { BASE_URL } from '@/lib/api';

export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProfileContent />
        </Suspense>
    );
}

function ProfileContent() {
    const { t, language, setLanguage } = useLanguage();
    const { addNotification } = useNotifications();
    const { user, logout, updateProfile, token } = useAuth();
    const { playNotification, playAlarm, stopAlarm, loadCustomAudioFromFile, customNotificationName, customAlarmName } = useSoundSystem();
    const { theme, setTheme } = useTheme();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const searchParams = useSearchParams();
    type TabType = 'profile' | 'addresses' | 'reminders' | 'routine' | 'language' | 'privacy' | 'scannerSettings' | 'theme' | 'aboutDeveloper';

    const [activeTab, setActiveTab] = useState<TabType>(
        (searchParams.get('tab') as TabType) || 'profile'
    );

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (
            tab &&
            ['profile', 'addresses', 'reminders', 'routine', 'language', 'privacy', 'scannerSettings', 'theme', 'aboutDeveloper'].includes(tab)
        ) {
            setActiveTab(tab as TabType);
        }
    }, [searchParams]);

    // Form state
    interface Address {
        type: string;
        street: string;
        city: string;
        state: string;
        zip: string;
        isDefault: boolean;
    }

    interface ProfileFormData {
        firstName: string;
        lastName: string;
        contactNumber: string;
        email: string;
        address: string;
        scannerSettings: {
            cameraOption: boolean;
            autoPlantDetection: boolean;
            saveInGoogleDrive: boolean;
        };
        privacyGrid: {
            notifications: boolean;
            dataEncryption: boolean;
        };
        addresses: Address[];
    }

    const [formData, setFormData] = useState<ProfileFormData>({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        contactNumber: user?.contactNumber || "",
        email: user?.email || "",
        address: user?.address || "",
        scannerSettings: {
            cameraOption: user?.scannerSettings?.cameraOption ?? true,
            autoPlantDetection: user?.scannerSettings?.autoPlantDetection ?? true,
            saveInGoogleDrive: user?.scannerSettings?.saveInGoogleDrive ?? false,
        },
        privacyGrid: {
            notifications: user?.privacyGrid?.notifications ?? true,
            dataEncryption: user?.privacyGrid?.dataEncryption ?? true,
        },
        addresses: user?.addresses || []
    });
    const [profileImage, setProfileImage] = useState<string | null>(user?.profilePhoto || null);
    const [editImageFile, setEditImageFile] = useState<string | null>(null);
    const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [filters, setFilters] = useState({ brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0 });
    const [crop, setCrop] = useState({ zoom: 1, panX: 0, panY: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
    const [imageDims, setImageDims] = useState<{ width: number, height: number } | null>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const notificationInputRef = useRef<HTMLInputElement>(null);
    const alarmInputRef = useRef<HTMLInputElement>(null);

    // --- Plant Care State ---
    const [waterReminderOn, setWaterReminderOn] = useState(user?.plantReminders?.water?.enabled ?? true);
    const [waterFrequency, setWaterFrequency] = useState(user?.plantReminders?.water?.frequency ?? 2);
    const [lastWateredDate, setLastWateredDate] = useState<string>(
        user?.plantReminders?.water?.lastTransmission
            ? new Date(user?.plantReminders?.water?.lastTransmission).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );

    const [fertilizerReminderOn, setFertilizerReminderOn] = useState(user?.plantReminders?.fertilizer?.enabled ?? false);
    const [fertilizerFrequency, setFertilizerFrequency] = useState(user?.plantReminders?.fertilizer?.frequency ?? 'Monthly');
    const [nextFertilizerDate, setNextFertilizerDate] = useState<string>(
        user?.plantReminders?.fertilizer?.nextProtocol
            ? new Date(user?.plantReminders?.fertilizer?.nextProtocol).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );

    const [dailyRoutineContent, setDailyRoutineContent] = useState(user?.dailyRoutine ?? '');

    const [waterReminderTime, setWaterReminderTime] = useState(user?.plantReminders?.water?.reminderTime ?? '09:00');
    const [fertilizerReminderTime, setFertilizerReminderTime] = useState(user?.plantReminders?.fertilizer?.reminderTime ?? '09:00');

    // --- Scanner & Privacy State ---
    const [scannerSettings, setScannerSettings] = useState({
        cameraOption: user?.scannerSettings?.cameraOption ?? true,
        autoPlantDetection: user?.scannerSettings?.autoPlantDetection ?? true,
        saveInGoogleDrive: user?.scannerSettings?.saveInGoogleDrive ?? false
    });

    const [privacyGrid, setPrivacyGrid] = useState({
        notifications: user?.privacyGrid?.notifications ?? true,
        dataEncryption: user?.privacyGrid?.dataEncryption ?? true
    });

    const [ringtoneSettings, setRingtoneSettings] = useState({
        notificationSoundEnabled: user?.ringtoneSettings?.notificationSoundEnabled ?? true,
        alarmSoundEnabled: user?.ringtoneSettings?.alarmSoundEnabled ?? true,
        selectedNotificationRingtone: user?.ringtoneSettings?.selectedNotificationRingtone ?? 'Neural Ping',
        selectedAlarmRingtone: user?.ringtoneSettings?.selectedAlarmRingtone ?? 'Hydration Alert',
    });

    const [addresses, setAddresses] = useState<Address[]>(user?.addresses || []);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState<Omit<Address, 'isDefault'>>({ type: 'home', street: '', city: '', state: '', zip: '' });

    const handleUpdateScanner = async (key: keyof typeof scannerSettings) => {
        const updated = { ...scannerSettings, [key]: !scannerSettings[key] };
        setScannerSettings(updated);
        try {
            await updateProfile({ scannerSettings: updated });
            addNotification({ title: 'Scanner Updated', description: `${key} preference saved.`, type: 'info' });
        } catch {
            addNotification({ title: 'Update Failed', description: 'Could not save scanner settings.', type: 'alert' });
        }
    };

    const handleUpdatePrivacy = async (key: keyof typeof privacyGrid) => {
        const updated = { ...privacyGrid, [key]: !privacyGrid[key] };
        setPrivacyGrid(updated);
        try {
            await updateProfile({ privacyGrid: updated });
            addNotification({ title: 'Privacy Updated', description: 'Your security preferences have been synchronized.', type: 'info' });
        } catch {
            addNotification({ title: 'Update Failed', description: 'Could not save privacy settings.', type: 'alert' });
        }
    };

    const handleAddAddress = async () => {
        const updatedAddresses = [...addresses, { ...newAddress, isDefault: addresses.length === 0 }];
        try {
            setIsSyncing(true);
            await updateProfile({ addresses: updatedAddresses });
            setAddresses(updatedAddresses);
            setIsAddingAddress(false);
            setNewAddress({ type: 'home', street: '', city: '', state: '', zip: '' });
            addNotification({ title: 'Node Registered', description: 'New shipping node has been added to the registry.', type: 'update' });
        } catch {
            addNotification({ title: 'Failed', description: 'Could not add address.', type: 'alert' });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteAddress = async (index: number) => {
        const updatedAddresses = addresses.filter((_: unknown, i: number) => i !== index);
        try {
            setIsSyncing(true);
            await updateProfile({ addresses: updatedAddresses });
            setAddresses(updatedAddresses);
            addNotification({ title: 'Node Deleted', description: 'Node removed from registry.', type: 'info' });
        } catch {
            addNotification({ title: 'Failed', description: 'Could not delete address.', type: 'alert' });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSavePlantCare = async () => {
        try {
            setIsSyncing(true);
            await updateProfile({
                plantReminders: {
                    water: {
                        enabled: waterReminderOn,
                        frequency: Number(waterFrequency),
                        lastTransmission: new Date(lastWateredDate),
                        reminderTime: waterReminderTime
                    },
                    fertilizer: {
                        enabled: fertilizerReminderOn,
                        frequency: fertilizerFrequency,
                        nextProtocol: new Date(nextFertilizerDate),
                        reminderTime: fertilizerReminderTime
                    }
                },
                dailyRoutine: dailyRoutineContent,
                ringtoneSettings: ringtoneSettings
            });
            addNotification({
                title: 'Settings Saved',
                description: 'Your growth protocols have been synchronized.',
                type: 'update'
            });
        } catch {
            addNotification({
                title: 'Sync Failed',
                description: 'Could not update your plant care settings.',
                type: 'alert'
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleWaterToggle = () => {
        const next = !waterReminderOn;
        setWaterReminderOn(next);
        addNotification({
            title: next ? '💧 Water Reminder Activated' : '💧 Water Reminder Disabled',
            description: next
                ? `Hydration cycle alerts are now ON. You will be reminded every ${waterFrequency} days.`
                : 'Water scheduling reminders have been turned off.',
            type: next ? 'update' : 'info'
        });
    };

    const handleFertilizerToggle = () => {
        const next = !fertilizerReminderOn;
        setFertilizerReminderOn(next);
        addNotification({
            title: next ? '✨ Fertilization Reminder Activated' : '✨ Fertilization Reminder Disabled',
            description: next
                ? 'Nutrient injection protocol alerts are now ON.'
                : 'Fertilization scheduling reminders have been turned off.',
            type: next ? 'update' : 'info'
        });
    };
    // --------------------------------

    const initCamera = async (retryCount = 0, existingStream?: MediaStream) => {
        console.log(`initCamera attempt ${retryCount + 1}`, existingStream ? 'with existing stream' : 'requesting new stream');
        try {
            if (!videoRef.current) {
                if (retryCount < 10) { // Increased retries for slower modal mounting
                    console.log('videoRef.current not found, retrying in 100ms...');
                    setTimeout(() => initCamera(retryCount + 1, existingStream), 100);
                    return;
                }
                throw new Error('Video element not found after multiple retries');
            }

            let stream = existingStream;
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true
                });
            }

            console.log('Stream acquired successfully:', stream.id);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Faster initialization
                await videoRef.current.play();
                console.log('videoRef.current.play() successful');

                addNotification({
                    title: 'Camera Ready',
                    description: 'Live camera is now active.',
                    type: 'info'
                });
            }
        } catch (err) {
            console.error('Detailed Camera error:', err);
            addNotification({
                title: "Camera Access Failed",
                description: err instanceof Error ? err.message : "Could not access the camera. Please check permissions.",
                type: 'alert'
            });
            setIsCameraOpen(false);
        }
    };

    const startCamera = async () => {
        console.log('startCamera: checking for direct user gesture');
        setIsPhotoMenuOpen(false);

        // Check if mediaDevices is supported (requires Secure Context: HTTPS or Localhost)
        if (!navigator.mediaDevices) {
            console.warn('navigator.mediaDevices is undefined. Using native camera fallback...');
            // Fallback for insecure contexts: Use native camera app
            cameraInputRef.current?.click();
            return;
        }

        try {
            console.log('Requesting getUserMedia directly...');
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            console.log('getUserMedia granted, opening modal');

            setIsCameraOpen(true);

            // Wait for modal to render and then attach the stream
            setTimeout(() => {
                initCamera(0, stream);
            }, 100);
        } catch (err) {
            console.error('getUserMedia failed in startCamera:', err);
            addNotification({
                title: "Camera Denied",
                description: "Permission was not granted or camera is occupied.",
                type: 'alert'
            });
        }
    };

    const stopCamera = () => {
        console.log('stopCamera: stopping tracks and closing modal');
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => {
                console.log('Stopping track:', track.label);
                track.stop();
            });
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        console.log('capturePhoto: attempting to capture frame');
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (video.videoWidth === 0 || video.videoHeight === 0) {
                console.warn('capturePhoto: video dimensions are zero, camera might not be ready');
                addNotification({
                    title: 'Capture Error',
                    description: 'Camera is not ready. Please wait a moment.',
                    type: 'alert'
                });
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                console.log(`Drawing frame: ${canvas.width}x${canvas.height}`);
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageBase64 = canvas.toDataURL('image/png');
                console.log('Photo captured, length:', imageBase64.length);

                stopCamera();
                setImageDims({ width: canvas.width, height: canvas.height });
                setEditImageFile(imageBase64);
                setFilters({ brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0 });
                setCrop({ zoom: 1, panX: 0, panY: 0 });
            } else {
                console.error('capturePhoto: failed to get canvas context');
            }
        } else {
            console.error('capturePhoto: videoRef or canvasRef is null');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsPhotoMenuOpen(false);
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const src = reader.result as string;
                const img = new window.Image();
                img.onload = () => {
                    setImageDims({ width: img.width, height: img.height });
                    setEditImageFile(src);
                    setFilters({ brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0 });
                    setCrop({ zoom: 1, panX: 0, panY: 0 });
                };
                img.src = src;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        if ('touches' in e && e.touches.length === 2) {
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            setLastTouchDistance(distance);
        } else {
            setIsDragging(true);
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            setDragStart({ x: clientX, y: clientY });
        }
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if ('touches' in e && e.touches.length === 2) {
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            if (lastTouchDistance !== null) {
                const delta = distance - lastTouchDistance;
                const zoomFactor = 0.01;
                setCrop(prev => ({
                    ...prev,
                    zoom: Math.max(1, Math.min(10, prev.zoom + delta * zoomFactor))
                }));
            }
            setLastTouchDistance(distance);
        } else if (isDragging) {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            const deltaX = clientX - dragStart.x;
            const deltaY = clientY - dragStart.y;

            // Sensible panning multiplier
            const sensitivity = 1;
            setCrop(prev => ({
                ...prev,
                panX: prev.panX + deltaX * sensitivity,
                panY: prev.panY + deltaY * sensitivity
            }));
            setDragStart({ x: clientX, y: clientY });
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setLastTouchDistance(null);
    };

    const handleWheel = (e: React.WheelEvent) => {
        const zoomStep = 0.1;
        const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
        setCrop(prev => ({
            ...prev,
            zoom: Math.max(1, Math.min(10, prev.zoom + delta))
        }));
    };

    const handleFitPerfect = () => {
        setCrop(prev => ({ ...prev, zoom: 1, panX: 0, panY: 0 }));
    };

    const handleSaveEditedImage = () => {
        if (!editImageFile) return;
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.src = editImageFile;
        img.onload = () => {
            const size = 512;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px) sepia(${filters.sepia}%)`;

                const scale = Math.max(size / img.width, size / img.height);
                const drawWidth = img.width * scale;
                const drawHeight = img.height * scale;

                // Calculate drawing center
                const centerX = size / 2;
                const centerY = size / 2;

                // Apply transformation
                ctx.translate(centerX, centerY);
                ctx.scale(crop.zoom, crop.zoom);

                // Panning logic: panX/panY represent pixel offsets in the 240px preview unit
                // We need to scale them to the 512px canvas unit
                const previewSize = previewContainerRef.current?.offsetWidth || 240;
                const scaleF = size / previewSize;
                const offsetX = crop.panX * scaleF;
                const offsetY = crop.panY * scaleF;
                ctx.translate(offsetX / crop.zoom, offsetY / crop.zoom);

                // Draw image centered at the translated origin
                ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

                const finalImage = canvas.toDataURL('image/png');

                // Upload logic
                const uploadToServer = async () => {
                    setIsUploading(true);
                    try {
                        const response = await fetch(finalImage);
                        const blob = await response.blob();
                        const localToken = localStorage.getItem('pc_token') || token;

                        const formData = new FormData();
                        formData.append('profilePhoto', blob, 'profile.png');

                        const apiResponse = await api.post('/users/uploadProfilePhoto', formData);

                        const data = apiResponse.data;

                        if (apiResponse.status !== 200 && data.status !== 'success') {
                            throw new Error(data.message || 'Failed to upload photo');
                        }

                        // Success scenario
                        const newPhotoUrl = data.data.fileUrl.startsWith('http')
                            ? data.data.fileUrl
                            : `${BASE_URL}${data.data.fileUrl}`;
                        setProfileImage(newPhotoUrl);
                        await updateProfile({ profilePhoto: newPhotoUrl }); // Synchronize auth context too
                        setEditImageFile(null);

                        addNotification({
                            title: "Profile Image Updated",
                            description: "Your customized visual identity has been saved via Neural Editor.",
                            type: 'info'
                        });

                    } catch (error) {
                        const err = error as Error;
                        console.error('Upload error:', err);
                        addNotification({
                            title: "Upload Failed",
                            description: err.message || "An error occurred while uploading. Please try again.",
                            type: 'alert'
                        });
                    } finally {
                        setIsUploading(false);
                    }
                };

                uploadToServer();
            }
        };
    };

    const handleDeletePhoto = async () => {
        setIsDeleting(true);
        try {
            const localToken = localStorage.getItem('pc_token') || token;

            const apiResponse = await api.delete('/users/deleteProfilePhoto');
            const data = apiResponse.data;

            if (apiResponse.status !== 200 && data.status !== 'success') {
                throw new Error(data.message || 'Failed to delete photo');
            }

            // Fallback to default avatar behavior mapping
            setProfileImage(null);
            await updateProfile({ profilePhoto: 'default.jpg' });

            addNotification({
                title: "Profile Image Removed",
                description: "Your digital avatar has been reset to default.",
                type: 'info'
            });

        } catch (error) {
            const err = error as Error;
            console.error('Delete error:', err);
            addNotification({
                title: "Deletion Failed",
                description: err.message || "Could not remove your profile picture.",
                type: 'alert'
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
            setIsPhotoMenuOpen(false);
        }
    };

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                contactNumber: user.contactNumber,
                email: user.email,
                address: user.address || "",
                scannerSettings: {
                    cameraOption: user.scannerSettings?.cameraOption ?? true,
                    autoPlantDetection: user.scannerSettings?.autoPlantDetection ?? true,
                    saveInGoogleDrive: user.scannerSettings?.saveInGoogleDrive ?? false
                },
                privacyGrid: {
                    notifications: user.privacyGrid?.notifications ?? true,
                    dataEncryption: user.privacyGrid?.dataEncryption ?? true
                },
                addresses: user.addresses || []
            });
            setWaterReminderTime(user.plantReminders?.water?.reminderTime ?? '09:00');
            setFertilizerReminderTime(user.plantReminders?.fertilizer?.reminderTime ?? '09:00');
            setScannerSettings({
                cameraOption: user.scannerSettings?.cameraOption ?? true,
                autoPlantDetection: user.scannerSettings?.autoPlantDetection ?? true,
                saveInGoogleDrive: user.scannerSettings?.saveInGoogleDrive ?? false
            });
            setPrivacyGrid({
                notifications: user.privacyGrid?.notifications ?? true,
                dataEncryption: user.privacyGrid?.dataEncryption ?? true
            });
            setAddresses(user.addresses || []);
            setRingtoneSettings({
                notificationSoundEnabled: user.ringtoneSettings?.notificationSoundEnabled ?? true,
                alarmSoundEnabled: user.ringtoneSettings?.alarmSoundEnabled ?? true,
                selectedNotificationRingtone: user.ringtoneSettings?.selectedNotificationRingtone ?? 'Neural Ping',
                selectedAlarmRingtone: user.ringtoneSettings?.selectedAlarmRingtone ?? 'Hydration Alert',
            });
        }
    }, [user]);

    const handleSync = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSyncing(true);
        try {
            await updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                contactNumber: formData.contactNumber,
                email: formData.email,
                address: formData.address
            });
            addNotification({
                title: "Profile Updated",
                description: "Your personal details have been saved successfully.",
                type: 'info'
            });
        } catch (err) {
            const error = err as Error;
            addNotification({
                title: "Update Failed",
                description: error.message || "Could not save your profile changes.",
                type: 'alert'
            });
        } finally {
            setIsSyncing(false);
        }
    };



    if (!user) return null; // Should be handled by AuthProvider redirect

    return (
        <div className="max-w-5xl mx-auto space-y-12 px-4 sm:px-6 pb-20">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {t('profile.title')} <span className="text-pink-500 italic">{t('profile.subtitle')}</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold text-lg">{t('profile.description')}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left: Identity Card */}
                <div className="xl:col-span-4">
                    <div className="xl:sticky xl:top-24 space-y-8">
                        <div className="glass-card p-10 flex flex-col items-center text-center bg-white/80 dark:bg-slate-900 border border-slate-100 dark:border-pink-500/10 shadow-2xl rounded-[3rem] relative overflow-hidden group">
                            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-pink-500 to-rose-600 opacity-10 group-hover:opacity-20 transition-all duration-700" />

                            <div className="relative mt-4">
                                <button onClick={() => setIsPhotoMenuOpen(true)} className="w-40 h-40 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/20 dark:to-pink-900/10 flex items-center justify-center text-pink-600 text-5xl font-black border-4 border-white dark:border-slate-800 shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-500 uppercase overflow-hidden block">
                                    {profileImage ? (
                                        <NextImage
                                            src={profileImage}
                                            alt="Profile"
                                            fill
                                            className="object-cover rounded-full"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                    )}
                                </button>

                                {/* Photo Picker Menu */}
                                {isPhotoMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsPhotoMenuOpen(false)} />
                                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-pink-500/10 z-50 overflow-hidden flex flex-col p-2">
                                            <button onClick={startCamera} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-[1.5rem] cursor-pointer group transition-all text-left">
                                                <div className="p-2 bg-pink-500/10 text-pink-500 rounded-xl group-hover:scale-110 transition-transform">
                                                    <Camera className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-tight">Take Selfie</span>
                                            </button>
                                            <label className={cn(
                                                "flex items-center gap-4 px-4 py-4 hover:bg-slate-50",
                                                "dark:hover:bg-white/5 rounded-[1.5rem] cursor-pointer group transition-all text-left"
                                            )}>
                                                <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl group-hover:scale-110 transition-transform">
                                                    <ImageIcon className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-tight">
                                                    Choose from Gallery
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                />
                                            </label>

                                            {profileImage && profileImage !== 'default.jpg' && (
                                                <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-[1.5rem] cursor-pointer group transition-all text-left mt-1 border-t border-slate-100 dark:border-white/5">
                                                    <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl group-hover:scale-110 transition-transform">
                                                        <Trash2 className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">Delete Profile Image</span>
                                                </button>
                                            )}
                                        </motion.div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="user"
                                            className="hidden"
                                            ref={cameraInputRef}
                                            onChange={handleImageUpload}
                                        />
                                    </>
                                )}
                            </div>

                            <div className="mt-8 space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user.firstName} {user.lastName}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{user.accountType}</p>
                            </div>

                            <div className="mt-6 flex items-center gap-2 px-6 py-2 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black rounded-full uppercase tracking-tighter border border-green-500/20 shadow-sm">
                                <Shield className="w-3 h-3" />
                                System Access: Verified
                            </div>

                            <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                                <div className="p-4 bg-slate-50 dark:bg-pink-500/5 rounded-2xl border border-slate-100 dark:border-pink-500/10">
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{user.stats?.totalScans || 0}</p>
                                    <p className="text-[9px] font-black text-pink-500/60 uppercase tracking-widest">Scans</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-pink-500/5 rounded-2xl border border-slate-100 dark:border-pink-500/10">
                                    <p className="text-xl font-black text-slate-900 dark:text-white">98%</p>
                                    <p className="text-[9px] font-black text-pink-500/60 uppercase tracking-widest">Certainty</p>
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 font-black rounded-2xl uppercase tracking-widest text-[10px] border border-rose-500/10 shadow-sm transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                {t('sidebar.logout')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-8 xl:sticky xl:top-24 space-y-8">
                    {/* Account Content */}
                    {activeTab === 'profile' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="glass-card p-10 bg-white/80 dark:bg-slate-900 border border-slate-100 dark:border-pink-500/10 shadow-xl rounded-[3rem]">
                                <div className="flex items-center gap-4 mb-10 border-b border-slate-50 dark:border-pink-500/5 pb-6">
                                    <div className="p-3 bg-pink-500 text-white rounded-2xl shadow-lg shadow-pink-500/20">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Personal Profile</h3>
                                        <p className="text-xs text-pink-500 font-bold uppercase tracking-widest mt-1">Matrix Link Credentials</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSync} className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-pink-500/5 border border-slate-100 dark:border-pink-500/10 rounded-[1.25rem] px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-pink-500/10 outline-none transition-all text-slate-900 dark:text-white"
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-pink-500/5 border border-slate-100 dark:border-pink-500/10 rounded-[1.25rem] px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-pink-500/10 outline-none transition-all text-slate-900 dark:text-white"
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                                        <input
                                            type="text"
                                            value={formData.contactNumber}
                                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-pink-500/5 border border-slate-100 dark:border-pink-500/10 rounded-[1.25rem] px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-pink-500/10 outline-none transition-all text-slate-900 dark:text-white"
                                            placeholder="Enter contact number"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Matrix Identity (Email)</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-pink-500/5 border border-slate-100 dark:border-pink-500/10 rounded-[1.25rem] px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-pink-500/10 outline-none transition-all text-slate-900 dark:text-white"
                                            placeholder="Enter Matrix Email"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Full Address</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows={3}
                                            className="w-full bg-slate-50 dark:bg-pink-500/5 border border-slate-100 dark:border-pink-500/10 rounded-[1.25rem] px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-pink-500/10 outline-none transition-all text-slate-900 dark:text-white resize-none"
                                            placeholder="Enter your full address"
                                        />
                                    </div>

                                    <div className="sm:col-span-2 pt-8 flex justify-end">
                                        <button type="submit" className="px-10 py-4 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-pink-500/20 transition-all active:scale-95 flex items-center gap-2">
                                            {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* Language Content */}
                    {activeTab === 'language' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="glass-card p-10 bg-white/80 dark:bg-slate-900 border border-slate-100 dark:border-pink-500/10 shadow-xl rounded-[3rem]">
                                <div className="flex items-center gap-4 mb-10 border-b border-slate-50 dark:border-pink-500/5 pb-6">
                                    <div className="p-3 bg-pink-500 text-white rounded-2xl shadow-lg border border-white/10">
                                        <Languages className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('profile.language')}</h3>
                                        <p className="text-xs text-pink-500 font-bold uppercase tracking-widest">{t('profile.langDesc')}</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-pink-500/5 rounded-[2rem] border border-slate-100 dark:border-pink-500/10 group transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl">
                                                <Languages className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('profile.language')}</p>
                                                <p className="text-xs text-slate-500 font-bold mt-1">{t('profile.langDesc')}</p>
                                            </div>
                                        </div>
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value as Language)}
                                            className="bg-transparent text-sm font-black text-pink-500 border-none outline-none cursor-pointer p-2"
                                        >
                                            <option value="en">English</option>
                                            <option value="hi">हिंदी (Hindi)</option>
                                            <option value="es">Español (Spanish)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Privacy Grid Content */}
                    {activeTab === 'privacy' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="glass-card p-10 bg-white/80 dark:bg-slate-900 border border-slate-100 dark:border-pink-500/10 shadow-xl rounded-[3rem]">
                                <div className="flex items-center gap-4 mb-10 border-b border-slate-50 dark:border-pink-500/5 pb-6">
                                    <div className="p-3 bg-slate-900 dark:bg-pink-600 text-white rounded-2xl shadow-lg border border-white/10">
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('profile.privacyGrid')}</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('profile.privacyDesc')}</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-pink-500/5 rounded-[2rem] border border-slate-100 dark:border-pink-500/10 group transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl">
                                                <Bell className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('profile.notifications')}</p>
                                                <p className="text-xs text-slate-400 font-bold mt-1">{t('profile.notifDesc')}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUpdatePrivacy('notifications')}
                                            className={cn(
                                                "w-14 h-8 rounded-full relative cursor-pointer transition-all",
                                                privacyGrid.notifications ? "bg-pink-500 shadow-lg shadow-pink-500/20" : "bg-slate-200 dark:bg-white/10"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all",
                                                privacyGrid.notifications ? "right-1" : "left-1"
                                            )} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-pink-500/5 rounded-[2rem] border border-slate-100 dark:border-pink-500/10 group transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Data Encryption</p>
                                                <p className="text-xs text-slate-400 font-bold mt-1">End-to-end neural data protection.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUpdatePrivacy('dataEncryption')}
                                            className={cn(
                                                "w-14 h-8 rounded-full relative cursor-pointer transition-all",
                                                privacyGrid.dataEncryption ? "bg-pink-500 shadow-lg shadow-pink-500/20" : "bg-slate-200 dark:bg-white/10"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all",
                                                privacyGrid.dataEncryption ? "right-1" : "left-1"
                                            )} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Addresses Content */}
                    {activeTab === 'addresses' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="glass-card p-10 bg-white/80 dark:bg-slate-900 border border-slate-100 dark:border-pink-500/10 shadow-xl rounded-[3rem]">
                                <div className="flex items-center justify-between mb-10 border-b border-slate-50 dark:border-pink-500/5 pb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-pink-500 text-white rounded-2xl shadow-lg shadow-pink-500/20">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('profile.addresses')}</h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Monitor your current matrix position</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsAddingAddress(true)}
                                        className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
                                    >
                                        <Save className="w-4 h-4" />
                                        {t('profile.addAddress')}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {addresses.map((addr: Address, index: number) => (
                                        <div key={index} className="p-6 bg-slate-50/50 dark:bg-pink-500/5 rounded-[2rem] border-2 border-pink-500/20 relative group">
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                {addr.isDefault && <span className="px-3 py-1 bg-pink-500 text-white text-[8px] font-black uppercase rounded-full tracking-widest">Default</span>}
                                                <button
                                                    onClick={() => handleDeleteAddress(index)}
                                                    className="p-1 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{addr.type} Network</h4>
                                            <p className="text-xs text-slate-500 font-bold leading-relaxed">
                                                {addr.street}<br />
                                                {addr.city}, {addr.state} {addr.zip}
                                            </p>
                                        </div>
                                    ))}
                                    {addresses.length === 0 && (
                                        <div className="col-span-full py-12 text-center bg-slate-50/30 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                                            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-sm font-bold text-slate-400">No live coordinates recorded.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Plant Reminders Content */}
                    {activeTab === 'reminders' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="glass-card p-10 bg-white/80 dark:bg-slate-900 border border-slate-100 dark:border-pink-500/10 shadow-xl rounded-[3rem]">
                                <div className="flex items-center gap-4 mb-10 border-b border-slate-50 dark:border-pink-500/5 pb-6">
                                    <div className="p-3 bg-pink-500 text-white rounded-2xl shadow-lg shadow-pink-500/20">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('profile.reminders')}</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Configure your growth protocols</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-8 bg-slate-50 dark:bg-pink-500/5 rounded-[2.5rem] border border-slate-100 dark:border-pink-500/10 transition-all hover:bg-white dark:hover:bg-pink-500/10">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
                                                    <Zap className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Water Scheduling</h4>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Hydration cycles</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleWaterToggle}
                                                aria-label={waterReminderOn ? 'Turn off water reminder' : 'Turn on water reminder'}
                                                className={cn(
                                                    "w-14 h-8 rounded-full relative cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-pink-500/20",
                                                    waterReminderOn
                                                        ? "bg-pink-500 shadow-lg shadow-pink-500/30"
                                                        : "bg-slate-200 dark:bg-white/10"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300",
                                                    waterReminderOn ? "right-1" : "left-1"
                                                )} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Frequency (Days)</p>
                                                <input
                                                    type="number"
                                                    value={waterFrequency}
                                                    onChange={(e) => setWaterFrequency(Number(e.target.value))}
                                                    className="bg-transparent text-sm font-black text-pink-500 w-full focus:outline-none"
                                                    min="1"
                                                />
                                            </div>
                                            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Transmission</p>
                                                <input
                                                    type="date"
                                                    value={lastWateredDate}
                                                    onChange={(e) => setLastWateredDate(e.target.value)}
                                                    className="bg-transparent text-sm font-black text-slate-400 w-full focus:outline-none"
                                                />
                                            </div>
                                            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 col-span-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reminder Time (Alarm)</p>
                                                <input
                                                    type="time"
                                                    value={waterReminderTime}
                                                    onChange={(e) => setWaterReminderTime(e.target.value)}
                                                    className="bg-transparent text-sm font-black text-pink-500 w-full focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-50 dark:bg-pink-500/5 rounded-[2.5rem] border border-slate-100 dark:border-pink-500/10 transition-all hover:bg-white dark:hover:bg-pink-500/10">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl">
                                                    <Sparkles className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Fertilization Scheduling</h4>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Nutrient injection protocols</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleFertilizerToggle}
                                                aria-label={fertilizerReminderOn ? 'Turn off fertilizer reminder' : 'Turn on fertilizer reminder'}
                                                className={cn(
                                                    "w-14 h-8 rounded-full relative cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-pink-500/20",
                                                    fertilizerReminderOn
                                                        ? "bg-pink-500 shadow-lg shadow-pink-500/30"
                                                        : "bg-slate-200 dark:bg-white/10"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300",
                                                    fertilizerReminderOn ? "right-1" : "left-1"
                                                )} />
                                            </button>
                                        </div>
                                        <div className={cn("grid grid-cols-2 gap-4 transition-opacity duration-300", fertilizerReminderOn ? "opacity-100" : "opacity-50")}>
                                            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Frequency</p>
                                                <input
                                                    type="text"
                                                    value={fertilizerFrequency}
                                                    onChange={(e) => setFertilizerFrequency(e.target.value)}
                                                    disabled={!fertilizerReminderOn}
                                                    className="bg-transparent text-sm font-black text-slate-400 w-full focus:outline-none"
                                                />
                                            </div>
                                            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Protocol</p>
                                                <input
                                                    type="date"
                                                    value={nextFertilizerDate}
                                                    onChange={(e) => setNextFertilizerDate(e.target.value)}
                                                    disabled={!fertilizerReminderOn}
                                                    className="bg-transparent text-sm font-black text-slate-400 w-full focus:outline-none"
                                                />
                                            </div>
                                            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 col-span-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reminder Time (Alarm)</p>
                                                <input
                                                    type="time"
                                                    value={fertilizerReminderTime}
                                                    onChange={(e) => setFertilizerReminderTime(e.target.value)}
                                                    disabled={!fertilizerReminderOn}
                                                    className="bg-transparent text-sm font-black text-pink-500 w-full focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-slate-50 dark:bg-pink-500/5 rounded-[2.5rem] border border-slate-100 dark:border-pink-500/10 transition-all hover:bg-white dark:hover:bg-pink-500/10 mt-6">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl">
                                                <Sliders className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Ringtone Settings</h4>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Notification & Alarm Audio</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">Notification Sound</span>
                                                    <button
                                                        onClick={() => setRingtoneSettings(prev => ({ ...prev, notificationSoundEnabled: !prev.notificationSoundEnabled }))}
                                                        className={cn(
                                                            "w-12 h-6 rounded-full relative transition-all",
                                                            ringtoneSettings.notificationSoundEnabled ? "bg-pink-500" : "bg-slate-200 dark:bg-white/10"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                            ringtoneSettings.notificationSoundEnabled ? "right-1" : "left-1"
                                                        )} />
                                                    </button>
                                                </div>
                                                <select
                                                    value={ringtoneSettings.selectedNotificationRingtone}
                                                    onChange={(e) => {
                                                        const newVal = e.target.value as NotificationPreset;
                                                        setRingtoneSettings(prev => ({ ...prev, selectedNotificationRingtone: newVal }));
                                                        playNotification(newVal);
                                                    }}
                                                    className="w-full bg-white/50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-3 text-xs font-bold focus:outline-none"
                                                >
                                                    <option value="Neural Ping">Neural Ping</option>
                                                    <option value="Digital Chime">Digital Chime</option>
                                                    <option value="Soft Pop">Soft Pop</option>
                                                    <option value="Custom">Custom Source</option>
                                                </select>
                                                {ringtoneSettings.selectedNotificationRingtone === "Custom" && (
                                                    <div className="mt-2">
                                                        <input
                                                            type="file"
                                                            accept="audio/*"
                                                            ref={notificationInputRef}
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    loadCustomAudioFromFile('notification', file).then(() => {
                                                                        playNotification("Custom");
                                                                    }).catch(() => {
                                                                        addNotification({ title: "Audio Error", description: "Failed to load custom audio.", type: "alert" })
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => notificationInputRef.current?.click()}
                                                            className="w-full py-2 bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                                        >
                                                            {customNotificationName ? `Selected: ${customNotificationName}` : "Choose Audio File"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">Alarm Sound</span>
                                                    <button
                                                        onClick={() => setRingtoneSettings(prev => ({ ...prev, alarmSoundEnabled: !prev.alarmSoundEnabled }))}
                                                        className={cn(
                                                            "w-12 h-6 rounded-full relative transition-all",
                                                            ringtoneSettings.alarmSoundEnabled ? "bg-pink-500" : "bg-slate-200 dark:bg-white/10"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                            ringtoneSettings.alarmSoundEnabled ? "right-1" : "left-1"
                                                        )} />
                                                    </button>
                                                </div>
                                                <select
                                                    value={ringtoneSettings.selectedAlarmRingtone}
                                                    onChange={(e) => {
                                                        const newVal = e.target.value as AlarmPreset;
                                                        setRingtoneSettings(prev => ({ ...prev, selectedAlarmRingtone: newVal }));
                                                        stopAlarm(); // stop previous if playing
                                                        if (newVal === "Custom") {
                                                            alarmInputRef.current?.click();
                                                        } else {
                                                            setTimeout(() => playAlarm(newVal), 100);
                                                        }
                                                    }}
                                                    className="w-full bg-white/50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-3 text-xs font-bold focus:outline-none"
                                                >
                                                    <option value="Classic Pulse">Classic Pulse</option>
                                                    <option value="Hydration Alert">Hydration Alert</option>
                                                    <option value="Bio-Rhythm">Bio-Rhythm</option>
                                                    <option value="Custom">{customAlarmName ? `Custom: ${customAlarmName}` : "Choose Audio File..."}</option>
                                                </select>
                                                {ringtoneSettings.selectedAlarmRingtone === "Custom" && (
                                                    <div className="mt-2">
                                                        <input
                                                            type="file"
                                                            accept="audio/*"
                                                            ref={alarmInputRef}
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    loadCustomAudioFromFile('alarm', file).then(() => {
                                                                        stopAlarm();
                                                                        setTimeout(() => playAlarm("Custom"), 100);
                                                                    }).catch(() => {
                                                                        addNotification({ title: "Audio Error", description: "Failed to load custom alarm.", type: "alert" })
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => alarmInputRef.current?.click()}
                                                            className="w-full py-2 bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Music className="w-3 h-3" />
                                                            {customAlarmName ? `Change: ${customAlarmName}` : "Browse Files..."}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10 flex justify-end gap-4">
                                    <button
                                        onClick={handleSavePlantCare}
                                        disabled={isSyncing}
                                        className="flex items-center gap-2 px-8 py-4 bg-pink-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-pink-500/20"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSyncing ? 'Synchronizing...' : 'Save Growth Protocols'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Daily Routine Content */}
                    {activeTab === 'routine' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="glass-card p-10 bg-white/80 dark:bg-slate-900 border border-slate-100 dark:border-pink-500/10 shadow-xl rounded-[3rem]">
                                <div className="flex items-center gap-4 mb-10 border-b border-slate-50 dark:border-pink-500/5 pb-6">
                                    <div className="p-3 bg-pink-500 text-white rounded-2xl shadow-lg shadow-pink-500/20">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Daily Routine</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Your personalized plant care protocols</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-8 bg-slate-50 dark:bg-pink-500/5 rounded-[2.5rem] border border-slate-100 dark:border-pink-500/10 transition-all hover:bg-white dark:hover:bg-pink-500/10">
                                        <div className="mb-6">
                                            <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">Care Rules & Schedule</h4>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Define your automated routine rules here</p>
                                        </div>
                                        <textarea
                                            value={dailyRoutineContent}
                                            onChange={(e) => setDailyRoutineContent(e.target.value)}
                                            placeholder="Example:&#10;Morning: Check soil moisture&#10;Evening: Mist leaves if humidity < 40%"
                                            className="w-full h-64 p-6 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 text-sm focus:outline-none focus:ring-4 focus:ring-pink-500/10 resize-none font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="mt-10 flex justify-end">
                                    <button
                                        onClick={handleSavePlantCare}
                                        disabled={isSyncing}
                                        className="flex items-center gap-2 px-8 py-4 bg-pink-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-pink-500/20"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSyncing ? 'Synchronizing...' : 'Save Routine'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* AI Scanner Settings Content */}
                    {activeTab === 'scannerSettings' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="glass-card p-10 bg-white/80 dark:bg-slate-900 border border-slate-100 dark:border-pink-500/10 shadow-xl rounded-[3rem]">
                                <div className="flex items-center gap-4 mb-10 border-b border-slate-50 dark:border-pink-500/5 pb-6">
                                    <div className="p-3 bg-pink-500 text-white rounded-2xl shadow-lg shadow-pink-500/20">
                                        <Settings className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('profile.scannerSettings')}</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Neural scanner configuration</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {[
                                        { title: "Camera Option", desc: "Select primary neural input device", icon: Camera, key: 'cameraOption' as const },
                                        { title: "Auto Plant Detection", desc: "Real-time specimen identification", icon: Search, key: 'autoPlantDetection' as const },
                                        { title: "Save in Google Drive", desc: "Backup neural scans to cloud matrix", icon: Save, key: 'saveInGoogleDrive' as const }
                                    ].map((opt) => (
                                        <div key={opt.title} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-pink-500/5 rounded-[2rem] border border-slate-100 dark:border-pink-500/10 transition-all hover:bg-white dark:hover:bg-pink-500/10 group">
                                            <div className="flex items-center gap-5">
                                                <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl group-hover:scale-110 transition-transform">
                                                    <opt.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{opt.title}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">{opt.desc}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleUpdateScanner(opt.key)}
                                                className={cn(
                                                    "w-14 h-8 rounded-full relative cursor-pointer transition-all",
                                                    scannerSettings[opt.key] ? "bg-pink-500 shadow-lg shadow-pink-500/20" : "bg-slate-200 dark:bg-white/10"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all",
                                                    scannerSettings[opt.key] ? "right-1" : "left-1"
                                                )} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Theme Content */}
                    {activeTab === 'theme' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="glass-card p-10 bg-white/80 dark:bg-slate-900 border border-slate-100 dark:border-pink-500/10 shadow-xl rounded-[3rem]">
                                <div className="flex items-center gap-4 mb-10 border-b border-slate-50 dark:border-pink-500/5 pb-6">
                                    <div className="p-3 bg-pink-500 text-white rounded-2xl shadow-lg shadow-pink-500/20">
                                        <Sliders className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('profile.theme')}</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Customize your visual interface</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={cn(
                                            "flex items-center justify-between p-8 rounded-[2.5rem] border-2 group transition-all",
                                            theme === 'dark'
                                                ? "bg-slate-50 dark:bg-pink-500/5 border-pink-500"
                                                : "bg-white/50 dark:bg-white/5 border-transparent hover:bg-white dark:hover:bg-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "p-4 rounded-2xl shadow-lg transition-colors",
                                                theme === 'dark' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            )}>
                                                <Zap className="w-6 h-6" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className={cn(
                                                    "text-lg font-black tracking-tight italic",
                                                    theme === 'dark' ? "text-slate-900 dark:text-white" : "text-slate-400"
                                                )}>Dark Mode</h4>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">High Contrast Neural View</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-4 transition-all",
                                            theme === 'dark' ? "border-pink-500 bg-pink-500" : "border-slate-200 dark:border-white/20"
                                        )} />
                                    </button>

                                    <button
                                        onClick={() => setTheme('light')}
                                        className={cn(
                                            "flex items-center justify-between p-8 rounded-[2.5rem] border-2 group transition-all",
                                            theme === 'light'
                                                ? "bg-slate-50 dark:bg-pink-500/5 border-pink-500"
                                                : "bg-white/50 dark:bg-white/5 border-transparent hover:bg-white dark:hover:bg-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "p-4 rounded-2xl shadow-lg transition-colors",
                                                theme === 'light' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                            )}>
                                                <Sparkles className="w-6 h-6" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className={cn(
                                                    "text-lg font-black tracking-tight italic",
                                                    theme === 'light' ? "text-slate-900 dark:text-white" : "text-slate-400"
                                                )}>Lite Mode</h4>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Standard Visual Spectrum</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-4 transition-all",
                                            theme === 'light' ? "border-pink-500 bg-pink-500" : "border-slate-200 dark:border-white/20"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* About Developer Content */}
                    {activeTab === 'aboutDeveloper' && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                            <div className="glass-card p-10 bg-white/80 dark:bg-slate-900 border border-slate-100 dark:border-pink-500/10 shadow-2xl rounded-[3rem] relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-pink-500 to-rose-600" />

                                <div className="flex flex-col items-center text-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center shadow-xl shadow-pink-500/20 mb-6">
                                        <UserIcon className="w-12 h-12 text-white" />
                                    </div>

                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Amit Sharma</h3>
                                    <p className="text-pink-500 font-black uppercase tracking-[0.2em] text-xs mt-2">Lead Developer</p>

                                    <div className="w-full h-[1px] bg-slate-100 dark:bg-white/5 my-8" />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full text-left">
                                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <Trophy className="w-3 h-3 text-pink-500" />
                                                Role
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Software Developer</p>
                                        </div>

                                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <Zap className="w-3 h-3 text-pink-500" />
                                                Education
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">B.Tech in CSE</p>
                                        </div>

                                        {/* Email with Copy */}
                                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2 group relative">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <Bell className="w-3 h-3 text-pink-500" />
                                                Matrix ID
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate mr-2">
                                                    kumaramitbth2005@gmail.com
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText('kumaramitbth2005@gmail.com');
                                                        addNotification({ title: 'Email Copied', description: 'Address copied to clipboard.', type: 'info' });
                                                    }}
                                                    className="p-2 hover:bg-pink-500/10 rounded-lg text-pink-500 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Phone with Copy */}
                                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2 group relative">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <RefreshCw className="w-3 h-3 text-pink-500" />
                                                Secure Link
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    +91 8969401902
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText('+91 8969401902');
                                                        addNotification({ title: 'Number Copied', description: 'Contact number copied to clipboard.', type: 'info' });
                                                    }}
                                                    className="p-2 hover:bg-pink-500/10 rounded-lg text-pink-500 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full">
                                        <button
                                            onClick={() => setActiveTab('profile')}
                                            className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black text-slate-600 dark:text-slate-400 text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                                        >
                                            Return to Profile
                                        </button>
                                        <button
                                            onClick={() => window.open('mailto:kumaramitbth2005@gmail.com')}
                                            className="flex-1 py-4 bg-pink-500 shadow-xl shadow-pink-500/20 rounded-2xl font-black text-white text-xs uppercase tracking-widest hover:bg-pink-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            Establish Uplink
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Live Camera Modal */}
            {isCameraOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-pink-500/20 rounded-[2.5rem] p-6 sm:p-8 w-full max-w-md shadow-2xl flex flex-col items-center">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 w-full text-center flex items-center justify-center gap-2">
                            <Camera className="w-6 h-6 text-pink-500" />
                            Live Camera
                        </h3>
                        <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden bg-black mb-6 border border-slate-200 dark:border-white/10 shadow-inner">
                            <video ref={videoRef} muted autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex gap-4 w-full mt-2">
                            <button onClick={stopCamera} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95">Cancel</button>
                            <button onClick={capturePhoto} className="flex-1 py-4 bg-pink-500 shadow-xl shadow-pink-500/20 rounded-2xl font-black text-white text-xs uppercase tracking-widest hover:bg-pink-600 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Camera className="w-4 h-4" />
                                Capture
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Image Editor Modal */}
            {editImageFile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-pink-500/20 rounded-[2.5rem] w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                        {/* Sticky Header */}
                        <div className="p-6 sm:p-8 flex-none flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Sliders className="w-5 h-5 text-pink-500" />
                                Image Editor
                            </h3>
                            <button onClick={() => setEditImageFile(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-2xl leading-none">&times;</button>
                        </div>

                        {/* Sticky Photo Section */}
                        <div className="flex-none p-6 pb-2 sm:p-8 sm:pb-4 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 rounded-t-[2.5rem]">
                            <div
                                ref={previewContainerRef}
                                className="aspect-square mx-auto w-full max-w-[200px] sm:max-w-[240px] rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-white/5 relative shadow-inner cursor-move touch-none"
                                onMouseDown={handleDragStart}
                                onMouseMove={handleDragMove}
                                onMouseUp={handleDragEnd}
                                onMouseLeave={handleDragEnd}
                                onWheel={handleWheel}
                                onTouchStart={handleDragStart}
                                onTouchMove={handleDragMove}
                                onTouchEnd={handleDragEnd}
                            >
                                <img
                                    src={editImageFile}
                                    alt="Preview"
                                    className="absolute pointer-events-none select-none origin-center max-w-none max-h-none"
                                    style={{
                                        ...(imageDims ? (
                                            (imageDims.width / imageDims.height) > 1
                                                ? { height: '100%', width: `${(imageDims.width / imageDims.height) * 100}%` }
                                                : { width: '100%', height: `${(imageDims.height / imageDims.width) * 100}%` }
                                        ) : {}),
                                        filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px) sepia(${filters.sepia}%)`,
                                        transform: `translate(calc(-50% + ${crop.panX}px), calc(-50% + ${crop.panY}px)) scale(${crop.zoom})`,
                                        left: '50%',
                                        top: '50%'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Sticky Heading */}
                        <div className="flex-none px-6 sm:px-8 pt-6 pb-4 bg-white dark:bg-slate-900 z-10 border-b border-slate-100 dark:border-white/5 relative">
                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <Sliders className="w-3 h-3 text-pink-500" />
                                Crop & Position
                            </h4>
                        </div>

                        {/* Scrollable Sliders Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-8 py-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                        <div className="flex items-center gap-3">
                                            <span>Zoom Scale</span>
                                            <button
                                                onClick={handleFitPerfect}
                                                className="px-2 py-1 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 rounded-md transition-all active:scale-95 flex items-center gap-1"
                                                title="Fit image perfectly in frame"
                                            >
                                                <Search className="w-3 h-3" /> Fit Frame
                                            </button>
                                        </div>
                                        <span className="text-pink-500">{crop.zoom.toFixed(1)}x</span>
                                    </div>
                                    <input type="range" min="1" max="10" step="0.05" value={crop.zoom} onChange={e => setCrop({ ...crop, zoom: Number(e.target.value) })} className="w-full accent-pink-500 hover:accent-pink-400" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <span>Manual Pan X</span>
                                        <span className="text-pink-500">{Math.round(crop.panX)}px</span>
                                    </div>
                                    <input type="range" min="-400" max="400" value={crop.panX} onChange={e => setCrop({ ...crop, panX: Number(e.target.value) })} className="w-full accent-pink-500 hover:accent-pink-400" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <span>Manual Pan Y</span>
                                        <span className="text-pink-500">{Math.round(crop.panY)}px</span>
                                    </div>
                                    <input type="range" min="-400" max="400" value={crop.panY} onChange={e => setCrop({ ...crop, panY: Number(e.target.value) })} className="w-full accent-pink-500 hover:accent-pink-400" />
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer Buttons */}
                        <div className="p-6 sm:p-8 flex-none flex gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t border-slate-100 dark:border-white/5">
                            <button disabled={isUploading} onClick={() => setEditImageFile(null)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50">Cancel</button>
                            <button disabled={isUploading} onClick={handleSaveEditedImage} className="flex-1 py-4 bg-pink-500 shadow-xl shadow-pink-500/20 rounded-2xl font-black text-white text-xs uppercase tracking-widest hover:bg-pink-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                                {isUploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : null}
                                {isUploading ? "Uploading..." : "Save as Profile Picture"}
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-rose-500/20 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-500 to-red-600" />

                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                            <Trash2 className="w-10 h-10 text-rose-500" />
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Delete Profile Picture?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-8">
                            This action cannot be undone. Your visual identity will be reset to the default system avatar.
                        </p>

                        <div className="flex gap-4 w-full">
                            <button disabled={isDeleting} onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50">Cancel</button>
                            <button disabled={isDeleting} onClick={handleDeletePhoto} className="flex-1 py-4 bg-rose-500 shadow-xl shadow-rose-500/20 rounded-2xl font-black text-white text-xs uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* Add Address Modal */}
            {isAddingAddress && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-pink-500/20 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-pink-500 to-rose-600" />
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Register New Node</h3>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Node Type</label>
                                <select
                                    value={newAddress.type}
                                    onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="home">Home Network</option>
                                    <option value="work">Work Network</option>
                                    <option value="other">Other Outpost</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Street Address</label>
                                <input
                                    type="text"
                                    value={newAddress.street}
                                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500"
                                    placeholder="Neural Street 123"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">City</label>
                                    <input
                                        type="text"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500"
                                        placeholder="Matrix City"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">State</label>
                                    <input
                                        type="text"
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500"
                                        placeholder="CA"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ZIP Code</label>
                                <input
                                    type="text"
                                    value={newAddress.zip}
                                    onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500"
                                    placeholder="94043"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 w-full mt-10">
                            <button onClick={() => setIsAddingAddress(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95">Cancel</button>
                            <button onClick={handleAddAddress} className="flex-1 py-4 bg-pink-500 shadow-xl shadow-pink-500/20 rounded-2xl font-black text-white text-xs uppercase tracking-widest hover:bg-pink-600 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" />
                                Save Node
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
