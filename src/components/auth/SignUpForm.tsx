import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language, FarmerDesignation } from '../../types';
import { validatePasswordRequirements } from '../../utils/crypto';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Globe,
  Briefcase,
  Check,
  AlertCircle,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'rice-farmer', label: '🌾 Paddy Cultivator', icon: '🌾' },
  { id: 'polyhouse-grower', label: '🍅 Polyhouse Grower', icon: '🍅' },
  { id: 'tractor-specialist', label: '🚜 Mechanized Farming', icon: '🚜' },
  { id: 'organic-grower', label: '🌿 Organic Planter', icon: '🌿' },
  { id: 'smart-tech', label: '📡 Smart Agronomist', icon: '📡' },
  { id: 'orchard-owner', label: '🍎 Orchard Manager', icon: '🍎' },
];

const DESIGNATIONS: FarmerDesignation[] = [
  'Farm Owner & Manager',
  'Smallholder Farmer',
  'Commercial Cultivator',
  'Organic Grower',
  'Agriculturalist / Agronomist',
];

export const SignUpForm: React.FC = () => {
  const { t, language: currentAppLang } = useLanguage();
  const { signup, setAuthScreen } = useAuth();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(currentAppLang);
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('Mandya');
  const [designation, setDesignation] = useState<string>('Farm Owner & Manager');
  const [avatar, setAvatar] = useState('🌾');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real-time password strength validation
  const pwdValidation = validatePasswordRequirements(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!termsAccepted) {
      setErrorMessage(t('agreeTerms'));
      return;
    }

    setLoading(true);
    try {
      const res = await signup({
        fullName,
        email,
        mobileNumber,
        password,
        confirmPassword,
        preferredLanguage,
        state,
        district,
        designation,
        avatarUrl: avatar,
        termsAccepted,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create account.');
      }
      // If success, AuthContext sets currentUser and logs in, redirecting to onboarding
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
      {/* Header */}
      <div className="text-center sm:text-left space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('signUpTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-emerald-200/70">
          {t('signUpSubtitle')}
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider">
            {t('fullName')} *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/70">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('fullNamePlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-emerald-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>
        </div>

        {/* Two-Column Grid: Email & Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider">
              {t('emailAddress')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/70">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white/5 border border-emerald-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider">
              {t('mobileNumber')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/70">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder={t('mobilePlaceholder')}
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white/5 border border-emerald-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>
          </div>
        </div>

        {/* Location: State & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider">
              {t('state')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/70">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State (e.g. Karnataka)"
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white/5 border border-emerald-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider">
              {t('district')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/70">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="District (e.g. Mandya)"
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white/5 border border-emerald-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Farmer Designation & Preferred Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider">
              {t('farmerDesignation')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/70">
                <Briefcase className="w-4 h-4" />
              </div>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#0a2315] border border-emerald-500/30 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
              >
                {DESIGNATIONS.map((desig) => (
                  <option key={desig} value={desig}>
                    {desig}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider">
              {t('preferredLanguage')}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['en', 'hi', 'kn'] as Language[]).map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setPreferredLanguage(lang)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition-all ${
                    preferredLanguage === lang
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'ಕನ್ನಡ'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Avatar Chooser (Optional Visual Selector) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider">
            {t('chooseAvatar')}
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {PRESET_AVATARS.map((av) => (
              <button
                type="button"
                key={av.id}
                onClick={() => setAvatar(av.icon)}
                className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all ${
                  avatar === av.icon
                    ? 'bg-emerald-500/40 border-2 border-emerald-400 scale-105 shadow-md shadow-emerald-950/60'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
                title={av.label}
              >
                <span>{av.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider">
              {t('password')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/70">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars"
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white/5 border border-emerald-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-300"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider">
              {t('confirmPassword')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/70">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPasswordPlaceholder')}
                className={`w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none ${
                  confirmPassword && passwordsMatch
                    ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
                    : confirmPassword && !passwordsMatch
                    ? 'border-red-400'
                    : 'border-emerald-500/30'
                }`}
              />
              {confirmPassword && passwordsMatch && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400 pointer-events-none">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Password Strength Indicators */}
        {password.length > 0 && (
          <div className="p-3 rounded-2xl bg-white/5 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-semibold">{t('passwordStrength')}:</span>
              <span
                className={`font-bold ${
                  pwdValidation.score <= 1
                    ? 'text-red-400'
                    : pwdValidation.score <= 2
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {pwdValidation.strengthLabel}
              </span>
            </div>
            {/* Visual Strength Progress Bar */}
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-300 ${
                  pwdValidation.score <= 1
                    ? 'w-1/4 bg-red-500'
                    : pwdValidation.score === 2
                    ? 'w-2/4 bg-amber-500'
                    : pwdValidation.score === 3
                    ? 'w-3/4 bg-emerald-400'
                    : 'w-full bg-emerald-400'
                }`}
              />
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px]">
              <span
                className={`flex items-center gap-1 ${
                  pwdValidation.hasMinLength ? 'text-emerald-400' : 'text-gray-400'
                }`}
              >
                <Check className="w-3 h-3" /> 8+ Chars
              </span>
              <span
                className={`flex items-center gap-1 ${
                  pwdValidation.hasUpperCase ? 'text-emerald-400' : 'text-gray-400'
                }`}
              >
                <Check className="w-3 h-3" /> 1 Uppercase
              </span>
              <span
                className={`flex items-center gap-1 ${
                  pwdValidation.hasNumber ? 'text-emerald-400' : 'text-gray-400'
                }`}
              >
                <Check className="w-3 h-3" /> 1 Number
              </span>
            </div>
          </div>
        )}

        {/* Terms and Conditions Checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer pt-1 select-none">
          <input
            type="checkbox"
            required
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="w-4 h-4 rounded text-primaryGreen bg-white/10 border-emerald-500/40 focus:ring-emerald-400 mt-0.5"
          />
          <span className="text-xs text-gray-300 leading-snug">
            {t('agreeTerms')}
          </span>
        </label>

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-primaryGreen to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/70 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('creatingAccount')}</span>
            </div>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>{t('createAccountBtn')}</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign In */}
      <div className="text-center pt-2 border-t border-emerald-500/15">
        <p className="text-xs text-gray-400">
          {t('alreadyHaveAccount')}{' '}
          <button
            type="button"
            onClick={() => setAuthScreen('login')}
            className="font-bold text-emerald-400 hover:text-emerald-300 underline ml-1 cursor-pointer"
          >
            {t('loginLink')}
          </button>
        </p>
      </div>
    </div>
  );
};

