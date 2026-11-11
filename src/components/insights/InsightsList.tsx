import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Recommendation } from '../../types';
import {
  Lightbulb,
  Droplets,
  CloudRain,
  Thermometer,
  Radio,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface InsightsListProps {
  recommendations: Recommendation[];
  onNavigateTab: (tab: string) => void;
}

export const InsightsList: React.FC<InsightsListProps> = ({
  recommendations,
  onNavigateTab,
}) => {
  const { t, language } = useLanguage();

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'moisture':
        return <Droplets className="w-5 h-5 text-[#64D995]" />;
      case 'irrigation':
        return <Droplets className="w-5 h-5 text-sky-400" />;
      case 'weather':
        return <CloudRain className="w-5 h-5 text-indigo-400" />;
      case 'temperature':
        return <Thermometer className="w-5 h-5 text-[#F4B740]" />;
      case 'sensor':
        return <Radio className="w-5 h-5 text-[#E45B5B]" />;
      default:
        return <Lightbulb className="w-5 h-5 text-[#F4B740]" />;
    }
  };

  const getSeverityBadge = (sev: Recommendation['severity']) => {
    switch (sev) {
      case 'healthy':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#1D4033] text-[#64D995] border border-[#244D3F]">
            {t('statusHealthy')}
          </span>
        );
      case 'warning':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F4B740]/15 text-[#F4B740] border border-[#F4B740]/30">
            {t('statusWarning')}
          </span>
        );
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#E45B5B]/15 text-[#E45B5B] border border-[#E45B5B]/30">
            {t('statusCritical')}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-500/15 text-sky-400 border border-sky-500/30">
            Advisory
          </span>
        );
    }
  };

  const handleAction = (rec: Recommendation) => {
    if (rec.type === 'moisture') {
      onNavigateTab('analytics');
    } else if (rec.type === 'irrigation') {
      onNavigateTab('irrigation');
    } else if (rec.type === 'weather') {
      onNavigateTab('weather');
    } else if (rec.type === 'sensor') {
      onNavigateTab('sensors');
    } else {
      onNavigateTab('dashboard');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#F4F8F5] flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-[#64D995]" />
          <span>{t('insightsTitle')}</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#A9BDB1] font-medium mt-0.5">
          {t('insightsSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.length === 0 ? (
          <div className="col-span-2 bg-[#17332A] rounded-3xl p-8 text-center border border-[#244D3F]">
            <CheckCircle2 className="w-12 h-12 text-[#64D995] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#A9BDB1]">{t('noInsights')}</p>
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-[#17332A] rounded-3xl p-5 sm:p-6 shadow-xl border border-[#244D3F] hover:border-[#64D995]/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#10251F] border border-[#244D3F] flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(rec.type)}
                    </div>
                    <h4 className="font-extrabold text-sm sm:text-base text-[#F4F8F5]">
                      {rec.title}
                    </h4>
                  </div>
                  {getSeverityBadge(rec.severity)}
                </div>

                <p className="text-xs sm:text-sm text-[#A9BDB1] font-medium leading-relaxed mt-2">
                  {rec.message}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#244D3F]/70 flex items-center justify-between">
                <span className="text-[11px] text-[#A9BDB1] font-semibold">
                  Local smart rule insight
                </span>

                <button
                  onClick={() => handleAction(rec)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <span>{rec.actionText || t('recommendationAction')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F4B740]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
