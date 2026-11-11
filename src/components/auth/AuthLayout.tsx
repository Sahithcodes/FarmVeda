import React from 'react';
import { Logo } from '../common/Logo';
import { useLanguage } from '../../i18n/LanguageContext';
import { Globe, ShieldCheck, Sparkles, Sprout } from 'lucide-react';
import { Language } from '../../types';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen w-full bg-[#06180E] bg-radial-gradient text-white flex flex-col justify-between relative overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Ambient background glowing circles inspired by TreeForge */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
      <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-forest-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] bg-emerald-700/15 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} 
      />

      {/* Top Navbar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <Logo size="md" showTagline={false} />

        {/* Language Selector Pill */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
          <div className="px-2 text-emerald-400">
            <Globe className="w-4 h-4" />
          </div>
          {(['en', 'hi', 'kn'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                language === lang
                  ? 'bg-gradient-to-r from-emerald-500 to-primaryGreen text-white shadow-md shadow-emerald-950/40'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'ಕನ್ನಡ'}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-2">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Column: Brand & Agriculture Imagery (visible on desktop) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 text-left pr-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold backdrop-blur-md w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Agriculture PWA</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
                Smart Farming. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-200">
                  Smarter Living.
                </span>
              </h1>
              <p className="text-sm xl:text-base text-emerald-100/80 leading-relaxed">
                {t('authSupportingText')}
              </p>
            </div>

            {/* Feature Highlights Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Local Offline Storage</h4>
                  <p className="text-xs text-gray-400">All farm telemetry persists privately on your device.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-300 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Multi-User Separation</h4>
                  <p className="text-xs text-gray-400">Separate accounts for multiple farms and cultivators.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Container Card with Glassmorphism */}
          <div className="lg:col-span-7 w-full flex justify-center">
            <div className="w-full max-w-lg bg-gradient-to-b from-[#113520]/80 to-[#0B2215]/90 backdrop-blur-2xl rounded-3xl border border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 sm:p-9 relative overflow-hidden">
              {/* Subtle top card glow line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 text-center">
        <p className="text-xs text-emerald-200/50 max-w-2xl mx-auto">
          {t('localDemoAuthNotice')}
        </p>
      </footer>
    </div>
  );
};

