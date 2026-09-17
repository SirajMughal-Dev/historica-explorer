# ✈️ Historica Explorer - Full-Stack SaaS Travel Web Application

A premium travel guide platform built with **Node.js, Express, SQLite / SQL Database, React, Vite, and Glassmorphic CSS styling**.

---

## 📁 Project Directory Location

The full project code and ready-to-run files are located in your local folder:
```
C:\Users\user\.gemini\antigravity\scratch\historica-explorer
```

### 📂 Directory Structure Overview
```
historica-explorer/
├── server/
│   ├── index.js          # Express server (Serves REST APIs + React SPA on port 5000)
│   ├── database.js       # SQLite database connection & auto-seeder
│   ├── historica.db      # SQLite database file (created automatically)
│   └── routes/
│       ├── auth.js       # JWT Authentication (Signup, Login, Profile)
│       ├── travel.js     # Travel APIs (Countries, Cities, Places, Search)
│       └── user.js       # Bookmarks & Contact form API
├── src/                  # React Frontend Codebase
│   ├── components/       # Navbar, Footer, AirplaneFlight, LightboxModal, AuthModal
│   ├── context/          # AuthContext (JWT State Management)
│   ├── pages/            # Home, Explore, CountryDetail, CityDetail, PlaceDetail, About, Contact, Saved
│   ├── App.jsx           # App router
│   └── index.css         # Master CSS & Design System
├── schema.sql            # Universal SQL schema script (for PostgreSQL / MySQL)
├── package.json          # Dependencies & npm scripts
└── vite.config.js        # Vite configuration
```

---

## 🗄️ Database Setup & How It Works

### Option 1: Built-in Zero-Setup SQLite (Default & Ready Out of the Box)
The project comes with an **auto-initializing SQLite database** located in `server/historica.db`.
- **Zero installation required**: You do not need to install MySQL or PostgreSQL locally to run the app.
- **Auto-Seeding**: When you run the server for the first time on any computer, it automatically creates all tables and seeds rich travel data (History, Culture, Food & Cuisine, 3-5 Photo Galleries).

### Option 2: MySQL or PostgreSQL Setup (For External Production Databases)
If you want to host the app on an external MySQL or PostgreSQL database (e.g. AWS RDS, Supabase, Neon, Railway):
1. Open the included [`schema.sql`](file:///C:/Users/user/.gemini/antigravity/scratch/historica-explorer/schema.sql) file.
2. Run `schema.sql` in your MySQL Workbench, PostgreSQL pgAdmin, DBeaver, or Supabase SQL editor to create all 5 tables (`users`, `countries`, `cities`, `places`, `favorites`).
3. Set your database environment variables in a `.env` file.

---

## 🚀 How to Run on Any Computer

1. Open a terminal in the project directory:
   ```bash
   cd C:\Users\user\.gemini\antigravity\scratch\historica-explorer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the frontend assets:
   ```bash
   npm run build
   ```
4. Start the full-stack server:
   ```bash
   npm run server
   ```
5. Open your browser at:
   ```
   http://localhost:5000
   ```
