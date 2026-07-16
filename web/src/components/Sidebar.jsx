import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, RadioReceiver, LineChart, BellRing, Bot, Syringe, Stethoscope, FileText, Settings, LogOut } from 'lucide-react';

const navItems = [
  { path: '/', key: 'dashboard', icon: LayoutDashboard },
  { path: '/devices', key: 'iot_devices', icon: RadioReceiver },
  { path: '/analytics', key: 'analytics_milk', icon: LineChart },
  { path: '/alerts', key: 'alerts', icon: BellRing },
  { path: '/chatbot', key: 'ai_chatbot', icon: Bot },
  { path: '/vaccinations', key: 'vaccinations', icon: Syringe },
  { path: '/veterinary', key: 'veterinary_care', icon: Stethoscope },
  { path: '/reports', key: 'reports', icon: FileText },
  { path: '/settings', key: 'settings', icon: Settings }
];

export default function Sidebar({ activeRole }) {
  const { t } = useLanguage();
  const { sidebarOpen, setSidebarOpen, stats } = useApp();

  const handleResetFlow = () => {
    window.dispatchEvent(new Event('reset-sih-flow'));
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full p-4 overflow-y-auto">


          {/* Navigation */}
          <nav className="flex-1 space-y-1.5">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group
                  ${isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner'
                    : 'text-slate-400 border border-transparent hover:bg-slate-850 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => {
                  const Icon = item.icon;
                  return (
                  <>
                    <Icon className={`w-5 h-5 transition-all group-hover:scale-110
                      ${isActive 
                        ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' 
                        : 'text-slate-500'}`} 
                    />
                    <span>{t(item.key)}</span>
                    {item.key === 'alerts' && stats.unreadAlerts > 0 && (
                      <span className="ml-auto flex items-center justify-center w-5 h-5 text-[10px] font-black text-white bg-rose-500 rounded-full">
                        {stats.unreadAlerts}
                      </span>
                    )}
                  </>
                )}}
              </NavLink>
            ))}
          </nav>

          {/* Restart Onboarding & Logout Trigger at Bottom */}
          <div className="mt-8 pt-4 border-t border-slate-800 space-y-2">

            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('sih_role');
                localStorage.removeItem('sih_onboarded');
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-950 hover:bg-rose-500/10 border border-slate-850 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all group"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {t('logout_session')}
            </button>
            <div className="mt-4 text-[10px] text-slate-650 font-bold text-center">
              Smart Livestock Platform v1.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
