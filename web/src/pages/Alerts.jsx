import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

export default function Alerts() {
  const { alerts, markAlertRead } = useApp();
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !a.read;
    return a.severity === filter;
  });

  const getIcon = (type) => {
    const icons = { fever: 'FEVER', low_activity: 'ACT', low_milk: 'MILK', vaccination: 'IMMU', temperature_rising: 'WARN' };
    return (
      <span className="text-[9px] font-black text-emerald-400 bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded-lg tracking-widest uppercase">
        {icons[type] || 'ALERT'}
      </span>
    );
  };

  const getStyle = (sev) => {
    const styles = { critical: 'border-danger/50 bg-danger/10', warning: 'border-warning/50 bg-warning/10', info: 'border-primary-500/50 bg-primary-500/10' };
    return styles[sev] || 'border-surface-600 bg-surface-800';
  };

  const formatTime = (ts) => {
    const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    return m < 60 ? `${m} ${t('minutes_ago')}` : `${Math.floor(m / 60)} ${t('hours_ago')}`;
  };

  const filters = [
    { key: 'all', label: 'All', count: alerts.length },
    { key: 'unread', label: 'Unread', count: alerts.filter(a => !a.read).length },
    { key: 'critical', label: 'Critical', count: alerts.filter(a => a.severity === 'critical').length },
    { key: 'warning', label: 'Warning', count: alerts.filter(a => a.severity === 'warning').length },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-1">{t('alerts')}</h2>
      <p className="text-surface-400 mb-6">{alerts.filter(a => !a.read).length} unread</p>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all
              ${filter === f.key ? 'bg-primary-600/20 text-primary-400 border-2 border-primary-500/40' : 'bg-surface-800/60 text-surface-300 border-2 border-transparent hover:bg-surface-700/60'}`}>
            {f.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${filter === f.key ? 'bg-primary-600/30 text-primary-300' : 'bg-surface-700 text-surface-400'}`}>{f.count}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredAlerts.map((alert, i) => (
          <div key={alert.id} style={{ animationDelay: `${i * 60}ms` }}
            className={`border-l-4 rounded-2xl p-4 transition-all hover:scale-[1.01] animate-fade-in ${getStyle(alert.severity)} ${!alert.read ? 'ring-1 ring-white/10' : 'opacity-70'}`}>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-0.5">{getIcon(alert.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-white">{alert.animalName}</span>
                  <span className="text-xs text-surface-500">{alert.animalId}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase
                    ${alert.severity === 'critical' ? 'bg-danger/20 text-danger' : alert.severity === 'warning' ? 'bg-warning/20 text-warning' : 'bg-primary-500/20 text-primary-400'}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-surface-300 text-sm">{alert.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">TIME: {formatTime(alert.timestamp)}</span>
                  {!alert.read && (
                    <button onClick={() => markAlertRead(alert.id)}
                      className="text-xs px-3 py-1 rounded-lg bg-surface-700 text-surface-300 hover:bg-surface-600 hover:text-white transition-colors">
                      ✓ Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-16">
          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl tracking-widest uppercase select-none">ALL SYSTEM CHANNELS CLEAR</span>
          <p className="text-surface-400 text-sm font-semibold uppercase tracking-wider mt-6">{t('no_alerts')}</p>
        </div>
      )}
    </div>
  );
}
