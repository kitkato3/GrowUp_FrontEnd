"use client"

import React, { useState, useEffect } from "react"
import { Thermometer, Droplets, Activity, Zap, Waves, Gauge, Wind, Fish, ChevronDown, AlertTriangle, CheckCircle, Camera, Maximize2, Bell, X, Clock, LucideIcon } from "lucide-react"

// --- TYPE DEFINITIONS ---
interface SensorCardProps { icon: React.ElementType; title: string; value: number; unit: string; min: number; max: number; color: string; }
interface ControlToggleProps { label: string; icon: React.ElementType; active: boolean; onChange: (val: boolean) => void; }
interface SensorDataState { waterTemp: number; ph: number; dissolvedO2: number; waterLevel: number; waterFlow: number; humidity: number; ammonia: number; lightIntensity: number; }
interface ControlState { pump: boolean; fan: boolean; phAdjustment: boolean; aerator: boolean; }
interface AlertData { id: number; type: "warning" | "info"; severity: "low" | "medium" | "high"; title: string; message: string; time: string; }

// --- MOCK DATA / RANGES ---
const ALERTS_DATA: AlertData[] = [
  { id: 1, type: "warning", severity: "medium", title: "pH Level Slightly Low", message: "Current pH is 6.2...", time: "5 minutes ago" },
  { id: 2, type: "info", severity: "low", title: "System Running Optimally", message: "All parameters are within ideal ranges.", time: "15 minutes ago" },
  { id: 3, type: "warning", severity: "medium", title: "Maintenance Due Soon", message: "Filter cleaning scheduled in 3 days.", time: "2 hours ago" },
]
const SENSOR_RANGES = { waterTemp: { min: 20, max: 26 }, ph: { min: 6.5, max: 7.5 }, dissolvedO2: { min: 5, max: 8 }, lightIntensity: { min: 10000, max: 20000 }, waterLevel: { min: 70, max: 100 }, waterFlow: { min: 3, max: 6 }, humidity: { min: 50, max: 80 }, ammonia: { min: 0, max: 1 } }
const INITIAL_CONTROLS: ControlState = { pump: true, fan: false, phAdjustment: true, aerator: true }
const INITIAL_SENSOR_DATA: SensorDataState = { waterTemp: 23.2, ph: 6.8, dissolvedO2: 7.2, waterLevel: 85, waterFlow: 4.5, humidity: 65, ammonia: 0.3, lightIntensity: 15000 }

// --- UTILITY FUNCTIONS (Local) ---
type ThresholdStatus = "good" | "warning" | "critical";
const getThresholdStatus = (value: number, min: number, max: number): ThresholdStatus => {
  if (value < min || value > max) return "critical"
  if (value < min + (max - min) * 0.1 || value > max - (max - min) * 0.1) return "warning"
  return "good"
}
const getStatusColor = (status: ThresholdStatus): string => {
  switch (status) { case "good": return "bg-emerald-500"; case "warning": return "bg-amber-500"; case "critical": return "bg-red-500"; default: return "bg-gray-500"; }
}
const calculatePercentage = (value: number, min: number, max: number): number => { return ((value - min) / (max - min)) * 100 }

