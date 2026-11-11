import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Download, X, Smartphone } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const { t, language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install banner if not dismissed before
      const dismissed = localStorage.getItem('farmveda_pwa_dismissed');
      if (!dismissed && !isStandaloneMode) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        language === 'hi'
          ? 'ऐप इंस्टॉल करने के लिए अपने ब्राउज़र मेनू में "Add to Home screen" चुनें।'
          : language === 'kn'
          ? 'ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಲು ಬ್ರೌಸರ್ ಮೆನುವಿನಲ್ಲಿ "Add to Home screen" ಆಯ್ಕೆಮಾಡಿ.'
          : 'To install, open browser menu and select "Add to Home Screen" or "Install App".'
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('farmveda_pwa_dismissed', 'true');
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-40 bg-[#17332A] rounded-2xl shadow-2xl border border-[#244D3F] p-4 transition-all animate-bounce-short text-[#F4F8F5]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#10251F] border border-[#244D3F] text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Smartphone className="w-6 h-6 text-[#F4B740]" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-[#F4F8F5]">
              {t('appName')}
            </h4>
            <p className="text-xs text-[#A9BDB1] mt-0.5 leading-snug">
              {language === 'hi'
                ? 'ऑफ़लाइन उपयोग के लिए होम स्क्रीन पर जोड़ें।'
                : language === 'kn'
                ? 'ಆಫ್‌ಲೈನ್ ಬಳಕೆಗಾಗಿ ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ.'
                : 'Install on Home Screen for offline farming companion.'}
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-[#A9BDB1] hover:text-white p-1 rounded-lg"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 py-2 px-3 bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#3AA86B] hover:to-[#2E8B57] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 border border-[#64D995]/30 cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#F4B740]" />
          <span>{t('pwaInstallButton')}</span>
        </button>
        <button
          onClick={handleDismiss}
          className="py-2 px-3 bg-[#10251F] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
};

