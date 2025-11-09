"use client"

import { LayoutWrapper } from "@/app/components/LayoutWrapper"
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts"
import { Fish, Droplets } from "lucide-react"
import { WEEKLY_GROWTH_DATA, SENSOR_TREND_DATA } from "@/lib/constants"

export default function Analytics() {
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

        {/* Sensor Trends */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">24-Hour Sensor Trends</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SENSOR_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2} dot={false} name="Temperature" />
                <Line type="monotone" dataKey="ph" stroke="#8b5cf6" strokeWidth={2} dot={false} name="pH Level" />
                <Line type="monotone" dataKey="do" stroke="#10b981" strokeWidth={2} dot={false} name="Dissolved O₂" />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
}
