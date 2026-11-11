import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { DailyActivity } from '../../types';
import { ActivityModal } from './ActivityModal';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  BellRing,
} from 'lucide-react';

interface ScheduleTimelineProps {
  activities: DailyActivity[];
  farmId: string;
  onUpdateActivity: (activity: DailyActivity) => void;
  onAddActivity: (activity: DailyActivity) => void;
  onDeleteActivity: (id: string) => void;
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  activities,
  farmId,
  onUpdateActivity,
  onAddActivity,
  onDeleteActivity,
}) => {
  const { t, language } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<DailyActivity | null>(null);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  const handleToggleStatus = (activity: DailyActivity) => {
    let nextStatus: DailyActivity['status'] = 'completed';
    if (activity.status === 'completed') {
      nextStatus = 'upcoming';
    } else if (activity.status === 'upcoming') {
      nextStatus = 'completed';
    } else {
      nextStatus = 'completed';
    }
    onUpdateActivity({ ...activity, status: nextStatus });
  };

  const handleSetReminder = (activity: DailyActivity, e: React.MouseEvent) => {
    e.stopPropagation();
    const msg =
      language === 'hi'
        ? `स्मरणपत्र सेट: ${activity.time} पर ${activity.title} के लिए सूचना प्राप्त होगी।`
        : language === 'kn'
        ? `ಜ್ಞಾಪನೆ ಹೊಂದಿಸಲಾಗಿದೆ: ${activity.time} ಕ್ಕೆ ${activity.title} ಗಾಗಿ ಸೂಚನೆ ಬರುತ್ತದೆ.`
        : `Reminder set: Alert scheduled for ${activity.time} for "${activity.title}".`;
    setReminderMessage(msg);
    setTimeout(() => setReminderMessage(null), 3500);
  };

  const nextActivity = activities.find((a) => a.status === 'upcoming');

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#F4F8F5] flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#64D995]" />
            <span>{t('scheduleTitle')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#A9BDB1] font-medium mt-0.5">
            {t('scheduleSubtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingActivity(null);
            setModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-[#2E8B57]/30 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#F4B740]" />
          <span>{t('addNewTask')}</span>
        </button>
      </div>

      {/* Reminder notification toast if active */}
      {reminderMessage && (
        <div className="p-3 bg-[#1D4033] border border-[#244D3F] rounded-2xl text-xs font-bold text-[#64D995] flex items-center gap-2 animate-fade-in shadow-xs">
          <BellRing className="w-4 h-4 text-[#F4B740] flex-shrink-0 animate-bounce" />
          <span>{reminderMessage}</span>
        </div>
      )}

      {/* Timeline Container */}
      <div className="bg-[#17332A] rounded-3xl p-5 sm:p-6 shadow-xl border border-[#244D3F]">
        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#244D3F]">
          {activities.map((activity) => {
            const isCompleted = activity.status === 'completed';
            const isUpcoming = activity.status === 'upcoming';
            const isMissed = activity.status === 'missed';
            const isNext = nextActivity?.id === activity.id;

            return (
              <div
                key={activity.id}
                className={`relative group transition-all ${
                  isNext ? 'scale-[1.01]' : ''
                }`}
              >
                {/* Timeline node icon */}
                <button
                  onClick={() => handleToggleStatus(activity)}
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer ${
                    isCompleted
                      ? 'bg-[#2E8B57] text-white ring-2 ring-[#64D995]/50'
                      : isMissed
                      ? 'bg-[#E45B5B] text-white ring-2 ring-[#E45B5B]/50'
                      : isNext
                      ? 'bg-[#F4B740] text-[#0B1713] ring-4 ring-[#F4B740]/30'
                      : 'bg-[#10251F] text-[#A9BDB1] border border-[#244D3F] hover:bg-[#1D4033]'
                  }`}
                  title={isCompleted ? t('undoDone') : t('markDone')}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  ) : isMissed ? (
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </button>

                {/* Timeline Card */}
                <div
                  className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                    isNext
                      ? 'bg-[#1D4033] border-[#64D995] shadow-lg shadow-[#2E8B57]/20'
                      : isCompleted
                      ? 'bg-[#10251F]/70 border-[#244D3F]/60 opacity-80'
                      : isMissed
                      ? 'bg-[#E45B5B]/10 border-[#E45B5B]/30'
                      : 'bg-[#10251F] border-[#244D3F] hover:border-[#64D995]/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-[#F4F8F5] tracking-tight">
                          {activity.time}
                        </span>

                        {isNext && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#F4B740] text-[#0B1713] shadow-xs">
                            {t('nextUpcomingActivity')}
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isCompleted
                              ? 'bg-[#1D4033] text-[#64D995] border-[#244D3F]'
                              : isMissed
                              ? 'bg-[#E45B5B]/15 text-[#E45B5B] border-[#E45B5B]/30'
                              : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                          }`}
                        >
                          {isCompleted
                            ? t('taskCompleted')
                            : isMissed
                            ? t('taskMissed')
                            : t('taskUpcoming')}
                        </span>
                      </div>

                      <h4
                        className={`text-sm sm:text-base font-extrabold text-[#F4F8F5] mt-1 ${
                          isCompleted ? 'line-through text-[#A9BDB1]/60' : ''
                        }`}
                      >
                        {activity.title}
                      </h4>

                      <p className="text-xs text-[#A9BDB1] mt-0.5">
                        {activity.description}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center mt-2 sm:mt-0 flex-shrink-0">
                      {/* Mark Done/Undo */}
                      <button
                        onClick={() => handleToggleStatus(activity)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-[#10251F] text-[#A9BDB1] border border-[#244D3F] hover:bg-[#1D4033]'
                            : 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] text-white hover:from-[#359d63] hover:to-[#247c4b] shadow-sm'
                        }`}
                      >
                        {isCompleted ? t('undoDone') : t('markDone')}
                      </button>

                      {/* Reminder */}
                      {!isCompleted && (
                        <button
                          onClick={(e) => handleSetReminder(activity, e)}
                          className="p-1.5 rounded-xl text-[#A9BDB1] hover:bg-[#1D4033] hover:text-[#F4F8F5] transition-colors cursor-pointer"
                          title="Set In-App Reminder"
                        >
                          <BellRing className="w-4 h-4 text-[#F4B740]" />
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditingActivity(activity);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl text-[#A9BDB1] hover:bg-[#1D4033] hover:text-[#F4F8F5] transition-colors cursor-pointer"
                        title={t('edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteActivity(activity.id)}
                        className="p-1.5 rounded-xl text-[#A9BDB1] hover:bg-[#E45B5B]/20 hover:text-[#E45B5B] transition-colors cursor-pointer"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalOpen && (
        <ActivityModal
          activity={editingActivity}
          farmId={farmId}
          onSave={(act) => {
            if (editingActivity) {
              onUpdateActivity(act);
            } else {
              onAddActivity(act);
            }
            setModalOpen(false);
          }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
