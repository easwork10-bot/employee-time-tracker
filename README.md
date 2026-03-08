# Employee Time Tracker

A modern employee time tracking system built with React, Vite, and Tailwind CSS.

## Features

- **Clock In/Out**: Employees can easily clock in and out
- **Admin Dashboard**: View and manage employee time records
- **Real-time Tracking**: Live status updates and duration calculations
- **Filtering**: Filter records by employee, date range, and status
- **Total Working Time**: Calculate total hours based on filters
- **Print Support**: Clean print layouts for reports

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database)
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with responsive design

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key

4. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup

Run the SQL script in `database-setup.sql` in your Supabase project to set up the required tables and policies.

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin dashboard components
│   └── clock/          # Clock page components
├── pages/              # Main page components
├── services/           # API service layer
├── lib/                # Utility libraries
└── styles/             # Global styles
```

## Usage

### For Employees
1. Go to the Clock page
2. Select your name from the dropdown
3. Click "Clock In" to start your shift
4. Click "Clock Out" to end your shift

### For Administrators
1. Go to the Admin Dashboard
2. Use filters to view specific time records
3. View total working time for filtered results
4. Print reports as needed

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT
