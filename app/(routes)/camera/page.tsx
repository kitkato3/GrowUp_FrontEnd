"use client"

import { Camera, X, Download, Trash2 } from "lucide-react"
import React, { useState, useEffect } from "react"

interface PlantDetection { name: string; status: string; color: 'emerald' | 'amber'; }
interface Snapshot { id: number; date: string; time: string; thumbnail: string; }
interface SettingsState { resolution: string; fps: number; brightness: number; contrast: number; detectionSensitivity: number; autoFocus: boolean; nightMode: boolean; motionDetection: boolean; }
interface ToastProps { message: string; visible: boolean; color: 'success' | 'info' | 'warning' | 'default'; onClose: () => void; }

const PLANT_DETECTIONS: PlantDetection[] = [
    { name: "Kale #1", status: "Healthy", color: "emerald" },
    { name: "Kale #2", status: "Growing", color: "emerald" },
    { name: "Kale #3", status: "Needs Water", color: "amber" },
    { name: "Kale #4", status: "Healthy", color: "emerald" }
]

const GALLERY_SNAPSHOTS: Snapshot[] = [
    { id: 1, date: "2024-11-19", time: "08:00 AM", thumbnail: "🌱" },
    { id: 2, date: "2024-11-18", time: "08:00 AM", thumbnail: "🌿" },
    { id: 3, date: "2024-11-17", time: "08:00 AM", thumbnail: "🥬" },
    { id: 4, date: "2024-11-16", time: "08:00 AM", thumbnail: "🍃" },
    { id: 5, date: "2024-11-15", time: "08:00 AM", thumbnail: "🌱" },
    { id: 6, date: "2024-11-14", time: "08:00 AM", thumbnail: "🌿" },
]

const Toast: React.FC<ToastProps> = ({ message, visible, color, onClose }) => {
    if (!visible) return null;

    const baseClasses =
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 z-[100] flex items-center space-x-3";

    let colorClasses = "";
    switch (color) {
        case 'success': colorClasses = "bg-emerald-600 text-white"; break;
        case 'info': colorClasses = "bg-blue-600 text-white"; break;
        case 'warning': colorClasses = "bg-amber-600 text-white"; break;
        default: colorClasses = "bg-gray-800 text-white";
    }

    return (
        <div className={`${baseClasses} ${colorClasses}`}>
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function App() {

    const [currentTime, setCurrentTime] = useState<Date>(new Date())
    const [showSettings, setShowSettings] = useState<boolean>(false)
    const [showGallery, setShowGallery] = useState<boolean>(false)
    const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null)

    const [settings, setSettings] = useState<SettingsState>({
        resolution: "1080p",
        fps: 30,
        brightness: 50,
        contrast: 50,
        detectionSensitivity: 75,
        autoFocus: true,
        nightMode: false,
        motionDetection: true,
    })

    const [toast, setToast] = useState<{
        message: string;
        visible: boolean;
        color: 'success' | 'info' | 'warning' | 'default';
    }>({ message: '', visible: false, color: 'info' });

    const showToast = (
        message: string,
        color: 'success' | 'info' | 'warning' | 'default' = 'info'
    ) => {
        setToast({ message, visible: true, color });
        setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSettingChange = (key: keyof SettingsState, value: string | number | boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const handleSnapshot = () => {
        setShowGallery(true);
        showToast("Snapshot gallery opened!", 'info');
    }

    const handleRecord = () => {
        showToast("Recording started! Tap the button again to stop.", 'info');
    }

    const handleZoom = () => {
        showToast("Zoom controls activated. Adjust using the virtual slider.", 'info');
    }

    const handleSaveSettings = () => {
        setShowSettings(false);
        showToast("Settings saved successfully!", 'success');
    }

    const handleDownload = () => {
        showToast("Download requested. Preparing file...", 'success');
    }

    const handleDelete = () => {
        showToast("Snapshot deleted successfully.", 'warning');
        setSelectedSnapshot(null);
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="space-y-5 pb-24">

                <h1 className="text-3xl font-extrabold text-gray-800 pt-2">
                    Hydroponic Camera Monitor
                </h1>
                <p className="text-gray-500 -mt-3">
                    Real-time surveillance and health analysis for your Kale Tower.
                </p>

                {/* Camera Feed */}
                <div className="bg-gray-900 rounded-2xl aspect-square relative overflow-hidden group shadow-xl">

                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 flex items-center justify-center">
                        <div className="text-center text-white">
                            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <div className="text-lg font-semibold">Live Kale Tower Feed</div>
                            <div className="text-sm opacity-70">AI Plant Detection Active</div>
                        </div>
                    </div>

                    <div className="absolute top-4 right-4 bg-red-500 w-4 h-4 rounded-full animate-pulse shadow-md"></div>

                    <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-2 rounded-lg text-white backdrop-blur-sm">
                        <div className="text-sm font-semibold font-mono">
                            {currentTime.toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-gray-300">
                            {settings.resolution} • {settings.fps}fps • Live
                        </div>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-emerald-600/90 px-3 py-2 rounded-lg text-white font-semibold shadow-md backdrop-blur-sm">
                        <div className="text-xs">4 Kales Detected</div>
                    </div>
                </div>

                {/* AI Detection */}
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 border-b pb-2">
                        <span className="text-emerald-500">AI</span> Plant Health Status
                    </h3>

                    <div className="space-y-3">
                        {PLANT_DETECTIONS.map((plant, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center justify-between p-3 rounded-xl transition-shadow ${plant.color === "emerald"
                                        ? "bg-emerald-50 border border-emerald-200 hover:shadow-md"
                                        : "bg-amber-50 border border-amber-200 hover:shadow-md"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full shadow-inner ${plant.color === "emerald"
                                            ? "bg-emerald-500"
                                            : "bg-amber-500"
                                        }`}></div>
                                    <span className="font-medium text-gray-900">
                                        {plant.name}
                                    </span>
                                </div>

                                <span
                                    className={`text-xs font-semibold px-2 py-1 rounded-full ${plant.color === "emerald"
                                            ? "text-emerald-800 bg-emerald-200"
                                            : "text-amber-800 bg-amber-200"
                                        }`}
                                >
                                    {plant.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Center */}
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 border-b pb-2">
                        Action Center
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleSnapshot} className="p-4 bg-emerald-100 hover:bg-emerald-200 rounded-xl font-bold text-emerald-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
                            📸 Gallery
                        </button>
                        <button onClick={handleRecord} className="p-4 bg-blue-100 hover:bg-blue-200 rounded-xl font-bold text-blue-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
                            🎥 Record
                        </button>
                        <button onClick={handleZoom} className="p-4 bg-purple-100 hover:bg-purple-200 rounded-xl font-bold text-purple-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
                            🔍 Zoom
                        </button>
                        <button onClick={() => setShowSettings(true)} className="p-4 bg-orange-100 hover:bg-orange-200 rounded-xl font-bold text-orange-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
                            ⚙️ Settings
                        </button>
                    </div>
                </div>
            </div>

            <Toast
                message={toast.message}
                visible={toast.visible}
                color={toast.color}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />

            {showGallery && !selectedSnapshot && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    {/* gallery modal content goes here */}
                </div>
            )}

            {selectedSnapshot && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    {/* full snapshot view */}
                </div>
            )}

            {showSettings && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    {/* settings modal */}
                </div>
            )}

        </div>
    );
}
