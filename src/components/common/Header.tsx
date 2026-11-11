import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Farm, Field, Language } from '../../types';
import {
  Globe,
  Wifi,
  WifiOff,
  CloudSun,
  Bell,
  Sparkles,
  ChevronDown,
  User,
} from 'lucide-react';

interface HeaderProps {
  farms: Farm[];
  fields: Field[];
  selectedFarmId: string;
  selectedFieldId: string;
  onSelectFarm: (farmId: string) => void;
  onSelectField: (fieldId: string) => void;
  onOpenAssistant: () => void;
  onOpenProfile?: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  farms,
  fields,
  selectedFarmId,
  selectedFieldId,
  onSelectFarm,
  onSelectField,
  onOpenAssistant,
  onOpenProfile,
  isOnline,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { currentUser } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Time & Greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? t('greetingMorning')
      : currentHour < 17
      ? t('greetingAfternoon')
      : t('greetingEvening');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];
  const activeFields = fields.filter((f) => f.farmId === selectedFarmId);

  return (
    <header className="sticky top-0 z-30 bg-[#10251F]/95 backdrop-blur-xl border-b border-[#244D3F] shadow-lg shadow-black/20 px-4 py-3 md:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Top Row: Logo & Quick Badges */}
        <div className="flex items-center justify-between">
          <Logo size="md" showTagline={false} />

          <div className="flex items-center gap-2 md:hidden">
            {/* Language Quick Toggle */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#17332A] border border-[#244D3F] text-[#F4F8F5] text-xs font-bold shadow-sm active:scale-95 transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-[#64D995]" />
                <span>
                  {language === 'en' ? 'EN' : language === 'hi' ? 'हिंदी' : 'ಕನ್ನಡ'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#A9BDB1]" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-[#17332A] rounded-2xl shadow-2xl border border-[#244D3F] py-1.5 z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#1D4033] flex items-center justify-between ${
                      language === 'en' ? 'text-[#64D995] font-bold bg-[#1D4033]' : 'text-[#A9BDB1]'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[#64D995]" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('hi');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#1D4033] flex items-center justify-between ${
                      language === 'hi' ? 'text-[#64D995] font-bold bg-[#1D4033]' : 'text-[#A9BDB1]'
                    }`}
                  >
                    <span>हिंदी (Hindi)</span>
                    {language === 'hi' && <span className="w-1.5 h-1.5 rounded-full bg-[#64D995]" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('kn');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#1D4033] flex items-center justify-between ${
                      language === 'kn' ? 'text-[#64D995] font-bold bg-[#1D4033]' : 'text-[#A9BDB1]'
                    }`}
                  >
                    <span>ಕನ್ನಡ (Kannada)</span>
                    {language === 'kn' && <span className="w-1.5 h-1.5 rounded-full bg-[#64D995]" />}
                  </button>
                </div>
              )}
            </div>

            {/* User Profile Avatar on Mobile */}
            {currentUser && onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="w-8 h-8 rounded-xl bg-[#17332A] border border-[#244D3F] flex items-center justify-center text-sm shadow-xs cursor-pointer active:scale-95"
                title={currentUser.fullName}
              >
                <span>{currentUser.avatarUrl || '🌾'}</span>
              </button>
            )}

            {/* AI Voice Assistant Pill Button */}
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] text-white text-xs font-bold shadow-md hover:from-[#3AA86B] hover:to-[#2E8B57] active:scale-95 transition-all border border-[#64D995]/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F4B740] animate-pulse" />
              <span>Survam</span>
            </button>
          </div>
        </div>

        {/* Center / Selectors & Greeting */}
        <div className="flex flex-wrap items-center justify-between md:justify-center gap-2.5">
          {/* Greeting & Time display */}
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#64D995] animate-ping" />
            <div>
              <p className="text-xs font-bold text-[#F4F8F5] leading-tight">
                {greeting}, {currentUser?.fullName || t('farmer')}!
              </p>
              <p className="text-[11px] text-[#A9BDB1] font-medium">
                {currentDate} • {currentTime}
              </p>
            </div>
          </div>

          {/* Farm & Field Selectors */}
          <div className="flex items-center gap-1.5">
            {/* Farm Picker */}
            {farms.length === 0 ? (
              <span className="text-xs font-bold text-[#A9BDB1] bg-[#17332A] px-3 py-1.5 rounded-xl border border-[#244D3F]">
                {t('noFarmsYet')}
              </span>
            ) : (
              <div className="relative">
                <select
                  value={selectedFarmId}
                  onChange={(e) => onSelectFarm(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1.5 bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#F4F8F5] font-bold text-xs rounded-xl shadow-xs cursor-pointer focus:outline-none focus:border-[#64D995] focus:ring-1 focus:ring-[#64D995]"
                >
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id} className="bg-[#10251F] text-white">
                      🌱 {farm.name || farm.farmName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#64D995] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            )}

            {/* Field Picker */}
            {activeFields.length > 0 && (
              <div className="relative">
                <select
                  value={selectedFieldId}
                  onChange={(e) => onSelectField(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1.5 bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#F4F8F5] font-semibold text-xs rounded-xl shadow-xs cursor-pointer focus:outline-none focus:border-[#64D995] focus:ring-1 focus:ring-[#64D995]"
                >
                  <option value="" className="bg-[#10251F] text-white">{t('allFields')}</option>
                  {activeFields.map((field) => (
                    <option key={field.id} value={field.id} className="bg-[#10251F] text-white">
                      🌾 {field.name || field.fieldName} ({field.cropType})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#64D995] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            )}
          </div>
        </div>

        {/* Desktop Right Controls */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#17332A] rounded-xl text-xs font-semibold text-[#A9BDB1] border border-[#244D3F]">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#64D995]" />
                <span className="text-[#F4F8F5]">{t('onlineMode')}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-[#E45B5B]" />
                <span className="text-[#E45B5B]">{t('offlineMode')}</span>
              </>
            )}
          </div>

          {/* Desktop Language Selector Pills */}
          <div className="flex items-center bg-[#17332A] p-1 rounded-xl border border-[#244D3F]">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] text-white shadow-md'
                  : 'text-[#A9BDB1] hover:text-[#F4F8F5]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                language === 'hi'
                  ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] text-white shadow-md'
                  : 'text-[#A9BDB1] hover:text-[#F4F8F5]'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLanguage('kn')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                language === 'kn'
                  ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] text-white shadow-md'
                  : 'text-[#A9BDB1] hover:text-[#F4F8F5]'
              }`}
            >
              ಕನ್ನಡ
            </button>
          </div>

          {/* Desktop User Profile Button */}
          {currentUser && onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#F4F8F5] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="View Profile"
            >
              <span className="text-base">{currentUser.avatarUrl || '🌾'}</span>
              <span className="max-w-[120px] truncate">{currentUser.fullName}</span>
            </button>
          )}

          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#3AA86B] hover:to-[#2E8B57] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 border border-[#64D995]/30 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#F4B740] animate-spin" style={{ animationDuration: '6s' }} />
            <span>{t('aiAssistantName')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
