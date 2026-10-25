import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Chatbot from './pages/Chatbot';
import Devices from './pages/Devices';
import Veterinary from './pages/Veterinary';
import { login, register } from './services/api';

function AppContent() {
  const { language, changeLanguage, t } = useLanguage();
  const { activeRole, changeRole, refreshData } = useApp();
  
  // State-based onboarding flow: 'splash' | 'language' | 'welcome' | 'auth' | 'role' | 'app'
  const [step, setStep] = useState(() => {
    const onboarded = localStorage.getItem('sih_onboarded');
    return onboarded === 'true' ? 'app' : 'splash';
  });

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' });
  const [progress, setProgress] = useState(0);

  // Splash progress logic removed as we now have a consolidated landing screen

  const [errorMsg, setErrorMsg] = useState('');

  // Handle Demo Quick Logins
  const handleDemoLogin = (role) => {
    changeRole(role);
    localStorage.setItem('sih_onboarded', 'true');
    localStorage.setItem('token', 'dummy_token'); // authenticate
    setStep('app');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (authMode === 'login') {
        const response = await login(formData.email, formData.password);
        if (response && response.accessToken) {
          localStorage.setItem('sih_onboarded', 'true');
          setStep('app');
          refreshData();
        } else {
          setErrorMsg('Invalid username or password.');
        }
      } else {
        await register(formData.name, formData.phone, formData.email, formData.password, activeRole);
        alert('Account created successfully! Please sign in.');
        setAuthMode('login');
        setFormData({ name: '', phone: '', email: '', password: '' });
      }
    } catch (err) {
      if (err.response) {
        // Backend returned an error (e.g., 500 Invalid credentials)
        setErrorMsg(err.response.data?.message || err.response.data || 'Invalid credentials or pending approval.');
      } else {
        console.error('Backend connection failed:', err);
        setErrorMsg('Failed to connect to backend. Please ensure the server is running.');
      }
    }
  };

  // Reset Onboarding from sidebar/settings
  useEffect(() => {
    const handleReset = () => {
      localStorage.removeItem('sih_onboarded');
      localStorage.removeItem('sih_role');
      localStorage.removeItem('token');
      setProgress(0);
      setStep('splash');
    };
    window.addEventListener('reset-sih-flow', handleReset);
    return () => window.removeEventListener('reset-sih-flow', handleReset);
  }, []);

  // Secure Protected Routing: Redirect to login if token is missing
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (step === 'app' && !token) {
      setStep('auth');
      setAuthMode('login');
    }
  }, [step]);

  // 1. Splash & Language Landing Screen
  if (step === 'splash' || step === 'language') {
    return (
      <div 
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url('/src/assets/modern_livestock_bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="relative w-full max-w-4xl flex flex-col items-center text-center my-8">
          
          {/* Smaller Vector Hero Image */}
          <div className="bg-white/80 p-4 rounded-[2rem] shadow-lg mb-6 backdrop-blur-md">
            <img 
              src="/src/assets/simple_vector_logo.png" 
              alt="Smart Livestock Health" 
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain mix-blend-multiply" 
            />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight text-center mb-3">
            Smart Livestock Health
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-bold text-center drop-shadow-md mb-10">
            Select your language / अपनी भाषा चुनें
          </p>

          {/* Language Selection Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { code: 'hi', label: 'हिंदी', sub: 'Hindi' },
              { code: 'mr', label: 'मराठी', sub: 'Marathi' },
              { code: 'en', label: 'English', sub: 'English' },
              { code: 'bn', label: 'বাংলা', sub: 'Bengali' },
              { code: 'te', label: 'తెలుగు', sub: 'Telugu' },
              { code: 'ta', label: 'தமிழ்', sub: 'Tamil' },
              { code: 'gu', label: 'ગુજરાતી', sub: 'Gujarati' },
              { code: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada' },
              { code: 'or', label: 'ଓଡ଼ିଆ', sub: 'Odia' },
              { code: 'pa', label: 'ਪੰਜਾਬੀ', sub: 'Punjabi' },
              { code: 'ml', label: 'മലയാളം', sub: 'Malayalam' },
              { code: 'as', label: 'অসমীয়া', sub: 'Assamese' }
            ].map(opt => (
              <button
                key={opt.code}
                onClick={() => {
                  changeLanguage(opt.code);
                  setAuthMode('login');
                  setStep('auth');
                }}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm
                  ${language === opt.code 
                    ? 'bg-green-500/90 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] text-white' 
                    : 'bg-white/90 border-white/60 hover:bg-white hover:border-green-400 shadow-md text-slate-800'
                  }`}
              >
                <div className="text-left flex-1">
                  <div className={`text-xl font-black ${language === opt.code ? 'text-white' : 'text-slate-800'}`}>{opt.label}</div>
                  <div className={`text-xs font-bold mt-1 uppercase tracking-wider ${language === opt.code ? 'text-green-50' : 'text-slate-600'}`}>{opt.sub}</div>
                </div>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                  ${language === opt.code ? 'border-white bg-green-500' : 'border-slate-300 bg-slate-100'}`}>
                  {language === opt.code && <div className="w-3 h-3 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>
          
        </div>
      </div>
    );
  }

  // 3. Welcome / Value Showcase Screen View
  if (step === 'welcome') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 overflow-hidden">
        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25" />
        <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full filter blur-[150px] animate-pulse" />

        <div className="relative max-w-5xl w-full mx-6 bg-slate-900/40 border border-slate-800/80 backdrop-blur-2xl rounded-[3rem] shadow-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left panel - Product features */}
          <div className="p-10 sm:p-12 bg-gradient-to-b from-slate-900/80 to-slate-950/80 border-r border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-400">Dairy Operations Platform</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2">
                Smart Livestock
              </h2>
              <p className="text-lg font-bold text-emerald-400/90 tracking-wide mb-8">
                "Healthy Animals, Better Income"
              </p>

              <div className="space-y-6">
                {[
                  { icon: 'TEMP', title: 'Animal Health Monitoring', desc: 'Real-time temperature and physical health status tracking.' },
                  { icon: 'IMMU', title: 'Vaccination Tracking', desc: 'Pre-planned immunization schedulers and logs.' },
                  { icon: 'MILK', title: 'Milk Production Records', desc: 'Daily milk quantity tracking and automated yield forecasts.' },
                  { icon: 'CARE', title: 'Veterinary Assistance', desc: 'Dedicated consult networks and prescription logs.' }
                ].map((feat, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <span className="text-[10px] font-black text-emerald-400 bg-slate-900/80 w-11 h-11 rounded-xl flex items-center justify-center border border-slate-800 select-none">{feat.icon}</span>
                    <div>
                      <h3 className="font-bold text-slate-200 text-lg leading-tight">{feat.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-655 mt-6 font-semibold">
              © 2026 Smart Livestock Health Cooperative
            </div>
          </div>

          {/* Right panel - Action flow */}
          <div className="p-10 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-400/20 rounded-3xl flex items-center justify-center mb-6">
              <span className="text-xs font-black text-emerald-400">SEC</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white mb-2">Access Portal</h3>
            <p className="text-slate-400 mb-8 max-w-xs text-sm">Enter your credentials or register a new cattle cooperative node.</p>

            <div className="w-full max-w-sm space-y-4">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setStep('role');
                }}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold rounded-2xl shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg animate-pulse"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setStep('role');
                }}
                className="w-full py-4 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white font-bold rounded-2xl hover:bg-slate-900 transition-all text-lg"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Modern Auth Card Screen (Login, Register & Forgot Password)
  if (step === 'auth') {
    return (
      <div 
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url('/src/assets/modern_livestock_bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="relative max-w-lg w-full mx-6 bg-white/90 border border-white/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-10">
          <button 
            onClick={() => {
              if (authMode === 'forgot') {
                setAuthMode('login');
              } else {
                setStep('splash');
              }
            }}
            className="mb-6 text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold transition-colors"
          >
            ← Back
          </button>
          
          <div className="flex bg-slate-200/50 rounded-xl p-1 mb-8 shadow-inner border border-slate-300">
            {['FARMER', 'VET', 'ADMIN'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => changeRole(r)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeRole === r ? 'bg-white text-green-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {r === 'FARMER' ? 'FARMER' : r === 'VET' ? 'DOCTOR' : 'ADMIN'}
              </button>
            ))}
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">
            {authMode === 'login' ? t('welcome_back') : authMode === 'register' ? t('create_account') : t('recover_password')}
          </h2>
          <p className="text-slate-600 mb-8 text-sm font-medium">
            {authMode === 'login' ? t('sign_in_desc') : 
             authMode === 'register' ? t('register_desc') : 
             t('recovery_email_desc')}
          </p>

          {authMode === 'forgot' ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              alert('Recovery email dispatched successfully.');
              setAuthMode('login');
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 tracking-wider mb-2">{t('email_address') || 'Registered Email Address'}</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@dairycoop.com"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 transition-all font-semibold shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-extrabold rounded-xl shadow-lg transition-all text-md mt-6"
              >
                {t('reset_password')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg ? (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-black text-center">
                  {errorMsg}
                </div>
              ) : null}
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 tracking-wider mb-2">{t('full_name')}</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 transition-all font-semibold shadow-sm"
                  />
                </div>
              )}
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 tracking-wider mb-2">{t('phone_number')}</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 transition-all font-semibold shadow-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 tracking-wider mb-2">{t('email_address')}</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@smartlivestock.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 transition-all font-semibold shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 tracking-wider mb-2">{t('password')}</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 transition-all font-semibold shadow-sm"
                />
              </div>

              {authMode === 'login' && (
                <div className="flex items-center justify-between mt-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                    <input type="checkbox" className="w-4 h-4 rounded bg-white border-slate-300 accent-green-500" />
                    <span>{t('remember_me')}</span>
                  </label>
                  <button 
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-xs font-bold text-green-600 hover:underline"
                  >
                    {t('forgot_password')}
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-extrabold rounded-xl shadow-lg transition-all text-md mt-6"
              >
                {authMode === 'login' ? t('login') : t('create_account')}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-600 font-bold">
            {authMode === 'forgot' ? '' : authMode === 'login' ? t('dont_have_account') : t('already_have_account')}
            {authMode !== 'forgot' && (
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-green-600 hover:underline focus:outline-none"
              >
                {authMode === 'login' ? t('create_account') : t('login')}
              </button>
            )}
          </p>
        </div>
      </div>
    );
  }

  // 5. Interactive Role Selection Screen
  if (step === 'role') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full filter blur-[150px]" />
          <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full filter blur-[150px]" />
        </div>

        <div className="relative max-w-4xl w-full mx-6 bg-slate-900/40 border border-slate-800/80 backdrop-blur-2xl rounded-[3rem] p-10 sm:p-12 shadow-3xl text-center">
          <div className="mb-10 max-w-md mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Select Operational Role</h2>
            <p className="text-slate-400 text-sm font-medium">Choose your active viewpoint below. The dashboard layout and quick parameters will customize automatically.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { role: 'FARMER', label: 'Farmer / Breeder', icon: 'BREEDER', color: 'text-emerald-400', desc: 'Monitor milk yields, register livestock devices, track alerts.', border: 'hover:border-emerald-500/40 hover:bg-emerald-500/5' },
              { role: 'VET', label: 'Veterinary Doctor', icon: 'CLINIC', color: 'text-blue-400', desc: 'Access clinical reports, view checkup timelines, prescribe medication.', border: 'hover:border-blue-500/40 hover:bg-blue-500/5' },
              { role: 'ADMIN', label: 'Platform Admin', icon: 'ADMIN', color: 'text-purple-400', desc: 'Audit connected collars, monitor metrics, view log databases.', border: 'hover:border-purple-500/40 hover:bg-purple-500/5' }
            ].map(opt => (
              <button
                key={opt.role}
                onClick={() => {
                  changeRole(opt.role);
                  setStep('auth');
                }}
                className={`flex flex-col items-center p-8 rounded-[2rem] bg-slate-950 border border-slate-800 text-center transition-all transform hover:-translate-y-1 ${opt.border}`}
              >
                <div className={`w-20 h-10 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-center text-[10px] font-black tracking-wider uppercase mb-6 shadow-inner ${opt.color}`}>
                  {opt.icon}
                </div>
                <h3 className="font-extrabold text-white text-lg mb-2">{opt.label}</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">{opt.desc}</p>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-6 group-hover:underline">Select Portal →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 6. Complete Fully Logged-In App View
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
        {/* Futuristic Global Background Grid Overlay */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25 pointer-events-none z-0" />
        <div className="fixed top-[10%] left-[10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full filter blur-[150px] animate-pulse pointer-events-none z-0" />
        <div className="fixed bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full filter blur-[150px] pointer-events-none z-0" />

        <div className="relative z-10">
          <Navbar />
          <Sidebar activeRole={activeRole} />
          <main className="pt-16 lg:pl-64 transition-all duration-300">
            <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard activeRole={activeRole} />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/veterinary" element={<Veterinary />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </LanguageProvider>
  );
}

