'use client';

import React, { useState } from 'react';
import { History, Search, User, Shield } from 'lucide-react';
import { useStudio } from '@/context/studio-context';

export default function ActivityLogPage() {
  const { activityLogs, profiles } = useStudio();
  const [search, setSearch] = useState('');

  const filteredLogs = activityLogs.filter((log) => {
    const actor = profiles.find((p) => p.id === log.actor_id);
    return (
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_table.toLowerCase().includes(search.toLowerCase()) ||
      (actor && actor.full_name?.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <History className="h-6 w-6 text-indigo-400" />
          <span>System Audit & Activity Trail</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Complete security audit log tracking who performed which action on inventory items, stock movements, and invoices.
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, user, or table..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Actor / User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Table</th>
                <th className="py-3.5 px-4">Entity ID</th>
                <th className="py-3.5 px-4">Metadata Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => {
                const actor = profiles.find((p) => p.id === log.actor_id);
                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(log.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{actor?.full_name || 'Studio User'}</div>
                      <span className="text-[10px] text-indigo-400 uppercase font-semibold">{actor?.role || 'staff'}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        log.action === 'INSERT'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : log.action === 'UPDATE'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : log.action === 'FINALIZE'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-300">
                      {log.entity_table}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {log.entity_id}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
