import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { getDevices } from '../services/api';

export default function Devices() {
  const { isOffline } = useApp();
  const { t } = useLanguage();

  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await getDevices();
        setDevices(data);
      } catch (error) {
        console.error("Failed to fetch devices:", error);
        // Do not fallback to mock data as per user instructions
      } finally {
        setIsLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const onlineCount = devices.filter(d => d.status === 'ACTIVE').length;
  const offlineCount = devices.length - onlineCount;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="bg-surface-900/40 p-6 rounded-3xl border border-surface-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">IoT Connected Collars</h1>
          <p className="text-surface-400 font-medium">Manage and audit physical livestock collar devices.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-black rounded-xl">
            🟢 {onlineCount} Devices Online
          </div>
          <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-black rounded-xl">
            🔴 {offlineCount} Offline
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-slate-400 text-center py-20">Loading connected devices...</div>
      ) : devices.length === 0 ? (
        <div className="text-slate-400 text-center py-20 font-bold border border-slate-800 rounded-3xl">No ESP32 Collars Registered</div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {devices.map((dev) => (
            <div 
              key={dev.id}
              className={`p-6 rounded-[2rem] border transition-all hover:-translate-y-1 bg-slate-900/40 backdrop-blur-xl
                ${dev.status === 'ACTIVE' ? 'border-slate-800 hover:border-emerald-500/40' : 'border-slate-800 hover:border-rose-500/40'}`}
            >
              {/* Upper details */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner
                    ${dev.status === 'ACTIVE' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                    📡
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">{dev.deviceId}</h3>
                    <p className="text-xs text-slate-500 font-bold tracking-tight mt-0.5">{dev.deviceName || "Unregistered Collar"}</p>
                  </div>
                </div>
                
                <span className={`px-3 py-1.5 rounded-full text-xs font-black
                  ${dev.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {dev.status === 'ACTIVE' ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              {/* Parameter list */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Cattle Assigned</div>
                  <div className="text-md font-extrabold text-white flex items-center gap-1.5">
                    <span>🐄</span>
                    <span>{dev.assignedAnimal ? dev.assignedAnimal.name : "Unassigned"}</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">API Key Configured</div>
                  <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-2">
                    {dev.apiKey ? "✓ Embedded" : "Pending"}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Last Seen Ping</div>
                  <div className="text-[10px] font-extrabold text-slate-200">{dev.lastSeen ? new Date(dev.lastSeen).toLocaleString() : "Never"}</div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Hardware Model</div>
                  <div className="text-xs font-bold text-slate-400 mt-0.5 leading-snug">ESP32_WROOM</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
