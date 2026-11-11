import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Field, CropType, SoilType, Sensor } from '../../types';
import { X, Layers, Calendar, Radio } from 'lucide-react';

interface FieldModalProps {
  field?: Field | null;
  farmId: string;
  sensors: Sensor[];
  onSave: (field: Field) => void;
  onClose: () => void;
}

export const FieldModal: React.FC<FieldModalProps> = ({
  field,
  farmId,
  sensors,
  onSave,
  onClose,
}) => {
  const { t } = useLanguage();

  const [name, setName] = useState(field?.name || '');
  const [cropType, setCropType] = useState<CropType>(field?.cropType || 'Rice');
  const [soilType, setSoilType] = useState<SoilType>(field?.soilType || 'Loamy');
  const [areaAcres, setAreaAcres] = useState<number>(field?.areaAcres || 2.5);
  const [sowingDate, setSowingDate] = useState(
    field?.sowingDate || new Date().toISOString().split('T')[0]
  );
  const [sensorId, setSensorId] = useState<string>(field?.sensorId || '');

  const crops: { id: CropType; key: any; emoji: string }[] = [
    { id: 'Rice', key: 'cropRice', emoji: '🌾' },
    { id: 'Wheat', key: 'cropWheat', emoji: '🌿' },
    { id: 'Cotton', key: 'cropCotton', emoji: '☁️' },
    { id: 'Maize', key: 'cropMaize', emoji: '🌽' },
    { id: 'Sugarcane', key: 'cropSugarcane', emoji: '🎋' },
    { id: 'Groundnut', key: 'cropGroundnut', emoji: '🥜' },
    { id: 'Tomato', key: 'cropTomato', emoji: '🍅' },
    { id: 'Other', key: 'cropOther', emoji: '🌱' },
  ];

  const soils: { id: SoilType; key: any; desc: string }[] = [
    { id: 'Clay', key: 'soilClay', desc: 'High water retention' },
    { id: 'Loamy', key: 'soilLoamy', desc: 'Balanced fertility' },
    { id: 'Sandy', key: 'soilSandy', desc: 'Fast draining' },
    { id: 'Black Soil', key: 'soilBlack', desc: 'Deep moisture retention' },
    { id: 'Red Soil', key: 'soilRed', desc: 'Iron rich, permeable' },
    { id: 'Silt', key: 'soilSilt', desc: 'Fine nutrient texture' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: Field = {
      id: field?.id || `field-${Date.now()}`,
      farmId,
      name: name.trim(),
      cropType,
      soilType,
      areaAcres: Number(areaAcres) || 1,
      sowingDate,
      sensorId: sensorId || undefined,
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10251F] rounded-3xl w-full max-w-xl p-6 shadow-2xl border border-[#244D3F] max-h-[90vh] overflow-y-auto text-[#F4F8F5] animate-scale-in">
        <div className="flex items-center justify-between pb-3 border-b border-[#244D3F]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2E8B57] to-[#1F6B41] flex items-center justify-center text-white border border-[#64D995]/40 shadow-md">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#F4F8F5]">
                {field ? t('edit') : t('addNewField')}
              </h3>
              <p className="text-xs text-[#A9BDB1] font-medium">
                Demarcate field plot and crop variety
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
          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
              {t('fieldName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. North Paddy Block / Plot 3B"
              className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
            />
          </div>

          {/* Crop Selector Chips */}
          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-2">
              {t('cropType')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {crops.map((crop) => (
                <button
                  type="button"
                  key={crop.id}
                  onClick={() => setCropType(crop.id)}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all min-h-[48px] cursor-pointer ${
                    cropType === crop.id
                      ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] border-[#64D995] text-white shadow-md'
                      : 'bg-[#17332A] border-[#244D3F] text-[#A9BDB1] hover:bg-[#1D4033] hover:text-[#F4F8F5]'
                  }`}
                >
                  <span className="text-lg">{crop.emoji}</span>
                  <span className="truncate">{t(crop.key)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Soil Selector Chips */}
          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-2">
              {t('soilType')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {soils.map((soil) => (
                <button
                  type="button"
                  key={soil.id}
                  onClick={() => setSoilType(soil.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all min-h-[48px] cursor-pointer ${
                    soilType === soil.id
                      ? 'bg-[#1D4033] border-[#64D995] text-[#F4F8F5] shadow-md ring-1 ring-[#64D995]/30'
                      : 'bg-[#17332A] border-[#244D3F] text-[#A9BDB1] hover:bg-[#1D4033] hover:text-[#F4F8F5]'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight truncate">
                    {t(soil.key)}
                  </div>
                  <div className={`text-[10px] mt-0.5 truncate ${soilType === soil.id ? 'text-[#64D995]' : 'text-[#A9BDB1]/70'}`}>
                    {soil.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Area & Sowing Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('totalArea')} ({t('acres')})
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={areaAcres}
                onChange={(e) => setAreaAcres(parseFloat(e.target.value))}
                required
                className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                Sowing Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5]"
                />
                <Calendar className="w-4 h-4 text-[#A9BDB1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Link Sensor */}
          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
              {t('sensorId')}
            </label>
            <div className="relative">
              <select
                value={sensorId}
                onChange={(e) => setSensorId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] cursor-pointer"
              >
                <option value="" className="bg-[#10251F] text-[#F4F8F5]">No sensor assigned (Manual readings)</option>
                {sensors.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#10251F] text-[#F4F8F5]">
                    📡 {s.sensorCode} ({s.status} • {s.batteryLevel}% battery)
                  </option>
                ))}
              </select>
              <Radio className="w-4 h-4 text-[#A9BDB1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-sm shadow-lg shadow-[#2E8B57]/30 active:scale-95 transition-all cursor-pointer"
            >
              {t('save')}
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
