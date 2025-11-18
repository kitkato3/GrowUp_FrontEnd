"use client"

import { ALERT_THRESHOLD_DEFAULTS } from "@/lib/constants"
<<<<<<< HEAD

export const AlertThresholds = () => {
=======
import { useState } from "react"

export const AlertThresholds = () => {
  const [thresholds, setThresholds] = useState(ALERT_THRESHOLD_DEFAULTS)

>>>>>>> 1c5daa3 (hydration error fixed)
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4">Alert Thresholds</h3>
      <div className="space-y-4">
<<<<<<< HEAD
        {ALERT_THRESHOLD_DEFAULTS.map((threshold, idx) => (
          <div key={idx}>
            <label className="text-sm font-semibold text-gray-700 block mb-2">{threshold.label}</label>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
              <input
                type="number"
                value={threshold.min}
=======
        {thresholds.map((threshold, idx) => (
          <div key={idx}>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              {threshold.label}
            </label>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
              <input
                type="number"
                step="0.1"
                value={threshold.min}
                onChange={(e) => {
                  const newThresholds = [...thresholds]
                  newThresholds[idx] = {
                    ...newThresholds[idx],
                    min: parseFloat(e.target.value) || 0
                  }
                  setThresholds(newThresholds)
                }}
>>>>>>> 1c5daa3 (hydration error fixed)
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-500 font-semibold text-center">-</span>
              <input
                type="number"
<<<<<<< HEAD
                value={threshold.max}
=======
                step="0.1"
                value={threshold.max}
                onChange={(e) => {
                  const newThresholds = [...thresholds]
                  newThresholds[idx] = {
                    ...newThresholds[idx],
                    max: parseFloat(e.target.value) || 0
                  }
                  setThresholds(newThresholds)
                }}
>>>>>>> 1c5daa3 (hydration error fixed)
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> 1c5daa3 (hydration error fixed)
