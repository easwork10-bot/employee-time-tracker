-- =================================
-- EMPLOYEE TIME TRACKER DATABASE SETUP
-- =================================
-- Run this in your Supabase SQL Editor

create extension if not exists pgcrypto;

-- =========================
-- EMPLOYEES
-- =========================
create table if not exists public.employees (
    id uuid primary key default gen_random_uuid(),
    employee_code text not null unique,
    full_name text not null,
    department text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),

    constraint employee_code_not_blank check (length(trim(employee_code)) > 0),
    constraint full_name_not_blank check (length(trim(full_name)) > 0)
);

-- =========================
-- SHIFTS
-- =========================
create table if not exists public.shifts (
    id uuid primary key default gen_random_uuid(),
    employee_id uuid not null references public.employees(id) on delete cascade,
    clock_in_at timestamptz not null,
    clock_out_at timestamptz,
    notes text,
    created_at timestamptz not null default now(),

    constraint valid_shift_time check (
        clock_out_at is null or clock_out_at >= clock_in_at
    )
);

-- =========================
-- INDEXES
-- =========================
create index if not exists ix_shifts_employee_id
on public.shifts(employee_id);

create index if not exists ix_shifts_clock_in_at
on public.shifts(clock_in_at);

create index if not exists ix_employees_full_name
on public.employees(full_name);

create unique index if not exists ux_shifts_one_open_shift_per_employee
on public.shifts(employee_id)
where clock_out_at is null;

-- =========================
-- RLS POLICIES
-- =========================
alter table public.employees enable row level security;
alter table public.shifts enable row level security;

drop policy if exists "public can read employees" on public.employees;
create policy "public can read employees"
on public.employees
for select
to anon
using (true);

drop policy if exists "public can read shifts" on public.shifts;
create policy "public can read shifts"
on public.shifts
for select
to anon
using (true);

drop policy if exists "public can insert shifts" on public.shifts;
create policy "public can insert shifts"
on public.shifts
for insert
to anon
with check (
  employee_id is not null
  and clock_in_at is not null
  and clock_out_at is null
);

drop policy if exists "public can update shifts" on public.shifts;
create policy "public can update shifts"
on public.shifts
for update
to anon
using (clock_out_at is null)
with check (
  employee_id is not null
  and clock_in_at is not null
  and (clock_out_at is null or clock_out_at >= clock_in_at)
);

-- =========================
-- SAMPLE DATA
-- =========================
insert into public.employees (employee_code, full_name, department)
values
  ('EMP001', 'John Doe', 'Engineering'),
  ('EMP002', 'Jane Smith', 'Marketing'),
  ('EMP003', 'Mike Johnson', 'Sales')
on conflict (employee_code) do nothing;
