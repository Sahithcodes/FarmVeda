import { SensorReading, Sensor } from '../types';
import { dbService } from '../db/dbService';

export const sensorSimulator = {
  // Generate realistic subtle variation based on base reading
  generateSimulatedReading(
    currentReading?: SensorReading,
    sensorId = 'sensor-01',
    farmId = 'farm-01',
    fieldId = 'field-01'
  ): SensorReading {
    const baseMoisture = currentReading ? currentReading.moisturePercent : 68;
    const baseTemp = currentReading ? currentReading.temperatureC : 29;
    const baseHumidity = currentReading ? currentReading.humidityPercent : 72;

    // Subtle drift: +/- 1 or 2%
    const deltaMoist = (Math.random() - 0.48) * 1.5;
    const newMoisture = Math.round(Math.max(25, Math.min(88, baseMoisture + deltaMoist)));

    const deltaTemp = (Math.random() - 0.5) * 0.8;
    const newTemp = Math.round((baseTemp + deltaTemp) * 10) / 10;

    const deltaHum = (Math.random() - 0.5) * 2;
    const newHumidity = Math.round(Math.max(40, Math.min(95, baseHumidity + deltaHum)));

    return {
      sensorId,
      farmId,
      fieldId,
      timestamp: new Date().toISOString(),
      moisturePercent: newMoisture,
      temperatureC: Math.round(newTemp),
      humidityPercent: newHumidity,
      rainfallMm: Math.random() > 0.85 ? 1.2 : 0,
      irrigationActive: currentReading?.irrigationActive || false,
      isSimulated: true,
    };
  },

  // Simulate a live pulse step and store in db
  async pulseSensorData(
    fieldId: string,
    farmId: string,
    sensorId: string,
    currentReading?: SensorReading
  ): Promise<SensorReading> {
    const newReading = this.generateSimulatedReading(currentReading, sensorId, farmId, fieldId);
    await dbService.addSensorReading(newReading);
    return newReading;
  },
};

