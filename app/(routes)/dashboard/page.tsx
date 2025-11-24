"use client"

import React, { useState, useEffect } from "react"
// Import Icon components
import { Thermometer, Droplets, Activity, Zap, Waves, Gauge, Wind, Fish, ChevronDown, AlertTriangle, CheckCircle, Camera, Maximize2, Bell, X, Clock, Home, BarChart3, Settings, Sun } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// --- INTERFACES  ---
interface SystemControls { pump: boolean; fan: boolean; phAdjustment: boolean; aerator: boolean; growLight: boolean; }
interface ThresholdState { waterTemp: { min: number; max: number }; ph: { min: number; max: number }; dissolvedO2: { min: number; max: number }; ammonia: { min: number; max: number }; }
interface ControlState { pump: boolean; fan: boolean; phAdjustment: boolean; aerator: boolean; growLight: boolean; }
interface SensorCardProps { icon: React.ElementType; title: string; value: number; unit: string; min: number; max: number; color: string; }
interface SensorDataState {
  waterTemp: number;
  ph: number;
  dissolvedO2: number;
  waterLevel: number;
  waterFlow: number;
  humidity: number;
  ammonia: number;
  lightIntensity: number;
  airTemp: number;
  airPressure: number;
}
interface AlertData { id: number; type: "warning" | "info" | "error"; severity: "low" | "medium" | "high" | "critical"; title: string; message: string; time: string; }
interface ControlToggleProps { label: string; icon: React.ElementType; active: boolean; onChange: (val: boolean) => void; }

interface MinimalSensorData { waterTemp: number; ph: number; dissolvedO2: number; ammonia: number; airTemp: number; waterFlow: number; humidity: number; lightIntensity: number; }
interface FullThresholdState {
  waterTemp: { min: number; max: number }; ph: { min: number; max: number }; dissolvedO2: { min: number; max: number }; ammonia: { min: number; max: number };
  airTemp: { min: number; max: number }; waterFlow: { min: number; max: number }; airHumidity: { min: number; max: number }; lightIntensity: { min: number; max: number };
}

const ALERTS_DATA: AlertData[] = [
  { id: 1, type: "warning", severity: "medium", title: "pH Level Slightly Low", message: "Current pH is 6.2. Consider adjusting pH levels to maintain optimal plant growth.", time: "5 minutes ago" },
  { id: 2, type: "info", severity: "low", title: "System Running Optimally", message: "All parameters are within ideal ranges.", time: "15 minutes ago" },
  { id: 3, type: "warning", severity: "medium", title: "Maintenance Due Soon", message: "Filter cleaning scheduled in 3 days.", time: "2 hours ago" },
]

const INITIAL_SENSOR_DATA: SensorDataState = {
  waterTemp: 23.2,
  ph: 6.8,
  dissolvedO2: 7.2,
  waterLevel: 85,
  waterFlow: 4.5,
  humidity: 65,
  ammonia: 0.3,
  lightIntensity: 15000,
  airTemp: 25.5,
  airPressure: 1012.0
}

// --- INITIAL STATE & HOOKS ---
const INITIAL_CONTROLS_FULL: SystemControls = { pump: true, fan: false, phAdjustment: true, aerator: true, growLight: true }
const INITIAL_THRESHOLDS: FullThresholdState = {
  waterTemp: { min: 20, max: 26 }, ph: { min: 6.5, max: 7.5 }, dissolvedO2: { min: 5, max: 8 }, ammonia: { min: 0, max: 0.5 },
  airTemp: { min: 22, max: 28 }, waterFlow: { min: 8, max: 12 }, airHumidity: { min: 50, max: 70 }, lightIntensity: { min: 500, max: 1500 },
}
const localStorageKey = 'aquaponics_settings_state';
const loadState = (): { controls: SystemControls, activePreset: string, thresholds: FullThresholdState } => { try { const savedState = localStorage.getItem(localStorageKey); if (savedState) return JSON.parse(savedState); } catch (error) { console.error('Error loading state:', error); } return { controls: INITIAL_CONTROLS_FULL, activePreset: "balanced", thresholds: INITIAL_THRESHOLDS, }; };
const useAquaponicsSettings = () => {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === localStorageKey && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const quickSaveControls = (newControls: SystemControls) => {
    setState(prevState => {
      const newState = { ...prevState, controls: newControls };
      localStorage.setItem(localStorageKey, JSON.stringify(newState)); // Quick save to sync
      return newState;
    });
  }

  return { controls: state.controls, quickSaveControls, activePreset: state.activePreset, thresholds: state.thresholds }
}

