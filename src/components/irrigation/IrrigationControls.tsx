import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Field } from '../../types';
import { Droplets, ShieldAlert, Sprout } from 'lucide-react';

interface IrrigationControlsProps {
  field?: Field;
  recommendation?: {
    irrigation_recommended: boolean | null;
    predicted_moisture_percent?: number | null;
    threshold?: number;
    recommended_action: string;
    model_disclaimer?: string;
  };
  backendMode?: boolean;
  schedules?: Array<Record<string, any>>;
  history?: Array<Record<string, any>>;
  status?: Record<string, any>;
}

export const IrrigationControls: React.FC<IrrigationControlsProps> = ({ field, recommendation, backendMode = false, schedules = [], history = [], status }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#F4F8F5] flex items-center gap-2">
          <Droplets className="w-6 h-6 text-[#64D995]" />
          <span>{t('irrigationTitle')}</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#A9BDB1] font-medium mt-0.5">
          {field ? `${field.name} (${field.cropType})` : t('irrigationSubtitle')}
        </p>
      </div>

      <div className="bg-[#F4B740]/15 border border-[#F4B740]/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#F4F8F5]">
        <ShieldAlert className="w-5 h-5 text-[#F4B740] flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold uppercase tracking-wider block text-[#F4B740] mb-0.5">Advisory demo</span>
          <p className="font-medium text-[#A9BDB1] leading-relaxed">
            Recommendations help plan watering. This application does not start, stop, or automate a physical pump.
          </p>
        </div>
      </div>

      <section className="bg-[#17332A] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#244D3F] text-[#F4F8F5]">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#10251F] border border-[#244D3F] text-[#64D995] flex items-center justify-center shrink-0">
            <Sprout className="w-9 h-9" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#64D995]">Crop-aware watering advice</p>
            {recommendation ? (
              <>
                <h3 className="text-xl sm:text-2xl font-black mt-2">{recommendation.recommended_action}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  <div className="bg-[#10251F] rounded-2xl p-4 border border-[#244D3F]">
                    <p className="text-xs font-bold text-[#A9BDB1]">Six-hour moisture estimate</p>
                    <p className="text-2xl font-black text-[#64D995] mt-1">
                      {recommendation.predicted_moisture_percent != null ? `${recommendation.predicted_moisture_percent}%` : 'Not available'}
                    </p>
                  </div>
                  <div className="bg-[#10251F] rounded-2xl p-4 border border-[#244D3F]">
                    <p className="text-xs font-bold text-[#A9BDB1]">Crop moisture threshold</p>
                    <p className="text-2xl font-black text-[#F4B740] mt-1">
                      {recommendation.threshold != null ? `${recommendation.threshold}%` : 'Not available'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#A9BDB1] mt-4 leading-relaxed">
                  {recommendation.model_disclaimer || 'This is an experimental trend estimate, not a trained or real-world validated prediction.'}
                </p>
              </>
            ) : (
              <p className="text-sm text-[#A9BDB1] mt-2">
                A recommendation will appear after this field has backend sensor history. Register a sensor and submit readings, or load the synthetic demo dataset.
              </p>
            )}
          </div>
        </div>
      </section>
      {backendMode && <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F]">
          <h3 className="font-black text-[#F4F8F5]">Irrigation status and schedules</h3>
          <p className="text-xs text-[#A9BDB1] mt-1">Status: {status?.status || 'Unavailable'} · Hardware control: disabled</p>
          {schedules.length ? <ul className="mt-3 space-y-2">{schedules.map((item) => <li key={item.id} className="rounded-xl bg-[#10251F] p-3 text-sm"><span className="font-bold">{item.mode || 'Scheduled irrigation'}</span><span className="text-[#A9BDB1]"> · {item.start_at ? new Date(item.start_at).toLocaleString() : 'Time unavailable'} · {item.duration_minutes ?? '—'} min · {item.status || 'unknown'}</span></li>)}</ul> : <p className="text-sm text-[#A9BDB1] mt-3">No irrigation schedules are recorded for this field.</p>}
        </div>
        <div className="bg-[#17332A] rounded-3xl p-5 border border-[#244D3F]">
          <h3 className="font-black text-[#F4F8F5]">Irrigation history</h3>
          {history.length ? <ul className="mt-3 space-y-2">{history.slice(0,10).map((item) => <li key={item.id} className="rounded-xl bg-[#10251F] p-3 text-sm"><span className="font-bold">{item.mode || 'Irrigation event'}</span><span className="text-[#A9BDB1]"> · {item.start_at ? new Date(item.start_at).toLocaleString() : 'Time unavailable'} · {item.duration_minutes ?? '—'} min · {item.status || 'unknown'}{item.source === 'synthetic_demo' ? ' · Synthetic demo event' : ''}</span></li>)}</ul> : <p className="text-sm text-[#A9BDB1] mt-3">No irrigation events are recorded for this field.</p>}
        </div>
      </section>}
    </div>
  );
};
