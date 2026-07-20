'use client';

export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUpDown,
  Filter,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useStudio } from '@/context/studio-context';
import { MovementType } from '@/types/database';

function StockMovementsContent() {
  const searchParams = useSearchParams();
  const preselectedItem = searchParams.get('item');
  const actionParam = searchParams.get('action');

  const { stockMovements, items, addStockMovement, profiles } = useStudio();

  const [search, setSearch] = useState('');
  const [movementFilter, setMovementFilter] = useState<string>('all');
  const [selectedItemFilter, setSelectedItemFilter] = useState<string>(preselectedItem || 'all');
  const [showModal, setShowModal] = useState<boolean>(actionParam === 'new');

  // New Movement Form state
  const [formItemId, setFormItemId] = useState<string>(items[0]?.id || '');
  const [formType, setFormType] = useState<MovementType>('purchase_in');
  const [formQty, setFormQty] = useState<number>(1);
  const [formNote, setFormNote] = useState<string>('');

  const filteredMovements = stockMovements.filter((m) => {
    const item = items.find((i) => i.id === m.item_id);
    const matchesSearch =
      item?.name.toLowerCase().includes(search.toLowerCase()) ||
      item?.sku.toLowerCase().includes(search.toLowerCase()) ||
      (m.note && m.note.toLowerCase().includes(search.toLowerCase()));

    const matchesType = movementFilter === 'all' || m.movement_type === movementFilter;
    const matchesItem = selectedItemFilter === 'all' || m.item_id === selectedItemFilter;

    return matchesSearch && matchesType && matchesItem;
  });

  const handleCreateMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItemId || formQty <= 0) return;

    addStockMovement({
      item_id: formItemId,
      movement_type: formType,
      quantity: Number(formQty),
      note: formNote || `${formType.replace('_', ' ')} recorded via stock ledger`,
    });

    setShowModal(false);
    setFormQty(1);
    setFormNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <ArrowUpDown className="h-6 w-6 text-indigo-400" />
            <span>Stock Movements Ledger</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete audit record of purchases, studio usage, damaged materials, returns & manual adjustments.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Record Stock Movement</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movement note or material SKU..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Movement Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={movementFilter}
              onChange={(e) => setMovementFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Movement Types</option>
              <option value="purchase_in" className="bg-slate-900">Purchase In (+)</option>
              <option value="usage_out" className="bg-slate-900">Usage Out (-)</option>
              <option value="damaged" className="bg-slate-900">Damaged / Lost (-)</option>
              <option value="returned" className="bg-slate-900">Returned (+)</option>
              <option value="adjustment" className="bg-slate-900">Stock Adjustment (±)</option>
            </select>
          </div>

          {/* Item Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedItemFilter}
              onChange={(e) => setSelectedItemFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              <option value="all" className="bg-slate-900">All Materials</option>
              {items.map((i) => (
                <option key={i.id} value={i.id} className="bg-slate-900">{i.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Material Item</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Quantity</th>
                <th className="py-3.5 px-4">Logged By</th>
                <th className="py-3.5 px-4">Note / Invoice Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <ArrowUpDown className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-sm">No stock movements found</p>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const item = items.find((i) => i.id === m.item_id);
                  const user = profiles.find((p) => p.id === m.created_by);
                  const isPositive = m.movement_type === 'purchase_in' || m.movement_type === 'returned';

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {new Date(m.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100">{item?.name || 'Material Item'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">SKU: {item?.sku}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold uppercase text-[10px] ${
                            m.movement_type === 'purchase_in'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : m.movement_type === 'usage_out'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : m.movement_type === 'damaged'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : m.movement_type === 'returned'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {isPositive ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {m.movement_type.replace('_', ' ')}
                        </span>
                      </td>

                      <td className={`py-3 px-4 text-right font-extrabold text-sm font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? '+' : '-'}{m.quantity} <span className="text-xs font-normal text-slate-400">{item?.unit}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {user?.full_name || 'Studio Admin'}
                      </td>

                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {m.note || 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Stock Movement Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl border border-slate-800 p-6 space-y-5 shadow-2xl">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-400" />
              <span>Record Stock Movement</span>
            </h2>

            <form onSubmit={handleCreateMovement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Material Item *
                </label>
                <select
                  value={formItemId}
                  onChange={(e) => setFormItemId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Stock: {i.stock_on_hand} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Movement Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as MovementType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="purchase_in">Purchase In (+)</option>
                    <option value="usage_out">Usage Out (-)</option>
                    <option value="damaged">Damaged / Lost (-)</option>
                    <option value="returned">Returned (+)</option>
                    <option value="adjustment">Stock Adjustment (±)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formQty}
                    onChange={(e) => setFormQty(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Note / Reason
                </label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="e.g. Shipment arrival from Apex Optics or production shoot usage"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 h-20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20"
                >
                  Confirm & Post Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StockMovementsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading stock movements ledger...</div>}>
      <StockMovementsContent />
    </Suspense>
  );
}