// ADDED: Dynamic Alert Generation Logic
const timeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  return `${hours} hrs ago`
}

const generateAlerts = (
  sensor: MinimalSensorData,
  thresholds: FullThresholdState
): AlertData[] => {
  const now = new Date()
  const alerts: AlertData[] = []
  let alertId = 10;

  // Simplified, focusing on critical values based on `settings` logic
  // Water Temperature
  if (sensor.waterTemp < thresholds.waterTemp.min || sensor.waterTemp > thresholds.waterTemp.max) alerts.push({ id: alertId++, type: "warning", severity: "medium", title: "Water Temperature Issue", message: `Current water temp is ${sensor.waterTemp}°C.`, time: timeAgo(now) })
  // pH Level
  if (sensor.ph < thresholds.ph.min || sensor.ph > thresholds.ph.max) alerts.push({ id: alertId++, type: "warning", severity: "medium", title: "pH Level Issue", message: `Current pH is ${sensor.ph}.`, time: timeAgo(now) })
  // Dissolved Oxygen
  if (sensor.dissolvedO2 < thresholds.dissolvedO2.min) alerts.push({ id: alertId++, type: "warning", severity: "high", title: "Dissolved Oxygen Low", message: `DO is ${sensor.dissolvedO2} mg/L.`, time: timeAgo(now) })
  // Ammonia
  if (sensor.ammonia > thresholds.ammonia.max) alerts.push({ id: alertId++, type: "warning", severity: "high", title: "Ammonia Level High", message: `Ammonia at ${sensor.ammonia} ppm.`, time: timeAgo(now) })
  // Water Flow Rate
  if (sensor.waterFlow < thresholds.waterFlow.min) alerts.push({ id: alertId++, type: "error", severity: "critical", title: "PUMP ERROR: Water Flow Low", message: `Flow is ${sensor.waterFlow} L/min.`, time: timeAgo(now) })
  // Note: chemLevel check removed as requested

  // Merge with static alerts for full list (only 1, 2, 3)
  const allAlerts = [...alerts, ...ALERTS_DATA.filter(a => a.id >= 1 && a.id <= 3)];

  // Return only alerts that triggered and the non-optimal static ones
  return allAlerts.filter(a => a.severity !== 'low' || a.title !== 'System Running Optimally');
}

/**
 * Checks overall system status based on generated alerts.
 * If alert list is empty, the system is running optimally.
 */
const checkSystemStatus = (alerts: AlertData[]): 'Optimal' | 'Alerts Active' => {
  const activeAlerts = alerts.filter(a => a.title !== "System Running Optimally");
  if (activeAlerts.length === 0) {
    return 'Optimal';
  }
  return 'Alerts Active';
};
type ThresholdStatus = "good" | "warning" | "critical"
const getThresholdStatus = (value: number, min: number, max: number): ThresholdStatus => {
  if (value < min || value > max) return "critical"
  if (value < min + (max - min) * 0.1 || value > max - (max - min) * 0.1) return "warning"
  return "good"
}
const getStatusColor = (status: ThresholdStatus): string => {
  switch (status) {
    case "good": return "bg-emerald-500"
    case "warning": return "bg-amber-500"
    case "critical": return "bg-red-500"
    default: return "bg-gray-500"
  }
}
const calculatePercentage = (value: number, min: number, max: number) => ((value - min) / (max - min)) * 100

