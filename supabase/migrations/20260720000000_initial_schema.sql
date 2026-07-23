-- Migration: Initial Schema for Photo Studio Material Inventory & Invoicing System

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text unique,
  password text,
  role text check (role in ('admin','manager','staff')) default 'staff',
  created_at timestamptz default now()
);

-- Ensure profiles table has email/password columns and drop auth.users FK constraint if present from earlier schema runs
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists password text;
alter table public.profiles drop constraint if exists profiles_id_fkey;

-- 2. CATEGORIES
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- 3. SUPPLIERS
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_phone text,
  contact_email text,
  address text,
  created_at timestamptz default now()
);

-- 4. ITEMS
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  unit text default 'pcs',
  cost_price numeric(12,2) default 0,
  selling_price numeric(12,2) default 0,
  reorder_level numeric(12,2) default 0,
  photo_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 5. STOCK MOVEMENTS
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.items(id) on delete cascade not null,
  movement_type text check (movement_type in ('purchase_in','usage_out','damaged','returned','adjustment')) not null,
  quantity numeric(12,2) not null,       -- always positive; sign handled by movement_type logic
  reference_invoice_id uuid,             -- nullable, set when linked to an invoice
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 6. CUSTOMERS
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  address text,
  created_at timestamptz default now()
);

-- 7. INVOICES
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  customer_id uuid references public.customers(id) on delete set null,
  status text check (status in ('draft','sent','paid','partially_paid','overdue','cancelled')) default 'draft',
  subtotal numeric(12,2) default 0,
  tax_percent numeric(5,2) default 0,
  discount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  amount_paid numeric(12,2) default 0,
  pdf_url text,
  issued_at date default current_date,
  due_at date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 8. INVOICE ITEMS
create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade,
  item_id uuid references public.items(id) on delete set null,      -- nullable for service-only line items
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  line_total numeric(12,2) generated always as (quantity * unit_price) stored
);

-- 9. PAYMENTS
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  method text,
  paid_at timestamptz default now()
);

-- 10. ACTIVITY LOG
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text,
  entity_table text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

-- 11. STUDIO SETTINGS
create table if not exists public.studio_settings (
  id int primary key default 1,
  studio_name text default 'Daylight Media',
  studio_address text default '108 Daylight Studio Way, Visual District',
  studio_phone text default '+1 (555) 019-2834',
  studio_email text default 'billing@daylightmedia.com',
  logo_url text default 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200',
  default_tax_percent numeric(5,2) default 18.00,
  currency_symbol text default '₹',
  updated_at timestamptz default now()
);

insert into studio_settings (id, studio_name, studio_address, studio_phone, studio_email, default_tax_percent, currency_symbol)
values (1, 'Daylight Media', '108 Daylight Studio Way, Visual District', '+1 (555) 019-2834', 'billing@daylightmedia.com', 18.00, '₹')
on conflict (id) do nothing;

--------------------------------------------------------------------------------
-- REQUIRED DB FUNCTIONS & VIEWS
--------------------------------------------------------------------------------

-- Function: Compute current stock on hand for a given item
create or replace function public.item_stock_on_hand(p_item_id uuid)
returns numeric(12,2)
language sql
stable
as $$
  select coalesce(
    sum(
      case 
        when movement_type in ('purchase_in', 'returned') then quantity
        when movement_type in ('usage_out', 'damaged') then -quantity
        when movement_type = 'adjustment' then quantity
        else 0
      end
    ), 0
  )
  from public.stock_movements
  where item_id = p_item_id;
$$;

-- View: Items with computed stock and category/supplier details
create or replace view public.items_with_stock as
select
  i.id,
  i.sku,
  i.name,
  i.category_id,
  c.name as category_name,
  i.supplier_id,
  s.name as supplier_name,
  i.unit,
  i.cost_price,
  i.selling_price,
  i.reorder_level,
  i.photo_url,
  i.is_active,
  i.created_at,
  public.item_stock_on_hand(i.id) as stock_on_hand,
  (public.item_stock_on_hand(i.id) <= i.reorder_level) as is_low_stock
from public.items i
left join public.categories c on i.category_id = c.id
left join public.suppliers s on i.supplier_id = s.id;

