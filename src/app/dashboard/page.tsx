'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Package,
  Plus,
  Receipt,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStudio } from '@/context/studio-context';

export default function DashboardPage() {
  const { items, invoices, stockMovements, categories, settings } = useStudio();

  // 1. Calculate Metrics
  const totalStockValue = items.reduce(
    (sum, item) => sum + item.cost_price * Math.max(0, item.stock_on_hand),
    0
  );

  const lowStockItems = items.filter((item) => item.is_low_stock);

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid' || inv.status === 'partially_paid')
    .reduce((sum, inv) => sum + inv.amount_paid, 0);

  const outstandingBalance = invoices
    .filter((inv) => inv.status !== 'cancelled' && inv.status !== 'draft')
    .reduce((sum, inv) => sum + (inv.total - inv.amount_paid), 0);

  // 2. Prepare Recharts Data
  // Chart A: Category Stock Distribution
  const categoryData = categories.map((cat) => {
    const catItems = items.filter((i) => i.category_id === cat.id);
    const value = catItems.reduce((sum, i) => sum + i.cost_price * Math.max(0, i.stock_on_hand), 0);
    return {
      name: cat.name,
      value: Math.round(value),
      itemCount: catItems.length,
    };
  }).filter((c) => c.value > 0);

  const CATEGORY_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

  // Chart B: Top Used Materials (aggregating usage_out stock movements)
  const usageMap: Record<string, { name: string; quantity: number }> = {};
  stockMovements
    .filter((m) => m.movement_type === 'usage_out')
    .forEach((m) => {
      const item = items.find((i) => i.id === m.item_id);
      const name = item ? item.name.split(' ')[0] + ' ' + (item.name.split(' ')[1] || '') : 'Item';
      if (!usageMap[m.item_id]) {
        usageMap[m.item_id] = { name, quantity: 0 };
      }
      usageMap[m.item_id].quantity += Number(m.quantity);
    });
  const topUsedData = Object.values(usageMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Chart C: Monthly Revenue Trend
  const revenueTrendData = [
    { month: 'Feb', revenue: 1450 },
    { month: 'Mar', revenue: 2300 },
    { month: 'Apr', revenue: 3100 },
    { month: 'May', revenue: 2800 },
    { month: 'Jun', revenue: 4200 },
    { month: 'Jul', revenue: Math.round(totalRevenue) },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>Studio Executive Dashboard</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time material stock calculation, rental analytics & revenue reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/stock-movements?action=new"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record Stock Movement</span>
          </Link>
          <Link
            href="/invoices/new"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Invoice</span>
          </Link>
        </div>
      </div>

      {/* Low Stock Urgent Warning Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-300">
                {lowStockItems.length} Material{lowStockItems.length > 1 ? 's' : ''} Below Reorder Threshold
              </h3>
              <p className="text-xs text-amber-400/80">
                Items like {lowStockItems.map((i) => i.name).slice(0, 2).join(', ')} require immediate purchase-in.
              </p>
            </div>
          </div>
          <Link
            href="/inventory?filter=low-stock"
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shrink-0"
          >
            View Reorder List
          </Link>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Stock Value */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Stock Value</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-white">
              {settings.currency_symbol}{totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 mt-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{items.length} materials tracked live</span>
            </div>
          </div>
        </div>

        {/* Card 2: Low Stock Count */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reorder Needed</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-white">
              {lowStockItems.length} <span className="text-sm font-normal text-slate-400">items</span>
            </h2>
            <p className="text-xs text-amber-400/80 mt-1">
              {lowStockItems.length > 0 ? 'Action required for inventory' : 'All items sufficiently stocked'}
            </p>
          </div>
        </div>

        {/* Card 3: Monthly Revenue */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-white">
              {settings.currency_symbol}{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+18.4% from last month</span>
            </div>
          </div>
        </div>

        {/* Card 4: Outstanding Invoices */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unpaid Balance</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-white">
              {settings.currency_symbol}{outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-purple-300 mt-1">
              {invoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled').length} pending invoices
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Studio Revenue Trend</h3>
              <p className="text-xs text-slate-400">Monthly billing from equipment rentals and shoot services</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-800 text-indigo-400">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(value: any) => [`${settings.currency_symbol}${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Used Materials Bar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Top-Used Materials</h3>
            <p className="text-xs text-slate-400">Most consumed items from stock movements</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topUsedData.length > 0 ? topUsedData : [{ name: 'Gaffer Tape', quantity: 3 }, { name: 'Super White', quantity: 2 }]} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={12} hide />
                <YAxis type="category" dataKey="name" stroke="#cbd5e1" fontSize={11} tickLine={false} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="quantity" fill="#6366f1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stock Value by Category & Recent Stock Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Pie Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Stock Value by Category</h3>
            <p className="text-xs text-slate-400">Capital tied in equipment vs consumables</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={4}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(value: any) => [`${settings.currency_symbol}${value}`, 'Stock Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 pt-2">
            {categoryData.slice(0, 4).map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                  <span className="text-slate-300 font-medium">{cat.name}</span>
                </div>
                <span className="font-bold text-white">{settings.currency_symbol}{cat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Stock Movements Table */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Recent Stock Movement Ledger</h3>
              <p className="text-xs text-slate-400">Audit trail of material movements</p>
            </div>
            <Link href="/stock-movements" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              View All Ledger
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-2">Material Item</th>
                  <th className="pb-3 px-2">Movement Type</th>
                  <th className="pb-3 px-2 text-right">Quantity</th>
                  <th className="pb-3 px-2">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stockMovements.slice(0, 5).map((m) => {
                  const item = items.find((i) => i.id === m.item_id);
                  const isPositive = m.movement_type === 'purchase_in' || m.movement_type === 'returned';
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-2 font-medium text-slate-200">{item?.name || 'Item'}</td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                            m.movement_type === 'purchase_in'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : m.movement_type === 'usage_out'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : m.movement_type === 'damaged'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {m.movement_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`py-2.5 px-2 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? '+' : '-'}{m.quantity} {item?.unit || 'pcs'}
                      </td>
                      <td className="py-2.5 px-2 text-slate-400 truncate max-w-xs">{m.note || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
