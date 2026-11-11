import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Farm, Field, Sensor, SensorReading } from '../../types';
import {
  X,
  Sprout,
  Layers,
  Radio,
  Droplets,
  Calendar,
  MapPin,
  User,
  Phone,
  Ruler,
  CheckCircle2,
  Clock,
  Plus,
  Pencil,
} from 'lucide-react';

interface FarmDetailModalProps {
  farm: Farm;
  fields: Field[];
  sensors: Sensor[];
  latestReading?: SensorReading;
  onClose: () => void;
  onEditFarm: () => void;
  onAddField: () => void;
}

export const FarmDetailModal: React.FC<FarmDetailModalProps> = ({
  farm,
  fields,
  sensors,
  latestReading,
  onClose,
  onEditFarm,
  onAddField,
}) => {
  const { t } = useLanguage();

  const farmFields = fields.filter((f) => f.farmId === farm.id);
  const farmSensors = sensors.filter((s) => s.farmId === farm.id);
  const activeSensorsCount = farmSensors.filter((s) => s.status === 'online' || s.status === 'active').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#10251F] rounded-3xl w-full max-w-4xl h-[92vh] max-h-[820px] shadow-2xl border border-[#244D3F] flex flex-col overflow-hidden animate-scale-in text-[#F4F8F5]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1713] via-[#10251F] to-[#0B1713] p-5 sm:p-6 text-white flex items-center justify-between flex-shrink-0 border-b border-[#244D3F]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2E8B57] to-[#1F6B41] flex items-center justify-center shadow-lg shadow-[#2E8B57]/30 border border-[#64D995]/40">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl text-[#F4F8F5] tracking-tight">
                  {farm.name || farm.farmName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F4B740] text-[#0B1713]">
                  {farm.totalArea} {farm.areaUnit || 'Acres'}
                </span>
              </div>
              <p className="text-xs text-[#A9BDB1] font-medium mt-0.5">
                {farm.location} {farm.village ? `• ${farm.village}` : ''} {farm.district ? `• ${farm.district}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEditFarm}
              className="p-2.5 rounded-xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#64D995] hover:text-[#F4F8F5] transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">{t('edit')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#A9BDB1] hover:text-[#F4F8F5] hover:bg-[#17332A] transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#17332A] p-4 rounded-2xl border border-[#244D3F] shadow-sm">
              <span className="text-[11px] font-bold text-[#A9BDB1] uppercase tracking-wider block">
                {t('fieldCount')}
              </span>
              <span className="text-2xl font-black text-[#F4F8F5] mt-1 block">
                {farmFields.length}
              </span>
            </div>

            <div className="bg-[#17332A] p-4 rounded-2xl border border-[#244D3F] shadow-sm">
              <span className="text-[11px] font-bold text-[#A9BDB1] uppercase tracking-wider block">
                {t('sensorCount')}
              </span>
              <span className="text-2xl font-black text-[#F4F8F5] mt-1 block">
                {farmSensors.length} ({activeSensorsCount} {t('statusActive')})
              </span>
            </div>

            <div className="bg-[#17332A] p-4 rounded-2xl border border-[#244D3F] shadow-sm">
              <span className="text-[11px] font-bold text-[#A9BDB1] uppercase tracking-wider block">
                {t('metricSoilMoisture')}
              </span>
              <span className="text-2xl font-black text-[#64D995] mt-1 block">
                {latestReading?.moisturePercent || 68}%
              </span>
            </div>

            <div className="bg-[#17332A] p-4 rounded-2xl border border-[#244D3F] shadow-sm">
              <span className="text-[11px] font-bold text-[#A9BDB1] uppercase tracking-wider block">
                {t('monitoringStatus')}
              </span>
              <span className="text-sm font-extrabold text-[#64D995] mt-2 block flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#64D995]" />
                <span>Operational</span>
              </span>
            </div>
          </div>

          {/* Farm Information Details */}
          <div className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F]">
            <h4 className="font-extrabold text-sm text-[#F4F8F5] uppercase tracking-wider mb-3">
              Farm Information & Ownership
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[#A9BDB1] font-semibold block">{t('farmerName')}</span>
                <span className="font-extrabold text-[#F4F8F5] text-sm mt-0.5 block">
                  {farm.ownerName || farm.farmerName}
                </span>
              </div>
              <div>
                <span className="text-[#A9BDB1] font-semibold block">{t('contactNumber')}</span>
                <span className="font-extrabold text-[#F4F8F5] text-sm mt-0.5 block">
                  {farm.contactNumber || 'Not provided'}
                </span>
              </div>
              <div>
                <span className="text-[#A9BDB1] font-semibold block">{t('totalFarmArea')}</span>
                <span className="font-extrabold text-[#F4F8F5] text-sm mt-0.5 block">
                  {farm.totalArea} {farm.areaUnit || 'Acres'}
                </span>
              </div>
              <div>
                <span className="text-[#A9BDB1] font-semibold block">{t('village')}</span>
                <span className="font-extrabold text-[#F4F8F5] block mt-0.5">
                  {farm.village || farm.location}
                </span>
              </div>
              <div>
                <span className="text-[#A9BDB1] font-semibold block">{t('district')}</span>
                <span className="font-extrabold text-[#F4F8F5] block mt-0.5">
                  {farm.district || 'Mandya'}
                </span>
              </div>
              <div>
                <span className="text-[#A9BDB1] font-semibold block">{t('state')}</span>
                <span className="font-extrabold text-[#F4F8F5] block mt-0.5">
                  {farm.state || 'Karnataka'}
                </span>
              </div>
            </div>
          </div>

          {/* Registered Fields Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-base text-[#F4F8F5] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#64D995]" />
                <span>{t('fieldsInFarm')} ({farmFields.length})</span>
              </h4>

              <button
                onClick={onAddField}
                className="text-xs font-bold text-[#64D995] hover:text-[#F4F8F5] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addNewField')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {farmFields.map((field) => {
                const fieldSensors = farmSensors.filter(
                  (s) => s.fieldId === field.id || s.id === field.sensorId
                );

                return (
                  <div
                    key={field.id}
                    className="bg-[#17332A] rounded-2xl p-4 border border-[#244D3F] shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-extrabold text-sm text-[#F4F8F5]">
                          {field.name || field.fieldName}
                        </h5>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#10251F] border border-[#244D3F] text-[#64D995]">
                            🌾 {field.cropType}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#10251F] border border-[#244D3F] text-[#F4B740]">
                            {field.soilType}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-black text-[#64D995]">
                        {field.areaAcres ?? field.fieldArea ?? 1} {farm.areaUnit || 'Acres'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-[#244D3F]/70 text-[#A9BDB1]">
                      <div>
                        <span className="text-[#A9BDB1] block">{t('irrigationType')}:</span>
                        <span className="font-bold text-[#F4F8F5]">{field.irrigationType || 'Drip'}</span>
                      </div>
                      <div>
                        <span className="text-[#A9BDB1] block">{t('sensorCount')}:</span>
                        <span className="font-bold text-[#64D995]">{fieldSensors.length} Nodes</span>
                      </div>
                    </div>

                    {field.description && (
                      <p className="text-[11px] text-[#A9BDB1] italic">
                        "{field.description}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Associated Sensors in this Farm */}
          <div>
            <h4 className="font-black text-base text-[#F4F8F5] flex items-center gap-2 mb-3">
              <Radio className="w-5 h-5 text-[#64D995]" />
              <span>Registered Sensor Nodes ({farmSensors.length})</span>
            </h4>

            {farmSensors.length === 0 ? (
              <p className="text-xs text-[#A9BDB1] italic">No sensors registered for this farm yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {farmSensors.map((s) => {
                  const assignedField = farmFields.find((f) => f.id === s.fieldId);
                  const isOnline = s.status === 'online' || s.status === 'active';

                  return (
                    <div
                      key={s.id}
                      className="bg-[#17332A] rounded-2xl p-4 border border-[#244D3F] shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#F4F8F5]">
                            {s.sensorCode || s.sensorName || s.sensorId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isOnline
                                ? 'bg-[#1D4033] text-[#64D995] border-[#244D3F]'
                                : 'bg-[#E45B5B]/15 text-[#E45B5B] border-[#E45B5B]/30'
                            }`}
                          >
                            {isOnline ? t('statusActive') : t('statusInactive')}
                          </span>
                        </div>
                        <p className="text-xs text-[#A9BDB1] mt-0.5 font-medium">
                          {s.sensorType || 'Soil Moisture Sensor'} • Field: {assignedField?.name || 'Unassigned'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-[#64D995]">
                          {s.batteryLevel}% bat
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0B1713] border-t border-[#244D3F] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
