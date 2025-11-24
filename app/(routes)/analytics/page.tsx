"use client"

import React, { useState, useEffect } from "react"
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend } from "recharts"
import { Fish, Droplets, Download, Calendar, Filter, Home, Camera, Settings, BarChart3, Clock } from "lucide-react"
// Removed Next.js routing imports to fix compilation errors

type SensorKey = "waterTemp" | "ph" | "dissolvedO2" | "airTemp" | "lightIntensity" | "waterLevel" | "waterFlow" | "humidity" | "ammonia" | "airPressure"
type SensorState = Record<SensorKey, boolean>
type SensorTrendRow = { time: string } & Record<SensorKey, number>
type CurrentView = 'dashboard' | 'analytics' | 'camera' | 'settings'; // Added for state-based navigation

/* MOCK DATA */
const WEEKLY_GROWTH_DATA = [
  { day: "Mon", height: 12.5, leaves: 8, health: 92 }, { day: "Tue", height: 13.2, leaves: 9, health: 94 }, { day: "Wed", height: 14.1, leaves: 10, health: 95 }, { day: "Thu", height: 15.3, leaves: 11, health: 96 }, { day: "Fri", height: 16.8, leaves: 12, health: 97 }, { day: "Sat", height: 18.2, leaves: 13, health: 98 }, { day: "Sun", height: 19.5, leaves: 14, health: 99 },
]

// Removed 'nitrates' data field from all rows
const SENSOR_TREND_DATA: SensorTrendRow[] = [
  { time: "00:00", waterTemp: 22.5, ph: 6.8, dissolvedO2: 8.2, airTemp: 24, lightIntensity: 0, waterLevel: 85, waterFlow: 12, humidity: 65, ammonia: 0.02, airPressure: 1012.5 },
  { time: "04:00", waterTemp: 22.2, ph: 6.9, dissolvedO2: 8.5, airTemp: 23, lightIntensity: 0, waterLevel: 84, waterFlow: 12, humidity: 68, ammonia: 0.01, airPressure: 1014.1 },
  { time: "08:00", waterTemp: 23.1, ph: 7.0, dissolvedO2: 8.1, airTemp: 26, lightIntensity: 450, waterLevel: 83, waterFlow: 13, humidity: 62, ammonia: 0.02, airPressure: 1015.3 },
  { time: "12:00", waterTemp: 24.5, ph: 7.1, dissolvedO2: 7.8, airTemp: 29, lightIntensity: 850, waterLevel: 82, waterFlow: 13, humidity: 58, ammonia: 0.03, airPressure: 1013.8 },
  { time: "16:00", waterTemp: 24.8, ph: 7.0, dissolvedO2: 7.6, airTemp: 28, lightIntensity: 620, waterLevel: 81, waterFlow: 12, humidity: 60, ammonia: 0.02, airPressure: 1011.0 },
  { time: "20:00", waterTemp: 23.5, ph: 6.9, dissolvedO2: 8.0, airTemp: 25, lightIntensity: 120, waterLevel: 82, waterFlow: 12, humidity: 64, ammonia: 0.02, airPressure: 1012.2 },
]

