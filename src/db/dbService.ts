import { db } from './dexieDb';
import {
  DEMO_USER_ID,
  initialDemoUser,
  initialFarms,
  initialFields,
  initialSensors,
  initialIrrigationSchedules,
  initialDailyActivities,
  initialRecommendations,
  initialPreferences,
  generateInitialSensorReadings,
} from './seedData';
import {
  UserProfile,
  Farm,
  Field,
  Sensor,
  SensorReading,
  IrrigationSchedule,
  DailyActivity,
  Recommendation,
  AssistantConversation,
  UserPreferences,
} from '../types';
import { hashPassword } from '../utils/crypto';

export const dbService = {
  // Initialize Database if empty
  async initializeDatabase(): Promise<void> {
    // Ensure demo user exists
    const userCount = await db.users.count();
    if (userCount === 0) {
      const demoHash = await hashPassword('FarmVeda@2026');
      await db.users.add({
        ...initialDemoUser,
        passwordHash: demoHash,
      });
    }

    const farmCount = await db.farms.count();
    if (farmCount === 0) {
      console.log('Seeding initial FarmVeda data into IndexedDB...');
      await this.resetToDemoData();
    }
  },

  // Reset to default demo dataset
  async resetToDemoData(): Promise<void> {
    const demoHash = await hashPassword('FarmVeda@2026');
    await db.transaction('rw', [
      db.users,
      db.farms,
      db.fields,
      db.sensors,
      db.sensorReadings,
      db.irrigationSchedules,
      db.dailyActivities,
      db.recommendations,
      db.assistantConversations,
      db.userPreferences,
    ], async () => {
      await db.users.clear();
      await db.farms.clear();
      await db.fields.clear();
      await db.sensors.clear();
      await db.sensorReadings.clear();
      await db.irrigationSchedules.clear();
      await db.dailyActivities.clear();
      await db.recommendations.clear();
      await db.assistantConversations.clear();
      await db.userPreferences.clear();

      await db.users.add({
        ...initialDemoUser,
        passwordHash: demoHash,
      });
      await db.farms.bulkAdd(initialFarms);
      await db.fields.bulkAdd(initialFields);
      await db.sensors.bulkAdd(initialSensors);
      await db.sensorReadings.bulkAdd(generateInitialSensorReadings());
      await db.irrigationSchedules.bulkAdd(initialIrrigationSchedules);
      await db.dailyActivities.bulkAdd(initialDailyActivities);
      await db.recommendations.bulkAdd(initialRecommendations);
      await db.userPreferences.add(initialPreferences);
    });
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    await Promise.all([
      db.users.clear(),
      db.farms.clear(),
      db.fields.clear(),
      db.sensors.clear(),
      db.sensorReadings.clear(),
      db.irrigationSchedules.clear(),
      db.dailyActivities.clear(),
      db.recommendations.clear(),
      db.assistantConversations.clear(),
      db.userPreferences.clear(),
    ]);
  },

  // User Authentication & Profile Methods
  async getUserById(id: string): Promise<UserProfile | undefined> {
    return await db.users.get(id);
  },

  async getUserByEmailOrMobile(identifier: string): Promise<UserProfile | undefined> {
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '');

    const users = await db.users.toArray();
    return users.find((u) => {
      const emailMatch = u.email.toLowerCase() === clean;
      const mobileMatch = cleanDigits.length >= 10 && u.mobileNumber.replace(/[^0-9]/g, '').endsWith(cleanDigits.slice(-10));
      return emailMatch || mobileMatch;
    });
  },

  async createUser(user: UserProfile): Promise<string> {
    await db.users.add(user);
    // Initialize preferences for this user
    await db.userPreferences.put({
      ...initialPreferences,
      id: user.id,
      farmerName: user.fullName,
      phoneNumber: user.mobileNumber,
      selectedLanguage: user.preferredLanguage,
      onboardingCompleted: false,
    });
    return user.id;
  },

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<void> {
    await db.users.update(id, updates);
    if (updates.fullName || updates.preferredLanguage) {
      const existingPrefs = await db.userPreferences.get(id);
      if (existingPrefs) {
        await db.userPreferences.update(id, {
          farmerName: updates.fullName || existingPrefs.farmerName,
          selectedLanguage: updates.preferredLanguage || existingPrefs.selectedLanguage,
        });
      }
    }
  },

  async updateUserPassword(id: string, newPasswordHash: string): Promise<void> {
    await db.users.update(id, { passwordHash: newPasswordHash });
  },

  async getAllUsers(): Promise<UserProfile[]> {
    return await db.users.toArray();
  },

  // User Preferences
  async getUserPreferences(userId?: string): Promise<UserPreferences> {
    const key = userId || 'current_user';
    const prefs = await db.userPreferences.get(key);
    return prefs || { ...initialPreferences, id: key };
  },

  async updateUserPreferences(updates: Partial<UserPreferences>, userId?: string): Promise<void> {
    const key = userId || 'current_user';
    const existing = await db.userPreferences.get(key);
    if (existing) {
      await db.userPreferences.update(key, updates);
    } else {
      await db.userPreferences.add({ ...initialPreferences, ...updates, id: key });
    }
  },

  // Farms
  async getFarms(userId?: string): Promise<Farm[]> {
    let farms = await db.farms.toArray();
    if (userId) {
      farms = farms.filter((f) => f.userId === userId || (!f.userId && userId === DEMO_USER_ID));
    }
    // Normalize aliases
    return farms.map((f) => ({
      ...f,
      name: f.name || f.farmName || '',
      farmName: f.farmName || f.name || '',
      ownerName: f.ownerName || f.farmerName || '',
      farmerName: f.farmerName || f.ownerName || '',
    }));
  },

  async getFarm(id: string): Promise<Farm | undefined> {
    const f = await db.farms.get(id);
    if (!f) return undefined;
    return {
      ...f,
      name: f.name || f.farmName || '',
      farmName: f.farmName || f.name || '',
      ownerName: f.ownerName || f.farmerName || '',
      farmerName: f.farmerName || f.ownerName || '',
    };
  },

  async addFarm(farm: Farm, userId?: string): Promise<string> {
    const targetUserId = userId || farm.userId;
    const normalized: Farm = {
      ...farm,
      userId: targetUserId,
      name: farm.name || farm.farmName || '',
      farmName: farm.farmName || farm.name || '',
      ownerName: farm.ownerName || farm.farmerName || '',
      farmerName: farm.farmerName || farm.ownerName || '',
    };
    await db.farms.add(normalized);
    return normalized.id;
  },

  async updateFarm(id: string, updates: Partial<Farm>): Promise<void> {
    const normalized = { ...updates };
    if (updates.farmName && !updates.name) normalized.name = updates.farmName;
    if (updates.name && !updates.farmName) normalized.farmName = updates.name;
    if (updates.farmerName && !updates.ownerName) normalized.ownerName = updates.farmerName;
    if (updates.ownerName && !updates.farmerName) normalized.farmerName = updates.ownerName;
    await db.farms.update(id, normalized);
  },

  async deleteFarm(id: string): Promise<void> {
    await db.transaction('rw', [db.farms, db.fields, db.sensors, db.sensorReadings, db.irrigationSchedules], async () => {
      await db.farms.delete(id);
      const fields = await db.fields.where('farmId').equals(id).toArray();
      const fieldIds = fields.map((f) => f.id);
      await db.fields.where('farmId').equals(id).delete();
      await db.sensors.where('farmId').equals(id).delete();
      for (const fId of fieldIds) {
        await db.sensorReadings.where('fieldId').equals(fId).delete();
        await db.irrigationSchedules.where('fieldId').equals(fId).delete();
      }
    });
  },

  // Save Farm with Multiple Fields atomically
  async saveFarmWithFields(farm: Farm, fields: Field[], userId?: string): Promise<void> {
    const targetUserId = userId || farm.userId;
    await db.transaction('rw', [db.farms, db.fields, db.irrigationSchedules], async () => {
      const normalizedFarm: Farm = {
        ...farm,
        userId: targetUserId,
        name: farm.name || farm.farmName || '',
        farmName: farm.farmName || farm.name || '',
        ownerName: farm.ownerName || farm.farmerName || '',
        farmerName: farm.farmerName || farm.ownerName || '',
      };

      const existingFarm = await db.farms.get(farm.id);
      if (existingFarm) {
        await db.farms.update(farm.id, normalizedFarm);
      } else {
        await db.farms.add(normalizedFarm);
      }

      for (const field of fields) {
        const normalizedField: Field = {
          ...field,
          userId: targetUserId,
          farmId: farm.id,
          name: field.name || field.fieldName || '',
          fieldName: field.fieldName || field.name || '',
          areaAcres: field.areaAcres ?? field.fieldArea ?? 1,
          fieldArea: field.fieldArea ?? field.areaAcres ?? 1,
          sowingDate: field.sowingDate || field.plantingDate || new Date().toISOString().split('T')[0],
          plantingDate: field.plantingDate || field.sowingDate || new Date().toISOString().split('T')[0],
        };

        const existingField = await db.fields.get(field.id);
        if (existingField) {
          await db.fields.update(field.id, normalizedField);
        } else {
          await db.fields.add(normalizedField);
          // Auto create default irrigation schedule
          await db.irrigationSchedules.add({
            id: `irrig-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            userId: targetUserId,
            farmId: farm.id,
            fieldId: field.id,
            mode: 'manual',
            status: 'OFF',
            moistureThreshold: 50,
            durationMinutes: 30,
            lastIrrigationTime: 'Not yet recorded',
            nextIrrigationTime: 'Manual trigger',
            waterUsedLitersToday: 0,
          });
        }
      }
    });
  },

  // Fields
  async getFields(farmId?: string, userId?: string): Promise<Field[]> {
    let fields: Field[];
    if (farmId) {
      fields = await db.fields.where('farmId').equals(farmId).toArray();
    } else {
      fields = await db.fields.toArray();
    }
    if (userId) {
      fields = fields.filter((f) => f.userId === userId || (!f.userId && userId === DEMO_USER_ID));
    }
    return fields.map((f) => ({
      ...f,
      name: f.name || f.fieldName || '',
      fieldName: f.fieldName || f.name || '',
      areaAcres: f.areaAcres ?? f.fieldArea ?? 1,
      fieldArea: f.fieldArea ?? f.areaAcres ?? 1,
      sowingDate: f.sowingDate || f.plantingDate || '',
      plantingDate: f.plantingDate || f.sowingDate || '',
    }));
  },

  async getField(id: string): Promise<Field | undefined> {
    const f = await db.fields.get(id);
    if (!f) return undefined;
    return {
      ...f,
      name: f.name || f.fieldName || '',
      fieldName: f.fieldName || f.name || '',
      areaAcres: f.areaAcres ?? f.fieldArea ?? 1,
      fieldArea: f.fieldArea ?? f.areaAcres ?? 1,
      sowingDate: f.sowingDate || f.plantingDate || '',
      plantingDate: f.plantingDate || f.sowingDate || '',
    };
  },

  async addField(field: Field): Promise<string> {
    const normalized: Field = {
      ...field,
      name: field.name || field.fieldName || '',
      fieldName: field.fieldName || field.name || '',
      areaAcres: field.areaAcres ?? field.fieldArea ?? 1,
      fieldArea: field.fieldArea ?? field.areaAcres ?? 1,
      sowingDate: field.sowingDate || field.plantingDate || new Date().toISOString().split('T')[0],
      plantingDate: field.plantingDate || field.sowingDate || new Date().toISOString().split('T')[0],
    };

    await db.fields.add(normalized);

    // Automatically create a default irrigation schedule for this field
    await db.irrigationSchedules.add({
      id: `irrig-${Date.now()}`,
      farmId: field.farmId,
      fieldId: field.id,
      mode: 'manual',
      status: 'OFF',
      moistureThreshold: 50,
      durationMinutes: 30,
      lastIrrigationTime: 'Not yet recorded',
      nextIrrigationTime: 'Manual trigger',
      waterUsedLitersToday: 0,
    });
    return field.id;
  },

  async updateField(id: string, updates: Partial<Field>): Promise<void> {
    const normalized = { ...updates };
    if (updates.fieldName && !updates.name) normalized.name = updates.fieldName;
    if (updates.name && !updates.fieldName) normalized.fieldName = updates.name;
    if (updates.fieldArea !== undefined && updates.areaAcres === undefined) normalized.areaAcres = updates.fieldArea;
    if (updates.areaAcres !== undefined && updates.fieldArea === undefined) normalized.fieldArea = updates.areaAcres;
    if (updates.plantingDate && !updates.sowingDate) normalized.sowingDate = updates.plantingDate;
    if (updates.sowingDate && !updates.plantingDate) normalized.plantingDate = updates.sowingDate;
    await db.fields.update(id, normalized);
  },

  async deleteField(id: string): Promise<void> {
    await db.transaction('rw', [db.fields, db.sensors, db.sensorReadings, db.irrigationSchedules], async () => {
      await db.fields.delete(id);
      await db.sensors.where('fieldId').equals(id).delete();
      await db.sensorReadings.where('fieldId').equals(id).delete();
      await db.irrigationSchedules.where('fieldId').equals(id).delete();
    });
  },

  // Sensors
  async getSensors(farmId?: string, userId?: string): Promise<Sensor[]> {
    let sensors: Sensor[];
    if (farmId) {
      sensors = await db.sensors.where('farmId').equals(farmId).toArray();
    } else {
      sensors = await db.sensors.toArray();
    }
    if (userId) {
      sensors = sensors.filter((s) => s.userId === userId || (!s.userId && userId === DEMO_USER_ID));
    }
    return sensors.map((s) => ({
      ...s,
      sensorCode: s.sensorCode || s.sensorId || '',
      sensorId: s.sensorId || s.sensorCode || '',
      sensorName: s.sensorName || s.sensorCode || 'Sensor Node',
      sensorType: s.sensorType || (s.type as any) || 'Soil Moisture Sensor',
    }));
  },

  async addSensor(sensor: Sensor, userId?: string): Promise<string> {
    const targetUserId = userId || sensor.userId;
    const normalized: Sensor = {
      ...sensor,
      userId: targetUserId,
      sensorCode: sensor.sensorCode || sensor.sensorId || `SN-${Date.now().toString().slice(-4)}`,
      sensorId: sensor.sensorId || sensor.sensorCode || `SN-${Date.now().toString().slice(-4)}`,
      sensorName: sensor.sensorName || sensor.sensorCode || 'Sensor Node',
      sensorType: sensor.sensorType || (sensor.type as any) || 'Soil Moisture Sensor',
      installedDate: sensor.installedDate || sensor.installationDate || new Date().toISOString().split('T')[0],
      installationDate: sensor.installationDate || sensor.installedDate || new Date().toISOString().split('T')[0],
      batteryLevel: sensor.batteryLevel ?? 95,
      lastUpdated: sensor.lastUpdated || new Date().toISOString(),
    };

    await db.sensors.add(normalized);
    // Link to field if provided
    if (normalized.fieldId) {
      await db.fields.update(normalized.fieldId, { sensorId: normalized.id });
    }
    return normalized.id;
  },

  async updateSensor(id: string, updates: Partial<Sensor>): Promise<void> {
    const normalized = { ...updates };
    if (updates.sensorId && !updates.sensorCode) normalized.sensorCode = updates.sensorId;
    if (updates.sensorCode && !updates.sensorId) normalized.sensorId = updates.sensorCode;
    await db.sensors.update(id, normalized);
  },

  async deleteSensor(id: string): Promise<void> {
    const sensor = await db.sensors.get(id);
    if (sensor && sensor.fieldId) {
      await db.fields.update(sensor.fieldId, { sensorId: undefined });
    }
    await db.sensors.delete(id);
  },

  async toggleSensorStatus(id: string): Promise<void> {
    const sensor = await db.sensors.get(id);
    if (!sensor) return;
    const isCurrentlyActive = sensor.status === 'online' || sensor.status === 'active';
    const newStatus = isCurrentlyActive ? 'inactive' : 'active';
    await db.sensors.update(id, {
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    });
  },

  // Sensor Readings
  async addSensorReading(reading: Omit<SensorReading, 'id'>, userId?: string): Promise<number> {
    const targetUserId = userId || reading.userId;
    const timestamp = reading.timestamp || new Date().toISOString();
    const datePart = reading.readingDate || timestamp.split('T')[0];
    const timePart = reading.readingTime || new Date(timestamp).toTimeString().slice(0, 5);

    const moisture = reading.moisturePercent ?? reading.soilMoisture ?? 50;
    const temp = reading.temperatureC ?? reading.temperature ?? 28;
    const hum = reading.humidityPercent ?? reading.humidity ?? 65;
    const rain = reading.rainfallMm ?? reading.rainfall ?? 0;
    const isIrrigActive = reading.irrigationActive ?? (reading.irrigationStatus === 'ON');

    const normalizedReading: SensorReading = {
      ...reading,
      userId: targetUserId,
      timestamp,
      readingDate: datePart,
      readingTime: timePart,
      moisturePercent: moisture,
      soilMoisture: moisture,
      temperatureC: temp,
      temperature: temp,
      humidityPercent: hum,
      humidity: hum,
      rainfallMm: rain,
      rainfall: rain,
      irrigationActive: isIrrigActive,
      irrigationStatus: isIrrigActive ? 'ON' : 'OFF',
      source: reading.source || (reading.isSimulated ? 'simulated' : 'manual'),
    };

    const id = await db.sensorReadings.add(normalizedReading);

    // Update sensor lastUpdated time if sensor exists
    if (reading.sensorId) {
      await db.sensors.update(reading.sensorId, {
        lastUpdated: timestamp,
      });
    }

    return id;
  },

  async getLatestReading(fieldId?: string, farmId?: string): Promise<SensorReading | undefined> {
    if (fieldId) {
      const readings = await db.sensorReadings
        .where('fieldId')
        .equals(fieldId)
        .reverse()
        .sortBy('timestamp');
      return readings[0];
    }
    if (farmId) {
      const readings = await db.sensorReadings
        .where('farmId')
        .equals(farmId)
        .reverse()
        .sortBy('timestamp');
      return readings[0];
    }
    const all = await db.sensorReadings.reverse().sortBy('timestamp');
    return all[0];
  },

  async getReadingsHistory(fieldId?: string, days = 7): Promise<SensorReading[]> {
    const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
    let query = db.sensorReadings.filter((r) => r.timestamp >= cutoff);
    if (fieldId) {
      query = db.sensorReadings.filter((r) => r.timestamp >= cutoff && r.fieldId === fieldId);
    }
    const readings = await query.toArray();
    return readings.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  // Irrigation
  async getIrrigationSchedule(fieldId: string): Promise<IrrigationSchedule | undefined> {
    return await db.irrigationSchedules.where('fieldId').equals(fieldId).first();
  },

  async getAllIrrigationSchedules(farmId?: string): Promise<IrrigationSchedule[]> {
    if (farmId) {
      return await db.irrigationSchedules.where('farmId').equals(farmId).toArray();
    }
    return await db.irrigationSchedules.toArray();
  },

  async updateIrrigationSchedule(id: string, updates: Partial<IrrigationSchedule>): Promise<void> {
    await db.irrigationSchedules.update(id, updates);
  },

  // Daily Activities / Schedule
  async getDailyActivities(farmId?: string, userId?: string): Promise<DailyActivity[]> {
    let activities = await db.dailyActivities.toArray();
    if (farmId) {
      activities = activities.filter((a) => a.farmId === farmId);
    }
    if (userId) {
      activities = activities.filter((a) => a.userId === userId || (!a.userId && userId === DEMO_USER_ID));
    }
    return activities.sort((a, b) => a.time24.localeCompare(b.time24));
  },

  async addDailyActivity(activity: DailyActivity, userId?: string): Promise<void> {
    await db.dailyActivities.add({
      ...activity,
      userId: userId || activity.userId,
    });
  },

  async updateDailyActivity(id: string, updates: Partial<DailyActivity>): Promise<void> {
    await db.dailyActivities.update(id, updates);
  },

  async deleteDailyActivity(id: string): Promise<void> {
    await db.dailyActivities.delete(id);
  },

  // Recommendations
  async getRecommendations(farmId?: string, userId?: string): Promise<Recommendation[]> {
    let recs = await db.recommendations.toArray();
    if (farmId) {
      recs = recs.filter((r) => r.farmId === farmId);
    }
    if (userId) {
      recs = recs.filter((r) => r.userId === userId || (!r.userId && userId === DEMO_USER_ID));
    }
    return recs;
  },

  async addRecommendation(rec: Recommendation, userId?: string): Promise<void> {
    await db.recommendations.add({
      ...rec,
      userId: userId || rec.userId,
    });
  },

  // Assistant Conversations
  async getAssistantConversations(userId?: string): Promise<AssistantConversation[]> {
    let convos = await db.assistantConversations.reverse().limit(30).toArray();
    if (userId) {
      convos = convos.filter((c) => c.userId === userId || (!c.userId && userId === DEMO_USER_ID));
    }
    return convos;
  },

  async addAssistantMessage(msg: AssistantConversation, userId?: string): Promise<number> {
    return await db.assistantConversations.add({
      ...msg,
      userId: userId || msg.userId,
    });
  },

  // Backup & Restore (JSON Export / Import)
  async exportAllData(): Promise<string> {
    const exportData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      farms: await db.farms.toArray(),
      fields: await db.fields.toArray(),
      sensors: await db.sensors.toArray(),
      sensorReadings: await db.sensorReadings.toArray(),
      irrigationSchedules: await db.irrigationSchedules.toArray(),
      dailyActivities: await db.dailyActivities.toArray(),
      recommendations: await db.recommendations.toArray(),
      assistantConversations: await db.assistantConversations.toArray(),
      userPreferences: await db.userPreferences.toArray(),
    };
    return JSON.stringify(exportData, null, 2);
  },

  async importDataFromJson(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.farms)) {
        throw new Error('Invalid FarmVeda backup format');
      }

      await db.transaction('rw', [
        db.farms,
        db.fields,
        db.sensors,
        db.sensorReadings,
        db.irrigationSchedules,
        db.dailyActivities,
        db.recommendations,
        db.assistantConversations,
        db.userPreferences,
      ], async () => {
        if (data.farms) {
          await db.farms.clear();
          await db.farms.bulkAdd(data.farms);
        }
        if (data.fields) {
          await db.fields.clear();
          await db.fields.bulkAdd(data.fields);
        }
        if (data.sensors) {
          await db.sensors.clear();
          await db.sensors.bulkAdd(data.sensors);
        }
        if (data.sensorReadings) {
          await db.sensorReadings.clear();
          await db.sensorReadings.bulkAdd(data.sensorReadings);
        }
        if (data.irrigationSchedules) {
          await db.irrigationSchedules.clear();
          await db.irrigationSchedules.bulkAdd(data.irrigationSchedules);
        }
        if (data.dailyActivities) {
          await db.dailyActivities.clear();
          await db.dailyActivities.bulkAdd(data.dailyActivities);
        }
        if (data.recommendations) {
          await db.recommendations.clear();
          await db.recommendations.bulkAdd(data.recommendations);
        }
        if (data.userPreferences) {
          await db.userPreferences.clear();
          await db.userPreferences.bulkAdd(data.userPreferences);
        }
      });
      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  },
};
