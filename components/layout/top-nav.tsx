'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, Bell, Moon, Sun, Monitor, Plus, LogOut, 
  RefreshCw, Menu, ChevronRight, CheckCircle2, AlertTriangle, AlertCircle
} from 'lucide-react';
import { useTheme } from '../theme-provider';
import { useCRM } from '../crm-provider';
import { useToast } from '../toast-provider';
import { GlobalSearch } from '../global-search';

export function TopNav({ onMenuClick, onQuickAdd }: { onMenuClick: () => void; onQuickAdd: (type: string) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { 
    currentUser, notifications, markNotificationRead, markAllNotificationsRead, resetDemoData, logout 
  } = useCRM();
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) setQuickAddOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    function handleShortcut(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  // Resolve breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(p => p);
    if (paths.length === 0) return [{ label: 'Dashboard', href: '/' }];
    
    return [
      { label: 'Dashboard', href: '/' },
      ...paths.map((p, idx) => {
        const href = '/' + paths.slice(0, idx + 1).join('/');
        let label = p.charAt(0).toUpperCase() + p.slice(1);
        if (label === 'Technical') label = 'Technical Feasibility';
        return { label, href };
      })
    ];
  };

  const breadcrumbs = getBreadcrumbs();
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';
  const unreadNotifs = notifications.filter(n => !n.read);

  const handleResetDemo = () => {
    if (confirm('Are you sure you want to reset all mock data to the default seeded values? This will wipe your local changes.')) {
      resetDemoData();
      toast('Demo data has been successfully reset.', 'success');
      router.push('/');
    }
  };

  const handleNotificationClick = async (id: string, relatedId: string, relatedType: string) => {
    await markNotificationRead(id);
    setNotifOpen(false);
    
    if (relatedType === 'followup') {
      router.push('/followups');
    } else if (relatedType === 'quotation') {
      router.push(`/quotations?id=${relatedId}`);
    } else if (relatedType === 'enquiry') {
      router.push(`/enquiries?id=${relatedId}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full glass-panel backdrop-blur-xl border-b border-slate-200/40 dark:border-slate-800/40 px-6 py-4 flex items-center justify-between">
      
      {/* Title & Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Mobile/Tablet menu toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={b.href}>
                <span 
                  onClick={() => router.push(b.href)}
                  className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                >
                  {b.label}
                </span>
                {idx < breadcrumbs.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </React.Fragment>
            ))}
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center gap-3">
        
        {/* Search Trigger Button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 text-slate-400 transition-colors w-44 md:w-56 text-left"
        >
          <Search className="w-4 h-4 shrink-0 text-slate-400" />
          <span className="text-xs text-slate-400 grow truncate">Search...</span>
          <kbd className="hidden md:inline-flex items-center text-[10px] bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 rounded px-1 text-slate-400 font-sans font-medium">
            Ctrl K
          </kbd>
        </button>

        {/* Quick Add Button */}
        <div ref={quickAddRef} className="relative">
          <button
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
          
          {quickAddOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl border glass-panel backdrop-blur-md p-1.5 flex flex-col gap-0.5">
              {[
                { label: 'New Customer', type: 'customer' },
                { label: 'New Enquiry', type: 'enquiry' },
                { label: 'New Quotation', type: 'quotation' },
                { label: 'New Follow-up', type: 'followup' },
                { label: 'New Order', type: 'order' },
                { label: 'New Complaint', type: 'complaint' }
              ].map(opt => (
                <button
                  key={opt.type}
                  onClick={() => {
                    onQuickAdd(opt.type);
                    setQuickAddOpen(false);
                  }}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-900/5 dark:hover:bg-slate-100/5 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={handleResetDemo}
          className="p-2 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 rounded-xl transition-colors relative group"
          title="Reset Demo Data"
        >
          <RefreshCw className="w-4.5 h-4.5" />
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-100 text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Reset Demo Data
          </span>
        </button>

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-slate-500 dark:text-slate-400 transition-colors relative"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl border glass-panel backdrop-blur-md overflow-hidden flex flex-col max-h-[350px]">
              <div className="px-4 py-3 border-b border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-xs font-bold text-slate-850 dark:text-slate-150">Notifications</span>
                {unreadNotifs.length > 0 && (
                  <button 
                    onClick={() => {
                      markAllNotificationsRead();
                      toast('All notifications marked as read', 'success');
                    }}
                    className="text-[10px] text-blue-500 hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto p-1.5 flex flex-col gap-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 font-medium">
                    No new alerts
                  </div>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id, n.related_entity_id, n.related_entity_type)}
                      className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-lg transition-colors ${
                        n.read 
                          ? 'opacity-60 hover:bg-slate-900/2 dark:hover:bg-slate-100/2' 
                          : 'bg-blue-500/5 dark:bg-blue-400/5 border border-blue-500/10 hover:bg-blue-500/10'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {n.type === 'followup_overdue' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                        {n.type === 'followup_due' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                        {n.type === 'quotation_expiring' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        {n.type === 'technical_pending' && <AlertCircle className="w-4 h-4 text-indigo-500" />}
                        {n.type === 'quotation_approved' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div className="grow overflow-hidden">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">{n.title}</span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5 line-clamp-2">{n.description}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <div ref={themeRef} className="relative">
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="p-2 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-slate-500 dark:text-slate-400 transition-colors"
          >
            {theme === 'light' && <Sun className="w-4.5 h-4.5" />}
            {theme === 'dark' && <Moon className="w-4.5 h-4.5" />}
            {theme === 'system' && <Monitor className="w-4.5 h-4.5" />}
          </button>

          {themeOpen && (
            <div className="absolute right-0 mt-2 w-32 rounded-xl shadow-xl border glass-panel backdrop-blur-md p-1.5 flex flex-col gap-0.5">
              {[
                { name: 'Light', value: 'light', icon: Sun },
                { name: 'Dark', value: 'dark', icon: Moon },
                { name: 'System', value: 'system', icon: Monitor }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    onClick={() => {
                      setTheme(item.value as any);
                      setThemeOpen(false);
                      toast(`Theme set to ${item.name}`, 'info');
                    }}
                    className={`w-full text-left text-xs px-2.5 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-900/5 dark:hover:bg-slate-100/5 transition-colors font-medium ${
                      theme === item.value ? 'text-blue-500 font-semibold' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 border border-slate-200/40 dark:border-slate-800/40 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <img
              src={currentUser.avatar_url}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl shadow-xl border glass-panel backdrop-blur-md p-1.5 flex flex-col gap-0.5">
              <div className="px-3 py-2 border-b border-slate-200/40 dark:border-slate-800/40 mb-1">
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">{currentUser.name}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mt-0.5">{currentUser.role}</span>
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push('/settings');
                }}
                className="w-full text-left text-xs px-3 py-2 rounded-lg text-slate-650 dark:text-slate-350 hover:bg-slate-900/5 dark:hover:bg-slate-100/5 transition-colors font-medium"
              >
                Profile Settings
              </button>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                  router.push('/');
                  toast('Logged out successfully', 'success');
                }}
                className="w-full text-left text-xs px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Render Command Palette Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
