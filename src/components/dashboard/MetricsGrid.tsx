import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SensorReading, Sensor, IrrigationSchedule } from '../../types';
import {
  Droplets,
  Thermometer,
  CloudRain,
  Radio,
  Power,
  Waves,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

interface MetricsGridProps {
  latestReading?: SensorReading;
  sensors: Sensor[];
  irrigationSchedule?: IrrigationSchedule;
  onNavigateTab: (tab: string) => void;
  backendMode?: boolean;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  latestReading,
  sensors,
  irrigationSchedule,
  onNavigateTab,
  backendMode = false,
}) => {
  const { t, language } = useLanguage();

  const hasReading = Boolean(latestReading);
  const moisture = latestReading?.moisturePercent ?? (backendMode ? 0 : 68);
  const temp = latestReading?.temperatureC ?? (backendMode ? 0 : 29);
  const humidity = latestReading?.humidityPercent ?? (backendMode ? 0 : 72);
  const rainfall = latestReading ? latestReading.rainfallMm : 0;
  const isPumpOn = irrigationSchedule?.status === 'ON';

  const onlineSensors = sensors.filter((s) => s.status === 'online' || s.status === 'active').length;
  const offlineSensors = sensors.filter((s) => s.status === 'offline' || s.status === 'inactive').length;
  const totalSensors = sensors.length;

  const readingTimeLabel = latestReading?.readingTime
    ? `${latestReading.readingDate || 'Today'} ${latestReading.readingTime}`
    : latestReading?.timestamp ? new Date(latestReading.timestamp).toLocaleString() : backendMode ? 'No backend reading' : 'Recent (Local)';

  // Moisture status evaluation
  const moistureStatus = !hasReading && backendMode
    ? { label: 'No reading', color: 'text-[#A9BDB1]', bg: 'bg-[#10251F] border-[#244D3F]', bar: 'bg-[#244D3F]' }
    : moisture < 45
      ? { label: t('statusWarning'), color: 'text-[#F4B740]', bg: 'bg-[#F4B740]/15 border-[#F4B740]/30', bar: 'bg-[#F4B740]' }
      : moisture > 80
      ? { label: t('statusWarning'), color: 'text-sky-400', bg: 'bg-sky-500/15 border-sky-500/30', bar: 'bg-sky-400' }
      : { label: t('statusHealthy'), color: 'text-[#64D995]', bg: 'bg-[#64D995]/15 border-[#64D995]/30', bar: 'bg-[#64D995]' };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. SOIL MOISTURE */}
      <div
        onClick={() => onNavigateTab('analytics')}
        className="bg-[#17332A] rounded-3xl p-5 shadow-xl border border-[#244D3F] hover:border-[#64D995]/60 transition-all hover:shadow-2xl hover:shadow-[#64D995]/10 cursor-pointer group relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-[#10251F] border border-[#244D3F] text-[#64D995] flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#F4F8F5]">
                {t('metricSoilMoisture')}
              </h3>
              <p className="text-[11px] text-[#A9BDB1] font-medium">
                {t('metricSoilMoistureDesc')}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${moistureStatus.bg} ${moistureStatus.color}`}
          >
            {moistureStatus.label}
          </span>
        </div>

        {/* Big Number */}
        <div className="flex items-baseline gap-2 my-2">
          <span className="text-4xl sm:text-5xl font-black text-[#F4F8F5] tracking-tight">
            {!hasReading && backendMode ? '—' : `${moisture}%`}
          </span>
          <span className="text-xs font-semibold text-[#A9BDB1]">
            {language === 'hi' ? 'जड़ स्तर पर' : language === 'kn' ? 'ಬೇರಿನ ಮಟ್ಟದಲ್ಲಿ' : 'in root zone'}
          </span>
        </div>
        {backendMode && latestReading?.source === 'synthetic_demo' && <p className="text-[11px] text-[#F4B740]">Synthetic demo data · not real farm measurements</p>}

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#10251F] border border-[#244D3F]/50 h-2.5 rounded-full overflow-hidden my-2.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${moistureStatus.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, moisture))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#A9BDB1] font-semibold pt-1">
          <span>{!hasReading && backendMode ? 'No backend sensor reading is available.' : moisture < 50 ? t('moistureDryNote') : t('moistureHealthyNote')}</span>
          <ArrowUpRight className="w-4 h-4 text-[#64D995] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>
      </div>

      {/* 2. TEMPERATURE */}
      <div
        onClick={() => onNavigateTab('weather')}
        className="bg-[#17332A] rounded-3xl p-5 shadow-xl border border-[#244D3F] hover:border-[#64D995]/60 transition-all hover:shadow-2xl hover:shadow-[#64D995]/10 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-[#10251F] border border-[#244D3F] text-[#F4B740] flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#F4F8F5]">
                {t('metricTemperature')}
              </h3>
              <p className="text-[11px] text-[#A9BDB1] font-medium">
                {t('metricTemperatureDesc')}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${temp > 32 ? 'bg-[#F4B740]/15 border-[#F4B740]/30 text-[#F4B740]' : 'bg-[#64D995]/15 border-[#64D995]/30 text-[#64D995]'}`}>
            {temp > 32 ? t('statusWarning') : t('statusHealthy')}
          </span>
        </div>

        <div className="flex items-baseline gap-2 my-2">
          <span className="text-4xl sm:text-5xl font-black text-[#F4F8F5] tracking-tight">
            {!hasReading && backendMode ? '—' : `${temp}°C`}
          </span>
          <span className="text-xs font-semibold text-[#A9BDB1]">
            {temp > 30 ? (language === 'hi' ? 'गर्म' : language === 'kn' ? 'ಬಿಸಿ' : 'Warm') : (language === 'hi' ? 'सामान्य' : language === 'kn' ? 'ಸಾಮಾನ್ಯ' : 'Pleasant')}
          </span>
        </div>

        <div className="w-full bg-[#10251F] border border-[#244D3F]/50 h-2.5 rounded-full overflow-hidden my-2.5">
          <div
            className="h-full bg-[#F4B740] rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, (temp / 45) * 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#A9BDB1] font-semibold pt-1">
          <span>{backendMode ? 'Weather details are on the Weather page.' : 'Min: 21°C • Max: 32°C'}</span>
          <ArrowUpRight className="w-4 h-4 text-[#64D995] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* 3. HUMIDITY */}
      <div
        onClick={() => onNavigateTab('weather')}
        className="bg-[#17332A] rounded-3xl p-5 shadow-xl border border-[#244D3F] hover:border-[#64D995]/60 transition-all hover:shadow-2xl hover:shadow-[#64D995]/10 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-[#10251F] border border-[#244D3F] text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#F4F8F5]">
                {t('metricHumidity')}
              </h3>
              <p className="text-[11px] text-[#A9BDB1] font-medium">
                {t('metricHumidityDesc')}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${humidity > 80 ? 'bg-[#F4B740]/15 border-[#F4B740]/30 text-[#F4B740]' : 'bg-[#64D995]/15 border-[#64D995]/30 text-[#64D995]'}`}>
            {humidity > 80 ? t('statusWarning') : t('statusHealthy')}
          </span>
        </div>

        <div className="flex items-baseline gap-2 my-2">
          <span className="text-4xl sm:text-5xl font-black text-[#F4F8F5] tracking-tight">
            {!hasReading && backendMode ? '—' : `${humidity}%`}
          </span>
          <span className="text-xs font-semibold text-[#A9BDB1]">
            {humidity > 70 ? (language === 'hi' ? 'आर्द्र' : language === 'kn' ? 'ಆರ್ದ್ರ' : 'Humid') : 'Normal'}
          </span>
        </div>

        <div className="w-full bg-[#10251F] border border-[#244D3F]/50 h-2.5 rounded-full overflow-hidden my-2.5">
          <div
            className="h-full bg-sky-400 rounded-full transition-all duration-700"
            style={{ width: `${humidity}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#A9BDB1] font-semibold pt-1">
          <span>{backendMode ? 'Latest recorded sensor humidity.' : language === 'hi' ? 'पत्तियों पर नमी अनुकूल है' : language === 'kn' ? 'ಎಲೆಗಳ ತೇವಾಂಶ ಉತ್ತಮ' : 'Canopy moisture is good'}</span>
          <ArrowUpRight className="w-4 h-4 text-[#64D995] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* 4. RAINFALL FORECAST */}
      <div
        onClick={() => onNavigateTab('weather')}
        className="bg-[#17332A] rounded-3xl p-5 shadow-xl border border-[#244D3F] hover:border-[#64D995]/60 transition-all hover:shadow-2xl hover:shadow-[#64D995]/10 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-[#10251F] border border-[#244D3F] text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
              <CloudRain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#F4F8F5]">
                {t('metricRainfall')}
              </h3>
              <p className="text-[11px] text-[#A9BDB1] font-medium">
                {t('metricRainfallDesc')}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
            {backendMode ? 'Forecast unavailable' : '12 mm'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 my-2">
          <span className="text-4xl sm:text-5xl font-black text-[#F4F8F5] tracking-tight">
            {backendMode ? '—' : <>12 <span className="text-2xl font-bold">mm</span></>}
          </span>
          <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/20 px-2 py-0.5 rounded-md">
            {backendMode ? 'Weather API' : language === 'hi' ? 'कल दोपहर' : language === 'kn' ? 'ನಾಳೆ ಮಧ್ಯಾಹ್ನ' : 'Tomorrow PM'}
          </span>
        </div>

        <div className="w-full bg-[#10251F] border border-[#244D3F]/50 h-2.5 rounded-full overflow-hidden my-2.5">
          {!backendMode && <div className="h-full bg-indigo-400 rounded-full" style={{ width: '65%' }} />}
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#A9BDB1] font-semibold pt-1">
          <span>{backendMode ? 'Open Weather for the configured provider forecast.' : <>80% {language === 'hi' ? 'संभावना' : language === 'kn' ? 'ಸಂಭವನೀಯತೆ' : 'chance'} • {language === 'hi' ? 'सिंचाई स्थगित रखें' : language === 'kn' ? 'ನೀರಾವರಿ ಮುಂದೂಡಿ' : 'Hold irrigation'}</>}</span>
          <ArrowUpRight className="w-4 h-4 text-[#64D995] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* 5. IRRIGATION STATUS */}
      <div
        onClick={() => onNavigateTab('irrigation')}
        className="bg-[#17332A] rounded-3xl p-5 shadow-xl border border-[#244D3F] hover:border-[#64D995]/60 transition-all hover:shadow-2xl hover:shadow-[#64D995]/10 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner ${
                isPumpOn
                  ? 'bg-gradient-to-br from-[#2E8B57] to-[#1F6B41] text-white shadow-lg shadow-[#2E8B57]/30 animate-pulse'
                  : 'bg-[#10251F] border border-[#244D3F] text-[#A9BDB1]'
              }`}
            >
              <Power className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#F4F8F5]">
                {t('metricIrrigation')}
              </h3>
              <p className="text-[11px] text-[#A9BDB1] font-medium">
                {irrigationSchedule?.mode === 'auto' ? t('modeAuto') : t('modeManual')}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isPumpOn
                ? 'bg-[#2E8B57] text-white border-[#64D995]/40 shadow-sm'
                : 'bg-[#10251F] border-[#244D3F] text-[#A9BDB1]'
            }`}
          >
            {isPumpOn ? t('statusOn') : t('statusOff')}
          </span>
        </div>

        <div className="flex items-baseline gap-2 my-2">
          <span
            className={`text-4xl sm:text-5xl font-black tracking-tight ${
              isPumpOn ? 'text-[#64D995]' : 'text-[#F4F8F5]'
            }`}
          >
            {isPumpOn ? 'ON' : 'OFF'}
          </span>
          <span className="text-xs font-semibold text-[#A9BDB1]">
            {irrigationSchedule?.waterUsedLitersToday || 0} L {t('liters')}
          </span>
        </div>

        <div className="w-full bg-[#10251F] border border-[#244D3F]/50 h-2.5 rounded-full overflow-hidden my-2.5">
          <div
            className={`h-full rounded-full ${isPumpOn ? 'bg-[#64D995] animate-pulse' : 'bg-[#244D3F]'}`}
            style={{ width: isPumpOn ? '100%' : '20%' }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#A9BDB1] font-semibold pt-1">
          <span>{irrigationSchedule?.nextIrrigationTime || 'Next: 05:00 PM'}</span>
          <ArrowUpRight className="w-4 h-4 text-[#64D995] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* 6. SENSOR STATUS */}
      <div
        onClick={() => onNavigateTab('sensors')}
        className="bg-[#17332A] rounded-3xl p-5 shadow-xl border border-[#244D3F] hover:border-[#64D995]/60 transition-all hover:shadow-2xl hover:shadow-[#64D995]/10 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-[#10251F] border border-[#244D3F] text-[#64D995] flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#F4F8F5]">
                {t('metricSensors')}
              </h3>
              <p className="text-[11px] text-[#A9BDB1] font-medium">
                {t('metricSensorsDesc')}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              offlineSensors > 0
                ? 'bg-[#F4B740]/15 border-[#F4B740]/30 text-[#F4B740]'
                : 'bg-[#64D995]/15 border-[#64D995]/30 text-[#64D995]'
            }`}
          >
            {offlineSensors > 0 ? `${offlineSensors} ${t('statusOffline')}` : t('statusHealthy')}
          </span>
        </div>

        <div className="flex items-baseline gap-2 my-2">
          <span className="text-4xl sm:text-5xl font-black text-[#F4F8F5] tracking-tight">
            {onlineSensors}
            <span className="text-2xl text-[#A9BDB1]/60 font-normal">/{totalSensors}</span>
          </span>
          <span className="text-xs font-bold text-[#64D995] bg-[#10251F] border border-[#244D3F] px-2 py-0.5 rounded-md">
            {t('statusActive')}
          </span>
        </div>

        <div className="w-full bg-[#10251F] border border-[#244D3F]/50 h-2.5 rounded-full overflow-hidden my-2.5 flex">
          <div
            className="h-full bg-[#64D995]"
            style={{ width: `${(onlineSensors / (totalSensors || 1)) * 100}%` }}
          />
          {offlineSensors > 0 && (
            <div
              className="h-full bg-[#E45B5B]"
              style={{ width: `${(offlineSensors / (totalSensors || 1)) * 100}%` }}
            />
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#A9BDB1] font-semibold pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#A9BDB1]" />
            <span>{readingTimeLabel}</span>
          </span>
          <ArrowUpRight className="w-4 h-4 text-[#64D995] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};
