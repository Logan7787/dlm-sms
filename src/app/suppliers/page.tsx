'use client';

import React, { useState } from 'react';
import { Mail, Phone, Plus, Search, Truck, MapPin, Edit3, Trash2, AlertTriangle, X } from 'lucide-react';
import { useStudio } from '@/context/studio-context';
import { Supplier } from '@/types/database';

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, items } = useStudio();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact_email && s.contact_email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setShowModal(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setName(sup.name);
    setPhone(sup.contact_phone || '');
    setEmail(sup.contact_email || '');
    setAddress(sup.address || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, {
        name: name.trim(),
        contact_phone: phone || null,
        contact_email: email || null,
        address: address || null,
      });
    } else {
      addSupplier({
        name: name.trim(),
        contact_phone: phone || null,
        contact_email: email || null,
        address: address || null,
      });
    }

    setShowModal(false);
    setEditingSupplier(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  const handleConfirmDelete = () => {
    if (deletingSupplier) {
      deleteSupplier(deletingSupplier.id);
      setDeletingSupplier(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Truck className="h-6 w-6 text-indigo-400" />
            <span>Equipment & Material Suppliers</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Vendor contacts, purchase origins & equipment suppliers directory.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplier name or email..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((sup) => {
          const suppliedItemsCount = items.filter((i) => i.supplier_id === sup.id).length;
          return (
            <div key={sup.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{sup.name}</h3>
                  <p className="text-xs text-indigo-400 font-semibold mt-0.5">{suppliedItemsCount} materials supplied</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(sup)}
                    className="p-2 rounded-xl bg-slate-900/90 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 border border-slate-800 transition-all"
                    title="Edit supplier details"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingSupplier(sup)}
                    className="p-2 rounded-xl bg-slate-900/90 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-all"
                    title="Delete supplier"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 ml-1">
                    <Truck className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                {sup.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span>{sup.contact_phone}</span>
                  </div>
                )}
                {sup.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="text-indigo-300">{sup.contact_email}</span>
                  </div>
                )}
                {sup.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="text-slate-400 leading-tight">{sup.address}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-indigo-400" />
                <span>{editingSupplier ? 'Edit Supplier Details' : 'Register Supplier'}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Company / Vendor Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Pro Optics Inc"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sales@vendor.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Office Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Supply Ave, San Jose, CA"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all"
                >
                  {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-sm rounded-2xl border border-slate-800 p-6 space-y-5 shadow-2xl text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Supplier?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete <span className="text-slate-200 font-semibold">{deletingSupplier.name}</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSupplier(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/20 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
