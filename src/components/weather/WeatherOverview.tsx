import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { weatherService } from '../../services/weatherService';
import { apiClient, ApiError } from '../../services/apiClient';
import {
  CloudSun,
  Sun,
  CloudRain,
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  Sprout,
  Compass,
} from 'lucide-react';

export const WeatherOverview: React.FC<{ farmId?: string }> = ({ farmId }) => {
  const { t, language } = useLanguage();
  const [backendWeather, setBackendWeather] = useState<{current?: unknown; forecast?: unknown; error?: string; loading: boolean}>({loading: true});
  useEffect(() => {
    if (!apiClient.configured) return;
    if (!farmId) { setBackendWeather({loading:false,error:'Select a farm with a registered location to request weather.'}); return; }
    const controller = new AbortController();
    setBackendWeather({loading:true});
    Promise.all([
      apiClient.request<unknown>(`/weather/current?farm_id=${encodeURIComponent(farmId)}`, {}, controller.signal),
      apiClient.request<unknown>(`/weather/forecast?farm_id=${encodeURIComponent(farmId)}&days=5`, {}, controller.signal),
    ]).then(([current, forecast]) => setBackendWeather({current,forecast,loading:false}))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const status = error instanceof ApiError ? error.status : -1;
        setBackendWeather({loading:false,error:status === 503 ? 'Weather provider is not enabled or has no cached forecast. Configure a provider key and farm coordinates to enable live weather.' : error instanceof Error ? error.message : 'Weather data is unavailable.'});
      });
    return () => controller.abort();
  }, [farmId]);

  if (apiClient.configured) {
    const currentEnvelope = backendWeather.current as any;
    const currentData = currentEnvelope?.data;
    const forecastData = (backendWeather.forecast as any)?.data;
    const currentValues = currentEnvelope?.provider === 'openweathermap' && currentData?.main ? {
      temperature: currentData.main.temp, humidity: currentData.main.humidity,
      windKmh: typeof currentData.wind?.speed === 'number' ? Math.round(currentData.wind.speed * 3.6) : null,
      description: currentData.weather?.[0]?.description,
    } : currentEnvelope?.provider === 'tomorrow' ? {
      temperature: currentData?.data?.values?.temperature,
      humidity: currentData?.data?.values?.humidity,
      windKmh: typeof currentData?.data?.values?.windSpeed === 'number' ? Math.round(currentData.data.values.windSpeed * 3.6) : null,
      description: currentData?.data?.values?.weatherCode,
    } : undefined;
    const forecastRows = currentEnvelope?.provider === 'openweathermap' && Array.isArray(forecastData?.list)
      ? forecastData.list.filter((row: any) => row.dt_txt?.includes('12:00:00')).slice(0, 5).map((row: any) => ({date:row.dt_txt.slice(0,10),temperature:row.main?.temp,rainMm:row.rain?.['3h'] ?? 0,rainChance:Math.round((row.pop ?? 0)*100),description:row.weather?.[0]?.description}))
      : currentEnvelope?.provider === 'tomorrow' && Array.isArray(forecastData?.timelines?.daily)
        ? forecastData.timelines.daily.slice(0,5).map((row: any) => ({date:row.time?.slice(0,10),temperature:row.values?.temperatureMax,rainMm:row.values?.rainIntensityMax,rainChance:row.values?.precipitationProbabilityMax,description:row.values?.weatherCodeMax})) : [];
    const description = backendWeather.error || (backendWeather.loading ? 'Loading weather from the configured backend provider…' : 'The backend returned weather data, but its provider response is not available in the current display format.');
    return <div className="space-y-6">
      <div><h2 className="text-xl sm:text-2xl font-black text-[#F4F8F5] flex items-center gap-2"><CloudSun className="w-6 h-6 text-[#64D995]" /><span>{t('weatherTitle')}</span></h2><p className="text-xs sm:text-sm text-[#A9BDB1] font-medium mt-0.5">{t('weatherSubtitle')}</p></div>
      <section className="bg-[#17332A] rounded-3xl p-6 border border-[#244D3F]" aria-live="polite">
        <div className="flex items-start gap-3"><ShieldAlert className="w-5 h-5 text-[#F4B740] shrink-0 mt-0.5"/><div><h3 className="font-bold text-[#F4F8F5]">{backendWeather.loading ? 'Weather status' : backendWeather.error && !currentValues ? 'Weather unavailable' : 'Weather from configured provider'}</h3><p className="text-sm text-[#A9BDB1] mt-1">{backendWeather.error || (backendWeather.loading ? description : `Provider: ${currentEnvelope?.provider || 'unknown'} · ${currentEnvelope?.data_status || 'response received'}.` )}</p>
          {currentValues && <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-[#10251F] rounded-2xl p-3 border border-[#244D3F]"><span className="text-xs text-[#A9BDB1]">Temperature</span><p className="text-xl font-bold">{currentValues.temperature ?? '—'}°C</p></div>
            <div className="bg-[#10251F] rounded-2xl p-3 border border-[#244D3F]"><span className="text-xs text-[#A9BDB1]">Humidity</span><p className="text-xl font-bold">{currentValues.humidity ?? '—'}%</p></div>
            <div className="bg-[#10251F] rounded-2xl p-3 border border-[#244D3F]"><span className="text-xs text-[#A9BDB1]">Wind</span><p className="text-xl font-bold">{currentValues.windKmh ?? '—'} km/h</p></div>
            <div className="bg-[#10251F] rounded-2xl p-3 border border-[#244D3F]"><span className="text-xs text-[#A9BDB1]">Conditions</span><p className="text-sm font-bold capitalize">{currentValues.description ?? '—'}</p></div>
          </div>}
          {forecastRows.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">{forecastRows.map((row: any) => <div key={row.date} className="bg-[#10251F] rounded-2xl p-3 border border-[#244D3F]"><p className="text-xs text-[#A9BDB1]">{row.date}</p><p className="font-bold mt-1">{row.temperature ?? '—'}°C</p><p className="text-xs text-[#A9BDB1] capitalize">{row.description ?? 'Forecast'}</p><p className="text-xs text-sky-300 mt-1">Rain: {row.rainMm ?? '—'} mm · {row.rainChance ?? '—'}%</p></div>)}</div>}
          {!backendWeather.loading && !backendWeather.error && !currentValues && <p className="text-xs text-[#A9BDB1] mt-3">This provider returned an unsupported response format; no weather estimates are being shown.</p>}
        </div></div>
      </section>
    </div>;
  }
  const forecast = weatherService.get5DayForecast(language);
  const todayWeather = forecast[0];

  const getWeatherIcon = (cond: string, className = 'w-6 h-6') => {
    switch (cond) {
      case 'sunny':
        return <Sun className={`${className} text-[#F4B740]`} />;
      case 'rainy':
        return <CloudRain className={`${className} text-indigo-400`} />;
      case 'cloudy':
        return <Cloud className={`${className} text-[#A9BDB1]`} />;
      default:
        return <CloudSun className={`${className} text-[#F4B740]`} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#F4F8F5] flex items-center gap-2">
          <CloudSun className="w-6 h-6 text-[#64D995]" />
          <span>{t('weatherTitle')}</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#A9BDB1] font-medium mt-0.5">
          {t('weatherSubtitle')}
        </p>
      </div>

      {/* Demo Notice */}
      <div className="bg-[#10251F] border border-[#244D3F] rounded-2xl p-3 flex items-center gap-2.5 text-xs text-[#A9BDB1]">
        <ShieldAlert className="w-4 h-4 text-[#64D995] flex-shrink-0" />
        <span className="font-semibold">{t('weatherDisclaimer')}</span>
      </div>

      {/* Large Current Weather Hero Card */}
      <div className="bg-gradient-to-br from-[#10251F] via-[#17332A] to-[#10251F] rounded-3xl p-6 sm:p-8 text-[#F4F8F5] shadow-xl border border-[#244D3F] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#2E8B57]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#F4B740] text-[#0B1713] inline-block mb-3 shadow-sm">
              {todayWeather.dayName} • {todayWeather.date}
            </span>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-[#10251F] border border-[#244D3F] flex items-center justify-center shadow-inner">
                {getWeatherIcon(todayWeather.condition, 'w-12 h-12')}
              </div>
              <div>
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-[#F4F8F5]">
                  {todayWeather.tempMax}°C
                </span>
                <p className="text-sm font-bold text-[#A9BDB1] mt-0.5">
                  Min: {todayWeather.tempMin}°C • {t('sunnyDay')}
                </p>
              </div>
            </div>
          </div>

          {/* Environmental metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#10251F]/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#244D3F]">
              <span className="text-[11px] text-[#A9BDB1] flex items-center gap-1 font-semibold mb-1">
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                <span>{t('rainProbability')}</span>
              </span>
              <span className="text-xl font-black text-[#F4F8F5]">
                {todayWeather.rainProbability}%
              </span>
            </div>

            <div className="bg-[#10251F]/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#244D3F]">
              <span className="text-[11px] text-[#A9BDB1] flex items-center gap-1 font-semibold mb-1">
                <Droplets className="w-3.5 h-3.5 text-[#64D995]" />
                <span>{t('metricHumidity')}</span>
              </span>
              <span className="text-xl font-black text-[#F4F8F5]">
                {todayWeather.humidity}%
              </span>
            </div>

            <div className="bg-[#10251F]/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#244D3F] col-span-2 sm:col-span-1">
              <span className="text-[11px] text-[#A9BDB1] flex items-center gap-1 font-semibold mb-1">
                <Wind className="w-3.5 h-3.5 text-[#F4B740]" />
                <span>{t('windSpeed')}</span>
              </span>
              <span className="text-xl font-black text-[#F4F8F5]">
                {todayWeather.windSpeedKmh} km/h
              </span>
            </div>
          </div>
        </div>

        {/* Agricultural Advisory Pill */}
        <div className="mt-6 pt-4 border-t border-[#244D3F]/70 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#10251F] border border-[#244D3F] text-[#F4B740] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F4B740]">
              {language === 'hi' ? 'दैनिक कृषि परामर्श' : language === 'kn' ? 'ದೈನಂದಿನ ಕೃಷಿ ಸಲಹೆ' : 'Daily Agro-Advisory'}
            </h4>
            <p className="text-xs sm:text-sm text-[#A9BDB1] font-medium mt-0.5 leading-relaxed">
              {todayWeather.farmingAdvisory}
            </p>
          </div>
        </div>
      </div>

      {/* 5-Day Extended Weather Cards */}
      <div>
        <h3 className="text-lg font-black text-[#F4F8F5] mb-3">
          {t('fiveDayForecast')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {forecast.map((day, idx) => (
            <div
              key={idx}
              className={`bg-[#17332A] rounded-3xl p-4 border transition-all ${
                idx === 0
                  ? 'border-[#64D995] ring-2 ring-[#64D995]/20 shadow-xl'
                  : 'border-[#244D3F] hover:border-[#64D995]/40'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#244D3F]/70">
                <span className="font-extrabold text-xs text-[#F4F8F5]">
                  {day.dayName}
                </span>
                <span className="text-[11px] text-[#A9BDB1] font-semibold">
                  {day.date.split('/')[0]}/{day.date.split('/')[1]}
                </span>
              </div>

              <div className="flex items-center justify-center py-4">
                {getWeatherIcon(day.condition, 'w-10 h-10')}
              </div>

              <div className="flex items-baseline justify-center gap-1.5 my-1">
                <span className="text-2xl font-black text-[#F4F8F5]">
                  {day.tempMax}°
                </span>
                <span className="text-sm font-semibold text-[#A9BDB1]">
                  / {day.tempMin}°
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-[#A9BDB1] font-semibold mt-3 pt-2 border-t border-[#244D3F]/70">
                <div className="flex justify-between">
                  <span>Rain:</span>
                  <span className="text-indigo-400 font-bold">{day.rainfallMm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span>Chance:</span>
                  <span className="font-bold text-[#F4F8F5]">{day.rainProbability}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Wind:</span>
                  <span className="font-bold text-[#F4F8F5]">{day.windSpeedKmh} km/h</span>
                </div>
              </div>

              <p className="text-[11px] text-[#A9BDB1] font-medium mt-3 pt-2 border-t border-[#244D3F]/60 line-clamp-3 leading-snug">
                {day.farmingAdvisory}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
