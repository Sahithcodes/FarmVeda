import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  LayoutDashboard,
  Sprout,
  Radio,
  CalendarCheck,
  Menu,
  LineChart,
  Droplets,
  CloudSun,
  Lightbulb,
  Settings,
  User,
  X,
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { t } = useLanguage();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: t('navHome'), icon: LayoutDashboard },
    { id: 'farms', label: t('navFarms'), icon: Sprout },
    { id: 'sensors', label: t('navSensors'), icon: Radio },
    { id: 'schedule', label: t('navSchedule'), icon: CalendarCheck },
  ];

  const moreTabs = [
    { id: 'profile', label: t('navProfile'), icon: User },
    { id: 'analytics', label: t('navAnalytics'), icon: LineChart },
    { id: 'irrigation', label: t('navIrrigation'), icon: Droplets },
    { id: 'weather', label: t('navWeather'), icon: CloudSun },
    { id: 'insights', label: t('navInsights'), icon: Lightbulb },
    { id: 'settings', label: t('navSettings'), icon: Settings },
  ];

  const isMoreActive = moreTabs.some((tab) => tab.id === currentTab);

  return (
    <>
      {/* "More" Sheet Overlay for mobile */}
      {moreMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex flex-col justify-end transition-opacity"
          onClick={() => setMoreMenuOpen(false)}
        >
          <div
            className="bg-[#10251F] rounded-t-3xl p-5 shadow-2xl border-t border-[#244D3F] max-h-[80vh] overflow-y-auto text-[#F4F8F5]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#244D3F] mb-3">
              <h3 className="font-extrabold text-base text-[#F4F8F5]">
                {t('navMore')}
              </h3>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="p-1.5 rounded-full bg-[#17332A] text-[#A9BDB1] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2">
              {moreTabs.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setMoreMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border min-h-[72px] transition-all active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] border-[#64D995]/40 text-white shadow-lg'
                        : 'bg-[#17332A] border-[#244D3F] text-[#A9BDB1] hover:bg-[#1D4033] hover:text-[#F4F8F5]'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mb-1.5 ${
                        isActive ? 'text-[#F4B740]' : 'text-[#64D995]'
                      }`}
                    />
                    <span className="text-xs font-bold text-center leading-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#10251F]/95 backdrop-blur-xl border-t border-[#244D3F] shadow-2xl px-2 py-1 safe-bottom flex items-center justify-around">
        {mainTabs.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMoreMenuOpen(false);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all min-h-[52px] ${
                isActive ? 'text-[#64D995] font-extrabold' : 'text-[#A9BDB1] font-semibold'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-[#2E8B57] text-white shadow-md' : 'text-[#A9BDB1]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setMoreMenuOpen(!moreMenuOpen)}
          className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all min-h-[52px] ${
            isMoreActive ? 'text-[#64D995] font-extrabold' : 'text-[#A9BDB1] font-semibold'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              isMoreActive ? 'bg-[#2E8B57] text-white shadow-md' : 'text-[#A9BDB1]'
            }`}
          >
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight">
            {t('navMore')}
          </span>
        </button>
      </nav>
    </>
  );
};

