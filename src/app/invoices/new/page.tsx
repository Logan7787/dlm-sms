'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Plus, Save, Trash2, Package } from 'lucide-react';
import { useStudio } from '@/context/studio-context';

interface LineItemRow {
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { customers, items, createInvoice, settings } = useStudio();

  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [issuedAt, setIssuedAt] = useState(new Date().toISOString().split('T')[0]);
  const [dueAt, setDueAt] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [taxPercent, setTaxPercent] = useState<number>(settings.default_tax_percent);
  const [discount, setDiscount] = useState<number>(0);

  const [lineItems, setLineItems] = useState<LineItemRow[]>([
    {
      itemId: items[0]?.id || '',
      description: items[0]?.name || 'Studio Material / Equipment Rental',
      quantity: 1,
      unitPrice: items[0]?.selling_price || 100,
    },
  ]);

  const handleItemSelect = (index: number, selectedItemId: string) => {
    const targetItem = items.find((i) => i.id === selectedItemId);
    const updated = [...lineItems];
    if (targetItem) {
      updated[index] = {
        itemId: selectedItemId,
        description: targetItem.name,
        quantity: 1,
        unitPrice: targetItem.selling_price,
      };
    } else {
      updated[index] = {
        itemId: '',
        description: 'Custom Service / Rental',
        quantity: 1,
        unitPrice: 0,
      };
    }
    setLineItems(updated);
  };

  const updateLineRow = (index: number, field: keyof LineItemRow, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const addRow = () => {
    setLineItems((prev) => [
      ...prev,
      { itemId: '', description: 'Custom Service or Equipment Rental', quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeRow = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Compute live subtotal & grand total
  const subtotal = lineItems.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0);
  const taxAmount = (Math.max(0, subtotal - discount) * taxPercent) / 100;
  const grandTotal = Math.max(0, subtotal - discount) + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) return;

    const created = createInvoice(
      {
        invoice_number: invoiceNumber,
        customer_id: customerId || null,
        issued_at: issuedAt,
        due_at: dueAt || null,
        tax_percent: taxPercent,
        discount: discount,
      },
      lineItems.map((row) => ({
        item_id: row.itemId || undefined,
        description: row.description,
        quantity: Number(row.quantity),
        unit_price: Number(row.unitPrice),
      }))
    );

    router.push(`/invoices/${created.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              <span>Build New Invoice</span>
            </h1>
            <p className="text-xs text-slate-400">Select material items from live stock or add rental line items.</p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
        {/* Invoice Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Invoice # *
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Studio Client *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Issued Date
            </label>
            <input
              type="date"
              value={issuedAt}
              onChange={(e) => setIssuedAt(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* Dynamic Line Item Builder */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Line Items & Material Usage
            </h3>
            <button
              type="button"
              onClick={addRow}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((row, idx) => {
              const selectedItem = items.find((i) => i.id === row.itemId);
              const currentStock = selectedItem ? selectedItem.stock_on_hand : 0;
              const rowTotal = row.quantity * row.unitPrice;

              return (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Item Select */}
                  <div className="md:col-span-4">
                    <label className="block text-[11px] text-slate-400 mb-1">Stock Material Item</label>
                    <select
                      value={row.itemId}
                      onChange={(e) => handleItemSelect(idx, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="">-- Custom Service / Non-Inventory --</option>
                      {items.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} (Stock: {i.stock_on_hand} {i.unit})
                        </option>
                      ))}
                    </select>
                    {selectedItem && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>Live Stock: <strong className="text-emerald-400">{currentStock} {selectedItem.unit}</strong></span>
                        {row.quantity > currentStock && (
                          <span className="text-amber-400 font-bold">(Exceeds current stock!)</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-4">
                    <label className="block text-[11px] text-slate-400 mb-1">Line Item Description</label>
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => updateLineRow(idx, 'description', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      required
                    />
                  </div>

                  {/* Quantity */}
                  <div className="md:col-span-1">
                    <label className="block text-[11px] text-slate-400 mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => updateLineRow(idx, 'quantity', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono"
                      required
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Rate ({settings.currency_symbol})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={row.unitPrice}
                      onChange={(e) => updateLineRow(idx, 'unitPrice', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white text-right font-mono"
                      required
                    />
                  </div>

                  {/* Row Delete */}
                  <div className="md:col-span-1 flex justify-end pt-4 md:pt-0">
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      disabled={lineItems.length <= 1}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calculation Summary Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3 w-full md:w-72">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Tax Rate (%):</span>
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-right font-mono text-white"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Discount ({settings.currency_symbol}):</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-right font-mono text-white"
              />
            </div>
          </div>

          <div className="w-full md:w-80 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-200">{settings.currency_symbol}{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Discount:</span>
                <span className="font-mono text-emerald-400">-{settings.currency_symbol}{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Tax ({taxPercent}%):</span>
              <span className="font-mono text-slate-200">{settings.currency_symbol}{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Grand Total:</span>
              <span className="font-mono text-indigo-400">{settings.currency_symbol}{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
          <Link
            href="/invoices"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Save className="h-4 w-4" />
            <span>Save Draft Invoice</span>
          </button>
        </div>
      </form>
    </div>
  );
}
