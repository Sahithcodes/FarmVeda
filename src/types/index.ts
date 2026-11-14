export type Language = 'en' | 'hi' | 'kn';

export type CropType = 
  | 'Rice' 
  | 'Wheat' 
  | 'Cotton' 
  | 'Maize' 
  | 'Sugarcane' 
  | 'Groundnut' 
  | 'Tomato' 
  | 'Other';

export type SoilType = 
  | 'Sandy' 
  | 'Clay' 
  | 'Silt' 
  | 'Loamy' 
  | 'Black Soil' 
  | 'Red Soil';

export type AreaUnit = 'Acres' | 'Hectares';

export type IrrigationType = 
  | 'Drip Irrigation'
  | 'Sprinkler Irrigation'
  | 'Flood Irrigation'
  | 'Manual Irrigation'
  | 'Other';

export type SensorType = 
  | 'Soil Moisture Sensor'
  | 'Temperature Sensor'
  | 'Humidity Sensor'
  | 'Rainfall Sensor'
  | 'Multi-Parameter Sensor';

export type SensorStatus = 'online' | 'offline' | 'warning' | 'active' | 'inactive';

export type IrrigationMode = 'manual' | 'auto';

export type FarmerDesignation =
  | 'Smallholder Farmer'
  | 'Commercial Cultivator'
  | 'Farm Owner & Manager'
  | 'Organic Grower'
  | 'Agriculturalist / Agronomist';

export interface UserProfile {
  id: string; // e.g. "usr-demo-01" or "usr-1731..."
  fullName: string;
  email: string;
  mobileNumber: string;
  passwordHash: string; // SHA-256 hex string
  preferredLanguage: Language;
  state: string;
  district: string;
  designation?: FarmerDesignation | string;
  avatarUrl?: string;
  termsAccepted: boolean;
  createdAt: string; // ISO string
  lastLoginAt?: string;
}

export interface Farm {
  id: string;
  userId?: string;
  name: string; // backwards compatibility alias for farmName
  farmName?: string;
  ownerName: string; // backwards compatibility alias for farmerName
  farmerName?: string;
  location: string;
  village?: string;
  district?: string;
  state?: string;
  totalArea: number;
  areaUnit?: AreaUnit;
  contactNumber?: string;
  createdAt: string;
}

export interface Field {
  id: string;
  userId?: string;
  farmId: string;
  name: string; // backwards compatibility alias for fieldName
  fieldName?: string;
  cropType: CropType;
  soilType: SoilType;
  areaAcres: number; // backwards compatibility alias for fieldArea
  fieldArea?: number;
  sowingDate: string; // backwards compatibility alias for plantingDate
  plantingDate?: string;
  irrigationType?: IrrigationType;
  description?: string;
  sensorId?: string;
}

export interface Sensor {
  id: string;
  userId?: string;
  sensorCode: string; // e.g. "SN-001" or "SN-NORTH-01"
  sensorId?: string;
  sensorName?: string;
  farmId: string;
  fieldId: string;
  sensorType?: SensorType;
  type?: string;
  status: SensorStatus;
  batteryLevel: number; // percentage
  installedDate: string;
  installationDate?: string;
  installationLocation?: string;
  lastUpdated: string;
}

export interface SensorReading {
  id?: number;
  userId?: string;
  sensorId: string;
  farmId: string;
  fieldId: string;
  timestamp: string; // ISO string
  readingDate?: string; // YYYY-MM-DD
  readingTime?: string; // HH:MM
  moisturePercent: number; // 0 - 100 (soilMoisture)
  soilMoisture?: number;
  temperatureC: number;    // in Celsius (temperature)
  temperature?: number;
  humidityPercent: number; // 0 - 100 (humidity)
  humidity?: number;
  rainfallMm: number;      // mm (rainfall)
  rainfall?: number;
  irrigationActive: boolean; // (irrigationStatus)
  irrigationStatus?: 'ON' | 'OFF';
  isSimulated?: boolean;
  source?: 'manual' | 'simulated' | 'sensor' | 'synthetic_demo';
}

export interface IrrigationSchedule {
  id: string;
  userId?: string;
  farmId: string;
  fieldId: string;
  mode: IrrigationMode;
  status: 'OFF' | 'ON';
  moistureThreshold: number; // e.g. 40%
  durationMinutes: number;
  lastIrrigationTime: string;
  nextIrrigationTime: string;
  waterUsedLitersToday: number;
}

export interface DailyActivity {
  id: string;
  userId?: string;
  farmId: string;
  fieldId?: string;
  time: string; // e.g. "06:00 AM"
  time24: string; // e.g. "06:00" for sorting
  title: string;
  description: string;
  status: 'completed' | 'upcoming' | 'missed';
  category: 'monitoring' | 'irrigation' | 'weather' | 'fieldwork';
}

export interface Recommendation {
  id: string;
  userId?: string;
  farmId: string;
  fieldId?: string;
  type: 'moisture' | 'irrigation' | 'weather' | 'temperature' | 'sensor';
  severity: 'healthy' | 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  actionText?: string;
  timestamp: string;
  isRead?: boolean;
}

export interface AssistantConversation {
  id?: number;
  userId?: string;
  sender: 'farmer' | 'survam';
  text: string;
  language: Language;
  timestamp: string;
}

export interface UserPreferences {
  id: string;
  farmerName: string;
  phoneNumber?: string;
  villageName?: string;
  selectedLanguage: Language;
  onboardingCompleted: boolean;
  voicePitch: number;
  voiceRate: number;
  autoSpeak: boolean;
  activeFarmId: string;
  activeFieldId: string;
}

export interface WeatherDay {
  date: string;
  dayName: string;
  condition: 'sunny' | 'rainy' | 'cloudy' | 'partlyCloudy';
  tempMax: number;
  tempMin: number;
  rainfallMm: number;
  rainProbability: number;
  humidity: number;
  windSpeedKmh: number;
  farmingAdvisory: string;
}
