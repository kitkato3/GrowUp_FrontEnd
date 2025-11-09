export const SENSOR_UPDATE_INTERVAL = 3000 // 3 seconds

export const SENSOR_RANGES = {
  waterTemp: { min: 20, max: 25 },
  ph: { min: 6.5, max: 7.5 },
  dissolvedO2: { min: 6.5, max: 8.0 },
  lightIntensity: { min: 300, max: 600 },
  waterLevel: { min: 70, max: 100 },
  waterFlow: { min: 0.8, max: 1.5 },
  humidity: { min: 50, max: 80 },
  ammonia: { min: 0, max: 0.05 },
}

export const ALERT_THRESHOLD_DEFAULTS = [
  { label: "pH Range", min: "6.0", max: "7.0" },
  { label: "Water Temp (°C)", min: "20", max: "25" },
  { label: "Dissolved O₂ (mg/L)", min: "6.5", max: "8.0" },
]

export const AUTOMATION_PRESETS = [
  { name: "Morning Boost", time: "06:00 AM", active: true },
  { name: "Evening Cycle", time: "06:00 PM", active: true },
  { name: "Night Mode", time: "10:00 PM", active: false },
]

export const PLANT_DETECTIONS = [
  { name: "Kale Plant #1", status: "Healthy" as const, color: "emerald" as const },
  { name: "Kale Plant #2", status: "Growing" as const, color: "emerald" as const },
  { name: "Kale Plant #3", status: "Monitor" as const, color: "amber" as const },
  { name: "Kale Plant #4", status: "Ready Soon" as const, color: "emerald" as const },
]

export const WEEKLY_GROWTH_DATA = [
  { day: "Mon", height: 12.5, leaves: 6, health: 85 },
  { day: "Tue", height: 13.2, leaves: 7, health: 87 },
  { day: "Wed", height: 14.1, leaves: 8, health: 89 },
  { day: "Thu", height: 14.8, leaves: 9, health: 91 },
  { day: "Fri", height: 15.6, leaves: 10, health: 92 },
  { day: "Sat", height: 16.2, leaves: 11, health: 93 },
  { day: "Sun", height: 17.1, leaves: 12, health: 94 },
]

export const SENSOR_TREND_DATA = [
  { time: "00:00", temp: 22.1, ph: 6.7, do: 7.0 },
  { time: "04:00", temp: 21.8, ph: 6.8, do: 7.2 },
  { time: "08:00", temp: 22.5, ph: 6.9, do: 7.1 },
  { time: "12:00", temp: 23.2, ph: 6.8, do: 6.9 },
  { time: "16:00", temp: 22.8, ph: 6.7, do: 7.3 },
  { time: "20:00", temp: 22.3, ph: 6.8, do: 7.2 },
]

export const INITIAL_SENSOR_DATA = {
  airTemp: 26.5,
  waterTemp: 22.3,
  humidity: 68,
  ph: 6.8,
  waterLevel: 85,
  waterFlow: 1.2,
  ammonia: 0.02,
  nitrates: 5.2,
  dissolvedO2: 7.1,
  lightIntensity: 450,
}

export const INITIAL_CONTROLS = {
  pump: true,
  fan: true,
  phAdjustment: false,
  aerator: true,
}

export const ALERTS_DATA = [
  {
    id: 1,
    type: "warning" as const,
    severity: "medium" as const,
    title: "pH Level Alert",
    message: "pH slightly elevated (6.8). Recommend monitoring.",
    time: "2 min ago",
    action: "Monitor",
  },
  {
    id: 2,
    type: "success" as const,
    severity: "low" as const,
    title: "System Optimal",
    message: "Water flow rate and temperature within ideal range.",
    time: "5 min ago",
    action: "Dismiss",
  },
  {
    id: 3,
    type: "info" as const,
    severity: "low" as const,
    title: "Maintenance Due",
    message: "Filter cleaning recommended in 3 days.",
    time: "1 hour ago",
    action: "Schedule",
  },
]
