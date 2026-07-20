import {
  Category,
  Customer,
  Invoice,
  InvoiceItem,
  ItemWithStock,
  Payment,
  Profile,
  StockMovement,
  StudioSettings,
  Supplier,
  UserRole,
  ActivityLog
} from '@/types/database';

// Initial Mock Seed Data
export const INITIAL_PROFILES: Profile[] = [
  { id: 'usr-admin-01', full_name: 'Alex Vance (Studio Owner)', role: 'admin', created_at: new Date().toISOString() },
  { id: 'usr-manager-01', full_name: 'Sarah Jenkins (Inventory Manager)', role: 'manager', created_at: new Date().toISOString() },
  { id: 'usr-staff-01', full_name: 'David Miller (Studio Tech)', role: 'staff', created_at: new Date().toISOString() },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'c0000000-0000-0000-0000-000000000001', name: 'Cameras', description: 'DSLR, Mirrorless, Cinema cameras', created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000002', name: 'Lenses', description: 'Prime, Zoom, Macro, Specialty lenses', created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000003', name: 'Lighting', description: 'Strobes, Continuous LEDs, Softboxes, Modifiers', created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000004', name: 'Backdrops', description: 'Seamless paper, Vinyl, Canvas, Muslin backdrops', created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000005', name: 'Props', description: 'Furniture, Pedestals, Frames, Themed props', created_at: new Date().toISOString() },
  { id: 'c0000000-0000-0000-0000-000000000006', name: 'Consumables', description: 'Gaffer tape, Batteries, Printing paper, Gels', created_at: new Date().toISOString() },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 's0000000-0000-0000-0000-000000000001', name: 'Apex Pro Optics Supplies', contact_phone: '+1 (555) 234-5678', contact_email: 'orders@apexoptics.com', address: '452 Tech Parkway, San Jose, CA', created_at: new Date().toISOString() },
  { id: 's0000000-0000-0000-0000-000000000002', name: 'Lumina Light Corp', contact_phone: '+1 (555) 876-5432', contact_email: 'support@luminalight.com', address: '88 Strobe Alley, Brooklyn, NY', created_at: new Date().toISOString() },
  { id: 's0000000-0000-0000-0000-000000000003', name: 'Savage Seamless & Studio Co.', contact_phone: '+1 (555) 901-2345', contact_email: 'sales@savagestudio.com', address: '12 Artistry Blvd, Chicago, IL', created_at: new Date().toISOString() },
];

