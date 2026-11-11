import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { IrrigationSchedule, Field } from '../../types';
import {
  Droplets,
  Power,
  Sliders,
  Clock,
  Waves,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface IrrigationControlsProps {
  schedule?: IrrigationSchedule;
  field?: Field;
  onUpdateSchedule: (updates: Partial<IrrigationSchedule>) => void;
}

export const IrrigationControls: React.FC<IrrigationControlsProps> = ({
  schedule,
  field,
  onUpdateSchedule,
}) => {
  const { t, language } = useLanguage();

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'start' | 'stop' | 'toggleAuto';
  }>({ open: false, type: 'start' });

  const isPumpOn = schedule?.status === 'ON';
  const isAuto = schedule?.mode === 'auto';
  const threshold = schedule?.moistureThreshold || 50;

  const handleActionConfirm = () => {
    if (confirmModal.type === 'start') {
      onUpdateSchedule({
        status: 'ON',
        lastIrrigationTime: 'Just started',
        waterUsedLitersToday: (schedule?.waterUsedLitersToday || 0) + 50,
      });
    } else if (confirmModal.type === 'stop') {
      onUpdateSchedule({
        status: 'OFF',
        lastIrrigationTime: `Completed at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      });
    } else if (confirmModal.type === 'toggleAuto') {
      onUpdateSchedule({
        mode: isAuto ? 'manual' : 'auto',
      });
    }
    setConfirmModal({ open: false, type: 'start' });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#F4F8F5] flex items-center gap-2">
          <Droplets className="w-6 h-6 text-[#64D995]" />
          <span>{t('irrigationTitle')}</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#A9BDB1] font-medium mt-0.5">
          {field ? `${field.name} (${field.cropType})` : t('irrigationSubtitle')}
        </p>
      </div>

      {/* Hardware Disclaimer Alert Notice */}
      <div className="bg-[#F4B740]/15 border border-[#F4B740]/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#F4F8F5]">
        <ShieldAlert className="w-5 h-5 text-[#F4B740] flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold uppercase tracking-wider block text-[#F4B740] mb-0.5">
            Simulation Notice
          </span>
          <p className="font-medium text-[#A9BDB1] leading-relaxed">
            {t('irrigationWarningNotice')}
          </p>
        </div>
      </div>

      {/* Main Pump Status & Large Control Card */}
      <div className="bg-[#17332A] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#244D3F] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#244D3F]/70">
          <div className="flex items-center gap-4">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0 transition-all ${
                isPumpOn
                  ? 'bg-gradient-to-br from-[#2E8B57] to-[#1F6B41] text-white shadow-xl shadow-[#2E8B57]/40 border border-[#64D995]/50 animate-pulse'
                  : 'bg-[#10251F] text-[#A9BDB1] border border-[#244D3F]'
              }`}
            >
              <Power className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#A9BDB1] uppercase tracking-wider">
                  {t('currentStatus')}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                    isPumpOn
                      ? 'bg-[#2E8B57] text-white border-[#64D995]/40'
                      : 'bg-[#10251F] text-[#A9BDB1] border-[#244D3F]'
                  }`}
                >
                  {isPumpOn ? t('statusOn') : t('statusOff')}
                </span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-black text-[#F4F8F5] mt-1 tracking-tight">
                {isPumpOn ? 'Pump Running' : 'Pump Standby'}
              </h3>
              <p className="text-xs text-[#A9BDB1] font-semibold mt-0.5">
                Mode: <span className="text-[#64D995] font-bold">{isAuto ? t('modeAuto') : t('modeManual')}</span>
              </p>
            </div>
          </div>

          {/* Large Action Start/Stop Button */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            {isPumpOn ? (
              <button
                onClick={() => setConfirmModal({ open: true, type: 'stop' })}
                className="w-full py-4 px-6 rounded-2xl bg-[#E45B5B] hover:bg-[#d04949] text-white font-black text-base shadow-xl shadow-[#E45B5B]/30 transition-transform active:scale-95 flex items-center justify-center gap-2 min-h-[56px] cursor-pointer"
              >
                <Power className="w-5 h-5" />
                <span>{t('stopIrrigation')}</span>
              </button>
            ) : (
              <button
                onClick={() => setConfirmModal({ open: true, type: 'start' })}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-black text-base shadow-xl shadow-[#2E8B57]/30 transition-transform active:scale-95 flex items-center justify-center gap-2 min-h-[56px] cursor-pointer"
              >
                <Power className="w-5 h-5 text-[#F4B740]" />
                <span>{t('startIrrigation')}</span>
              </button>
            )}

            <button
              onClick={() => setConfirmModal({ open: true, type: 'toggleAuto' })}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors min-h-[48px] cursor-pointer ${
                isAuto
                  ? 'bg-[#10251F] border-[#244D3F] text-[#64D995] hover:bg-[#1D4033]'
                  : 'bg-[#10251F] border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5]'
              }`}
            >
              {isAuto ? t('disableAutoMode') : t('enableAutoMode')}
            </button>
          </div>
        </div>

        {/* Schedule & Telemetry Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="bg-[#10251F] rounded-2xl p-4 border border-[#244D3F]">
            <span className="text-xs font-bold text-[#A9BDB1] flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#64D995]" />
              <span>{t('lastIrrigation')}</span>
            </span>
            <p className="text-base font-extrabold text-[#F4F8F5]">
              {schedule?.lastIrrigationTime || 'Yesterday, 05:30 PM'}
            </p>
          </div>

          <div className="bg-[#10251F] rounded-2xl p-4 border border-[#244D3F]">
            <span className="text-xs font-bold text-[#A9BDB1] flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#F4B740]" />
              <span>{t('nextIrrigation')}</span>
            </span>
            <p className="text-base font-extrabold text-[#F4F8F5]">
              {schedule?.nextIrrigationTime || 'Today, 05:00 PM'}
            </p>
          </div>

          <div className="bg-[#10251F] rounded-2xl p-4 border border-[#244D3F]">
            <span className="text-xs font-bold text-[#A9BDB1] flex items-center gap-1.5 mb-1">
              <Waves className="w-3.5 h-3.5 text-sky-400" />
              <span>{t('waterUsageToday')}</span>
            </span>
            <p className="text-base font-extrabold text-[#64D995]">
              {schedule?.waterUsedLitersToday || 450} {t('liters')}
            </p>
          </div>
        </div>

        {/* Soil Moisture Trigger Threshold Slider */}
        <div className="bg-[#10251F] rounded-2xl p-5 border border-[#244D3F]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-extrabold text-sm text-[#F4F8F5] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#64D995]" />
                <span>{t('moistureThreshold')}</span>
              </h4>
              <p className="text-xs text-[#A9BDB1] mt-0.5">
                Pump activates automatically when root moisture falls below this level
              </p>
            </div>
            <span className="text-2xl font-black text-[#64D995]">
              {threshold}%
            </span>
          </div>

          <input
            type="range"
            min="30"
            max="70"
            step="5"
            value={threshold}
            onChange={(e) =>
              onUpdateSchedule({ moistureThreshold: Number(e.target.value) })
            }
            className="w-full h-3 bg-[#0B1713] rounded-lg appearance-none cursor-pointer accent-[#64D995] mt-2 border border-[#244D3F]"
          />

          <div className="flex justify-between text-[11px] font-bold text-[#A9BDB1] mt-1">
            <span>30% (Dry soil trigger)</span>
            <span>50% (Standard root threshold)</span>
            <span>70% (Wet soil threshold)</span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10251F] rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-[#244D3F] text-[#F4F8F5] animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-[#17332A] text-[#64D995] border border-[#244D3F] flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Droplets className="w-6 h-6" />
            </div>

            <h3 className="font-black text-lg text-[#F4F8F5] text-center">
              {confirmModal.type === 'start'
                ? t('confirmStartIrrigation')
                : confirmModal.type === 'stop'
                ? t('confirmStopIrrigation')
                : 'Toggle Automation Mode?'}
            </h3>

            <p className="text-xs text-[#A9BDB1] text-center mt-1.5 leading-relaxed">
              {confirmModal.type === 'start'
                ? t('confirmStartDesc')
                : confirmModal.type === 'stop'
                ? t('confirmStopDesc')
                : 'Switch between automatic moisture threshold control and manual trigger.'}
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleActionConfirm}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
              >
                {t('confirm')}
              </button>
              <button
                onClick={() => setConfirmModal({ open: false, type: 'start' })}
                className="py-3 px-4 rounded-xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] font-semibold text-sm cursor-pointer"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
