import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Farm, Field, Sensor, SensorReading } from '../../types';
import {
  Droplets,
  Thermometer,
  Waves,
  CloudRain,
  Power,
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';

interface SensorDataInputFormProps {
  farms: Farm[];
  fields: Field[];
  sensors: Sensor[];
  defaultFarmId?: string;
  defaultFieldId?: string;
  onSubmit: (reading: Omit<SensorReading, 'id'>) => void | Promise<void>;
  onCancel?: () => void;
}

export const SensorDataInputForm: React.FC<SensorDataInputFormProps> = ({
  farms,
  fields,
  sensors,
  defaultFarmId,
  defaultFieldId,
  onSubmit,
  onCancel,
}) => {
  const { t, language } = useLanguage();

  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);

  const [farmId, setFarmId] = useState<string>(
    farms.some((farm) => farm.id === defaultFarmId) ? defaultFarmId! : farms[0]?.id || ''
  );

  const availableFields = fields.filter((f) => f.farmId === farmId);
  const [fieldId, setFieldId] = useState<string>(
    availableFields.some((field) => field.id === defaultFieldId) ? defaultFieldId! : availableFields[0]?.id || ''
  );

  const availableSensors = sensors.filter((s) => s.fieldId === fieldId && s.farmId === farmId);
  const [sensorId, setSensorId] = useState<string>(
    availableSensors[0]?.id || ''
  );

  // Readings
  const [moisture, setMoisture] = useState<number | string>(65);
  const [temperature, setTemperature] = useState<number | string>(28);
  const [humidity, setHumidity] = useState<number | string>(70);
  const [rainfall, setRainfall] = useState<number | string>(0);
  const [irrigationStatus, setIrrigationStatus] = useState<'ON' | 'OFF'>('OFF');
  const [readingDate, setReadingDate] = useState<string>(currentDate);
  const [readingTime, setReadingTime] = useState<string>(currentTime);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear Form
  const handleClearForm = () => {
    setMoisture(50);
    setTemperature(26);
    setHumidity(65);
    setRainfall(0);
    setIrrigationStatus('OFF');
    setReadingDate(currentDate);
    setReadingTime(currentTime);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Check required farm/field/sensor
    if (!farmId || !fieldId) {
      setErrorMessage(t('validationError'));
      return;
    }

    if (!sensorId) {
      setErrorMessage(t('noSensorsRegistered'));
      return;
    }

    // 2. Validate ranges
    const mNum = Number(moisture);
    if (isNaN(mNum) || mNum < 0 || mNum > 100) {
      setErrorMessage(t('rangeErrorMoisture'));
      return;
    }

    const hNum = Number(humidity);
    if (isNaN(hNum) || hNum < 0 || hNum > 100) {
      setErrorMessage(t('rangeErrorHumidity'));
      return;
    }

    const tNum = Number(temperature);
    if (isNaN(tNum) || tNum < -10 || tNum > 60) {
      setErrorMessage(t('rangeErrorTemp'));
      return;
    }

    const rNum = Number(rainfall);
    if (isNaN(rNum) || rNum < 0) {
      setErrorMessage(t('rangeErrorRain'));
      return;
    }

    // 3. Assemble timestamp
    const dateObj = new Date(`${readingDate}T${readingTime}:00`);
    const timestamp = isNaN(dateObj.getTime())
      ? new Date().toISOString()
      : dateObj.toISOString();

    const newReading: Omit<SensorReading, 'id'> = {
      sensorId,
      farmId,
      fieldId,
      timestamp,
      readingDate,
      readingTime,
      moisturePercent: mNum,
      soilMoisture: mNum,
      temperatureC: tNum,
      temperature: tNum,
      humidityPercent: hNum,
      humidity: hNum,
      rainfallMm: rNum,
      rainfall: rNum,
      irrigationActive: irrigationStatus === 'ON',
      irrigationStatus,
      isSimulated: false,
      source: 'manual',
    };

    setIsSubmitting(true);
    try {
      await onSubmit(newReading);
      setSuccessToast(t('readingSavedSuccess'));
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save this sensor reading. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#17332A] rounded-3xl p-5 sm:p-7 shadow-xl border border-[#244D3F] space-y-6 text-[#F4F8F5]">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#244D3F]/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#10251F] border border-[#244D3F] text-[#64D995] flex items-center justify-center flex-shrink-0 shadow-inner">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#F4F8F5] tracking-tight">
              {t('enterSensorReadings')}
            </h3>
            <p className="text-xs text-[#A9BDB1] font-medium">
              {t('enterSensorReadingsSubtitle')}
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#1D4033] text-[#64D995] border border-[#244D3F]">
          {t('manualSourceBadge')}
        </span>
      </div>

      {successToast && (
        <div className="p-4 bg-[#64D995]/15 border border-[#64D995]/40 rounded-2xl text-xs sm:text-sm font-extrabold text-[#64D995] flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-[#64D995] flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-[#E45B5B]/15 border border-[#E45B5B]/40 rounded-2xl text-xs sm:text-sm font-bold text-[#E45B5B] flex items-center gap-2 animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Farm & Field & Sensor Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
              1. {t('selectFarm')} <span className="text-[#E45B5B]">*</span>
            </label>
            <select
              value={farmId}
              onChange={(e) => {
                const nextFarmId = e.target.value;
                const firstField = fields.find((field) => field.farmId === nextFarmId);
                const nextSensors = sensors.filter((sensor) => sensor.farmId === nextFarmId && sensor.fieldId === firstField?.id);
                setFarmId(nextFarmId);
                setFieldId(firstField?.id || '');
                setSensorId(nextSensors[0]?.id || '');
              }}
              required
              className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-xs sm:text-sm font-semibold bg-[#10251F] text-[#F4F8F5] focus:outline-none focus:ring-2 focus:ring-[#64D995] cursor-pointer"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id} className="bg-[#10251F] text-[#F4F8F5]">
                  🌱 {f.name || f.farmName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
              2. {t('selectField')} <span className="text-[#E45B5B]">*</span>
            </label>
            <select
              value={fieldId}
              onChange={(e) => {
                setFieldId(e.target.value);
                const nextFieldId = e.target.value;
                const matchingSensors = sensors.filter((s) => s.fieldId === nextFieldId && s.farmId === farmId);
                setSensorId(matchingSensors[0]?.id || '');
              }}
              required
              className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-xs sm:text-sm font-semibold bg-[#10251F] text-[#F4F8F5] focus:outline-none focus:ring-2 focus:ring-[#64D995] cursor-pointer"
            >
              {availableFields.length === 0 ? (
                <option value="" className="bg-[#10251F] text-[#F4F8F5]">No fields in this farm</option>
              ) : (
                availableFields.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#10251F] text-[#F4F8F5]">
                    🌾 {f.name || f.fieldName} ({f.cropType})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
              3. {t('selectSensor')} <span className="text-[#E45B5B]">*</span>
            </label>
            <select
              value={sensorId}
              onChange={(e) => setSensorId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-xs sm:text-sm font-semibold bg-[#10251F] text-[#F4F8F5] focus:outline-none focus:ring-2 focus:ring-[#64D995] cursor-pointer"
            >
              {availableSensors.length === 0 ? (
                <option value="" className="bg-[#10251F] text-[#F4F8F5]">No sensor registered for this field</option>
              ) : (
                availableSensors.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#10251F] text-[#F4F8F5]">
                    📡 {s.sensorCode || s.sensorName || s.sensorId} ({s.status})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Large Numerical Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Soil Moisture */}
          <div className="bg-[#10251F] p-4 rounded-3xl border border-[#244D3F] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#F4F8F5] flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-[#64D995]" />
                <span>{t('soilMoisturePercent')}</span>
              </span>
              <span className="text-xs font-bold text-[#A9BDB1]">0 - 100%</span>
            </div>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={moisture}
              onChange={(e) => setMoisture(e.target.value)}
              required
              className="w-full text-center text-3xl sm:text-4xl font-black text-[#64D995] py-2.5 px-3 rounded-2xl border-2 border-[#244D3F] bg-[#0B1713]/80 focus:outline-none focus:border-[#64D995]"
            />
          </div>

          {/* Temperature */}
          <div className="bg-[#10251F] p-4 rounded-3xl border border-[#244D3F] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#F4B740] flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-[#F4B740]" />
                <span>{t('temperatureDegree')}</span>
              </span>
              <span className="text-xs font-bold text-[#A9BDB1]">-10 to 60°C</span>
            </div>
            <input
              type="number"
              min="-10"
              max="60"
              step="0.5"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              required
              className="w-full text-center text-3xl sm:text-4xl font-black text-[#F4B740] py-2.5 px-3 rounded-2xl border-2 border-[#244D3F] bg-[#0B1713]/80 focus:outline-none focus:border-[#F4B740]"
            />
          </div>

          {/* Humidity */}
          <div className="bg-[#10251F] p-4 rounded-3xl border border-[#244D3F] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-sky-400 flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-sky-400" />
                <span>{t('humidityPercent')}</span>
              </span>
              <span className="text-xs font-bold text-[#A9BDB1]">0 - 100%</span>
            </div>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={humidity}
              onChange={(e) => setHumidity(e.target.value)}
              required
              className="w-full text-center text-3xl sm:text-4xl font-black text-sky-400 py-2.5 px-3 rounded-2xl border-2 border-[#244D3F] bg-[#0B1713]/80 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Rainfall */}
          <div className="bg-[#10251F] p-4 rounded-3xl border border-[#244D3F] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-indigo-400 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-indigo-400" />
                <span>{t('rainfallMm')}</span>
              </span>
              <span className="text-xs font-bold text-[#A9BDB1]">mm gauge</span>
            </div>
            <input
              type="number"
              min="0"
              max="500"
              step="0.5"
              value={rainfall}
              onChange={(e) => setRainfall(e.target.value)}
              required
              className="w-full text-center text-3xl sm:text-4xl font-black text-indigo-400 py-2.5 px-3 rounded-2xl border-2 border-[#244D3F] bg-[#0B1713]/80 focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Irrigation status, date, and time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Irrigation status ON / OFF */}
          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
              {t('irrigationStatus')}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIrrigationStatus('ON')}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black border transition-all cursor-pointer ${
                  irrigationStatus === 'ON'
                    ? 'bg-[#2E8B57] text-white border-[#64D995]/50 shadow-md shadow-[#2E8B57]/30'
                    : 'bg-[#10251F] border-[#244D3F] text-[#A9BDB1] hover:bg-[#1D4033]'
                }`}
              >
                ON (Running)
              </button>
              <button
                type="button"
                onClick={() => setIrrigationStatus('OFF')}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black border transition-all cursor-pointer ${
                  irrigationStatus === 'OFF'
                    ? 'bg-[#10251F] text-[#F4F8F5] border-[#244D3F] shadow-sm'
                    : 'bg-[#10251F] border-[#244D3F] text-[#A9BDB1] hover:bg-[#1D4033]'
                }`}
              >
                OFF (Stopped)
              </button>
            </div>
          </div>

          {/* Reading Date */}
          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
              {t('readingDate')}
            </label>
            <div className="relative">
              <input
                type="date"
                value={readingDate}
                onChange={(e) => setReadingDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5]"
              />
              <Calendar className="w-4 h-4 text-[#A9BDB1] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Reading Time */}
          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
              {t('readingTime')}
            </label>
            <div className="relative">
              <input
                type="time"
                value={readingTime}
                onChange={(e) => setReadingTime(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5]"
              />
              <Clock className="w-4 h-4 text-[#A9BDB1] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Buttons: Submit, Clear, Cancel */}
        <div className="pt-4 border-t border-[#244D3F] flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !sensorId}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-black text-sm sm:text-base shadow-lg shadow-[#2E8B57]/30 active:scale-95 transition-transform flex items-center justify-center gap-2 min-h-[52px] cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-[#F4B740]" />
            <span>{isSubmitting ? 'Saving…' : t('submitReading')}</span>
          </button>

          <button
            type="button"
            onClick={handleClearForm}
            className="py-3.5 px-5 rounded-2xl bg-[#10251F] hover:bg-[#1D4033] border border-[#244D3F] text-[#F4F8F5] font-bold text-sm flex items-center gap-2 min-h-[52px] cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-[#64D995]" />
            <span>{t('clearForm')}</span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="py-3.5 px-5 rounded-2xl bg-[#10251F] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] font-bold text-sm min-h-[52px] cursor-pointer transition-colors"
            >
              {t('cancel')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
