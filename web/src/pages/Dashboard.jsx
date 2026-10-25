import { useApp } from '../context/AppContext';
import FarmerDashboard from './dashboards/FarmerDashboard';
import VetDashboard from './dashboards/VetDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import { Leaf, AlertTriangle } from 'lucide-react';

export default function Dashboard({ activeRole }) {
  const { isLoading, error } = useApp();
  const currentRole = activeRole || localStorage.getItem('sih_role') || localStorage.getItem('role') || 'FARMER';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-ping" />
            <div className="absolute inset-2 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent" />
            <span className="absolute inset-0 flex items-center justify-center text-emerald-500"><Leaf className="w-6 h-6" /></span>
          </div>
          <p className="text-slate-400 font-bold text-sm">Syncing with dairy database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-slate-900/20 rounded-[2rem] border border-slate-800 p-8 max-w-md mx-auto backdrop-blur-sm">
        <span className="flex justify-center mb-4 text-warning"><AlertTriangle className="w-12 h-12" /></span>
        <h3 className="text-lg font-extrabold text-white mb-2">Connection Timeout</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">Could not retrieve livestock data from the server. Check your network link and try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (currentRole === 'ADMIN') {
    return <AdminDashboard />;
  }

  if (currentRole === 'VET') {
    return <VetDashboard />;
  }

  return <FarmerDashboard />;
}
