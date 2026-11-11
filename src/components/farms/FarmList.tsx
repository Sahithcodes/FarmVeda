import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Farm, Field, Sensor, CropType } from '../../types';
import { FarmRegistrationForm } from './FarmRegistrationForm';
import { FieldModal } from './FieldModal';
import { FarmDetailModal } from './FarmDetailModal';
import {
  Sprout,
  Plus,
  MapPin,
  User,
  Pencil,
  Trash2,
  Search,
  Layers,
  Radio,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Eye,
} from 'lucide-react';

interface FarmListProps {
  farms: Farm[];
  fields: Field[];
  sensors: Sensor[];
  selectedFarmId: string;
  onSelectFarm: (farmId: string) => void;
  onAddFarm: (farm: Farm, fields?: Field[]) => void;
  onUpdateFarm: (farm: Farm) => void;
  onDeleteFarm: (id: string) => void;
  onAddField: (field: Field) => void;
  onUpdateField: (field: Field) => void;
  onDeleteField: (id: string) => void;
}

export const FarmList: React.FC<FarmListProps> = ({
  farms,
  fields,
  sensors,
  selectedFarmId,
  onSelectFarm,
  onAddFarm,
  onUpdateFarm,
  onDeleteFarm,
  onAddField,
  onUpdateField,
  onDeleteField,
}) => {
  const { t, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  // Modals state
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [targetFarmForField, setTargetFarmForField] = useState<string>(selectedFarmId);
  const [detailModalFarm, setDetailModalFarm] = useState<Farm | null>(null);

  // Distinct locations for filter dropdown
  const distinctLocations = Array.from(
    new Set(farms.map((f) => f.village || f.district || f.location).filter(Boolean))
  );

  // Filter logic
  const filteredFarms = farms.filter((farm) => {
    const farmFields = fields.filter((f) => f.farmId === farm.id);

    // Search query
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (farm.name || farm.farmName || '').toLowerCase().includes(query) ||
      (farm.ownerName || farm.farmerName || '').toLowerCase().includes(query) ||
      (farm.location || '').toLowerCase().includes(query) ||
      (farm.village || '').toLowerCase().includes(query) ||
      (farm.district || '').toLowerCase().includes(query);

    // Location filter
    const matchesLocation =
      locationFilter === 'ALL' ||
      farm.village === locationFilter ||
      farm.district === locationFilter ||
      farm.location === locationFilter;

    // Crop filter
    const matchesCrop =
      cropFilter === 'ALL' ||
      farmFields.some((f) => f.cropType === cropFilter);

    return matchesSearch && matchesLocation && matchesCrop;
  });

  const handleOpenRegister = () => {
    setEditingFarm(null);
    setRegistrationModalOpen(true);
  };

  const handleOpenEdit = (farm: Farm, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFarm(farm);
    setRegistrationModalOpen(true);
  };

  const handleDeleteWithConfirm = (farm: Farm, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('confirmDeleteFarm'))) {
      onDeleteFarm(farm.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Main "+ Register New Farm" Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#F4F8F5] flex items-center gap-2">
            <Sprout className="w-6 h-6 text-[#64D995]" />
            <span>{t('farmsTitle')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#A9BDB1] font-medium mt-0.5">
            {t('farmsSubtitle')}
          </p>
        </div>

        {/* Prominent + Register New Farm button */}
        <button
          onClick={handleOpenRegister}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-black text-sm shadow-lg shadow-[#2E8B57]/30 active:scale-95 transition-all self-start sm:self-auto min-h-[48px] cursor-pointer"
        >
          <Plus className="w-5 h-5 text-[#F4B740]" />
          <span>{t('registerNewFarm')}</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[#17332A] rounded-3xl p-4 shadow-xl border border-[#244D3F] flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchFarmsPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#244D3F] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/60"
          />
          <Search className="w-4 h-4 text-[#A9BDB1] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          {/* Filter by Crop Type */}
          <div className="relative flex-1 sm:w-48">
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 rounded-2xl border border-[#244D3F] text-xs font-bold text-[#F4F8F5] bg-[#10251F] focus:outline-none focus:ring-2 focus:ring-[#64D995] cursor-pointer"
            >
              <option value="ALL">{t('allCrops')}</option>
              <option value="Rice">🌾 {t('cropRice')}</option>
              <option value="Wheat">🌿 {t('cropWheat')}</option>
              <option value="Cotton">☁️ {t('cropCotton')}</option>
              <option value="Maize">🌽 {t('cropMaize')}</option>
              <option value="Sugarcane">🎋 {t('cropSugarcane')}</option>
              <option value="Groundnut">🥜 {t('cropGroundnut')}</option>
              <option value="Tomato">🍅 {t('cropTomato')}</option>
              <option value="Other">🌱 {t('cropOther')}</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-[#A9BDB1] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter by Location */}
          {distinctLocations.length > 0 && (
            <div className="relative flex-1 sm:w-48">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-2xl border border-[#244D3F] text-xs font-bold text-[#F4F8F5] bg-[#10251F] focus:outline-none focus:ring-2 focus:ring-[#64D995] cursor-pointer"
              >
                <option value="ALL">{t('allLocations')}</option>
                {distinctLocations.map((loc, idx) => (
                  <option key={idx} value={loc}>
                    📍 {loc}
                  </option>
                ))}
              </select>
              <MapPin className="w-3.5 h-3.5 text-[#A9BDB1] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Farms Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredFarms.length === 0 ? (
          <div className="bg-[#17332A] rounded-3xl p-10 text-center border-2 border-dashed border-[#244D3F] shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#10251F] text-[#64D995] border border-[#244D3F] flex items-center justify-center mx-auto shadow-inner">
              <Sprout className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#F4F8F5]">
                {farms.length === 0 ? t('farmJourneyStartsHere') : 'No matching farms found'}
              </h3>
              <p className="text-xs sm:text-sm text-[#A9BDB1] max-w-md mx-auto mt-1 font-medium">
                {farms.length === 0
                  ? 'Register your agricultural land to begin AI-powered soil moisture and sensor tracking.'
                  : 'Try clearing your search query or crop/location filters.'}
              </p>
            </div>
            {farms.length === 0 && (
              <button
                onClick={handleOpenRegister}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-sm shadow-lg shadow-[#2E8B57]/30 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#F4B740]" />
                <span>{t('registerFirstFarm')}</span>
              </button>
            )}
          </div>
        ) : (
          filteredFarms.map((farm) => {
            const farmFields = fields.filter((f) => f.farmId === farm.id);
            const farmSensors = sensors.filter((s) => s.farmId === farm.id);
            const isSelected = selectedFarmId === farm.id;

            // Unique crops in this farm
            const uniqueCrops = Array.from(new Set(farmFields.map((f) => f.cropType))).filter(Boolean);
            const activeSensorsCount = farmSensors.filter((s) => s.status === 'online' || s.status === 'active').length;

            return (
              <div
                key={farm.id}
                onClick={() => setDetailModalFarm(farm)}
                className={`bg-[#17332A] rounded-3xl p-6 shadow-xl border transition-all cursor-pointer hover:shadow-2xl hover:border-[#64D995]/60 relative group ${
                  isSelected ? 'border-[#64D995] ring-2 ring-[#64D995]/20' : 'border-[#244D3F]'
                }`}
              >
                {/* Top Farm Information Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#244D3F]/70 gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl sm:text-2xl font-black text-[#F4F8F5] tracking-tight group-hover:text-[#64D995] transition-colors">
                        {farm.name || farm.farmName}
                      </span>
                      {isSelected && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#2E8B57]/20 text-[#64D995] border border-[#64D995]/30">
                          Active Farm
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#A9BDB1] font-semibold mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#64D995]" />
                        {farm.ownerName || farm.farmerName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#64D995]" />
                        {farm.location} {farm.village ? `(${farm.village})` : ''}
                      </span>
                      <span>•</span>
                      <span className="font-extrabold text-[#64D995]">
                        {farm.totalArea} {farm.areaUnit || 'Acres'}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Selector */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectFarm(farm.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all min-h-[40px] cursor-pointer ${
                        isSelected
                          ? 'bg-[#2E8B57] text-white shadow-md shadow-[#2E8B57]/30'
                          : 'bg-[#10251F] text-[#F4F8F5] border border-[#244D3F] hover:bg-[#1D4033]'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select Farm'}
                    </button>

                    <button
                      onClick={() => setDetailModalFarm(farm)}
                      className="p-2.5 rounded-xl bg-[#10251F] text-[#64D995] border border-[#244D3F] hover:bg-[#1D4033] transition-colors cursor-pointer"
                      title={t('viewFarmDetails')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleOpenEdit(farm, e)}
                      className="p-2.5 rounded-xl text-[#A9BDB1] hover:bg-[#10251F] hover:text-[#F4F8F5] transition-colors cursor-pointer"
                      title={t('edit')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteWithConfirm(farm, e)}
                      className="p-2.5 rounded-xl text-[#A9BDB1] hover:bg-[#E45B5B]/20 hover:text-[#E45B5B] transition-colors cursor-pointer"
                      title={t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Badges Bar: Fields Count, Crop Badges, Sensors, Monitoring Status */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-[#244D3F]/70 text-xs">
                  <div>
                    <span className="text-[#A9BDB1] block font-semibold">{t('fieldCount')}</span>
                    <span className="font-black text-[#F4F8F5] text-sm mt-0.5 block">
                      {farmFields.length} {t('fieldsInFarm')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#A9BDB1] block font-semibold">{t('sensorCount')}</span>
                    <span className="font-black text-[#F4F8F5] text-sm mt-0.5 block">
                      {farmSensors.length} ({activeSensorsCount} {t('statusActive')})
                    </span>
                  </div>

                  <div>
                    <span className="text-[#A9BDB1] block font-semibold">{t('cropType')}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {uniqueCrops.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#10251F] border border-[#244D3F] text-[#64D995]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#A9BDB1] block font-semibold">{t('monitoringStatus')}</span>
                    <span className="font-extrabold text-[#64D995] text-xs mt-1 block flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{activeSensorsCount > 0 ? 'Live Telemetry' : 'Manual Monitoring'}</span>
                    </span>
                  </div>
                </div>

                {/* Sub-fields previews */}
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#A9BDB1] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#64D995]" />
                      <span>Registered Plots ({farmFields.length})</span>
                    </h4>

                    <button
                      onClick={() => {
                        setTargetFarmForField(farm.id);
                        setEditingField(null);
                        setFieldModalOpen(true);
                      }}
                      className="text-xs font-bold text-[#64D995] hover:text-[#F4F8F5] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('addNewField')}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {farmFields.map((field) => (
                      <div
                        key={field.id}
                        className="bg-[#10251F] rounded-2xl p-3.5 border border-[#244D3F] hover:border-[#64D995]/50 transition-all group/field"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-extrabold text-xs sm:text-sm text-[#F4F8F5]">
                              {field.name || field.fieldName}
                            </h5>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#17332A] border border-[#244D3F] text-[#64D995]">
                                🌾 {field.cropType}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#17332A] border border-[#244D3F] text-[#F4B740]">
                                {field.soilType}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setTargetFarmForField(farm.id);
                                setEditingField(field);
                                setFieldModalOpen(true);
                              }}
                              className="p-1 rounded-md text-[#A9BDB1] hover:text-[#64D995]"
                              title={t('edit')}
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(t('confirmDeleteField'))) {
                                  onDeleteField(field.id);
                                }
                              }}
                              className="p-1 rounded-md text-[#A9BDB1] hover:text-[#E45B5B]"
                              title={t('delete')}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#A9BDB1] font-semibold mt-2 pt-2 border-t border-[#244D3F]/60">
                          <span>{field.areaAcres ?? field.fieldArea ?? 1} {farm.areaUnit || 'Acres'}</span>
                          <span className="text-[#64D995] font-bold">{field.irrigationType || 'Drip'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Farm Full Registration & Multi-Field Wizard Modal */}
      {registrationModalOpen && (
        <FarmRegistrationForm
          farm={editingFarm}
          existingFields={editingFarm ? fields.filter((f) => f.farmId === editingFarm.id) : []}
          onSave={(farmData, fieldsData) => {
            onAddFarm(farmData, fieldsData);
            setRegistrationModalOpen(false);
          }}
          onClose={() => setRegistrationModalOpen(false)}
        />
      )}

      {/* Field Edit / Add Single Field Modal */}
      {fieldModalOpen && (
        <FieldModal
          field={editingField}
          farmId={targetFarmForField}
          sensors={sensors}
          onSave={(field) => {
            if (editingField) {
              onUpdateField(field);
            } else {
              onAddField(field);
            }
            setFieldModalOpen(false);
          }}
          onClose={() => setFieldModalOpen(false)}
        />
      )}

      {/* Farm Details Full Modal */}
      {detailModalFarm && (
        <FarmDetailModal
          farm={detailModalFarm}
          fields={fields}
          sensors={sensors}
          onClose={() => setDetailModalFarm(null)}
          onEditFarm={() => {
            setEditingFarm(detailModalFarm);
            setDetailModalFarm(null);
            setRegistrationModalOpen(true);
          }}
          onAddField={() => {
            setTargetFarmForField(detailModalFarm.id);
            setEditingField(null);
            setFieldModalOpen(true);
          }}
        />
      )}
    </div>
  );
};
