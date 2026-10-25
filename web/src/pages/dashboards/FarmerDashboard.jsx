import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { createAnimal } from '../../services/AnimalService.js';
import { logMilkProduction } from '../../services/MilkProductionService.js';
import AnimalCard from '../../components/AnimalCard';
import { ShieldCheck, AlertTriangle, Droplet, Plus, ClipboardList, Rabbit } from 'lucide-react';

export default function FarmerDashboard() {
  const { animals, setAnimals, alerts, isLoading, error, refreshData } = useApp();
  const { t } = useLanguage();

  const [filter, setFilter] = useState('all');
  const [selectedDetail, setSelectedDetail] = useState(null);
  
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [showLogMilk, setShowLogMilk] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const [newAnimalData, setNewAnimalData] = useState({ name: '', breed: '', tagNumber: '', age: 4, location: 'Shed A' });
  const [newMilkData, setNewMilkData] = useState({ animalId: '', quantity: '', session: 'MORNING' });

  const handleCardClick = (animal) => setSelectedDetail(animal);

  const handleBookVisit = () => {
    setActionSuccess(t('book_vet_visit') + ' booked! The cooperative practitioner has been notified.');
    setTimeout(() => setActionSuccess(''), 5000);
  };

  const handleAddAnimalSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAnimal({ ...newAnimalData, farmerId: 1 });
      await refreshData();
      setActionSuccess(`Animal ${newAnimalData.name} registered successfully!`);
      setShowAddAnimal(false);
      setNewAnimalData({ name: '', breed: '', tagNumber: '', age: 4, location: 'Shed A' });
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      alert(`Failed to register animal: ${err.message}`);
    }
  };

  const handleLogMilkSubmit = async (e) => {
    e.preventDefault();
    try {
      await logMilkProduction({ animalId: parseInt(newMilkData.animalId.replace(/\D/g, '') || 1), quantityInLiters: parseFloat(newMilkData.quantity), session: newMilkData.session });
      setActionSuccess(`Milk log of ${newMilkData.quantity} Liters registered successfully!`);
      setShowLogMilk(false);
      setNewMilkData({ animalId: '', quantity: '', session: 'MORNING' });
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      alert(`Failed to log milk: ${err.message}`);
    }
  };

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-rose-500">Error loading data.</div>;

  const totalCows = animals.length;
  const healthyCows = animals.filter(a => a.healthStatus === 'healthy').length;
  const attentionCows = animals.filter(a => a.healthStatus !== 'healthy').length;
  const totalDailyMilk = animals.reduce((sum, a) => sum + (a.predictedMilkYield || a.milkYield || 15.0), 0).toFixed(1);
  const filteredAnimals = animals.filter(animal => filter === 'all' || animal.healthStatus === filter);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {actionSuccess && <div className="p-4 bg-emerald-500/10 text-emerald-400 font-black rounded-2xl animate-pulse">{actionSuccess}</div>}
      
      <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-850 flex items-center gap-4">
        <img src="/src/assets/simple_vector_logo.png" alt="Logo" className="w-12 h-12 rounded-xl border border-slate-700 bg-slate-800 p-1" />
        <h1 className="text-3xl font-black text-white">{t('coop_dairy_farm')}</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: t('total_animals'), value: totalCows, icon: <Rabbit className="w-8 h-8 text-white" />, color: 'text-white border-slate-800' },
          { label: t('healthy_animals'), value: healthyCows, icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />, color: 'text-emerald-400 border-slate-800' },
          { label: t('animals_needing_attention'), value: attentionCows, icon: <AlertTriangle className="w-8 h-8 text-rose-400" />, color: 'text-rose-400 border-slate-800' },
          { label: t('today_milk_collection'), value: `${totalDailyMilk} L`, icon: <Droplet className="w-8 h-8 text-teal-400" />, color: 'text-teal-400 border-slate-800' }
        ].map((kpi, idx) => (
          <div key={idx} className="p-5 rounded-2xl border border-slate-850 bg-slate-900/40 backdrop-blur-xl h-28 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span>{kpi.icon}</span> 
              <span className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</span>
            </div>
            <div className="text-[10px] uppercase text-slate-500 font-bold">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 space-y-6">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-[2rem] space-y-4">
            <h2 className="text-lg font-black text-white">{t('quick_actions')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowAddAnimal(true)} className="flex items-center gap-2 p-4 rounded-xl bg-slate-950 border border-slate-850 font-bold text-slate-300 hover:text-white transition-colors">
                <Plus className="w-5 h-5 text-emerald-500" /> {t('add_animal')}
              </button>
              <button onClick={() => setShowLogMilk(true)} className="flex items-center gap-2 p-4 rounded-xl bg-slate-950 border border-slate-850 font-bold text-slate-300 hover:text-white transition-colors">
                <ClipboardList className="w-5 h-5 text-blue-400" /> {t('record_milk')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAnimals.map((animal, i) => (
          <AnimalCard key={animal.id} animal={animal} onClick={handleCardClick} />
        ))}
      </div>
    </div>
  );
}
