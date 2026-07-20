# DLM-SMS: Photo Studio Inventory & Invoicing System

A production-ready, full-stack **online material inventory management and rental invoicing platform** built specifically for photo studios. Tracks cameras, lenses, strobes, softboxes, backdrops, props, and consumables with real-time stock computation, low-stock warnings, RLS security enforcement, and automated stock deduction on invoice finalization.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React, Recharts (analytics dashboard), React Hook Form, Zod.
- **Backend & Database**: Supabase (Postgres, Auth, Row Level Security, Storage, Realtime, Edge Functions).
- **PDF Generation**: Native client-side printable PDF renderer & `@react-pdf/renderer` Edge Function.
- **Testing**: Vitest unit test suite for stock calculations and invoice totals math.

---

## 🚀 Core Features & Architecture

### 1. Auth & Role-Based Security (RLS)
- Integrated with Supabase Auth (`email/password` & OAuth).
- 3 Distinct Roles:
  - `admin`: Full system control (user profiles, role assignment, tax & studio settings, inventory, invoices, activity logs).
  - `manager`: Full CRUD on inventory items, categories, suppliers, customers, and invoices.
  - `staff`: Can view inventory, record purchase-in/usage-out stock movements, and create draft invoices. Cannot edit/delete finalized invoices or manage roles.
- Row Level Security (RLS) policies implemented on all 11 Postgres tables.

### 2. Live Calculated Material Inventory
- Stock is never stored as a mutable flat number.
- Computed live using `item_stock_on_hand(item_id)` SQL function across the `stock_movements` transaction ledger (`+purchase_in`, `+returned`, `-usage_out`, `-damaged`, `±adjustment`).
- Automatic low-stock warnings when `stock_on_hand <= reorder_level`.

### 3. Invoicing & Automatic Stock Deduction
- Dynamic line item builder pulling items from live inventory or custom service lines.
- Automatic tax %, discount, subtotal, and grand total calculations.
- **RPC `finalize_invoice(invoice_id)`**:
  - When an invoice transitions to `sent` or `paid`, it verifies stock availability for all linked materials.
  - **Blocks finalization and raises a clear SQL error** if resulting stock would be negative.
  - Inserts `usage_out` stock movements automatically upon successful finalization.

### 4. Executive Analytics Dashboard & Reports
- Interactive charts powered by Recharts (Monthly Revenue trend, Top-Used Materials, Category Stock Asset value).
- CSV Exporters for Stock Movement Ledgers and Sales/Billing Reports.
- Complete system audit trail (`activity_log`).

---

## 📁 Repository Structure

```
DLM-SMS/
├── supabase/
│   ├── migrations/
│   │   └── 20260720000000_initial_schema.sql  # Database schema, triggers, RPCs, RLS
│   ├── functions/
│   │   ├── generate-invoice-pdf/              # Edge Function for PDF invoice rendering
│   │   └── low-stock-alert/                   # Edge Function for low stock email alerts
│   └── seed.sql                               # Seed data (Categories, Items, Clients, Invoices)
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── dashboard/                         # Recharts analytics & metrics
│   │   ├── inventory/                         # Inventory list, add item, item detail
│   │   ├── stock-movements/                   # Audit ledger & movement modal
│   │   ├── suppliers/                         # Vendor directory
│   │   ├── customers/                         # Client directory
│   │   ├── invoices/                          # Line item builder & invoice viewer
│   │   ├── reports/                           # CSV export center
│   │   ├── settings/                          # Studio tax & team role management
│   │   └── activity-log/                      # Audit trail
│   ├── components/
│   │   └── layout/                            # Sidebar, Header, AppShell
│   ├── context/
│   │   └── studio-context.tsx                 # Real-time state store & RPC handlers
│   ├── lib/
│   │   ├── supabase/                          # Browser & Server clients
│   │   └── store.ts                           # Mock state & stock math logic
│   ├── tests/
│   │   ├── stock-calculation.test.ts          # Vitest suite for stock ledger math
│   │   └── invoice-totals.test.ts             # Vitest suite for billing calculations
│   └── types/
│       └── database.ts                        # Generated Supabase TypeScript types
├── .env.example
├── README.md
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚙️ Setup & Local Development Guide

### Prerequisites
- Node.js 18+ installed.
- Supabase CLI installed (`npm i -g supabase` or `brew install supabase/tap/supabase`).

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd DLM-SMS
npm install
```

### 2. Environment Variables Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_123456789 # Optional for email alerts
```

### 3. Initialize & Apply Database Migrations (Supabase Cloud / Local)
If using Supabase CLI locally:
```bash
supabase init
supabase start
supabase db reset # Applies migrations from supabase/migrations/ and seeds from supabase/seed.sql
```

If connecting to Supabase Cloud:
```bash
supabase link --project-ref your-project-id
supabase db push
```

### 4. Deploy Supabase Edge Functions
```bash
supabase functions deploy generate-invoice-pdf
supabase functions deploy low-stock-alert
```

### 5. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Automated Tests

To execute the unit test suite for stock calculations and invoice totals:
```bash
npm run test
```

---

## 📋 Manual Supabase Dashboard Verification Steps

1. **Authentication**:
   - Go to **Authentication > Settings** in Supabase Dashboard and verify `Email / Password` provider is enabled.
2. **Storage Buckets**:
   - Verify that `item-photos` (Public) and `invoices` (Private) buckets were created automatically via migration script.
3. **Scheduled Cron Trigger for Low Stock Alerts**:
   - To enable automated daily low stock emails, go to **Database > Triggers / Extensions** and schedule `pg_cron` to invoke the `low-stock-alert` Edge Function daily:
     ```sql
     select cron.schedule(
       'daily-low-stock-alert',
       '0 8 * * *',
       $$ select net.http_post(
            url:='https://<project-ref>.supabase.co/functions/v1/low-stock-alert',
            headers:='{"Authorization": "Bearer <service-role-key>"}'::jsonb
          ); $$
     );
     ```
