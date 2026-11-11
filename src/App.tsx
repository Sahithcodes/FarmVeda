import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './i18n/LanguageContext';
import { dbService } from './db/dbService';
import { sensorSimulator } from './services/sensorSimulator';
import {
  Farm,
  Field,
  Sensor,
  SensorReading,
  IrrigationSchedule,
  DailyActivity,
  Recommendation,
  AssistantConversation,
  UserPreferences,
} from './types';

// Common Components
import { Header } from './components/common/Header';
import { OfflineBanner } from './components/common/OfflineBanner';
import { InstallPrompt } from './components/common/InstallPrompt';

// Navigation
import { Sidebar } from './components/navigation/Sidebar';
import { BottomNav } from './components/navigation/BottomNav';

// Views
import { MetricsGrid } from './components/dashboard/MetricsGrid';
import { NextScheduleCard } from './components/dashboard/NextScheduleCard';
import { TreeForgeDashboard } from './components/dashboard/TreeForgeDashboard';
import { FarmList } from './components/farms/FarmList';
import { SensorList } from './components/sensors/SensorList';
import { MoistureChart } from './components/analytics/MoistureChart';
import { IrrigationControls } from './components/irrigation/IrrigationControls';
import { WeatherOverview } from './components/weather/WeatherOverview';
import { ScheduleTimeline } from './components/schedule/ScheduleTimeline';
import { InsightsList } from './components/insights/InsightsList';
import { SettingsView } from './components/settings/SettingsView';
import { UserProfileView } from './components/profile/UserProfileView';
import { AuthPage } from './components/auth/AuthPage';
import { useAuth } from './context/AuthContext';