export const INITIAL_ITEMS = [
  {
    id: 'i0000000-0000-0000-0000-000000000001',
    sku: 'CAM-SONY-A7IV',
    name: 'Sony Alpha A7 IV Mirrorless Camera Body',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    supplier_id: 's0000000-0000-0000-0000-000000000001',
    unit: 'pcs',
    cost_price: 2100.00,
    selling_price: 2499.00,
    reorder_level: 2,
    photo_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'i0000000-0000-0000-0000-000000000002',
    sku: 'LENS-SIGMA-2470',
    name: 'Sigma 24-70mm f/2.8 DG DN Art Lens (Sony E)',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    supplier_id: 's0000000-0000-0000-0000-000000000001',
    unit: 'pcs',
    cost_price: 900.00,
    selling_price: 1099.00,
    reorder_level: 3,
    photo_url: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'i0000000-0000-0000-0000-000000000003',
    sku: 'LGT-GODOX-AD600',
    name: 'Godox AD600Pro Witstro Outdoor Strobe Light',
    category_id: 'c0000000-0000-0000-0000-000000000003',
    supplier_id: 's0000000-0000-0000-0000-000000000002',
    unit: 'pcs',
    cost_price: 700.00,
    selling_price: 899.00,
    reorder_level: 4,
    photo_url: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'i0000000-0000-0000-0000-000000000004',
    sku: 'BDP-SAVAGE-WHITE',
    name: 'Savage Seamless Paper #01 Super White (107in x 36ft)',
    category_id: 'c0000000-0000-0000-0000-000000000004',
    supplier_id: 's0000000-0000-0000-0000-000000000003',
    unit: 'rolls',
    cost_price: 55.00,
    selling_price: 75.00,
    reorder_level: 5,
    photo_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'i0000000-0000-0000-0000-000000000005',
    sku: 'BDP-SAVAGE-BLACK',
    name: 'Savage Seamless Paper #20 Black (107in x 36ft)',
    category_id: 'c0000000-0000-0000-0000-000000000004',
    supplier_id: 's0000000-0000-0000-0000-000000000003',
    unit: 'rolls',
    cost_price: 55.00,
    selling_price: 75.00,
    reorder_level: 3,
    photo_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'i0000000-0000-0000-0000-000000000006',
    sku: 'CNS-GAFF-BLACK',
    name: 'ProTapes Pro Gaff 2-inch Premium Gaffer Tape (Black)',
    category_id: 'c0000000-0000-0000-0000-000000000006',
    supplier_id: 's0000000-0000-0000-0000-000000000003',
    unit: 'rolls',
    cost_price: 14.00,
    selling_price: 22.00,
    reorder_level: 10,
    photo_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'i0000000-0000-0000-0000-000000000007',
    sku: 'CNS-BAT-NPF970',
    name: 'Sony NP-F970 Rechargeable Battery Pack',
    category_id: 'c0000000-0000-0000-0000-000000000006',
    supplier_id: 's0000000-0000-0000-0000-000000000001',
    unit: 'pcs',
    cost_price: 45.00,
    selling_price: 65.00,
    reorder_level: 6,
    photo_url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'i0000000-0000-0000-0000-000000000008',
    sku: 'PRP-VINTAGE-CHAIR',
    name: 'Mid-Century Velvet Accent Studio Prop Chair (Emerald)',
    category_id: 'c0000000-0000-0000-0000-000000000005',
    supplier_id: 's0000000-0000-0000-0000-000000000003',
    unit: 'pcs',
    cost_price: 180.00,
    selling_price: 250.00,
    reorder_level: 1,
    photo_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  { id: 'm01', item_id: 'i0000000-0000-0000-0000-000000000001', movement_type: 'purchase_in', quantity: 5.00, reference_invoice_id: null, note: 'Initial camera inventory batch', created_by: 'usr-admin-01', created_at: new Date('2026-07-01T10:00:00Z').toISOString() },
  { id: 'm02', item_id: 'i0000000-0000-0000-0000-000000000002', movement_type: 'purchase_in', quantity: 6.00, reference_invoice_id: null, note: 'Initial optics inventory', created_by: 'usr-admin-01', created_at: new Date('2026-07-01T10:30:00Z').toISOString() },
  { id: 'm03', item_id: 'i0000000-0000-0000-0000-000000000003', movement_type: 'purchase_in', quantity: 8.00, reference_invoice_id: null, note: 'Lighting kit arrival', created_by: 'usr-admin-01', created_at: new Date('2026-07-02T09:00:00Z').toISOString() },
  { id: 'm04', item_id: 'i0000000-0000-0000-0000-000000000004', movement_type: 'purchase_in', quantity: 12.00, reference_invoice_id: null, note: 'Super white paper rolls shipment', created_by: 'usr-manager-01', created_at: new Date('2026-07-03T11:00:00Z').toISOString() },
  { id: 'm05', item_id: 'i0000000-0000-0000-0000-000000000005', movement_type: 'purchase_in', quantity: 2.00, reference_invoice_id: null, note: 'Black paper rolls (Low stock level)', created_by: 'usr-manager-01', created_at: new Date('2026-07-04T14:00:00Z').toISOString() },
  { id: 'm06', item_id: 'i0000000-0000-0000-0000-000000000006', movement_type: 'purchase_in', quantity: 25.00, reference_invoice_id: null, note: 'Bulk gaffer tape pack', created_by: 'usr-manager-01', created_at: new Date('2026-07-05T15:00:00Z').toISOString() },
  { id: 'm07', item_id: 'i0000000-0000-0000-0000-000000000007', movement_type: 'purchase_in', quantity: 4.00, reference_invoice_id: null, note: 'Sony battery pack purchase', created_by: 'usr-staff-01', created_at: new Date('2026-07-06T09:30:00Z').toISOString() },
  { id: 'm08', item_id: 'i0000000-0000-0000-0000-000000000008', movement_type: 'purchase_in', quantity: 2.00, reference_invoice_id: null, note: 'Prop chair delivery', created_by: 'usr-staff-01', created_at: new Date('2026-07-07T12:00:00Z').toISOString() },
  { id: 'm09', item_id: 'i0000000-0000-0000-0000-000000000006', movement_type: 'usage_out', quantity: 3.00, reference_invoice_id: null, note: 'Production shoot consumption', created_by: 'usr-staff-01', created_at: new Date('2026-07-10T16:00:00Z').toISOString() },
  { id: 'm10', item_id: 'i0000000-0000-0000-0000-000000000004', movement_type: 'damaged', quantity: 1.00, reference_invoice_id: null, note: 'Water spill during transport', created_by: 'usr-manager-01', created_at: new Date('2026-07-12T10:00:00Z').toISOString() },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'u0000000-0000-0000-0000-000000000001', name: 'Vogue Fashion Agency', phone: '+1 (555) 345-6789', email: 'production@vogueagency.com', address: '740 Madison Ave, New York, NY', created_at: new Date().toISOString() },
  { id: 'u0000000-0000-0000-0000-000000000002', name: 'Luxe Commercial Studios', phone: '+1 (555) 987-6543', email: 'contact@luxecommercial.com', address: '120 Hollywood Blvd, Los Angeles, CA', created_at: new Date().toISOString() },
  { id: 'u0000000-0000-0000-0000-000000000003', name: 'Elena Rostova Photography', phone: '+1 (555) 456-7890', email: 'elena@rostovaphoto.com', address: '44 Riverwalk Way, Miami, FL', created_at: new Date().toISOString() },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'v0000000-0000-0000-0000-000000000001',
    invoice_number: 'INV-2026-001',
    customer_id: 'u0000000-0000-0000-0000-000000000001',
    status: 'paid',
    subtotal: 2574.00,
    tax_percent: 18.00,
    discount: 100.00,
    total: 2919.32,
    amount_paid: 2919.32,
    pdf_url: null,
    issued_at: '2026-07-01',
    due_at: '2026-07-15',
    created_by: 'usr-admin-01',
    created_at: new Date('2026-07-01T09:00:00Z').toISOString(),
  },
  {
    id: 'v0000000-0000-0000-0000-000000000002',
    invoice_number: 'INV-2026-002',
    customer_id: 'u0000000-0000-0000-0000-000000000002',
    status: 'partially_paid',
    subtotal: 1799.00,
    tax_percent: 18.00,
    discount: 0.00,
    total: 2122.82,
    amount_paid: 1000.00,
    pdf_url: null,
    issued_at: '2026-07-10',
    due_at: '2026-07-24',
    created_by: 'usr-manager-01',
    created_at: new Date('2026-07-10T11:30:00Z').toISOString(),
  },
  {
    id: 'v0000000-0000-0000-0000-000000000003',
    invoice_number: 'INV-2026-003',
    customer_id: 'u0000000-0000-0000-0000-000000000003',
    status: 'draft',
    subtotal: 450.00,
    tax_percent: 18.00,
    discount: 50.00,
    total: 472.00,
    amount_paid: 0.00,
    pdf_url: null,
    issued_at: '2026-07-18',
    due_at: '2026-08-01',
    created_by: 'usr-staff-01',
    created_at: new Date('2026-07-18T14:00:00Z').toISOString(),
  },
];

