'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCRM } from '../../components/crm-provider';
import { useToast } from '../../components/toast-provider';
import { Lock, Mail, ArrowLeft, UserCheck, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, isAuthenticated } = useCRM();

  const [email, setEmail] = useState('arjunyenurkar009@gmail.com');
  const [password, setPassword] = useState('arjun123');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect directly to dashboard console
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast('Please enter your email and password.', 'warning');
      return;
    }

    setLoading(true);

    const success = await login(email.trim(), password);
    setLoading(false);
    if (success) {
      toast('Authentication successful! Welcome, Arjun.', 'success');
      router.push('/dashboard');
    } else {
      toast('Invalid email or password. Please verify your credentials.', 'error');
    }
  };

  const handlePrefill = () => {
    setEmail('arjunyenurkar009@gmail.com');
    setPassword('arjun123');
    toast('Credentials prefilled for Arjun Yenurkar', 'info');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden select-text">
      
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[#f4f6fa] dark:bg-[#090b11] transition-colors duration-500 -z-20" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 dark:bg-blue-400/5 blur-[120px] -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 dark:bg-emerald-400/5 blur-[120px] -z-10" />

      {/* Main Glass Panel Card */}
      <div className="w-full max-w-md rounded-3xl border glass-panel p-8 shadow-2xl flex flex-col gap-5">
        
        {/* Back Link */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors w-max font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        {/* Brand header */}
        <div className="text-center space-y-2">
          <img src="/logo.jpg" alt="Truform Logo" className="w-48 h-auto object-contain mx-auto my-1" />
          <div>
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Truform CRM Console
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Authorized admin portal with hashed credential security
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-3.5 font-semibold text-xs text-slate-600 dark:text-slate-400">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Corporate Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="arjunyenurkar009@gmail.com"
                className="w-full !pl-10 pr-4 py-2.5 glass-input text-xs font-semibold text-slate-800 dark:text-slate-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-sans">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                className="w-full !pl-10 pr-4 py-2.5 glass-input text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-950 font-bold rounded-xl text-xs shadow-lg hover:opacity-90 disabled:opacity-50 transition-opacity mt-2 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-b-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <span>Access CRM Console</span>
            )}
          </button>
        </form>

        {/* Single Authorized Admin Card */}
        <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-3 mt-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-500" /> Authorized Admin Login:
          </span>
          
          <button
            type="button"
            onClick={handlePrefill}
            className="w-full p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-colors flex items-center gap-3 text-left font-semibold text-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              AY
            </div>
            <div className="grow overflow-hidden">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs truncate">Arjun Yenurkar</span>
              <span className="text-[10px] text-slate-400 block truncate">arjunyenurkar009@gmail.com</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold block mb-0.5">Admin</span>
              <span className="text-[10px] text-blue-500 font-bold hover:underline">Prefill</span>
            </div>
          </button>
        </div>

      </div>

    </div>
  );
}
