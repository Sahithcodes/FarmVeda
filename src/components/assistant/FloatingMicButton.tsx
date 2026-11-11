import React from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface FloatingMicButtonProps {
  onClick: () => void;
  isListening?: boolean;
}

export const FloatingMicButton: React.FC<FloatingMicButtonProps> = ({
  onClick,
  isListening = false,
}) => {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      aria-label="Open Survam AI Voice Assistant"
      className={`fixed right-5 bottom-20 md:bottom-8 z-40 group flex items-center justify-center rounded-full p-4 text-white shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer ${
        isListening
          ? 'bg-[#E45B5B] ring-4 ring-[#E45B5B]/40 scale-105 shadow-[0_0_25px_rgba(228,91,91,0.5)]'
          : 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] border border-[#64D995]/40 hover:scale-105 shadow-[0_0_20px_rgba(46,139,87,0.35)]'
      }`}
      style={{ minWidth: '60px', minHeight: '60px' }}
    >
      {/* Outer Pulse Ring */}
      <span className="absolute -inset-1.5 rounded-full bg-[#64D995]/30 animate-ping opacity-75 pointer-events-none" />

      {/* Mic Icon */}
      <div className="relative flex items-center justify-center">
        <Mic className={`w-7 h-7 ${isListening ? 'text-white' : 'text-[#F4B740]'}`} />
        <Sparkles className="w-3.5 h-3.5 text-[#F4B740] absolute -top-1 -right-1 animate-pulse" />
      </div>

      {/* Floating Pill Label for Desktop */}
      <span className="hidden lg:group-hover:flex items-center gap-1.5 absolute right-full mr-3.5 bg-[#10251F] text-[#F4F8F5] font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-2xl border border-[#244D3F] pointer-events-none whitespace-nowrap">
        <span>{t('aiAssistantName')}</span>
        <span className="text-[#F4B740]">• Voice</span>
      </span>
    </button>
  );
};