--------------------------------------------------------------------------------
-- RPC FUNCTION: Finalize Invoice (Deduct stock & check for negative stock)
--------------------------------------------------------------------------------

create or replace function public.finalize_invoice(p_invoice_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_rec record;
  v_current_stock numeric(12,2);
  v_inv_status text;
  v_inv_number text;
begin
  -- Retrieve invoice status & number
  select status, invoice_number into v_inv_status, v_inv_number
  from public.invoices
  where id = p_invoice_id;

  if not found then
    raise exception 'Invoice with ID % not found', p_invoice_id;
  end if;

  if v_inv_status in ('sent', 'paid', 'partially_paid') then
    -- Already finalized, do nothing
    return;
  end if;

  -- 1. Check stock availability for all linked inventory items
  for v_rec in (
    select ii.item_id, ii.quantity, i.name as item_name
    from public.invoice_items ii
    join public.items i on ii.item_id = i.id
    where ii.invoice_id = p_invoice_id and ii.item_id is not null
  ) loop
    v_current_stock := public.item_stock_on_hand(v_rec.item_id);
    if v_current_stock < v_rec.quantity then
      raise exception 'Stock calculation failed: Insufficient stock for material "%". Available: %, Required: %',
        v_rec.item_name, v_current_stock, v_rec.quantity;
    end if;
  end loop;

  -- 2. Insert usage_out stock movements for linked items
  for v_rec in (
    select ii.item_id, ii.quantity
    from public.invoice_items ii
    where ii.invoice_id = p_invoice_id and ii.item_id is not null
  ) loop
    insert into public.stock_movements (
      item_id,
      movement_type,
      quantity,
      reference_invoice_id,
      note,
      created_by
    ) values (
      v_rec.item_id,
      'usage_out',
      v_rec.quantity,
      p_invoice_id,
      'Stock deducted on finalization of invoice #' || v_inv_number,
      auth.uid()
    );
  end loop;

  -- 3. Update invoice status to sent (or paid if fully paid)
  update public.invoices
  set status = case when amount_paid >= total and total > 0 then 'paid' else 'sent' end
  where id = p_invoice_id;
end;
$$;

--------------------------------------------------------------------------------
-- TRIGGERS & AUTOMATION
--------------------------------------------------------------------------------

-- Trigger Function: Recalculate Invoice Totals
create or replace function public.recalculate_invoice_totals()
returns trigger
language plpgsql
as $$
declare
  v_invoice_id uuid;
  v_subtotal numeric(12,2);
  v_tax_pct numeric(5,2);
  v_disc numeric(12,2);
  v_grand_total numeric(12,2);
begin
  if TG_OP = 'DELETE' then
    v_invoice_id := OLD.invoice_id;
  else
    v_invoice_id := NEW.invoice_id;
  end if;

  select coalesce(sum(line_total), 0)
  into v_subtotal
  from public.invoice_items
  where invoice_id = v_invoice_id;

  select coalesce(tax_percent, 0), coalesce(discount, 0)
  into v_tax_pct, v_disc
  from public.invoices
  where id = v_invoice_id;

  v_grand_total := (v_subtotal - v_disc) * (1 + (v_tax_pct / 100.0));
  if v_grand_total < 0 then
    v_grand_total := 0;
  end if;

  update public.invoices
  set subtotal = v_subtotal,
      total = v_grand_total,
      status = case 
        when status in ('sent', 'partially_paid', 'paid') then
          case 
            when amount_paid >= v_grand_total and v_grand_total > 0 then 'paid'
            when amount_paid > 0 then 'partially_paid'
            else 'sent'
          end
        else status
      end
  where id = v_invoice_id;

  return null;
end;
$$;

create or replace trigger trg_invoice_items_total
after insert or update or delete on public.invoice_items
for each row execute function public.recalculate_invoice_totals();

-- Trigger Function: Recalculate Payment Totals on Invoice
create or replace function public.recalculate_payments()
returns trigger
language plpgsql
as $$
declare
  v_invoice_id uuid;
  v_total_paid numeric(12,2);
  v_inv_total numeric(12,2);
  v_current_status text;
begin
  if TG_OP = 'DELETE' then
    v_invoice_id := OLD.invoice_id;
  else
    v_invoice_id := NEW.invoice_id;
  end if;

  select coalesce(sum(amount), 0)
  into v_total_paid
  from public.payments
  where invoice_id = v_invoice_id;

  select total, status
  into v_inv_total, v_current_status
  from public.invoices
  where id = v_invoice_id;

  update public.invoices
  set amount_paid = v_total_paid,
      status = case
        when v_total_paid >= v_inv_total and v_inv_total > 0 then 'paid'
        when v_total_paid > 0 and v_current_status != 'draft' then 'partially_paid'
        else v_current_status
      end
  where id = v_invoice_id;

  return null;
end;
$$;

create or replace trigger trg_payments_total
after insert or update or delete on public.payments
for each row execute function public.recalculate_payments();

-- Trigger Function: User creation auto profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'full_name', NEW.email),
    coalesce(NEW.raw_user_meta_data->>'role', 'staff')
  )
  on conflict (id) do nothing;
  return NEW;
