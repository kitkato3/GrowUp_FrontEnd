"use client"

import React, { useState, useEffect } from "react"
import { Thermometer, Droplets, Activity, Zap, Waves, Gauge, Wind, Fish, ChevronDown, AlertTriangle, CheckCircle, Camera, Maximize2, Bell, X, Clock } from "lucide-react"

// --- TYPE DEFINITIONS ---

interface SensorCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  color: string;
}

interface ControlToggleProps {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onChange: (val: boolean) => void;
}

interface SensorDataState {
  waterTemp: number;
  ph: number;
  dissolvedO2: number;
  waterLevel: number;
  waterFlow: number;
  humidity: number;
  ammonia: number;
  lightIntensity: number;
}

interface ControlState {
  pump: boolean;
  fan: boolean;
  phAdjustment: boolean;
  aerator: boolean;
}

interface AlertData {
  id: number;
  type: "warning" | "info";
  severity: "low" | "medium" | "high";
  title: string;
  message: string;
  time: string;
}

// --- MOCK DATA ---
const ALERTS_DATA: AlertData[] = [
  {
    id: 1,
    type: "warning",
    severity: "medium",
    title: "pH Level Slightly Low",
    message: "Current pH is 6.2. Optimal range is 6.5-7.0. pH adjustment system has been automatically activated to restore balance.",
    time: "5 minutes ago"
  },
  {
    id: 2,
    type: "info",
    severity: "low",
    title: "System Running Optimally",
    message: "All parameters are within ideal ranges. Water circulation is efficient and all sensors are functioning normally.",
    time: "15 minutes ago"
  },
  {
    id: 3,
    type: "warning",
    severity: "medium",
    title: "Maintenance Due Soon",
    message: "Filter cleaning scheduled in 3 days. Please ensure maintenance supplies are available.",
    time: "2 hours ago"
  },
  {
    id: 4,
    type: "info",
    severity: "low",
    title: "Water Level Refilled",
    message: "Water level successfully restored to 85% after automatic refill. System is stable.",
    time: "4 hours ago"
  },
  {
    id: 5,
    type: "warning",
    severity: "high",
    title: "Check Dissolved Oxygen",
    message: "DO level at 4.8 mg/L, below optimal range (5-8 mg/L). Aerator running at full capacity. Monitor closely.",
    time: "6 hours ago"
  }
]

// --- COMPONENTS ---

const SensorCard: React.FC<SensorCardProps> = ({ icon: Icon, title, value, unit, min, max, color }) => {
  const percentage = ((value - min) / (max - min)) * 100
  const isInRange = value >= min && value <= max

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
        </div>
        {!isInRange && <AlertTriangle className="w-4 h-4 text-amber-500" />}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}{unit}</div>
      <div className="text-xs text-gray-500 mt-1">{title}</div>
      <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  )
}

