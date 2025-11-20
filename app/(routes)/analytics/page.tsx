"use client"

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts"

import { Fish, Droplets, Download, Calendar, Filter } from "lucide-react"
import { useState } from "react"

/* ------------------------------------------------------
   TYPES
------------------------------------------------------ */

type SensorKey =
  | "waterTemp"
  | "ph"
  | "dissolvedO2"
  | "airTemp"
  | "lightIntensity"
  | "waterLevel"
  | "waterFlow"
  | "nitrates"
  | "humidity"
  | "ammonia"

type SensorState = Record<SensorKey, boolean>

type SensorTrendRow = {
  time: string
} & Record<SensorKey, number>

/* ------------------------------------------------------
   MOCK DATA
------------------------------------------------------ */

const WEEKLY_GROWTH_DATA = [
  { day: "Mon", height: 12.5, leaves: 8, health: 92 },
  { day: "Tue", height: 13.2, leaves: 9, health: 94 },
  { day: "Wed", height: 14.1, leaves: 10, health: 95 },
  { day: "Thu", height: 15.3, leaves: 11, health: 96 },
  { day: "Fri", height: 16.8, leaves: 12, health: 97 },
  { day: "Sat", height: 18.2, leaves: 13, health: 98 },
  { day: "Sun", height: 19.5, leaves: 14, health: 99 },
]

const SENSOR_TREND_DATA: SensorTrendRow[] = [
  { time: "00:00", waterTemp: 22.5, ph: 6.8, dissolvedO2: 8.2, airTemp: 24, lightIntensity: 0, waterLevel: 85, waterFlow: 12, nitrates: 15, humidity: 65, ammonia: 0.02 },
  { time: "04:00", waterTemp: 22.2, ph: 6.9, dissolvedO2: 8.5, airTemp: 23, lightIntensity: 0, waterLevel: 84, waterFlow: 12, nitrates: 14, humidity: 68, ammonia: 0.01 },
  { time: "08:00", waterTemp: 23.1, ph: 7.0, dissolvedO2: 8.1, airTemp: 26, lightIntensity: 450, waterLevel: 83, waterFlow: 13, nitrates: 16, humidity: 62, ammonia: 0.02 },
  { time: "12:00", waterTemp: 24.5, ph: 7.1, dissolvedO2: 7.8, airTemp: 29, lightIntensity: 850, waterLevel: 82, waterFlow: 13, nitrates: 17, humidity: 58, ammonia: 0.03 },
  { time: "16:00", waterTemp: 24.8, ph: 7.0, dissolvedO2: 7.6, airTemp: 28, lightIntensity: 620, waterLevel: 81, waterFlow: 12, nitrates: 18, humidity: 60, ammonia: 0.02 },
  { time: "20:00", waterTemp: 23.5, ph: 6.9, dissolvedO2: 8.0, airTemp: 25, lightIntensity: 120, waterLevel: 82, waterFlow: 12, nitrates: 16, humidity: 64, ammonia: 0.02 },
]

/* ------------------------------------------------------
   UTILITY FUNCTIONS
------------------------------------------------------ */

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

/* ------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------ */