end;
$$;

create or replace trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Trigger Function: Activity Log
create or replace function public.log_activity()
returns trigger
language plpgsql
security definer
as $$
declare
  v_actor_id uuid;
  v_entity_id uuid;
  v_details jsonb;
begin
  v_actor_id := auth.uid();
  if TG_OP = 'DELETE' then
    v_entity_id := OLD.id;
    v_details := to_jsonb(OLD);
  else
    v_entity_id := NEW.id;
    v_details := to_jsonb(NEW);
  end if;

  insert into public.activity_log (actor_id, action, entity_table, entity_id, details)
  values (v_actor_id, TG_OP, TG_TABLE_NAME, v_entity_id, v_details);

  return null;
end;
$$;

create or replace trigger trg_log_items_activity
after insert or update or delete on public.items
for each row execute function public.log_activity();

create or replace trigger trg_log_stock_activity
after insert or update or delete on public.stock_movements
for each row execute function public.log_activity();

create or replace trigger trg_log_invoices_activity
after insert or update or delete on public.invoices
for each row execute function public.log_activity();

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

alter table public.profiles disable row level security;
alter table public.categories disable row level security;
alter table public.suppliers disable row level security;
alter table public.items disable row level security;
alter table public.stock_movements disable row level security;
alter table public.customers disable row level security;
alter table public.invoices disable row level security;
alter table public.invoice_items disable row level security;
alter table public.payments disable row level security;
alter table public.activity_log disable row level security;
alter table public.studio_settings disable row level security;

-- Helper function to fetch current user's role
create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- PROFILES Policies
drop policy if exists "Profiles visible to authenticated users" on public.profiles;
create policy "Profiles visible to authenticated users" on public.profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles" on public.profiles
  for all using (public.current_user_role() = 'admin');

drop policy if exists "Users can update own profile name" on public.profiles;
create policy "Users can update own profile name" on public.profiles
  for update using (id = auth.uid());

-- CATEGORIES Policies
drop policy if exists "Categories visible to authenticated" on public.categories;
create policy "Categories visible to authenticated" on public.categories
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admins and Managers can manage categories" on public.categories;
create policy "Admins and Managers can manage categories" on public.categories
  for all using (public.current_user_role() in ('admin', 'manager'));

-- SUPPLIERS Policies
drop policy if exists "Suppliers visible to authenticated" on public.suppliers;
create policy "Suppliers visible to authenticated" on public.suppliers
  for select using (auth.role() = 'authenticated');

drop policy if exists "All authenticated can create/edit suppliers" on public.suppliers;
create policy "All authenticated can create/edit suppliers" on public.suppliers
  for all using (auth.role() = 'authenticated');

-- ITEMS Policies
drop policy if exists "Items visible to authenticated" on public.items;
create policy "Items visible to authenticated" on public.items
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admins and Managers can manage items" on public.items;
create policy "Admins and Managers can manage items" on public.items
  for all using (public.current_user_role() in ('admin', 'manager'));

drop policy if exists "Staff can insert items" on public.items;
create policy "Staff can insert items" on public.items
  for insert with check (auth.role() = 'authenticated');

