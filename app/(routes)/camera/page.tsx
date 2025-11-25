"use client"

import { Camera, X, Download, Trash2, Maximize2, Home, BarChart3, Settings } from "lucide-react"
import React, { useState, useEffect, useCallback } from "react"
// Removed Next.js imports: Link and usePathname are replaced by local state and Div/Button elements.

// --- CONFIGURATION ---
const API_BASE_URL = "http://192.168.1.100:5000/api/v1"; // <<< CRITICAL: CHANGE THIS TO YOUR RASPI 5 IP AND PORT >>>
const LIVE_STREAM_URL = "http://192.168.1.100:8080/stream"; // <<< CRITICAL: USE YOUR ACTUAL LIVE STREAM URL (e.g., mjpeg stream) >>>

// --- TYPE DEFINITIONS ---
type ScreenId = 'dashboard' | 'analytics' | 'camera' | 'settings';
interface PlantDetection { id: string; name: string; status: string; color: 'emerald' | 'amber'; }
interface Snapshot { id: number; date: string; time: string; thumbnail: string; image_url: string; }
interface SettingsState { resolution: string; fps: number; brightness: number; contrast: number; detectionSensitivity: number; autoFocus: boolean; nightMode: boolean; motionDetection: boolean; }
interface ToastProps { message: string; visible: boolean; color: 'success' | 'info' | 'warning' | 'default'; onClose: () => void; }
interface BackendData { detections: PlantDetection[]; snapshots: Snapshot[]; currentSettings: SettingsState; }


// --- INITIAL EMPTY STATES ---
const EMPTY_SETTINGS: SettingsState = {
    resolution: "Connecting...",
    fps: 0,
    brightness: 0,
    contrast: 0,
    detectionSensitivity: 0,
    autoFocus: false,
    nightMode: false,
    motionDetection: false,
}

// --- Helper Functions (No changes) ---
const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const formatted = [h, m, s]
        .map(v => v.toString().padStart(2, '0'))
        .filter((v, i) => v !== "00" || i > 0 || h > 0)
        .join(":");
    return formatted.startsWith("0") && formatted.length > 2 ? formatted.substring(1) : formatted;
}

