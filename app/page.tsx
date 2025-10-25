"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Camera,
  Settings,
  Droplets,
  Thermometer,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Fish,
  Clock,
  ChevronDown,
  Wind,
  Waves,
  Gauge,
  Maximize2,
  X,
  Bell,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";

const AquaponicsApp = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real-time sensor data with more granular updates
  const [sensorData, setSensorData] = useState({
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
  });

  // System controls state
  const [controls, setControls] = useState({
    pump: true,
    fan: true,
    phAdjustment: false,
    aerator: true,
  });

  // Weekly growth data
  const weeklyGrowthData = [
    { day: "Mon", height: 12.5, leaves: 6, health: 85 },
    { day: "Tue", height: 13.2, leaves: 7, health: 87 },
    { day: "Wed", height: 14.1, leaves: 8, health: 89 },
    { day: "Thu", height: 14.8, leaves: 9, health: 91 },
    { day: "Fri", height: 15.6, leaves: 10, health: 92 },
    { day: "Sat", height: 16.2, leaves: 11, health: 93 },
    { day: "Sun", height: 17.1, leaves: 12, health: 94 },
  ];

  const sensorTrendData = [
    { time: "00:00", temp: 22.1, ph: 6.7, do: 7.0 },
    { time: "04:00", temp: 21.8, ph: 6.8, do: 7.2 },
    { time: "08:00", temp: 22.5, ph: 6.9, do: 7.1 },
    { time: "12:00", temp: 23.2, ph: 6.8, do: 6.9 },
    { time: "16:00", temp: 22.8, ph: 6.7, do: 7.3 },
    { time: "20:00", temp: 22.3, ph: 6.8, do: 7.2 },
  ];

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setSensorData((prev) => ({
        ...prev,
        waterTemp: Number.parseFloat((22 + Math.random() * 2).toFixed(1)),
        ph: Number.parseFloat((6.5 + Math.random() * 0.6).toFixed(1)),
        dissolvedO2: Number.parseFloat((6.8 + Math.random() * 0.6).toFixed(1)),
        waterLevel: parseFloat(s
          Math.min(
            100,
            Math.max(70, prev.waterLevel + (Math.random() - 0.5) * 2)
          ).toFixed(2)
        ),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Alert system with severity levels
  const alerts = [
    {
      id: 1,
      type: "warning",
      severity: "medium",
      title: "pH Level Alert",
      message: "pH slightly elevated (6.8). Recommend monitoring.",
      time: "2 min ago",
      action: "Monitor",
    },
    {
      id: 2,
      type: "success",
      severity: "low",
      title: "System Optimal",
      message: "Water flow rate and temperature within ideal range.",
      time: "5 min ago",
      action: "Dismiss",
    },
    {
      id: 3,
      type: "info",
      severity: "low",
      title: "Maintenance Due",
      message: "Filter cleaning recommended in 3 days.",
      time: "1 hour ago",
      action: "Schedule",
    },
  ];

  // Threshold status helper
  const getThresholdStatus = (value, min, max) => {
    if (value < min || value > max) return "critical";
    if (value < min + (max - min) * 0.1 || value > max - (max - min) * 0.1)
      return "warning";
    return "good";
  };

  // Enhanced Sensor Card with threshold visualization
  const SensorCard = ({ icon: Icon, title, value, unit, min, max, color }) => {
    const status = getThresholdStatus(value, min, max);
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2.5 rounded-lg ${color}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">{title}</span>
          </div>
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              status === "good"
                ? "bg-emerald-500"
                : status === "warning"
                ? "bg-amber-500"
                : "bg-red-500"
            } animate-pulse`}
          ></div>
        </div>

        <div className="mb-3">
          <div className="text-2xl font-bold text-gray-900">
            {value}
            <span className="text-xs text-gray-500 ml-1 font-normal">
              {unit}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Range: {min}-{max}
            {unit}
          </div>
        </div>

        {/* Threshold bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              status === "good"
                ? "bg-emerald-500"
                : status === "warning"
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Control Toggle Component
  const ControlToggle = ({ label, icon: Icon, active, onChange }) => (
    <button
      onClick={() => onChange(!active)}
      className={`flex items-center justify-between w-full p-4 rounded-xl transition-all ${
        active
          ? "bg-emerald-50 border border-emerald-200"
          : "bg-gray-50 border border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-lg ${
            active ? "bg-emerald-500" : "bg-gray-400"
          }`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-gray-900">{label}</span>
      </div>
      <div
        className={`w-12 h-6 rounded-full transition-all ${
          active ? "bg-emerald-500" : "bg-gray-300"
        } flex items-center p-1`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full transition-transform ${
            active ? "translate-x-6" : "translate-x-0"
          }`}
        ></div>
      </div>
    </button>
  );

  // Dashboard View
  const DashboardView = () => (
    <div className="space-y-5 pb-24">
      {/* Header with status */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">GROWUP</h1>
            <p className="text-emerald-100 text-sm">Aquaponics Tower System</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-xs text-emerald-100 flex items-center justify-end gap-1 mt-1">
              <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
              Live
            </div>
          </div>
        </div>

        {/* Quick stats */}
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
              <div className="text-xs text-gray-500">
                All sensors operational
              </div>
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

      {/* Critical Sensors Grid */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">
          Critical Metrics
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <SensorCard
            icon={Thermometer}
            title="Water Temp"
            value={sensorData.waterTemp}
            unit="°C"
            min={20}
            max={25}
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
            min={6.5}
            max={8.0}
            color="bg-green-500"
          />
          <SensorCard
            icon={Zap}
            title="Light Level"
            value={sensorData.lightIntensity}
            unit="lux"
            min={300}
            max={600}
            color="bg-yellow-500"
          />
        </div>
      </div>

      {/* Secondary Sensors */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">
          System Metrics
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <SensorCard
            icon={Waves}
            title="Water Level"
            value={sensorData.waterLevel}
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
            min={0.8}
            max={1.5}
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
            max={0.05}
            color="bg-orange-500"
          />
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
        <div className="divide-y divide-gray-100">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                expandedAlert === alert.id ? "bg-gray-50" : ""
              }`}
              onClick={() =>
                setExpandedAlert(expandedAlert === alert.id ? null : alert.id)
              }
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${
                    alert.severity === "high"
                      ? "bg-red-100"
                      : alert.severity === "medium"
                      ? "bg-amber-100"
                      : "bg-emerald-100"
                  }`}
                >
                  {alert.type === "warning" ? (
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        alert.severity === "high"
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">
                    {alert.title}
                  </div>
                  {expandedAlert === alert.id && (
                    <div className="text-xs text-gray-600 mt-2">
                      {alert.message}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">{alert.time}</div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                    expandedAlert === alert.id ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Analytics View
  const AnalyticsView = () => (
    <div className="space-y-5 pb-24">
      {/* Growth Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Weekly Plant Growth</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyGrowthData}>
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
            <LineChart data={sensorTrendData}>
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
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Temperature"
              />
              <Line
                type="monotone"
                dataKey="ph"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                name="pH Level"
              />
              <Line
                type="monotone"
                dataKey="do"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="Dissolved O₂"
              />
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
          <div className="text-xs text-gray-500 mt-2">
            Ammonia: {sensorData.ammonia} ppm
          </div>
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
  );

  // Camera View
  const CameraView = () => (
    <div className="space-y-5 pb-24">
      <div className="bg-gray-900 rounded-2xl aspect-square relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 flex items-center justify-center">
          <div className="text-center text-white">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <div className="text-lg font-semibold">Live Tower Feed</div>
            <div className="text-sm opacity-70">AI Plant Detection Active</div>
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-red-500 w-4 h-4 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-2 rounded text-white">
          <div className="text-sm font-semibold font-mono">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-xs">1080p • Live</div>
        </div>
        <div className="absolute bottom-4 right-4 bg-emerald-600/90 px-3 py-2 rounded text-white">
          <div className="text-xs font-semibold">4 Plants Detected</div>
        </div>
      </div>

      {/* AI Detection Results */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">
          Plant Detection Results
        </h3>
        <div className="space-y-3">
          {[
            { name: "Kale Plant #1", status: "Healthy", color: "emerald" },
            { name: "Kale Plant #2", status: "Growing", color: "emerald" },
            { name: "Kale Plant #3", status: "Monitor", color: "amber" },
            { name: "Kale Plant #4", status: "Ready Soon", color: "emerald" },
          ].map((plant, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-lg ${
                plant.color === "emerald"
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-amber-50 border border-amber-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    plant.color === "emerald"
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                ></div>
                <span className="font-medium text-gray-900">{plant.name}</span>
              </div>
              <span
                className={`text-xs font-semibold ${
                  plant.color === "emerald"
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                {plant.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Camera Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Camera Controls</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-semibold text-emerald-600 transition-colors">
            📸 Snapshot
          </button>
          <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg font-semibold text-blue-600 transition-colors">
            🎥 Record
          </button>
          <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg font-semibold text-purple-600 transition-colors">
            🔍 Zoom
          </button>
          <button className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg font-semibold text-orange-600 transition-colors">
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );

  // Settings View
  const SettingsView = () => (
    <div className="space-y-5 pb-24">
      {/* System Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">System Controls</h3>
        <div className="space-y-3">
          <ControlToggle
            label="Submersible Pump"
            icon={Waves}
            active={controls.pump}
            onChange={(val) => setControls({ ...controls, pump: val })}
          />
          <ControlToggle
            label="DC Fan"
            icon={Wind}
            active={controls.fan}
            onChange={(val) => setControls({ ...controls, fan: val })}
          />
          <ControlToggle
            label="pH Adjustment"
            icon={Droplets}
            active={controls.phAdjustment}
            onChange={(val) => setControls({ ...controls, phAdjustment: val })}
          />
          <ControlToggle
            label="Aerator"
            icon={Activity}
            active={controls.aerator}
            onChange={(val) => setControls({ ...controls, aerator: val })}
          />
        </div>
      </div>

      {/* Automation Presets */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Automation Presets</h3>
        <div className="space-y-3">
          {[
            { name: "Morning Boost", time: "06:00 AM", active: true },
            { name: "Evening Cycle", time: "06:00 PM", active: true },
            { name: "Night Mode", time: "10:00 PM", active: false },
          ].map((preset, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {preset.name}
                  </div>
                  <div className="text-xs text-gray-500">{preset.time}</div>
                </div>
              </div>
              <div
                className={`w-10 h-6 rounded-full transition-all ${
                  preset.active ? "bg-emerald-500" : "bg-gray-300"
                } flex items-center p-1`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    preset.active ? "translate-x-4" : "translate-x-0"
                  }`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Alert Thresholds</h3>
        <div className="space-y-4">
          {[
            { label: "pH Range", min: "6.0", max: "7.0" },
            { label: "Water Temp (°C)", min: "20", max: "25" },
            { label: "Dissolved O₂ (mg/L)", min: "6.5", max: "8.0" },
          ].map((threshold, idx) => (
            <div key={idx}>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                {threshold.label}
              </label>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <input
                  type="number"
                  value={threshold.min}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-gray-500 font-semibold text-center">
                  -
                </span>
                <input
                  type="number"
                  value={threshold.max}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">System Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between pb-3 border-b border-gray-100">
            <span className="text-gray-600">Firmware Version</span>
            <span className="font-semibold text-gray-900">v2.1.3</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-gray-100">
            <span className="text-gray-600">Last Update</span>
            <span className="font-semibold text-gray-900">2 days ago</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-gray-100">
            <span className="text-gray-600">System Uptime</span>
            <span className="font-semibold text-gray-900">7d 14h 32m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Storage Used</span>
            <span className="font-semibold text-gray-900">2.1GB / 32GB</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Controls Modal
  const ControlsModal = () => (
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
            onChange={(val) => setControls({ ...controls, pump: val })}
          />
          <ControlToggle
            label="DC Fan"
            icon={Wind}
            active={controls.fan}
            onChange={(val) => setControls({ ...controls, fan: val })}
          />
          <ControlToggle
            label="pH Adjustment"
            icon={Droplets}
            active={controls.phAdjustment}
            onChange={(val) => setControls({ ...controls, phAdjustment: val })}
          />
          <ControlToggle
            label="Aerator"
            icon={Activity}
            active={controls.aerator}
            onChange={(val) => setControls({ ...controls, aerator: val })}
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
  );

  // Camera Modal
  const CameraModal = () => (
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
            <div className="text-sm opacity-70 mt-2">
              Pinch to zoom • Swipe to pan
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-red-500 w-4 h-4 rounded-full animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Status Bar */}
      <div className="bg-white px-4 py-2.5 flex items-center justify-between text-sm border-b border-gray-100 sticky top-0 z-40">
        <span className="font-bold text-gray-900">GROWUP</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600">Connected</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-5">
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "analytics" && <AnalyticsView />}
        {activeTab === "camera" && <CameraView />}
        {activeTab === "settings" && <SettingsView />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around py-3">
          {[
            { id: "dashboard", icon: Home, label: "Home" },
            { id: "analytics", icon: BarChart3, label: "Analytics" },
            { id: "camera", icon: Camera, label: "Camera" },
            { id: "settings", icon: Settings, label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              aria-label={tab.label}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              <tab.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showControlsModal && <ControlsModal />}
      {showCameraModal && <CameraModal />}
    </div>
  );
};

export default AquaponicsApp;