-- STOCK MOVEMENTS Policies
drop policy if exists "Stock movements visible to authenticated" on public.stock_movements;
create policy "Stock movements visible to authenticated" on public.stock_movements
  for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can insert stock movements" on public.stock_movements;
create policy "Authenticated users can insert stock movements" on public.stock_movements
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Admins and Managers can manage stock movements" on public.stock_movements;
create policy "Admins and Managers can manage stock movements" on public.stock_movements
  for update using (public.current_user_role() in ('admin', 'manager'));

-- CUSTOMERS Policies
drop policy if exists "Customers visible to authenticated" on public.customers;
create policy "Customers visible to authenticated" on public.customers
  for select using (auth.role() = 'authenticated');

drop policy if exists "All authenticated can create/edit customers" on public.customers;
create policy "All authenticated can create/edit customers" on public.customers
  for all using (auth.role() = 'authenticated');

-- INVOICES Policies
drop policy if exists "Invoices visible to authenticated" on public.invoices;
create policy "Invoices visible to authenticated" on public.invoices
  for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can create invoices" on public.invoices;
create policy "Authenticated users can create invoices" on public.invoices
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update draft invoices" on public.invoices;
create policy "Authenticated users can update draft invoices" on public.invoices
  for update using (
    public.current_user_role() in ('admin', 'manager') or status = 'draft'
  );

drop policy if exists "Admins and Managers can delete invoices" on public.invoices;
create policy "Admins and Managers can delete invoices" on public.invoices
  for delete using (public.current_user_role() in ('admin', 'manager'));

-- INVOICE ITEMS Policies
drop policy if exists "Invoice items visible to authenticated" on public.invoice_items;
create policy "Invoice items visible to authenticated" on public.invoice_items
  for select using (auth.role() = 'authenticated');

drop policy if exists "All authenticated can insert invoice items" on public.invoice_items;
create policy "All authenticated can insert invoice items" on public.invoice_items
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "All authenticated can update invoice items" on public.invoice_items;
create policy "All authenticated can update invoice items" on public.invoice_items
  for update using (auth.role() = 'authenticated');

drop policy if exists "All authenticated can delete invoice items" on public.invoice_items;
create policy "All authenticated can delete invoice items" on public.invoice_items
  for delete using (auth.role() = 'authenticated');

-- PAYMENTS Policies
drop policy if exists "Payments visible to authenticated" on public.payments;
create policy "Payments visible to authenticated" on public.payments
  for select using (auth.role() = 'authenticated');

drop policy if exists "All authenticated can record payments" on public.payments;
create policy "All authenticated can record payments" on public.payments
  for insert with check (auth.role() = 'authenticated');

-- ACTIVITY LOG Policies
drop policy if exists "Activity log visible to authenticated" on public.activity_log;
create policy "Activity log visible to authenticated" on public.activity_log
  for select using (auth.role() = 'authenticated');

-- STUDIO SETTINGS Policies
drop policy if exists "Settings visible to authenticated" on public.studio_settings;
create policy "Settings visible to authenticated" on public.studio_settings
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admins can update studio settings" on public.studio_settings;
create policy "Admins can update studio settings" on public.studio_settings
  for update using (public.current_user_role() = 'admin');

--------------------------------------------------------------------------------
-- STORAGE BUCKETS SETUP
--------------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

-- Storage Policies
drop policy if exists "Item photos public access" on storage.objects;
create policy "Item photos public access" on storage.objects
  for select using (bucket_id = 'item-photos');

drop policy if exists "Item photos auth upload" on storage.objects;
create policy "Item photos auth upload" on storage.objects
  for insert with check (bucket_id = 'item-photos' and auth.role() = 'authenticated');

drop policy if exists "Invoices auth access" on storage.objects;
create policy "Invoices auth access" on storage.objects
  for select using (bucket_id = 'invoices' and auth.role() = 'authenticated');

drop policy if exists "Invoices auth upload" on storage.objects;
create policy "Invoices auth upload" on storage.objects
  for insert with check (bucket_id = 'invoices' and auth.role() = 'authenticated');