export const INITIAL_INVOICE_ITEMS: InvoiceItem[] = [
  { id: 'ii-01', invoice_id: 'v0000000-0000-0000-0000-000000000001', item_id: 'i0000000-0000-0000-0000-000000000001', description: 'Sony Alpha A7 IV Camera Rental (2 Days)', quantity: 1, unit_price: 2499.00, line_total: 2499.00 },
  { id: 'ii-02', invoice_id: 'v0000000-0000-0000-0000-000000000001', item_id: 'i0000000-0000-0000-0000-000000000006', description: 'ProTapes Black Gaffer Tape', quantity: 3, unit_price: 25.00, line_total: 75.00 },
  { id: 'ii-03', invoice_id: 'v0000000-0000-0000-0000-000000000002', item_id: 'i0000000-0000-0000-0000-000000000003', description: 'Godox AD600Pro Strobe Light Rental', quantity: 2, unit_price: 899.50, line_total: 1799.00 },
  { id: 'ii-04', invoice_id: 'v0000000-0000-0000-0000-000000000003', item_id: null, description: 'Full Day Studio Space & Tech Support Service', quantity: 1, unit_price: 450.00, line_total: 450.00 },
];

export const INITIAL_PAYMENTS: Payment[] = [
  { id: 'pay-01', invoice_id: 'v0000000-0000-0000-0000-000000000001', amount: 2919.32, method: 'Credit Card', paid_at: new Date('2026-07-02T14:30:00Z').toISOString() },
  { id: 'pay-02', invoice_id: 'v0000000-0000-0000-0000-000000000002', amount: 1000.00, method: 'Bank Transfer', paid_at: new Date('2026-07-12T10:15:00Z').toISOString() },
];

