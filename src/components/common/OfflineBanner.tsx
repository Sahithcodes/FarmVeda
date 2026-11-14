import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Database, Info } from 'lucide-react';

export const OfflineBanner: React.FC<{ backendMode?: boolean }> = ({ backendMode = false }) => {
  const { language } = useLanguage();

  const notices = {
    en: "Local Storage Mode: All records persist offline on this device. Sensor readings are locally simulated demonstrations.",
    hi: "स्थानीय संग्रहण मोड: सारा डेटा आपके फोन में सुरक्षित है। सेंसर रीडिंग स्थानीय नमूना सिमुलेशन हैं।",
    kn: "ಸ್ಥಳೀಯ ಶೇಖರಣಾ ಮೋಡ್: ಎಲ್ಲಾ ಮಾಹಿತಿಯು ಈ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿದೆ. ಸೆನ್ಸಾರ್ ರೀಡಿಂಗ್‌ಗಳು ಮಾದರಿ ಸಿಮ್ಯುಲೇಶನ್ ಆಗಿವೆ.",
  };

  return (
    <div className="bg-[#10251F]/95 border-b border-[#244D3F] px-4 py-1.5 text-[11px] text-[#A9BDB1] flex items-center justify-center gap-2">
      <Database className="w-3.5 h-3.5 text-[#64D995] flex-shrink-0" />
      <span className="font-semibold text-center text-[#F4F8F5]">
        {backendMode ? 'Backend API mode: farm and sensor data are loaded from the server. Synthetic demo readings are labelled; watering advice is experimental and advisory only.' : notices[language] || notices.en}
      </span>
    </div>
  );
};

