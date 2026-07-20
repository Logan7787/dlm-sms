-- Seed data for Photo Studio Material Inventory & Invoicing System

-- 1. Categories
insert into public.categories (id, name, description) values
  ('c0000000-0000-0000-0000-000000000001', 'Cameras', 'DSLR, Mirrorless, Cinema cameras'),
  ('c0000000-0000-0000-0000-000000000002', 'Lenses', 'Prime, Zoom, Macro, Specialty lenses'),
  ('c0000000-0000-0000-0000-000000000003', 'Lighting', 'Strobes, Continuous LEDs, Softboxes, Modifiers'),
  ('c0000000-0000-0000-0000-000000000004', 'Backdrops', 'Seamless paper, Vinyl, Canvas, Muslin backdrops'),
  ('c0000000-0000-0000-0000-000000000005', 'Props', 'Furniture, Pedestals, Frames, Themed props'),
  ('c0000000-0000-0000-0000-000000000006', 'Consumables', 'Gaffer tape, Batteries, Printing paper, Gels, Cleaning wipes')
on conflict (id) do nothing;

-- 2. Suppliers
insert into public.suppliers (id, name, contact_phone, contact_email, address) values
  ('s0000000-0000-0000-0000-000000000001', 'Apex Pro Optics Supplies', '+1 (555) 234-5678', 'orders@apexoptics.com', '452 Tech Parkway, San Jose, CA'),
  ('s0000000-0000-0000-0000-000000000002', 'Lumina Light Corp', '+1 (555) 876-5432', 'support@luminalight.com', '88 Strobe Alley, Brooklyn, NY'),
  ('s0000000-0000-0000-0000-000000000003', 'Savage Seamless & Studio Co.', '+1 (555) 901-2345', 'sales@savagestudio.com', '12 Artistry Blvd, Chicago, IL')
on conflict (id) do nothing;