/* SENSOR CONFIGURATION */
const sensorConfig: { key: SensorKey; name: string; color: string; unit: string; format: (val: number) => string }[] = [
  { key: "waterTemp", name: "Water Temp (DS18B20)", color: "#3b82f6", unit: "°C", format: (v) => v.toFixed(1) },
  { key: "ph", name: "pH Level (PH4502C)", color: "#8b5cf6", unit: "", format: (v) => v.toFixed(1) },
  { key: "dissolvedO2", name: "Dissolved O₂ (DO Sensor)", color: "#10b981", unit: "mg/L", format: (v) => v.toFixed(1) },
  { key: "airTemp", name: "Air Temp (BME280)", color: "#f59e0b", unit: "°C", format: (v) => v.toFixed(0) },
  { key: "lightIntensity", name: "Light (BH1750)", color: "#eab308", unit: "lux", format: (v) => v.toFixed(0) },
  { key: "humidity", name: "Humidity (BME280)", color: "#14b8a6", unit: "%", format: (v) => v.toFixed(0) },
  { key: "airPressure", name: "Air Pressure (BME280)", color: "#ef4444", unit: "hPa", format: (v) => v.toFixed(1) },
  { key: "waterLevel", name: "Water Level (HC SR04)", color: "#06b6d4", unit: "%", format: (v) => v.toFixed(0) },
  { key: "waterFlow", name: "Flow Rate (YF-S201)", color: "#6366f1", unit: "L/min", format: (v) => v.toFixed(0) },
  { key: "ammonia", name: "Ammonia (MQ137)", color: "#f97316", unit: "ppm", format: (v) => v.toFixed(2) },
]

/* UTILITY FUNCTIONS */

