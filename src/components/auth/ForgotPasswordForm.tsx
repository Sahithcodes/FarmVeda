import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { validatePasswordRequirements } from '../../utils/crypto';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const ForgotPasswordForm: React.FC = () => {
  const { t } = useLanguage();
  const { resetPasswordDemo, setAuthScreen } = useAuth();

  const [step, setStep] = useState<1 | 2>(1); // Step 1: Account identification, Step 2: New password
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pwdValidation = validatePasswordRequirements(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleVerifyAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!identifier.trim()) {
      setErrorMessage(t('emailOrMobilePlaceholder'));
      return;
    }
    // Proceed to Step 2
    setStep(2);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!pwdValidation.isValid) {
      setErrorMessage(t('passwordRequirements'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordDemo(identifier, newPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to reset password.');
        if (res.error?.includes('No account')) {
          setStep(1); // send back to verify account
        }
      } else {
        setSuccessMessage(t('passwordResetSuccess'));
        setTimeout(() => {
          setAuthScreen('login');
        }, 1800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => setAuthScreen('login')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t('backToLogin')}</span>
      </button>

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('forgotPasswordTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-emerald-300 font-semibold">
          {t('forgotPasswordSubtitle')}
        </p>
      </div>

      {/* Demonstration notice callout */}
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200/90 text-xs leading-relaxed space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-emerald-300">
          <ShieldCheck className="w-4 h-4" />
          <span>Local Demonstration Flow</span>
        </div>
        <p className="text-[11px] text-gray-300">
          {t('forgotPasswordNotice')}
        </p>
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

      {/* Step 1: Identifier */}
      {step === 1 && (
        <form onSubmit={handleVerifyAccount} className="space-y-4">
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
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t('emailOrMobilePlaceholder')}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white/5 border border-emerald-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>
            <p className="text-[11px] text-gray-400">
              {t('enterRegisteredAccount')}
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-primaryGreen to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/70 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('verifyAccountBtn')}</span>
          </button>
        </form>
      )}

      {/* Step 2: New Password */}
      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-emerald-300 flex items-center justify-between">
            <span className="text-gray-400">Account:</span>
            <span className="font-bold">{identifier}</span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider">
              {t('setNewPassword')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400/70">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('newPasswordPlaceholder')}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/5 border border-emerald-500/30 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-emerald-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-emerald-100 uppercase tracking-wider">
              {t('confirmPassword')}
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
                placeholder={t('confirmNewPasswordPlaceholder')}
                className={`w-full pl-10 pr-10 py-3 rounded-2xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none ${
                  confirmPassword && passwordsMatch
                    ? 'border-emerald-400'
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

          {/* Password Strength Checklist */}
          {newPassword.length > 0 && (
            <div className="p-3 rounded-2xl bg-white/5 border border-emerald-500/20 space-y-2 text-xs">
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-300 ${
                    pwdValidation.score <= 1
                      ? 'w-1/4 bg-red-500'
                      : pwdValidation.score === 2
                      ? 'w-2/4 bg-amber-500'
                      : 'w-full bg-emerald-400'
                  }`}
                />
              </div>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <span className={pwdValidation.hasMinLength ? 'text-emerald-400' : 'text-gray-400'}>
                  ✓ 8+ Chars
                </span>
                <span className={pwdValidation.hasUpperCase ? 'text-emerald-400' : 'text-gray-400'}>
                  ✓ 1 Uppercase
                </span>
                <span className={pwdValidation.hasNumber ? 'text-emerald-400' : 'text-gray-400'}>
                  ✓ 1 Number
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-3.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-primaryGreen to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/70 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('resettingPassword')}</span>
                </div>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{t('resetPasswordBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

