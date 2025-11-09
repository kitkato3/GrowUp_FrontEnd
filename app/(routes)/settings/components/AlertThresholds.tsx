"use client"

import { ALERT_THRESHOLD_DEFAULTS } from "@/lib/constants"

export const AlertThresholds = () => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4">Alert Thresholds</h3>
      <div className="space-y-4">
        {ALERT_THRESHOLD_DEFAULTS.map((threshold, idx) => (
          <div key={idx}>
            <label className="text-sm font-semibold text-gray-700 block mb-2">{threshold.label}</label>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
              <input
                type="number"
                value={threshold.min}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-500 font-semibold text-center">-</span>
              <input
                type="number"
                value={threshold.max}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
