'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCRM } from '../components/crm-provider';
import { useTheme } from '../components/theme-provider';
import { 
  Factory, ShieldCheck, FileText, ArrowRight, Sun, Moon, 
  Monitor, TrendingUp, BarChart3, ClipboardList, Lock,
  Sparkles, CheckCircle2, ChevronRight, Zap
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useCRM();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col select-text font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[#f4f6fa] dark:bg-[#090b11] transition-colors duration-500 -z-30" />
      <div className="absolute top-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-blue-500/5 dark:bg-blue-400/5 blur-[120px] -z-20" />
      <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 dark:bg-emerald-400/5 blur-[120px] -z-20" />

      {/* Floating stars decoration */}
      <div className="absolute top-[15%] left-[8%] animate-pulse text-blue-500/30 dark:text-blue-400/20 -z-10"><Sparkles className="w-8 h-8" /></div>
      <div className="absolute bottom-[20%] right-[10%] animate-pulse text-emerald-500/30 dark:text-emerald-400/20 -z-10"><Sparkles className="w-10 h-10" /></div>

      {/* 1. Header Nav Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <img src="/logo.jpg" alt="Truform Techno Products" className="w-72 h-auto object-contain" />
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          {/* Theme switcher */}
          <div className="flex bg-slate-900/5 dark:bg-slate-100/5 rounded-full p-0.5 border border-slate-200/10">
            <button 
              onClick={() => setTheme('light')} 
              className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-white shadow text-blue-500' : 'text-slate-400'}`}
              title="Light theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setTheme('dark')} 
              className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-slate-800 shadow text-blue-400' : 'text-slate-400'}`}
              title="Dark theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CTA Console link */}
          {isMounted && isAuthenticated ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-950 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
            >
              Console <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-950 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" /> Login
            </button>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-6 py-12 md:py-20 gap-6">
        
        {/* Release tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" /> Production Ready CRM Suite
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
          Sales Commercial Management <br />
          <span className="bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">
            Built for Truform Casting
          </span>
        </h1>

        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
          From OEM enquiries and quotation approvals to sales orders, active follow-ups, and quality CAPA audits. Monitor your commercial sales lifecycle in a single suite.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2 font-bold text-xs">
          {isMounted && isAuthenticated ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-950 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-lg text-sm"
            >
              Open Console Console <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-950 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-lg text-sm"
            >
              Launch Live Demo Console <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <a 
            href="#features"
            className="px-6 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-350 transition-colors text-sm"
          >
            Explore Platform Features
          </a>
        </div>

        {/* Console status badge */}
        {isMounted && isAuthenticated && (
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">
            Logged in as: <span className="font-bold text-blue-500">{currentUser.name} ({currentUser.role})</span>
          </span>
        )}
      </section>

      {/* 3. Performance Metrics Block */}
      <section className="w-full max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Tons Shipped', val: '14,250+' },
          { label: 'CAPA Resolution Rate', val: '98.6%' },
          { label: 'Lead-to-Quote Time', val: '12 Days' },
          { label: 'Active Pipeline Value', val: '₹14.8Cr+' }
        ].map(item => (
          <div key={item.label} className="p-5 rounded-2xl glass-card text-center">
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 block font-mono">{item.val}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mt-1">{item.label}</span>
          </div>
        ))}
      </section>

      {/* 4. Features Section */}
      <section id="features" className="w-full max-w-7xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50 uppercase">
            Tailored Commercial Capabilities
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Enterprise components management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-semibold text-xs text-slate-550 dark:text-slate-400">
          
          {/* Box 1: Enquiry Tracking */}
          <div className="p-6 rounded-3xl border glass-panel flex flex-col gap-3">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 w-max">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 mt-1">Enquiry & Pipeline Management</h3>
            <p className="leading-relaxed">
              Track OEM leads, customer specifications, and commercial requirements from initial prospect to deal conversion.
            </p>
          </div>

          {/* Box 2: Quotation Engine */}
          <div className="p-6 rounded-3xl border glass-panel flex flex-col gap-3">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 w-max">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 mt-1">Commercial Offers & PDF</h3>
            <p className="leading-relaxed">
              Generate printable, professional commercial sheets. Includes discount matrix fields, tax rules defaults, payment condition definitions, and signatory markers.
            </p>
          </div>

          {/* Box 3: Quality & Complaints */}
          <div className="p-6 rounded-3xl border glass-panel flex flex-col gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 w-max">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 mt-1">CAPA & Quality Resolution</h3>
            <p className="leading-relaxed">
              Log customer feedback and defect tickets. Track root-cause analysis (RCA), corrective actions, and preventive action plans to maintain high delivery standards.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/40 dark:border-slate-800/40 mt-auto py-8 text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
        <span>© 2026 Truform CRM Systems &bull; High-Precision Industrial Pipe & Casting Solutions</span>
      </footer>

    </div>
  );
}
