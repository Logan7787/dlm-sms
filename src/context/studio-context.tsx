'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ActivityLog,
  Category,
  Customer,
  Invoice,
  InvoiceItem,
  Item,
  ItemWithStock,
  Payment,
  Profile,
  StockMovement,
  StudioSettings,
  Supplier,
  UserRole,
} from '@/types/database';
import {
  calculateStockOnHand,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICE_ITEMS,
  INITIAL_INVOICES,
  INITIAL_ITEMS,
  INITIAL_PAYMENTS,
  INITIAL_PROFILES,
  INITIAL_SETTINGS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SUPPLIERS,
} from '@/lib/store';

interface StudioContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: Profile;
  profiles: Profile[];
  categories: Category[];
  suppliers: Supplier[];
  items: ItemWithStock[];
  stockMovements: StockMovement[];
  customers: Customer[];
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];
  payments: Payment[];
  settings: StudioSettings;
  activityLogs: ActivityLog[];
  
  // Actions
  addItem: (itemData: Omit<Item, 'id' | 'created_at'>, initialQuantity?: number) => void;
  updateItem: (id: string, itemData: Partial<Item>) => void;
  addStockMovement: (movementData: { item_id: string; movement_type: StockMovement['movement_type']; quantity: number; note?: string; reference_invoice_id?: string }) => void;
  addCategory: (name: string, description?: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at'>) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => void;
  createInvoice: (
    invoiceData: { invoice_number: string; customer_id?: string | null; issued_at?: string; due_at?: string | null; tax_percent?: number; discount?: number; pdf_url?: string | null; created_by?: string | null },
    items: Array<{ item_id?: string; description: string; quantity: number; unit_price: number }>
  ) => Invoice;
  finalizeInvoice: (invoiceId: string) => { success: boolean; error?: string };
  recordPayment: (invoiceId: string, amount: number, method: string) => void;
  updateSettings: (newSettings: Partial<StudioSettings>) => void;
  updateUserProfileRole: (userId: string, newRole: UserRole) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [rawItems, setRawItems] = useState<Item[]>(INITIAL_ITEMS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(INITIAL_INVOICE_ITEMS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [settings, setSettings] = useState<StudioSettings>(INITIAL_SETTINGS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  const currentUser = profiles.find((p) => p.role === userRole) || profiles[0];

  // Helper to log user action
  const logAction = (action: string, entityTable: string, entityId: string, details: any) => {
    const newLog: ActivityLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      actor_id: currentUser.id,
      action,
      entity_table: entityTable,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Compute items with real-time stock on hand
  const items: ItemWithStock[] = rawItems.map((item) => {
    const stockOnHand = calculateStockOnHand(item.id, stockMovements);
    const category = categories.find((c) => c.id === item.category_id);
    const supplier = suppliers.find((s) => s.id === item.supplier_id);
    return {
      ...item,
      category_name: category ? category.name : 'Uncategorized',
      supplier_name: supplier ? supplier.name : 'Unknown',
      stock_on_hand: stockOnHand,
      is_low_stock: stockOnHand <= item.reorder_level,
    };
  });

  const addItem: StudioContextType['addItem'] = (itemData, initialQuantity = 0) => {
    const id = 'i-' + Math.random().toString(36).substr(2, 9);
    const newItem: Item = {
      ...itemData,
      id,
      created_at: new Date().toISOString(),
    };
    setRawItems((prev) => [newItem, ...prev]);

    if (initialQuantity > 0) {
      const initialMovement: StockMovement = {
        id: 'm-' + Math.random().toString(36).substr(2, 9),
        item_id: id,
        movement_type: 'purchase_in',
        quantity: initialQuantity,
        reference_invoice_id: null,
        note: 'Initial stock on item creation',
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
      };
      setStockMovements((prev) => [initialMovement, ...prev]);
    }

    logAction('INSERT', 'items', id, { name: newItem.name, sku: newItem.sku });
  };

  const updateItem: StudioContextType['updateItem'] = (id, itemData) => {
    setRawItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...itemData } : item)));
    logAction('UPDATE', 'items', id, itemData);
  };

  const addStockMovement: StudioContextType['addStockMovement'] = (movementData) => {
    const newMovement: StockMovement = {
      id: 'm-' + Math.random().toString(36).substr(2, 9),
      item_id: movementData.item_id,
      movement_type: movementData.movement_type,
      quantity: movementData.quantity,
      reference_invoice_id: movementData.reference_invoice_id || null,
      note: movementData.note || '',
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
    };
    setStockMovements((prev) => [newMovement, ...prev]);
    logAction('INSERT', 'stock_movements', newMovement.id, movementData);
  };

  const addCategory: StudioContextType['addCategory'] = (name, description) => {
    const newCat: Category = {
      id: 'c-' + Math.random().toString(36).substr(2, 9),
      name,
      description: description || null,
      created_at: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCat]);
    logAction('INSERT', 'categories', newCat.id, { name });
  };

  const addSupplier: StudioContextType['addSupplier'] = (supplierData) => {
    const newSup: Supplier = {
      ...supplierData,
      id: 's-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setSuppliers((prev) => [...prev, newSup]);
    logAction('INSERT', 'suppliers', newSup.id, { name: newSup.name });
  };

  const addCustomer: StudioContextType['addCustomer'] = (customerData) => {
    const newCust: Customer = {
      ...customerData,
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    setCustomers((prev) => [...prev, newCust]);
    logAction('INSERT', 'customers', newCust.id, { name: newCust.name });
  };

  const createInvoice: StudioContextType['createInvoice'] = (invoiceData, lineItemsData) => {
    const invoiceId = 'v-' + Math.random().toString(36).substr(2, 9);
    
    let subtotal = 0;
    const createdItems: InvoiceItem[] = lineItemsData.map((item) => {
      const lineTotal = item.quantity * item.unit_price;
      subtotal += lineTotal;
      return {
        id: 'ii-' + Math.random().toString(36).substr(2, 9),
        invoice_id: invoiceId,
        item_id: item.item_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: lineTotal,
      };
    });

    const taxPercent = invoiceData.tax_percent ?? settings.default_tax_percent;
    const discount = invoiceData.discount ?? 0;
    const total = Math.max(0, (subtotal - discount) * (1 + taxPercent / 100));

    const newInvoice: Invoice = {
      id: invoiceId,
      invoice_number: invoiceData.invoice_number,
      customer_id: invoiceData.customer_id || null,
      status: 'draft',
      subtotal,
      tax_percent: taxPercent,
      discount,
      total,
      amount_paid: 0,
      pdf_url: invoiceData.pdf_url || null,
      issued_at: invoiceData.issued_at || new Date().toISOString().split('T')[0],
      due_at: invoiceData.due_at || null,
      created_by: invoiceData.created_by || currentUser.id,
      created_at: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setInvoiceItems((prev) => [...prev, ...createdItems]);

    logAction('INSERT', 'invoices', invoiceId, { invoice_number: newInvoice.invoice_number, total });
    return newInvoice;
  };

  const finalizeInvoice: StudioContextType['finalizeInvoice'] = (invoiceId) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) return { success: false, error: 'Invoice not found' };

    const linkedItems = invoiceItems.filter((ii) => ii.invoice_id === invoiceId && ii.item_id);

    // 1. Check stock availability
    for (const line of linkedItems) {
      if (!line.item_id) continue;
      const targetItem = items.find((i) => i.id === line.item_id);
      const currentStock = targetItem ? targetItem.stock_on_hand : 0;
      if (currentStock < line.quantity) {
        return {
          success: false,
          error: `Stock calculation failed: Insufficient stock for material "${targetItem?.name || 'Unknown'}". Available: ${currentStock}, Required: ${line.quantity}`,
        };
      }
    }

    // 2. Deduct inventory via usage_out stock movements
    const newMovements: StockMovement[] = linkedItems.map((line) => ({
      id: 'm-' + Math.random().toString(36).substr(2, 9),
      item_id: line.item_id!,
      movement_type: 'usage_out',
      quantity: line.quantity,
      reference_invoice_id: invoiceId,
      note: `Stock deducted on finalization of invoice #${invoice.invoice_number}`,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
    }));

    setStockMovements((prev) => [...newMovements, ...prev]);

    // 3. Update invoice status
    const newStatus = invoice.amount_paid >= invoice.total && invoice.total > 0 ? 'paid' : 'sent';
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: newStatus } : inv))
    );

    logAction('FINALIZE', 'invoices', invoiceId, { invoice_number: invoice.invoice_number });
    return { success: true };
  };

  const recordPayment: StudioContextType['recordPayment'] = (invoiceId, amount, method) => {
    const payment: Payment = {
      id: 'pay-' + Math.random().toString(36).substr(2, 9),
      invoice_id: invoiceId,
      amount,
      method,
      paid_at: new Date().toISOString(),
    };

    setPayments((prev) => [payment, ...prev]);

    // Update invoice total paid & status
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const newAmountPaid = inv.amount_paid + amount;
        let newStatus = inv.status;
        if (newAmountPaid >= inv.total && inv.total > 0) {
          newStatus = 'paid';
        } else if (newAmountPaid > 0 && inv.status !== 'draft') {
          newStatus = 'partially_paid';
        }
        return {
          ...inv,
          amount_paid: newAmountPaid,
          status: newStatus,
        };
      })
    );

    logAction('INSERT', 'payments', payment.id, { invoice_id: invoiceId, amount, method });
  };

  const updateSettings: StudioContextType['updateSettings'] = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings, updated_at: new Date().toISOString() }));
    logAction('UPDATE', 'studio_settings', '1', newSettings);
  };

  const updateUserProfileRole = (userId: string, newRole: UserRole) => {
    setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p)));
    logAction('UPDATE', 'profiles', userId, { role: newRole });
  };

  return (
    <StudioContext.Provider
      value={{
        userRole,
        setUserRole,
        currentUser,
        profiles,
        categories,
        suppliers,
        items,
        stockMovements,
        customers,
        invoices,
        invoiceItems,
        payments,
        settings,
        activityLogs,
        addItem,
        updateItem,
        addStockMovement,
        addCategory,
        addSupplier,
        addCustomer,
        createInvoice,
        finalizeInvoice,
        recordPayment,
        updateSettings,
        updateUserProfileRole,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
}
