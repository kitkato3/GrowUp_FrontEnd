import { Camera } from "lucide-react"
import { useState, useEffect } from "react"

const PLANT_DETECTIONS = [
  { name: "Kale #1", status: "Healthy", color: "emerald" },
  { name: "Kale #2", status: "Growing", color: "emerald" },
  { name: "Kale #3", status: "Needs Water", color: "amber" },
  { name: "Kale #4", status: "Healthy", color: "emerald" }
]

// Sample gallery data - automatic 8am screenshots
const GALLERY_SNAPSHOTS = [
  { id: 1, date: "2024-11-19", time: "08:00 AM", thumbnail: "🌱" },
  { id: 2, date: "2024-11-18", time: "08:00 AM", thumbnail: "🌿" },
  { id: 3, date: "2024-11-17", time: "08:00 AM", thumbnail: "🥬" },
  { id: 4, date: "2024-11-16", time: "08:00 AM", thumbnail: "🍃" },
  { id: 5, date: "2024-11-15", time: "08:00 AM", thumbnail: "🌱" },
  { id: 6, date: "2024-11-14", time: "08:00 AM", thumbnail: "🌿" },
]

export default function CameraView() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [settings, setSettings] = useState({
    resolution: "1080p",
    fps: 30,
    brightness: 50,
    contrast: 50,
    detectionSensitivity: 75,
    autoFocus: true,
    nightMode: false,
    motionDetection: true,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSnapshot = () => {
    setShowGallery(true)
  }

  const handleRecord = () => {
    alert("🎥 Recording started! Click again to stop.")
  }

  const handleZoom = () => {
    alert("🔍 Zoom controls activated. Use pinch gesture to zoom.")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-5 pb-24">
          {/* Camera Feed */}
          <div className="bg-gray-900 rounded-2xl aspect-square relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-semibold">Live Kale Tower Feed</div>
                <div className="text-sm opacity-70">AI Plant Detection Active</div>
              </div>
            </div>
            <div className="absolute top-4 right-4 bg-red-500 w-4 h-4 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-2 rounded text-white">
              <div className="text-sm font-semibold font-mono">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-xs">{settings.resolution} • {settings.fps}fps • Live</div>
            </div>
            <div className="absolute bottom-4 right-4 bg-emerald-600/90 px-3 py-2 rounded text-white">
              <div className="text-xs font-semibold">4 Kales Detected</div>
            </div>
          </div>

          {/* AI Detection Results */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Kale Detection Results</h3>
            <div className="space-y-3">
              {PLANT_DETECTIONS.map((plant, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg ${plant.color === "emerald"
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-amber-50 border border-amber-200"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${plant.color === "emerald" ? "bg-emerald-500" : "bg-amber-500"}`}
                    ></div>
                    <span className="font-medium text-gray-900">{plant.name}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold ${plant.color === "emerald" ? "text-emerald-600" : "text-amber-600"}`}
                  >
                    {plant.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Camera Controls */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Camera Controls</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSnapshot}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-semibold text-emerald-600 transition-colors"
              >
                📸 Gallery
              </button>
              <button
                onClick={handleRecord}
                className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg font-semibold text-blue-600 transition-colors"
              >
                🎥 Record
              </button>
              <button
                onClick={handleZoom}
                className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg font-semibold text-purple-600 transition-colors"
              >
                🔍 Zoom
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg font-semibold text-orange-600 transition-colors"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>

          {/* Gallery Modal */}
          {showGallery && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Snapshot Gallery</h2>
                    <p className="text-sm text-gray-500">Automatic 8:00 AM captures</p>
                  </div>
                  <button
                    onClick={() => setShowGallery(false)}
                    className="text-gray-500 hover:text-gray-700 text-3xl leading-none w-8 h-8 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {GALLERY_SNAPSHOTS.map((snapshot) => (
                      <div
                        key={snapshot.id}
                        className="bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-emerald-400 transition-colors cursor-pointer"
                      >
                        <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-6xl">
                          {snapshot.thumbnail}
                        </div>
                        <div className="p-3 bg-white">
                          <div className="font-semibold text-gray-900 text-sm">
                            {snapshot.date}
                          </div>
                          <div className="text-xs text-gray-500">
                            {snapshot.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowGallery(false)}
                    className="w-full mt-4 p-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors"
                  >
                    Close Gallery
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Modal */}
          {showSettings && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Camera Settings</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-500 hover:text-gray-700 text-3xl leading-none w-8 h-8 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>

                <div className="p-4 space-y-6">
                  {/* Resolution - Pi Camera V2/V3 supported */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Resolution
                    </label>
                    <select
                      value={settings.resolution}
                      onChange={(e) => handleSettingChange("resolution", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="720p">720p (HD)</option>
                      <option value="1080p">1080p (Full HD)</option>
                    </select>
                  </div>

                  {/* FPS - Pi Camera realistic limits */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Frame Rate (FPS)
                    </label>
                    <select
                      value={settings.fps}
                      onChange={(e) => handleSettingChange("fps", Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                    >
                      <option value={15}>15 FPS</option>
                      <option value={30}>30 FPS</option>
                    </select>
                  </div>

                  {/* Brightness */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brightness: {settings.brightness}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.brightness}
                      onChange={(e) => handleSettingChange("brightness", Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contrast: {settings.contrast}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.contrast}
                      onChange={(e) => handleSettingChange("contrast", Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Detection Sensitivity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      AI Detection Sensitivity: {settings.detectionSensitivity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.detectionSensitivity}
                      onChange={(e) => handleSettingChange("detectionSensitivity", Number(e.target.value))}
                      className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Higher sensitivity detects more kale but may increase false positives
                    </p>
                  </div>

                  {/* Motion Detection */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">Motion Detection</div>
                      <div className="text-xs text-gray-500">Alert on movement detection</div>
                    </div>
                    <label className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        checked={settings.motionDetection}
                        onChange={(e) => handleSettingChange("motionDetection", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  {/* Save and Close Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowSettings(false)
                        alert("✅ Settings saved successfully!")
                      }}
                      className="w-full p-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors"
                    >
                      Save Settings
                    </button>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="w-full p-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}