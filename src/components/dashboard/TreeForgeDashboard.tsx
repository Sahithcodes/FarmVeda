import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Farm,
  Field,
  Sensor,
  SensorReading,
  IrrigationSchedule,
  DailyActivity,
  Recommendation,
} from '../../types';
import {
  Droplets,
  Thermometer,
  CloudRain,
  Radio,
  Power,
  Waves,
  Sparkles,
  ArrowRight,
  Clock,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sun,
  Activity,
  TrendingUp,
  Wind,
  ShieldCheck,
  ChevronRight,
  Compass,
  Zap,
  Mic,
} from 'lucide-react';

interface TreeForgeDashboardProps {
  farms: Farm[];
  fields: Field[];
  sensors: Sensor[];
  latestReading?: SensorReading;
  readingsHistory: SensorReading[];
  irrigationSchedule?: IrrigationSchedule;
  activities: DailyActivity[];
  recommendations: Recommendation[];
  selectedFarmId: string;
  selectedFieldId: string;
  onSelectFarm: (id: string) => void;
  onSelectField: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  onSimulatePulse: () => void;
  onUpdateActivity: (act: DailyActivity) => void;
  onOpenAssistant: () => void;
}

export const TreeForgeDashboard: React.FC<TreeForgeDashboardProps> = ({
  farms,
  fields,
  sensors,
  latestReading,
  readingsHistory,
  irrigationSchedule,
  activities,
  recommendations,
  selectedFarmId,
  selectedFieldId,
  onSelectFarm,
  onSelectField,
  onNavigateTab,
  onSimulatePulse,
  onUpdateActivity,
  onOpenAssistant,
}) => {
  const { t, language } = useLanguage();
  const [isPulsing, setIsPulsing] = useState(false);

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];
  const activeFields = fields.filter((f) => f.farmId === (activeFarm?.id || selectedFarmId));
  const activeField = activeFields.find((f) => f.id === selectedFieldId) || activeFields[0];

  const moisture = latestReading ? latestReading.moisturePercent : 68;
  const temp = latestReading ? latestReading.temperatureC : 29;
  const humidity = latestReading ? latestReading.humidityPercent : 72;
  const rainfall = latestReading ? latestReading.rainfallMm : 0;
  const isPumpOn = irrigationSchedule?.status === 'ON';

  const onlineSensors = sensors.filter((s) => s.status === 'online' || s.status === 'active').length;
  const totalSensors = sensors.length;

  const nextActivity = activities.find((a) => a.status === 'upcoming') || activities[0];
  const topRecommendation = recommendations[0];

  const handlePulse = async () => {
    setIsPulsing(true);
    await onSimulatePulse();
    setTimeout(() => setIsPulsing(false), 900);
  };

  // Status computation
  const isDry = moisture < 50;
  const isWet = moisture > 80;

  return (
    <div className="space-y-6">
      {/* 3-COLUMN TREEFORGE DESKTOP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =========================================
            COLUMN 1 (LEFT): Environmental Conditions & Telemetry
            Span 3 on Desktop
        ========================================= */}
        <div className="lg:col-span-3 space-y-5">
          {/* 1.1 Environmental Conditions Card */}
          <div className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#244D3F]/70">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-[#F4B740]" />
                <h3 className="font-extrabold text-sm text-[#F4F8F5] tracking-tight">
                  Environmental Conditions
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1D4033] text-[#64D995] border border-[#244D3F]">
                Live
              </span>
            </div>

            <div className="space-y-4 mt-3">
              {/* Temperature */}
              <div
                onClick={() => onNavigateTab('weather')}
                className="p-3 rounded-2xl bg-[#10251F] border border-[#244D3F]/50 hover:border-[#64D995]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F4B740]/15 text-[#F4B740] flex items-center justify-center">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#A9BDB1] font-semibold block">Air Temperature</span>
                      <span className="text-xl font-black text-[#F4F8F5]">{temp}°C</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#F4B740] bg-[#F4B740]/10 px-2 py-0.5 rounded-lg border border-[#F4B740]/20">
                    {temp > 30 ? 'Warm' : 'Mild'}
                  </span>
                </div>
                <div className="w-full bg-[#0B1713] h-1.5 rounded-full overflow-hidden mt-2.5">
                  <div className="h-full bg-[#F4B740] rounded-full" style={{ width: `${Math.min(100, (temp / 45) * 100)}%` }} />
                </div>
              </div>

              {/* Relative Humidity */}
              <div
                onClick={() => onNavigateTab('weather')}
                className="p-3 rounded-2xl bg-[#10251F] border border-[#244D3F]/50 hover:border-[#64D995]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                      <Waves className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#A9BDB1] font-semibold block">Relative Humidity</span>
                      <span className="text-xl font-black text-[#F4F8F5]">{humidity}%</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">
                    Dew: 22°
                  </span>
                </div>
                <div className="w-full bg-[#0B1713] h-1.5 rounded-full overflow-hidden mt-2.5">
                  <div className="h-full bg-sky-400 rounded-full" style={{ width: `${humidity}%` }} />
                </div>
              </div>

              {/* Rain Forecast */}
              <div
                onClick={() => onNavigateTab('weather')}
                className="p-3 rounded-2xl bg-[#10251F] border border-[#244D3F]/50 hover:border-[#64D995]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                      <CloudRain className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#A9BDB1] font-semibold block">Rain Probability</span>
                      <span className="text-xl font-black text-[#F4F8F5]">80% <span className="text-xs text-[#A9BDB1] font-medium">(12mm)</span></span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                    Tomorrow
                  </span>
                </div>
                <div className="w-full bg-[#0B1713] h-1.5 rounded-full overflow-hidden mt-2.5">
                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              {/* Wind & Solar UV Snapshot */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A9BDB1] font-semibold">
                <div className="p-2.5 rounded-xl bg-[#10251F] border border-[#244D3F]/40 flex items-center gap-2">
                  <Wind className="w-3.5 h-3.5 text-[#64D995]" />
                  <span>14 km/h SW</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#10251F] border border-[#244D3F]/40 flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-[#F4B740]" />
                  <span>UV Index: 5.2</span>
                </div>
              </div>
            </div>
          </div>

          {/* 1.2 Sensor Telemetry Snapshot */}
          <div className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#244D3F]/70">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#64D995]" />
                <h3 className="font-extrabold text-sm text-[#F4F8F5] tracking-tight">
                  Telemetry Mesh Nodes
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('sensors')}
                className="text-xs font-bold text-[#64D995] hover:text-white flex items-center gap-0.5 cursor-pointer"
              >
                <span>Nodes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 mt-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#10251F] border border-[#244D3F]/40">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#64D995] animate-ping" />
                  <div>
                    <span className="text-xs font-extrabold text-[#F4F8F5]">Network Status</span>
                    <p className="text-[10px] text-[#A9BDB1]">LoRaWAN Mesh / Local DB</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#64D995]">
                  {onlineSensors} / {totalSensors || 1} Online
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[#10251F] border border-[#244D3F]/40">
                  <span className="text-[10px] text-[#A9BDB1] block uppercase font-bold">Avg Battery</span>
                  <span className="text-sm font-black text-[#64D995] mt-0.5 block">94%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#10251F] border border-[#244D3F]/40">
                  <span className="text-[10px] text-[#A9BDB1] block uppercase font-bold">RSSI Signal</span>
                  <span className="text-sm font-black text-[#64D995] mt-0.5 block">-68 dBm</span>
                </div>
              </div>
            </div>
          </div>

          {/* 1.3 Quick Soil Quality Indicators */}
          <div className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F] shadow-xl">
            <h4 className="text-xs font-extrabold text-[#A9BDB1] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#64D995]" />
              <span>Soil Chemistry & Vitality</span>
            </h4>
            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-[#A9BDB1]">Soil pH (Root Level)</span>
                <span className="text-[#64D995] font-black">6.8 (Neutral Ideal)</span>
              </div>
              <div className="w-full bg-[#10251F] h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-[#64D995] rounded-full" style={{ width: '68%' }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[#A9BDB1]">NPK Nutrient Ratio</span>
                <span className="text-[#F4F8F5] font-bold">Balanced (N:42, P:18, K:35)</span>
              </div>
              <div className="w-full bg-[#10251F] h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            COLUMN 2 (CENTER): Farm Overview & Soil Moisture Hero
            Span 6 on Desktop
        ========================================= */}
        <div className="lg:col-span-6 space-y-5">
          {/* 2.1 Farm Overview Card */}
          <div className="bg-gradient-to-br from-[#10251F] via-[#17332A] to-[#10251F] rounded-3xl p-6 border border-[#244D3F] shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2E8B57]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#2E8B57]/20 text-[#64D995] border border-[#64D995]/30">
                    Active Farm Overview
                  </span>
                  <span className="text-xs text-[#A9BDB1] font-semibold">
                    📍 {activeFarm?.village || activeFarm?.location || 'Mandya, Karnataka'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#F4F8F5] tracking-tight mt-1.5">
                  {activeFarm?.name || activeFarm?.farmName || 'Annapurna Organic Farm'}
                </h2>
                <p className="text-xs text-[#A9BDB1] font-medium mt-0.5">
                  Farmer: <strong className="text-[#F4F8F5] font-bold">{activeFarm?.ownerName || activeFarm?.farmerName || 'Ramesh Patel'}</strong> • Total Land: <strong className="text-[#F4F8F5] font-bold">{activeFarm?.totalArea || 5.0} {activeFarm?.areaUnit || 'Acres'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onNavigateTab('farms')}
                  className="px-4 py-2.5 rounded-2xl bg-[#1D4033] hover:bg-[#244D3F] border border-[#244D3F] text-xs font-bold text-[#64D995] hover:text-[#F4F8F5] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Sprout className="w-4 h-4" />
                  <span>My Farms</span>
                </button>
              </div>
            </div>

            {/* Active Plots Horizontal Chips */}
            {activeFields.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#244D3F]/70">
                <span className="text-[11px] text-[#A9BDB1] font-bold uppercase tracking-wider block mb-2">
                  Select Plot / Field:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {activeFields.map((f) => {
                    const isSel = f.id === selectedFieldId || f.id === activeField?.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => onSelectField(f.id)}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                          isSel
                            ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] text-white border-[#64D995]/50 shadow-md shadow-[#2E8B57]/30'
                            : 'bg-[#10251F] text-[#A9BDB1] border-[#244D3F] hover:bg-[#1D4033]'
                        }`}
                      >
                        <span>🌱 {f.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSel ? 'bg-black/20 text-[#64D995]' : 'bg-black/10 text-gray-400'}`}>
                          {f.cropType}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2.2 Primary Soil Moisture Hero Card */}
          <div className="bg-[#17332A] rounded-3xl p-6 sm:p-7 border border-[#244D3F] shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#244D3F]/70 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#10251F] border border-[#244D3F] text-[#64D995] flex items-center justify-center shadow-inner">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#F4F8F5] tracking-tight">
                      Primary Soil Moisture Telemetry
                    </h3>
                    <p className="text-xs text-[#A9BDB1] font-medium">
                      Sensor: <strong className="text-[#F4F8F5]">{activeField?.sensorId || 'SN-PADDY-01'}</strong> • Target Band: 50% – 75%
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${
                  isDry
                    ? 'bg-[#F4B740]/15 text-[#F4B740] border-[#F4B740]/30'
                    : isWet
                    ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                    : 'bg-[#64D995]/15 text-[#64D995] border-[#64D995]/30'
                }`}>
                  {isDry ? 'Low Moisture (Dry)' : isWet ? 'Saturated' : 'Optimal Hydration'}
                </span>

                <button
                  onClick={handlePulse}
                  disabled={isPulsing}
                  className="p-2.5 rounded-2xl bg-[#10251F] hover:bg-[#1D4033] border border-[#244D3F] text-[#64D995] hover:text-[#F4F8F5] transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Simulate Instant Sensor Reading Pulse"
                >
                  <RefreshCw className={`w-4 h-4 ${isPulsing ? 'animate-spin text-[#64D995]' : ''}`} />
                </button>
              </div>
            </div>

            {/* Central Radial / Big Display Gauge */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-6">
              {/* Radial Big Percentage Meter */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-[#10251F] border border-[#244D3F]/60 text-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  {/* SVG Circular Progress Ring */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-[#0B1713]"
                      strokeWidth="9"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className={`${isDry ? 'text-[#F4B740]' : isWet ? 'text-sky-400' : 'text-[#64D995]'} transition-all duration-1000 ease-out`}
                      strokeWidth="9"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * Math.min(100, Math.max(0, moisture))) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-[#F4F8F5] tracking-tight">{moisture}%</span>
                    <span className="text-[10px] font-bold text-[#A9BDB1] uppercase">Root Moisture</span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-[#A9BDB1] mt-2">
                  Last calibrated 2 mins ago
                </span>
              </div>

              {/* Depth Breakdown & Agronomic Target Band */}
              <div className="sm:col-span-7 space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#A9BDB1]">Topsoil Stratum (0 - 15 cm)</span>
                    <span className="text-[#F4F8F5] font-black">{Math.max(20, moisture - 5)}%</span>
                  </div>
                  <div className="w-full bg-[#10251F] border border-[#244D3F]/40 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.max(20, moisture - 5)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#A9BDB1]">Active Root Zone (15 - 30 cm)</span>
                    <span className="text-[#64D995] font-black">{moisture}%</span>
                  </div>
                  <div className="w-full bg-[#10251F] border border-[#244D3F]/40 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#64D995] rounded-full" style={{ width: `${moisture}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#A9BDB1]">Deep Subsoil (30 - 45 cm)</span>
                    <span className="text-[#F4F8F5] font-black">{Math.min(95, moisture + 4)}%</span>
                  </div>
                  <div className="w-full bg-[#10251F] border border-[#244D3F]/40 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400 rounded-full" style={{ width: `${Math.min(95, moisture + 4)}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#10251F] border border-[#244D3F]/50 flex items-start gap-2.5 text-xs text-[#A9BDB1]">
                  <CheckCircle2 className="w-4 h-4 text-[#64D995] flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {isDry
                      ? 'Root moisture below 50%. Irrigation recommended before solar noon to avoid crop wilting.'
                      : 'Soil moisture is in the optimal growth band. Retains enough capillary water for 36 hours.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions for Soil Analytics */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#244D3F]/70 text-xs">
              <span className="text-[#A9BDB1] font-medium">
                Crop: <strong className="text-[#F4F8F5] font-bold">{activeField?.cropType || 'Rice'}</strong> • Soil: <strong className="text-[#F4F8F5] font-bold">{activeField?.soilType || 'Loamy Soil'}</strong>
              </span>

              <button
                onClick={() => onNavigateTab('analytics')}
                className="font-bold text-[#64D995] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View Full Moisture Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2.3 Active Crop Details & Plot Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F] shadow-xl">
              <h4 className="text-xs font-extrabold text-[#A9BDB1] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-[#64D995]" />
                <span>Crop Growth Stage</span>
              </h4>
              <p className="text-lg font-black text-[#F4F8F5]">{activeField?.cropType || 'Paddy / Rice'}</p>
              <div className="flex items-center gap-2 text-xs text-[#A9BDB1] font-semibold mt-1">
                <span>Tillering Stage • Day 42 of 120</span>
              </div>
              <div className="w-full bg-[#10251F] h-1.5 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-[#64D995] rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            <div className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F] shadow-xl">
              <h4 className="text-xs font-extrabold text-[#A9BDB1] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Power className="w-3.5 h-3.5 text-[#64D995]" />
                <span>Smart Drip System</span>
              </h4>
              <div className="flex items-center justify-between">
                <p className="text-lg font-black text-[#F4F8F5]">{activeField?.irrigationType || 'Drip Irrigation'}</p>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${isPumpOn ? 'bg-[#2E8B57] text-white animate-pulse' : 'bg-[#10251F] text-[#A9BDB1] border border-[#244D3F]'}`}>
                  {isPumpOn ? 'Pumping' : 'Standby'}
                </span>
              </div>
              <p className="text-xs text-[#A9BDB1] font-semibold mt-1">
                Automation mode: <strong className="text-[#64D995] font-bold">{irrigationSchedule?.mode === 'auto' ? 'AI Smart Auto' : 'Manual'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* =========================================
            COLUMN 3 (RIGHT): Analytics, Irrigation, Weather & Insights
            Span 3 on Desktop
        ========================================= */}
        <div className="lg:col-span-3 space-y-5">
          {/* 3.1 Next Upcoming Irrigation Schedule */}
          <div className="bg-gradient-to-br from-[#10251F] via-[#17332A] to-[#10251F] rounded-3xl p-5 border border-[#244D3F] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#244D3F]/70">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F4B740]" />
                <h3 className="font-extrabold text-sm text-[#F4F8F5] tracking-tight">
                  Upcoming Irrigation
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('irrigation')}
                className="text-xs font-bold text-[#64D995] hover:text-white flex items-center gap-0.5 cursor-pointer"
              >
                <span>Control</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <div className="p-3 rounded-2xl bg-[#10251F] border border-[#244D3F]/50">
                <span className="text-[11px] text-[#A9BDB1] font-bold block uppercase">Scheduled Slot</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-black text-[#F4B740]">
                    {irrigationSchedule?.nextIrrigationTime || '05:00 PM'}
                  </span>
                  <span className="text-xs font-bold text-[#64D995] bg-[#1D4033] px-2 py-0.5 rounded-lg border border-[#244D3F]">
                    45 Mins
                  </span>
                </div>
                <p className="text-[11px] text-[#A9BDB1] mt-1">
                  Target: 650 Liters across {activeField?.name || 'Selected Plot'}
                </p>
              </div>

              {nextActivity && (
                <div className="p-3 rounded-2xl bg-[#10251F] border border-[#244D3F]/40 flex items-center justify-between">
                  <div className="pr-2">
                    <span className="text-[10px] text-[#A9BDB1] uppercase font-bold block">Next Task</span>
                    <span className="text-xs font-bold text-[#F4F8F5] truncate block max-w-[130px]">{nextActivity.title}</span>
                  </div>
                  <button
                    onClick={() => onUpdateActivity({ ...nextActivity, status: 'completed' })}
                    className="p-2 rounded-xl bg-[#2E8B57] text-white hover:bg-[#359d63] transition-all cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
                    title="Mark Done"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 3.2 Predictive Analytics Snapshot */}
          <div className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#244D3F]/70">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#64D995]" />
                <h3 className="font-extrabold text-sm text-[#F4F8F5] tracking-tight">
                  Moisture Forecast
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('analytics')}
                className="text-xs font-bold text-[#64D995] hover:text-white flex items-center gap-0.5 cursor-pointer"
              >
                <span>Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <p className="text-xs text-[#A9BDB1] leading-relaxed">
                Soil evapotranspiration rate: <strong className="text-[#F4F8F5]">4.2 mm/day</strong>. Moisture expected to drop to <strong className="text-[#F4B740]">54%</strong> by tomorrow afternoon without rain.
              </p>

              {/* Mini Sparkline Visualization */}
              <div className="p-3 rounded-2xl bg-[#10251F] border border-[#244D3F]/40">
                <div className="flex justify-between text-[11px] font-bold text-[#A9BDB1] mb-2">
                  <span>Past 7 Days Stability</span>
                  <span className="text-[#64D995]">Steady (+3%)</span>
                </div>
                <div className="h-10 flex items-end gap-1.5 pt-1">
                  {[62, 65, 59, 74, 70, 66, moisture].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-md transition-all ${
                          idx === 6 ? 'bg-[#64D995] shadow-sm shadow-[#64D995]/50' : 'bg-[#244D3F] hover:bg-[#2E8B57]'
                        }`}
                        style={{ height: `${(val / 85) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3.3 Weather Forecast Preview */}
          <div className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#244D3F]/70">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-sky-400" />
                <h3 className="font-extrabold text-sm text-[#F4F8F5] tracking-tight">
                  Agro-Weather Window
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('weather')}
                className="text-xs font-bold text-[#64D995] hover:text-white flex items-center gap-0.5 cursor-pointer"
              >
                <span>5-Day</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <div className="p-2.5 rounded-xl bg-[#10251F] border border-[#244D3F]/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-[#F4B740]" />
                  <span className="text-[#F4F8F5] font-bold">Today</span>
                </div>
                <span className="text-[#A9BDB1]">30° / 21°</span>
                <span className="text-[#64D995] font-bold">Clear</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#10251F] border border-[#244D3F]/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-indigo-400" />
                  <span className="text-[#F4F8F5] font-bold">Tomorrow</span>
                </div>
                <span className="text-[#A9BDB1]">27° / 20°</span>
                <span className="text-indigo-400 font-bold">12mm Rain</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#10251F] border border-[#244D3F]/30 text-[11px] text-[#A9BDB1] mt-2">
                <span className="text-[#64D995] font-bold block mb-0.5">🌾 Spray Window Advisory:</span>
                Foliar nutrient spraying recommended early morning (06:30 – 09:00 AM) before winds rise.
              </div>
            </div>
          </div>

          {/* 3.4 Survam AI Quick Voice Insights */}
          <div className="bg-gradient-to-br from-[#10251F] via-[#17332A] to-[#10251F] rounded-3xl p-5 border border-[#244D3F] shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#F4B740]" />
              <h3 className="font-extrabold text-sm text-[#F4F8F5] tracking-tight">
                Survam AI Smart Advice
              </h3>
            </div>

            <p className="text-xs text-[#A9BDB1] leading-relaxed">
              {topRecommendation?.message || 'Weather forecast predicts 12 mm rainfall tomorrow afternoon. You can safely withhold evening irrigation to save 650 Liters.'}
            </p>

            <button
              onClick={onOpenAssistant}
              className="w-full mt-3 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#2E8B57]/20 transition-all cursor-pointer active:scale-95"
            >
              <Mic className="w-4 h-4 text-[#F4B740]" />
              <span>Ask Survam AI (Voice)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