export default function Analytics() {
  const [selectedSensors, setSelectedSensors] = useState<SensorState>({
    waterTemp: true,
    ph: true,
    dissolvedO2: true,
    airTemp: false,
    lightIntensity: false,
    waterLevel: false,
    waterFlow: false,
    nitrates: false,
    humidity: false,
    ammonia: false,
  })

  const [selectedRange, setSelectedRange] = useState("thisWeek")
  const [showFilters, setShowFilters] = useState(false)

  /* Filter Growth Data */
  const filteredGrowthData =
    selectedRange === "thisWeek"
      ? WEEKLY_GROWTH_DATA
      : selectedRange === "lastWeek"
        ? WEEKLY_GROWTH_DATA.slice(1)
        : WEEKLY_GROWTH_DATA.slice(2)

  /* ------------------------------------------------------
     EXPORT: Plant Growth CSV
  ------------------------------------------------------ */
  const exportGrowthDataCSV = () => {
    const filename = `plant_growth_${selectedRange}_${formatDate()}.csv`
    const headers = ["Day", "Height (cm)", "Leaves", "Health (%)"]
    const rows = filteredGrowthData.map((d) => [
      d.day,
      d.height,
      d.leaves,
      d.health
    ])

    downloadCSV(filename, headers, rows)
  }

  /* ------------------------------------------------------
     EXPORT: Sensor CSV (Only Selected)
  ------------------------------------------------------ */
  const exportSensorDataCSV = () => {
    const activeKeys = Object.entries(selectedSensors)
      .filter(([_, isActive]) => isActive)
      .map(([key]) => key as SensorKey)

    const filename = `sensor_data_${formatDate()}.csv`
    const headers = ["Time", ...activeKeys.map(k =>
      sensorConfig.find(s => s.key === k)?.name || k
    )]
    const rows = SENSOR_TREND_DATA.map((entry) => [
      entry.time,
      ...activeKeys.map((key) => entry[key])
    ])

    downloadCSV(filename, headers, rows)
  }

  /* ------------------------------------------------------
     EXPORT: All Data Combined
  ------------------------------------------------------ */
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

    const growthRows = filteredGrowthData.map(d => [
      "Growth",
      d.day,
      `Height: ${d.height}cm`,
      `Leaves: ${d.leaves}`,
      `Health: ${d.health}%`,
      ""
    ])

    const sensorRows = SENSOR_TREND_DATA.map(d => [
      "Sensor",
      d.time,
      `Water: ${d.waterTemp}°C`,
      `pH: ${d.ph}`,
      `DO2: ${d.dissolvedO2}`,
      `Light: ${d.lightIntensity}lux`
    ])

    downloadCSV(filename, headers, [...growthRows, [""], ...sensorRows])
  }

  /* ------------------------------------------------------
     Sensor Configuration
  ------------------------------------------------------ */
  const sensorConfig: { key: SensorKey; name: string; color: string }[] = [
    { key: "waterTemp", name: "Water Temp", color: "#3b82f6" },
    { key: "ph", name: "pH Level", color: "#8b5cf6" },
    { key: "dissolvedO2", name: "Dissolved O₂", color: "#10b981" },
    { key: "airTemp", name: "Air Temp", color: "#f59e0b" },
    { key: "lightIntensity", name: "Light", color: "#eab308" },
    { key: "waterLevel", name: "Water Level", color: "#06b6d4" },
    { key: "waterFlow", name: "Flow Rate", color: "#6366f1" },
    { key: "nitrates", name: "Nitrates", color: "#ec4899" },
    { key: "humidity", name: "Humidity", color: "#14b8a6" },
    { key: "ammonia", name: "Ammonia", color: "#f97316" },
  ]

  const toggleSensor = (key: SensorKey) => {
    setSelectedSensors(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const selectAllSensors = () => {
    const allTrue = Object.keys(selectedSensors).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {} as SensorState)
    setSelectedSensors(allTrue)
  }

  const deselectAllSensors = () => {
    const allFalse = Object.keys(selectedSensors).reduce((acc, key) => ({
      ...acc,
      [key]: false
    }), {} as SensorState)
    setSelectedSensors(allFalse)
  }

  const lastGrowth = filteredGrowthData[filteredGrowthData.length - 1]
  const activeCount = Object.values(selectedSensors).filter(Boolean).length

  /* ------------------------------------------------------
     RENDER
  ------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your aquaponics system performance</p>
        </div>

        <div className="space-y-5 pb-24">

          {/* ------------------------------------------------------ */}
          {/* EXPORT ALL BUTTON */}
          {/* ------------------------------------------------------ */}
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

          {/* ------------------------------------------------------ */}
          {/* GROWTH CHART */}
          {/* ------------------------------------------------------ */}
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

            {/* Filter Dropdown */}
            {showFilters && (
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
                </select>
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
            <div className="grid grid-cols-3 gap-3 mt-4">
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

              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-600">Leaf Count</div>
                <div className="text-2xl font-bold text-purple-600">
                  {lastGrowth?.leaves ?? 12}
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* SENSOR TRENDS */}
          {/* ------------------------------------------------------ */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">

            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-gray-900">24-Hour Sensor Trends</h3>

              <button
                onClick={exportSensorDataCSV}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>

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
                {activeCount} / {sensorConfig.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {sensorConfig.map((sensor) => {
                const active = selectedSensors[sensor.key]
                return (
                  <button
                    key={sensor.key}
                    onClick={() => toggleSensor(sensor.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${active
                      ? "bg-white text-gray-900 border-2 shadow-sm"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
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
                        name={sensor.name}
                        activeDot={{ r: 5 }}
                      />
                    )
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* HEALTH METRICS */}
          {/* ------------------------------------------------------ */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Fish className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-900">Fish Health</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">Excellent</div>
              <div className="text-xs text-gray-500 mt-2">Ammonia: 0.02 ppm</div>
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
    </div>
  )
}