// --- LOCAL COMPONENTS ---
const SensorCard: React.FC<SensorCardProps> = ({ icon: Icon, title, value, unit, min, max, color }) => {
  const status = getThresholdStatus(value, min, max)
  const percentage = calculatePercentage(value, min, max)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><div className={`p-2.5 rounded-lg ${color}`}><Icon className="w-4 h-4 text-white" /></div><span className="text-sm font-semibold text-gray-700">{title}</span></div>
        <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)} animate-pulse`}></div>
      </div>
      <div className="mb-3"><div className="text-2xl font-bold text-gray-900">{value.toFixed(1)}<span className="text-xs text-gray-500 ml-1 font-normal">{unit}</span></div></div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full transition-all ${getStatusColor(status)}`} style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}></div></div>
    </div>
  )
}
const ControlToggle: React.FC<ControlToggleProps> = ({ label, icon: Icon, active, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${active ? 'bg-emerald-100' : 'bg-gray-200'}`}><Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-gray-400'}`} /></div><span className="font-medium text-gray-900">{label}</span></div>
    <button onClick={() => onChange(!active)} className={`w-12 h-6 rounded-full transition-colors ${active ? 'bg-emerald-500' : 'bg-gray-300'}`}><div className={`w-5 h-5 bg-white rounded-full transition-transform ${active ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  </div>
)

// --- MODAL COMPONENTS (Defined locally for this page) ---
const ControlsModal: React.FC<{ controls: ControlState, setControls: React.Dispatch<React.SetStateAction<ControlState>>, setShowControlsModal: React.Dispatch<React.SetStateAction<boolean>> }> = ({ controls, setControls, setShowControlsModal }) => {
  const handleLocalControlChange = (key: keyof ControlState, val: boolean) => { setControls(prev => ({ ...prev, [key]: val })); }
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"><div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-gray-900">Quick Controls</h2><button onClick={() => setShowControlsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-6 h-6" /></button></div><div className="space-y-3">
        <ControlToggle label="Submersible Pump" icon={Waves} active={controls.pump} onChange={(val: boolean) => handleLocalControlChange('pump', val)} />
        <ControlToggle label="DC Fan" icon={Wind} active={controls.fan} onChange={(val: boolean) => handleLocalControlChange('fan', val)} />
        <ControlToggle label="pH Adjustment" icon={Droplets} active={controls.phAdjustment} onChange={(val: boolean) => handleLocalControlChange('phAdjustment', val)} />
        <ControlToggle label="Aerator" icon={Activity} active={controls.aerator} onChange={(val: boolean) => handleLocalControlChange('aerator', val)} />
      </div><button onClick={() => setShowControlsModal(false)} className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors">Done</button></div>
    </div>
  )
}

const CameraModal: React.FC<{ setShowCameraModal: React.Dispatch<React.SetStateAction<boolean>> }> = ({ setShowCameraModal }) => (
  <div className="fixed inset-0 bg-black z-50 flex flex-col"><div className="flex items-center justify-between p-4 bg-black/80"><h2 className="text-white font-bold">Live Camera Feed</h2><button onClick={() => setShowCameraModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><X className="w-6 h-6 text-white" /></button></div>
    <div className="flex-1 bg-gray-900 flex items-center justify-center relative"><div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 flex items-center justify-center"><div className="text-center text-white"><Camera className="w-20 h-20 mx-auto mb-4 opacity-50" /><div className="text-xl font-semibold">Live Tower Feed</div></div></div></div>
  </div>
)


// --- MAIN DASHBOARD COMPONENT ---
export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null)
  const [showControlsModal, setShowControlsModal] = useState<boolean>(false)
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false)
  const [sensorData, setSensorData] = useState<SensorDataState>(INITIAL_SENSOR_DATA)
  const [controls, setControls] = useState<ControlState>(INITIAL_CONTROLS)
  const alerts = ALERTS_DATA

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

  return (
    <div className="space-y-5 pb-24">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg"><div className="flex items-start justify-between mb-4"><div><h1 className="text-3xl font-bold">GROWUP</h1><p className="text-emerald-100 text-sm">Aquaponics Tower System</p></div><div className="text-right"><div className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</div><div className="text-xs text-emerald-100 flex items-center justify-end gap-1 mt-1"><div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>Live</div></div></div><div className="grid grid-cols-3 gap-3 text-center"><div className="bg-white/20 rounded-lg p-2"><div className="text-xs text-emerald-100">Plants</div><div className="text-xl font-bold">4</div></div><div className="bg-white/20 rounded-lg p-2"><div className="text-xs text-emerald-100">Health</div><div className="text-xl font-bold">94%</div></div><div className="bg-white/20 rounded-lg p-2"><div className="text-xs text-emerald-100">Uptime</div><div className="text-xl font-bold">99.8%</div></div></div></div>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div><div><div className="font-semibold text-gray-900">System Healthy</div><div className="text-xs text-gray-500">All sensors operational</div></div></div><button onClick={() => setShowControlsModal(true)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors">Controls</button></div></div>
      <div><h2 className="text-sm font-bold text-gray-900 mb-3 px-1">Critical Metrics</h2><div className="grid grid-cols-2 gap-3"><SensorCard icon={Thermometer} title="Water Temp" value={sensorData.waterTemp} unit="°C" min={SENSOR_RANGES.waterTemp.min} max={SENSOR_RANGES.waterTemp.max} color="bg-blue-500" /><SensorCard icon={Droplets} title="pH Level" value={sensorData.ph} unit="" min={SENSOR_RANGES.ph.min} max={SENSOR_RANGES.ph.max} color="bg-purple-500" /><SensorCard icon={Activity} title="Dissolved O₂" value={sensorData.dissolvedO2} unit="mg/L" min={SENSOR_RANGES.dissolvedO2.min} max={SENSOR_RANGES.dissolvedO2.max} color="bg-green-500" /><SensorCard icon={Zap} title="Light Level" value={sensorData.lightIntensity} unit="lux" min={SENSOR_RANGES.lightIntensity.min} max={SENSOR_RANGES.lightIntensity.max} color="bg-yellow-500" /></div></div>
      <div><h2 className="text-sm font-bold text-gray-900 mb-3 px-1">System Metrics</h2><div className="grid grid-cols-2 gap-3"><SensorCard icon={Waves} title="Water Level" value={Math.round(sensorData.waterLevel)} unit="%" min={SENSOR_RANGES.waterLevel.min} max={SENSOR_RANGES.waterLevel.max} color="bg-cyan-500" /><SensorCard icon={Gauge} title="Flow Rate" value={sensorData.waterFlow} unit="L/min" min={SENSOR_RANGES.waterFlow.min} max={SENSOR_RANGES.waterFlow.max} color="bg-indigo-500" /><SensorCard icon={Wind} title="Humidity" value={sensorData.humidity} unit="%" min={SENSOR_RANGES.humidity.min} max={SENSOR_RANGES.humidity.max} color="bg-sky-500" /><SensorCard icon={Fish} title="Ammonia" value={sensorData.ammonia} unit="ppm" min={SENSOR_RANGES.ammonia.min} max={SENSOR_RANGES.ammonia.max} color="bg-orange-500" /></div></div>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"><div className="bg-gray-900 aspect-video relative overflow-hidden group cursor-pointer" onClick={() => setShowCameraModal(true)}><div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 flex items-center justify-center"><div className="text-center text-white"><Camera className="w-12 h-12 mx-auto mb-2 opacity-60" /><div className="text-sm font-semibold">Live Feed</div></div></div><div className="absolute top-3 right-3 bg-red-500 w-3 h-3 rounded-full animate-pulse"></div><div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1.5 rounded text-white text-xs font-mono">{currentTime.toLocaleTimeString()}</div><button onClick={() => setShowCameraModal(true)} className="absolute bottom-3 right-3 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Maximize2 className="w-4 h-4" /></button></div></div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-4 border-b border-gray-100 flex items-center justify-between"><h3 className="font-bold text-gray-900 flex items-center gap-2"><Bell className="w-4 h-4 text-amber-500" />Alerts & Notifications</h3><span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">{alerts.length}</span></div><div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">{alerts.map((alert) => (<div key={alert.id} className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${expandedAlert === alert.id ? "bg-gray-50" : ""}`} onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}><div className="flex items-start gap-3"><div className={`p-2 rounded-lg flex-shrink-0 ${alert.severity === "high" ? "bg-red-100" : alert.severity === "medium" ? "bg-amber-100" : "bg-emerald-100"}`}>{alert.type === "warning" ? (<AlertTriangle className={`w-4 h-4 ${alert.severity === "high" ? "text-red-600" : "text-amber-600"}`} />) : alert.severity === "low" && alert.title.includes("Maintenance") ? (<Clock className="w-4 h-4 text-blue-600" />) : (<CheckCircle className="w-4 h-4 text-emerald-600" />)}</div><div className="flex-1 min-w-0"><div className="font-semibold text-gray-900 text-sm">{alert.title}</div>{expandedAlert === alert.id && <div className="text-xs text-gray-600 mt-2">{alert.message}</div>}<div className="text-xs text-gray-500 mt-1">{alert.time}</div></div><ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expandedAlert === alert.id ? "rotate-180" : ""}`} /></div></div>))}</div></div>
      {showControlsModal && <ControlsModal controls={controls} setControls={setControls} setShowControlsModal={setShowControlsModal} />}
      {showCameraModal && <CameraModal setShowCameraModal={setShowCameraModal} />}
    </div>
  )
}