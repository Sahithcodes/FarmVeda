import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Sprout,
  Radio,
  LineChart,
  Droplets,
  CloudSun,
  CalendarCheck,
  Lightbulb,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapsed,
}) => {
  const { t } = useLanguage();
  const { currentUser, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'farms', label: t('navFarms'), icon: Sprout },
    { id: 'sensors', label: t('navSensors'), icon: Radio },
    { id: 'analytics', label: t('navAnalytics'), icon: LineChart },
    { id: 'irrigation', label: t('navIrrigation'), icon: Droplets },
    { id: 'weather', label: t('navWeather'), icon: CloudSun },
    { id: 'schedule', label: t('navSchedule'), icon: CalendarCheck },
    { id: 'insights', label: t('navInsights'), icon: Lightbulb },
    { id: 'profile', label: t('navProfile'), icon: User },
    { id: 'settings', label: t('navSettings'), icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#10251F] border-r border-[#244D3F] transition-all duration-300 select-none shadow-xl shadow-black/20 z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Toggle button */}
      <div className="p-3 flex justify-end border-b border-[#244D3F]/60">
        <button
          onClick={onToggleCollapsed}
          className="p-1.5 rounded-xl text-[#A9BDB1] hover:bg-[#17332A] hover:text-white transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-[#64D995]" />
          ) : (
            <div className="flex items-center gap-1 text-xs font-semibold text-[#A9BDB1]">
              <ChevronLeft className="w-4 h-4 text-[#64D995]" />
              <span>Collapse</span>
            </div>
          )}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all min-h-[48px] cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] text-white shadow-lg shadow-emerald-950/50 border border-[#64D995]/30'
                  : 'text-[#A9BDB1] hover:bg-[#17332A] hover:text-[#F4F8F5]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-[#F4B740]' : 'text-[#64D995]'
                }`}
              />
              {!collapsed && (
                <span className="truncate tracking-wide">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Farmer Profile Card & Logout at bottom */}
      {currentUser && (
        <div className="p-3 border-t border-[#244D3F]/60 space-y-2">
          {!collapsed ? (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#17332A] border border-[#244D3F]">
              <button
                onClick={() => onSelectTab('profile')}
                className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-[#10251F] border border-[#244D3F] flex items-center justify-center text-lg flex-shrink-0">
                  {currentUser.avatarUrl || '🌾'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#F4F8F5] truncate">
                    {currentUser.fullName}
                  </p>
                  <p className="text-[10px] text-[#A9BDB1] truncate">
                    {currentUser.designation || 'Farmer'}
                  </p>
                </div>
              </button>

              <button
                onClick={logout}
                className="p-1.5 rounded-xl text-[#A9BDB1] hover:text-[#E45B5B] hover:bg-red-950/40 transition-colors cursor-pointer"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onSelectTab('profile')}
              className="w-full flex justify-center p-2 rounded-2xl hover:bg-[#17332A] transition-colors cursor-pointer"
              title={currentUser.fullName}
            >
              <div className="w-9 h-9 rounded-xl bg-[#10251F] border border-[#244D3F] flex items-center justify-center text-lg">
                {currentUser.avatarUrl || '🌾'}
              </div>
            </button>
          )}
        </div>
      )}

      {/* Quick App Info bottom badge */}
      {!collapsed && (
        <div className="p-3 mx-3 mb-3 rounded-2xl bg-[#17332A]/50 border border-[#244D3F]/40 text-center">
          <p className="text-[11px] font-bold text-[#64D995]">FarmVeda Local</p>
          <p className="text-[10px] text-[#A9BDB1]">
            IndexedDB Offline-First PWA
          </p>
        </div>
      )}
    </aside>
  );
};

