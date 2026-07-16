import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { LANGUAGE_LABELS } from '../../../shared/constants.js';

export default function Navbar() {
  const { language, changeLanguage, t } = useLanguage();
  const { stats, isOffline, setSidebarOpen, sidebarOpen, activeRole, changeRole } = useApp();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-lg font-black text-white leading-tight hidden sm:block tracking-tight">
                Smart Livestock Health
              </h1>
              <h1 className="text-lg font-black text-white leading-tight sm:hidden tracking-tight">
                DairyIntel
              </h1>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-4">


          {/* Offline indicator */}
          {isOffline && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-black animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Offline</span>
            </div>
          )}

          {/* Language selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="appearance-none bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 pr-8 rounded-xl text-sm font-bold cursor-pointer hover:bg-slate-900 transition-colors focus:outline-none focus:border-emerald-500/50"
            >
              {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Notification bell */}
          <button className="relative p-2 rounded-xl hover:bg-slate-800 transition-colors group" aria-label="Notifications">
            <svg className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {stats.unreadAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 text-[9px] font-black text-white bg-rose-500 rounded-full">
                {stats.unreadAlerts}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
