import { useLanguage } from '../context/LanguageContext';

export default function AlertBanner({ alerts, onDismiss }) {
  const { t } = useLanguage();
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.read);

  if (criticalAlerts.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-danger/20 via-danger/10 to-danger/20 border border-danger/30 rounded-2xl p-4 mb-6 animate-fade-in">
      {/* Animated background pulse */}
      <div className="absolute inset-0 bg-danger/5 animate-pulse-slow" />

      <div className="relative flex items-start gap-3">
        <div className="flex-shrink-0 text-3xl animate-bounce">🚨</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-danger mb-2">
            {t('critical_alerts')} ({criticalAlerts.length})
          </h3>
          <div className="space-y-2">
            {criticalAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-danger rounded-full animate-pulse flex-shrink-0" />
                <span className="text-surface-200 font-medium">{alert.animalName}</span>
                <span className="text-surface-400">—</span>
                <span className="text-surface-300 truncate">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-danger/20 transition-colors text-surface-400 hover:text-white"
            aria-label="Dismiss alerts"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
