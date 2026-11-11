import { Language, SensorReading, Sensor, IrrigationSchedule, Field, Farm } from '../types';

export interface SurvamResponse {
  text: string;
  action?: 'navigate_irrigation' | 'navigate_sensors' | 'navigate_weather' | 'navigate_schedule' | 'navigate_analytics' | 'navigate_farms';
}

export const survamAiService = {
  // Speech Recognition (Web Speech API)
  createRecognition(
    language: Language,
    onResult: (text: string) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): any | null {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API is not supported in this browser environment.');
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Locale mapping
      if (language === 'hi') {
        recognition.lang = 'hi-IN';
      } else if (language === 'kn') {
        recognition.lang = 'kn-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        onError(event);
      };

      recognition.onend = () => {
        onEnd();
      };

      return recognition;
    } catch (e) {
      console.error('Failed to create SpeechRecognition:', e);
      return null;
    }
  },

  // Speech Synthesis (SpeechSynthesis API)
  speak(text: string, language: Language, pitch = 1.0, rate = 0.95): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.warn('SpeechSynthesis is not supported in this browser.');
        resolve();
        return;
      }

      // Stop any active speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;

      if (language === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (language === 'kn') {
        utterance.lang = 'kn-IN';
      } else {
        utterance.lang = 'en-IN';
      }

      // Try to select an Indian voice if available in the system
      const voices = window.speechSynthesis.getVoices();
      const targetLangPrefix = language === 'hi' ? 'hi' : language === 'kn' ? 'kn' : 'en-IN';
      const matchedVoice = voices.find(
        (v) => v.lang.startsWith(targetLangPrefix) || v.lang.toLowerCase().includes(targetLangPrefix.toLowerCase())
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  },

  stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  // Rule-based contextual query processing engine
  generateResponse(
    query: string,
    language: Language,
    context: {
      latestReading?: SensorReading;
      activeSensors?: Sensor[];
      irrigationSchedule?: IrrigationSchedule;
      registeredFields?: Field[];
      registeredFarms?: Farm[];
      farmerName?: string;
      fieldName?: string;
    }
  ): SurvamResponse {
    const q = query.toLowerCase().trim();
    const reading: SensorReading = context.latestReading || {
      id: 0,
      sensorId: 'SN-001',
      farmId: '1',
      fieldId: '1',
      moisturePercent: 68,
      temperatureC: 29,
      humidityPercent: 72,
      rainfallMm: 0,
      irrigationActive: false,
      timestamp: new Date().toISOString(),
      readingDate: new Date().toISOString().split('T')[0],
      readingTime: new Date().toTimeString().slice(0, 5),
      source: 'simulated',
    };
    const sensors = context.activeSensors || [];
    const fields = context.registeredFields || [];
    const farms = context.registeredFarms || [];
    const schedule = context.irrigationSchedule;
    const moisture = reading.moisturePercent ?? (reading as any).soilMoisture ?? 68;
    const temp = reading.temperatureC ?? (reading as any).temperature ?? 29;
    const farmer = context.farmerName || 'Farmer';
    const field = context.fieldName || (fields[0]?.name) || 'Field';

    // 1. Fields Registered Query
    if (
      q.includes('how many field') ||
      q.includes('number of field') ||
      q.includes('registered field') ||
      q.includes('कितने हिस्से') ||
      q.includes('कितने खेत') ||
      q.includes('कितने फ़ील्ड') ||
      q.includes('ಎಷ್ಟು ಕ್ಷೇತ್ರ') ||
      q.includes('ಕ್ಷೇತ್ರಗಳು')
    ) {
      const fieldCount = fields.length;
      const fieldNames = fields.map((f) => `${f.name || f.fieldName} (${f.cropType})`).join(', ');

      if (language === 'hi') {
        return {
          text: `आपने कुल ${fieldCount} हिस्से पंजीकृत किए हैं: ${fieldNames || 'कोई हिस्सा नहीं'}। कुल पंजीकृत क्षेत्रफल लगभग ${fields.reduce((acc, f) => acc + (f.areaAcres || f.fieldArea || 0), 0)} एकड़ है।`,
          action: 'navigate_farms',
        };
      } else if (language === 'kn') {
        return {
          text: `ನೀವು ಒಟ್ಟು ${fieldCount} ಕ್ಷೇತ್ರಗಳನ್ನು ನೋಂದಾಯಿಸಿದ್ದೀರಿ: ${fieldNames || 'ಯಾವುದೂ ಇಲ್ಲ'}. ಒಟ್ಟು ವಿಸ್ತೀರ್ಣ ${fields.reduce((acc, f) => acc + (f.areaAcres || f.fieldArea || 0), 0)} ಎಕರೆ.`,
          action: 'navigate_farms',
        };
      } else {
        return {
          text: `You have registered ${fieldCount} fields: ${fieldNames || 'None'}. Total cultivated area is ${fields.reduce((acc, f) => acc + (f.areaAcres || f.fieldArea || 0), 0)} acres.`,
          action: 'navigate_farms',
        };
      }
    }

    // 2. Crops Growing Query
    if (
      q.includes('crop') ||
      q.includes('growing') ||
      q.includes('फसल') ||
      q.includes('फसलें') ||
      q.includes('ಬೆಳೆಗಳು') ||
      q.includes('ಬೆಳೆ')
    ) {
      const uniqueCrops = Array.from(new Set(fields.map((f) => f.cropType))).filter(Boolean);
      const cropsText = uniqueCrops.join(', ') || 'Rice, Wheat, Tomato';

      if (language === 'hi') {
        return {
          text: `वर्तमान में आपके खेतों में निम्नलिखित फसलें उगाई जा रही हैं: ${cropsText}। सभी फसलें स्थानीय जल संरक्षण मानकों के अनुसार स्वस्थ स्थिति में हैं।`,
          action: 'navigate_farms',
        };
      } else if (language === 'kn') {
        return {
          text: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜಮೀನಿನಲ್ಲಿ ಈ ಕೆಳಗಿನ ಬೆಳೆಗಳನ್ನು ಬೆಳೆಯಲಾಗುತ್ತಿದೆ: ${cropsText}. ಎಲ್ಲಾ ಬೆಳೆಗಳ ಬೆಳವಣಿಗೆ ಉತ್ತಮವಾಗಿದೆ.`,
          action: 'navigate_farms',
        };
      } else {
        return {
          text: `You are currently cultivating: ${cropsText}. Soil hydration across these blocks is actively monitored.`,
          action: 'navigate_farms',
        };
      }
    }

    // 3. Offline / Inactive Sensor Query
    if (
      q.includes('offline') ||
      q.includes('which sensor') ||
      q.includes('inactive sensor') ||
      q.includes('कौन सा सेंसर') ||
      q.includes('ऑफलाइन') ||
      q.includes('ಯಾವ ಸೆನ್ಸಾರ್') ||
      q.includes('ಆಫ್‌ಲೈನ್')
    ) {
      const offlineSensors = sensors.filter(
        (s) => s.status === 'offline' || s.status === 'inactive'
      );

      if (offlineSensors.length === 0) {
        if (language === 'hi') {
          return {
            text: `बधाई हो! आपके सभी ${sensors.length} सेंसर पूरी तरह सक्रिय और ऑनलाइन काम कर रहे हैं।`,
            action: 'navigate_sensors',
          };
        } else if (language === 'kn') {
          return {
            text: `ಉತ್ತಮ ಸುದ್ದಿ! ನಿಮ್ಮ ಎಲ್ಲಾ ${sensors.length} ಸಂವೇದಕಗಳು ಸಕ್ರಿಯವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ.`,
            action: 'navigate_sensors',
          };
        } else {
          return {
            text: `Great news! All ${sensors.length} registered sensors are active and communicating properly.`,
            action: 'navigate_sensors',
          };
        }
      }

      const offlineDetails = offlineSensors
        .map((s) => `${s.sensorCode || s.sensorName || s.sensorId}`)
        .join(', ');

      if (language === 'hi') {
        return {
          text: `वर्तमान में ${offlineSensors.length} सेंसर ऑफलाइन है: ${offlineDetails}। कृपया उनका बैटरी स्तर या कनेक्शन जांचें।`,
          action: 'navigate_sensors',
        };
      } else if (language === 'kn') {
        return {
          text: `ಪ್ರಸ್ತುತ ${offlineSensors.length} ಸಂವೇದಕ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದೆ: ${offlineDetails}. ದಯವಿಟ್ಟು ಬ್ಯಾಟರಿ ಮತ್ತು ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ.`,
          action: 'navigate_sensors',
        };
      } else {
        return {
          text: `Currently ${offlineSensors.length} sensor node is offline: ${offlineDetails}. Please verify physical battery and solar panel connection.`,
          action: 'navigate_sensors',
        };
      }
    }

    // 4. Last Sensor Reading Recorded Query
    if (
      q.includes('last reading') ||
      q.includes('when was') ||
      q.includes('recorded') ||
      q.includes('अंतिम रीडिंग') ||
      q.includes('कब दर्ज') ||
      q.includes('ಕೊನೆಯ ರೀಡಿಂಗ್') ||
      q.includes('ಯಾವಾಗ ದಾಖಲ')
    ) {
      const dateStr = reading.readingDate || (reading.timestamp ? new Date(reading.timestamp).toLocaleDateString() : 'Today');
      const timeStr = reading.readingTime || (reading.timestamp ? new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently');
      const sourceStr = reading.source === 'manual' ? 'manual meter input' : 'telemetry node';

      if (language === 'hi') {
        return {
          text: `अंतिम सेंसर रीडिंग ${dateStr} को ${timeStr} पर दर्ज की गई थी (${reading.source === 'manual' ? 'मैनुअल प्रविष्टि' : 'सिमुलेटेड टेलीमेट्री'})। उस समय मिट्टी की नमी ${moisture}% और तापमान ${temp}°C था।`,
          action: 'navigate_sensors',
        };
      } else if (language === 'kn') {
        return {
          text: `ಕೊನೆಯ ಸೆನ್ಸಾರ್ ರೀಡಿಂಗ್ ${dateStr} ರಂದು ${timeStr} ಕ್ಕೆ ದಾಖಲಾಗಿದೆ. ಮಣ್ಣಿನ ತೇವಾಂಶ ${moisture}% ಮತ್ತು ತಾಪಮಾನ ${temp}°C ಇತ್ತು.`,
          action: 'navigate_sensors',
        };
      } else {
        return {
          text: `The last sensor reading was recorded on ${dateStr} at ${timeStr} via ${sourceStr}. Root moisture was ${moisture}% and temperature was ${temp}°C.`,
          action: 'navigate_sensors',
        };
      }
    }

    // 5. Soil Moisture Query
    if (
      q.includes('moisture') ||
      q.includes('soil') ||
      q.includes('नमी') ||
      q.includes('मिट्टी') ||
      q.includes('ತೇವಾಂಶ') ||
      q.includes('ಮಣ್ಣಿನ')
    ) {
      if (language === 'hi') {
        if (moisture < 45) {
          return {
            text: `आपकी मिट्टी में नमी ${moisture} प्रतिशत है। नमी कम हो रही है। आपको ${field} में सिंचाई करने की आवश्यकता हो सकती है।`,
            action: 'navigate_irrigation',
          };
        } else if (moisture > 75) {
          return {
            text: `आपकी मिट्टी में नमी ${moisture} प्रतिशत है। मिट्टी में पर्याप्त से अधिक पानी है, अभी सिंचाई की आवश्यकता नहीं है।`,
            action: 'navigate_analytics',
          };
        } else {
          return {
            text: `आपकी मिट्टी में नमी ${moisture} प्रतिशत है। यह फसल के स्वास्थ्य के लिए बिल्कुल उत्तम और अनुकूल है।`,
            action: 'navigate_analytics',
          };
        }
      } else if (language === 'kn') {
        if (moisture < 45) {
          return {
            text: `ನಿಮ್ಮ ಮಣ್ಣಿನ ತೇವಾಂಶ ${moisture} ಶೇಕಡಾ ಇದೆ. ತೇವಾಂಶ ಕಡಿಮೆಯಾಗುತ್ತಿದೆ. ನಿಮ್ಮ ${field} ಕ್ಷೇತ್ರಕ್ಕೆ ನೀರಾವರಿ ಅಗತ್ಯವಿರಬಹುದು.`,
            action: 'navigate_irrigation',
          };
        } else if (moisture > 75) {
          return {
            text: `ನಿಮ್ಮ ಮಣ್ಣಿನ ತೇವಾಂಶ ${moisture} ಶೇಕಡಾ ಇದೆ. ಮಣ್ಣಿನಲ್ಲಿ ಸಾಕಷ್ಟು ನೀರಿದೆ, ಈಗ ನೀರುಣಿಸುವ ಅಗತ್ಯವಿಲ್ಲ.`,
            action: 'navigate_analytics',
          };
        } else {
          return {
            text: `ನಿಮ್ಮ ಮಣ್ಣಿನ ತೇವಾಂಶ ${moisture} ಶೇಕಡಾ ಇದೆ. ಇದು ಬೆಳೆಯ ಬೆಳವಣಿಗೆಗೆ ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿದೆ.`,
            action: 'navigate_analytics',
          };
        }
      } else {
        if (moisture < 45) {
          return {
            text: `Your soil moisture is ${moisture} percent. It is getting low. You may need to irrigate ${field}.`,
            action: 'navigate_irrigation',
          };
        } else if (moisture > 75) {
          return {
            text: `Your soil moisture is ${moisture} percent. The root zone is well saturated. No watering required right now.`,
            action: 'navigate_analytics',
          };
        } else {
          return {
            text: `Your soil moisture is ${moisture} percent. It is healthy and within optimal threshold for your crops.`,
            action: 'navigate_analytics',
          };
        }
      }
    }

    // 6. Irrigation Query
    if (
      q.includes('irrigate') ||
      q.includes('irrigation') ||
      q.includes('water') ||
      q.includes('pump') ||
      q.includes('सिंचाई') ||
      q.includes('पानी') ||
      q.includes('पंप') ||
      q.includes('ನೀರಾವರಿ') ||
      q.includes('ನೀರು') ||
      q.includes('ಪಂಪ್')
    ) {
      if (language === 'hi') {
        return {
          text: `सिंचाई स्थिति: पंप वर्तमान में ${schedule?.status === 'ON' ? 'चालू' : 'बंद'} है। मिट्टी की नमी ${moisture}% है। अनुशंसित सीमा 50% है। ${moisture < 50 ? 'आपको सिंचाई शुरू करनी चाहिए।' : 'अभी अतिरिक्त पानी की जरूरत नहीं है।'}`,
          action: 'navigate_irrigation',
        };
      } else if (language === 'kn') {
        return {
          text: `ನೀರಾವರಿ ಸ್ಥಿತಿ: ಪಂಪ್ ಪ್ರಸ್ತುತ ${schedule?.status === 'ON' ? 'ಆನ್' : 'ಆಫ್'} ಆಗಿದೆ. ಮಣ್ಣಿನ ತೇವಾಂಶ ${moisture}% ಇದೆ. ${moisture < 50 ? 'ನೀವು ನೀರಾವರಿ ಆರಂಭಿಸುವುದು ಸೂಕ್ತ.' : 'ಈಗ ನೀರು ಹಾಯಿಸುವ ಅಗತ್ಯವಿಲ್ಲ.'}`,
          action: 'navigate_irrigation',
        };
      } else {
        return {
          text: `Irrigation status: Pump is currently ${schedule?.status || 'OFF'}. Soil moisture is ${moisture}%. Target threshold is ${schedule?.moistureThreshold || 50}%. ${moisture < 50 ? 'Irrigation is recommended.' : 'No immediate irrigation needed.'}`,
          action: 'navigate_irrigation',
        };
      }
    }

    // 7. Temperature Query
    if (
      q.includes('temperature') ||
      q.includes('hot') ||
      q.includes('तापमान') ||
      q.includes('गर्मी') ||
      q.includes('ತಾಪಮಾನ') ||
      q.includes('ಉಷ್ಣಾಂಶ')
    ) {
      if (language === 'hi') {
        return {
          text: `आज आपके खेत पर तापमान ${temp} डिग्री सेल्सियस और आर्द्रता ${reading.humidityPercent}% है। दोपहर में फसल को सीधी तेज धूप से बचाने के लिए उचित निगरानी रखें।`,
          action: 'navigate_weather',
        };
      } else if (language === 'kn') {
        return {
          text: `ಇಂದು ನಿಮ್ಮ ಹೊಲದಲ್ಲಿ ತಾಪಮಾನ ${temp}°C ಮತ್ತು ಆರ್ದ್ರತೆ ${reading.humidityPercent}% ಇದೆ. ವಾತಾವರಣವು ಬೆಳೆಗೆ ಅನುಕೂಲಕರವಾಗಿದೆ.`,
          action: 'navigate_weather',
        };
      } else {
        return {
          text: `Today's temperature on your farm is ${temp}°C with ${reading.humidityPercent}% relative humidity. Conditions are favorable for normal crop transpiration.`,
          action: 'navigate_weather',
        };
      }
    }

    // 8. Rain & Weather Query
    if (
      q.includes('rain') ||
      q.includes('weather') ||
      q.includes('forecast') ||
      q.includes('बारिश') ||
      q.includes('मौसम') ||
      q.includes('वर्षा') ||
      q.includes('ಮಳೆ') ||
      q.includes('ಹವಾಮಾನ')
    ) {
      if (language === 'hi') {
        return {
          text: `मौसम पूर्वानुमान: आज बारिश की संभावना 20% है। कल दोपहर बाद 12 मिमी तक बारिश का अनुमान है। इसलिए सिंचाई को कुछ समय के लिए टाल सकते हैं।`,
          action: 'navigate_weather',
        };
      } else if (language === 'kn') {
        return {
          text: `ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ: ಇಂದು ಮಳೆಯ ಸಾಧ್ಯತೆ 20% ಇದೆ. ನಾಳೆ ಮಧ್ಯಾಹ್ನ 12 ಮಿ.ಮೀ ಮಳೆ ಬರುವ ನಿರೀಕ್ಷೆಯಿದೆ. ಆದ್ದರಿಂದ ನೀರಾವರಿಯನ್ನು ಮುಂದೂಡಬಹುದು.`,
          action: 'navigate_weather',
        };
      } else {
        return {
          text: `Weather update: 20% rain chance today. Moderate rainfall of 12 mm is forecasted for tomorrow afternoon. You can hold off on heavy open watering.`,
          action: 'navigate_weather',
        };
      }
    }

    // 9. Sensor Working Query
    if (
      q.includes('sensor') ||
      q.includes('working') ||
      q.includes('online') ||
      q.includes('सेंसर') ||
      q.includes('काम') ||
      q.includes('ಸಂವೇದಕ') ||
      q.includes('ಕೆಲಸ')
    ) {
      const activeCount = sensors.filter((s) => s.status === 'online' || s.status === 'active').length;
      const offlineCount = sensors.filter((s) => s.status === 'offline' || s.status === 'inactive').length;

      if (language === 'hi') {
        return {
          text: `सेंसर स्थिति: ${activeCount} सक्रिय सेंसर डेटा भेज रहे हैं। ${offlineCount > 0 ? `${offlineCount} सेंसर ऑफलाइन है।` : 'सभी उपकरण ठीक से काम कर रहे हैं।'}`,
          action: 'navigate_sensors',
        };
      } else if (language === 'kn') {
        return {
          text: `ಸಂವೇದಕಗಳ ಸ್ಥಿತಿ: ${activeCount} ಸೆನ್ಸಾರ್‌ಗಳು ಸಕ್ರಿಯವಾಗಿವೆ. ${offlineCount > 0 ? `${offlineCount} ಸಂವೇದಕ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದೆ.` : 'ಎಲ್ಲಾ ಸಂವೇದಕಗಳು ಕೆಲಸ ಮಾಡುತ್ತಿವೆ.'}`,
          action: 'navigate_sensors',
        };
      } else {
        return {
          text: `Sensor status: ${activeCount} active sensors transmitting telemetry. ${offlineCount > 0 ? `${offlineCount} sensor is currently offline.` : 'All sensor nodes are fully functional.'}`,
          action: 'navigate_sensors',
        };
      }
    }

    // 10. General Farm Health / Greeting
    if (
      q.includes('how') ||
      q.includes('farm') ||
      q.includes('today') ||
      q.includes('नमस्ते') ||
      q.includes('कैसा') ||
      q.includes('ಹೇಗಿದೆ') ||
      q.includes('ಹೊಲ') ||
      q.includes('hello') ||
      q.includes('hi')
    ) {
      if (language === 'hi') {
        return {
          text: `नमस्ते ${farmer}! आज आपका खेत कुल मिलाकर स्वस्थ है। मिट्टी की नमी ${moisture}%, तापमान ${temp}°C है। आपके पास ${fields.length} पंजीकृत हिस्से और ${sensors.length} सेंसर हैं।`,
          action: 'navigate_analytics',
        };
      } else if (language === 'kn') {
        return {
          text: `ನಮಸ್ಕಾರ ${farmer}! ಇಂದು ನಿಮ್ಮ ಕೃಷಿ ಕ್ಷೇತ್ರ ಉತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿದೆ. ಮಣ್ಣಿನ ತೇವಾಂಶ ${moisture}%, ತಾಪಮಾನ ${temp}°C ಇದೆ. ನೀವು ${fields.length} ಕ್ಷೇತ್ರಗಳು ಮತ್ತು ${sensors.length} ಸೆನ್ಸಾರ್‌ಗಳನ್ನು ಹೊಂದಿದ್ದೀರಿ.`,
          action: 'navigate_analytics',
        };
      } else {
        return {
          text: `Hello ${farmer}! Overall farm health is good today. Soil moisture is at ${moisture}%, temperature is ${temp}°C. You have ${fields.length} registered fields and ${sensors.length} telemetry sensors.`,
          action: 'navigate_analytics',
        };
      }
    }

    // Fallback
    if (language === 'hi') {
      return {
        text: `मैं आपकी बात समझ रहा हूँ। वर्तमान में आपके खेत में मिट्टी की नमी ${moisture}% और तापमान ${temp}°C है। आप मुझसे खेत के हिस्से, फसलें, नमी, सिंचाई, मौसम या सेंसर के बारे में पूछ सकते हैं।`,
      };
    } else if (language === 'kn') {
      return {
        text: `ನಾನು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಗಮನಿಸಿದ್ದೇನೆ. ಸದ್ಯಕ್ಕೆ ನಿಮ್ಮ ಹೊಲದಲ್ಲಿ ಮಣ್ಣಿನ ತೇವಾಂಶ ${moisture}% ಮತ್ತು ತಾಪಮಾನ ${temp}°C ಇದೆ. ನೀವು ಕ್ಷೇತ್ರಗಳು, ಬೆಳೆಗಳು, ತೇವಾಂಶ ಅಥವಾ ನೀರಾವರಿಯ ಬಗ್ಗೆ ವಿಚಾರಿಸಬಹುದು.`,
      };
    } else {
      return {
        text: `I understood your query. Currently, root zone moisture is ${moisture}% and temperature is ${temp}°C. You can ask me about registered fields, crops growing, soil moisture, irrigation schedule, weather forecast, or sensor health.`,
      };
    }
  },
};
