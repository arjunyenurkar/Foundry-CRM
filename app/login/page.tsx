'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCRM } from '../../components/crm-provider';
import { useToast } from '../../components/toast-provider';
import { Factory, Lock, Mail, ArrowLeft, Key, UserCheck, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, isAuthenticated, users } = useCRM();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123'); // Standard password for seeds
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect directly to dashboard console
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast('Please enter your corporate email.', 'warning');
      return;
    }
    setLoading(true);
    
    // Simulate slight server latency
    setTimeout(async () => {
      const success = await login(email, password);
      setLoading(false);
      if (success) {
        toast('Authentication successful! Welcome to console.', 'success');
        router.push('/dashboard');
      } else {
        toast('Invalid email credentials. Please check seed accounts.', 'error');
      }
    }, 800);
  };

  const handlePrefill = (prefillEmail: string) => {
    setEmail(prefillEmail);
    setPassword('password123');
    toast(`Prefilled credentials for ${prefillEmail.split('@')[0]}`, 'info');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden select-text">
      
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[#f4f6fa] dark:bg-[#090b11] transition-colors duration-500 -z-20" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 dark:bg-blue-400/5 blur-[120px] -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 dark:bg-emerald-400/5 blur-[120px] -z-10" />

      {/* Main Glass Panel Card */}
      <div className="w-full max-w-md rounded-3xl border glass-panel p-8 shadow-2xl flex flex-col gap-6">
        
        {/* Back Link */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-650 transition-colors w-max font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Landing Page
        </button>

        {/* Brand header */}
        <div className="text-center space-y-2.5">
          <img src="/logo.jpg" alt="Truform Logo" className="w-52 h-auto object-contain mx-auto my-1" />
          <div>
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Truform CRM Console
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Enterprise login portal for authorized users</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 font-semibold text-xs text-slate-600 dark:text-slate-400">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Corporate Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="username@truformindia.com"
                className="w-full !pl-10 pr-4 py-2.5 glass-input text-xs font-semibold text-slate-800 dark:text-slate-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-sans">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                className="w-full !pl-10 pr-4 py-2.5 glass-input text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                <div className="w-3.5 h-3.5 border-2 border-slate-450 border-b-transparent rounded-full animate-spin" />
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <span>Access CRM Console</span>
            )}
          </button>
        </form>

        {/* Demo Accounts Prefill Grid */}
        <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-4 mt-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-3 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-500" /> Click to login as a respected user:
          </span>
          
          <div className="grid grid-cols-1 gap-2">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => handlePrefill(u.email)}
                className="w-full p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-900/5 dark:hover:bg-slate-100/5 transition-colors flex items-center gap-3 text-left font-semibold text-xs"
              >
                <img src={u.avatar_url} alt={u.name} className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-200/20" />
                <div className="grow overflow-hidden">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">{u.name}</span>
                  <span className="text-[9px] uppercase tracking-wide text-slate-400 block">{u.role}</span>
                </div>
                <span className="text-[9px] text-blue-500 font-bold shrink-0 hover:underline">Prefill</span>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
