# Employee Time Tracker

A simple employee time-tracking web app built with React, Vite, Tailwind CSS, shadcn/ui, and Supabase.

## Features

- **Employee Clock Page**: Employees can clock in and out
- **Admin Dashboard**: View all time records with filtering
- **Real-time Clock**: Live time display
- **Print Functionality**: Print time records
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Supabase (PostgreSQL + API)
- React Router
- npm

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API and copy your Project URL and anon key
3. Update your `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database

Run the following SQL in your Supabase SQL Editor:

```sql
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
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### Employee Clock Page (`/`)
- Select your name from the dropdown
- Click "Clock In" to start a shift
- Click "Clock Out" to end your shift
- View your current status and last activity

### Admin Dashboard (`/admin`)
- View statistics: total employees, currently clocked in, today's shifts
- Filter records by employee, date range, and status
- Click "Print Records" to print the current view

## Database Schema

### Employees Table
- `id`: UUID (primary key)
- `employee_code`: Text (unique)
- `full_name`: Text
- `department`: Text (optional)
- `is_active`: Boolean
- `created_at`: Timestamp

### Shifts Table
- `id`: UUID (primary key)
- `employee_id`: UUID (foreign key to employees)
- `clock_in_at`: Timestamp
- `clock_out_at`: Timestamp (nullable)
- `notes`: Text (optional)
- `created_at`: Timestamp

## Security Notes

This MVP uses public Supabase keys and Row Level Security (RLS) policies for simplicity. For production use, consider implementing:
- Proper authentication system
- Role-based access control
- More restrictive RLS policies
- Audit logging

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.
