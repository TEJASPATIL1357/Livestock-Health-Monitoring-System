import { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function VoiceInput({ onResult, disabled, size = 'md' }) {
  const { t, language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      // Select appropriate language code
      const langCodes = {
        mr: 'mr-IN',
        hi: 'hi-IN',
        en: 'en-US'
      };
      recognition.lang = langCodes[language] || 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult?.(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [onResult, language]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  }, [isListening]);

  if (!isSupported) return null;

  const sizeClasses = size === 'lg' ? 'w-16 h-16 rounded-full' : 'w-12 h-12 rounded-2xl';
  const iconSize = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        disabled={disabled}
        className={`relative ${sizeClasses} transition-all duration-500 flex items-center justify-center
          ${isListening
            ? 'bg-danger text-white shadow-2xl scale-110'
            : 'bg-slate-800 text-slate-300 hover:bg-primary-green hover:text-slate-950 hover:shadow-xl'
          }
          ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
          border-2 ${isListening ? 'border-white/20' : 'border-slate-700'}
        `}
      >
        {/* Mic icon */}
        <svg className={`${iconSize} relative z-10`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>

        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-danger animate-ping opacity-30" />
            <span className="absolute -inset-2 rounded-full border-2 border-danger/40 animate-pulse" />
          </>
        )}
      </button>

      {/* "Listening..." Tooltip */}
      {isListening && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-danger text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-xl animate-bounce">
          {t('listening')}...
        </div>
      )}
    </div>
  );
}
