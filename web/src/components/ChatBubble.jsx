import { LANGUAGE_LABELS } from '../../../shared/constants.js';

export default function ChatBubble({ message }) {
  const isUser = message.sender === 'user';
  const langLabel = LANGUAGE_LABELS[message.language] || '';

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slide-in`}>
      {/* Bot avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mr-2 mt-1 select-none">
          <span className="text-[10px] font-black text-emerald-400">AI</span>
        </div>
      )}

      <div className={`max-w-[80%] sm:max-w-[70%]`}>
        <div
          className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed
            ${isUser
              ? 'bg-primary-600 text-white rounded-br-md'
              : 'bg-surface-700/80 text-surface-100 rounded-bl-md border border-surface-600/50'
            }`}
        >
          {message.text}
        </div>
        <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-surface-500">{formatTime(message.timestamp)}</span>
          {message.language && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full
              ${isUser ? 'bg-primary-500/20 text-primary-300' : 'bg-surface-600/50 text-surface-400'}`}>
              {langLabel}
            </span>
          )}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center ml-2 mt-1 select-none">
          <span className="text-[10px] font-black text-emerald-400">ME</span>
        </div>
      )}
    </div>
  );
}
