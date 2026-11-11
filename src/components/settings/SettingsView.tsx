import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { dbService } from '../../db/dbService';
import {
  Settings,
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Volume2,
  Globe,
  CheckCircle2,
} from 'lucide-react';

interface SettingsViewProps {
  onDataResetOrCleared: () => void;
  onOpenOnboarding: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onDataResetOrCleared,
  onOpenOnboarding,
}) => {
  const { t, language, setLanguage } = useLanguage();

  const [voiceRate, setVoiceRate] = useState<number>(() => {
    return parseFloat(localStorage.getItem('farmveda_voice_rate') || '0.95');
  });
  const [voicePitch, setVoicePitch] = useState<number>(() => {
    return parseFloat(localStorage.getItem('farmveda_voice_pitch') || '1.0');
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExportJson = async () => {
    try {
      const json = await dbService.exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `farmveda_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification(t('dataExportSuccess'));
    } catch (err) {
      alert('Export failed: ' + err);
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await dbService.importDataFromJson(content);
        if (success) {
          showNotification(t('dataImportSuccess'));
          onDataResetOrCleared();
        } else {
          alert('Failed to import data. Please check JSON format.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDemoData = async () => {
    if (confirm(t('confirmResetData'))) {
      await dbService.resetToDemoData();
      showNotification('Demo data reloaded successfully!');
      onDataResetOrCleared();
    }
  };

  const handleClearAllData = async () => {
    if (confirm(t('confirmClearData'))) {
      await dbService.clearAllData();
      showNotification('All local data cleared from this device.');
      onDataResetOrCleared();
    }
  };

  const handleVoiceRateChange = (val: number) => {
    setVoiceRate(val);
    localStorage.setItem('farmveda_voice_rate', val.toString());
  };

  const handleVoicePitchChange = (val: number) => {
    setVoicePitch(val);
    localStorage.setItem('farmveda_voice_pitch', val.toString());
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#F4F8F5] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#64D995]" />
          <span>{t('settingsTitle')}</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#A9BDB1] font-medium mt-0.5">
          {t('settingsSubtitle')}
        </p>
      </div>

      {notification && (
        <div className="p-4 bg-[#1D4033] border border-[#244D3F] rounded-2xl text-xs sm:text-sm font-extrabold text-[#64D995] flex items-center gap-2 shadow-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#64D995] flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Language Preferences */}
      <div className="bg-[#17332A] rounded-3xl p-6 shadow-xl border border-[#244D3F]">
        <h3 className="font-extrabold text-base text-[#F4F8F5] flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-[#64D995]" />
          <span>Language Preferences</span>
        </h3>
        <p className="text-xs text-[#A9BDB1] mb-4">
          Choose your application display language and voice speech dialect
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'en', name: 'English', desc: 'Standard English' },
            { id: 'hi', name: 'हिंदी (Hindi)', desc: 'हिंदी भाषा' },
            { id: 'kn', name: 'ಕನ್ನಡ (Kannada)', desc: 'ಕನ್ನಡ ಭಾಷೆ' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setLanguage(item.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all min-h-[52px] cursor-pointer ${
                language === item.id
                  ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] border-[#64D995] text-white shadow-md'
                  : 'bg-[#10251F] border-[#244D3F] text-[#F4F8F5] hover:bg-[#1D4033]'
              }`}
            >
              <span className="font-black text-sm block">{item.name}</span>
              <span className={`text-[11px] ${language === item.id ? 'text-emerald-100' : 'text-[#A9BDB1]'}`}>
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Survam AI Voice Settings */}
      <div className="bg-[#17332A] rounded-3xl p-6 shadow-xl border border-[#244D3F]">
        <h3 className="font-extrabold text-base text-[#F4F8F5] flex items-center gap-2 mb-2">
          <Volume2 className="w-5 h-5 text-[#64D995]" />
          <span>{t('voiceSettings')}</span>
        </h3>
        <p className="text-xs text-[#A9BDB1] mb-4">
          Tune SpeechSynthesis audio response pitch and playback rate
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-xs font-bold text-[#A9BDB1] mb-2">
              <span>{t('voiceSpeed')}</span>
              <span className="text-[#64D995] font-black">{voiceRate}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={voiceRate}
              onChange={(e) => handleVoiceRateChange(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-[#0B1713] rounded-lg appearance-none cursor-pointer accent-[#64D995] border border-[#244D3F]"
            />
            <div className="flex justify-between text-[10px] text-[#A9BDB1]/70 mt-1">
              <span>Slower</span>
              <span>Default (0.95x)</span>
              <span>Faster</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#A9BDB1] mb-2">
              <span>{t('voicePitch')}</span>
              <span className="text-[#64D995] font-black">{voicePitch}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={voicePitch}
              onChange={(e) => handleVoicePitchChange(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-[#0B1713] rounded-lg appearance-none cursor-pointer accent-[#64D995] border border-[#244D3F]"
            />
            <div className="flex justify-between text-[10px] text-[#A9BDB1]/70 mt-1">
              <span>Deep</span>
              <span>Default (1.0x)</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Local Database & JSON Backup/Restore */}
      <div className="bg-[#17332A] rounded-3xl p-6 shadow-xl border border-[#244D3F]">
        <div className="flex items-start justify-between pb-4 border-b border-[#244D3F]/70 mb-4">
          <div>
            <h3 className="font-extrabold text-base text-[#F4F8F5] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#64D995]" />
              <span>{t('dataManagementTitle')}</span>
            </h3>
            <p className="text-xs text-[#A9BDB1] mt-1 leading-relaxed">
              {t('dataManagementDesc')}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#10251F] text-[#64D995] border border-[#244D3F]">
            IndexedDB
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#10251F] hover:bg-[#1D4033] border border-[#244D3F] text-[#F4F8F5] font-extrabold text-xs sm:text-sm transition-all min-h-[52px] cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#64D995]" />
            <span>{t('exportJson')}</span>
          </button>

          {/* Import JSON */}
          <label className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#10251F] hover:bg-[#1D4033] border border-[#244D3F] text-[#F4F8F5] font-extrabold text-xs sm:text-sm cursor-pointer transition-all min-h-[52px]">
            <Upload className="w-4 h-4 text-[#64D995]" />
            <span>{t('importJson')}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>

          {/* Reset Demo Data */}
          <button
            onClick={handleResetDemoData}
            className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#10251F] hover:bg-[#1D4033] border border-[#F4B740]/40 text-[#F4B740] font-extrabold text-xs sm:text-sm transition-all min-h-[52px] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#F4B740]" />
            <span>{t('resetDemoData')}</span>
          </button>

          {/* Clear Storage */}
          <button
            onClick={handleClearAllData}
            className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#10251F] hover:bg-[#E45B5B]/20 border border-[#E45B5B]/40 text-[#E45B5B] font-extrabold text-xs sm:text-sm transition-all min-h-[52px] cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-[#E45B5B]" />
            <span>{t('clearAllData')}</span>
          </button>
        </div>

        {/* Re-run Onboarding */}
        <div className="mt-4 pt-4 border-t border-[#244D3F]/70 flex items-center justify-between">
          <span className="text-xs text-[#A9BDB1] font-semibold">
            Want to reconfigure farm welcome setup?
          </span>
          <button
            onClick={onOpenOnboarding}
            className="text-xs font-bold text-[#64D995] hover:underline cursor-pointer"
          >
            Launch Onboarding Wizard
          </button>
        </div>
      </div>
    </div>
  );
};
