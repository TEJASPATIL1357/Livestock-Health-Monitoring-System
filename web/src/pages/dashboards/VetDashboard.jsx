import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function VetDashboard() {
  const { animals } = useApp();
  const [actionSuccess, setActionSuccess] = useState('');
  const [farmersList] = useState([{ id: 1, name: 'Sample Farmer', location: 'Village A', cattleCount: 15, phone: '123' }]);
  const [selectedFarmerId, setSelectedFarmerId] = useState(1);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [prescriptionAnimalId, setPrescriptionAnimalId] = useState(null);

  const handleSavePrescription = (e) => {
    e.preventDefault();
    setActionSuccess(`Veterinary prescription saved!`);
    setPrescriptionText('');
    setPrescriptionAnimalId(null);
    setTimeout(() => setActionSuccess(''), 5000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {actionSuccess && <div className="p-4 bg-emerald-500/10 text-emerald-400 font-black rounded-2xl">{actionSuccess}</div>}
      <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-850">
        <h1 className="text-3xl font-black text-white">🩺 Veterinary Diagnostics Center</h1>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 space-y-4">
          <h2 className="text-lg font-black text-white">Assigned Breeders</h2>
          {farmersList.map(farmer => (
            <button key={farmer.id} onClick={() => setSelectedFarmerId(farmer.id)} className="w-full text-white bg-slate-800 p-2 rounded">
              {farmer.name}
            </button>
          ))}
        </div>
        <div className="xl:col-span-8 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 space-y-6">
          <h2 className="text-lg font-black text-white">Cattle Inspector</h2>
          <div className="space-y-4">
            {animals.map(animal => (
               <div key={animal.id} className="p-5 rounded-2xl bg-slate-950 border text-white">
                 {animal.name} - {animal.healthStatus}
               </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
