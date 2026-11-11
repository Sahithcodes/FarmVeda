import { WeatherDay, Language } from '../types';

export const weatherService = {
  get5DayForecast(language: Language): WeatherDay[] {
    const today = new Date();
    
    // Advisories per language
    const advisories = {
      en: [
        "Favorable sunny conditions. Suitable for intercultural operations, foliar spray and weed management.",
        "Rain showers expected in afternoon (12 mm). Postpone surface flood irrigation and chemical spraying.",
        "Cloudy and cool. Ideal for nursery seedling transplantation and compost incorporation.",
        "Mild sunshine with breezy conditions (18 km/h). Safe for routine soil hoeing and earthing-up.",
        "Clear sunny skies. Check soil moisture levels and schedule drip irrigation if required.",
      ],
      hi: [
        "धूप खिली रहेगी। निराई-गुड़ाई, कीटनाशक छिड़काव और खरपतवार नियंत्रण के लिए उपयुक्त दिन।",
        "दोपहर बाद हल्की बारिश (12 मिमी) की संभावना। खुली सिंचाई और छिड़काव का काम आज टालें।",
        "हल्के बादल छाए रहेंगे। नर्सरी पौधों के रोपण और जैविक खाद डालने के लिए अनुकूल समय।",
        "हल्की हवा और धूप रहेगी। सामान्य निराई और खेत की सफाई के लिए अच्छा मौसम।",
        "मौसम साफ रहेगा। मिट्टी की नमी जांचें और जरूरत पड़ने पर ड्रिप सिंचाई चालू करें।",
      ],
      kn: [
        "ಬಿಸಿಲು ವಾತಾವರಣ. ಕಳೆ ಕೀಳಲು, ಔಷಧಿ ಸಿಂಪಡಿಸಲು ಮತ್ತು ಗೊಬ್ಬರ ಹಾಕಲು ಅತ್ಯಂತ ಸೂಕ್ತ ದಿನ.",
        "ಮಧ್ಯಾಹ್ನ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ (12 ಮಿ.ಮೀ). ತೆರೆದ ಕಾಲುವೆ ನೀರಾವರಿ ಮತ್ತು ಔಷಧಿ ಸಿಂಪರಣೆ ಮುಂದೂಡಿ.",
        "ಮೋಡ ಕವಿದ ತಂಪಾದ ವಾತಾವರಣ. ಸಸಿ ಮಡಿ ನಾಟಿಗೆ ಮತ್ತು ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಬೆರೆಸಲು ಪ್ರಶಸ್ತ ಸಮಯ.",
        "ಸಾಧಾರಣ ಗಾಳಿ ಮತ್ತು ಬಿಸಿಲು. ಹೊಲದ ಸಾಮಾನ್ಯ ಕೆಲಸಗಳಿಗೆ ಉತ್ತಮ ವಾತಾವರಣ.",
        "ಸ್ಪಷ್ಟ ಬಿಸಿಲು ಇರಲಿದೆ. ಮಣ್ಣಿನ ತೇವಾಂಶ ಪರೀಕ್ಷಿಸಿ ಅಗತ್ಯವಿದ್ದರೆ ಹನಿ ನೀರಾವರಿ ಪ್ರಾರಂಭಿಸಿ.",
      ],
    };

    const daysEn = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysHi = ['आज', 'कल', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार', 'रविवार'];
    const daysKn = ['ಇಂದು', 'ನಾಳೆ', 'ಬುಧವಾರ', 'ಗುರುವಾರ', 'ಶುಕ್ರವಾರ', 'ಶನಿವಾರ', 'ಭಾನುವಾರ'];

    const langAdvisories = advisories[language] || advisories.en;
    const langDays = language === 'hi' ? daysHi : language === 'kn' ? daysKn : daysEn;

    const conditions: ('sunny' | 'rainy' | 'cloudy' | 'partlyCloudy')[] = [
      'sunny',
      'rainy',
      'cloudy',
      'partlyCloudy',
      'sunny',
    ];

    const temps = [
      { max: 31, min: 21, rainProb: 15, rainMm: 0, humidity: 68, wind: 12 },
      { max: 27, min: 19, rainProb: 80, rainMm: 12, humidity: 88, wind: 18 },
      { max: 28, min: 20, rainProb: 40, rainMm: 2, humidity: 76, wind: 14 },
      { max: 30, min: 21, rainProb: 10, rainMm: 0, humidity: 62, wind: 16 },
      { max: 32, min: 22, rainProb: 5, rainMm: 0, humidity: 58, wind: 11 },
    ];

    return temps.map((t, idx) => {
      const d = new Date(today.getTime() + idx * 86400000);
      return {
        date: d.toLocaleDateString(),
        dayName: langDays[idx % langDays.length],
        condition: conditions[idx],
        tempMax: t.max,
        tempMin: t.min,
        rainfallMm: t.rainMm,
        rainProbability: t.rainProb,
        humidity: t.humidity,
        windSpeedKmh: t.wind,
        farmingAdvisory: langAdvisories[idx],
      };
    });
  },
};

