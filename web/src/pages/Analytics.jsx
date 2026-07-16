import { useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Activity, Thermometer, Droplet, ShieldCheck, AlertTriangle, XCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl p-3 shadow-xl">
      <p className="text-surface-300 text-sm mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: item.color }}>
          {item.name}: {item.value}{item.name === 'Temperature' ? '°C' : item.name === 'Milk' ? ' L' : '%'}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { animals } = useApp();
  const { t } = useLanguage();
  const [selectedAnimalId, setSelectedAnimalId] = useState(animals[0]?.id || '');

  const selectedAnimal = animals.find(a => a.id === selectedAnimalId) || animals[0];
  const historyData = selectedAnimal?.history || [];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header with animal selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            📊 {t('analytics')}
          </h2>
          <p className="text-surface-400 mt-1">Detailed health and production analytics</p>
        </div>
        <div className="relative">
          <select
            value={selectedAnimalId}
            onChange={(e) => setSelectedAnimalId(e.target.value)}
            className="appearance-none bg-surface-800 border border-surface-600 text-white pl-4 pr-10 py-3 rounded-2xl text-base font-medium cursor-pointer hover:bg-surface-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[200px]"
          >
            {animals.map(animal => (
              <option key={animal.id} value={animal.id}>
                {animal.species && animal.species.toLowerCase().includes('buffalo') ? '🦬' : '🐄'} {animal.name} ({animal.tagNumber || animal.id})
              </option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Summary cards */}
      {selectedAnimal && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={<Thermometer className="w-6 h-6 text-warning" />}
            label={t('temperature')}
            value={`${selectedAnimal.temperature}°C`}
            trend={selectedAnimal.temperature >= 39.5 ? 'up' : 'stable'}
            color={selectedAnimal.temperature >= 40 ? 'danger' : selectedAnimal.temperature >= 39.5 ? 'warning' : 'success'}
          />
          <SummaryCard
            icon={<Activity className="w-6 h-6 text-success" />}
            label={t('activity')}
            value={`${selectedAnimal.activity}%`}
            trend={selectedAnimal.activity < 40 ? 'down' : 'stable'}
            color={selectedAnimal.activity < 30 ? 'danger' : selectedAnimal.activity < 50 ? 'warning' : 'success'}
          />
          <SummaryCard
            icon={<Droplet className="w-6 h-6 text-primary-400" />}
            label={t('milk_yield')}
            value={`${selectedAnimal.predictedMilkYield || selectedAnimal.milkYield || 15.0} L`}
            trend="stable"
            color="primary"
          />
          <SummaryCard
            icon={selectedAnimal.healthStatus === 'healthy' ? <ShieldCheck className="w-6 h-6 text-success" /> : selectedAnimal.healthStatus === 'warning' ? <AlertTriangle className="w-6 h-6 text-warning" /> : <XCircle className="w-6 h-6 text-danger" />}
            label={t('health_status')}
            value={t(selectedAnimal.healthStatus)}
            color={selectedAnimal.healthStatus === 'healthy' ? 'success' : selectedAnimal.healthStatus === 'warning' ? 'warning' : 'danger'}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Temperature Chart */}
        <ChartCard title={t('temp_vs_time')} icon={<Thermometer className="w-5 h-5 text-warning" />}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[36, 42]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperature"
                name="Temperature"
                stroke="#ef4444"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
              />
              {/* Normal range reference lines */}
              <Line
                type="monotone"
                dataKey={() => 39.5}
                name="Max Normal"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                legendType="none"
              />
              <Line
                type="monotone"
                dataKey={() => 37.5}
                name="Min Normal"
                stroke="#22c55e"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                legendType="none"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Activity Chart */}
        <ChartCard title={t('activity_vs_time')} icon={<Activity className="w-5 h-5 text-success" />}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="activity"
                name="Activity"
                stroke="#22c55e"
                strokeWidth={3}
                fill="url(#activityGradient)"
                activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Milk Yield Chart (full width) */}
        <ChartCard title={t('milk_vs_time')} icon={<Droplet className="w-5 h-5 text-primary-400" />} className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={historyData}>
              <defs>
                <linearGradient id="milkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="milkYield"
                name="Milk"
                fill="url(#milkGradient)"
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, icon, children, className = '' }) {
  return (
    <div className={`bg-surface-800/60 backdrop-blur-sm border border-surface-700/50 rounded-2xl p-5 ${className}`}>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function SummaryCard({ icon, label, value, trend, color = 'primary' }) {
  const colorMap = {
    primary: 'text-primary-400',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  };

  const trendIcon = trend === 'up' ? <TrendingUp className="w-4 h-4 text-warning" /> : trend === 'down' ? <TrendingDown className="w-4 h-4 text-danger" /> : <Minus className="w-4 h-4 text-surface-400" />;

  return (
    <div className="bg-surface-800/60 backdrop-blur-sm border border-surface-700/50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-surface-900 rounded-xl border border-surface-700 shadow-inner">{icon}</div>
        {trend && <span className="text-sm">{trendIcon}</span>}
      </div>
      <div className={`text-2xl font-bold ${colorMap[color]}`}>{value}</div>
      <div className="text-xs text-surface-400 mt-1">{label}</div>
    </div>
  );
}
