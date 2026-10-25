import { useState, useEffect } from 'react';
import { getPendingUsers, approveUser, rejectUser } from '../../services/api';

export default function AdminDashboard() {
  const [actionSuccess, setActionSuccess] = useState('');
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [certifiedDoctors, setCertifiedDoctors] = useState([]);
  const [newDoctorData, setNewDoctorData] = useState({ name: '', specialty: '', phone: '' });

  useEffect(() => {
    const fetchPending = async () => {
      try {
         const users = await getPendingUsers();
         setPendingRegistrations(users.map(u => ({ id: u.id, name: u.username, role: u.role, email: u.email })));
      } catch (err) {}
    };
    fetchPending();
  }, []);

  const handleApprove = async (id, name) => {
    try {
      await approveUser(id);
      setPendingRegistrations(prev => prev.filter(r => r.id !== id));
      setActionSuccess(`Approved ${name}`);
    } catch (e) {}
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {actionSuccess && <div className="p-4 bg-emerald-500/10 text-emerald-400 font-black rounded-2xl">{actionSuccess}</div>}
      <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-850">
        <h1 className="text-3xl font-black text-white">🛡️ Cooperative Admin Center</h1>
      </div>
      <div className="xl:col-span-7 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 space-y-4">
        <h2 className="text-lg font-black text-white">Auditing Pending Applications</h2>
        {pendingRegistrations.map(req => (
          <div key={req.id} className="p-5 rounded-2xl bg-slate-950 border text-white">
            {req.name} ({req.role})
            <button onClick={() => handleApprove(req.id, req.name)} className="ml-4 bg-emerald-500 p-2 rounded">Approve</button>
          </div>
        ))}
      </div>
    </div>
  );
}
