import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SensorReading } from '../../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import {
  LineChart as ChartIcon,
  Droplets,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface MoistureChartProps {
  readingsHistory: SensorReading[];
  currentReading?: SensorReading;
  fieldName?: string;
  backendMode?: boolean;
}

export const MoistureChart: React.FC<MoistureChartProps> = ({
  readingsHistory,
  currentReading,
  fieldName,
  backendMode = false,
}) => {
  const { t, language } = useLanguage();
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days'>('7days');

  // Filter history based on timeframe
  const filteredReadings = React.useMemo(() => {
    const now = Date.now();
    if (timeframe === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      return readingsHistory.filter(
        (r) => new Date(r.timestamp).getTime() >= todayStart.getTime()
      );
    } else if (timeframe === '7days') {
      const cutoff = now - 7 * 86400000;
      return readingsHistory.filter(
        (r) => new Date(r.timestamp).getTime() >= cutoff
      );
    } else {
      return readingsHistory; // 30 days
    }
  }, [readingsHistory, timeframe]);

  // Chart data formatting
  const chartData = filteredReadings.map((r) => {
    const d = new Date(r.timestamp);
    const label =
      timeframe === 'today'
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    return {
      time: label,
      moisture: r.moisturePercent,
      temperature: r.temperatureC,
      humidity: r.humidityPercent,
    };
  });

  // Calculations for Min, Max, Average
  const moistureValues = filteredReadings.map((r) => r.moisturePercent);
  const avgMoisture =
    moistureValues.length > 0
      ? Math.round(
          moistureValues.reduce((sum, val) => sum + val, 0) / moistureValues.length
        )
      : currentReading?.moisturePercent ?? (backendMode ? null : 68);
  const maxMoisture =
    moistureValues.length > 0 ? Math.max(...moistureValues) : (backendMode ? null : 74);
  const minMoisture =
    moistureValues.length > 0 ? Math.min(...moistureValues) : (backendMode ? null : 48);

  const currentMoist = currentReading?.moisturePercent ?? avgMoisture;

  const getMoistureAdvice = () => {
    if (currentMoist == null) {
      return { text: 'No backend sensor readings are available for this field and time range.', icon: AlertTriangle, color: 'text-[#A9BDB1]', bg: 'bg-[#10251F] border-[#244D3F]' };
    } else if (currentMoist < 45) {
      return {
        text: t('moistureDryNote'),
        icon: AlertTriangle,
        color: 'text-[#F4B740]',
        bg: 'bg-[#F4B740]/15 border-[#F4B740]/30',
      };
    } else if (currentMoist > 78) {
      return {
        text: t('moistureWetNote'),
        icon: Droplets,
        color: 'text-sky-400',
        bg: 'bg-sky-500/15 border-sky-500/30',
      };
    } else {
      return {
        text: t('moistureHealthyNote'),
        icon: CheckCircle2,
        color: 'text-[#64D995]',
        bg: 'bg-[#1D4033] border-[#244D3F]',
      };
    }
  };

  const advice = getMoistureAdvice();
  const AdviceIcon = advice.icon;

  return (
    <div className="space-y-6">
      {/* Header and Timeframe Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#F4F8F5] flex items-center gap-2">
            <ChartIcon className="w-6 h-6 text-[#64D995]" />
            <span>{t('analyticsTitle')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#A9BDB1] font-medium mt-0.5">
            {fieldName ? `Root telemetry for ${fieldName}` : t('analyticsSubtitle')}
          </p>
          {backendMode && currentReading?.source === 'synthetic_demo' && <p className="text-[11px] text-[#F4B740] mt-1">Synthetic demo readings · not real farm measurements</p>}
        </div>

        {/* Timeframe buttons */}
        <div className="flex items-center bg-[#10251F] p-1 rounded-2xl border border-[#244D3F] shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
              timeframe === 'today'
                ? 'bg-[#2E8B57] text-white shadow-md'
                : 'text-[#A9BDB1] hover:text-[#F4F8F5]'
            }`}
          >
            {t('timeframeToday')}
          </button>
          <button
            onClick={() => setTimeframe('7days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
              timeframe === '7days'
                ? 'bg-[#2E8B57] text-white shadow-md'
                : 'text-[#A9BDB1] hover:text-[#F4F8F5]'
            }`}
          >
            {t('timeframe7Days')}
          </button>
          <button
            onClick={() => setTimeframe('30days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
              timeframe === '30days'
                ? 'bg-[#2E8B57] text-white shadow-md'
                : 'text-[#A9BDB1] hover:text-[#F4F8F5]'
            }`}
          >
            {t('timeframe30Days')}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F] shadow-xl flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#10251F] border border-[#244D3F] text-[#64D995] flex items-center justify-center flex-shrink-0 shadow-inner">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A9BDB1]">{t('averageMoisture')}</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-[#F4F8F5]">{avgMoisture == null ? '—' : `${Math.round(avgMoisture)}%`}</span>
              <span className="text-xs text-[#64D995] font-bold">{backendMode ? 'Recorded average' : 'Optimal'}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F] shadow-xl flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#10251F] border border-[#244D3F] text-sky-400 flex items-center justify-center flex-shrink-0 shadow-inner">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A9BDB1]">{t('maxMoisture')}</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-[#F4F8F5]">{maxMoisture == null ? '—' : `${maxMoisture}%`}</span>
              <span className="text-xs text-[#A9BDB1]/70 font-semibold">Post-rain</span>
            </div>
          </div>
        </div>

        <div className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F] shadow-xl flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#10251F] border border-[#244D3F] text-[#F4B740] flex items-center justify-center flex-shrink-0 shadow-inner">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#A9BDB1]">{t('minMoisture')}</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-[#F4F8F5]">{minMoisture == null ? '—' : `${minMoisture}%`}</span>
              <span className="text-xs text-[#A9BDB1]/70 font-semibold">Pre-irrigation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Line Graph */}
      <div className="bg-[#17332A] rounded-3xl p-5 sm:p-6 shadow-xl border border-[#244D3F]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#244D3F]/70 mb-4 gap-2">
          <div>
            <h3 className="font-extrabold text-base text-[#F4F8F5] flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[#64D995]" />
              <span>Soil Hydration Curve (%)</span>
            </h3>
            <p className="text-xs text-[#A9BDB1] font-medium">
              Highlighted green band represents ideal crop moisture target (50% – 75%)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-[#F4F8F5]">
              <span className="w-3 h-3 rounded-full bg-[#64D995] inline-block shadow-sm shadow-[#64D995]/50" />
              <span>Moisture %</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#A9BDB1]">
              <span className="w-3 h-1 bg-[#2E8B57] inline-block" />
              <span>Target Band</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          {backendMode && chartData.length === 0 ? <div className="h-full flex items-center justify-center text-sm text-[#A9BDB1]">No readings recorded for this field and time range.</div> :
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#244D3F" opacity={0.6} />
              <XAxis
                dataKey="time"
                stroke="#A9BDB1"
                fontSize={11}
                tickLine={false}
                tick={{ fill: '#A9BDB1' }}
              />
              <YAxis
                domain={[20, 100]}
                stroke="#A9BDB1"
                fontSize={11}
                tickLine={false}
                tick={{ fill: '#A9BDB1' }}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#10251F',
                  borderRadius: '16px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                  border: '1px solid #244D3F',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#F4F8F5',
                }}
                itemStyle={{ color: '#64D995' }}
              />
              {/* Healthy Target Range Reference Area */}
              <ReferenceArea
                y1={50}
                y2={75}
                fill="#2E8B57"
                fillOpacity={0.2}
              />
              <ReferenceLine y={50} stroke="#64D995" strokeDasharray="3 3" opacity={0.8} />
              <ReferenceLine y={75} stroke="#64D995" strokeDasharray="3 3" opacity={0.8} />
              <Line
                type="monotone"
                dataKey="moisture"
                stroke="#64D995"
                strokeWidth={3.5}
                dot={{ fill: '#2E8B57', stroke: '#64D995', r: 4 }}
                activeDot={{ r: 7, stroke: '#F4F8F5', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
          }
        </div>

        {/* Farmer Simple Explanation Box */}
        <div className={`mt-4 p-4 rounded-2xl border flex items-center gap-3 ${advice.bg}`}>
          <AdviceIcon className={`w-6 h-6 flex-shrink-0 ${advice.color}`} />
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${advice.color}`}>
              {language === 'hi' ? 'कृषि सलाह' : language === 'kn' ? 'ಕೃಷಿ ಸಲಹೆ' : 'Agricultural Advice'}
            </h4>
            <p className="text-xs sm:text-sm font-extrabold text-[#F4F8F5] mt-0.5">
              {advice.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
