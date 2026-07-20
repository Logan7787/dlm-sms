'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Filter,
  Plus,
  Package,
  Search,
  XCircle,
  Edit,
  Eye,
} from 'lucide-react';
import { useStudio } from '@/context/studio-context';

export default function InventoryPage() {
  const { items, categories, suppliers, settings, userRole } = useStudio();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  // Filter Items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSupplier = selectedSupplier === 'all' || item.supplier_id === selectedSupplier;
    const matchesLowStock = !onlyLowStock || item.is_low_stock;

    return matchesSearch && matchesCategory && matchesSupplier && matchesLowStock;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-400" />
            <span>Studio Material Inventory</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time stock ledger calculation, barcodes/SKUs, reorder thresholds & pricing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/stock-movements"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Stock Ledger</span>
          </Link>
          <Link
            href="/inventory/new"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Item</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search material name or SKU..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Dropdowns & Checkboxes */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
              ))}
            </select>
          </div>

          {/* Low Stock Toggle */}
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              onlyLowStock
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-700/80 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Low Stock Only</span>
          </button>
        </div>
      </div>

      {/* Materials Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Item & SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4 text-right">Cost Price</th>
                <th className="py-3.5 px-4 text-right">Rental / Selling</th>
                <th className="py-3.5 px-4 text-center">Stock On Hand</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-sm">No material items match your filters</p>
                    <p className="text-xs text-slate-500 mt-1">Try clearing search or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const stock = item.stock_on_hand;
                  const isOutOfStock = stock <= 0;
                  const isLow = item.is_low_stock && !isOutOfStock;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Name & Photo & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 relative">
                            {item.photo_url ? (
                              <img src={item.photo_url} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-500 font-bold text-xs">
                                {item.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <Link href={`/inventory/${item.id}`} className="font-bold text-slate-100 hover:text-indigo-400 transition-colors text-sm">
                              {item.name}
                            </Link>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                              <span>SKU: {item.sku}</span>
                              <span>•</span>
                              <span>Reorder at: {item.reorder_level} {item.unit}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-medium text-slate-300">
                        {item.category_name}
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-4 text-slate-400 truncate max-w-xs">
                        {item.supplier_name}
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-4 text-right font-medium text-slate-300 font-mono">
                        {settings.currency_symbol}{item.cost_price.toFixed(2)}
                      </td>

                      {/* Selling / Rental Price */}
                      <td className="py-3 px-4 text-right font-bold text-indigo-300 font-mono">
                        {settings.currency_symbol}{item.selling_price.toFixed(2)}
                      </td>

                      {/* Live Stock Quantity */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block font-extrabold text-sm font-mono px-2.5 py-1 rounded-lg ${
                          isOutOfStock
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : isLow
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {stock} <span className="text-[11px] font-normal">{item.unit}</span>
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            <XCircle className="h-3 w-3" />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                            <AlertTriangle className="h-3 w-3 text-amber-400" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/inventory/${item.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="View / Edit Item"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                          <Link
                            href={`/stock-movements?item=${item.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 transition-colors"
                            title="Adjust Stock"
                          >
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
