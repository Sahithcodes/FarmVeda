import React from 'react';

interface VoiceWaveformProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ isListening, isSpeaking }) => {
  if (!isListening && !isSpeaking) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 my-2">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => {
        const height = isListening
          ? `${Math.max(12, Math.sin(bar * 0.8) * 36 + 16)}px`
          : `${Math.max(8, Math.cos(bar * 0.6) * 28 + 12)}px`;

        return (
          <div
            key={bar}
            className={`w-1.5 rounded-full transition-all duration-150 ${
              isListening
                ? 'bg-[#E45B5B] shadow-[0_0_12px_rgba(228,91,91,0.6)] animate-pulse'
                : 'bg-[#64D995] shadow-[0_0_12px_rgba(100,217,149,0.6)] animate-pulse'
            }`}
            style={{
              height,
              animationDelay: `${bar * 120}ms`,
            }}
          />
        );
      })}
    </div>
  );
};
