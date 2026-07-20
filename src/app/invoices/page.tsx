'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Plus,
  Receipt,
  Search,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useStudio } from '@/context/studio-context';
import { InvoiceStatus } from '@/types/database';

export default function InvoicesPage() {
  const { invoices, customers, settings } = useStudio();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredInvoices = invoices.filter((inv) => {
    const customer = customers.find((c) => c.id === inv.customer_id);
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (customer && customer.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            Paid
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="h-3 w-3 text-amber-400" />
            Partially Paid
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <FileText className="h-3 w-3 text-blue-400" />
            Sent
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-700 text-slate-300 border border-slate-600">
            Draft
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertCircle className="h-3 w-3 text-rose-400" />
            Overdue
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-800 text-slate-500 border border-slate-700">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-400" />
            <span>Invoices & Rental Billing</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create client invoices, track partial payments & auto-deduct materials from stock.
          </p>
        </div>

        <Link
          href="/invoices/new"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Invoice</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice # or client name..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Invoice Statuses</option>
            <option value="draft" className="bg-slate-900">Draft</option>
            <option value="sent" className="bg-slate-900">Sent</option>
            <option value="paid" className="bg-slate-900">Paid</option>
            <option value="partially_paid" className="bg-slate-900">Partially Paid</option>
            <option value="overdue" className="bg-slate-900">Overdue</option>
            <option value="cancelled" className="bg-slate-900">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Studio Client</th>
                <th className="py-3.5 px-4">Issued Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-right">Amount Paid</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-sm">No invoices match your filter</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const customer = customers.find((c) => c.id === inv.customer_id);
                  const balanceDue = inv.total - inv.amount_paid;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3 px-4 font-mono font-bold text-slate-100">
                        <Link href={`/invoices/${inv.id}`} className="hover:text-indigo-400 transition-colors">
                          {inv.invoice_number}
                        </Link>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {customer?.name || 'Walk-in Client'}
                      </td>

                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {inv.issued_at}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(inv.status)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-extrabold text-white">
                        {settings.currency_symbol}{inv.total.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {settings.currency_symbol}{inv.amount_paid.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Invoice</span>
                        </Link>
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
