import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Logo } from '../common/Logo';
import { Farm, Field, Sensor, CropType, SoilType } from '../../types';
import {
  Globe,
  User,
  Sprout,
  Layers,
  Radio,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Bot,
  MapPin,
  Ruler,
} from 'lucide-react';

interface OnboardingWizardProps {
  initialFarmerName?: string;
  initialVillageName?: string;
  onComplete: (data: {
    farmerName: string;
    villageName: string;
    farm: Farm;
    field: Field;
    sensor?: Sensor;
  }) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialFarmerName,
  initialVillageName,
  onComplete,
}) => {
  const { t, language, setLanguage } = useLanguage();

  const [step, setStep] = useState<number>(0); // 0 = Welcome screen, 1 = Lang, 2 = Farmer, 3 = Farm, 4 = Field, 5 = Sensor, 6 = Ready

  // Form states
  const [farmerName, setFarmerName] = useState(initialFarmerName || 'Ramesh Patel');
  const [villageName, setVillageName] = useState(initialVillageName || 'Mandya Rural, Karnataka');

  const [farmName, setFarmName] = useState('Annapurna Organic Farm');
  const [farmArea, setFarmArea] = useState<number>(8.5);

  const [fieldName, setFieldName] = useState('North Paddy Block');
  const [cropType, setCropType] = useState<CropType>('Rice');
  const [soilType, setSoilType] = useState<SoilType>('Clay');
  const [fieldArea, setFieldArea] = useState<number>(3.5);

  const [sensorCode, setSensorCode] = useState('SN-PADDY-01');
  const [attachSensor, setAttachSensor] = useState(true);

  const handleFinish = () => {
    const farmId = `farm-${Date.now()}`;
    const fieldId = `field-${Date.now()}`;

    const newFarm: Farm = {
      id: farmId,
      name: farmName.trim() || 'My Farm',
      ownerName: farmerName.trim() || 'Farmer',
      location: villageName.trim() || 'Karnataka',
      totalArea: Number(farmArea) || 5,
      createdAt: new Date().toISOString(),
    };

    const newField: Field = {
      id: fieldId,
      farmId,
      name: fieldName.trim() || 'Plot 1',
      cropType,
      soilType,
      areaAcres: Number(fieldArea) || 2.5,
      sowingDate: new Date().toISOString().split('T')[0],
      sensorId: attachSensor ? `sensor-${Date.now()}` : undefined,
    };

    const newSensor: Sensor | undefined = attachSensor
      ? {
          id: `sensor-${Date.now()}`,
          sensorCode: sensorCode.trim() || 'SN-NODE-01',
          farmId,
          fieldId,
          status: 'online',
          batteryLevel: 94,
          installedDate: new Date().toISOString().split('T')[0],
          lastUpdated: new Date().toISOString(),
        }
      : undefined;

    onComplete({
      farmerName,
      villageName,
      farm: newFarm,
      field: newField,
      sensor: newSensor,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto flex items-center justify-center p-4">
      <div className="bg-[#10251F] rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl border border-[#244D3F] text-[#F4F8F5] relative">
        {/* Step 0: Welcome Landing */}
        {step === 0 && (
          <div className="text-center py-4 space-y-6">
            <div className="flex justify-center">
              <Logo size="xl" showTagline={false} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#F4F8F5] tracking-tight">
                {t('welcomeTitle')}
              </h1>
              <p className="text-sm font-extrabold text-[#64D995] mt-1 tracking-wide">
                {t('tagline')}
              </p>
              <p className="text-xs sm:text-sm text-[#A9BDB1] max-w-md mx-auto mt-2 leading-relaxed">
                {t('welcomeSubtitle')}
              </p>
            </div>

            {/* Language Selector Cards */}
            <div className="bg-[#17332A] p-4 rounded-3xl border border-[#244D3F] text-left shadow-lg">
              <span className="block text-xs font-bold text-[#A9BDB1] mb-2.5">
                {t('step1Language')}:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-3 px-2 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] border-[#64D995] text-white shadow-md'
                      : 'bg-[#10251F] border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] hover:border-[#64D995]/50'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`py-3 px-2 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer ${
                    language === 'hi'
                      ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] border-[#64D995] text-white shadow-md'
                      : 'bg-[#10251F] border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] hover:border-[#64D995]/50'
                  }`}
                >
                  हिंदी
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('kn')}
                  className={`py-3 px-2 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer ${
                    language === 'kn'
                      ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] border-[#64D995] text-white shadow-md'
                      : 'bg-[#10251F] border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] hover:border-[#64D995]/50'
                  }`}
                >
                  ಕನ್ನಡ
                </button>
              </div>
            </div>

            {/* Survam AI teaser */}
            <div className="bg-gradient-to-r from-[#17332A] to-[#1D4033] border border-[#244D3F] p-4 rounded-3xl text-[#F4F8F5] text-left flex items-center gap-3.5 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2E8B57] to-[#1F6B41] border border-[#64D995]/40 flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-[#F4F8F5]">
                    {t('aiAssistantName')}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4B740]/20 text-[#F4B740] border border-[#F4B740]/30">
                    Voice Guidance
                  </span>
                </div>
                <p className="text-xs text-[#A9BDB1] mt-0.5">
                  Voice assistance in English, Hindi, and Kannada for hands-free farm checks.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-black text-base shadow-lg shadow-[#2E8B57]/30 transition-transform active:scale-95 flex items-center justify-center gap-2 min-h-[56px] cursor-pointer"
            >
              <span>{t('getStarted')}</span>
              <ArrowRight className="w-5 h-5 text-[#64D995]" />
            </button>
          </div>
        )}

        {/* Wizard Steps Header */}
        {step > 0 && (
          <div className="flex items-center justify-between pb-4 border-b border-[#244D3F] mb-6">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#1D4033] border border-[#64D995]/40 text-[#64D995] text-xs font-black flex items-center justify-center shadow-inner">
                {step}
              </span>
              <span className="text-xs font-bold text-[#A9BDB1] uppercase tracking-wider">
                Step {step} of 6
              </span>
            </div>
            {step < 6 && (
              <button
                onClick={() => setStep(6)}
                className="text-xs font-bold text-[#A9BDB1] hover:text-[#64D995] transition-colors cursor-pointer"
              >
                {t('skip')} to Dashboard
              </button>
            )}
          </div>
        )}

        {/* Step 1: Language Confirmation */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-[#F4F8F5]">
              {t('step1Language')}
            </h3>
            <p className="text-xs text-[#A9BDB1]">{t('step1Desc')}</p>

            <div className="grid grid-cols-1 gap-3 py-2">
              {[
                { id: 'en', name: 'English', desc: 'Standard Agricultural English' },
                { id: 'hi', name: 'हिंदी (Hindi)', desc: 'भारतीय किसानों के लिए सरल हिंदी' },
                { id: 'kn', name: 'ಕನ್ನಡ (Kannada)', desc: 'ಕರ್ನಾಟಕದ ರೈತರಿಗಾಗಿ ಸರಳ ಕನ್ನಡ' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLanguage(item.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    language === item.id
                      ? 'bg-[#1D4033] border-[#64D995] text-white shadow-lg'
                      : 'bg-[#17332A] border-[#244D3F] hover:bg-[#1D4033]/50 text-[#A9BDB1] hover:text-[#F4F8F5]'
                  }`}
                >
                  <div>
                    <h4 className="font-extrabold text-sm">{item.name}</h4>
                    <p className={`text-xs mt-0.5 ${language === item.id ? 'text-[#64D995]' : 'text-[#A9BDB1]'}`}>
                      {item.desc}
                    </p>
                  </div>
                  {language === item.id && (
                    <CheckCircle2 className="w-5 h-5 text-[#64D995]" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setStep(0)}
                className="py-3 px-4 rounded-2xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] font-bold text-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                {t('back')}
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-sm shadow-lg shadow-[#2E8B57]/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t('next')}</span>
                <ArrowRight className="w-4 h-4 text-[#64D995]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Farmer Info */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-[#F4F8F5]">
              {t('step2Farmer')}
            </h3>
            <p className="text-xs text-[#A9BDB1]">{t('step2Desc')}</p>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('farmerName')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] bg-[#0B1713]/80 text-[#F4F8F5] text-sm font-semibold focus:outline-none focus:border-[#64D995] placeholder-[#A9BDB1]/40"
                />
                <User className="w-4 h-4 text-[#A9BDB1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                Village / District
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={villageName}
                  onChange={(e) => setVillageName(e.target.value)}
                  placeholder="e.g. Mandya Rural, Karnataka"
                  className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] bg-[#0B1713]/80 text-[#F4F8F5] text-sm font-semibold focus:outline-none focus:border-[#64D995] placeholder-[#A9BDB1]/40"
                />
                <MapPin className="w-4 h-4 text-[#A9BDB1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-2xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] font-bold text-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                {t('back')}
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-sm shadow-lg shadow-[#2E8B57]/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t('next')}</span>
                <ArrowRight className="w-4 h-4 text-[#64D995]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Register Farm */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-[#F4F8F5]">
              {t('step3Farm')}
            </h3>
            <p className="text-xs text-[#A9BDB1]">{t('step3Desc')}</p>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('farmName')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. Annapurna Organic Farm"
                  className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] bg-[#0B1713]/80 text-[#F4F8F5] text-sm font-semibold focus:outline-none focus:border-[#64D995] placeholder-[#A9BDB1]/40"
                />
                <Sprout className="w-4 h-4 text-[#A9BDB1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('totalArea')} ({t('acres')})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={farmArea}
                  onChange={(e) => setFarmArea(parseFloat(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] bg-[#0B1713]/80 text-[#F4F8F5] text-sm font-semibold focus:outline-none focus:border-[#64D995]"
                />
                <Ruler className="w-4 h-4 text-[#A9BDB1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-2xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] font-bold text-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                {t('back')}
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-sm shadow-lg shadow-[#2E8B57]/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t('next')}</span>
                <ArrowRight className="w-4 h-4 text-[#64D995]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Add Field */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-[#F4F8F5]">
              {t('step4Field')}
            </h3>
            <p className="text-xs text-[#A9BDB1]">{t('step4Desc')}</p>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('fieldName')}
              </label>
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="e.g. North Paddy Block"
                className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] bg-[#0B1713]/80 text-[#F4F8F5] text-sm font-semibold focus:outline-none focus:border-[#64D995] placeholder-[#A9BDB1]/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                  {t('cropType')}
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-[#244D3F] text-xs sm:text-sm font-semibold bg-[#0B1713] text-[#F4F8F5] focus:outline-none focus:border-[#64D995]"
                >
                  <option value="Rice" className="bg-[#10251F] text-[#F4F8F5]">🌾 Rice (Paddy)</option>
                  <option value="Wheat" className="bg-[#10251F] text-[#F4F8F5]">🌿 Wheat</option>
                  <option value="Cotton" className="bg-[#10251F] text-[#F4F8F5]">☁️ Cotton</option>
                  <option value="Sugarcane" className="bg-[#10251F] text-[#F4F8F5]">🎋 Sugarcane</option>
                  <option value="Maize" className="bg-[#10251F] text-[#F4F8F5]">🌽 Maize</option>
                  <option value="Tomato" className="bg-[#10251F] text-[#F4F8F5]">🍅 Tomato</option>
                  <option value="Groundnut" className="bg-[#10251F] text-[#F4F8F5]">🥜 Groundnut</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                  {t('soilType')}
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-[#244D3F] text-xs sm:text-sm font-semibold bg-[#0B1713] text-[#F4F8F5] focus:outline-none focus:border-[#64D995]"
                >
                  <option value="Clay" className="bg-[#10251F] text-[#F4F8F5]">Clay Soil</option>
                  <option value="Loamy" className="bg-[#10251F] text-[#F4F8F5]">Loamy Soil</option>
                  <option value="Black Soil" className="bg-[#10251F] text-[#F4F8F5]">Black Soil</option>
                  <option value="Red Soil" className="bg-[#10251F] text-[#F4F8F5]">Red Soil</option>
                  <option value="Sandy" className="bg-[#10251F] text-[#F4F8F5]">Sandy Soil</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                Field Area ({t('acres')})
              </label>
              <input
                type="number"
                step="0.5"
                value={fieldArea}
                onChange={(e) => setFieldArea(parseFloat(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] bg-[#0B1713]/80 text-[#F4F8F5] text-sm font-semibold focus:outline-none focus:border-[#64D995]"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setStep(3)}
                className="py-3 px-4 rounded-2xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] font-bold text-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                {t('back')}
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-sm shadow-lg shadow-[#2E8B57]/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t('next')}</span>
                <ArrowRight className="w-4 h-4 text-[#64D995]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Add Sensor (Optional) */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-[#F4F8F5]">
              {t('step5Sensor')}
            </h3>
            <p className="text-xs text-[#A9BDB1]">{t('step5Desc')}</p>

            <div className="bg-[#17332A] p-4 rounded-2xl border border-[#244D3F]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attachSensor}
                  onChange={(e) => setAttachSensor(e.target.checked)}
                  className="w-5 h-5 rounded text-[#2E8B57] bg-[#0B1713] border-[#244D3F] focus:ring-[#2E8B57] cursor-pointer"
                />
                <div>
                  <span className="font-extrabold text-sm text-[#F4F8F5] block">
                    Attach smart sensor node now
                  </span>
                  <span className="text-xs text-[#A9BDB1]">
                    Will simulate live telemetry and soil moisture graphs
                  </span>
                </div>
              </label>
            </div>

            {attachSensor && (
              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                  Sensor Serial Code / ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sensorCode}
                    onChange={(e) => setSensorCode(e.target.value)}
                    placeholder="e.g. SN-PADDY-01"
                    className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] bg-[#0B1713]/80 text-[#F4F8F5] text-sm font-semibold focus:outline-none focus:border-[#64D995] placeholder-[#A9BDB1]/40"
                  />
                  <Radio className="w-4 h-4 text-[#64D995] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setStep(4)}
                className="py-3 px-4 rounded-2xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] font-bold text-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                {t('back')}
              </button>
              <button
                onClick={() => setStep(6)}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-sm shadow-lg shadow-[#2E8B57]/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t('next')}</span>
                <ArrowRight className="w-4 h-4 text-[#64D995]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Ready! */}
        {step === 6 && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#2E8B57]/20 border border-[#64D995]/40 text-[#64D995] flex items-center justify-center mx-auto shadow-lg shadow-[#2E8B57]/20">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#F4F8F5]">
                {t('step6Ready')}
              </h2>
              <p className="text-xs sm:text-sm text-[#A9BDB1] max-w-sm mx-auto mt-1">
                {t('step6Desc')}
              </p>
            </div>

            <div className="bg-[#17332A] p-4 rounded-2xl border border-[#244D3F] text-left text-xs space-y-1.5 shadow-lg">
              <div className="flex justify-between">
                <span className="text-[#A9BDB1] font-semibold">Farmer:</span>
                <span className="font-extrabold text-[#F4F8F5]">{farmerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A9BDB1] font-semibold">Farm:</span>
                <span className="font-extrabold text-[#F4F8F5]">{farmName} ({farmArea} {t('acres')})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A9BDB1] font-semibold">First Field:</span>
                <span className="font-extrabold text-[#F4F8F5]">{fieldName} ({cropType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A9BDB1] font-semibold">Sensor Node:</span>
                <span className="font-extrabold text-[#64D995]">{attachSensor ? sensorCode : 'None (Manual)'}</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-black text-base shadow-lg shadow-[#2E8B57]/30 transition-transform active:scale-95 flex items-center justify-center gap-2 min-h-[56px] cursor-pointer"
            >
              <Sprout className="w-5 h-5 text-[#64D995]" />
              <span>{t('openDashboard')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
