import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { DailyActivity } from '../../types';
import { Clock, CheckCircle2, ArrowRight, Calendar } from 'lucide-react';

interface NextScheduleCardProps {
  activities: DailyActivity[];
  onToggleStatus: (activity: DailyActivity) => void;
  onViewAllSchedule: () => void;
}

export const NextScheduleCard: React.FC<NextScheduleCardProps> = ({
  activities,
  onToggleStatus,
  onViewAllSchedule,
}) => {
  const { t } = useLanguage();

  // Find the next upcoming activity
  const nextActivity =
    activities.find((a) => a.status === 'upcoming') || activities[0];

  const completedCount = activities.filter((a) => a.status === 'completed').length;
  const totalCount = activities.length;

  if (!nextActivity) return null;

  return (
    <div className="bg-gradient-to-br from-[#10251F] via-[#17332A] to-[#10251F] rounded-3xl p-6 text-[#F4F8F5] shadow-xl border border-[#244D3F] relative overflow-hidden group">
      {/* Decorative ambient glow */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-[#2E8B57]/15 blur-2xl pointer-events-none" />
      <div className="absolute right-4 top-4 opacity-5 pointer-events-none text-[#64D995]">
        <Calendar className="w-32 h-32" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#F4B740] text-[#0B1713] flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5" />
              {t('nextUpcomingActivity')}
            </span>
            <span className="text-xs text-[#A9BDB1] font-semibold">
              {completedCount} / {totalCount} {t('taskCompleted')}
            </span>
          </div>

          <button
            onClick={onViewAllSchedule}
            className="text-xs font-bold text-[#64D995] hover:text-[#A9BDB1] flex items-center gap-1 transition-colors group cursor-pointer"
          >
            <span>{t('scheduleTitle')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-black text-[#F4B740] tracking-tight">
                {nextActivity.time}
              </span>
              <span className="text-sm px-2.5 py-0.5 rounded-lg bg-[#10251F] text-[#64D995] font-semibold border border-[#244D3F]">
                {nextActivity.category === 'monitoring'
                  ? t('taskCategoryMonitoring')
                  : nextActivity.category === 'irrigation'
                  ? t('taskCategoryIrrigation')
                  : nextActivity.category === 'weather'
                  ? t('taskCategoryWeather')
                  : t('taskCategoryFieldwork')}
              </span>
            </div>

            <h4 className="text-lg sm:text-xl font-extrabold text-[#F4F8F5] mt-1.5 leading-snug">
              {nextActivity.title}
            </h4>
            <p className="text-xs text-[#A9BDB1] mt-1 max-w-xl">
              {nextActivity.description}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggleStatus(nextActivity)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#2E8B57]/25 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{t('markDone')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
