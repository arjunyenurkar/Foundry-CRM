'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, ClipboardList, 
  FileSpreadsheet, CalendarClock, ShoppingBag, ShieldAlert, 
  BarChart3, Settings, ChevronLeft, ChevronRight, Menu, Factory, UserCheck, LogOut
} from 'lucide-react';
import { useCRM } from '../crm-provider';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers & Leads', href: '/customers', icon: Users },
  { name: 'Enquiries', href: '/enquiries', icon: ClipboardList },
  { name: 'Quotations', href: '/quotations', icon: FileSpreadsheet },
  { name: 'Follow-ups', href: '/followups', icon: CalendarClock },
  { name: 'Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Complaints', href: '/complaints', icon: ShieldAlert },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ isMobileOpen, setIsMobileOpen }: { isMobileOpen: boolean; setIsMobileOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, users, changeUser, sidebarCollapsed, setSidebarCollapsed, logout } = useCRM();
  
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const showLabels = !sidebarCollapsed || isHovered;

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-6 px-4">
      {/* Brand logo */}
      <div>
        <div className="flex items-center justify-center px-1 mb-8">
          {showLabels ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex justify-center py-1"
            >
              <img 
                src="/logo.jpg" 
                alt="Truform Techno Products" 
                className="w-full h-auto max-h-18 object-contain rounded-lg"
              />
            </motion.div>
          ) : (
            <img 
              src="/favicon-logo.png" 
              alt="Truform Logo Icon" 
              className="w-10 h-10 object-contain rounded-lg shadow-sm"
            />
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-250 cursor-pointer relative group ${
                    isActive 
                      ? 'bg-slate-900/5 dark:bg-slate-100/5 font-semibold text-slate-900 dark:text-slate-100 border-l-2 border-slate-950 dark:border-slate-50' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-900/2 dark:hover:bg-slate-100/2'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  
                  {showLabels ? (
                    <span className="text-sm truncate">{item.name}</span>
                  ) : (
                    // Collapsed Tooltip
                    <div className="absolute left-full ml-4 px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-100 text-xs font-medium opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 z-50 shadow-md">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role / User Switcher at the bottom for easy testing of permissions */}
      <div className="mt-auto border-t border-slate-200/40 dark:border-slate-800/40 pt-4 px-2">
        <div className="flex flex-col gap-2">
          {/* User selector dropdown */}
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
            {showLabels && (
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Demo Persona
              </span>
            )}
          </div>
          
          <select
            value={currentUser.id}
            onChange={(e) => changeUser(e.target.value)}
            className={`text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-lg py-1.5 px-2 outline-none w-full text-slate-700 dark:text-slate-300 font-medium ${
              !showLabels ? 'sr-only' : ''
            }`}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
          
          {!showLabels && (
            <div className="relative group flex justify-center py-1">
              <img 
                src={currentUser.avatar_url} 
                alt={currentUser.name} 
                className="w-7 h-7 rounded-full border dark:border-slate-800"
              />
              <div className="absolute left-full ml-4 px-2 py-1 rounded bg-slate-900 text-slate-100 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50">
                {currentUser.name} ({currentUser.role})
              </div>
            </div>
          )}
        </div>

        {/* Log Out button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2.5 w-full mt-4 py-2.5 text-slate-450 hover:text-rose-500 dark:hover:text-rose-400 transition-colors border-t border-slate-200/20 dark:border-slate-800/20 cursor-pointer font-bold"
          title="Log Out"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          {showLabels && <span className="text-xs">Log Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden lg:block h-screen fixed top-0 left-0 bg-slate-50/90 dark:bg-slate-900/90 border-r border-slate-200/40 dark:border-slate-800/40 backdrop-blur-xl transition-all duration-300 ease-out-expo z-30 ${
          sidebarCollapsed && !isHovered ? 'w-20' : 'w-64 shadow-2xl'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile/Tablet Drawer Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile/Tablet Drawer Menu */}
      <aside 
        className="lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-slate-100 dark:bg-slate-950 border-r border-slate-200/40 dark:border-slate-800/40 z-50 transition-transform duration-300"
        style={{ transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
