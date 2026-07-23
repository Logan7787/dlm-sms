'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Shield, User, Sparkles, LogOut, Sun, Moon } from 'lucide-react';
import { useStudio } from '@/context/studio-context';
import { UserRole } from '@/types/database';

export function Header() {
  const { userRole, setUserRole, currentUser, theme, setTheme } = useStudio();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserRole(e.target.value as UserRole);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'manager':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'staff':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 print:hidden">
      {/* Search & Studio Quick Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-mono text-slate-300">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span>DLM-STUDIO-v1.0</span>
        </div>
      </div>

      {/* Actions & Role Switcher */}
      <div className="flex items-center gap-4">
        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/invoices/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold hover:opacity-90 shadow-sm transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Invoice</span>
          </Link>
          <Link
            href="/inventory/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/70 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Item</span>
          </Link>
        </div>

        <div className="h-6 w-px bg-slate-800" />

        {/* Demo Role Switcher */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 px-3 py-1 rounded-xl">
          <Shield className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-xs font-medium text-slate-400">Role:</span>
          <select
            value={userRole}
            onChange={handleRoleChange}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
          >
            <option value="admin" className="bg-slate-900 text-purple-300">Admin (Full Control)</option>
            <option value="manager" className="bg-slate-900 text-blue-300">Manager (Inventory & Billing)</option>
            <option value="staff" className="bg-slate-900 text-emerald-300">Staff (Read & Drafts)</option>
          </select>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200"
          title={theme === 'dark' ? 'Switch to Day Theme' : 'Switch to Night Theme'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-400" />
          )}
        </button>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">{currentUser.full_name}</p>
            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full border ${getRoleBadgeColor(userRole)}`}>
              {userRole}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {currentUser.full_name?.charAt(0) || 'U'}
          </div>
          <Link href="/login" className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors" title="Sign Out / Switch User">
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
