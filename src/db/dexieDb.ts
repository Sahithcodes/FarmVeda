import Dexie, { Table } from 'dexie';
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

export class FarmVedaDatabase extends Dexie {
  users!: Table<UserProfile, string>;
  farms!: Table<Farm, string>;
  fields!: Table<Field, string>;
  sensors!: Table<Sensor, string>;
  sensorReadings!: Table<SensorReading, number>;
  irrigationSchedules!: Table<IrrigationSchedule, string>;
  dailyActivities!: Table<DailyActivity, string>;
  recommendations!: Table<Recommendation, string>;
  assistantConversations!: Table<AssistantConversation, number>;
  userPreferences!: Table<UserPreferences, string>;

  constructor() {
    super('FarmVedaDB');
    this.version(1).stores({
      farms: 'id, name, ownerName, location',
      fields: 'id, farmId, cropType, soilType, sensorId',
      sensors: 'id, sensorCode, farmId, fieldId, status',
      sensorReadings: '++id, sensorId, farmId, fieldId, timestamp, moisturePercent',
      irrigationSchedules: 'id, farmId, fieldId, mode, status',
      dailyActivities: 'id, farmId, fieldId, time24, status, category',
      recommendations: 'id, farmId, fieldId, type, severity, timestamp',
      assistantConversations: '++id, sender, language, timestamp',
      userPreferences: 'id',
    });

    // Version 2 upgrade: enhanced indexing for search, filtering, and relationships
    this.version(2).stores({
      farms: 'id, name, farmName, ownerName, farmerName, location, village, district, state',
      fields: 'id, farmId, name, fieldName, cropType, soilType, sensorId',
      sensors: 'id, sensorCode, sensorId, farmId, fieldId, status, sensorType',
      sensorReadings: '++id, sensorId, farmId, fieldId, timestamp, moisturePercent, source',
    });

    // Version 3 upgrade: User Authentication & multi-user data separation
    this.version(3).stores({
      users: 'id, email, mobileNumber, fullName',
      farms: 'id, userId, name, farmName, ownerName, farmerName, location, village, district, state',
      fields: 'id, userId, farmId, name, fieldName, cropType, soilType, sensorId',
      sensors: 'id, userId, sensorCode, sensorId, farmId, fieldId, status, sensorType',
      sensorReadings: '++id, userId, sensorId, farmId, fieldId, timestamp, moisturePercent, source',
      dailyActivities: 'id, userId, farmId, fieldId, time24, status, category',
      assistantConversations: '++id, userId, sender, language, timestamp',
    });
  }
}

export const db = new FarmVedaDatabase();
