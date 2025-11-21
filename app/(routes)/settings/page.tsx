"use client"

import { useState, useEffect } from "react"
import {
  Waves,
  Wind,
  Droplets,
  Activity,
  Zap,
  Sun,
  Bell,
  Thermometer,
  AlertTriangle,
  Home,
  Camera,
  Settings,
  BarChart3,
} from "lucide-react"

// --- TYPE DEFINITIONS ---
interface SystemControls {
  pump: boolean
  fan: boolean
  phAdjustment: boolean
  aerator: boolean
  growLight: boolean
}

interface ControlToggleProps {
  label: string
  description: string
  icon: React.ElementType
  active: boolean
  onChange: (val: boolean) => void
}

interface PresetCardProps {
  title: string
  description: string
  icon: React.ElementType
  active: boolean
  onActivate: () => void
}

interface ThresholdRangeInputProps {
  label: string
  unit: string
  icon: React.ElementType
  minValue: number
  maxValue: number
  minLimit: number
  maxLimit: number
  onMinChange: (val: number) => void
  onMaxChange: (val: number) => void
}

// --- INITIAL STATE / MOCK DATA ---
const INITIAL_CONTROLS: SystemControls = {
  pump: true,
  fan: false,
  phAdjustment: true,
  aerator: true,
  growLight: true,
}

// --- COMPONENTS ---
const Navbar: React.FC<{ time: string }> = ({ time }) => (
  <div className="bg-white px-4 py-2.5 flex items-center justify-between text-sm border-b border-gray-100 sticky top-0 z-40">
    <span className="font-bold text-gray-900">GROWUP</span>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
      <span className="text-xs text-gray-600">{time}</span>
    </div>
  </div>
)

