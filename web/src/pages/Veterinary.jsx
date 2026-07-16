import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Veterinary() {
  const { t } = useLanguage();

  const [vets] = useState([]);

  const [consultations] = useState([]);

  const [bookingStatus, setBookingStatus] = useState('');

  const handleBookVisit = (vetName) => {
    setBookingStatus(`Request dispatched successfully to ${vetName}. The doctor will confirm the schedule via SMS shortly.`);
    setTimeout(() => setBookingStatus(''), 7000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 backdrop-blur-2xl">
        <h1 className="text-3xl font-black text-white">Veterinary Care Network</h1>
        <p className="text-slate-400 font-medium mt-1">Consult certified veterinarians and review prescriptions.</p>
      </div>

      {bookingStatus && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black rounded-2xl animate-pulse">
          {bookingStatus}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left list - Doctors (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 space-y-4">
            <h2 className="text-xl font-extrabold text-white">Available Local Practitioners</h2>
            
            <div className="space-y-4">
              {vets.map(vet => (
                <div key={vet.id} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <span className="text-4xl bg-slate-900 w-14 h-14 rounded-xl flex items-center justify-center border border-slate-800">🩺</span>
                    <div>
                      <h3 className="font-extrabold text-white text-lg">{vet.name}</h3>
                      <p className="text-xs text-slate-400 font-semibold">{vet.specialty}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">📍 {vet.distance} | 📞 {vet.phone}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full text-center
                      ${vet.availability === 'Available Today' ? 'bg-emerald-500/10 text-emerald-400' :
                        vet.availability === 'Available Tomorrow' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-slate-900 text-slate-650 border border-slate-850'}`}
                    >
                      {vet.availability}
                    </span>
                    
                    <button
                      onClick={() => handleBookVisit(vet.name)}
                      disabled={vet.availability === 'On Leave'}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all
                        ${vet.availability === 'On Leave' 
                          ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-850'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'}`}
                    >
                      Schedule Visit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right list - History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 space-y-4">
            <h2 className="text-xl font-extrabold text-white">Previous Diagnoses &amp; Notes</h2>

            <div className="space-y-4">
              {consultations.map(con => (
                <div key={con.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="font-extrabold text-slate-200 text-sm">🐄 {con.animal}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{con.date}</span>
                  </div>
                  <div className="text-xs">
                    <p className="text-slate-400"><strong className="text-slate-300">Doctor:</strong> {con.vet}</p>
                    <p className="text-slate-400 mt-1"><strong className="text-slate-300">Observation:</strong> {con.issue}</p>
                    <p className="text-slate-400 mt-1.5 p-2 bg-slate-950/80 rounded border border-slate-850 italic font-bold">
                      💡 {con.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
