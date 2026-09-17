import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import travelRoutes from './routes/travel.js';
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', travelRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

// Serve static frontend assets from dist folder if built
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Historica Explorer Backend API Server Running on Port 5000');
    }
  });
});

// Database Initialization (Supports SQLite by default or PostgreSQL via DB_TYPE=postgres)
const DB_TYPE = process.env.DB_TYPE || 'sqlite';

// On Vercel (or any environment with VERCEL set), we skip the local-dev-style
// "create tables + seed if empty" bootstrap — it's meant for first-time local
// setup, is unnecessary once your Neon database is already seeded, and would
// otherwise re-run on every cold start. Routes talk to the database lazily via
// server/db.js regardless, so the app is ready to serve requests immediately.
const IS_SERVERLESS = !!process.env.VERCEL;

const startServer = async () => {
  if (!IS_SERVERLESS) {
    if (DB_TYPE === 'postgres') {
      console.log('Connecting to external PostgreSQL / pgAdmin database...');
      const pgModulePath = ['.', 'database_pg.js'].join('/');
      const { initPostgreSQLDatabase } = await import(pgModulePath);
      await initPostgreSQLDatabase();
    } else {
      console.log('Connecting to built-in SQLite database...');
      const sqliteModulePath = ['.', 'database.js'].join('/');
      const { initDatabase } = await import(sqliteModulePath);
      await initDatabase();
    }
  }

  if (!IS_SERVERLESS) {
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`✈️ Historica Explorer Server running on port ${PORT}`);
      console.log(`Frontend UI & API: http://localhost:${PORT}`);
      console.log(`Database Mode: ${DB_TYPE.toUpperCase()}`);
      console.log(`====================================================`);
    });
  }
};

if (IS_SERVERLESS) {
  // Vercel calls the exported handler directly per-request; no app.listen() needed.
  console.log(`Historica Explorer API running in serverless mode (${DB_TYPE.toUpperCase()})`);
} else {
  startServer().catch(err => {
    console.error('❌ Failed to initialize server or database:', err);
    console.error('The server will now exit. Fix the error above and restart with "npm run server".');
    process.exit(1);
  });
}

export default app;
