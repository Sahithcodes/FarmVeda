import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Farm, Field, Sensor, SensorReading } from '../../types';
import { X, Radio, Droplets, Thermometer, Waves, CloudRain, CheckCircle2 } from 'lucide-react';

interface SensorManualInputModalProps {
  farms: Farm[];
  fields: Field[];
  sensors: Sensor[];
  selectedFarmId: string;
  selectedFieldId?: string;
  onSubmit: (reading: Omit<SensorReading, 'id'>) => void;
  onClose: () => void;
}

export const SensorManualInputModal: React.FC<SensorManualInputModalProps> = ({
  farms,
  fields,
  sensors,
  selectedFarmId,
  selectedFieldId,
  onSubmit,
  onClose,
}) => {
  const { t } = useLanguage();

  const [farmId, setFarmId] = useState(selectedFarmId || farms[0]?.id || '');
  const [fieldId, setFieldId] = useState(selectedFieldId || fields[0]?.id || '');
  const [sensorId, setSensorId] = useState(sensors[0]?.id || 'manual-node');
  const [moisture, setMoisture] = useState<number>(65);
  const [temperature, setTemperature] = useState<number>(28);
  const [humidity, setHumidity] = useState<number>(70);
  const [rainfall, setRainfall] = useState<number>(0);
  const [irrigationActive, setIrrigationActive] = useState<boolean>(false);

  const availableFields = fields.filter((f) => f.farmId === farmId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newReading: Omit<SensorReading, 'id'> = {
      sensorId,
      farmId,
      fieldId: fieldId || availableFields[0]?.id || 'field-01',
      timestamp: new Date().toISOString(),
      moisturePercent: Number(moisture),
      temperatureC: Number(temperature),
      humidityPercent: Number(humidity),
      rainfallMm: Number(rainfall),
      irrigationActive,
      isSimulated: false,
    };

    onSubmit(newReading);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10251F] rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-[#244D3F] max-h-[90vh] overflow-y-auto text-[#F4F8F5] animate-scale-in">
        <div className="flex items-center justify-between pb-3 border-b border-[#244D3F]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2E8B57] to-[#1F6B41] flex items-center justify-center text-white border border-[#64D995]/40 shadow-md">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#F4F8F5]">
                {t('manualReadingTitle')}
              </h3>
              <p className="text-xs text-[#A9BDB1] font-medium">
                {t('manualReadingNotice')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#A9BDB1] hover:text-[#F4F8F5] hover:bg-[#17332A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('selectFarm')}
              </label>
              <select
                value={farmId}
                onChange={(e) => {
                  setFarmId(e.target.value);
                  const firstField = fields.find((f) => f.farmId === e.target.value);
                  if (firstField) setFieldId(firstField.id);
                }}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#244D3F] text-sm font-semibold bg-[#10251F] text-[#F4F8F5] focus:outline-none focus:ring-2 focus:ring-[#64D995] cursor-pointer"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#10251F] text-[#F4F8F5]">
                    🌱 {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('selectField')}
              </label>
              <select
                value={fieldId}
                onChange={(e) => setFieldId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#244D3F] text-sm font-semibold bg-[#10251F] text-[#F4F8F5] focus:outline-none focus:ring-2 focus:ring-[#64D995] cursor-pointer"
              >
                {availableFields.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#10251F] text-[#F4F8F5]">
                    🌾 {f.name} ({f.cropType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
              {t('sensorCode')}
            </label>
            <select
              value={sensorId}
              onChange={(e) => setSensorId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#244D3F] text-sm font-semibold bg-[#10251F] text-[#F4F8F5] focus:outline-none focus:ring-2 focus:ring-[#64D995] cursor-pointer"
            >
              {sensors.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#10251F] text-[#F4F8F5]">
                  📡 {s.sensorCode} ({s.status})
                </option>
              ))}
              <option value="manual-meter" className="bg-[#10251F] text-[#F4F8F5]">Manual Soil Moisture Meter / Probe</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-[#64D995]" />
                <span>{t('metricSoilMoisture')} (%)</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={moisture}
                onChange={(e) => setMoisture(Number(e.target.value))}
                required
                className="w-full px-4 py-2.5 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#64D995] font-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-[#F4B740]" />
                <span>{t('metricTemperature')} (°C)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="60"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                required
                className="w-full px-4 py-2.5 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4B740] font-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1 flex items-center gap-1">
                <Waves className="w-3.5 h-3.5 text-sky-400" />
                <span>{t('metricHumidity')} (%)</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                required
                className="w-full px-4 py-2.5 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-sky-400 font-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1 flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rainfall (mm)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="250"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                required
                className="w-full px-4 py-2.5 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-indigo-400 font-black"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={irrigationActive}
                onChange={(e) => setIrrigationActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#2E8B57] focus:ring-[#64D995] border-[#244D3F] bg-[#0B1713]"
              />
              <span className="text-xs font-bold text-[#A9BDB1]">
                Pump / Irrigation is currently active during this reading
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-sm shadow-lg shadow-[#2E8B57]/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#F4B740]" />
              <span>{t('submitReading')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] font-semibold text-sm cursor-pointer transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