// Assistant & Onboarding
import { SurvamAssistantModal } from './components/assistant/SurvamAssistantModal';
import { FloatingMicButton } from './components/assistant/FloatingMicButton';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { Sprout, Plus, Columns3, LayoutGrid } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();

  // App Global State
  const [loading, setLoading] = useState(true);
  const [dashboardMode, setDashboardMode] = useState<'treeforge' | 'grid'>('treeforge');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [latestReading, setLatestReading] = useState<SensorReading | undefined>();
  const [readingsHistory, setReadingsHistory] = useState<SensorReading[]>([]);
  const [irrigationSchedule, setIrrigationSchedule] = useState<IrrigationSchedule | undefined>();
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [assistantHistory, setAssistantHistory] = useState<AssistantConversation[]>([]);
  const [userPrefs, setUserPrefs] = useState<UserPreferences | null>(null);

  // Active selections
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modals
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Online / Offline state listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reload all data from local IndexedDB
  const refreshAllData = useCallback(async () => {
    try {
      await dbService.initializeDatabase();
      const userId = currentUser?.id;

      const [
        loadedFarms,
        loadedFields,
        loadedSensors,
        loadedActivities,
        loadedRecs,
        loadedHistory,
        prefs,
      ] = await Promise.all([
        dbService.getFarms(userId),
        dbService.getFields(undefined, userId),
        dbService.getSensors(undefined, userId),
        dbService.getDailyActivities(undefined, userId),
        dbService.getRecommendations(undefined, userId),
        dbService.getAssistantConversations(userId),
        dbService.getUserPreferences(userId),
      ]);

      setFarms(loadedFarms);
      setFields(loadedFields);
      setSensors(loadedSensors);
      setActivities(loadedActivities);
      setRecommendations(loadedRecs);
      setAssistantHistory(loadedHistory);
      setUserPrefs(prefs);

      // Check onboarding flag for this user
      const userOnboardingKey = `farmveda_onboarding_done_${userId}`;
      const onboardingDone = localStorage.getItem(userOnboardingKey) || (userId === 'usr-demo-01' ? 'true' : null);
      if (!onboardingDone && (!prefs || !prefs.onboardingCompleted) && loadedFarms.length === 0) {
        setOnboardingOpen(true);
      }

      // Set active farm & field
      const activeFarm =
        loadedFarms.find((f) => f.id === selectedFarmId) || loadedFarms[0];
      const activeFarmId = activeFarm?.id || '';
      setSelectedFarmId(activeFarmId);

      const activeFields = loadedFields.filter((f) => f.farmId === activeFarmId);
      const activeField =
        activeFields.find((f) => f.id === selectedFieldId) || activeFields[0];
      const activeFieldId = activeField?.id || '';
      setSelectedFieldId(activeFieldId);

      // Load latest reading & history for selected field
      if (activeFieldId || activeFarmId) {
        const latest = await dbService.getLatestReading(activeFieldId, activeFarmId);
        setLatestReading(latest);

        const history = await dbService.getReadingsHistory(activeFieldId, 30);
        setReadingsHistory(history);

        // Load active irrigation schedule
        if (activeFieldId) {
          const schedule = await dbService.getIrrigationSchedule(activeFieldId);
          setIrrigationSchedule(schedule);
        }
      } else {
        setLatestReading(undefined);
        setReadingsHistory([]);
        setIrrigationSchedule(undefined);
      }
    } catch (e) {
      console.error('Data load error:', e);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, selectedFarmId, selectedFieldId]);

  // Initial load
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Periodic subtle sensor simulation pulse (every 40 seconds)
  useEffect(() => {
    const pulseInterval = setInterval(async () => {
      if (selectedFieldId && selectedFarmId) {
        const field = fields.find((f) => f.id === selectedFieldId);
        const sensor = sensors.find(
          (s) => s.id === field?.sensorId || s.fieldId === selectedFieldId
        );
        if (sensor && sensor.status !== 'offline' && sensor.status !== 'inactive') {
          const updated = await sensorSimulator.pulseSensorData(
            selectedFieldId,
            selectedFarmId,
            sensor.id,
            latestReading
          );
          setLatestReading(updated);
        }
      }
    }, 40000);

    return () => clearInterval(pulseInterval);
  }, [selectedFieldId, selectedFarmId, fields, sensors, latestReading]);

  // Handlers for farm & field changes
  const handleSelectFarm = (farmId: string) => {
    setSelectedFarmId(farmId);
    const farmFields = fields.filter((f) => f.farmId === farmId);
    setSelectedFieldId(farmFields[0]?.id || '');
  };

  const handleSelectField = (fieldId: string) => {
    setSelectedFieldId(fieldId);
  };

  // Manual pulse trigger
  const handleSimulatePulse = async () => {
    if (selectedFieldId && selectedFarmId) {
      const field = fields.find((f) => f.id === selectedFieldId);
      const sensor = sensors.find(
        (s) => s.id === field?.sensorId || s.fieldId === selectedFieldId
      );
      const sensorId = sensor ? sensor.id : 'sensor-01';

      const updated = await sensorSimulator.pulseSensorData(
        selectedFieldId,
        selectedFarmId,
        sensorId,
        latestReading
      );
      setLatestReading(updated);

      const newHistory = await dbService.getReadingsHistory(selectedFieldId, 30);
      setReadingsHistory(newHistory);
    }
  };

  // Activity handlers
  const handleUpdateActivity = async (activity: DailyActivity) => {
    await dbService.updateDailyActivity(activity.id, activity);
    setActivities((prev) =>
      prev.map((a) => (a.id === activity.id ? activity : a))
    );
  };

  const handleAddActivity = async (activity: DailyActivity) => {
    await dbService.addDailyActivity(activity);
    setActivities((prev) => [...prev, activity]);
  };

  const handleDeleteActivity = async (id: string) => {
    await dbService.deleteDailyActivity(id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  // Farm handlers
  const handleAddFarm = async (farm: Farm, newFields?: Field[]) => {
    const userId = currentUser?.id;
    const farmWithUser = { ...farm, userId };
    if (newFields && newFields.length > 0) {
      await dbService.saveFarmWithFields(farmWithUser, newFields, userId);
    } else {
      await dbService.addFarm(farmWithUser, userId);
    }
    await refreshAllData();
    setSelectedFarmId(farm.id);
  };

  const handleUpdateFarm = async (farm: Farm) => {
    await dbService.updateFarm(farm.id, farm);
    await refreshAllData();
  };

  const handleDeleteFarm = async (id: string) => {
    await dbService.deleteFarm(id);
    await refreshAllData();
  };

  // Field handlers
  const handleAddField = async (field: Field) => {
    const userId = currentUser?.id;
    await dbService.addField({ ...field, userId });
    await refreshAllData();
    setSelectedFieldId(field.id);
  };

  const handleUpdateField = async (field: Field) => {
    await dbService.updateField(field.id, field);
    await refreshAllData();
  };

  const handleDeleteField = async (id: string) => {
    await dbService.deleteField(id);
    await refreshAllData();
  };

  // Sensor Handlers
  const handleAddSensor = async (sensor: Sensor) => {
    const userId = currentUser?.id;
    await dbService.addSensor({ ...sensor, userId }, userId);
    await refreshAllData();
  };

  const handleUpdateSensor = async (sensor: Sensor) => {
    await dbService.updateSensor(sensor.id, sensor);
    await refreshAllData();
  };

  const handleDeleteSensor = async (id: string) => {
    await dbService.deleteSensor(id);
    await refreshAllData();
  };

  const handleToggleSensorStatus = async (id: string) => {
    await dbService.toggleSensorStatus(id);
    await refreshAllData();
  };

  // Sensor Manual Reading
  const handleAddManualReading = async (reading: Omit<SensorReading, 'id'>) => {
    const userId = currentUser?.id;
    await dbService.addSensorReading({ ...reading, userId }, userId);
    setLatestReading({ ...reading, userId } as SensorReading);
    const newHistory = await dbService.getReadingsHistory(reading.fieldId, 30);
    setReadingsHistory(newHistory);
    await refreshAllData();
  };

  // Irrigation Schedule update
  const handleUpdateIrrigationSchedule = async (updates: Partial<IrrigationSchedule>) => {
    if (irrigationSchedule) {
      await dbService.updateIrrigationSchedule(irrigationSchedule.id, updates);
      setIrrigationSchedule({ ...irrigationSchedule, ...updates });
    }
  };

  // Assistant messages
  const handleAddAssistantMessage = async (msg: AssistantConversation) => {
    const userId = currentUser?.id;
    await dbService.addAssistantMessage({ ...msg, userId }, userId);
    setAssistantHistory((prev) => [...prev, msg]);
  };

  // Onboarding completion
  const handleOnboardingComplete = async (data: {
    farmerName: string;
    villageName: string;
    farm: Farm;
    field: Field;
    sensor?: Sensor;
  }) => {
    const userId = currentUser?.id;
    await dbService.addFarm({ ...data.farm, userId }, userId);
    await dbService.addField({ ...data.field, userId });
    if (data.sensor) {
      await dbService.addSensor({ ...data.sensor, userId }, userId);
    }
    await dbService.updateUserPreferences({
      farmerName: data.farmerName,
      villageName: data.villageName,
      onboardingCompleted: true,
      activeFarmId: data.farm.id,
      activeFieldId: data.field.id,
    }, userId);
    if (userId) {
      localStorage.setItem(`farmveda_onboarding_done_${userId}`, 'true');
    }
    setOnboardingOpen(false);
    setSelectedFarmId(data.farm.id);
    setSelectedFieldId(data.field.id);
    await refreshAllData();
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1713] flex flex-col items-center justify-center p-6 text-center text-[#F4F8F5]">
        <div className="w-16 h-16 rounded-3xl bg-[#10251F] border border-[#244D3F] flex items-center justify-center shadow-2xl animate-bounce">
          <span className="text-3xl">🌱</span>
        </div>
        <h2 className="text-2xl font-black text-[#F4F8F5] mt-4 tracking-tight">
          Farm<span className="text-[#64D995]">Veda</span>
        </h2>
        <p className="text-xs text-[#A9BDB1] font-semibold mt-1">
          Loading smart farming workspace and sensor telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1713] text-[#F4F8F5] flex flex-col antialiased selection:bg-[#2E8B57] selection:text-white">
      {/* Offline and Local Persistence Banner */}
      <OfflineBanner />

      {/* Main Header */}
      <Header
        farms={farms}
        fields={fields}
        selectedFarmId={selectedFarmId}
        selectedFieldId={selectedFieldId}
        onSelectFarm={handleSelectFarm}
        onSelectField={handleSelectField}
        onOpenAssistant={() => setAssistantOpen(true)}
        onOpenProfile={() => setCurrentTab('profile')}
        isOnline={isOnline}
      />

      {/* App Body with Desktop Sidebar + Main View */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 md:pb-12 max-w-full overflow-hidden">
          {/* 1. DASHBOARD VIEW */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#F4F8F5] tracking-tight">
                    {t('navDashboard')}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#A9BDB1] font-medium mt-0.5">
                    {t('dashboardSubtitle')}
                  </p>
                </div>

                {farms.length > 0 && (
                  <div className="flex items-center p-1 rounded-2xl bg-[#10251F] border border-[#244D3F] shadow-sm self-start sm:self-auto">
                    <button
                      onClick={() => setDashboardMode('treeforge')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        dashboardMode === 'treeforge'
                          ? 'bg-[#2E8B57] text-white shadow-md'
                          : 'text-[#A9BDB1] hover:text-[#F4F8F5]'
                      }`}
                    >
                      <Columns3 className="w-3.5 h-3.5" />
                      <span>TreeForge 3-Col</span>
                    </button>
                    <button
                      onClick={() => setDashboardMode('grid')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        dashboardMode === 'grid'
                          ? 'bg-[#2E8B57] text-white shadow-md'
                          : 'text-[#A9BDB1] hover:text-[#F4F8F5]'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Metrics Grid</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Empty Dashboard State if No Farm Registered */}
              {farms.length === 0 ? (
                <div className="bg-[#17332A] rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-[#244D3F] shadow-xl space-y-4 my-6">
                  <div className="w-20 h-20 rounded-3xl bg-[#10251F] text-[#64D995] border border-[#244D3F] flex items-center justify-center mx-auto shadow-inner">
                    <Sprout className="w-10 h-10" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-2xl font-black text-[#F4F8F5] tracking-tight">
                      {t('farmJourneyStartsHere')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A9BDB1] mt-2 font-medium leading-relaxed">
                      Register your agricultural land to begin monitoring soil moisture, root telemetry, weather forecasts, and smart irrigation schedules.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('farms')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white font-extrabold text-sm shadow-lg shadow-[#2E8B57]/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-5 h-5 text-[#F4B740]" />
                    <span>{t('registerFirstFarm')}</span>
                  </button>
                </div>
              ) : dashboardMode === 'treeforge' ? (
                /* Primary 3-Column TreeForge Dashboard */
                <TreeForgeDashboard
                  farms={farms}
                  fields={fields}
                  sensors={sensors}
                  latestReading={latestReading}
                  readingsHistory={readingsHistory}
                  irrigationSchedule={irrigationSchedule}
                  activities={activities}
                  recommendations={recommendations}
                  selectedFarmId={selectedFarmId}
                  selectedFieldId={selectedFieldId}
                  onSelectFarm={handleSelectFarm}
                  onSelectField={handleSelectField}
                  onNavigateTab={setCurrentTab}
                  onSimulatePulse={handleSimulatePulse}
                  onUpdateActivity={handleUpdateActivity}
                  onOpenAssistant={() => setAssistantOpen(true)}
                />
              ) : (
                /* Classic 6-Metric Cards View */
                <>
                  <NextScheduleCard
                    activities={activities}
                    onToggleStatus={handleUpdateActivity}
                    onViewAllSchedule={() => setCurrentTab('schedule')}
                  />
                  <MetricsGrid
                    latestReading={latestReading}
                    sensors={sensors}
                    irrigationSchedule={irrigationSchedule}
                    onNavigateTab={setCurrentTab}
                  />
                </>
              )}
            </div>
          )}

          {/* 2. MY FARMS & FIELDS VIEW */}
          {currentTab === 'farms' && (
            <FarmList
              farms={farms}
              fields={fields}
              sensors={sensors}
              selectedFarmId={selectedFarmId}
              onSelectFarm={handleSelectFarm}
              onAddFarm={handleAddFarm}
              onUpdateFarm={handleUpdateFarm}
              onDeleteFarm={handleDeleteFarm}
              onAddField={handleAddField}
              onUpdateField={handleUpdateField}
              onDeleteField={handleDeleteField}
            />
          )}

          {/* 3. SENSOR MONITORING VIEW */}
          {currentTab === 'sensors' && (
            <SensorList
              sensors={sensors}
              farms={farms}
              fields={fields}
              latestReading={latestReading}
              selectedFarmId={selectedFarmId}
              selectedFieldId={selectedFieldId}
              onAddSensor={handleAddSensor}
              onUpdateSensor={handleUpdateSensor}
              onDeleteSensor={handleDeleteSensor}
              onToggleSensorStatus={handleToggleSensorStatus}
              onAddManualReading={handleAddManualReading}
              onSimulatePulse={handleSimulatePulse}
            />
          )}

          {/* 4. MOISTURE HISTORY & ANALYTICS VIEW */}
          {currentTab === 'analytics' && (
            <MoistureChart
              readingsHistory={readingsHistory}
              currentReading={latestReading}
              fieldName={selectedField?.name}
            />
          )}

          {/* 5. IRRIGATION MANAGEMENT VIEW */}
          {currentTab === 'irrigation' && (
            <IrrigationControls
              schedule={irrigationSchedule}
              field={selectedField}
              onUpdateSchedule={handleUpdateIrrigationSchedule}
            />
          )}

          {/* 6. WEATHER FORECAST VIEW */}
          {currentTab === 'weather' && <WeatherOverview />}

          {/* 7. TODAY'S FARM SCHEDULE VIEW */}
          {currentTab === 'schedule' && (
            <ScheduleTimeline
              activities={activities}
              farmId={selectedFarmId}
              onUpdateActivity={handleUpdateActivity}
              onAddActivity={handleAddActivity}
              onDeleteActivity={handleDeleteActivity}
            />
          )}

          {/* 8. FARM INSIGHTS VIEW */}
          {currentTab === 'insights' && (
            <InsightsList
              recommendations={recommendations}
              onNavigateTab={setCurrentTab}
            />
          )}

          {/* 9. USER PROFILE VIEW */}
          {currentTab === 'profile' && (
            <UserProfileView
              farms={farms}
              onOpenFarmDetails={() => setCurrentTab('farms')}
            />
          )}

          {/* 10. SETTINGS VIEW */}
          {currentTab === 'settings' && (
            <SettingsView
              onDataResetOrCleared={refreshAllData}
              onOpenOnboarding={() => setOnboardingOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Persistent Floating Survam Voice Assistant Button */}
      <FloatingMicButton onClick={() => setAssistantOpen(true)} />

      {/* Survam AI Voice Assistant Modal */}
      {assistantOpen && (
        <SurvamAssistantModal
          latestReading={latestReading}
          sensors={sensors}
          farms={farms}
          fields={fields}
          irrigationSchedule={irrigationSchedule}
          farmerName={currentUser?.fullName || userPrefs?.farmerName || 'Farmer'}
          fieldName={selectedField?.name}
          conversationHistory={assistantHistory}
          onAddMessage={handleAddAssistantMessage}
          onNavigateTab={(tab) => {
            setCurrentTab(tab);
            setAssistantOpen(false);
          }}
          onClose={() => setAssistantOpen(false)}
        />
      )}

      {/* Onboarding Wizard Modal */}
      {onboardingOpen && (
        <OnboardingWizard
          initialFarmerName={currentUser?.fullName}
          initialVillageName={currentUser?.district ? `${currentUser.district}, ${currentUser.state}` : undefined}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* PWA Home Screen Install Banner */}
      <InstallPrompt />
    </div>
  );
};

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#06180E] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shadow-xl animate-bounce">
          <span className="text-3xl">🌱</span>
        </div>
        <h2 className="text-2xl font-black text-white mt-4 tracking-tight">
          Farm<span className="text-emerald-400">Veda</span>
        </h2>
        <p className="text-xs text-emerald-200/60 font-semibold mt-1">
          Loading smart farming workspace...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <AppContent />;
};

export default App;
