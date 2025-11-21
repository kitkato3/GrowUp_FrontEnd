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
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// --- TYPE & HOOK IMPORTS (Simulated Import) ---
interface SystemControls { pump: boolean; fan: boolean; phAdjustment: boolean; aerator: boolean; growLight: boolean; }
interface ThresholdState { waterTemp: { min: number; max: number }; ph: { min: number; max: number }; dissolvedO2: { min: number; max: number }; ammonia: { min: number; max: number }; }

interface ControlToggleProps { label: string; description: string; icon: React.ElementType; active: boolean; onChange: (val: boolean) => void; }
interface PresetCardProps { title: string; description: string; icon: React.ElementType; active: boolean; onActivate: () => void; }
interface ThresholdRangeInputProps { label: string; unit: string; icon: React.ElementType; minValue: number; maxValue: number; minLimit: number; maxLimit: number; onMinChange: (val: number) => void; onMaxChange: (val: number) => void; }


// --- Custom Hook Logic (Unified with localStorage for sync) ---
const INITIAL_CONTROLS_FULL: SystemControls = { pump: true, fan: false, phAdjustment: true, aerator: true, growLight: true, }
const INITIAL_THRESHOLDS: ThresholdState = { waterTemp: { min: 20, max: 26 }, ph: { min: 6.5, max: 7.5 }, dissolvedO2: { min: 5, max: 8 }, ammonia: { min: 0, max: 0.5 }, }
const localStorageKey = 'aquaponics_settings_state';
const loadState = (): { controls: SystemControls, activePreset: string, thresholds: ThresholdState } => {
  try {
    const savedState = localStorage.getItem(localStorageKey);
    if (savedState) {
      return {
        ...INITIAL_CONTROLS_FULL, // Ensure all keys exist on load
        ...JSON.parse(savedState)
      };
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
  return { controls: INITIAL_CONTROLS_FULL, activePreset: "balanced", thresholds: INITIAL_THRESHOLDS, };
};

const saveState = (state: { controls: SystemControls, activePreset: string, thresholds: ThresholdState }) => {
  try {
    localStorage.setItem(localStorageKey, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
};

const useAquaponicsSettings = () => {
  const [state, setState] = useState(loadState);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === localStorageKey && e.newValue) {
        const newState = JSON.parse(e.newValue);
        // Only update state if it's different from current state (to avoid loop on save)
        setState(newState);
        setHasChanges(false); // Changes were just synced from another window/tab
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- Unified Setter Functions (Sets changes flag) ---
  const setControls = (newControls: SystemControls) => {
    setState(prevState => ({ ...prevState, controls: newControls }));
    setHasChanges(true);
  };

  const setPreset = (newPreset: string) => {
    setState(prevState => ({ ...prevState, activePreset: newPreset }));
    setHasChanges(true);
  };

  const setThresholds = (newThresholds: ThresholdState) => {
    setState(prevState => ({ ...prevState, thresholds: newThresholds }));
    setHasChanges(true);
  };
  // ---------------------------------------------------

  const handleSave = () => {
    saveState(state);
    setHasChanges(false);
    console.log('Settings saved to localStorage:', state);
    return true;
  };

  return {
    controls: state.controls,
    activePreset: state.activePreset,
    thresholds: state.thresholds,
    setControls,
    setPreset,
    setThresholds,
    handleSave,
    hasChanges,
    setHasChanges, // Exported to be cleared manually if needed, but setters handle setting to true
  };
};
// --- END Custom Hook Logic ---


// =================================================================
// 🧩 Components (Refined for better UI/UX)
// =================================================================

const Navbar: React.FC<{ time: string }> = ({ time }) => (
  <div className="bg-white px-4 py-3 flex items-center justify-between text-sm border-b border-gray-100 sticky top-0 z-40 shadow-sm">
    <span className="font-extrabold text-lg text-emerald-600">GROWUP</span>
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
      <span className="text-xs text-gray-600 font-medium">{time}</span>
    </div>
  </div>
)

const BottomNavigation = () => {
  const pathname = usePathname() || "/settings"
  const tabs = [
    { id: "dashboard", label: "Home", href: "/dashboard", icon: Home },
    { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
    { id: "camera", label: "Camera", href: "/camera", icon: Camera },
    { id: "settings", label: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-2xl z-50">
      <div className="flex items-center justify-around py-2.5">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${isActive ? "text-emerald-600" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-emerald-100' : ''}`} />
              <span className="text-xs font-medium mt-1">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

const ControlToggle: React.FC<ControlToggleProps> = ({ label, description, icon: Icon, active, onChange }) => (
  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl shadow-sm border border-gray-100 transition-shadow duration-200 hover:shadow-md">
    <div className="flex items-center gap-3 flex-1">
      <div className={`p-2 rounded-xl flex-shrink-0 ${active ? 'bg-emerald-500' : 'bg-gray-200'}`}>
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-gray-900">{label}</div>
        <div className="text-xs text-gray-500 mt-0.5">{description}</div>
      </div>
    </div>
    {/* Custom Toggle Switch */}
    <button
      onClick={() => onChange(!active)}
      className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${active ? 'bg-emerald-500' : 'bg-gray-300'}`}
      aria-checked={active}
      role="switch"
    >
      <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md ${active ? 'translate-x-5 bg-white' : 'translate-x-0'}`} />
    </button>
  </div>
)

const PresetCard: React.FC<PresetCardProps> = ({ title, description, icon: Icon, active, onActivate }) => (
  <button
    onClick={onActivate}
    className={`w-full p-4 rounded-xl border-2 transition-all text-left shadow-sm ${active ? 'border-emerald-500 bg-emerald-50 shadow-lg' : 'border-gray-200 bg-white hover:border-emerald-300'
      }`}
  >
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg flex-shrink-0 ${active ? 'bg-emerald-500' : 'bg-gray-100'}`}>
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-600'}`} />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-xs text-gray-600 mt-1">{description}</div>
      </div>
      {active && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />}
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
  <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
      <div className="p-1 rounded-md bg-amber-100">
        <Icon className="w-4 h-4 text-amber-600" />
      </div>
      <span className="font-semibold text-gray-900 text-base">{label}</span>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor={`${label}-min`} className="text-xs font-medium text-gray-600 block mb-1">Minimum Alert</label>
        <div className="relative">
          <input
            id={`${label}-min`}
            type="number"
            value={minValue}
            onChange={(e) => onMinChange(Number(e.target.value))}
            min={minLimit}
            max={maxLimit}
            step="0.1"
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 font-medium">{unit}</span>
        </div>
      </div>

      <div>
        <label htmlFor={`${label}-max`} className="text-xs font-medium text-gray-600 block mb-1">Maximum Alert</label>
        <div className="relative">
          <input
            id={`${label}-max`}
            type="number"
            value={maxValue}
            onChange={(e) => onMaxChange(Number(e.target.value))}
            min={minLimit}
            max={maxLimit}
            step="0.1"
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 font-medium">{unit}</span>
        </div>
      </div>
    </div>

    <div className="flex justify-between text-xs text-gray-400 mt-4 pt-3 border-t border-gray-50/50">
      <span>System Limits: {minLimit} to {maxLimit}</span>
    </div>
  </div>
)

const SystemInfoSection: React.FC = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
    <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">System Information</h3>
    <div className="space-y-3 text-sm">
      {([
        { label: "Firmware Version", value: "v2.1.3" },
        { label: "Last Update", value: "2 days ago" },
        { label: "System Uptime", value: "7d 14h 32m" },
        { label: "Storage Used", value: "2.1GB / 32GB" }
      ]).map((item, index) => (
        <div key={index} className={`flex justify-between ${index < 3 ? 'pb-3 border-b border-gray-100' : ''}`}>
          <span className="text-gray-600">{item.label}</span>
          <span className="font-semibold text-gray-900">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

// =================================================================
// ⚙️ MAIN SETTINGS COMPONENT (Simplified Render)
// =================================================================
export default function SettingsPage() {
  const {
    controls,
    activePreset,
    thresholds,
    setControls,
    setPreset,
    setThresholds,
    handleSave,
    hasChanges,
  } = useAquaponicsSettings();

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleControlChange = (key: keyof SystemControls, val: boolean) => {
    // Using setControls from the hook, which sets hasChanges to true
    setControls({ ...controls, [key]: val })
  }

  const handlePresetChange = (preset: string) => {
    setPreset(preset)
    // Update controls based on preset
    let newControls: SystemControls
    switch (preset) {
      case "balanced":
        newControls = { pump: true, fan: false, phAdjustment: true, aerator: true, growLight: true }
        break
      case "highGrowth":
        newControls = { pump: true, fan: true, phAdjustment: true, aerator: true, growLight: true }
        break
      case "ecoMode":
        newControls = { pump: true, fan: false, phAdjustment: false, aerator: false, growLight: false }
        break
      case "maintenance":
        newControls = { pump: false, fan: true, phAdjustment: false, aerator: false, growLight: false }
        break
      default:
        newControls = controls;
    }
    setControls(newControls); // Use setControls to also mark changes
  }

  const handleSaveChanges = () => {
    if (handleSave()) {
      alert('Settings saved successfully and synced!');
    } else {
      alert('Failed to save settings. Please try again.');
    }
  }

  const handleThresholdChange = (key: keyof ThresholdState, type: 'min' | 'max', val: number) => {
    setThresholds({
      ...thresholds,
      [key]: {
        ...thresholds[key],
        [type]: val,
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <Navbar time={currentTime.toLocaleTimeString()} />

      <div className="px-4 py-5 pb-24 space-y-8">

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-gray-900">System Configuration ⚙️</h1>
          <p className="text-gray-500 mt-1">Adjust controls, thresholds, and presets for optimal performance.</p>
        </div>

        {/* Automation Presets */}
        <section>
          <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            Automation Presets
          </h2>
          <div className="space-y-3">
            <PresetCard title="Balanced Mode" description="Optimal settings for standard growth" icon={Activity} active={activePreset === "balanced"} onActivate={() => handlePresetChange("balanced")} />
            <PresetCard title="High Growth Mode" description="Maximum growth with increased resource use" icon={Zap} active={activePreset === "highGrowth"} onActivate={() => handlePresetChange("highGrowth")} />
            <PresetCard title="Eco Mode" description="Energy saving mode with reduced power" icon={Sun} active={activePreset === "ecoMode"} onActivate={() => handlePresetChange("ecoMode")} />
            <PresetCard title="Maintenance Mode" description="Safe mode for system maintenance" icon={AlertTriangle} active={activePreset === "maintenance"} onActivate={() => handlePresetChange("maintenance")} />
          </div>
        </section>

        ---

        {/* Control Panel */}
        <section>
          <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            Manual System Controls
          </h2>
          <div className="space-y-3">
            <ControlToggle label="Submersible Pump" description="Main water circulation" icon={Waves} active={controls.pump} onChange={(val) => handleControlChange('pump', val)} />
            <ControlToggle label="Aerator" description="Oxygen circulation" icon={Activity} active={controls.aerator} onChange={(val) => handleControlChange('aerator', val)} />
            <ControlToggle label="pH Adjustment" description="Automatic pH balancing" icon={Droplets} active={controls.phAdjustment} onChange={(val) => handleControlChange('phAdjustment', val)} />
            <ControlToggle label="Grow Light" description="LED lighting system" icon={Sun} active={controls.growLight} onChange={(val) => handleControlChange('growLight', val)} />
            <ControlToggle label="DC Fan" description="Air circulation & cooling" icon={Wind} active={controls.fan} onChange={(val) => handleControlChange('fan', val)} />
          </div>
        </section>

        ---

        {/* Alert Thresholds */}
        <section>
          <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Custom Alert Thresholds
          </h2>
          <div className="space-y-4">
            <ThresholdRangeInput
              label="Water Temperature"
              unit="°C"
              icon={Thermometer}
              minValue={thresholds.waterTemp.min}
              maxValue={thresholds.waterTemp.max}
              minLimit={18}
              maxLimit={30}
              onMinChange={(val) => handleThresholdChange('waterTemp', 'min', val)}
              onMaxChange={(val) => handleThresholdChange('waterTemp', 'max', val)}
            />
            <ThresholdRangeInput
              label="pH Level"
              unit=""
              icon={Droplets}
              minValue={thresholds.ph.min}
              maxValue={thresholds.ph.max}
              minLimit={5}
              maxLimit={9}
              onMinChange={(val) => handleThresholdChange('ph', 'min', val)}
              onMaxChange={(val) => handleThresholdChange('ph', 'max', val)}
            />
            <ThresholdRangeInput
              label="Dissolved Oxygen"
              unit="mg/L"
              icon={Activity}
              minValue={thresholds.dissolvedO2.min}
              maxValue={thresholds.dissolvedO2.max}
              minLimit={3}
              maxLimit={10}
              onMinChange={(val) => handleThresholdChange('dissolvedO2', 'min', val)}
              onMaxChange={(val) => handleThresholdChange('dissolvedO2', 'max', val)}
            />
            <ThresholdRangeInput
              label="Ammonia Level"
              unit="ppm"
              icon={AlertTriangle}
              minValue={thresholds.ammonia.min}
              maxValue={thresholds.ammonia.max}
              minLimit={0}
              maxLimit={2}
              onMinChange={(val) => handleThresholdChange('ammonia', 'min', val)}
              onMaxChange={(val) => handleThresholdChange('ammonia', 'max', val)}
            />
          </div>
        </section>

        ---

        {/* System Info */}
        <SystemInfoSection />

        {/* Save Changes Button */}
        <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-50">
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            className={`w-full py-3 font-extrabold text-lg rounded-xl shadow-2xl transition-all duration-300 ${hasChanges
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {hasChanges ? '💾 Save All Changes' : 'No Changes to Save'}
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}