// --- COMPONENTS (Navbar, BottomNavigation, SensorCard, ControlToggle) ---

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
  const pathname = usePathname() || "/dashboard"
  const tabs = [
    { id: "dashboard", label: "Home", href: "/dashboard", icon: Home },
    { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
    { id: "camera", label: "Camera", href: "/camera", icon: Camera },
    { id: "settings", label: "Settings", href: "/settings", icon: Settings },
  ]
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around py-3">
        {tabs.map(tab => {
          const isActive = pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${isActive ? "text-emerald-600 bg-emerald-50" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-semibold">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

const SensorCard: React.FC<SensorCardProps> = ({ icon: Icon, title, value, unit, min, max, color }) => {
  const status = getThresholdStatus(value, min, max)
  const percentage = calculatePercentage(value, min, max)
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2.5 rounded-lg ${color}`}><Icon className="w-4 h-4 text-white" /></div>
          <span className="text-sm font-semibold text-gray-700">{title}</span>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)} animate-pulse`}></div>
      </div>
      <div className="mb-3">
        <div className="text-2xl font-bold text-gray-900">{value.toFixed(1)}<span className="text-xs text-gray-500 ml-1 font-normal">{unit}</span></div>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full transition-all ${getStatusColor(status)}`} style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}></div>
      </div>
    </div>
  )
}

const ControlToggle: React.FC<ControlToggleProps> = ({ label, icon: Icon, active, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${active ? 'bg-emerald-100' : 'bg-gray-200'}`}><Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-gray-400'}`} /></div>
      <span className="font-medium text-gray-900">{label}</span>
    </div>
    <button onClick={() => onChange(!active)} className={`w-12 h-6 rounded-full transition-colors ${active ? 'bg-emerald-500' : 'bg-gray-300'}`}>
      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${active ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  </div>
)

// --- DASHBOARD COMPONENT ---
export default function Dashboard() {
  const { controls, quickSaveControls, thresholds } = useAquaponicsSettings()
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null)
  const [showControlsModal, setShowControlsModal] = useState<boolean>(false)
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false)
  const [localControls, setLocalControls] = useState<ControlState>({ ...controls })
  const [sensorData, setSensorData] = useState<SensorDataState>(INITIAL_SENSOR_DATA)

  // ADDED: Calculate System Status
  // Mocked chemLevel and lightIntensity for Alert Generation on Home Screen
  const minimalSensorData: MinimalSensorData = {
    waterTemp: sensorData.waterTemp,
    ph: sensorData.ph,
    dissolvedO2: sensorData.dissolvedO2,
    ammonia: sensorData.ammonia,
    airTemp: sensorData.airTemp,
    waterFlow: sensorData.waterFlow,
    humidity: sensorData.humidity,
    lightIntensity: 1000.0, // Mocked value
  }

  const dynamicAlerts = generateAlerts(minimalSensorData, thresholds as FullThresholdState);
  const systemStatus = checkSystemStatus(dynamicAlerts);

  // The original ALERTS_DATA is used here to match the image
  const alerts = ALERTS_DATA;

  useEffect(() => {
    if (showControlsModal) setLocalControls({ ...controls })
  }, [showControlsModal, controls])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      setSensorData(prev => ({
        ...prev,
        waterTemp: Number.parseFloat((22 + Math.random() * 2).toFixed(1)),
        ph: Number.parseFloat((6.5 + Math.random() * 0.6).toFixed(1)),
        dissolvedO2: Number.parseFloat((6.8 + Math.random() * 0.6).toFixed(1)),
        waterLevel: Math.min(100, Math.max(70, prev.waterLevel + (Math.random() - 0.5) * 2)),
        airTemp: Number.parseFloat((24 + Math.random() * 3).toFixed(1)),
        airPressure: Number.parseFloat((1000 + Math.random() * 25).toFixed(1)),
        humidity: Number.parseFloat((60 + Math.random() * 10).toFixed(1)),
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleQuickControlsSave = () => {
    quickSaveControls({ ...localControls })
    setShowControlsModal(false)
  }

  const ControlsModal = () => {
    const handleLocalControlChange = (key: keyof ControlState, val: boolean) => setLocalControls(prev => ({ ...prev, [key]: val }))
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
        <div className="w-full bg-white rounded-t-3xl p-6 max-w-md mx-auto max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Controls</h2>
            <button onClick={() => setShowControlsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-6 h-6" /></button>
          </div>
          <div className="space-y-3">
            <ControlToggle label="Submersible Pump" icon={Waves} active={localControls.pump} onChange={val => handleLocalControlChange('pump', val)} />
            <ControlToggle label="DC Fan" icon={Wind} active={localControls.fan} onChange={val => handleLocalControlChange('fan', val)} />
            <ControlToggle label="pH Adjustment" icon={Droplets} active={localControls.phAdjustment} onChange={val => handleLocalControlChange('phAdjustment', val)} />
            <ControlToggle label="Aerator" icon={Activity} active={localControls.aerator} onChange={val => handleLocalControlChange('aerator', val)} />
            <ControlToggle label="Grow Light" icon={Sun} active={localControls.growLight} onChange={val => handleLocalControlChange('growLight', val)} />
          </div>
          <button onClick={handleQuickControlsSave} className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors">Done</button>
        </div>
      </div>
    )
  }

  const CameraModal = () => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/80">
        <h2 className="text-white font-bold">Live Camera Feed</h2>
        <button onClick={() => setShowCameraModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><X className="w-6 h-6 text-white" /></button>
      </div>
      <div className="flex-1 bg-gray-900 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 flex items-center justify-center">
          <div className="text-center text-white">
            <Camera className="w-20 h-20 mx-auto mb-4 opacity-50" />
            <div className="text-xl font-semibold">Live Tower Feed</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <Navbar time={currentTime.toLocaleTimeString()} />
      <div className="space-y-5 pb-24 px-4 py-5">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">GROWUP</h1>
              <p className="text-emerald-100 text-sm">Aquaponics Tower System</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</div>
              <div className="text-xs text-emerald-100 flex items-center justify-end gap-1 mt-1">
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>Live
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

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <div>
                <div className="font-semibold text-gray-900">System Healthy</div>
                <div className="text-xs text-gray-500">All sensors operational</div>
              </div>
            </div>
            <button onClick={() => setShowControlsModal(true)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors">Controls</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="bg-gray-900 aspect-video relative overflow-hidden group cursor-pointer" onClick={() => setShowCameraModal(true)}>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-60" />
                <div className="text-sm font-semibold">Live Feed</div>
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
            <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1.5 rounded text-white text-xs font-mono">{currentTime.toLocaleTimeString()}</div>
            <button onClick={() => setShowCameraModal(true)} className="absolute bottom-3 right-3 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Alerts & Notifications
            </h3>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">{alerts.length}</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${expandedAlert === alert.id ? "bg-gray-50" : ""}`} onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${alert.severity === "high" ? "bg-red-100" : alert.severity === "medium" ? "bg-amber-100" : "bg-emerald-100"}`}>
                    {alert.type === "warning" ? (
                      <AlertTriangle className={`w-4 h-4 ${alert.severity === "high" ? "text-red-600" : "text-amber-600"}`} />
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
                  <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expandedAlert === alert.id ? "rotate-180" : ""}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*CRITICAL METRICS*/}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">Critical Metrics</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Water Temp, pH, DO, Air Temp are the most critical for immediate health */}
            <SensorCard icon={Thermometer} title="Water Temp" value={sensorData.waterTemp} unit="°C" min={20} max={26} color="bg-blue-500" />
            <SensorCard icon={Droplets} title="pH Level" value={sensorData.ph} unit="" min={6.5} max={7.5} color="bg-purple-500" />
            <SensorCard icon={Activity} title="Dissolved O₂" value={sensorData.dissolvedO2} unit="mg/L" min={5} max={8} color="bg-green-500" />
            <SensorCard icon={Fish} title="Ammonia" value={sensorData.ammonia} unit="ppm" min={0} max={1} color="bg-orange-500" />
          </div>
        </div>

        {/* SYSTEM METRICS*/}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">System Metrics</h2>
          <div className="grid grid-cols-2 gap-3">
            <SensorCard icon={Waves} title="Water Level" value={Math.round(sensorData.waterLevel)} unit="%" min={70} max={100} color="bg-cyan-500" />
            <SensorCard icon={Gauge} title="Flow Rate" value={sensorData.waterFlow} unit="L/min" min={3} max={6} color="bg-indigo-500" />
            <SensorCard icon={Zap} title="Light Level" value={sensorData.lightIntensity} unit="lux" min={10000} max={20000} color="bg-yellow-500" />
            <SensorCard icon={Wind} title="Humidity" value={sensorData.humidity} unit="%" min={50} max={80} color="bg-sky-500" />
            <SensorCard icon={Gauge} title="Air Pressure" value={sensorData.airPressure} unit="hPa" min={990} max={1030} color="bg-red-500" />
            <SensorCard icon={Thermometer} title="Air Temp" value={sensorData.airTemp} unit="°C" min={20} max={30} color="bg-orange-500" />
          </div>
        </div>
      </div>

      <BottomNavigation />
      {showControlsModal && <ControlsModal />}
      {showCameraModal && <CameraModal />}
    </div>
  )
}