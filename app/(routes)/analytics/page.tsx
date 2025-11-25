"use client"

import React, { useState, useEffect, useCallback } from "react"
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend } from "recharts"
import { Fish, Droplets, Download, Calendar, Filter, Home, Camera, Settings, BarChart3, Clock } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

/*TYPES*/

type SensorKey = "waterTemp" | "ph" | "dissolvedO2" | "airTemp" | "lightIntensity" | "waterLevel" | "waterFlow" | "humidity" | "ammonia" | "airPressure"
type SensorState = Record<SensorKey, boolean>
type SensorTrendRow = { time: string } & Record<SensorKey, number>
type GrowthRow = { day: string, height: number, leaves: number, health: number };

/* MOCK DATA (Retained for fallback and sensor config reference, but no longer the main data source) */

const WEEKLY_GROWTH_DATA: GrowthRow[] = [
  // ... (Your mock data content remains for reference)
  { day: "W1 Mon", height: 12.5, leaves: 8, health: 92 }, { day: "W1 Tue", height: 13.2, leaves: 9, health: 94 }, { day: "W1 Wed", height: 14.1, leaves: 10, health: 95 }, { day: "W1 Thu", height: 15.3, leaves: 11, health: 96 }, { day: "W1 Fri", height: 16.8, leaves: 12, health: 97 }, { day: "W1 Sat", height: 18.2, leaves: 13, health: 98 }, { day: "W1 Sun", height: 19.5, leaves: 14, health: 99 },
  { day: "W2 Mon", height: 20.0, leaves: 15, health: 99 }, { day: "W2 Tue", height: 20.5, leaves: 16, health: 99 }, { day: "W2 Wed", height: 21.1, leaves: 17, health: 98 }, { day: "W2 Thu", height: 21.6, leaves: 18, health: 97 }, { day: "W2 Fri", height: 22.3, leaves: 19, health: 97 }, { day: "W2 Sat", height: 23.0, leaves: 20, health: 98 }, { day: "W2 Sun", height: 23.5, leaves: 21, health: 99 },
]

const SENSOR_TREND_DATA: SensorTrendRow[] = [
  // ... (Your mock data content remains for reference)
  { time: "00:00", waterTemp: 22.5, ph: 6.8, dissolvedO2: 8.2, airTemp: 24.0, lightIntensity: 0, waterLevel: 85, waterFlow: 12, humidity: 65, ammonia: 0.02, airPressure: 1012.5 },
  { time: "01:00", waterTemp: 22.3, ph: 6.8, dissolvedO2: 8.3, airTemp: 23.5, lightIntensity: 0, waterLevel: 84, waterFlow: 12, humidity: 67, ammonia: 0.02, airPressure: 1013.0 },
  // ... (Other 22 entries)
  { time: "23:00", waterTemp: 22.7, ph: 6.8, dissolvedO2: 8.2, airTemp: 24.1, lightIntensity: 0, waterLevel: 85, waterFlow: 12, humidity: 65, ammonia: 0.02, airPressure: 1012.5 },
]

// 💡 API URL DEFINITIONS (Dito dapat sila naka-define)
const API_BASE_URL = "http://192.168.1.10:5000/api/";
const LIVE_SENSOR_API_URL = `${API_BASE_URL}sensors/latest`;

