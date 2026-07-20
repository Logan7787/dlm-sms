'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  CheckCircle2,
  Edit,
  Package,
  Save,
  Truck,
  XCircle,
} from 'lucide-react';
import { useStudio } from '@/context/studio-context';

export default function InventoryItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { items, categories, suppliers, stockMovements, updateItem, settings } = useStudio();

  const itemId = params.id as string;
  const item = items.find((i) => i.id === itemId);

  if (!item) {
    return (
      <div className="text-center py-20">
        <Package className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Item Not Found</h2>
        <p className="text-xs text-slate-400 mt-1 mb-4">The requested inventory material ID does not exist.</p>
        <Link href="/inventory" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs">
          Back to Inventory
        </Link>
      </div>
    );
  }

  const [name, setName] = useState(item.name);
  const [sku, setSku] = useState(item.sku);
  const [unit, setUnit] = useState(item.unit);
  const [costPrice, setCostPrice] = useState(item.cost_price);
  const [sellingPrice, setSellingPrice] = useState(item.selling_price);
  const [reorderLevel, setReorderLevel] = useState(item.reorder_level);
  const [isEditing, setIsEditing] = useState(false);

  const itemMovements = stockMovements.filter((m) => m.item_id === item.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateItem(item.id, {
      name,
      sku,
      unit,
      cost_price: Number(costPrice),
      selling_price: Number(sellingPrice),
      reorder_level: Number(reorderLevel),
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/inventory"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>{item.name}</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">SKU: {item.sku}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/stock-movements?item=${item.id}`}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Adjust Stock</span>
          </Link>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Edit className="h-3.5 w-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
          </button>
        </div>
      </div>

      {/* Main Item Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Image & Stock Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="h-48 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative flex items-center justify-center">
            {item.photo_url ? (
              <img src={item.photo_url} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <Package className="h-16 w-16 text-slate-700" />
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Stock Level</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white font-mono">{item.stock_on_hand}</span>
              <span className="text-sm text-slate-400 font-medium">{item.unit}</span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Reorder Threshold:</span>
              <span className="font-bold text-amber-300 font-mono">{item.reorder_level} {item.unit}</span>
            </div>

            <div className="pt-1">
              {item.stock_on_hand <= 0 ? (
                <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>Out of Stock</span>
                </div>
              ) : item.is_low_stock ? (
                <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Low Stock Warning</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Stock Healthy</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Editable Metadata & Ledger */}
        <div className="md:col-span-2 space-y-6">
          {/* Metadata Card */}
          <form onSubmit={handleSave} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Material Configuration & Pricing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Item Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-100">{item.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  SKU Code
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-100 font-mono">{item.sku}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Cost Price
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-200 font-mono">
                    {settings.currency_symbol}{item.cost_price.toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Selling / Rental Rate
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                ) : (
                  <p className="text-sm font-bold text-indigo-300 font-mono">
                    {settings.currency_symbol}{item.selling_price.toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Unit
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-200">{item.unit}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Reorder Level
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                ) : (
                  <p className="text-sm font-semibold text-amber-300 font-mono">{item.reorder_level}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </form>

          {/* Movement History for this Item */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Item Stock Movement History</span>
              <span className="text-xs font-normal text-slate-400">{itemMovements.length} entries recorded</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="pb-2 px-2">Date</th>
                    <th className="pb-2 px-2">Movement Type</th>
                    <th className="pb-2 px-2 text-right">Qty</th>
                    <th className="pb-2 px-2">Note / Invoice Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {itemMovements.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-500">No stock movements recorded yet.</td>
                    </tr>
                  ) : (
                    itemMovements.map((m) => {
                      const isPositive = m.movement_type === 'purchase_in' || m.movement_type === 'returned';
                      return (
                        <tr key={m.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-2 text-slate-400">{new Date(m.created_at).toLocaleDateString()}</td>
                          <td className="py-2.5 px-2 font-semibold text-slate-200">{m.movement_type}</td>
                          <td className={`py-2.5 px-2 text-right font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? '+' : '-'}{m.quantity}
                          </td>
                          <td className="py-2.5 px-2 text-slate-400">{m.note || 'N/A'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
