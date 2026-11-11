import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Farm } from '../../types';
import { X, Sprout, MapPin, User, Ruler } from 'lucide-react';

interface FarmRegistrationModalProps {
  farm?: Farm | null;
  onSave: (farm: Farm) => void;
  onClose: () => void;
}

export const FarmRegistrationModal: React.FC<FarmRegistrationModalProps> = ({
  farm,
  onSave,
  onClose,
}) => {
  const { t } = useLanguage();

  const [name, setName] = useState(farm?.name || '');
  const [ownerName, setOwnerName] = useState(farm?.ownerName || 'Ramesh Patel');
  const [location, setLocation] = useState(farm?.location || 'Mandya, Karnataka');
  const [totalArea, setTotalArea] = useState<number>(farm?.totalArea || 5.0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: Farm = {
      id: farm?.id || `farm-${Date.now()}`,
      name: name.trim(),
      ownerName: ownerName.trim(),
      location: location.trim(),
      totalArea: Number(totalArea) || 1,
      createdAt: farm?.createdAt || new Date().toISOString(),
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10251F] rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-[#244D3F] text-[#F4F8F5] animate-scale-in">
        <div className="flex items-center justify-between pb-3 border-b border-[#244D3F]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2E8B57] to-[#1F6B41] flex items-center justify-center text-white border border-[#64D995]/40 shadow-md">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#F4F8F5]">
                {farm ? t('edit') : t('addNewFarm')}
              </h3>
              <p className="text-xs text-[#A9BDB1] font-medium">
                {t('farmsSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#A9BDB1] hover:text-[#F4F8F5] hover:bg-[#17332A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
              {t('farmName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Kaveri Organic Estate"
              className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
              {t('farmerName')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                placeholder="Farmer Full Name"
                className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
              />
              <User className="w-4 h-4 text-[#A9BDB1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('location')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="Village, District"
                  className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
                />
                <MapPin className="w-4 h-4 text-[#A9BDB1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
                {t('totalArea')} ({t('acres')})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={totalArea}
                  onChange={(e) => setTotalArea(parseFloat(e.target.value))}
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5]"
                />
                <Ruler className="w-4 h-4 text-[#A9BDB1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-sm shadow-lg shadow-[#2E8B57]/30 active:scale-95 transition-all cursor-pointer"
            >
              {t('save')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#A9BDB1] hover:text-[#F4F8F5] font-semibold text-sm cursor-pointer transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
