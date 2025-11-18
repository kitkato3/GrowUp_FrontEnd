"use client"

import { LayoutWrapper } from "@/app/components/LayoutWrapper"
<<<<<<< HEAD
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts"
import { Fish, Droplets } from "lucide-react"
import { WEEKLY_GROWTH_DATA, SENSOR_TREND_DATA } from "@/lib/constants"

export default function Analytics() {
=======
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend } from "recharts"
import { Fish, Droplets } from "lucide-react"
import { WEEKLY_GROWTH_DATA, SENSOR_TREND_DATA } from "@/lib/constants"
import { useState } from "react"

export default function Analytics() {
  const [selectedSensors, setSelectedSensors] = useState({
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

  const sensorConfig = [
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

  const toggleSensor = (key: string) => {
    setSelectedSensors((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

>>>>>>> 1c5daa3 (hydration error fixed)
  return (
    <LayoutWrapper>
      <div className="space-y-5 pb-24">
        {/* Growth Chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Weekly Plant Growth</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_GROWTH_DATA}>
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
                <Area type="monotone" dataKey="height" stroke="#10b981" fillOpacity={1} fill="url(#colorHeight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Growth Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600">Current Height</div>
              <div className="text-2xl font-bold text-emerald-600">17.1cm</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600">Weekly Growth</div>
              <div className="text-2xl font-bold text-blue-600">+4.6cm</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600">Leaf Count</div>
              <div className="text-2xl font-bold text-purple-600">12</div>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Sensor Trends */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">24-Hour Sensor Trends</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SENSOR_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
=======
        {/* Sensor Trends with All Sensors */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">24-Hour Sensor Trends</h3>
          
          {/* Sensor Toggle Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {sensorConfig.map((sensor) => {
              const isSelected = selectedSensors[sensor.key as keyof typeof selectedSensors]
              return (
                <button
                  key={sensor.key}
                  onClick={() => toggleSensor(sensor.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-white text-gray-900 border-2 shadow-sm"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                  style={{
                    borderColor: isSelected ? sensor.color : undefined,
                  }}
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

          {/* Chart */}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SENSOR_TREND_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af" 
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#6b7280' }}
                />
>>>>>>> 1c5daa3 (hydration error fixed)
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
<<<<<<< HEAD
                  }}
                />
                <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2} dot={false} name="Temperature" />
                <Line type="monotone" dataKey="ph" stroke="#8b5cf6" strokeWidth={2} dot={false} name="pH Level" />
                <Line type="monotone" dataKey="do" stroke="#10b981" strokeWidth={2} dot={false} name="Dissolved O₂" />
              </LineChart>
            </ResponsiveContainer>
          </div>
=======
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  iconSize={10}
                  iconType="line"
                />
                {sensorConfig.map((sensor) =>
                  selectedSensors[sensor.key as keyof typeof selectedSensors] ? (
                    <Line
                      key={sensor.key}
                      type="monotone"
                      dataKey={sensor.key}
                      stroke={sensor.color}
                      strokeWidth={2.5}
                      dot={false}
                      name={sensor.name}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  ) : null
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center">
              {Object.values(selectedSensors).filter(Boolean).length} of {sensorConfig.length} sensors displayed
            </div>
          </div>
>>>>>>> 1c5daa3 (hydration error fixed)
        </div>

        {/* Health Metrics */}
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
    </LayoutWrapper>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> 1c5daa3 (hydration error fixed)
