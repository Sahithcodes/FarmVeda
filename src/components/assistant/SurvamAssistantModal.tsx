import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { survamAiService, SurvamResponse } from '../../services/survamAiService';
import { VoiceWaveform } from './VoiceWaveform';
import {
  SensorReading,
  Sensor,
  IrrigationSchedule,
  AssistantConversation,
  Farm,
  Field,
} from '../../types';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface SurvamAssistantModalProps {
  latestReading?: SensorReading;
  sensors: Sensor[];
  farms?: Farm[];
  fields?: Field[];
  irrigationSchedule?: IrrigationSchedule;
  farmerName?: string;
  fieldName?: string;
  conversationHistory: AssistantConversation[];
  onAddMessage: (msg: AssistantConversation) => void;
  onNavigateTab: (tab: string) => void;
  onClose: () => void;
}

export const SurvamAssistantModal: React.FC<SurvamAssistantModalProps> = ({
  latestReading,
  sensors,
  farms = [],
  fields = [],
  irrigationSchedule,
  farmerName = 'Ramesh',
  fieldName = 'Field',
  conversationHistory,
  onAddMessage,
  onNavigateTab,
  onClose,
}) => {
  const { t, language, setLanguage } = useLanguage();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory, isSpeaking]);

  // Quick Questions
  const quickQuestions = [
    { id: 'farm', text: t('qqHowIsFarm') },
    { id: 'fields', text: t('qqFieldsRegistered') },
    { id: 'crops', text: t('qqCropsGrowing') },
    { id: 'moisture', text: t('qqSoilMoisture') },
    { id: 'irrigate', text: t('qqShouldIrrigate') },
    { id: 'lastReading', text: t('qqLastReadingTime') },
    { id: 'sensors', text: t('qqSensorWorking') },
    { id: 'temp', text: t('qqTemperature') },
    { id: 'rain', text: t('qqRainExpected') },
  ];

  // Process a user query through local rule engine
  const handleQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    // 1. Add Farmer message
    const farmerMsg: AssistantConversation = {
      sender: 'farmer',
      text: queryText,
      language,
      timestamp: new Date().toISOString(),
    };
    onAddMessage(farmerMsg);
    setInputText('');

    // 2. Local rule-based AI processing
    const response: SurvamResponse = survamAiService.generateResponse(
      queryText,
      language,
      {
        latestReading,
        activeSensors: sensors,
        registeredFarms: farms,
        registeredFields: fields,
        irrigationSchedule,
        farmerName,
        fieldName,
      }
    );

    // 3. Add Survam message
    const survamMsg: AssistantConversation = {
      sender: 'survam',
      text: response.text,
      language,
      timestamp: new Date().toISOString(),
    };
    onAddMessage(survamMsg);

    // 4. Voice Speech Synthesis
    setIsSpeaking(true);
    await survamAiService.speak(response.text, language);
    setIsSpeaking(false);

    // 5. If action suggests navigation
    if (response.action) {
      if (response.action === 'navigate_irrigation') onNavigateTab('irrigation');
      if (response.action === 'navigate_sensors') onNavigateTab('sensors');
      if (response.action === 'navigate_weather') onNavigateTab('weather');
      if (response.action === 'navigate_analytics') onNavigateTab('analytics');
      if (response.action === 'navigate_schedule') onNavigateTab('schedule');
      if (response.action === 'navigate_farms') onNavigateTab('farms');
    }
  };

  // Toggle Speech Recognition
  const toggleListening = () => {
    if (isListening) {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
      setIsListening(false);
      return;
    }

    // Stop speaking if active
    if (isSpeaking) {
      survamAiService.stopSpeaking();
      setIsSpeaking(false);
    }

    const recognition = survamAiService.createRecognition(
      language,
      (transcript) => {
        setIsListening(false);
        handleQuery(transcript);
      },
      (err) => {
        console.warn('Speech error:', err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (!recognition) {
      setSpeechSupported(false);
      return;
    }

    setRecognitionInstance(recognition);
    try {
      recognition.start();
      setIsListening(true);
    } catch (e) {
      console.warn('Failed to start recognition:', e);
      setIsListening(false);
    }
  };

  const handleStopSpeaking = () => {
    survamAiService.stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#10251F] rounded-3xl w-full max-w-2xl h-[92vh] max-h-[720px] shadow-2xl border border-[#244D3F] flex flex-col overflow-hidden animate-scale-in text-[#F4F8F5]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1713] via-[#10251F] to-[#0B1713] p-4 sm:p-5 text-white flex items-center justify-between border-b border-[#244D3F]">
          <div className="flex items-center gap-3">
            {/* Friendly Avatar */}
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2E8B57] to-[#1F6B41] border-2 border-[#F4B740]/60 flex items-center justify-center shadow-md">
              <Bot className="w-7 h-7 text-white" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#64D995] border-2 border-[#10251F] rounded-full animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight text-[#F4F8F5]">
                  {t('aiAssistantName')}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F4B740] text-[#0B1713] shadow-xs">
                  Local AI
                </span>
              </div>
              <p className="text-xs text-[#A9BDB1] font-medium">
                {t('aiSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Assistant Language Pill */}
            <div className="flex items-center bg-[#17332A] rounded-xl p-0.5 border border-[#244D3F]">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  language === 'en' ? 'bg-[#2E8B57] text-white' : 'text-[#A9BDB1]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  language === 'hi' ? 'bg-[#2E8B57] text-white' : 'text-[#A9BDB1]'
                }`}
              >
                हिं
              </button>
              <button
                onClick={() => setLanguage('kn')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  language === 'kn' ? 'bg-[#2E8B57] text-white' : 'text-[#A9BDB1]'
                }`}
              >
                ಕನ್ನ
              </button>
            </div>

            <button
              onClick={() => {
                survamAiService.stopSpeaking();
                onClose();
              }}
              className="p-1.5 rounded-full text-[#A9BDB1] hover:text-[#F4F8F5] hover:bg-[#17332A] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Local AI Offline Badge */}
        <div className="bg-[#17332A] px-4 py-2 text-[11px] font-semibold text-[#64D995] border-b border-[#244D3F] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#64D995]" />
            <span>{t('localAiNotice')}</span>
          </span>
          {isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="flex items-center gap-1 text-[11px] font-bold text-[#E45B5B] hover:underline cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Mute Voice</span>
            </button>
          )}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-[#0B1713]/80">
          {/* Welcome greeting banner */}
          <div className="bg-[#17332A] rounded-2xl p-4 border border-[#244D3F] shadow-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#10251F] border border-[#244D3F] text-[#F4B740] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm text-[#F4F8F5] leading-relaxed">
              <p className="font-extrabold text-[#64D995] mb-1">
                {t('survamAssistantTitle')}
              </p>
              <p className="text-[#A9BDB1]">
                {language === 'hi'
                  ? `नमस्ते ${farmerName} जी! FarmVeda में आपका पुनः स्वागत है। आज मैं आपके खेत की किस प्रकार सहायता कर सकता हूँ?`
                  : language === 'kn'
                  ? `ನಮಸ್ಕಾರ ${farmerName} ಅವರೇ! FarmVeda ಗೆ ಪುನಃ ಸುಸ್ವಾಗತ. ಇಂದು ನಿಮ್ಮ ಬೆಳೆಗಳ ಬಗ್ಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`
                  : `Welcome back, ${farmerName}! How can I help you with your farm today?`}
              </p>
            </div>
          </div>

          {/* Conversation history items */}
          {conversationHistory.map((msg, idx) => {
            const isSurvam = msg.sender === 'survam';
            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${
                  isSurvam ? 'justify-start' : 'justify-end'
                }`}
              >
                {isSurvam && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2E8B57] to-[#1F6B41] text-white flex items-center justify-center flex-shrink-0 text-xs font-black shadow-md border border-[#64D995]/30">
                    S
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isSurvam
                      ? 'bg-[#17332A] text-[#F4F8F5] border border-[#244D3F] font-medium'
                      : 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] text-white font-bold rounded-tr-none shadow-md'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 ${
                      isSurvam ? 'text-[#A9BDB1]' : 'text-emerald-200'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {!isSurvam && (
                  <div className="w-8 h-8 rounded-xl bg-[#1D4033] border border-[#244D3F] text-[#64D995] flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Active Listening / Speaking animations */}
          <VoiceWaveform isListening={isListening} isSpeaking={isSpeaking} />

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-[#10251F] border-t border-[#244D3F] overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[11px] font-bold text-[#A9BDB1] mr-1 flex-shrink-0">
              {t('quickQuestions')}
            </span>
            {quickQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => handleQuery(q.text)}
                className="px-3 py-1.5 rounded-full bg-[#17332A] hover:bg-[#1D4033] border border-[#244D3F] text-[#64D995] text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Interaction Area */}
        <div className="p-4 bg-[#10251F] border-t border-[#244D3F] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleListening}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 min-h-[56px] cursor-pointer ${
                isListening
                  ? 'bg-[#E45B5B] text-white animate-pulse shadow-[#E45B5B]/30'
                  : 'bg-gradient-to-r from-[#2E8B57] to-[#1F6B41] hover:from-[#359d63] hover:to-[#247c4b] text-white shadow-[#2E8B57]/30'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-6 h-6 animate-bounce" />
                  <span>{t('micStopListening')}</span>
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6 text-[#F4B740]" />
                  <span>{t('micClickToSpeak')}</span>
                </>
              )}
            </button>
          </div>

          {/* Fallback Text Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuery(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('typeQuestionPlaceholder')}
              className="flex-1 px-4 py-3 rounded-2xl border border-[#244D3F] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#64D995] bg-[#0B1713]/80 text-[#F4F8F5] placeholder-[#A9BDB1]/50"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 rounded-2xl bg-[#1D4033] hover:bg-[#244D3F] border border-[#244D3F] text-[#F4B740] disabled:opacity-40 transition-all flex items-center justify-center min-w-[48px] min-h-[48px] cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