const BottomNavigation = () => {
  const [pathname, setPathname] = useState("/settings")
  const tabs = [
    { id: "dashboard", label: "Home", href: "/dashboard", icon: Home },
    { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
    { id: "camera", label: "Camera", href: "/camera", icon: Camera },
    { id: "settings", label: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around py-3">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setPathname(tab.href)}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${isActive ? "text-emerald-600 bg-emerald-50" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const ControlToggle: React.FC<ControlToggleProps> = ({ label, description, icon: Icon, active, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
    <div className="flex items-center gap-3 flex-1">
      <div className={`p-2 rounded-lg ${active ? 'bg-emerald-100' : 'bg-gray-200'}`}>
        <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
    </div>
    <button
      onClick={() => onChange(!active)}
      className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 ${active ? 'bg-emerald-500' : 'bg-gray-300'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${active ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  </div>
)

const PresetCard: React.FC<PresetCardProps> = ({ title, description, icon: Icon, active, onActivate }) => (
  <button
    onClick={onActivate}
    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${active ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
  >
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${active ? 'bg-emerald-100' : 'bg-gray-100'}`}>
        <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-gray-600'}`} />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-xs text-gray-600 mt-1">{description}</div>
      </div>
      {active && <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-2"></div>}
    </div>
  </button>
)

const ThresholdRangeInput: React.FC<ThresholdRangeInputProps> = ({
  label,
  unit,
  icon: Icon,
  minValue,
  maxValue,
  minLimit,
  maxLimit,
  onMinChange,
  onMaxChange
}) => (
  <div className="p-4 bg-gray-50 rounded-xl">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-gray-600" />
      <span className="font-medium text-gray-900 text-sm">{label}</span>
    </div>

    <div className="flex items-center gap-3">
      <div className="flex-1">
        <span className="text-xs text-gray-500">Min</span>
        <input
          type="number"
          value={minValue}
          onChange={(e) => onMinChange(Number(e.target.value))}
          min={minLimit}
          max={maxLimit}
          step="0.1"
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <span className="text-gray-400 font-medium mt-5">—</span>

      <div className="flex-1">
        <span className="text-xs text-gray-500">Max</span>
        <input
          type="number"
          value={maxValue}
          onChange={(e) => onMaxChange(Number(e.target.value))}
          min={minLimit}
          max={maxLimit}
          step="0.1"
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <span className="text-sm font-medium text-gray-600 w-10">{unit}</span>
    </div>

    <div className="flex justify-between text-xs text-gray-500 mt-3">
      <span>Min: {minLimit}</span>
      <span>Max: {maxLimit}</span>
    </div>
  </div>
)

// --- MAIN COMPONENT ---
export default function SettingsPage() {
  const [controls, setControls] = useState<SystemControls>(INITIAL_CONTROLS)
  const [activePreset, setActivePreset] = useState<string>("balanced")
  const [thresholds, setThresholds] = useState({
    waterTemp: { min: 20, max: 26 },
    ph: { min: 6.5, max: 7.5 },
    dissolvedO2: { min: 5, max: 8 },
    ammonia: { min: 0, max: 0.5 },
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hasChanges, setHasChanges] = useState(false)

  // Load saved settings on mount
  useEffect(() => {
    try {
      const savedControls = localStorage.getItem('aquaponics_controls')
      const savedPreset = localStorage.getItem('aquaponics_preset')
      const savedThresholds = localStorage.getItem('aquaponics_thresholds')

      if (savedControls) setControls(JSON.parse(savedControls))
      if (savedPreset) setActivePreset(savedPreset)
      if (savedThresholds) setThresholds(JSON.parse(savedThresholds))
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleControlChange = (key: keyof SystemControls, val: boolean) => {
    setControls({ ...controls, [key]: val })
    setHasChanges(true)
  }

  const handlePresetChange = (preset: string) => {
    setActivePreset(preset)
    setHasChanges(true)
    switch (preset) {
      case "balanced":
        setControls({ pump: true, fan: false, phAdjustment: true, aerator: true, growLight: true })
        break
      case "highGrowth":
        setControls({ pump: true, fan: true, phAdjustment: true, aerator: true, growLight: true })
        break
      case "ecoMode":
        setControls({ pump: true, fan: false, phAdjustment: false, aerator: false, growLight: false })
        break
      case "maintenance":
        setControls({ pump: false, fan: true, phAdjustment: false, aerator: false, growLight: false })
        break
    }
  }

  const handleSaveChanges = () => {
    try {
      localStorage.setItem('aquaponics_controls', JSON.stringify(controls))
      localStorage.setItem('aquaponics_preset', activePreset)
      localStorage.setItem('aquaponics_thresholds', JSON.stringify(thresholds))
      setHasChanges(false)

      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <Navbar time={currentTime.toLocaleTimeString()} />

      <div className="px-4 py-5 pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your aquaponics system</p>
        </div>

        <div className="space-y-5">
          {/* Control Panel */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">System Controls</h3>
            <div className="space-y-3">
              <ControlToggle label="Submersible Pump" description="Main water circulation" icon={Waves} active={controls.pump} onChange={(val) => handleControlChange('pump', val)} />
              <ControlToggle label="DC Fan" description="Air circulation & cooling" icon={Wind} active={controls.fan} onChange={(val) => handleControlChange('fan', val)} />
              <ControlToggle label="pH Adjustment" description="Automatic pH balancing" icon={Droplets} active={controls.phAdjustment} onChange={(val) => handleControlChange('phAdjustment', val)} />
              <ControlToggle label="Aerator" description="Oxygen circulation" icon={Activity} active={controls.aerator} onChange={(val) => handleControlChange('aerator', val)} />
              <ControlToggle label="Grow Light" description="LED lighting system" icon={Sun} active={controls.growLight} onChange={(val) => handleControlChange('growLight', val)} />
            </div>
          </div>

          {/* Automation Presets */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Automation Presets</h3>
            <div className="space-y-3">
              <PresetCard title="Balanced Mode" description="Optimal settings for standard growth" icon={Activity} active={activePreset === "balanced"} onActivate={() => handlePresetChange("balanced")} />
              <PresetCard title="High Growth Mode" description="Maximum growth with increased resource use" icon={Zap} active={activePreset === "highGrowth"} onActivate={() => handlePresetChange("highGrowth")} />
              <PresetCard title="Eco Mode" description="Energy saving mode with reduced power" icon={Sun} active={activePreset === "ecoMode"} onActivate={() => handlePresetChange("ecoMode")} />
              <PresetCard title="Maintenance Mode" description="Safe mode for system maintenance" icon={AlertTriangle} active={activePreset === "maintenance"} onActivate={() => handlePresetChange("maintenance")} />
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-gray-900">Alert Thresholds</h3>
            </div>
            <div className="space-y-3">
              <ThresholdRangeInput
                label="Water Temperature"
                unit="°C"
                icon={Thermometer}
                minValue={thresholds.waterTemp.min}
                maxValue={thresholds.waterTemp.max}
                minLimit={18}
                maxLimit={30}
                onMinChange={(val) => {
                  setThresholds({ ...thresholds, waterTemp: { ...thresholds.waterTemp, min: val } })
                  setHasChanges(true)
                }}
                onMaxChange={(val) => {
                  setThresholds({ ...thresholds, waterTemp: { ...thresholds.waterTemp, max: val } })
                  setHasChanges(true)
                }}
              />
              <ThresholdRangeInput
                label="pH Level"
                unit=""
                icon={Droplets}
                minValue={thresholds.ph.min}
                maxValue={thresholds.ph.max}
                minLimit={5}
                maxLimit={9}
                onMinChange={(val) => {
                  setThresholds({ ...thresholds, ph: { ...thresholds.ph, min: val } })
                  setHasChanges(true)
                }}
                onMaxChange={(val) => {
                  setThresholds({ ...thresholds, ph: { ...thresholds.ph, max: val } })
                  setHasChanges(true)
                }}
              />
              <ThresholdRangeInput
                label="Dissolved Oxygen"
                unit="mg/L"
                icon={Activity}
                minValue={thresholds.dissolvedO2.min}
                maxValue={thresholds.dissolvedO2.max}
                minLimit={3}
                maxLimit={10}
                onMinChange={(val) => {
                  setThresholds({ ...thresholds, dissolvedO2: { ...thresholds.dissolvedO2, min: val } })
                  setHasChanges(true)
                }}
                onMaxChange={(val) => {
                  setThresholds({ ...thresholds, dissolvedO2: { ...thresholds.dissolvedO2, max: val } })
                  setHasChanges(true)
                }}
              />
              <ThresholdRangeInput
                label="Ammonia Level"
                unit="ppm"
                icon={AlertTriangle}
                minValue={thresholds.ammonia.min ?? 0}
                maxValue={thresholds.ammonia.max}
                minLimit={0}
                maxLimit={2}
                onMinChange={(val) => {
                  setThresholds({ ...thresholds, ammonia: { ...thresholds.ammonia, min: val } })
                  setHasChanges(true)
                }}
                onMaxChange={(val) => {
                  setThresholds({ ...thresholds, ammonia: { ...thresholds.ammonia, max: val } })
                  setHasChanges(true)
                }}
              />
            </div>
          </div>

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

          {/* Save Changes Button */}
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all ${hasChanges
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {hasChanges ? 'Save All Changes' : 'No Changes to Save'}
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}