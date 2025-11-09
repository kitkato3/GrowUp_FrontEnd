"use client"

import { LayoutWrapper } from "@/app/components/LayoutWrapper"
import { Camera } from "lucide-react"
import { PLANT_DETECTIONS } from "@/lib/constants"
import { useState } from "react"

export default function CameraView() {
  const [currentTime] = useState(new Date())

  return (
    <LayoutWrapper>
      <div className="space-y-5 pb-24">
        <div className="bg-gray-900 rounded-2xl aspect-square relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-semibold">Live Tower Feed</div>
              <div className="text-sm opacity-70">AI Plant Detection Active</div>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-red-500 w-4 h-4 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-2 rounded text-white">
            <div className="text-sm font-semibold font-mono">{currentTime.toLocaleTimeString()}</div>
            <div className="text-xs">1080p • Live</div>
          </div>
          <div className="absolute bottom-4 right-4 bg-emerald-600/90 px-3 py-2 rounded text-white">
            <div className="text-xs font-semibold">4 Plants Detected</div>
          </div>
        </div>

        {/* AI Detection Results */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Plant Detection Results</h3>
          <div className="space-y-3">
            {PLANT_DETECTIONS.map((plant, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  plant.color === "emerald"
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
            <button className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-semibold text-emerald-600 transition-colors">
              📸 Snapshot
            </button>
            <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg font-semibold text-blue-600 transition-colors">
              🎥 Record
            </button>
            <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg font-semibold text-purple-600 transition-colors">
              🔍 Zoom
            </button>
            <button className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg font-semibold text-orange-600 transition-colors">
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
