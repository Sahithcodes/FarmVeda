import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const LoginForm: React.FC = () => {
  const { t } = useLanguage();
  const { login, setAuthScreen } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setErrorMessage(t('emailOrMobilePlaceholder'));
      return;
    }
    if (!password) {
      setErrorMessage(t('passwordPlaceholder'));
      return;
    }

    setLoading(true);
    try {
      const res = await login(identifier, password, rememberMe);
      if (!res.success) {
        setErrorMessage(res.error || 'Login failed. Please verify credentials.');
      } else {
        setSuccessMessage('Welcome to FarmVeda! Launching your farm dashboard...');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo account auto-fill
  const fillDemoAccount = () => {
    setIdentifier(apiClient.configured ? 'demo@farmveda.com' : 'farmer@farmveda.in');
    setPassword(apiClient.configured ? 'FarmVedaDemo@2026' : 'FarmVeda@2026');
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('loginTitle')}
        </h2>
        <p className="text-sm text-emerald-200/70">
          {t('loginSubtitle')}
        </p>
      </div>

      {/* Quick Demo Pill Helper */}
      <div
        onClick={fillDemoAccount}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') fillDemoAccount();
        }}
        className="group flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-emerald-500/20 transition-all cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-emerald-300">
              {t('useDemoAccount')}
            </p>
            <p className="text-[11px] text-gray-300 font-mono">
              {apiClient.configured ? 'demo@farmveda.com / FarmVedaDemo@2026' : 'farmer@farmveda.in / FarmVeda@2026'}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-400 group-hover:underline">
          Auto Fill
        </span>
      </div>

      {/* Error / Success Feedback */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identifier Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider">
            {t('emailOrMobile')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/70">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t('emailOrMobilePlaceholder')}
              autoComplete="username"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white/5 border border-emerald-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider">
              {t('password')}
            </label>
            <button
              type="button"
              onClick={() => setAuthScreen('forgot_password')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {t('forgotPassword')}
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/70">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
              autoComplete="current-password"
              className="w-full pl-10 pr-11 py-3.5 rounded-2xl bg-white/5 border border-emerald-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-emerald-300 transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-primaryGreen bg-white/10 border-emerald-500/40 focus:ring-emerald-400 focus:ring-offset-0"
            />
            <span className="text-xs text-gray-300 font-medium">
              {t('rememberMe')}
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-primaryGreen to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/70 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('signingIn')}</span>
            </div>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>{t('signInBtn')}</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign Up */}
      <div className="text-center pt-2 border-t border-emerald-500/15">
        <p className="text-xs text-gray-400">
          {t('noAccountYet')}{' '}
          <button
            type="button"
            onClick={() => setAuthScreen('signup')}
            className="font-bold text-emerald-400 hover:text-emerald-300 underline ml-1 cursor-pointer"
          >
            {t('signUpLink')}
          </button>
        </p>
      </div>
    </div>
  );
};

