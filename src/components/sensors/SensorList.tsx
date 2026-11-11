import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Farm, Field, Sensor, SensorReading } from '../../types';
import { SensorRegistrationModal } from './SensorRegistrationModal';
import { SensorDataInputForm } from './SensorDataInputForm';
import {
  Radio,
  Plus,
  Battery,
  BatteryWarning,
  Clock,
  Droplets,
  Thermometer,
  Waves,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Pencil,
  Trash2,
  Power,
  ToggleLeft,
  ToggleRight,
  Eye,
  MapPin,
  Calendar,
  X,
} from 'lucide-react';

interface SensorListProps {
  sensors: Sensor[];
  farms: Farm[];
  fields: Field[];
  latestReading?: SensorReading;
  selectedFarmId: string;
  selectedFieldId?: string;
  onAddSensor: (sensor: Sensor) => void;
  onUpdateSensor: (sensor: Sensor) => void;
  onDeleteSensor: (id: string) => void;
  onToggleSensorStatus: (id: string) => void;
  onAddManualReading: (reading: Omit<SensorReading, 'id'>) => void;
  onSimulatePulse: () => void;
}

export const SensorList: React.FC<SensorListProps> = ({
  sensors,
  farms,
  fields,
  latestReading,
  selectedFarmId,
  selectedFieldId,
  onAddSensor,
  onUpdateSensor,
  onDeleteSensor,
  onToggleSensorStatus,
  onAddManualReading,
  onSimulatePulse,
}) => {
  const { t, language } = useLanguage();

  const [activeTabSection, setActiveTabSection] = useState<'sensors' | 'input'>('sensors');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [detailModalSensor, setDetailModalSensor] = useState<Sensor | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);

  const handlePulse = async () => {
    setIsPulsing(true);
    await onSimulatePulse();
    setTimeout(() => setIsPulsing(false), 800);
  };

  const onlineCount = sensors.filter(
    (s) => s.status === 'online' || s.status === 'active'
  ).length;
  const warningCount = sensors.filter((s) => s.status === 'warning').length;
  const offlineCount = sensors.filter(
    (s) => s.status === 'offline' || s.status === 'inactive'
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Title & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#F4F8F5] flex items-center gap-2">
            <Radio className="w-6 h-6 text-[#64D995]" />
            <span>{t('sensorsTitle')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#A9BDB1] font-medium mt-0.5">
            {t('sensorsSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Simulated Telemetry Ping button */}
          <button
            onClick={handlePulse}
            disabled={isPulsing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#17332A] hover:bg-[#1D4033] text-[#F4F8F5] border border-[#244D3F] font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Simulate IoT Hardware Data Stream"
          >
            <RefreshCw className={`w-4 h-4 text-[#64D995] ${isPulsing ? 'animate-spin' : ''}`} />
            <span>{isPulsing ? 'Receiving...' : 'Simulate Ping'}</span>
          </button>

          {/* + Register New Sensor Button */}
          <button
            onClick={() => {
              setEditingSensor(null);
              setRegisterModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-[#2E8B57]/30 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F4B740]" />
            <span>{t('registerNewSensor')}</span>
          </button>
        </div>
      </div>

      {/* Two Distinct Section Tabs: A. Sensor Nodes | B. Enter Sensor Readings */}
      <div className="flex items-center bg-[#10251F] p-1.5 rounded-2xl border border-[#244D3F] shadow-sm max-w-md">
        <button
          onClick={() => setActiveTabSection('sensors')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all min-h-[44px] cursor-pointer ${
            activeTabSection === 'sensors'
              ? 'bg-[#2E8B57] text-white shadow-md'
              : 'text-[#A9BDB1] hover:text-[#F4F8F5]'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>A. {t('sensorsTitle')} ({sensors.length})</span>
        </button>

        <button
          onClick={() => setActiveTabSection('input')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all min-h-[44px] cursor-pointer ${
            activeTabSection === 'input'
              ? 'bg-[#2E8B57] text-white shadow-md'
              : 'text-[#A9BDB1] hover:text-[#F4F8F5]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>B. {t('enterSensorReadings')}</span>
        </button>
      </div>

      {/* SECTION B: ENTER SENSOR READINGS FORM */}
      {activeTabSection === 'input' && (
        <div className="animate-fade-in">
          <SensorDataInputForm
            farms={farms}
            fields={fields}
            sensors={sensors}
            defaultFarmId={selectedFarmId}
            defaultFieldId={selectedFieldId}
            onSubmit={(reading) => {
              onAddManualReading(reading);
            }}
            onCancel={() => setActiveTabSection('sensors')}
          />
        </div>
      )}

      {/* SECTION A: SENSOR MANAGEMENT & LIST */}
      {activeTabSection === 'sensors' && (
        <div className="space-y-6 animate-fade-in">
          {/* Health Summary Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#17332A] rounded-2xl p-4 border border-[#244D3F] shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10251F] text-[#64D995] border border-[#244D3F] flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#F4F8F5]">{onlineCount}</span>
                <p className="text-xs font-bold text-[#64D995]">{t('statusActive')}</p>
              </div>
            </div>

            <div className="bg-[#17332A] rounded-2xl p-4 border border-[#244D3F] shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10251F] text-[#F4B740] border border-[#244D3F] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#F4F8F5]">{warningCount}</span>
                <p className="text-xs font-bold text-[#F4B740]">{t('statusWarning')}</p>
              </div>
            </div>

            <div className="bg-[#17332A] rounded-2xl p-4 border border-[#244D3F] shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10251F] text-[#E45B5B] border border-[#244D3F] flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#F4F8F5]">{offlineCount}</span>
                <p className="text-xs font-bold text-[#E45B5B]">{t('statusInactive')}</p>
              </div>
            </div>
          </div>

          {/* Quick link to enter readings */}
          <div className="bg-gradient-to-r from-[#10251F] via-[#17332A] to-[#10251F] rounded-3xl p-5 text-white shadow-xl border border-[#244D3F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#10251F] border border-[#244D3F] flex items-center justify-center text-[#F4B740] flex-shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#F4F8F5]">
                  Have physical gauge or soil meter readings?
                </h4>
                <p className="text-xs text-[#A9BDB1]">
                  Record manual readings anytime into local storage to update dashboard analytics.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTabSection('input')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 flex-shrink-0 cursor-pointer"
            >
              {t('enterSensorReadings')}
            </button>
          </div>

          {/* Sensors Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sensors.length === 0 ? (
              <div className="col-span-2 bg-[#17332A] rounded-3xl p-8 text-center border-2 border-dashed border-[#244D3F] space-y-3 text-[#F4F8F5]">
                <Radio className="w-12 h-12 text-[#A9BDB1]/40 mx-auto" />
                <h3 className="font-black text-base text-[#F4F8F5]">
                  {t('noSensorsRegistered')}
                </h3>
                <button
                  onClick={() => {
                    setEditingSensor(null);
                    setRegisterModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] text-white font-bold text-xs cursor-pointer"
                >
                  {t('registerNewSensor')}
                </button>
              </div>
            ) : (
              sensors.map((sensor) => {
                const farm = farms.find((f) => f.id === sensor.farmId);
                const field = fields.find((f) => f.id === sensor.fieldId);

                const isOnline =
                  sensor.status === 'online' || sensor.status === 'active';
                const isWarning = sensor.status === 'warning';

                const sensorMoisture = !isOnline
                  ? 42
                  : latestReading?.moisturePercent || 68;
                const sensorTemp = !isOnline ? 26 : latestReading?.temperatureC || 29;
                const sensorHum = !isOnline ? 60 : latestReading?.humidityPercent || 72;

                return (
                  <div
                    key={sensor.id}
                    className={`bg-[#17332A] rounded-3xl p-5 sm:p-6 shadow-xl border transition-all ${
                      isOnline
                        ? 'border-[#244D3F] hover:border-[#64D995]/60'
                        : isWarning
                        ? 'border-[#F4B740]/60 bg-[#17332A]'
                        : 'border-[#E45B5B]/40 bg-[#17332A] opacity-85'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between pb-3.5 border-b border-[#244D3F]/70 gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                            isOnline
                              ? 'bg-[#10251F] border-[#244D3F] text-[#64D995]'
                              : isWarning
                              ? 'bg-[#10251F] border-[#F4B740]/30 text-[#F4B740]'
                              : 'bg-[#10251F] border-[#E45B5B]/30 text-[#E45B5B]'
                          }`}
                        >
                          <Radio className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-base text-[#F4F8F5]">
                              {sensor.sensorCode || sensor.sensorId}
                            </h4>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                isOnline
                                  ? 'bg-[#1D4033] border-[#244D3F] text-[#64D995]'
                                  : isWarning
                                  ? 'bg-[#F4B740]/15 border-[#F4B740]/30 text-[#F4B740]'
                                  : 'bg-[#E45B5B]/15 border-[#E45B5B]/30 text-[#E45B5B]'
                              }`}
                            >
                              {isOnline
                                ? t('statusActive')
                                : isWarning
                                ? t('statusWarning')
                                : t('statusInactive')}
                            </span>
                          </div>
                          <p className="text-xs text-[#A9BDB1] font-bold mt-0.5">
                            {sensor.sensorName || 'Sensor Node'} •{' '}
                            <span className="text-[#64D995]">
                              {sensor.sensorType || 'Soil Moisture Sensor'}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Battery and Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onToggleSensorStatus(sensor.id)}
                          className={`p-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                            isOnline
                              ? 'bg-[#10251F] border-[#244D3F] text-[#64D995] hover:bg-[#1D4033]'
                              : 'bg-[#10251F] border-[#E45B5B]/40 text-[#E45B5B] hover:bg-[#E45B5B]/20'
                          }`}
                          title={isOnline ? t('deactivate') : t('activate')}
                        >
                          {isOnline ? (
                            <ToggleRight className="w-5 h-5 text-[#64D995]" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-[#A9BDB1]" />
                          )}
                        </button>

                        <button
                          onClick={() => setDetailModalSensor(sensor)}
                          className="p-1.5 rounded-xl text-[#A9BDB1] hover:bg-[#10251F] hover:text-[#F4F8F5] transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingSensor(sensor);
                            setRegisterModalOpen(true);
                          }}
                          className="p-1.5 rounded-xl text-[#A9BDB1] hover:bg-[#10251F] hover:text-[#F4F8F5] transition-colors cursor-pointer"
                          title={t('edit')}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(t('confirmDeleteSensor'))) {
                              onDeleteSensor(sensor.id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-[#A9BDB1] hover:bg-[#E45B5B]/20 hover:text-[#E45B5B] transition-colors cursor-pointer"
                          title={t('delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Associated Field Tag */}
                    <div className="my-3 text-xs text-[#A9BDB1] font-semibold flex items-center justify-between">
                      <span>
                        Field:{' '}
                        <span className="font-extrabold text-[#F4F8F5]">
                          {field?.name || field?.fieldName || 'Unassigned Field'}
                        </span>{' '}
                        ({field?.cropType || 'Crop'})
                      </span>
                      <span className="font-bold text-[#A9BDB1]">
                        Farm: {farm?.name || farm?.farmName || 'Farm'}
                      </span>
                    </div>

                    {/* Telemetry Numbers */}
                    <div className="grid grid-cols-3 gap-2 my-3">
                      <div className="bg-[#10251F] p-2.5 rounded-2xl text-center border border-[#244D3F]/60">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#A9BDB1] mb-0.5">
                          <Droplets className="w-3 h-3 text-[#64D995]" />
                          <span>Moisture</span>
                        </div>
                        <span className="text-lg sm:text-xl font-black text-[#F4F8F5]">
                          {sensorMoisture}%
                        </span>
                      </div>

                      <div className="bg-[#10251F] p-2.5 rounded-2xl text-center border border-[#244D3F]/60">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#A9BDB1] mb-0.5">
                          <Thermometer className="w-3 h-3 text-[#F4B740]" />
                          <span>Temp</span>
                        </div>
                        <span className="text-lg sm:text-xl font-black text-[#F4F8F5]">
                          {sensorTemp}°C
                        </span>
                      </div>

                      <div className="bg-[#10251F] p-2.5 rounded-2xl text-center border border-[#244D3F]/60">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#A9BDB1] mb-0.5">
                          <Waves className="w-3 h-3 text-sky-400" />
                          <span>Humidity</span>
                        </div>
                        <span className="text-lg sm:text-xl font-black text-[#F4F8F5]">
                          {sensorHum}%
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-[11px] text-[#A9BDB1] font-semibold pt-2 border-t border-[#244D3F]/70">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#A9BDB1]" />
                        <span>
                          {!isOnline ? 'Offline' : 'Last updated: Just now (Local)'}
                        </span>
                      </span>
                      <span className="font-bold text-[#64D995]">
                        {sensor.batteryLevel}% battery
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Sensor Registration Modal */}
      {registerModalOpen && (
        <SensorRegistrationModal
          sensor={editingSensor}
          farms={farms}
          fields={fields}
          defaultFarmId={selectedFarmId}
          defaultFieldId={selectedFieldId}
          onSave={(sensorData) => {
            if (editingSensor) {
              onUpdateSensor(sensorData);
            } else {
              onAddSensor(sensorData);
            }
            setRegisterModalOpen(false);
          }}
          onClose={() => setRegisterModalOpen(false)}
        />
      )}

      {/* Sensor Details View Modal */}
      {detailModalSensor && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10251F] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#244D3F] space-y-4 animate-scale-in text-[#F4F8F5]">
            <div className="flex items-center justify-between border-b border-[#244D3F] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2E8B57] to-[#1F6B41] text-white flex items-center justify-center border border-[#64D995]/40 shadow-md">
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-base text-[#F4F8F5]">
                    {detailModalSensor.sensorCode || detailModalSensor.sensorId}
                  </h4>
                  <p className="text-xs text-[#A9BDB1] font-semibold">
                    {detailModalSensor.sensorName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalSensor(null)}
                className="p-1 rounded-full text-[#A9BDB1] hover:text-[#F4F8F5] hover:bg-[#17332A] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#F4F8F5]">
              <div className="flex justify-between py-1.5 border-b border-[#244D3F]/50">
                <span className="text-[#A9BDB1]">Sensor Type:</span>
                <span className="font-bold text-[#F4F8F5]">{detailModalSensor.sensorType || 'Soil Moisture Sensor'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#244D3F]/50">
                <span className="text-[#A9BDB1]">Associated Field:</span>
                <span className="font-bold text-[#64D995]">
                  {fields.find((f) => f.id === detailModalSensor.fieldId)?.name || 'Unassigned'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#244D3F]/50">
                <span className="text-[#A9BDB1]">Installation Date:</span>
                <span className="font-bold text-[#F4F8F5]">{detailModalSensor.installedDate || detailModalSensor.installationDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#244D3F]/50">
                <span className="text-[#A9BDB1]">Location / Depth:</span>
                <span className="font-bold text-[#F4F8F5]">{detailModalSensor.installationLocation || 'Root Zone, 15cm'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#244D3F]/50">
                <span className="text-[#A9BDB1]">Status:</span>
                <span className="font-bold text-[#64D995] uppercase">{detailModalSensor.status}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#A9BDB1]">Battery Level:</span>
                <span className="font-bold text-[#64D995]">{detailModalSensor.batteryLevel}%</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDetailModalSensor(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