// 1. Fetch Live Readings (Polling)
async function fetchLatestSensorData(): Promise<SensorTrendRow> {
  try {
    const response = await fetch(LIVE_SENSOR_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch live sensor data:", error);
    throw error;
  }
}

// 2. Fetch Historical Data (Charts)
async function fetchHistoricalData(type: 'growth' | 'sensor', start: string, end: string, range: string): Promise<any[]> {
  const endpoint = type === 'growth' ? 'growth/history' : 'sensors/history';
  const params = new URLSearchParams({
    start_date: start,
    end_date: end,
    range: range,
  });

  try {
    const url = `${API_BASE_URL}${endpoint}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch historical data:", error);
    throw error;
  }
}


/* SENSOR CONFIGURATION (Global, detailed version) */
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

/* NAVIGATION COMPONENTS (Local definitions) */

const Navbar: React.FC<{ time: string }> = ({ time }) => (
  <div className="bg-white px-4 py-2.5 flex items-center justify-between text-sm border-b border-gray-100 sticky top-0 z-40">
    <span className="font-bold text-gray-900">GROWUP</span>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
      <span className="text-xs text-gray-600">{time}</span>
    </div>
  </div>
);

const BottomNavigation = () => {
  const pathname = usePathname();
  const tabs = [
    { id: "dashboard", label: "Home", href: "/dashboard", icon: Home },
    { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart3 },
    { id: "camera", label: "Camera", href: "/camera", icon: Camera },
    { id: "settings", label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around py-3">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link key={tab.id} href={tab.href} className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${isActive ? "text-emerald-600 bg-emerald-50" : "text-gray-500 hover:text-gray-700"}`}>
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-semibold">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

/* SENSOR READINGS TABLE */
const SensorReadingsTable: React.FC<{ latestData: SensorTrendRow | null }> = ({ latestData }) => {
  const displayConfig = sensorConfig;

  // 💡 Added check for loading state
  if (!latestData) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 min-h-[150px] flex items-center justify-center">
        <p className="text-gray-500 font-semibold text-sm">Fetching Live Readings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <h3 className="font-bold text-lg text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-500" />
        Live Sensor Readings <span className="text-xs font-normal text-gray-500 ml-auto">@ {latestData.time.substring(0, 8)}</span>
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {displayConfig.map((sensor) => (
          <div
            key={sensor.key}
            className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between"
          >
            <span className="text-xs font-medium text-gray-700">{sensor.name.split('(')[0].trim()}</span>
            <span className="text-sm font-bold" style={{ color: sensor.color }}>
              {sensor.format(latestData[sensor.key as SensorKey])} {sensor.unit}
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

// Extracted Analytics content component (kept but unused in the final component export)
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
      {/* This entire block is skipped as the main Analytics function renders the content directly */}
    </div>
  )
}


/* MAIN COMPONENT */
export default function Analytics() {
  // NEW STATE: View control
  const [view, setView] = useState('analytics');

  // 💡 API DATA STATES 
  const [latestSensorReading, setLatestSensorReading] = useState<SensorTrendRow | null>(null);
  const [growthData, setGrowthData] = useState<GrowthRow[]>([]);
  const [sensorTrendData, setSensorTrendData] = useState<SensorTrendRow[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading indicator

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
  const [showGrowthFilters, setShowGrowthFilters] = useState(false)
  const [showSensorFilters, setShowSensorFilters] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sensorExportRange, setSensorExportRange] = useState("24h")

  // States for Custom Range Dates
  const [customGrowthStartDate, setCustomGrowthStartDate] = useState(formatDate());
  const [customGrowthEndDate, setCustomGrowthEndDate] = useState(formatDate());
  const [customSensorStartDate, setCustomSensorStartDate] = useState(formatDate());
  const [customSensorEndDate, setCustomSensorEndDate] = useState(formatDate());
  const [dateWarning, setDateWarning] = useState("");

  // --- DATA FETCHING FUNCTIONS (GUMAGAMIT NG useCallback) ---

  // 1. Live Reading function (pino-poll)
  const fetchLiveSensorReading = useCallback(async () => {
    try {
      const data = await fetchLatestSensorData();
      setLatestSensorReading(data);
    } catch (error) {
      console.error("Error fetching live sensor data:", error);
      setLatestSensorReading(null); // Set to null/handle error in UI
    }
  }, []);

  // 2. Historical Charts function (Growth & Trends)
  const fetchHistoricalChartsData = useCallback(async (type: 'growth' | 'sensor', range: string, start: string = customGrowthStartDate, end: string = customGrowthEndDate) => {
    setIsLoading(true);
    try {
      const data = await fetchHistoricalData(type, start, end, range);
      if (type === 'growth') {
        setGrowthData(data as GrowthRow[]);
      } else {
        setSensorTrendData(data as SensorTrendRow[]);
      }
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
      if (type === 'growth') { setGrowthData([]); }
      else { setSensorTrendData([]); }
    } finally {
      setIsLoading(false);
    }
  }, [customGrowthStartDate, customGrowthEndDate]);


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
    setDateWarning(currentWarning);
  };

  // 💡 Handler to apply custom filter and trigger API call
  const applyCustomDateFilter = (type: 'growth' | 'sensor') => {
    if (dateWarning) return;

    if (type === 'growth') {
      fetchHistoricalChartsData('growth', 'customGrowth', customGrowthStartDate, customGrowthEndDate);
      setSelectedRange('customGrowth');
    } else {
      fetchHistoricalChartsData('sensor', 'custom', customSensorStartDate, customSensorEndDate);
      setSensorExportRange('custom');
    }
  }


  // 💡 DATA MAPPING: Gumagamit na ng state data
  const filteredGrowthData = growthData;
  const filteredSensorData = sensorTrendData;

  const lastGrowth = filteredGrowthData[filteredGrowthData.length - 1]
  const activeCount = Object.values(selectedSensors).filter(Boolean).length


  /* EXPORT: Plant Growth CSV */
  const exportGrowthDataCSV = () => {
    // Ang data ay galing na sa `filteredGrowthData` state
    const filename = `plant_growth_${selectedRange}_${formatDate()}.csv`
    const headers = ["Day", "Height (cm)", "Leaves", "Health (%)"] // Removed Mock Date

    const rows = filteredGrowthData.map((d: GrowthRow) => {
      return [
        d.day,
        d.height,
        d.leaves,
        d.health
      ]
    })
    downloadCSV(filename, headers, rows)
  }

  /* EXPORT: Sensor CSV (Only Selected) */
  const exportSensorDataCSV = () => {

    const activeKeys = Object.entries(selectedSensors)
      .filter(([_, isActive]) => isActive)
      .map(([key]) => key as SensorKey)

    const filename = `sensor_data_${sensorExportRange}_${formatDate()}.csv`

    const timeHeader = sensorExportRange === '7d'
      ? "Day & Time (168 Total Readings)"
      : sensorExportRange === '48h'
        ? "Day & Time (48 Total Readings)"
        : "Time (24H)";

    const headers = [timeHeader, ...activeKeys.map(k => {
      const config = sensorConfig.find(s => s.key === k);
      return config ? `${config.name.split('(')[0].trim()} (${config.unit})` : k;
    })];

    const rows = filteredSensorData.map((entry: SensorTrendRow) => [
      entry.time,
      ...activeKeys.map((key: SensorKey) => entry[key])
    ])

    downloadCSV(filename, headers, rows)
  }

  /* EXPORT: All Data Combined */
  const exportAllData = () => {
    const filename = `complete_analytics_${formatDate()}.csv`

    const headers = [
      "Type",
      "Day/Time",
      "Value1",
      "Value2",
      "Value3",
      "Value4"
    ]

    const growthRows = filteredGrowthData.map((d: GrowthRow) => [
      "Growth",
      d.day,
      `Height: ${d.height}cm`,
      `Leaves: ${d.leaves}`,
      `Health: ${d.health}%`,
      ""
    ])

    const sensorRows = filteredSensorData.map((d: SensorTrendRow) => [
      "Sensor",
      d.time,
      `Water: ${d.waterTemp}°C`,
      `pH: ${d.ph}`,
      `DO2: ${d.dissolvedO2}`,
      `Light: ${d.lightIntensity}lux`
    ])
    downloadCSV(filename, headers, [...growthRows, [""], ...sensorRows])
  }

  /* Sensor Configuration (Local handlers & array for buttons)*/
  // FIXED: Nilinis ang type definition dito para maiwasan ang error 1005
  const localSensorConfig: { key: SensorKey; name: string; color: string }[] = [
    { key: "waterTemp", name: "Water Temp", color: "#3b82f6" },
    { key: "ph", name: "pH Level", color: "#8b5cf6" },
    { key: "dissolvedO2", name: "Dissolved O₂", color: "#10b981" },
    { key: "airTemp", name: "Air Temp", color: "#f59e0b" },
    { key: "lightIntensity", name: "Light", color: "#eab308" },
    { key: "waterLevel", name: "Water Level", color: "#06b6d4" },
    { key: "waterFlow", name: "Flow Rate", color: "#6366f1" },
    { key: "humidity", name: "Humidity", color: "#14b8a6" },
    { key: "ammonia", name: "Ammonia", color: "#f97316" },
    { key: "airPressure", name: "Air Pressure", color: "#ef4444" },
  ]

  // FIX: Defined in scope
  const toggleSensor = (key: SensorKey) => {
    setSelectedSensors(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // FIX: Defined in scope
  const selectAllSensors = () => {
    const allTrue = Object.keys(selectedSensors).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {} as SensorState)
    setSelectedSensors(allTrue)
  }

  // FIX: Defined in scope
  const deselectAllSensors = () => {
    const allFalse = Object.keys(selectedSensors).reduce((acc, key) => ({
      ...acc,
      [key]: false
    }), {} as SensorState)
    setSelectedSensors(allFalse)
  }

  // 💡 USE EFFECT HOOKS (API Integration)

  // 1. Initial Fetch at Live Polling
  useEffect(() => {
    // Initial Fetch for data states
    fetchLiveSensorReading();
    fetchHistoricalChartsData('growth', selectedRange);
    fetchHistoricalChartsData('sensor', sensorExportRange);

    // Setup polling for LIVE sensor reading every 5 seconds (5000ms)
    const liveSensorInterval = setInterval(fetchLiveSensorReading, 5000);

    // Clock Update (1000ms)
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(liveSensorInterval);
      clearInterval(clockInterval);
    };
  }, [fetchLiveSensorReading, fetchHistoricalChartsData, selectedRange, sensorExportRange]);


  // 2. Re-fetch Growth Data when Range changes (Hindi kasama ang custom)
  useEffect(() => {
    if (selectedRange !== 'customGrowth') {
      fetchHistoricalChartsData('growth', selectedRange);
    }
  }, [selectedRange, fetchHistoricalChartsData]);

  // 3. Re-fetch Sensor Trend Data when Range changes (Hindi kasama ang custom)
  useEffect(() => {
    if (sensorExportRange !== 'custom') {
      fetchHistoricalChartsData('sensor', sensorExportRange);
    }
  }, [sensorExportRange, fetchHistoricalChartsData]);


  /* RENDER */
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <Navbar time={currentTime.toLocaleTimeString()} />

      <div className="px-4 py-5 pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your aquaponics system performance</p>
        </div>

        {/* 1. Live Sensor Readings Table - Ngayon ay gumagamit ng state: `latestSensorReading` */}
        <SensorReadingsTable latestData={latestSensorReading} />

        <div className="space-y-5">

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
                  onClick={() => setShowGrowthFilters(!showGrowthFilters)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium"
                >
                  <Filter className="w-3.5 h-3.5" />
                  {showGrowthFilters ? "Hide" : "Filters"}
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

            {/* Filter Dropdown (Logic is the same, now triggers API fetch) */}
            {showGrowthFilters && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-xs font-semibold text-gray-700 block mb-2">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Time Period
                </label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value)}
                >
                  <option value="thisWeek">This Week</option>
                  <option value="lastWeek">Last Week</option>
                  <option value="twoWeeks">Last 2 Weeks</option>
                  <option value="customGrowth">Custom Range</option>
                </select>
                {selectedRange === "customGrowth" && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Select Date Range</p>

                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={customGrowthStartDate}
                        onChange={(e) => handleDateChange('growth', 'start', e.target.value)}
                        className="w-1/2 p-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="date"
                        value={customGrowthEndDate}
                        onChange={(e) => handleDateChange('growth', 'end', e.target.value)}
                        className="w-1/2 p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    {dateWarning && <p className="text-xs text-red-600 font-medium mt-2">{dateWarning}</p>}

                    <button
                      onClick={() => applyCustomDateFilter('growth')}
                      className={`w-full py-1.5 mt-2 text-sm font-semibold rounded-md transition-colors ${dateWarning ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                      disabled={!!dateWarning}
                    >
                      Apply Filter
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 💡 CHART AREA WITH LOADING STATE */}
            <div className="h-56">
              {isLoading && filteredGrowthData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 font-semibold">
                  Loading Plant Growth Data...
                </div>
              ) : (
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
              )}
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

            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-gray-900">Sensor Trends ({filteredSensorData.length} Readings)</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSensorFilters(!showSensorFilters)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium"
                >
                  <Filter className="w-3.5 h-3.5" />
                  {showSensorFilters ? "Hide" : "Filters"}
                </button>
                <button
                  onClick={exportSensorDataCSV}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              </div>
            </div>

            {showSensorFilters && ( // Logic is the same, now triggers API fetch
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-xs font-semibold text-gray-700 block mb-2">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Time Period
                </label>

                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sensorExportRange}
                  onChange={(e) => {
                    setSensorExportRange(e.target.value);
                    if (e.target.value !== "custom") {
                      setDateWarning("");
                    }
                  }}
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="48h">Last 48 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="custom">Custom Range</option>
                </select>

                {sensorExportRange === "custom" && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Select Date Range</p>
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
                    {dateWarning && <p className="text-xs text-red-600 font-medium mt-2">{dateWarning}</p>}
                    <button
                      onClick={() => applyCustomDateFilter('sensor')}
                      className={`w-full py-1.5 mt-2 text-sm font-semibold rounded-md transition-colors ${dateWarning ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                      disabled={!!dateWarning}
                    >
                      Apply Filter
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Select Buttons (Ito ay pareho) */}
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
                {activeCount} / {localSensorConfig.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {localSensorConfig.map((sensor) => {
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
                    {sensor.name}
                  </button>
                )
              })}
            </div>

            {/* 💡 CHART AREA WITH LOADING STATE */}
            <div className="h-72">
              {isLoading && filteredSensorData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 font-semibold">
                  Loading Sensor Trend Data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredSensorData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                    <XAxis
                      dataKey="time"
                      stroke="#9ca3af"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      interval={3}
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

                    {localSensorConfig.map(sensor =>
                      selectedSensors[sensor.key] && (
                        <Line
                          key={sensor.key}
                          type="monotone"
                          dataKey={sensor.key}
                          stroke={sensor.color}
                          strokeWidth={2.5}
                          dot={false}
                          name={sensor.name}
                          activeDot={{ r: 5 }}
                        />
                      )
                    )}
                  </LineChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* HEALTH METRICS - Gumagamit na ng latestSensorReading state */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Fish className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-900">Fish Health</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">Excellent</div>
              <div className="text-xs text-gray-500 mt-2">Ammonia: {latestSensorReading?.ammonia ?? '—'} ppm</div>
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
      </div>

      <BottomNavigation />
    </div>
  )
}