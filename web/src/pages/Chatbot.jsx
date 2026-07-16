import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { sendChatMessage } from '../services/ChatService.js';
import { processMessage as localProcessMessage } from '../../../shared/chatbotEngine.js';
import ChatBubble from '../components/ChatBubble';
import VoiceInput from '../components/VoiceInput';
import { Activity, Thermometer, Droplet, ShieldCheck, AlertTriangle } from 'lucide-react';

function AnimalContextCard({ animal }) {
  if (!animal) return null;
  return (
    <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-4 mb-6 shadow-lg animate-fade-in flex flex-col md:flex-row items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-2xl font-black text-emerald-400">
        {animal.species?.toLowerCase().includes('buffalo') ? '🦬' : '🐄'}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-white mb-1">{animal.name} <span className="text-sm font-medium text-slate-400">({animal.tagNumber || animal.id})</span></h3>
        <div className="flex gap-4 text-sm font-bold text-slate-300">
          <span className="flex items-center gap-1 text-warning"><Thermometer className="w-4 h-4"/> {animal.temperature}°C</span>
          <span className="flex items-center gap-1 text-success"><Activity className="w-4 h-4"/> {animal.activity}%</span>
          <span className="flex items-center gap-1 text-primary-400"><Droplet className="w-4 h-4"/> {animal.milkYield || animal.predictedMilkYield || 15}L</span>
          <span className="flex items-center gap-1 text-rose-400"><AlertTriangle className="w-4 h-4"/> {animal.healthStatus?.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}

export default function Chatbot() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const location = useLocation();

  // Send welcome message on mount
  useEffect(() => {
    const welcome = localProcessMessage('', language);
    setMessages([{
      id: 'welcome',
      text: welcome.response,
      sender: 'bot',
      language: language,
      timestamp: new Date().toISOString(),
    }]);
  }, [language]);

  // Handle Animal Context automatically if routed from Dashboard
  useEffect(() => {
    if (location.state?.animalContext) {
      const animal = location.state.animalContext;
      const prompt = `Please analyze the health data for ${animal.name}. Are there any recommendations?`;

      // Wait a moment so the welcome message appears first, then send
      setTimeout(() => {
        handleSend(prompt, animal.id);
      }, 500);

      // Clear the state so it doesn't fire again on page reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (text, passedAnimalId = null) => {
    const msg = (text || input).trim();
    if (!msg) return;

    // Get animal ID from state if it exists, or use the passed one
    const animalId = passedAnimalId || location.state?.animalContext?.id || null;

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      text: msg,
      sender: 'user',
      language: null,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await sendChatMessage(msg, language, 1, animalId);
      const botMsg = {
        id: `bot-${Date.now()}`,
        text: result.response,
        sender: 'bot',
        language: result.lang,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.warn('Chat request failed, trying local engine:', error);
      const result = localProcessMessage(msg, language);
      const botMsg = {
        id: `bot-${Date.now()}`,
        text: result.response,
        sender: 'bot',
        language: result.lang,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [input, language, location.state]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickReplies = {
    en: ['My cow has fever', 'Not eating', 'Low activity', 'Less milk'],
    hi: ['गाय को बुखार है', 'खाना नहीं खा रही', 'कम चल रही', 'दूध कम है'],
    mr: ['गायीला ताप आहे', 'खात नाही', 'हालचाल कमी', 'दूध कमी'],
  };

  const currentQuickReplies = quickReplies[language] || quickReplies.en;

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-7rem)] max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-surface-800 mb-4 flex-shrink-0">
        <div className="w-16 h-16 rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center justify-center">
          <span className="text-md font-black text-emerald-450">AI</span>
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">{t('chatbot_title')}</h2>
          <p className="text-sm text-primary-green flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 bg-success rounded-full inline-block animate-pulse" />
            {t('assistant_online')}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin px-2 pb-4">
        
        {/* Animal Context Card (Dynamic) */}
        {location.state?.animalContext && (
          <AnimalContextCard animal={location.state.animalContext} />
        )}

        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-3 mb-4 animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <span className="text-[10px] font-black text-emerald-400">AI</span>
            </div>
            <div className="bg-slate-800 rounded-3xl rounded-tl-md px-6 py-4 border border-slate-700 shadow-lg">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 bg-primary-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 bg-primary-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 bg-primary-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick replies */}
      <div className="flex gap-2 overflow-x-auto py-5 flex-shrink-0 no-scrollbar">
        {currentQuickReplies.map((reply, i) => (
          <button
            key={i}
            onClick={() => handleSend(reply)}
            className="flex-shrink-0 px-6 py-4 bg-slate-800/80 backdrop-blur border-2 border-slate-700 rounded-3xl text-sm font-bold text-slate-100 hover:bg-primary-green/20 hover:text-primary-green hover:border-primary-green/40 transition-all whitespace-nowrap shadow-xl"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-center gap-3 py-6 px-4 bg-slate-900 border-t border-slate-800 flex-shrink-0">
        <VoiceInput onResult={(text) => handleSend(text)} disabled={isTyping} size="lg" />
        
        <div className="flex-1 relative group">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('type_your_problem')}
            rows={1}
            className="w-full bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-500 rounded-[2rem] px-6 py-4 pr-12 resize-none focus:outline-none focus:border-primary-green transition-all text-lg font-medium shadow-inner"
          />
        </div>

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="w-16 h-16 rounded-full bg-primary-green text-slate-950 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl flex items-center justify-center active:scale-90"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
