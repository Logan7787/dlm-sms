'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  Mail,
  Printer,
  Receipt,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useStudio } from '@/context/studio-context';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const {
    invoices,
    invoiceItems,
    customers,
    items,
    payments,
    settings,
    finalizeInvoice,
    recordPayment,
  } = useStudio();

  const invoice = invoices.find((i) => i.id === invoiceId);
  const customer = customers.find((c) => c.id === invoice?.customer_id);
  const lines = invoiceItems.filter((ii) => ii.invoice_id === invoiceId);
  const invoicePayments = payments.filter((p) => p.invoice_id === invoiceId);

  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [finalizeSuccess, setFinalizeSuccess] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  const [paymentAmount, setPaymentAmount] = useState<number>(
    invoice ? Math.max(0, invoice.total - invoice.amount_paid) : 0
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card');

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Invoice Not Found</h2>
        <p className="text-xs text-slate-400 mt-1 mb-4">Invoice ID does not exist.</p>
        <Link href="/invoices" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs">
          Back to Invoices
        </Link>
      </div>
    );
  }

  const balanceDue = Math.max(0, invoice.total - invoice.amount_paid);

  // Finalize Invoice trigger execution
  const handleFinalize = () => {
    setFinalizeError(null);
    setFinalizeSuccess(false);

    const result = finalizeInvoice(invoice.id);
    if (!result.success) {
      setFinalizeError(result.error || 'Invoice finalization failed.');
    } else {
      setFinalizeSuccess(true);
    }
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    recordPayment(invoice.id, Number(paymentAmount), paymentMethod);
    setShowPaymentModal(false);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>Invoice {invoice.invoice_number}</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">Status: {invoice.status.toUpperCase()}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Finalize Button for Draft */}
          {invoice.status === 'draft' && (
            <button
              onClick={handleFinalize}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Finalize & Deduct Stock</span>
            </button>
          )}

          {/* Record Payment Button */}
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <button
              onClick={() => {
                setPaymentAmount(balanceDue);
                setShowPaymentModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Record Payment</span>
            </button>
          )}

          {/* Print / Download PDF */}
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Error Alert Box for Insufficient Stock on Finalization */}
      {finalizeError && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-200">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <span>Invoice Finalization Blocked (DB RPC Stock Guard)</span>
          </div>
          <p className="text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-rose-500/20 text-rose-300">
            {finalizeError}
          </p>
          <p className="text-[11px] text-rose-400/80">
            Please add stock via a purchase-in movement or edit line item quantity before finalizing this invoice.
          </p>
        </div>
      )}

      {finalizeSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <p className="text-xs font-semibold">
            Invoice finalized successfully! Linked inventory materials have been automatically deducted from stock.
          </p>
        </div>
      )}

      {/* Modern Printable Invoice Letterhead Document */}
      <div className="glass-card rounded-2xl border border-slate-800 p-8 md:p-10 space-y-8 bg-slate-900/90 shadow-2xl print:bg-white print:text-slate-900 print:shadow-none print:p-0 print:border-none">
        {/* Studio Branding & Invoice Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b border-slate-800 print:border-slate-300 pb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                A
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-white print:text-slate-900">
                {settings.studio_name}
              </h2>
            </div>
            <p className="text-xs text-slate-400 print:text-slate-600">{settings.studio_address}</p>
            <p className="text-xs text-slate-400 print:text-slate-600">Phone: {settings.studio_phone} | Email: {settings.studio_email}</p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <h1 className="text-2xl font-black uppercase text-indigo-400 tracking-wider">INVOICE</h1>
            <p className="text-sm font-mono font-bold text-white print:text-slate-900">#{invoice.invoice_number}</p>
            <div className="pt-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                invoice.status === 'paid'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : invoice.status === 'partially_paid'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}>
                {invoice.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Client & Date Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Billed To Client:</span>
            <h3 className="text-base font-bold text-white print:text-slate-900">{customer?.name || 'Walk-in Client'}</h3>
            {customer?.email && <p className="text-slate-300 print:text-slate-700">{customer.email}</p>}
            {customer?.phone && <p className="text-slate-400 print:text-slate-600">{customer.phone}</p>}
            {customer?.address && <p className="text-slate-400 print:text-slate-600 mt-1">{customer.address}</p>}
          </div>

          <div className="sm:text-right space-y-1 text-slate-300 print:text-slate-700">
            <p><strong className="text-slate-400">Issued Date:</strong> {invoice.issued_at}</p>
            {invoice.due_at && <p><strong className="text-slate-400">Payment Due:</strong> {invoice.due_at}</p>}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 print:bg-slate-100 border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-700 font-semibold uppercase">
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-slate-200">
              {lines.map((line) => (
                <tr key={line.id}>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-100 print:text-slate-900">{line.description}</p>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-300 print:text-slate-700">{line.quantity}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300 print:text-slate-700">
                    {settings.currency_symbol}{line.unit_price.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100 print:text-slate-900">
                    {settings.currency_symbol}{line.line_total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Totals & Payments */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-800 print:border-slate-300 pt-6">
          <div className="space-y-3 max-w-xs text-xs">
            <h4 className="font-bold text-slate-300 print:text-slate-800 uppercase tracking-wider">Payment History</h4>
            {invoicePayments.length === 0 ? (
              <p className="text-slate-500 italic">No payments recorded yet.</p>
            ) : (
              invoicePayments.map((p) => (
                <div key={p.id} className="p-2 rounded-lg bg-slate-950/60 print:bg-slate-100 border border-slate-800 print:border-slate-300 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-emerald-400 print:text-emerald-700">{settings.currency_symbol}{p.amount.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 block">{p.method || 'Payment'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{new Date(p.paid_at).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-200 print:text-slate-800">{settings.currency_symbol}{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Discount:</span>
                <span className="font-mono text-emerald-400">-{settings.currency_symbol}{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Tax ({invoice.tax_percent}%):</span>
              <span className="font-mono text-slate-200 print:text-slate-800">
                {settings.currency_symbol}{(((invoice.subtotal - invoice.discount) * invoice.tax_percent) / 100).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm font-black text-white print:text-slate-900 pt-2 border-t border-slate-800 print:border-slate-300">
              <span>Grand Total:</span>
              <span className="font-mono text-indigo-400 print:text-indigo-700">{settings.currency_symbol}{invoice.total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-xs text-emerald-400 pt-1">
              <span>Amount Paid:</span>
              <span className="font-mono font-bold">{settings.currency_symbol}{invoice.amount_paid.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-xs font-bold text-amber-300 pt-1 border-t border-slate-800/60">
              <span>Balance Due:</span>
              <span className="font-mono">{settings.currency_symbol}{balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Dialog */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl border border-slate-800 p-6 space-y-5 shadow-2xl">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-400" />
              <span>Record Client Payment</span>
            </h2>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  Payment Amount ({settings.currency_symbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={balanceDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Remaining Balance: {settings.currency_symbol}{balanceDue.toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
                >
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Bank Wire Transfer</option>
                  <option value="UPI / QR">UPI / Digital Payment</option>
                  <option value="Cash">Studio Counter Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
