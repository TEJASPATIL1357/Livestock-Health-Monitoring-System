import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { STATUS_COLORS } from '../../../shared/constants.js';
import { generateAdvice, getStatusLabel } from '../../../shared/adviceSystem.js';

export default function AnimalCard({ animal, onClick }) {
  const { t, language } = useLanguage();
  const { isFarmerMode } = useApp();
  const navigate = useNavigate();
  const statusColor = STATUS_COLORS[animal.healthStatus];
  
  const advice = generateAdvice(animal, language);
  const labels = getStatusLabel(animal.temperature, animal.activity, language);

  return (
    <div
      onClick={() => onClick?.(animal)}
      className={`relative bg-surface-800/80 backdrop-blur-sm rounded-3xl p-6 cursor-pointer
        border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group
        ${animal.healthStatus === 'critical'
          ? 'border-danger/50 animate-glow-red'
          : animal.healthStatus === 'warning'
            ? 'border-warning/30 hover:border-warning/60'
            : 'border-surface-700/50 hover:border-primary-500/50'
        }`}
    >
      {/* Health status badge */}
      <div className={`absolute -top-2 -right-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg
        ${animal.healthStatus === 'critical' ? 'bg-danger text-white animate-pulse' :
          animal.healthStatus === 'warning' ? 'bg-warning text-surface-900' :
          'bg-success text-white'}`}
      >
        {t(animal.healthStatus)}
      </div>

      {/* Animal header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-750 px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wider text-emerald-400 select-none shadow-inner">
          {animal.species && animal.species.toLowerCase().includes('buffalo') ? 'BUF' : 'COW'}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">{animal.name}</h3>
          <p className="text-sm text-surface-400 font-medium">{animal.tagNumber || animal.id} • {animal.breed}</p>
        </div>
      </div>

      {isFarmerMode ? (
        /* SIMPLE MODE (FARMER FRIENDLY) */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl flex items-center gap-3 bg-surface-950/40 border ${animal.temperature >= 39.5 ? 'border-warning/30' : 'border-surface-700/50'}`}>
              <div className="bg-slate-900 border border-slate-750 px-2 py-1 rounded-lg text-[9px] font-black text-slate-400">TEMP</div>
              <div>
                <div className="text-[10px] text-surface-500 uppercase font-extrabold tracking-wider">{t('temperature')}</div>
                <div className={`text-md font-bold ${animal.temperature >= 39.5 ? 'text-warning' : 'text-primary-400'}`}>
                  {animal.temperature}°C <span className="text-[10px] font-normal opacity-70">({labels.temperature})</span>
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-2xl flex items-center gap-3 bg-surface-950/40 border ${animal.activity < 40 ? 'border-danger/30' : 'border-surface-700/50'}`}>
              <div className="bg-slate-900 border border-slate-750 px-2 py-1 rounded-lg text-[9px] font-black text-slate-400">ACT</div>
              <div>
                <div className="text-[10px] text-surface-500 uppercase font-extrabold tracking-wider">{t('activity')}</div>
                <div className={`text-md font-bold ${animal.activity < 40 ? 'text-danger' : 'text-success'}`}>
                  {animal.activity}% <span className="text-[10px] font-normal opacity-70">({labels.activity})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advice Box */}
          <div className={`p-5 rounded-2xl border-l-4 shadow-inner ${
            animal.healthStatus === 'critical' ? 'bg-danger/10 border-danger' :
            animal.healthStatus === 'warning' ? 'bg-warning/10 border-warning' :
            'bg-success/10 border-success'
          }`}>
            <div className="flex gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-450 mt-0.5">ADVICE:</span>
              <p className="text-sm leading-relaxed text-slate-100 font-medium flex-1">
                {advice[0]?.text || t('all_normal')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ADVANCED MODE (DATA FOCUSED) */
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-surface-900/60 rounded-xl p-3 text-center border border-surface-700/30">
              <div className="text-[9px] font-black text-slate-500 uppercase mb-1">TEMP</div>
              <div className={`text-xl font-bold ${animal.temperature >= 40 ? 'text-danger' : animal.temperature >= 39.5 ? 'text-warning' : 'text-primary-400'}`}>
                {animal.temperature}°
              </div>
              <div className="text-[10px] text-surface-400 mt-0.5">{t('temperature')}</div>
            </div>
            <div className="bg-surface-900/60 rounded-xl p-3 text-center border border-surface-700/30">
              <div className="text-[9px] font-black text-slate-500 uppercase mb-1">ACT</div>
              <div className="text-xl font-bold text-white">{animal.activity}%</div>
              <div className="text-[10px] text-surface-400 mt-0.5">{t('activity')}</div>
            </div>
            <div className="bg-surface-900/60 rounded-xl p-3 text-center border border-surface-700/30">
              <div className="text-[9px] font-black text-slate-500 uppercase mb-1">MILK</div>
              <div className="text-xl font-bold text-primary-300">{(animal.predictedMilkYield || animal.milkYield || 15.0)}L</div>
              <div className="text-[10px] text-surface-400 mt-0.5">{t('milk_yield')}</div>
            </div>
          </div>
          <div className="w-full bg-surface-700 rounded-full h-2 overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${animal.activity >= 70 ? 'bg-success' : animal.activity >= 40 ? 'bg-warning' : 'bg-danger'}`}
              style={{ width: `${animal.activity}%` }}
            />
          </div>
        </>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-surface-500 pt-2 border-t border-surface-700/30 mt-4 font-semibold uppercase tracking-wider">
        <span className="flex items-center gap-1">LOC: {animal.location}</span>
        <span className="flex items-center gap-1">TIME: {animal.lastFed}</span>
      </div>

      {/* Ask AI Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate('/chatbot', { state: { animalContext: animal } });
        }}
        className="mt-4 w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl flex justify-center items-center gap-2 transition-colors border border-emerald-500/20"
      >
        <span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm inline-block animate-pulse"></span>
        Ask AI
      </button>

      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-3xl bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