const ControlToggle: React.FC<ControlToggleProps> = ({ label, icon: Icon, active, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${active ? 'bg-emerald-100' : 'bg-gray-200'}`}>
        <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
      </div>
      <span className="font-medium text-gray-900">{label}</span>
    </div>
    <button
      onClick={() => onChange(!active)}
      className={`w-12 h-6 rounded-full transition-colors ${active ? 'bg-emerald-500' : 'bg-gray-300'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${active ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  </div>
)

// --- MAIN DASHBOARD COMPONENT ---

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null)
  const [showControlsModal, setShowControlsModal] = useState<boolean>(false)
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false)

  const [sensorData, setSensorData] = useState<SensorDataState>({
    waterTemp: 23.2,
    ph: 6.8,
    dissolvedO2: 7.2,
    waterLevel: 85,
    waterFlow: 4.5,
    humidity: 65,
    ammonia: 0.3,
    lightIntensity: 15000
  })

  const [controls, setControls] = useState<ControlState>({
    pump: true,
    fan: false,
    phAdjustment: true,
    aerator: true
  })

  const alerts = ALERTS_DATA

  // Clock and data simulation interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      setSensorData((prev) => ({
        ...prev,
        waterTemp: Number.parseFloat((22 + Math.random() * 2).toFixed(1)),
        ph: Number.parseFloat((6.5 + Math.random() * 0.6).toFixed(1)),
        dissolvedO2: Number.parseFloat((6.8 + Math.random() * 0.6).toFixed(1)),
        waterLevel: Math.min(100, Math.max(70, prev.waterLevel + (Math.random() - 0.5) * 2)),
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleControlChange = (key: keyof ControlState, val: boolean) => {
    setControls({ ...controls, [key]: val });
  }

  // Control modal component
  const ControlsModal: React.FC = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quick Controls</h2>
          <button
            onClick={() => setShowControlsModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-3">
          <ControlToggle
            label="Submersible Pump"
            icon={Waves}
            active={controls.pump}
            onChange={(val: boolean) => handleControlChange('pump', val)}
          />
          <ControlToggle
            label="DC Fan"
            icon={Wind}
            active={controls.fan}
            onChange={(val: boolean) => handleControlChange('fan', val)}
          />
          <ControlToggle
            label="pH Adjustment"
            icon={Droplets}
            active={controls.phAdjustment}
            onChange={(val: boolean) => handleControlChange('phAdjustment', val)}
          />
          <ControlToggle
            label="Aerator"
            icon={Activity}
            active={controls.aerator}
            onChange={(val: boolean) => handleControlChange('aerator', val)}
          />
        </div>
        <button
          onClick={() => setShowControlsModal(false)}
          className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )

  // Camera modal component
  const CameraModal: React.FC = () => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/80">
        <h2 className="text-white font-bold">Live Camera Feed</h2>
        <button
          onClick={() => setShowCameraModal(false)}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
      <div className="flex-1 bg-gray-900 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 flex items-center justify-center">
          <div className="text-center text-white">
            <Camera className="w-20 h-20 mx-auto mb-4 opacity-50" />
            <div className="text-xl font-semibold">Live Tower Feed</div>
            <div className="text-sm opacity-70 mt-2">Pinch to zoom • Swipe to pan</div>
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-red-500 w-4 h-4 rounded-full animate-pulse"></div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      <div className="space-y-5 pb-24">
        {/* Header with status */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">GROWUP</h1>
              <p className="text-emerald-100 text-sm">Aquaponics Tower System</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</div>
              <div className="text-xs text-emerald-100 flex items-center justify-end gap-1 mt-1">
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                Live
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/20 rounded-lg p-2">
              <div className="text-xs text-emerald-100">Plants</div>
              <div className="text-xl font-bold">4</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <div className="text-xs text-emerald-100">Health</div>
              <div className="text-xl font-bold">94%</div>
            </div>
            <div className="bg-white/20 rounded-lg p-2">
              <div className="text-xs text-emerald-100">Uptime</div>
              <div className="text-xl font-bold">99.8%</div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <div>
                <div className="font-semibold text-gray-900">System Healthy</div>
                <div className="text-xs text-gray-500">All sensors operational</div>
              </div>
            </div>
            <button
              onClick={() => setShowControlsModal(true)}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              Controls
            </button>
          </div>
        </div>

        {/* Live Camera Preview */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="bg-gray-900 aspect-video relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-60" />
                <div className="text-sm font-semibold">Live Feed</div>
                <div className="text-xs opacity-70">Tower Camera Active</div>
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
            <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1.5 rounded text-white text-xs font-mono">
              {currentTime.toLocaleTimeString()}
            </div>
            <button
              onClick={() => setShowCameraModal(true)}
              className="absolute bottom-3 right-3 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Alerts & Notifications
            </h3>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
              {alerts.length}
            </span>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${expandedAlert === alert.id ? "bg-gray-50" : ""}`}
                onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${alert.severity === "high"
                      ? "bg-red-100"
                      : alert.severity === "medium"
                        ? "bg-amber-100"
                        : "bg-emerald-100"
                      }`}
                  >
                    {alert.type === "warning" ? (
                      <AlertTriangle
                        className={`w-4 h-4 ${alert.severity === "high" ? "text-red-600" : "text-amber-600"}`}
                      />
                    ) : alert.severity === "low" && alert.title.includes("Maintenance") ? (
                      <Clock className="w-4 h-4 text-blue-600" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{alert.title}</div>
                    {expandedAlert === alert.id && <div className="text-xs text-gray-600 mt-2">{alert.message}</div>}
                    <div className="text-xs text-gray-500 mt-1">{alert.time}</div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expandedAlert === alert.id ? "rotate-180" : ""}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Sensors Grid */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">Critical Metrics</h2>
          <div className="grid grid-cols-2 gap-3">
            <SensorCard
              icon={Thermometer}
              title="Water Temp"
              value={sensorData.waterTemp}
              unit="°C"
              min={20}
              max={26}
              color="bg-blue-500"
            />
            <SensorCard
              icon={Droplets}
              title="pH Level"
              value={sensorData.ph}
              unit=""
              min={6.5}
              max={7.5}
              color="bg-purple-500"
            />
            <SensorCard
              icon={Activity}
              title="Dissolved O₂"
              value={sensorData.dissolvedO2}
              unit="mg/L"
              min={5}
              max={8}
              color="bg-green-500"
            />
            <SensorCard
              icon={Zap}
              title="Light Level"
              value={sensorData.lightIntensity}
              unit="lux"
              min={10000}
              max={20000}
              color="bg-yellow-500"
            />
          </div>
        </div>

        {/* Secondary Sensors */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">System Metrics</h2>
          <div className="grid grid-cols-2 gap-3">
            <SensorCard
              icon={Waves}
              title="Water Level"
              value={Math.round(sensorData.waterLevel)}
              unit="%"
              min={70}
              max={100}
              color="bg-cyan-500"
            />
            <SensorCard
              icon={Gauge}
              title="Flow Rate"
              value={sensorData.waterFlow}
              unit="L/min"
              min={3}
              max={6}
              color="bg-indigo-500"
            />
            <SensorCard
              icon={Wind}
              title="Humidity"
              value={sensorData.humidity}
              unit="%"
              min={50}
              max={80}
              color="bg-sky-500"
            />
            <SensorCard
              icon={Fish}
              title="Ammonia"
              value={sensorData.ammonia}
              unit="ppm"
              min={0}
              max={1}
              color="bg-orange-500"
            />
          </div>
        </div>
      </div>

      {showControlsModal && <ControlsModal />}
      {showCameraModal && <CameraModal />}
    </div>
  )
}