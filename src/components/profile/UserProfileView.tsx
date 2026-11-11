import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Farm, Language, FarmerDesignation } from '../../types';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Calendar,
  Lock,
  LogOut,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Sprout,
  ShieldCheck,
  Eye,
  EyeOff,
  X,
  Sparkles,
} from 'lucide-react';

interface UserProfileViewProps {
  farms: Farm[];
  onOpenFarmDetails?: (farm: Farm) => void;
}

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

export const UserProfileView: React.FC<UserProfileViewProps> = ({ farms, onOpenFarmDetails }) => {
  const { currentUser, updateProfile, changePassword, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  // Edit Profile Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser?.fullName || '');
  const [editMobile, setEditMobile] = useState(currentUser?.mobileNumber || '');
  const [editState, setEditState] = useState(currentUser?.state || '');
  const [editDistrict, setEditDistrict] = useState(currentUser?.district || '');
  const [editDesignation, setEditDesignation] = useState(currentUser?.designation || 'Farm Owner & Manager');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatarUrl || '🌾');

  // Change Password Modal
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // Logout Confirm Modal
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Status feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    await updateProfile({
      fullName: editName.trim(),
      mobileNumber: editMobile.trim(),
      state: editState.trim(),
      district: editDistrict.trim(),
      designation: editDesignation,
      avatarUrl: editAvatar,
    });
    setEditModalOpen(false);
    showToast(t('profileUpdated'));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);

    if (newPwd !== confirmPwd) {
      setPwdError('Passwords do not match.');
      return;
    }

    const res = await changePassword(currentPwd, newPwd);
    if (!res.success) {
      setPwdError(res.error || 'Failed to update password.');
    } else {
      setPwdModalOpen(false);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      showToast(t('passwordUpdated'));
    }
  };

  const handleLanguageChange = async (newLang: Language) => {
    setLanguage(newLang);
    if (currentUser) {
      await updateProfile({ preferredLanguage: newLang });
    }
  };

  if (!currentUser) {
    return null;
  }

  const createdDateFormatted = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Registered Member';

  const lastLoginFormatted = currentUser.lastLoginAt
    ? new Date(currentUser.lastLoginAt).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Active Now';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#10251F] border border-[#64D995]/50 text-[#F4F8F5] text-xs font-bold rounded-2xl shadow-2xl shadow-black/60 animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-[#64D995]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Header Hero Card - Dark Green Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10251F] via-[#17332A] to-[#0B1713] border border-[#244D3F] shadow-2xl p-6 sm:p-8 text-[#F4F8F5]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2E8B57]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar Badge */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0B1713]/80 border-2 border-[#64D995]/40 flex items-center justify-center text-4xl shadow-inner">
                {currentUser.avatarUrl || '🌾'}
              </div>
              <button
                onClick={() => {
                  setEditAvatar(currentUser.avatarUrl || '🌾');
                  setEditModalOpen(true);
                }}
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] text-white shadow-md hover:scale-105 transition-transform border border-[#64D995]/40"
                title="Change Avatar"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* User Info */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F8F5]">
                  {currentUser.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#2E8B57]/20 text-[#64D995] text-xs font-bold border border-[#2E8B57]/40">
                  {currentUser.designation || 'Farm Owner & Manager'}
                </span>
              </div>
              <p className="text-sm text-[#A9BDB1] font-mono">
                {currentUser.email}
              </p>
              <div className="flex items-center gap-2 text-xs text-[#A9BDB1] pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#64D995]" />
                <span>
                  {currentUser.district}, {currentUser.state}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => {
                setEditName(currentUser.fullName);
                setEditMobile(currentUser.mobileNumber);
                setEditState(currentUser.state);
                setEditDistrict(currentUser.district);
                setEditDesignation(currentUser.designation || 'Farm Owner & Manager');
                setEditAvatar(currentUser.avatarUrl || '🌾');
                setEditModalOpen(true);
              }}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-[#10251F]/90 hover:bg-[#1D4033] border border-[#244D3F] hover:border-[#64D995]/40 text-xs font-bold text-[#F4F8F5] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Edit3 className="w-4 h-4 text-[#64D995]" />
              <span>{t('editProfile')}</span>
            </button>

            <button
              onClick={() => setPwdModalOpen(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-[#10251F]/90 hover:bg-[#1D4033] border border-[#244D3F] hover:border-[#64D995]/40 text-xs font-bold text-[#F4F8F5] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Lock className="w-4 h-4 text-[#64D995]" />
              <span>{t('changePassword')}</span>
            </button>

            <button
              onClick={() => setLogoutConfirmOpen(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-[#E45B5B]/15 hover:bg-[#E45B5B]/25 border border-[#E45B5B]/30 text-xs font-bold text-[#E45B5B] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <LogOut className="w-4 h-4 text-[#E45B5B]" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>

        {/* Quick Account Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#244D3F]">
          <div className="p-3 rounded-2xl bg-[#0B1713]/60 border border-[#244D3F]">
            <span className="text-[11px] text-[#A9BDB1] uppercase font-semibold">
              {t('fieldCount')}
            </span>
            <p className="text-xl font-bold text-[#64D995] mt-0.5">
              {farms.length} {t('farmsTitle')}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-[#0B1713]/60 border border-[#244D3F]">
            <span className="text-[11px] text-[#A9BDB1] uppercase font-semibold">
              {t('mobileNumber')}
            </span>
            <p className="text-xs font-bold text-[#F4F8F5] mt-1">
              +91 {currentUser.mobileNumber}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-[#0B1713]/60 border border-[#244D3F]">
            <span className="text-[11px] text-[#A9BDB1] uppercase font-semibold">
              {t('accountCreated')}
            </span>
            <p className="text-xs font-bold text-[#F4F8F5] mt-1">
              {createdDateFormatted}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-[#0B1713]/60 border border-[#244D3F]">
            <span className="text-[11px] text-[#A9BDB1] uppercase font-semibold">
              {t('lastLogin')}
            </span>
            <p className="text-xs font-bold text-[#64D995] mt-1 truncate">
              {lastLoginFormatted}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Details & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Language & Local Security Info */}
        <div className="space-y-6 lg:col-span-1">
          {/* Preferred Language Card */}
          <div className="p-6 rounded-3xl bg-[#17332A] border border-[#244D3F] shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#64D995]" />
              <h3 className="text-base font-bold text-[#F4F8F5]">
                {t('preferredLanguage')}
              </h3>
            </div>
            <p className="text-xs text-[#A9BDB1]">
              Change the interface and Survam AI voice guidance language.
            </p>
            <div className="space-y-2">
              {[
                { id: 'en', label: 'English', desc: 'Default agricultural terms' },
                { id: 'hi', label: 'हिंदी', desc: 'सरल हिंदी भाषा' },
                { id: 'kn', label: 'ಕನ್ನಡ', desc: 'ರೈತಸ್ನೇಹಿ ಕನ್ನಡ' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleLanguageChange(item.id as Language)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    language === item.id
                      ? 'bg-[#1D4033] border-[#64D995] text-[#F4F8F5] shadow-md'
                      : 'bg-[#10251F] border-[#244D3F] hover:bg-[#1D4033]/50 text-[#A9BDB1]'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-[#F4F8F5]">{item.label}</p>
                    <p className="text-[11px] text-[#A9BDB1]">{item.desc}</p>
                  </div>
                  {language === item.id && (
                    <CheckCircle2 className="w-4 h-4 text-[#64D995]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Local Security & Architecture Card */}
          <div className="p-5 rounded-3xl bg-[#10251F] text-[#F4F8F5] space-y-3 shadow-lg border border-[#244D3F]">
            <div className="flex items-center gap-2 text-[#64D995]">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="text-sm font-bold">Local Data Guarantee</h4>
            </div>
            <p className="text-xs text-[#A9BDB1] leading-relaxed">
              Your farm records, plots, and credentials stay entirely inside your device’s local IndexedDB. Passwords are cryptographically transformed with Web Crypto API SHA-256 before local saving.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#64D995]/80">
              Device User ID: {currentUser.id}
            </div>
          </div>
        </div>

        {/* Right Column: User's Registered Farms */}
        <div className="space-y-6 lg:col-span-2">
          <div className="p-6 rounded-3xl bg-[#17332A] border border-[#244D3F] shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#64D995]" />
                <h3 className="text-base font-bold text-[#F4F8F5]">
                  {t('farmsTitle')} ({farms.length})
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#A9BDB1]">
                Associated with your account
              </span>
            </div>

            {farms.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm text-[#A9BDB1]">{t('noFarmsYet')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {farms.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-2xl bg-[#10251F] border border-[#244D3F] hover:border-[#64D995]/40 space-y-2 transition-colors cursor-pointer"
                    onClick={() => onOpenFarmDetails?.(f)}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-[#F4F8F5] text-sm">
                        {f.name || f.farmName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-[#1D4033] text-[#64D995] text-[11px] font-bold border border-[#244D3F]">
                        {f.totalArea} {f.areaUnit || 'Acres'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#A9BDB1]">
                      <MapPin className="w-3 h-3 text-[#64D995] flex-shrink-0" />
                      <span className="truncate">{f.location || f.village || 'Local Farm'}</span>
                    </div>
                    {f.contactNumber && (
                      <p className="text-[11px] text-[#A9BDB1]/70">
                        Contact: {f.contactNumber}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10251F] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#244D3F] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#244D3F]">
              <h3 className="text-lg font-bold text-[#F4F8F5]">
                {t('editProfile')}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-xl text-[#A9BDB1] hover:text-[#F4F8F5] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] uppercase mb-1.5">
                  {t('chooseAvatar')}
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      type="button"
                      key={av.id}
                      onClick={() => setEditAvatar(av.icon)}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                        editAvatar === av.icon
                          ? 'bg-[#1D4033] border-2 border-[#64D995] scale-105'
                          : 'bg-[#0B1713]/80 border border-[#244D3F] hover:border-[#64D995]/50'
                      }`}
                      title={av.label}
                    >
                      <span>{av.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] uppercase mb-1">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#244D3F] bg-[#0B1713]/80 text-[#F4F8F5] text-sm focus:outline-none focus:border-[#64D995]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#A9BDB1] uppercase mb-1">
                    {t('mobileNumber')}
                  </label>
                  <input
                    type="tel"
                    required
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#244D3F] bg-[#0B1713]/80 text-[#F4F8F5] text-sm focus:outline-none focus:border-[#64D995]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A9BDB1] uppercase mb-1">
                    {t('farmerDesignation')}
                  </label>
                  <select
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#244D3F] text-xs font-semibold focus:outline-none focus:border-[#64D995] bg-[#0B1713] text-[#F4F8F5]"
                  >
                    {DESIGNATIONS.map((d) => (
                      <option key={d} value={d} className="bg-[#10251F] text-[#F4F8F5]">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#A9BDB1] uppercase mb-1">
                    {t('district')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#244D3F] bg-[#0B1713]/80 text-[#F4F8F5] text-sm focus:outline-none focus:border-[#64D995]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#A9BDB1] uppercase mb-1">
                    {t('state')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#244D3F] bg-[#0B1713]/80 text-[#F4F8F5] text-sm focus:outline-none focus:border-[#64D995]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#244D3F]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] text-xs font-bold cursor-pointer transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white text-xs font-bold cursor-pointer shadow-lg shadow-[#2E8B57]/30 transition-all"
                >
                  {t('saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {pwdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10251F] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#244D3F] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#244D3F]">
              <h3 className="text-lg font-bold text-[#F4F8F5]">
                {t('changePassword')}
              </h3>
              <button
                onClick={() => setPwdModalOpen(false)}
                className="p-1 rounded-xl text-[#A9BDB1] hover:text-[#F4F8F5] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pwdError && (
              <div className="p-3 rounded-xl bg-[#E45B5B]/15 border border-[#E45B5B]/30 text-[#E45B5B] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] uppercase mb-1">
                  {t('currentPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder={t('currentPasswordPlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#244D3F] bg-[#0B1713]/80 text-[#F4F8F5] text-sm focus:outline-none focus:border-[#64D995] placeholder-[#A9BDB1]/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A9BDB1] hover:text-[#F4F8F5]"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] uppercase mb-1">
                  {t('newPassword')}
                </label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#244D3F] bg-[#0B1713]/80 text-[#F4F8F5] text-sm focus:outline-none focus:border-[#64D995] placeholder-[#A9BDB1]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A9BDB1] uppercase mb-1">
                  {t('confirmPassword')}
                </label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#244D3F] bg-[#0B1713]/80 text-[#F4F8F5] text-sm focus:outline-none focus:border-[#64D995] placeholder-[#A9BDB1]/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#244D3F]">
                <button
                  type="button"
                  onClick={() => setPwdModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] text-xs font-bold cursor-pointer transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white text-xs font-bold cursor-pointer shadow-lg shadow-[#2E8B57]/30 transition-all"
                >
                  {t('updatePasswordBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10251F] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#244D3F] text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E45B5B]/15 border border-[#E45B5B]/30 text-[#E45B5B] flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#F4F8F5]">
                {t('confirmLogout')}
              </h3>
              <p className="text-xs text-[#A9BDB1]">
                {t('logoutDesc')}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setLogoutConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] text-xs font-bold cursor-pointer transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  setLogoutConfirmOpen(false);
                  logout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold cursor-pointer shadow-lg shadow-red-900/30 transition-all"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
