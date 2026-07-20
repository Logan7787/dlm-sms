'use client';

import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, Calendar, Package, Receipt } from 'lucide-react';
import { useStudio } from '@/context/studio-context';

export default function ReportsPage() {
  const { stockMovements, items, invoices, customers, settings } = useStudio();

  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-31');

  // Helper to trigger CSV download
  const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Stock Ledger CSV
  const handleExportStockLedger = () => {
    const headers = ['Date', 'Item SKU', 'Material Name', 'Movement Type', 'Quantity', 'Unit', 'Note'];
    const rows = stockMovements.map((m) => {
      const item = items.find((i) => i.id === m.item_id);
      return [
        new Date(m.created_at).toISOString(),
        item?.sku || '',
        `"${item?.name || ''}"`,
        m.movement_type,
        m.quantity,
        item?.unit || 'pcs',
        `"${m.note || ''}"`,
      ].join(',');
    });

    const csvStr = [headers.join(','), ...rows].join('\n');
    downloadCSV(`stock-ledger-report-${startDate}-to-${endDate}.csv`, csvStr);
  };

  // Export Sales Report CSV
  const handleExportSalesReport = () => {
    const headers = ['Invoice #', 'Issued Date', 'Customer', 'Status', 'Subtotal', 'Tax %', 'Discount', 'Total', 'Paid'];
    const rows = invoices.map((inv) => {
      const cust = customers.find((c) => c.id === inv.customer_id);
      return [
        inv.invoice_number,
        inv.issued_at,
        `"${cust?.name || 'Walk-in'}"`,
        inv.status,
        inv.subtotal,
        inv.tax_percent,
        inv.discount,
        inv.total,
        inv.amount_paid,
      ].join(',');
    });

    const csvStr = [headers.join(','), ...rows].join('\n');
    downloadCSV(`sales-billing-report-${startDate}-to-${endDate}.csv`, csvStr);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-indigo-400" />
          <span>Studio Business & Stock Reports</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Generate comprehensive stock movement ledgers, inventory valuation & sales export (CSV).
        </p>
      </div>

      {/* Date Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto text-xs">
          <Calendar className="h-4 w-4 text-indigo-400" />
          <span className="text-slate-400 font-semibold">Report Period:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
          />
        </div>
      </div>

      {/* 2 Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Stock Movement Ledger */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Stock Movement Ledger Report</h3>
              <p className="text-xs text-slate-400">Complete transaction history for all materials</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Total Transactions:</span>
              <span className="font-bold font-mono">{stockMovements.length} movements</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Active Items Tracked:</span>
              <span className="font-bold font-mono">{items.length} items</span>
            </div>
          </div>

          <button
            onClick={handleExportStockLedger}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Export Stock Ledger (CSV)</span>
          </button>
        </div>

        {/* Card 2: Sales & Billing */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sales & Rental Billing Report</h3>
              <p className="text-xs text-slate-400">Client billing summary, taxes collected & totals</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Invoices Count:</span>
              <span className="font-bold font-mono">{invoices.length} invoices</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Total Revenue Billed:</span>
              <span className="font-bold font-mono text-emerald-400">
                {settings.currency_symbol}
                {invoices.reduce((s, i) => s + i.total, 0).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handleExportSalesReport}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Export Sales Report (CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
