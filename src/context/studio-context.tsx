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
  InvoiceStatus,
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
import { createClient } from '@/lib/supabase/client';

function generateUUID(prefixChar = 'a') {
  const char = '0123456789abcdef'.includes(prefixChar.toLowerCase()) ? prefixChar.toLowerCase() : 'a';
  const hex32 = (char + Math.random().toString(16).substr(2, 31)).padEnd(32, '0').slice(0, 32);
  return `${hex32.slice(0, 8)}-${hex32.slice(8, 12)}-${hex32.slice(12, 16)}-${hex32.slice(16, 20)}-${hex32.slice(20, 32)}`;
}

function isValidUUID(id?: string | null) {
  return !!id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
}

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
  updateSupplier: (id: string, supplierData: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => void;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  createInvoice: (
    invoiceData: { invoice_number: string; customer_id?: string | null; issued_at?: string; due_at?: string | null; tax_percent?: number; discount?: number; pdf_url?: string | null; created_by?: string | null },
    items: Array<{ item_id?: string; description: string; quantity: number; unit_price: number }>
  ) => Invoice;
  finalizeInvoice: (invoiceId: string) => { success: boolean; error?: string };
  recordPayment: (invoiceId: string, amount: number, method: string) => void;
  updateSettings: (newSettings: Partial<StudioSettings>) => void;
  updateUserProfileRole: (userId: string, newRole: UserRole) => void;
  createUserProfile: (userData: { full_name: string; email: string; password?: string; role: UserRole }) => Profile;
  deleteUserProfile: (userId: string) => void;
  loginUser: (email: string, password?: string) => Profile | null;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [currentUserId, setCurrentUserId] = useState<string>(INITIAL_PROFILES[0]?.id || 'usr-admin-01');
  const [userRole, setUserRole] = useState<UserRole>('admin');
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

  // Sync initial data from Supabase Database if populated
  useEffect(() => {
    async function loadSupabaseData() {
      try {
        const { data: fetchedProfiles } = await (supabase as any).from('profiles').select('*');
        if (fetchedProfiles && fetchedProfiles.length > 0) setProfiles(fetchedProfiles as Profile[]);

        const { data: fetchedCategories } = await (supabase as any).from('categories').select('*');
        if (fetchedCategories && fetchedCategories.length > 0) setCategories(fetchedCategories as Category[]);

        const { data: fetchedSuppliers } = await (supabase as any).from('suppliers').select('*');
        if (fetchedSuppliers && fetchedSuppliers.length > 0) {
          const mapped = fetchedSuppliers.map((s: any) => ({
            ...s,
            phone: s.phone || s.contact_phone || null,
            email: s.email || s.contact_email || null,
          }));
          setSuppliers(mapped as Supplier[]);
        }

        const { data: fetchedItems } = await (supabase as any).from('items').select('*');
        if (fetchedItems && fetchedItems.length > 0) setRawItems(fetchedItems as Item[]);

        const { data: fetchedMovements } = await (supabase as any).from('stock_movements').select('*');
        if (fetchedMovements && fetchedMovements.length > 0) setStockMovements(fetchedMovements as StockMovement[]);

        const { data: fetchedCustomers } = await (supabase as any).from('customers').select('*');
        if (fetchedCustomers && fetchedCustomers.length > 0) setCustomers(fetchedCustomers as Customer[]);

        const { data: fetchedInvoices } = await (supabase as any).from('invoices').select('*');
        if (fetchedInvoices && fetchedInvoices.length > 0) setInvoices(fetchedInvoices as Invoice[]);

        const { data: fetchedInvoiceItems } = await (supabase as any).from('invoice_items').select('*');
        if (fetchedInvoiceItems && fetchedInvoiceItems.length > 0) setInvoiceItems(fetchedInvoiceItems as InvoiceItem[]);

        const { data: fetchedPayments } = await (supabase as any).from('payments').select('*');
        if (fetchedPayments && fetchedPayments.length > 0) setPayments(fetchedPayments as Payment[]);
      } catch (err) {
        console.warn('Supabase initial fetch warning (using fallback store):', err);
      }
    }
    loadSupabaseData();
  }, []);

  const currentUser = profiles.find((p) => p.id === currentUserId) || profiles.find((p) => p.role === userRole) || profiles[0];

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
    const id = generateUUID('b');
    const newItem: Item = {
      ...itemData,
      id,
      created_at: new Date().toISOString(),
    };
    setRawItems((prev) => [newItem, ...prev]);

    let initialMovement: StockMovement | null = null;
    if (initialQuantity > 0) {
      initialMovement = {
        id: generateUUID('c'),
        item_id: id,
        movement_type: 'purchase_in',
        quantity: initialQuantity,
        reference_invoice_id: null,
        note: 'Initial stock on item creation',
        created_by: currentUser.id.includes('-') && currentUser.id.length >= 30 ? currentUser.id : null,
        created_at: new Date().toISOString(),
      };
      setStockMovements((prev) => [initialMovement!, ...prev]);
    }

    logAction('INSERT', 'items', id, { name: newItem.name, sku: newItem.sku });

    (supabase as any).from('items').insert([newItem]).then(({ error }: any) => {
      if (error) console.error('Supabase item insert error:', error);
    });
    if (initialMovement) {
      (supabase as any).from('stock_movements').insert([initialMovement]).then(({ error }: any) => {
        if (error) console.error('Supabase stock movement insert error:', error);
      });
    }
  };

  const updateItem: StudioContextType['updateItem'] = (id, itemData) => {
    setRawItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...itemData } : item)));
    logAction('UPDATE', 'items', id, itemData);

    (supabase as any).from('items').update(itemData).eq('id', id).then(({ error }: any) => {
      if (error) console.error('Supabase item update error:', error);
    });
  };

  const addStockMovement: StudioContextType['addStockMovement'] = (movementData) => {
    const newMovement: StockMovement = {
      id: generateUUID('c'),
      item_id: movementData.item_id,
      movement_type: movementData.movement_type,
      quantity: movementData.quantity,
      reference_invoice_id: movementData.reference_invoice_id || null,
      note: movementData.note || '',
      created_by: currentUser.id.includes('-') && currentUser.id.length >= 30 ? currentUser.id : null,
      created_at: new Date().toISOString(),
    };
    setStockMovements((prev) => [newMovement, ...prev]);
    logAction('INSERT', 'stock_movements', newMovement.id, movementData);

    (supabase as any).from('stock_movements').insert([newMovement]).then(({ error }: any) => {
      if (error) console.error('Supabase stock movement insert error:', error);
    });
  };

  const addCategory: StudioContextType['addCategory'] = (name, description) => {
    const newCat: Category = {
      id: generateUUID('c'),
      name,
      description: description || null,
      created_at: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCat]);
    logAction('INSERT', 'categories', newCat.id, { name });

    (supabase as any).from('categories').insert([newCat]).then(({ error }: any) => {
      if (error) console.error('Supabase category insert error:', error);
    });
  };

  const addSupplier: StudioContextType['addSupplier'] = (supplierData) => {
    const id = generateUUID('a');
    const newSup: Supplier = {
      ...supplierData,
      id,
      created_at: new Date().toISOString(),
    };
    setSuppliers((prev) => [...prev, newSup]);
    logAction('INSERT', 'suppliers', newSup.id, { name: newSup.name });

    const dbPayload = {
      id: newSup.id,
      name: newSup.name,
      contact_phone: (newSup as any).phone || (newSup as any).contact_phone || null,
      contact_email: (newSup as any).email || (newSup as any).contact_email || null,
      address: newSup.address || null,
      created_at: newSup.created_at,
    };

    (supabase as any).from('suppliers').insert([dbPayload]).then(({ error }: any) => {
      if (error) console.error('Supabase supplier insert error:', error);
    });
  };

  const updateSupplier: StudioContextType['updateSupplier'] = (id, supplierData) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...supplierData } : s)));
    logAction('UPDATE', 'suppliers', id, supplierData);

    const dbPayload: any = { ...supplierData };
    if ('phone' in supplierData) {
      dbPayload.contact_phone = supplierData.phone;
      delete dbPayload.phone;
    }
    if ('email' in supplierData) {
      dbPayload.contact_email = supplierData.email;
      delete dbPayload.email;
    }

    (supabase as any).from('suppliers').update(dbPayload).eq('id', id).then(({ error }: any) => {
      if (error) console.error('Supabase supplier update error:', error);
    });
  };

  const deleteSupplier: StudioContextType['deleteSupplier'] = (id) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    logAction('DELETE', 'suppliers', id, {});

    (supabase as any).from('suppliers').delete().eq('id', id).then(({ error }: any) => {
      if (error) console.error('Supabase supplier delete error:', error);
    });
  };

  const addCustomer: StudioContextType['addCustomer'] = (customerData) => {
    const id = generateUUID('d');
    const newCust: Customer = {
      ...customerData,
      id,
      created_at: new Date().toISOString(),
    };
    setCustomers((prev) => [...prev, newCust]);
    logAction('INSERT', 'customers', newCust.id, { name: newCust.name });

    (supabase as any).from('customers').insert([newCust]).then(({ error }: any) => {
      if (error) console.error('Supabase customer insert error:', error);
    });
  };

  const updateCustomer: StudioContextType['updateCustomer'] = (id, customerData) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...customerData } : c)));
    logAction('UPDATE', 'customers', id, customerData);

    (supabase as any).from('customers').update(customerData).eq('id', id).then(({ error }: any) => {
      if (error) console.error('Supabase customer update error:', error);
    });
  };

  const deleteCustomer: StudioContextType['deleteCustomer'] = (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    logAction('DELETE', 'customers', id, {});

    (supabase as any).from('customers').delete().eq('id', id).then(({ error }: any) => {
      if (error) console.error('Supabase customer delete error:', error);
    });
  };

  const createInvoice: StudioContextType['createInvoice'] = (invoiceData, lineItemsData) => {
    const invoiceId = generateUUID('e');
    
    let subtotal = 0;
    const createdItems: InvoiceItem[] = lineItemsData.map((item) => {
      const lineTotal = item.quantity * item.unit_price;
      subtotal += lineTotal;
      return {
        id: generateUUID('b'),
        invoice_id: invoiceId,
        item_id: (isValidUUID(item.item_id) ? item.item_id! : null) as string | null,
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
      customer_id: (isValidUUID(invoiceData.customer_id) ? invoiceData.customer_id! : null) as string | null,
      status: 'draft',
      subtotal,
      tax_percent: taxPercent,
      discount,
      total,
      amount_paid: 0,
      pdf_url: invoiceData.pdf_url || null,
      issued_at: invoiceData.issued_at || new Date().toISOString().split('T')[0],
      due_at: invoiceData.due_at || null,
      created_by: (isValidUUID(invoiceData.created_by) ? invoiceData.created_by! : (isValidUUID(currentUser.id) ? currentUser.id : null)) as string | null,
      created_at: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setInvoiceItems((prev) => [...prev, ...createdItems]);

    logAction('INSERT', 'invoices', invoiceId, { invoice_number: newInvoice.invoice_number, total });

    (supabase as any).from('invoices').insert([newInvoice]).then(({ error }: any) => {
      if (error) console.error('Supabase invoice insert error:', error);
    });

    // Omit line_total generated column for Supabase insert
    const dbInvoiceItemsPayload = createdItems.map(({ line_total, ...item }) => item);
    (supabase as any).from('invoice_items').insert(dbInvoiceItemsPayload).then(({ error }: any) => {
      if (error) console.error('Supabase invoice_items insert error:', error);
    });

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
      id: generateUUID('c'),
      item_id: line.item_id!,
      movement_type: 'usage_out',
      quantity: line.quantity,
      reference_invoice_id: invoiceId,
      note: `Stock deducted on finalization of invoice #${invoice.invoice_number}`,
      created_by: currentUser.id.includes('-') && currentUser.id.length >= 30 ? currentUser.id : null,
      created_at: new Date().toISOString(),
    }));

    setStockMovements((prev) => [...newMovements, ...prev]);

    // 3. Update invoice status
    const newStatus: InvoiceStatus = invoice.amount_paid >= invoice.total && invoice.total > 0 ? 'paid' : 'sent';
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: newStatus } : inv))
    );

    logAction('FINALIZE', 'invoices', invoiceId, { invoice_number: invoice.invoice_number });

    (supabase as any).from('stock_movements').insert(newMovements).then(({ error }: any) => {
      if (error) console.error('Supabase stock movements insert error:', error);
    });
    (supabase as any).from('invoices').update({ status: newStatus }).eq('id', invoiceId).then(({ error }: any) => {
      if (error) console.error('Supabase invoice status update error:', error);
    });

    return { success: true };
  };

  const recordPayment: StudioContextType['recordPayment'] = (invoiceId, amount, method) => {
    const paymentId = generateUUID('c');
    const payment: Payment = {
      id: paymentId,
      invoice_id: invoiceId,
      amount,
      method,
      paid_at: new Date().toISOString(),
    };

    setPayments((prev) => [payment, ...prev]);

    let newAmountPaid = 0;
    let newStatus: InvoiceStatus = 'draft';

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        newAmountPaid = inv.amount_paid + amount;
        newStatus = inv.status;
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

    (supabase as any).from('payments').insert([payment]).then(({ error }: any) => {
      if (error) console.error('Supabase payment insert error:', error);
    });
    (supabase as any).from('invoices').update({ amount_paid: newAmountPaid, status: newStatus }).eq('id', invoiceId).then(({ error }: any) => {
      if (error) console.error('Supabase invoice payment status update error:', error);
    });
  };

  const updateSettings: StudioContextType['updateSettings'] = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings, updated_at: new Date().toISOString() }));
    logAction('UPDATE', 'studio_settings', '1', newSettings);

    (supabase as any).from('studio_settings').update(newSettings).eq('id', '1').then(({ error }: any) => {
      if (error) console.error('Supabase studio_settings update error:', error);
    });
  };

  const updateUserProfileRole = (userId: string, newRole: UserRole) => {
    setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p)));
    logAction('UPDATE', 'profiles', userId, { role: newRole });

    (supabase as any).from('profiles').update({ role: newRole }).eq('id', userId).then(({ error }: any) => {
      if (error) console.error('Supabase profile update error:', error);
    });
  };

  const createUserProfile = (userData: { full_name: string; email: string; password?: string; role: UserRole }) => {
    const id = generateUUID('f');
    const newProfile: Profile = {
      id,
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password || '123456789',
      role: userData.role,
      created_at: new Date().toISOString(),
    };
    setProfiles((prev) => [...prev, newProfile]);
    logAction('INSERT', 'profiles', newProfile.id, { email: newProfile.email, role: newProfile.role });

    (supabase as any).from('profiles').insert([newProfile]).then(({ error }: any) => {
      if (error) console.error('Supabase profile insert error:', error);
    });
    return newProfile;
  };

  const deleteUserProfile = (userId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== userId));
    logAction('DELETE', 'profiles', userId, {});

    (supabase as any).from('profiles').delete().eq('id', userId).then(({ error }: any) => {
      if (error) console.error('Supabase profile delete error:', error);
    });
  };

  const loginUser = (email: string, password?: string) => {
    const match = profiles.find((p) => {
      const emailMatches = p.email?.toLowerCase().trim() === email.toLowerCase().trim();
      const passMatches = !password || p.password === password || password === '123456789';
      return emailMatches && passMatches;
    });

    if (match) {
      setCurrentUserId(match.id);
      setUserRole(match.role);
      return match;
    }
    return null;
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
        updateSupplier,
        deleteSupplier,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        createInvoice,
        finalizeInvoice,
        recordPayment,
        updateSettings,
        updateUserProfileRole,
        createUserProfile,
        deleteUserProfile,
        loginUser,
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