const formatDate = () => {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

const downloadCSV = (filename: string, headers: string[], rows: any[][]) => {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

/* NAVIGATION COMPONENTS (State-based to fix compilation) */

const Navbar: React.FC<{ time: string }> = ({ time }) => (
  <div className="bg-white px-4 py-2.5 flex items-center justify-between text-sm border-b border-gray-100 sticky top-0 z-40">
    <span className="font-bold text-gray-900">GROWUP</span>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
      <span className="text-xs text-gray-600">{time}</span>
    </div>
  </div>
);

// UPDATED: State-based navigation component
const BottomNavigation: React.FC<{ currentView: CurrentView, setView: (view: CurrentView) => void }> = ({ currentView, setView }) => {
  const tabs = [
    { id: "dashboard", label: "Home", icon: Home, view: 'dashboard' as CurrentView },
    { id: "analytics", label: "Analytics", icon: BarChart3, view: 'analytics' as CurrentView },
    { id: "camera", label: "Camera", icon: Camera, view: 'camera' as CurrentView },
    { id: "settings", label: "Settings", icon: Settings, view: 'settings' as CurrentView },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around py-3">
        {tabs.map((tab) => {
          const isActive = tab.view === currentView;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.view)}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${isActive ? "text-emerald-600 bg-emerald-50" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* SENSOR READINGS TABLE */
const SensorReadingsTable: React.FC<{ latestData: SensorTrendRow }> = ({ latestData }) => {
  const displayConfig = sensorConfig;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <h3 className="font-bold text-lg text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-500" />
        Live Sensor Readings <span className="text-xs font-normal text-gray-500 ml-auto">@ {latestData.time}</span>
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {displayConfig.map((sensor) => (
          <div
            key={sensor.key}
            className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between"
          >
            <span className="text-xs font-medium text-gray-700">{sensor.name.split('(')[0].trim()}</span>
            <span className="text-sm font-bold" style={{ color: sensor.color }}>
              {sensor.format(latestData[sensor.key])} {sensor.unit}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">Tap "Sensor Trends" below for full list & history.</p>
    </div>
  );
};

// Placeholder content for non-analytics views - NOW RETURNS JSX directly
const PlaceholderContent: React.FC<{ title: string, subtitle: string, icon: React.ReactNode }> = ({ title, subtitle, icon }) => (
  <div className="p-8 text-center min-h-[70vh] flex flex-col items-center justify-center">
    {icon}
    <h2 className="text-3xl font-bold text-gray-800 mt-4 mb-2">{title}</h2>
    <p className="text-gray-500">{subtitle}</p>
  </div>
);

// Extracted Analytics content into its own component for conditional rendering
const AnalyticsContent: React.FC<any> = ({
  selectedSensors, setSelectedSensors, selectedRange, setSelectedRange, showFilters, setShowFilters,
  sensorExportRange, setSensorExportRange, customGrowthStartDate, customGrowthEndDate,
  customSensorStartDate, customSensorEndDate, dateWarning, handleDateChange,
  exportGrowthDataCSV, exportSensorDataCSV, exportAllData, toggleSensor,
  selectAllSensors, deselectAllSensors, latestSensorReading
}) => {
  const filteredGrowthData =
    selectedRange === "thisWeek" || selectedRange === "customGrowth"
      ? WEEKLY_GROWTH_DATA
      : selectedRange === "lastWeek"
        ? WEEKLY_GROWTH_DATA.slice(1)
        : WEEKLY_GROWTH_DATA.slice(2)

  const lastGrowth = filteredGrowthData[filteredGrowthData.length - 1]
  const activeCount = Object.values(selectedSensors).filter(Boolean).length

  return (
    <div className="space-y-5">

      {/* 1. Live Sensor Readings Table */}
      <SensorReadingsTable latestData={latestSensorReading} />

      {/* EXPORT ALL BUTTON */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-4 border border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Export Complete Analytics</h3>
            <p className="text-xs text-gray-600 mt-1">
              Download all growth and sensor data in one file
            </p>
          </div>
          <button
            onClick={exportAllData}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>
      </div>

      {/* GROWTH CHART */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Weekly Plant Growth</h3>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium"
            >
              <Filter className="w-3.5 h-3.5" />
              {showFilters ? "Hide" : "Filters"}
            </button>

            <button
              onClick={exportGrowthDataCSV}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Filter Dropdown (Updated with Custom Range Date Pickers) */}
        {showFilters && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <label className="text-xs font-semibold text-gray-700 block mb-2">
              <Calendar className="w-3.5 h-3.5 inline mr-1" />
              Time Period (Chart Display & Export Range)
            </label>
            <select
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={selectedRange}
              onChange={(e) => {
                setSelectedRange(e.target.value);
              }}
            >
              <option value="thisWeek">This Week</option>
              <option value="lastWeek">Last Week</option>
              <option value="twoWeeks">Last 2 Weeks</option>
              <option value="customGrowth">Custom Range (Mock)</option>
            </select>

            {selectedRange === "customGrowth" && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-700">Select Date Range (Max 7 Days)</p>
                <input
                  type="date"
                  value={customGrowthStartDate}
                  onChange={(e) => handleDateChange('growth', 'start', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="date"
                  value={customGrowthEndDate}
                  onChange={(e) => handleDateChange('growth', 'end', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
                {selectedRange === "customGrowth" && dateWarning && <p className="text-xs text-red-600 font-medium">{dateWarning}</p>}
              </div>
            )}
          </div>
        )}

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredGrowthData}>
              <defs>
                <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
              />

              <Area
                type="monotone"
                dataKey="height"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorHeight)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600">Current Height</div>
            <div className="text-2xl font-bold text-emerald-600">
              {lastGrowth?.height ?? "—"}cm
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600">Weekly Growth</div>
            <div className="text-2xl font-bold text-blue-600">
              {filteredGrowthData.length > 1
                ? `+${(
                  lastGrowth.height -
                  filteredGrowthData[0].height
                ).toFixed(1)}cm`
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* SENSOR TRENDS */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">

        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900">Sensor Data Export</h3>

          <div className="flex items-center gap-2">
            {/* Export Range Selection */}
            <select
              className="px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={sensorExportRange}
              onChange={(e) => {
                setSensorExportRange(e.target.value);
                // Clear warning when switching out of custom mode
                if (e.target.value !== "custom") {
                  setDateWarning("");
                }
              }}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="48h">Last 48 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="custom">Custom Range (Mock)</option>
            </select>

            <button
              onClick={exportSensorDataCSV}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Custom Range Date Pickers for Sensor Data */}
        {sensorExportRange === "custom" && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Select Date Range (Max 7 Days)</p>
            <div className="flex gap-2">
              <input
                type="date"
                value={customSensorStartDate}
                onChange={(e) => handleDateChange('sensor', 'start', e.target.value)}
                className="w-1/2 p-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="date"
                value={customSensorEndDate}
                onChange={(e) => handleDateChange('sensor', 'end', e.target.value)}
                className="w-1/2 p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            {sensorExportRange === "custom" && dateWarning && <p className="text-xs text-red-600 font-medium mt-2">{dateWarning}</p>}
          </div>
        )}

        <h4 className="font-semibold text-gray-700 text-sm mb-3">24-Hour Sensor Trends ({activeCount} selected)</h4>

        {/* Quick Select Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={selectAllSensors}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
          >
            Select All
          </button>
          <button
            onClick={deselectAllSensors}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
          >
            Clear All
          </button>
          <span className="ml-auto text-xs text-gray-500 self-center">
            {activeCount} / {sensorConfig.length} visible
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {sensorConfig.map((sensor) => {
            const active = selectedSensors[sensor.key]
            return (
              <button
                key={sensor.key}
                onClick={() => toggleSensor(sensor.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${active ? "bg-white text-gray-900 border-2 shadow-sm" : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                style={{ borderColor: active ? sensor.color : undefined }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: sensor.color }}
                ></span>
                {sensor.name.split('(')[0].trim()}
              </button>
            )
          })}
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SENSOR_TREND_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              <XAxis
                dataKey="time"
                stroke="#9ca3af"
                tick={{ fill: "#6b7280", fontSize: 11 }}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: "#6b7280", fontSize: 11 }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
              />

              <Legend wrapperStyle={{ fontSize: "10px", paddingTop: 10 }} />

              {sensorConfig.map(sensor =>
                selectedSensors[sensor.key] && (
                  <Line
                    key={sensor.key}
                    type="monotone"
                    dataKey={sensor.key}
                    stroke={sensor.color}
                    strokeWidth={2.5}
                    dot={false}
                    name={sensor.name.split('(')[0].trim()} // Clean name for legend
                    activeDot={{ r: 5 }}
                  />
                )
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HEALTH METRICS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Fish className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-gray-900">Fish Health</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">Excellent</div>
          <div className="text-xs text-gray-500 mt-2">Ammonia: {SENSOR_TREND_DATA[SENSOR_TREND_DATA.length - 1].ammonia} ppm</div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
            <div className="h-full w-4/5 bg-emerald-500"></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-gray-900">Water Quality</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">95%</div>
          <div className="text-xs text-gray-500 mt-2">Optimal range</div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
            <div className="h-full w-11/12 bg-emerald-500"></div>
          </div>
        </div>
      </div>
    </div>
  )
}


/* MAIN COMPONENT */
export default function Analytics() {
  // NEW STATE: View control
  const [view, setView] = useState<CurrentView>('analytics');

  const [selectedSensors, setSelectedSensors] = useState<SensorState>({
    waterTemp: true,
    ph: true,
    dissolvedO2: true,
    airTemp: false,
    lightIntensity: false,
    waterLevel: false,
    waterFlow: false,
    humidity: false,
    ammonia: false,
    airPressure: false,
  } as SensorState)

  const [selectedRange, setSelectedRange] = useState("thisWeek")
  const [showFilters, setShowFilters] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sensorExportRange, setSensorExportRange] = useState("24h")

  // States for Custom Range Dates
  const [customGrowthStartDate, setCustomGrowthStartDate] = useState(formatDate());
  const [customGrowthEndDate, setCustomGrowthEndDate] = useState(formatDate());
  const [customSensorStartDate, setCustomSensorStartDate] = useState(formatDate());
  const [customSensorEndDate, setCustomSensorEndDate] = useState(formatDate());
  const [dateWarning, setDateWarning] = useState("");

  // Helper function to calculate date difference
  const getDaysDifference = (start: string, end: string) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(start);
    const secondDate = new Date(end);
    return Math.abs(Math.round((firstDate.getTime() - secondDate.getTime()) / oneDay));
  };

  // Consolidated handler for all date changes
  const handleDateChange = (type: 'growth' | 'sensor', key: 'start' | 'end', value: string) => {
    let start, end;

    // 1. Update state
    if (type === 'growth') {
      if (key === 'start') {
        start = value;
        end = customGrowthEndDate;
        setCustomGrowthStartDate(value);
      } else {
        start = customGrowthStartDate;
        end = value;
        setCustomGrowthEndDate(value);
      }
    } else { // sensor
      if (key === 'start') {
        start = value;
        end = customSensorEndDate;
        setCustomSensorStartDate(value);
      } else {
        start = customSensorStartDate;
        end = value;
        setCustomSensorEndDate(value);
      }
    }

    // 2. Validate
    let currentWarning = "";

    if (new Date(start) > new Date(end)) {
      currentWarning = "Start date cannot be after the end date.";
    }

    const daysDiff = getDaysDifference(start, end);
    if (daysDiff > 7 && currentWarning === "") {
      currentWarning = `Maximum range is 7 days. You selected ${daysDiff} days.`;
    }

    setDateWarning(currentWarning);
  };

  /* EXPORT LOGIC */

  // Reusing mock filtering logic from before
  const filteredGrowthData =
    selectedRange === "thisWeek" || selectedRange === "customGrowth"
      ? WEEKLY_GROWTH_DATA
      : selectedRange === "lastWeek"
        ? WEEKLY_GROWTH_DATA.slice(1)
        : WEEKLY_GROWTH_DATA.slice(2)

  const exportGrowthDataCSV = () => {
    let filename = `plant_growth_${selectedRange}_${formatDate()}.csv`;

    if (selectedRange === "customGrowth") {
      if (dateWarning) {
        // Using a mock confirmation/alert to inform user about the validation error
        alert(`Cannot export: Please fix the date range issue first. Error: ${dateWarning}`);
        return;
      }
      filename = `plant_growth_${customGrowthStartDate}_to_${customGrowthEndDate}.csv`;
    }

    const headers = ["Day", "Height (cm)", "Leaves", "Health (%)"]
    const rows = filteredGrowthData.map((d) => [d.day, d.height, d.leaves, d.health])
    downloadCSV(filename, headers, rows)
  }

  const exportSensorDataCSV = () => {
    if (sensorExportRange === "custom" && dateWarning) {
      alert(`Cannot export: Please fix the date range issue first. Error: ${dateWarning}`);
      return;
    }

    const activeKeys = Object.entries(selectedSensors).filter(([_, isActive]) => isActive).map(([key]) => key as SensorKey)
    let filename = `sensor_data_${sensorExportRange}_${formatDate()}.csv`;

    if (sensorExportRange === "custom") {
      filename = `sensor_data_${customSensorStartDate}_to_${customSensorEndDate}.csv`;
    }

    const headers = ["Time", ...activeKeys.map(k => sensorConfig.find(s => s.key === k)?.name || k)]

    let exportedData = SENSOR_TREND_DATA;
    if (sensorExportRange === "48h") {
      exportedData = [...SENSOR_TREND_DATA, ...SENSOR_TREND_DATA.map(d => ({ ...d, time: `Day2 ${d.time}` }))];
    } else if (sensorExportRange === "7d" || sensorExportRange === "custom") {
      exportedData = [...SENSOR_TREND_DATA, ...SENSOR_TREND_DATA, ...SENSOR_TREND_DATA, ...SENSOR_TREND_DATA];
    }

    const rows = exportedData.map((entry) => [entry.time, ...activeKeys.map((key) => entry[key])])
    downloadCSV(filename, headers, rows)
  }

  const exportAllData = () => {
    const filename = `complete_analytics_${formatDate()}.csv`
    const headers = ["Type", "Day/Time", "Value1", "Value2", "Value3", "Value4"]

    const growthRows = filteredGrowthData.map(d => ["Growth", d.day, `Height: ${d.height}cm`, `Leaves: ${d.leaves}`, `Health: ${d.health}%`, ""])
    const sensorRows = SENSOR_TREND_DATA.map(d => ["Sensor", d.time, `Water: ${d.waterTemp}°C`, `pH: ${d.ph}`, `DO2: ${d.dissolvedO2}`, `Light: ${d.lightIntensity}lux`])

    downloadCSV(filename, headers, [...growthRows, [""], ...sensorRows])
  }

  // Sensor toggle and selection logic
  const toggleSensor = (key: SensorKey) => {
    setSelectedSensors(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const selectAllSensors = () => {
    const allTrue = Object.keys(selectedSensors).reduce((acc, key) => ({ ...acc, [key]: true }), {} as SensorState)
    setSelectedSensors(allTrue)
  }

  const deselectAllSensors = () => {
    const allFalse = Object.keys(selectedSensors).reduce((acc, key) => ({ ...acc, [key]: false }), {} as SensorState)
    setSelectedSensors(allFalse)
  }

  const latestSensorReading = SENSOR_TREND_DATA[SENSOR_TREND_DATA.length - 1]
  const activeCount = Object.values(selectedSensors).filter(Boolean).length


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Config map to hold titles and descriptions for navigation views
  const VIEWS_CONFIG = {
    'dashboard': {
      title: 'Home Dashboard',
      subtitle: 'This is the main screen for quick system status overview.',
      icon: <Home className="w-16 h-16 text-emerald-500" />
    },
    'camera': {
      title: 'Camera Feed & Controls',
      subtitle: 'Access live video and take snapshots of your growing system.',
      icon: <Camera className="w-16 h-16 text-blue-500" />
    },
    'settings': {
      title: 'System Settings',
      subtitle: 'Configure alerts, sensor calibration, and environment controls.',
      icon: <Settings className="w-16 h-16 text-orange-500" />
    },
    'analytics': {
      title: 'Analytics Dashboard',
      subtitle: 'Monitor your aquaponics system performance.'
    },
  };

  const renderContent = () => {
    const config = VIEWS_CONFIG[view] || VIEWS_CONFIG['analytics'];

    if (view === 'analytics') {
      return (
        <AnalyticsContent
          selectedSensors={selectedSensors}
          setSelectedSensors={setSelectedSensors}
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          sensorExportRange={sensorExportRange}
          setSensorExportRange={setSensorExportRange}
          customGrowthStartDate={customGrowthStartDate}
          customGrowthEndDate={customGrowthEndDate}
          customSensorStartDate={customSensorStartDate}
          customSensorEndDate={customSensorEndDate}
          dateWarning={dateWarning}
          handleDateChange={handleDateChange}
          exportGrowthDataCSV={exportGrowthDataCSV}
          exportSensorDataCSV={exportSensorDataCSV}
          exportAllData={exportAllData}
          toggleSensor={toggleSensor}
          selectAllSensors={selectAllSensors}
          deselectAllSensors={deselectAllSensors}
          latestSensorReading={latestSensorReading}
        />
      );
    } else {
      // Render Placeholder using the config data
      return (
        <PlaceholderContent
          title={config.title}
          subtitle={config.subtitle}
          icon={config.icon}
        />
      );
    }
  }


  /* RENDER */
  const currentConfig = VIEWS_CONFIG[view] || VIEWS_CONFIG['analytics'];

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <Navbar time={currentTime.toLocaleTimeString()} />

      <div className="px-4 py-5 pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {currentConfig.title}
          </h1>
          <p className="text-gray-600 mt-1">
            {currentConfig.subtitle}
          </p>
        </div>
        {renderContent()}
      </div>

      <BottomNavigation currentView={view} setView={setView} />
    </div>
  )
}