-- 3. Items
insert into public.items (id, sku, name, category_id, supplier_id, unit, cost_price, selling_price, reorder_level, photo_url) values
  ('i0000000-0000-0000-0000-000000000001', 'CAM-SONY-A7IV', 'Sony Alpha A7 IV Mirrorless Camera Body', 'c0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000001', 'pcs', 2100.00, 2499.00, 2, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400'),
  ('i0000000-0000-0000-0000-000000000002', 'LENS-SIGMA-2470', 'Sigma 24-70mm f/2.8 DG DN Art Lens (Sony E)', 'c0000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000001', 'pcs', 900.00, 1099.00, 3, 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400'),
  ('i0000000-0000-0000-0000-000000000003', 'LGT-GODOX-AD600', 'Godox AD600Pro Witstro Outdoor Strobe Light', 'c0000000-0000-0000-0000-000000000003', 's0000000-0000-0000-0000-000000000002', 'pcs', 700.00, 899.00, 4, 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?w=400'),
  ('i0000000-0000-0000-0000-000000000004', 'BDP-SAVAGE-WHITE', 'Savage Seamless Paper #01 Super White (107in x 36ft)', 'c0000000-0000-0000-0000-000000000004', 's0000000-0000-0000-0000-000000000003', 'rolls', 55.00, 75.00, 5, 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400'),
  ('i0000000-0000-0000-0000-000000000005', 'BDP-SAVAGE-BLACK', 'Savage Seamless Paper #20 Black (107in x 36ft)', 'c0000000-0000-0000-0000-000000000004', 's0000000-0000-0000-0000-000000000003', 'rolls', 55.00, 75.00, 3, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400'),
  ('i0000000-0000-0000-0000-000000000006', 'CNS-GAFF-BLACK', 'ProTapes Pro Gaff 2-inch Premium Gaffer Tape (Black)', 'c0000000-0000-0000-0000-000000000006', 's0000000-0000-0000-0000-000000000003', 'rolls', 14.00, 22.00, 10, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400'),
  ('i0000000-0000-0000-0000-000000000007', 'CNS-BAT-NPF970', 'Sony NP-F970 Rechargeable Battery Pack', 'c0000000-0000-0000-0000-000000000006', 's0000000-0000-0000-0000-000000000001', 'pcs', 45.00, 65.00, 6, 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400'),
  ('i0000000-0000-0000-0000-000000000008', 'PRP-VINTAGE-CHAIR', 'Mid-Century Velvet Accent Studio Prop Chair (Emerald)', 'c0000000-0000-0000-0000-000000000005', 's0000000-0000-0000-0000-000000000003', 'pcs', 180.00, 250.00, 1, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400')
on conflict (id) do nothing;

-- 4. Initial Stock Movements
insert into public.stock_movements (item_id, movement_type, quantity, note) values
  ('i0000000-0000-0000-0000-000000000001', 'purchase_in', 5.00, 'Initial studio inventory batch purchase'),
  ('i0000000-0000-0000-0000-000000000002', 'purchase_in', 6.00, 'Initial studio optics inventory'),
  ('i0000000-0000-0000-0000-000000000003', 'purchase_in', 8.00, 'Main lighting kit arrival'),
  ('i0000000-0000-0000-0000-000000000004', 'purchase_in', 12.00, 'Bulk paper roll shipment'),
  ('i0000000-0000-0000-0000-000000000005', 'purchase_in', 2.00, 'Black backdrop paper (Low Stock alert trigger test)'),
  ('i0000000-0000-0000-0000-000000000006', 'purchase_in', 25.00, 'Gaffer tape bulk pack'),
  ('i0000000-0000-0000-0000-000000000007', 'purchase_in', 4.00, 'Batteries batch (Low Stock alert trigger test)'),
  ('i0000000-0000-0000-0000-000000000008', 'purchase_in', 2.00, 'Furniture prop shipment'),
  ('i0000000-0000-0000-0000-000000000006', 'usage_out', 3.00, 'Studio production shoot usage'),
  ('i0000000-0000-0000-0000-000000000004', 'damaged', 1.00, 'Water damage during transport')
on conflict (id) do nothing;

-- 5. Customers
insert into public.customers (id, name, phone, email, address) values
  ('u0000000-0000-0000-0000-000000000001', 'Vogue Fashion Agency', '+1 (555) 345-6789', 'production@vogueagency.com', '740 Madison Ave, New York, NY'),
  ('u0000000-0000-0000-0000-000000000002', 'Luxe Commercial Studios', '+1 (555) 987-6543', 'contact@luxecommercial.com', '120 Hollywood Blvd, Los Angeles, CA'),
  ('u0000000-0000-0000-0000-000000000003', 'Elena Rostova Photography', '+1 (555) 456-7890', 'elena@rostovaphoto.com', '44 Riverwalk Way, Miami, FL')
on conflict (id) do nothing;

-- 6. Sample Invoices
insert into public.invoices (id, invoice_number, customer_id, status, subtotal, tax_percent, discount, total, amount_paid, issued_at, due_at) values
  ('v0000000-0000-0000-0000-000000000001', 'INV-2026-001', 'u0000000-0000-0000-0000-000000000001', 'paid', 2574.00, 18.00, 100.00, 2919.32, 2919.32, '2026-07-01', '2026-07-15'),
  ('v0000000-0000-0000-0000-000000000002', 'INV-2026-002', 'u0000000-0000-0000-0000-000000000002', 'partially_paid', 1899.00, 18.00, 0.00, 2240.82, 1000.00, '2026-07-10', '2026-07-24'),
  ('v0000000-0000-0000-0000-000000000003', 'INV-2026-003', 'u0000000-0000-0000-0000-000000000003', 'draft', 450.00, 18.00, 50.00, 472.00, 0.00, '2026-07-18', '2026-08-01')
on conflict (id) do nothing;

-- 7. Sample Invoice Line Items
insert into public.invoice_items (invoice_id, item_id, description, quantity, unit_price) values
  ('v0000000-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000001', 'Sony Alpha A7 IV Mirrorless Camera Body (2-Day Rental)', 1, 2499.00),
  ('v0000000-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000006', 'ProTapes Gaffer Tape (Black Roll)', 3, 25.00),
  ('v0000000-0000-0000-0000-000000000002', 'i0000000-0000-0000-0000-000000000003', 'Godox AD600Pro Outdoor Strobe Light Rental', 2, 899.50),
  ('v0000000-0000-0000-0000-000000000003', NULL, 'Full Day Studio Space Rental & Assistant Service', 1, 450.00)
on conflict do nothing;

-- 8. Sample Payments
insert into public.payments (invoice_id, amount, method, paid_at) values
  ('v0000000-0000-0000-0000-000000000001', 2919.32, 'Credit Card', '2026-07-02 14:30:00+00'),
  ('v0000000-0000-0000-0000-000000000002', 1000.00, 'Bank Transfer', '2026-07-12 10:15:00+00')
on conflict do nothing;
