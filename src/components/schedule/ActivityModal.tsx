import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { DailyActivity } from '../../types';
import { X, Clock, Calendar } from 'lucide-react';

interface ActivityModalProps {
  activity?: DailyActivity | null;
  farmId: string;
  onSave: (activity: DailyActivity) => void;
  onClose: () => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  activity,
  farmId,
  onSave,
  onClose,
}) => {
  const { t } = useLanguage();

  const [time, setTime] = useState(activity?.time || '08:00 AM');
  const [title, setTitle] = useState(activity?.title || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [category, setCategory] = useState<DailyActivity['category']>(
    activity?.category || 'monitoring'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Convert display time (e.g., 08:00 AM) to 24h format for sorting
    const parsed24 = convertTo24h(time);

    const updated: DailyActivity = {
      id: activity?.id || `act-${Date.now()}`,
      farmId,
      time,
      time24: parsed24,
      title: title.trim(),
      description: description.trim(),
      status: activity?.status || 'upcoming',
      category,
    };

    onSave(updated);
  };

  const convertTo24h = (timeStr: string): string => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '12:00';
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const modifier = match[3].toUpperCase();
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10251F] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#244D3F] text-[#F4F8F5] animate-scale-in">
        <div className="flex items-center justify-between pb-3 border-b border-[#244D3F]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2E8B57] to-[#1F6B41] text-white flex items-center justify-center border border-[#64D995]/40 shadow-md">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-extrabold text-base text-[#F4F8F5]">
              {activity ? t('edit') : t('addNewTask')}
            </h3>
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
              {t('activityTime')} (e.g. 06:30 AM)
            </label>
            <div className="relative">
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                placeholder="06:00 AM"
                className="w-full px-4 py-2.5 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5]"
              />
              <Clock className="w-4 h-4 text-[#A9BDB1] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
              {t('activityTitle')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Inspect Drip Line Valves"
              className="w-full px-4 py-2.5 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
              {t('activityCategory')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#10251F] text-[#F4F8F5] cursor-pointer"
            >
              <option value="monitoring" className="bg-[#10251F] text-[#F4F8F5]">{t('taskCategoryMonitoring')}</option>
              <option value="irrigation" className="bg-[#10251F] text-[#F4F8F5]">{t('taskCategoryIrrigation')}</option>
              <option value="weather" className="bg-[#10251F] text-[#F4F8F5]">{t('taskCategoryWeather')}</option>
              <option value="fieldwork" className="bg-[#10251F] text-[#F4F8F5]">{t('taskCategoryFieldwork')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A9BDB1] mb-1">
              {t('fieldDescription')}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details, instructions, or plot number..."
              className="w-full px-4 py-2.5 rounded-2xl border border-[#244D3F] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5]"
            />
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
