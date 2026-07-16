import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function InitialLanguageScreen() {
  const { changeLanguage } = useLanguage();

  const options = [
    { code: 'mr', label: 'मराठी', sub: 'Marathi', icon: '' },
    { code: 'hi', label: 'हिंदी', sub: 'Hindi', icon: '' },
    { code: 'en', label: 'English', sub: 'English', icon: '' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-green rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-72 h-72 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-primary-green/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary-green/30">
            <span className="text-4xl">🐄</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Select Language</h1>
          <p className="text-slate-400">भाषा निवडा / भाषा चुनें</p>
        </div>

        <div className="space-y-4">
          {options.map((opt) => (
            <button
              key={opt.code}
              onClick={() => changeLanguage(opt.code)}
              className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-primary-green/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{opt.icon}</span>
                <div className="text-left">
                  <div className="text-xl font-bold text-slate-100 group-hover:text-primary-green transition-colors">{opt.label}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest">{opt.sub}</div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-slate-600 flex items-center justify-center group-hover:border-primary-green group-hover:bg-primary-green transition-all">
                <div className="w-2 h-2 bg-slate-900 rounded-full opacity-0 group-hover:opacity-100"></div>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-500 italic">
          You can change this later in settings.
        </p>
      </div>
    </div>
  );
}