const simulateDownloadFn = (mimeType: string, filename: string, contentLabel: string, duration?: number): void => {
    let mockContent = `Mock ${contentLabel} data captured at ${new Date().toLocaleString()}.`;
    if (duration) { mockContent += ` Duration: ${formatDuration(duration)}.`; }
    const blob = new Blob([mockContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);

    setTimeout(() => {
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 10);
}


// --- Custom Hook for API Abstraction (No changes) ---
const useApi = () => {
    const apiCall = useCallback(async (endpoint: string, options?: RequestInit) => {
        const url = `${API_BASE_URL}${endpoint}`;
        try {
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                ...options,
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText.substring(0, 100)}`);
            }
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error("API Call Error:", url, error);
            throw error;
        }
    }, []);

    return { apiCall };
};

// --- Toast Component (No changes) ---
const Toast: React.FC<ToastProps> = ({ message, visible, color, onClose }) => {
    if (!visible) return null;

    const baseClasses = "fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 z-[100] flex items-center space-x-3";
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
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20"><X className="w-4 h-4" /></button>
        </div>
    );
};

// --- Navbar Component (No changes) ---
const Navbar: React.FC<{ time: string }> = ({ time }) => (
    <div className="bg-white px-4 py-2.5 flex items-center justify-between text-sm border-b border-gray-100 sticky top-0 z-40">
        <span className="font-bold text-gray-900">GROWUP</span>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">{time}</span>
        </div>
    </div>
);

// --- Bottom Navigation Component (No changes) ---
const BottomNavigation: React.FC<{ activeTab: ScreenId; setActiveTab: (id: ScreenId) => void }> = ({ activeTab, setActiveTab }) => {
    const tabs: { id: ScreenId; label: string; icon: React.ElementType }[] = [
        { id: "dashboard", label: "Home", icon: Home },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "camera", label: "Camera", icon: Camera },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="flex items-center justify-around py-3">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all cursor-pointer ${isActive ? "text-emerald-600 bg-emerald-50" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <Icon className="w-5 h-5 mb-1" />
                            <span className="text-xs font-semibold">{tab.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    const { apiCall } = useApi();
    const [currentTime, setCurrentTime] = useState<Date>(new Date())

    // NEW: State for current screen
    const [currentScreen, setCurrentScreen] = useState<ScreenId>('camera');

    // NEW STATE: Tracks if the Camera Feed is successfully connected and active.
    const [isPiCameraActive, setIsPiCameraActive] = useState<boolean>(false);

    // API-Driven States, initialized to empty or connecting states
    const [plantDetections, setPlantDetections] = useState<PlantDetection[]>([]);
    const [gallerySnapshots, setGallerySnapshots] = useState<Snapshot[]>([]);
    const [settings, setSettings] = useState<SettingsState>(EMPTY_SETTINGS);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // UI States
    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)
    const [showGallery, setShowGallery] = useState<boolean>(false)
    const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null)
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordingDuration, setRecordingDuration] = useState<number>(0);
    const [zoomLevel, setZoomLevel] = useState<number>(1.0);
    const [showZoomControls, setShowZoomControls] = useState<boolean>(false);

    const [toast, setToast] = useState<{ message: string; visible: boolean; color: 'success' | 'info' | 'warning' | 'default' }>({ message: '', visible: false, color: 'info' });

    const showToast = useCallback((message: string, color: 'success' | 'info' | 'warning' | 'default' = 'info'): void => {
        setToast({ message, visible: true, color });
        setTimeout(() => { setToast(prev => ({ ...prev, visible: false })); }, 3000);
    }, []);

    // --- EFFECT: Initial Data Fetch and Timer ---
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const data: BackendData = await apiCall("/status");
                setPlantDetections(data.detections || []);
                setGallerySnapshots(data.snapshots || []);
                setSettings(data.currentSettings);

                if (data.currentSettings.resolution !== "Connecting...") {
                    setIsPiCameraActive(true);
                    showToast("✅ Connected to Raspi Camera!", 'success');
                } else {
                    setIsPiCameraActive(false);
                    showToast("⚠️ Raspi connected, but camera is inactive.", 'warning');
                }

            } catch (error) {
                console.error("Connection error:", error);
                setIsPiCameraActive(false);
                showToast("🔴 Failed to connect to API. Is the server running?", 'warning');
                setSettings(EMPTY_SETTINGS);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
        const interval = setInterval(() => { setCurrentTime(new Date()) }, 1000)
        return () => clearInterval(interval)
    }, [apiCall, showToast]);


    // --- EFFECT: Recording Timer (No changes) ---
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isRecording) {
            interval = setInterval(() => { setRecordingDuration(prevDuration => prevDuration + 1); }, 1000);
        } else if (!isRecording && recordingDuration > 0) {
            if (interval) clearInterval(interval);

            if (recordingDuration >= 3) {
                simulateDownloadFn('video/mp4', `kale_video_${new Date().toISOString()}.mp4`, 'Recorded Video', recordingDuration);
            } else if (recordingDuration > 0) {
                showToast("Recording too short, file discarded.", 'warning');
            }
            setRecordingDuration(0);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isRecording, recordingDuration, showToast]);


    // --- API HANDLERS (No changes to the core logic) ---
    const handleSettingChange = (key: keyof SettingsState, value: string | number | boolean): void => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const handleSnapshot = async (): Promise<void> => {
        if (!isPiCameraActive) {
            showToast("Camera is not active. Cannot take snapshot.", 'warning');
            return;
        }
        try {
            const newSnapshot: Snapshot = await apiCall("/camera/snapshot", { method: 'POST' });
            setGallerySnapshots(prev => [newSnapshot, ...prev]);
            showToast("📸 Snapshot taken successfully!", 'success');
        } catch (error) {
            showToast("Failed to take snapshot. Check camera connection.", 'warning');
        }
    }

    const handleRecord = async (): Promise<void> => {
        if (!isPiCameraActive) {
            showToast("Camera is not active. Cannot start recording.", 'warning');
            return;
        }
        if (isRecording) {
            setIsRecording(false);
            try {
                await apiCall("/camera/record/stop", { method: 'POST' });
            } catch (error) {
                showToast("Failed to stop recording cleanly.", 'warning');
            }
        } else {
            try {
                await apiCall("/camera/record/start", { method: 'POST' });
                setRecordingDuration(0);
                setIsRecording(true);
                showToast("🎥 Recording started! Click the button again to stop.", 'info');
            } catch (error) {
                showToast("Failed to start recording. System busy?", 'warning');
            }
        }
    }

    const handleZoomToggle = (): void => {
        setShowZoomControls(prev => !prev);
        if (!showZoomControls) {
            showToast("🔍 Zoom controls enabled. Adjust the slider for magnification.", 'info');
        } else {
            showToast("🔍 Zoom controls disabled.", 'info');
        }
    }

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setZoomLevel(Number(e.target.value));
    }


    const handleSaveSettings = async (): Promise<void> => {
        try {
            const updatedSettings: SettingsState = await apiCall("/settings", {
                method: 'PUT',
                body: JSON.stringify(settings)
            });

            setSettings(updatedSettings);
            setShowSettingsModal(false);
            showToast("✅ Settings saved successfully!", 'success');
        } catch (error) {
            showToast("Failed to save settings. Connection error.", 'warning');
        }
    }

    const handleGalleryDownload = (snapshot: Snapshot): void => {
        simulateDownloadFn('image/png', `kale_gallery_snapshot_${snapshot.id}_${snapshot.date.replace(/-/g, '')}.png`, `Gallery Snapshot ID ${snapshot.id}`);
        showToast(`Downloaded & saved: ${snapshot.date}`, 'success');
    }

    const handleDelete = async (): Promise<void> => {
        if (!selectedSnapshot) return;

        try {
            await apiCall(`/gallery/${selectedSnapshot.id}`, { method: 'DELETE' });
            setGallerySnapshots(prev => prev.filter(s => s.id !== selectedSnapshot.id));
            setSelectedSnapshot(null);
            showToast("🗑️ Snapshot deleted successfully.", 'warning');
        } catch (error) {
            showToast("Failed to delete snapshot. Try again.", 'warning');
        }
    }

    // --- SCREEN RENDERING LOGIC ---
    const renderScreenContent = () => {
        const liveFeedContent = isPiCameraActive ? (
            // Live Feed: Pi Camera is Active (show image/mjpeg stream)
            <img
                src={LIVE_STREAM_URL}
                alt="Live Kale Tower Feed"
                className="w-full h-full object-cover"
                style={{ filter: isRecording ? 'brightness(0.9)' : 'brightness(1.0)' }}
            />
        ) : (
            // Static Placeholder: Pi Camera is Inactive (show gradient/icon)
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-rose-900/30 flex items-center justify-center">
                <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <div className="text-lg font-semibold">Live Kale Tower Feed</div>
                    <div className="text-sm opacity-70 text-red-300">Camera Disconnected/Inactive</div>
                </div>
            </div>
        );

        switch (currentScreen) {
            case 'dashboard':
                return (
                    <div className="p-4 text-center bg-white rounded-2xl shadow-xl mt-4">
                        <Home className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                        <h2 className="text-xl font-bold text-gray-800">Dashboard / Home</h2>
                        <p className="text-gray-500 mt-2">Ipinapakita ang pangkalahatang lagay ng iyong Grow Tower. (API Data summary dito)</p>
                    </div>
                );
            case 'analytics':
                return (
                    <div className="p-4 text-center bg-white rounded-2xl shadow-xl mt-4">
                        <BarChart3 className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                        <h2 className="text-xl font-bold text-gray-800">Analytics</h2>
                        <p className="text-gray-500 mt-2">Ipinapakita ang kasaysayan ng paglaki, temperatura, at iba pang graph. (API Historical Data dito)</p>
                    </div>
                );
            case 'settings':
                return (
                    <div className="p-4 text-center bg-white rounded-2xl shadow-xl mt-4">
                        <Settings className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                        <h2 className="text-xl font-bold text-gray-800">Device Settings</h2>
                        <p className="text-gray-500 mt-2">Gamitin ang "Advanced Settings" button upang mabago ang configuration.</p>
                    </div>
                );
            case 'camera':
            default:
                return (
                    <>
                        <h1 className="text-3xl font-extrabold text-gray-800 pt-2">
                            Camera Monitor
                        </h1>
                        <p className="text-gray-500 -mt-3">Real-time surveillance and health analysis for your Kale Tower.</p>

                        {/* Camera Feed */}
                        <div className="bg-gray-900 rounded-2xl aspect-square relative overflow-hidden group shadow-xl">
                            {/* Zoom Wrapper to apply transformation */}
                            <div
                                className="absolute inset-0 transition-transform duration-300 ease-in-out"
                                style={{ transform: `scale(${zoomLevel})` }}
                            >
                                {liveFeedContent}

                                {/* Recording Duration Indicator */}
                                {isRecording && (
                                    <div className="absolute top-4 left-4 bg-red-600/90 text-white px-3 py-1 rounded-xl font-bold text-sm shadow-md backdrop-blur-sm">
                                        REC {formatDuration(recordingDuration)}
                                    </div>
                                )}

                                {/* Live/Recording indicator */}
                                <div className={`absolute top-4 right-4 w-4 h-4 rounded-full shadow-md ${isPiCameraActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>

                                {/* Time and Specs */}
                                <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-2 rounded-lg text-white backdrop-blur-sm">
                                    <div className="text-sm font-semibold font-mono">
                                        {currentTime.toLocaleTimeString()}
                                    </div>
                                    <div className="text-xs text-gray-300">
                                        {settings.resolution} • {settings.fps}fps • {isRecording ? 'Recording' : isPiCameraActive ? 'Live' : 'Inactive'}
                                    </div>
                                </div>
                            </div>

                            {/* Loading Spinner Overlay */}
                            {isLoading && (
                                <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center text-white text-xl font-bold backdrop-blur-sm z-10">
                                    Connecting to Camera... 🔄
                                </div>
                            )}

                        </div>

                        {/* Zoom Slider Controls */}
                        {showZoomControls && (
                            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                                <h3 className="font-bold text-lg text-gray-900 mb-4 border-b pb-2">
                                    Zoom Level: <span className="text-purple-600">{zoomLevel.toFixed(1)}x</span>
                                </h3>
                                <input
                                    type="range"
                                    min="1.0"
                                    max="4.0"
                                    step="0.1"
                                    value={zoomLevel}
                                    onChange={handleZoomChange}
                                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                                <div className="flex justify-between text-sm text-gray-500 mt-2">
                                    <span>1x (Wide)</span>
                                    <span>4x (Macro)</span>
                                </div>
                            </div>
                        )}

                        {/* AI Detection Results */}
                        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900 mb-4 border-b pb-2">
                                <span className="text-emerald-500">AI</span> Plant Health Status
                            </h3>
                            <div className="space-y-3">
                                {isLoading ? (
                                    <p className="text-gray-500 text-sm italic">Loading detection results...</p>
                                ) : plantDetections.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">No plants detected or initialized yet.</p>
                                ) : (
                                    plantDetections.map((plant) => (
                                        <div
                                            key={plant.id}
                                            className={`flex items-center justify-between p-3 rounded-xl transition-shadow ${plant.color === "emerald"
                                                ? "bg-emerald-50 border border-emerald-200 hover:shadow-md"
                                                : "bg-amber-50 border border-amber-200 hover:shadow-md"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-3 h-3 rounded-full shadow-inner ${plant.color === "emerald" ? "bg-emerald-500" : "bg-amber-500"}`}
                                                ></div>
                                                <span className="font-medium text-gray-900">{plant.name}</span>
                                            </div>
                                            <span
                                                className={`text-xs font-semibold px-2 py-1 rounded-full ${plant.color === "emerald" ? "text-emerald-800 bg-emerald-200" : "text-amber-800 bg-amber-200"}`}
                                            >
                                                {plant.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Camera Controls */}
                        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900 mb-4 border-b pb-2">
                                Action Center
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowGallery(true)}
                                    className="p-4 bg-emerald-100 hover:bg-emerald-200 rounded-xl font-bold text-emerald-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                                >
                                    🖼️ Gallery ({gallerySnapshots.length})
                                </button>
                                <button
                                    onClick={handleSnapshot}
                                    className="p-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                                    disabled={isLoading || !isPiCameraActive}
                                >
                                    📸 Take Snapshot
                                </button>
                                <button
                                    onClick={handleRecord}
                                    className={`p-4 rounded-xl font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98] ${isRecording
                                        ? "bg-red-500 hover:bg-red-600 text-white"
                                        : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                                        }`}
                                    disabled={isLoading || !isPiCameraActive}
                                >
                                    {isRecording ? (
                                        <span className="inline-flex items-center gap-2">
                                            <span className="animate-ping inline-block w-3 h-3 bg-white rounded-full"></span>
                                            STOP ({formatDuration(recordingDuration)})
                                        </span>
                                    ) : (
                                        "🎥 Record"
                                    )}
                                </button>
                                <button
                                    onClick={handleZoomToggle}
                                    className={`p-4 rounded-xl font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98] ${showZoomControls
                                        ? "bg-purple-500 hover:bg-purple-600 text-white"
                                        : "bg-purple-100 hover:bg-purple-200 text-purple-700"
                                        }`}
                                >
                                    🔍 Zoom ({zoomLevel.toFixed(1)}x)
                                </button>
                            </div>
                            <button
                                onClick={() => setShowSettingsModal(true)}
                                className="w-full mt-3 p-4 bg-orange-100 hover:bg-orange-200 rounded-xl font-bold text-orange-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                                disabled={isLoading}
                            >
                                ⚙️ Advanced Settings
                            </button>
                        </div>
                    </>
                );
        }
    };

    // --- MAIN RENDER ---

    return (
        <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
            <Navbar time={currentTime.toLocaleTimeString()} />

            <div className="space-y-5 pb-24 px-4 py-5">
                {renderScreenContent()}
            </div>

            <BottomNavigation activeTab={currentScreen} setActiveTab={(id) => {
                // Logic: I-set ang screen ID para lumipat ng content
                setCurrentScreen(id);

                // Logic: Awtomatikong buksan/isara ang Modal
                if (id === 'settings') {
                    setShowSettingsModal(true);
                } else {
                    setShowSettingsModal(false);
                }
            }} />

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                visible={toast.visible}
                color={toast.color}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />

            {/* Gallery Modal */}
            {showGallery && !selectedSnapshot && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10 rounded-t-2xl">
                            <div><h2 className="text-xl font-bold text-gray-900">Snapshot Gallery</h2><p className="text-sm text-gray-500">Daily captures</p></div>
                            <button onClick={() => setShowGallery(false)} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="p-4">
                            {gallerySnapshots.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No snapshots found on the server.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {gallerySnapshots.map((snapshot) => (
                                        <div key={snapshot.id} onClick={() => setSelectedSnapshot(snapshot)} className="bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-emerald-400 transition-all cursor-pointer shadow-md">
                                            <div className="aspect-square bg-gradient-to-br from-emerald-50/50 to-teal-100/50 flex items-center justify-center text-5xl sm:text-6xl">{snapshot.thumbnail}</div>
                                            <div className="p-3 bg-white"><div className="font-semibold text-gray-900 text-sm">{snapshot.date}</div><div className="text-xs text-gray-500">{snapshot.time}</div></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button onClick={() => setShowGallery(false)} className="w-full mt-4 p-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors active:scale-[0.99]">Close Gallery</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Full View Modal */}
            {selectedSnapshot && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="max-w-md w-full h-full max-h-[95vh] flex flex-col">
                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <button onClick={() => setSelectedSnapshot(null)} className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors font-semibold"><span className="text-2xl">←</span>Back to Gallery</button>
                            <button onClick={() => { setSelectedSnapshot(null); setShowGallery(false); }} className="text-white hover:text-red-500 transition-colors p-2 rounded-full"><X className="w-8 h-8" /></button>
                        </div>
                        <div className="bg-white rounded-2xl shadow-2xl overflow-y-auto flex-grow min-h-0">
                            {/* NOTE: You would display the actual image using selectedSnapshot.image_url here */}
                            <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-[8rem] sm:text-[10rem]">{selectedSnapshot.thumbnail}</div>
                            <div className="p-6 bg-white">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Snapshot - {selectedSnapshot.date}</h3>
                                <p className="text-gray-500 mb-4">Captured at {selectedSnapshot.time}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => handleGalleryDownload(selectedSnapshot)} className="p-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"><Download className="w-5 h-5" />Download</button>
                                    <button onClick={handleDelete} className="p-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"><Trash2 className="w-5 h-5" />Delete</button>
                                </div>
                                <button onClick={() => { setSelectedSnapshot(null); setShowGallery(false); }} className="w-full mt-4 p-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors active:scale-[0.99]">Close & Exit</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal (showSettingsModal is used here) */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-gray-900">Camera Settings</h2>
                            <button onClick={() => setShowSettingsModal(false)} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-4 space-y-6">
                            {/* Resolution */}
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Resolution</label><select value={settings.resolution} onChange={(e) => handleSettingChange("resolution", e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:ring-emerald-500 focus:border-emerald-500"><option value="720p">720p (HD)</option><option value="1080p">1080p (Full HD)</option></select></div>
                            {/* FPS */}
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Frame Rate (FPS)</label><select value={settings.fps} onChange={(e) => handleSettingChange("fps", Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:ring-emerald-500 focus:border-emerald-500"><option value={15}>15 FPS</option><option value={30}>30 FPS</option></select></div>
                            {/* Brightness */}
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Brightness: <span className="text-emerald-600 font-bold">{settings.brightness}%</span></label><input type="range" min="0" max="100" value={settings.brightness} onChange={(e) => handleSettingChange("brightness", Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-emerald-500" /></div>
                            {/* Contrast */}
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Contrast: <span className="text-emerald-600 font-bold">{settings.contrast}%</span></label><input type="range" min="0" max="100" value={settings.contrast} onChange={(e) => handleSettingChange("contrast", Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" /></div>
                            {/* AI Sensitivity */}
                            <div><label className="block text-sm font-semibold text-gray-700 mb-2">AI Detection Sensitivity: <span className="text-emerald-600 font-bold">{settings.detectionSensitivity}%</span></label><input type="range" min="0" max="100" value={settings.detectionSensitivity} onChange={(e) => handleSettingChange("detectionSensitivity", Number(e.target.value))} className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" /><p className="text-xs text-gray-500 mt-1">Higher sensitivity detects more kale but may increase false positives</p></div>
                            {/* Motion Detection Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"><div><div className="font-semibold text-gray-900">Motion Detection</div><div className="text-xs text-gray-500">Alert on movement detection</div></div><label className="relative inline-block w-12 h-6"><input type="checkbox" checked={settings.motionDetection} onChange={(e) => handleSettingChange("motionDetection", e.target.checked)} className="sr-only peer" /><div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div></label></div>
                            {/* Save and Close Buttons */}
                            <div className="space-y-3 pt-2"><button onClick={handleSaveSettings} className="w-full p-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl active:scale-[0.99]">Save Settings</button><button onClick={() => setShowSettingsModal(false)} className="w-full p-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors active:scale-[0.99]">Close</button></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}