export const INITIAL_SETTINGS: StudioSettings = {
  id: 1,
  studio_name: process.env.NEXT_PUBLIC_STUDIO_NAME || 'Daylight Media',
  studio_address: '108 Daylight Studio Way, Visual District',
  studio_phone: '+1 (555) 019-2834',
  studio_email: 'billing@daylightmedia.com',
  logo_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200',
  default_tax_percent: 18.00,
  currency_symbol: '₹',
  updated_at: new Date().toISOString(),
};

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'act-01', actor_id: 'usr-admin-01', action: 'INSERT', entity_table: 'items', entity_id: 'i0000000-0000-0000-0000-000000000001', details: { name: 'Sony Alpha A7 IV', sku: 'CAM-SONY-A7IV' }, created_at: new Date('2026-07-01T10:00:00Z').toISOString() },
  { id: 'act-02', actor_id: 'usr-admin-01', action: 'INSERT', entity_table: 'stock_movements', entity_id: 'm01', details: { movement_type: 'purchase_in', quantity: 5 }, created_at: new Date('2026-07-01T10:05:00Z').toISOString() },
  { id: 'act-03', actor_id: 'usr-manager-01', action: 'INSERT', entity_table: 'invoices', entity_id: 'v0000000-0000-0000-0000-000000000002', details: { invoice_number: 'INV-2026-002', total: 2122.82 }, created_at: new Date('2026-07-10T11:30:00Z').toISOString() },
];

// Helper: Calculate stock on hand for item ID from movements
export function calculateStockOnHand(itemId: string, movements: StockMovement[]): number {
  return movements
    .filter((m) => m.item_id === itemId)
    .reduce((sum, m) => {
      if (m.movement_type === 'purchase_in' || m.movement_type === 'returned') {
        return sum + Number(m.quantity);
      } else if (m.movement_type === 'usage_out' || m.movement_type === 'damaged') {
        return sum - Number(m.quantity);
      } else if (m.movement_type === 'adjustment') {
        return sum + Number(m.quantity);
      }
      return sum;
    }, 0);
}
