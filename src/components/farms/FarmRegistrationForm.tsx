import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Farm, Field, CropType, SoilType, AreaUnit, IrrigationType } from '../../types';
import {
  X,
  Sprout,
  Layers,
  MapPin,
  User,
  Phone,
  Ruler,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Droplets,
} from 'lucide-react';

interface FarmRegistrationFormProps {
  farm?: Farm | null;
  existingFields?: Field[];
  onSave: (farm: Farm, fields: Field[]) => void;
  onClose: () => void;
}

interface FieldDraft {
  tempId: string;
  id: string;
  name: string;
  area: number;
  cropType: CropType;
  soilType: SoilType;
  plantingDate: string;
  irrigationType: IrrigationType;
  description: string;
}

export const FarmRegistrationForm: React.FC<FarmRegistrationFormProps> = ({
  farm,
  existingFields = [],
  onSave,
  onClose,
}) => {
  const { t, language } = useLanguage();

  // Farm Information state
  const [farmerName, setFarmerName] = useState(farm?.farmerName || farm?.ownerName || '');
  const [farmName, setFarmName] = useState(farm?.farmName || farm?.name || '');
  const [location, setLocation] = useState(farm?.location || '');
  const [village, setVillage] = useState(farm?.village || '');
  const [district, setDistrict] = useState(farm?.district || '');
  const [state, setState] = useState(farm?.state || 'Karnataka');
  const [totalArea, setTotalArea] = useState<number | string>(farm?.totalArea || 5.0);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>(farm?.areaUnit || 'Acres');
  const [contactNumber, setContactNumber] = useState(farm?.contactNumber || '');

  // Field Information state (multiple fields under one farm)
  const [fieldDrafts, setFieldDrafts] = useState<FieldDraft[]>(() => {
    if (existingFields.length > 0) {
      return existingFields.map((f, idx) => ({
        tempId: f.id,
        id: f.id,
        name: f.name || f.fieldName || `Field ${idx + 1}`,
        area: f.areaAcres ?? f.fieldArea ?? 1,
        cropType: f.cropType || 'Rice',
        soilType: f.soilType || 'Loamy',
        plantingDate: f.plantingDate || f.sowingDate || new Date().toISOString().split('T')[0],
        irrigationType: f.irrigationType || 'Drip Irrigation',
        description: f.description || '',
      }));
    }
    // Default 1 initial field
    return [
      {
        tempId: `draft-1`,
        id: `FLD-${Date.now().toString().slice(-4)}`,
        name: 'Main Field Plot',
        area: 2.5,
        cropType: 'Rice',
        soilType: 'Loamy',
        plantingDate: new Date().toISOString().split('T')[0],
        irrigationType: 'Drip Irrigation',
        description: 'Primary irrigated plot',
      },
    ];
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available options
  const crops: { id: CropType; emoji: string; key: string }[] = [
    { id: 'Rice', emoji: '🌾', key: 'cropRice' },
    { id: 'Wheat', emoji: '🌿', key: 'cropWheat' },
    { id: 'Cotton', emoji: '☁️', key: 'cropCotton' },
    { id: 'Maize', emoji: '🌽', key: 'cropMaize' },
    { id: 'Sugarcane', emoji: '🎋', key: 'cropSugarcane' },
    { id: 'Groundnut', emoji: '🥜', key: 'cropGroundnut' },
    { id: 'Tomato', emoji: '🍅', key: 'cropTomato' },
    { id: 'Other', emoji: '🌱', key: 'cropOther' },
  ];

  const soils: { id: SoilType; key: string }[] = [
    { id: 'Sandy', key: 'soilSandy' },
    { id: 'Clay', key: 'soilClay' },
    { id: 'Loamy', key: 'soilLoamy' },
    { id: 'Silt', key: 'soilSilt' },
    { id: 'Black Soil', key: 'soilBlack' },
    { id: 'Red Soil', key: 'soilRed' },
  ];

  const irrigationOptions: { id: IrrigationType; key: string }[] = [
    { id: 'Drip Irrigation', key: 'irrigationDrip' },
    { id: 'Sprinkler Irrigation', key: 'irrigationSprinkler' },
    { id: 'Flood Irrigation', key: 'irrigationFlood' },
    { id: 'Manual Irrigation', key: 'irrigationManual' },
    { id: 'Other', key: 'irrigationOther' },
  ];

  // Add field draft
  const handleAddAnotherField = () => {
    const nextIdx = fieldDrafts.length + 1;
    const newFieldId = `FLD-${Date.now().toString().slice(-4)}${nextIdx}`;
    setFieldDrafts((prev) => [
      ...prev,
      {
        tempId: `draft-${Date.now()}`,
        id: newFieldId,
        name: `Plot ${nextIdx}`,
        area: 1.0,
        cropType: 'Wheat',
        soilType: 'Loamy',
        plantingDate: new Date().toISOString().split('T')[0],
        irrigationType: 'Drip Irrigation',
        description: '',
      },
    ]);
  };

  // Remove field draft
  const handleRemoveField = (index: number) => {
    if (fieldDrafts.length <= 1) {
      alert(language === 'hi' ? 'खेत में कम से कम एक हिस्सा होना आवश्यक है।' : language === 'kn' ? 'ಕನಿಷ್ಠ ಒಂದು ಕ್ಷೇತ್ರ ಇರಬೇಕು.' : 'A farm must have at least one field.');
      return;
    }
    setFieldDrafts((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Update specific field draft
  const handleFieldChange = (index: number, fieldKey: keyof FieldDraft, value: any) => {
    setFieldDrafts((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [fieldKey]: value } : item))
    );
  };

  // Submit & Validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Required fields check
    if (!farmerName.trim() || !farmName.trim() || !location.trim()) {
      setErrorMessage(t('validationError'));
      return;
    }

    // 2. Positive number check for farm area
    const parsedTotalArea = Number(totalArea);
    if (isNaN(parsedTotalArea) || parsedTotalArea <= 0) {
      setErrorMessage(t('positiveNumberError'));
      return;
    }

    // 3. Field validations
    let totalFieldArea = 0;
    for (const f of fieldDrafts) {
      if (!f.name.trim()) {
        setErrorMessage(t('validationError'));
        return;
      }
      const fieldAreaNum = Number(f.area);
      if (isNaN(fieldAreaNum) || fieldAreaNum <= 0) {
        setErrorMessage(t('positiveNumberError'));
        return;
      }
      totalFieldArea += fieldAreaNum;
    }

    // 4. Area constraint check: total field area should not exceed total farm area
    if (totalFieldArea > parsedTotalArea) {
      setErrorMessage(
        `${t('areaExceededError')} (${totalFieldArea.toFixed(1)} ${areaUnit} > ${parsedTotalArea} ${areaUnit})`
      );
      return;
    }

    const farmId = farm?.id || `farm-${Date.now()}`;
    const savedFarm: Farm = {
      id: farmId,
      name: farmName.trim(),
      farmName: farmName.trim(),
      ownerName: farmerName.trim(),
      farmerName: farmerName.trim(),
      location: location.trim(),
      village: village.trim() || location.trim(),
      district: district.trim(),
      state: state.trim(),
      totalArea: parsedTotalArea,
      areaUnit,
      contactNumber: contactNumber.trim(),
      createdAt: farm?.createdAt || new Date().toISOString(),
    };

    const savedFields: Field[] = fieldDrafts.map((draft) => ({
      id: draft.id || `field-${Date.now()}`,
      farmId,
      name: draft.name.trim(),
      fieldName: draft.name.trim(),
      areaAcres: Number(draft.area),
      fieldArea: Number(draft.area),
      cropType: draft.cropType,
      soilType: draft.soilType,
      plantingDate: draft.plantingDate,
      sowingDate: draft.plantingDate,
      irrigationType: draft.irrigationType,
      description: draft.description.trim(),
    }));

    onSave(savedFarm, savedFields);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#10251F] rounded-3xl w-full max-w-3xl h-[92vh] max-h-[820px] shadow-2xl border border-[#244D3F] flex flex-col overflow-hidden animate-scale-in text-[#F4F8F5]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1713] via-[#10251F] to-[#0B1713] p-5 text-white flex items-center justify-between flex-shrink-0 border-b border-[#244D3F]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2E8B57] to-[#1F6B41] flex items-center justify-center shadow-lg shadow-[#2E8B57]/30 border border-[#64D995]/40">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-[#F4F8F5] tracking-tight">
                {farm ? t('edit') : t('farmRegistrationTitle')}
              </h3>
              <p className="text-xs text-[#A9BDB1] font-medium">
                {t('farmRegistrationSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#A9BDB1] hover:text-[#F4F8F5] hover:bg-[#17332A] transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-7">
          {errorMessage && (
            <div className="p-4 bg-[#E45B5B]/15 border border-[#E45B5B]/40 rounded-2xl text-xs sm:text-sm font-bold text-[#E45B5B] flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section A: Farm Information */}
          <div className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F] space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-[#F4F8F5] flex items-center gap-2 border-b border-[#244D3F]/70 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#2E8B57] text-white flex items-center justify-center text-xs">
                A
              </span>
              <span>{t('farmRegistrationTitle')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
                  {t('farmerName')} <span className="text-[#E45B5B]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    required
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
                  />
                  <User className="w-4 h-4 text-[#A9BDB1] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
                  {t('farmName')} <span className="text-[#E45B5B]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    required
                    placeholder="e.g. Kaveri Organic Farm"
                    className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
                  />
                  <Sprout className="w-4 h-4 text-[#A9BDB1] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
                  {t('farmLocation')} <span className="text-[#E45B5B]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="e.g. Main Road, Mandya"
                    className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
                  />
                  <MapPin className="w-4 h-4 text-[#A9BDB1] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
                  {t('village')}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Mandya Rural"
                  className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
                  {t('district')}
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Mandya / Mysuru"
                  className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
                  {t('state')}
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Karnataka"
                  className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
                  {t('totalFarmArea')} <span className="text-[#E45B5B]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={totalArea}
                    onChange={(e) => setTotalArea(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5]"
                  />
                  <Ruler className="w-4 h-4 text-[#A9BDB1] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
                  {t('areaUnit')}
                </label>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] cursor-pointer"
                >
                  <option value="Acres">{t('acresUnit')}</option>
                  <option value="Hectares">{t('hectaresUnit')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1.5">
                {t('contactNumber')}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
                />
                <Phone className="w-4 h-4 text-[#A9BDB1] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Section B: Field Information (Multiple Fields under One Farm) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#244D3F]/70 pb-2">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-[#F4F8F5] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#2E8B57] text-white flex items-center justify-center text-xs">
                    B
                  </span>
                  <span>{t('fieldInformationHeader')} ({fieldDrafts.length})</span>
                </h4>
                <p className="text-xs text-[#A9BDB1] font-medium">
                  {t('fieldInformationDesc')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddAnotherField}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#1D4033] hover:bg-[#244D3F] border border-[#244D3F] text-[#64D995] text-xs font-bold shadow-xs active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#F4B740]" />
                <span>{t('addAnotherField')}</span>
              </button>
            </div>

            {/* Field Draft Cards */}
            <div className="space-y-4">
              {fieldDrafts.map((draft, index) => (
                <div
                  key={draft.tempId || index}
                  className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F] shadow-xl space-y-4 relative"
                >
                  <div className="flex items-center justify-between border-b border-[#244D3F]/60 pb-2.5">
                    <span className="font-black text-sm text-[#F4F8F5] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#64D995]" />
                      <span>Plot #{index + 1}: {draft.name || 'Untitled Plot'}</span>
                    </span>

                    {fieldDrafts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        className="text-[#A9BDB1] hover:text-[#E45B5B] p-1 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title={t('removeField')}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('removeField')}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#A9BDB1] mb-1">
                        {t('fieldName')} <span className="text-[#E45B5B]">*</span>
                      </label>
                      <input
                        type="text"
                        value={draft.name}
                        onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                        required
                        placeholder="e.g. North Block"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#244D3F] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#A9BDB1] mb-1">
                        {t('fieldId')}
                      </label>
                      <input
                        type="text"
                        value={draft.id}
                        onChange={(e) => handleFieldChange(index, 'id', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#244D3F] text-xs sm:text-sm font-semibold bg-[#10251F] text-[#F4F8F5] focus:outline-none focus:ring-2 focus:ring-[#64D995]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#A9BDB1] mb-1">
                        {t('fieldArea')} ({areaUnit}) <span className="text-[#E45B5B]">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={draft.area}
                        onChange={(e) => handleFieldChange(index, 'area', parseFloat(e.target.value) || 0)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#244D3F] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5]"
                      />
                    </div>
                  </div>

                  {/* Crop Type Visual Chips */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#A9BDB1] mb-1.5">
                      {t('cropType')}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {crops.map((c) => (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => handleFieldChange(index, 'cropType', c.id)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            draft.cropType === c.id
                              ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] border-[#64D995] text-white shadow-md'
                              : 'bg-[#10251F] border-[#244D3F] text-[#A9BDB1] hover:bg-[#1D4033] hover:text-[#F4F8F5]'
                          }`}
                        >
                          <span className="text-base">{c.emoji}</span>
                          <span className="truncate">{t(c.key as any)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#A9BDB1] mb-1">
                        {t('soilType')}
                      </label>
                      <select
                        value={draft.soilType}
                        onChange={(e) => handleFieldChange(index, 'soilType', e.target.value as SoilType)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#244D3F] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#10251F] text-[#F4F8F5] cursor-pointer"
                      >
                        {soils.map((s) => (
                          <option key={s.id} value={s.id} className="bg-[#10251F] text-[#F4F8F5]">
                            {t(s.key as any)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#A9BDB1] mb-1">
                        {t('plantingDate')}
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={draft.plantingDate}
                          onChange={(e) => handleFieldChange(index, 'plantingDate', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#244D3F] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5]"
                        />
                        <Calendar className="w-3.5 h-3.5 text-[#A9BDB1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#A9BDB1] mb-1">
                        {t('irrigationType')}
                      </label>
                      <select
                        value={draft.irrigationType}
                        onChange={(e) => handleFieldChange(index, 'irrigationType', e.target.value as IrrigationType)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#244D3F] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#10251F] text-[#F4F8F5] cursor-pointer"
                      >
                        {irrigationOptions.map((opt) => (
                          <option key={opt.id} value={opt.id} className="bg-[#10251F] text-[#F4F8F5]">
                            {t(opt.key as any)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#A9BDB1] mb-1">
                      {t('fieldDescription')}
                    </label>
                    <input
                      type="text"
                      value={draft.description}
                      onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                      placeholder="e.g. Certified organic plot, drip-fertigation enabled"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#244D3F] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions Bottom Bar */}
          <div className="pt-4 border-t border-[#244D3F] flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-black text-sm sm:text-base shadow-lg shadow-[#2E8B57]/30 transition-transform active:scale-95 flex items-center justify-center gap-2 min-h-[52px] cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-[#F4B740]" />
              <span>{t('save')} {t('farmsTitle')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3.5 px-6 rounded-2xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] font-bold text-sm min-h-[52px] cursor-pointer transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
