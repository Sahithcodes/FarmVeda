import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Farm, Field, Sensor, SensorType, SensorStatus } from '../../types';
import { X, Radio, MapPin, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface SensorRegistrationModalProps {
  sensor?: Sensor | null;
  farms: Farm[];
  fields: Field[];
  defaultFarmId: string;
  defaultFieldId?: string;
  onSave: (sensor: Sensor) => void;
  onClose: () => void;
}

export const SensorRegistrationModal: React.FC<SensorRegistrationModalProps> = ({
  sensor,
  farms,
  fields,
  defaultFarmId,
  defaultFieldId,
  onSave,
  onClose,
}) => {
  const { t } = useLanguage();

  const [sensorId, setSensorId] = useState(
    sensor?.sensorCode || sensor?.sensorId || `SN-${Date.now().toString().slice(-4)}`
  );
  const [sensorName, setSensorName] = useState(
    sensor?.sensorName || sensor?.sensorCode || 'Soil & Climate Node'
  );
  const [farmId, setFarmId] = useState(
    sensor?.farmId || defaultFarmId || farms[0]?.id || ''
  );
  const availableFields = fields.filter((f) => f.farmId === farmId);
  const [fieldId, setFieldId] = useState(
    sensor?.fieldId || defaultFieldId || availableFields[0]?.id || ''
  );
  const [sensorType, setSensorType] = useState<SensorType>(
    sensor?.sensorType || 'Soil Moisture Sensor'
  );
  const [installationDate, setInstallationDate] = useState(
    sensor?.installationDate || sensor?.installedDate || new Date().toISOString().split('T')[0]
  );
  const [installationLocation, setInstallationLocation] = useState(
    sensor?.installationLocation || 'Center plot root zone, 15cm depth'
  );
  const [status, setStatus] = useState<SensorStatus>(
    sensor?.status || 'active'
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sensorTypes: { id: SensorType; key: any }[] = [
    { id: 'Soil Moisture Sensor', key: 'sensorSoilMoisture' },
    { id: 'Temperature Sensor', key: 'sensorTemperature' },
    { id: 'Humidity Sensor', key: 'sensorHumidity' },
    { id: 'Rainfall Sensor', key: 'sensorRainfall' },
    { id: 'Multi-Parameter Sensor', key: 'sensorMultiParameter' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!sensorId.trim() || !sensorName.trim() || !farmId || !fieldId) {
      setErrorMessage(t('validationError'));
      return;
    }

    const savedSensor: Sensor = {
      id: sensor?.id || `sensor-${Date.now()}`,
      sensorCode: sensorId.trim(),
      sensorId: sensorId.trim(),
      sensorName: sensorName.trim(),
      farmId,
      fieldId,
      sensorType,
      type: sensorType,
      installedDate: installationDate,
      installationDate,
      installationLocation: installationLocation.trim(),
      status,
      batteryLevel: sensor?.batteryLevel ?? 95,
      lastUpdated: new Date().toISOString(),
    };

    onSave(savedSensor);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#10251F] rounded-3xl w-full max-w-lg shadow-2xl border border-[#244D3F] flex flex-col overflow-hidden animate-scale-in text-[#F4F8F5]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1713] via-[#10251F] to-[#0B1713] p-5 text-white flex items-center justify-between border-b border-[#244D3F]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2E8B57] to-[#1F6B41] flex items-center justify-center text-white border border-[#64D995]/40 shadow-md">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg text-[#F4F8F5]">
                {sensor ? t('edit') : t('sensorRegistrationTitle')}
              </h3>
              <p className="text-xs text-[#A9BDB1] font-medium">
                {t('sensorRegistrationSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#A9BDB1] hover:text-[#F4F8F5] hover:bg-[#17332A] cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {errorMessage && (
            <div className="p-3.5 bg-[#E45B5B]/15 border border-[#E45B5B]/40 rounded-2xl text-xs font-bold text-[#E45B5B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('sensorId')} <span className="text-[#E45B5B]">*</span>
              </label>
              <input
                type="text"
                value={sensorId}
                onChange={(e) => setSensorId(e.target.value)}
                required
                placeholder="e.g. SN-NORTH-01"
                className="w-full px-4 py-2.5 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('sensorName')} <span className="text-[#E45B5B]">*</span>
              </label>
              <input
                type="text"
                value={sensorName}
                onChange={(e) => setSensorName(e.target.value)}
                required
                placeholder="e.g. North Soil Probe"
                className="w-full px-4 py-2.5 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('selectFarm')} <span className="text-[#E45B5B]">*</span>
              </label>
              <select
                value={farmId}
                onChange={(e) => {
                  setFarmId(e.target.value);
                  const matchingFields = fields.filter((f) => f.farmId === e.target.value);
                  setFieldId(matchingFields[0]?.id || '');
                }}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#244D3F] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#10251F] text-[#F4F8F5] cursor-pointer"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#10251F] text-[#F4F8F5]">
                    🌱 {f.name || f.farmName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('selectField')} <span className="text-[#E45B5B]">*</span>
              </label>
              <select
                value={fieldId}
                onChange={(e) => setFieldId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#244D3F] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#10251F] text-[#F4F8F5] cursor-pointer"
              >
                {availableFields.length === 0 ? (
                  <option value="" className="bg-[#10251F] text-[#F4F8F5]">No fields available</option>
                ) : (
                  availableFields.map((f) => (
                    <option key={f.id} value={f.id} className="bg-[#10251F] text-[#F4F8F5]">
                      🌾 {f.name || f.fieldName} ({f.cropType})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
              {t('sensorType')}
            </label>
            <select
              value={sensorType}
              onChange={(e) => setSensorType(e.target.value as SensorType)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-[#244D3F] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#10251F] text-[#F4F8F5] cursor-pointer"
            >
              {sensorTypes.map((st) => (
                <option key={st.id} value={st.id} className="bg-[#10251F] text-[#F4F8F5]">
                  {t(st.key)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('installationDate')}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={installationDate}
                  onChange={(e) => setInstallationDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#244D3F] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5]"
                />
                <Calendar className="w-4 h-4 text-[#A9BDB1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('monitoringStatus')}
              </label>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    status === 'active' || status === 'online'
                      ? 'bg-[#2E8B57] text-white border-[#64D995]/50 shadow-md'
                      : 'bg-[#10251F] border-[#244D3F] text-[#A9BDB1]'
                  }`}
                >
                  {t('statusActive')}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('inactive')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    status === 'inactive' || status === 'offline'
                      ? 'bg-[#E45B5B] text-white border-[#E45B5B] shadow-md'
                      : 'bg-[#10251F] border-[#244D3F] text-[#A9BDB1]'
                  }`}
                >
                  {t('statusInactive')}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
              {t('installationLocation')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={installationLocation}
                onChange={(e) => setInstallationLocation(e.target.value)}
                placeholder="e.g. Center row 4, 15cm soil depth"
                className="w-full px-4 py-2.5 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
              />
              <MapPin className="w-4 h-4 text-[#A9BDB1] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-sm shadow-lg shadow-[#2E8B57]/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#F4B740]" />
              <span>{t('save')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] font-bold text-sm cursor-pointer transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
