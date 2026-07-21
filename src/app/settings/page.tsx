'use client';

import React, { useState } from 'react';
import { Save, Settings, Shield, User, Building, Percent, UserPlus, Trash2, Key, Mail } from 'lucide-react';
import { useStudio } from '@/context/studio-context';
import { UserRole } from '@/types/database';

export default function SettingsPage() {
  const { settings, updateSettings, userRole, profiles, updateUserProfileRole, createUserProfile, deleteUserProfile, currentUser } = useStudio();

  const [studioName, setStudioName] = useState(settings.studio_name);
  const [studioAddress, setStudioAddress] = useState(settings.studio_address);
  const [studioPhone, setStudioPhone] = useState(settings.studio_phone);
  const [studioEmail, setStudioEmail] = useState(settings.studio_email);
  const [defaultTaxPercent, setDefaultTaxPercent] = useState(settings.default_tax_percent);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New User Form State
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('123456789');
  const [newRole, setNewRole] = useState<UserRole>('manager');
  const [userCreatedNotice, setUserCreatedNotice] = useState('');

  if (userRole !== 'admin') {
    return (
      <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center max-w-md mx-auto my-12">
        <Shield className="h-10 w-10 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold">Admin Permission Required</h2>
        <p className="text-xs text-rose-400/80 mt-1">
          Only users with the <strong className="text-white">admin</strong> role can configure studio settings & manage team roles.
        </p>
      </div>
    );
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      studio_name: studioName,
      studio_address: studioAddress,
      studio_phone: studioPhone,
      studio_email: studioEmail,
      default_tax_percent: Number(defaultTaxPercent),
      currency_symbol: currencySymbol,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newFullName) return;
    
    createUserProfile({
      full_name: newFullName,
      email: newEmail,
      password: newPassword || '123456789',
      role: newRole,
    });

    setUserCreatedNotice(`Successfully created ${newRole} user "${newFullName}"!`);
    setNewFullName('');
    setNewEmail('');
    setNewPassword('123456789');
    setNewRole('manager');
    setTimeout(() => setUserCreatedNotice(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-400" />
          <span>Studio System Settings & User Roles</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure business details, tax rates, letterhead info & manage user access levels.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
          Studio settings updated successfully!
        </div>
      )}

      {/* Settings Form Card */}
      <form onSubmit={handleSaveSettings} className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Building className="h-4 w-4 text-indigo-400" />
          <span>Studio Letterhead & Profile</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Studio Name</label>
            <input
              type="text"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Billing Email</label>
            <input
              type="email"
              value={studioEmail}
              onChange={(e) => setStudioEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Contact Phone</label>
            <input
              type="text"
              value={studioPhone}
              onChange={(e) => setStudioPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Address / Location</label>
            <input
              type="text"
              value={studioAddress}
              onChange={(e) => setStudioAddress(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>
        </div>

        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 pt-2">
          <Percent className="h-4 w-4 text-indigo-400" />
          <span>Tax & Currency Rules</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Default Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={defaultTaxPercent}
              onChange={(e) => setDefaultTaxPercent(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Currency Symbol</label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Admin User Provisioning Form */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <UserPlus className="h-4 w-4 text-indigo-400" />
          <span>Create New Manager / Staff Account</span>
        </h3>

        {userCreatedNotice && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            {userCreatedNotice}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. manager@daylightmedia.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Select User Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="manager">Manager (Inventory & Invoices)</option>
                <option value="staff">Staff (Read & Drafts)</option>
                <option value="admin">Admin (Full Control)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create User Account</span>
            </button>
          </div>
        </form>
      </div>

      {/* User Profiles & Role Management Table */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Shield className="h-4 w-4 text-purple-400" />
          <span>User Profiles & Access Management</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                <th className="py-2.5 px-3">User Full Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {profiles.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 px-3 font-semibold text-slate-100 flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-400" />
                    <span>{p.full_name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono">
                    {p.email || 'N/A'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-extrabold uppercase text-[10px] ${
                      p.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : p.role === 'manager'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={p.role}
                        onChange={(e) => updateUserProfileRole(p.id, e.target.value as UserRole)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="staff">Staff</option>
                      </select>

                      {p.id !== currentUser.id && profiles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteUserProfile(p.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remove user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

