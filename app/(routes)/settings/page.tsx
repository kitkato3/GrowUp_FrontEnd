"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/app/components/LayoutWrapper"
import { ControlPanel } from "./components/ControlPanel"
import { AutomationPresets } from "./components/AutomationPresets"
import { AlertThresholds } from "./components/AlertThresholds"
import { INITIAL_CONTROLS } from "@/lib/constants"
import type { SystemControls } from "@/lib/types"

export default function Settings() {
  const [controls, setControls] = useState<SystemControls>(INITIAL_CONTROLS)

  return (
    <LayoutWrapper>
      <div className="space-y-5 pb-24">
        <ControlPanel controls={controls} onChange={setControls} />
        <AutomationPresets />
        <AlertThresholds />

        {/* System Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">System Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-gray-600">Firmware Version</span>
              <span className="font-semibold text-gray-900">v2.1.3</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-gray-600">Last Update</span>
              <span className="font-semibold text-gray-900">2 days ago</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-gray-600">System Uptime</span>
              <span className="font-semibold text-gray-900">7d 14h 32m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Storage Used</span>
              <span className="font-semibold text-gray-900">2.1GB / 32GB</span>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
