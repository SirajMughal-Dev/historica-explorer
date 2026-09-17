/**
 * db.js — unified database adapter used by all routes.
 * ---------------------------------------------------------------
 * Previously every route imported dbAll/dbGet/dbRun directly from
 * ./database.js (SQLite only) — meaning even when DB_TYPE=postgres
 * and the data was correctly seeded into Postgres, every API request
 * was silently still reading from the local SQLite file. This file
 * fixes that by picking the right backend at query time, based on
 * DB_TYPE, while keeping the exact same dbAll/dbGet/dbRun interface
 * routes already use — so no route files needed their SQL rewritten.
 *
 * SQLite queries use '?' placeholders. Postgres uses '$1, $2, ...'.
 * To avoid rewriting every query string across every route, the
 * Postgres path below auto-translates '?' -> '$1,$2,...' at call time.
 */
import 'dotenv/config';

const DB_TYPE = process.env.DB_TYPE || 'sqlite';

let pgPoolPromise = null;

async function getPgPool() {
  if (pgPoolPromise) return pgPoolPromise;

  pgPoolPromise = (async () => {
    const pkg = await import('pg');
    const { Pool } = pkg.default || pkg;

    const connectionString = process.env.DATABASE_URL;

    if (connectionString) {
      return new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false } // required by Neon and most managed Postgres hosts
      });
    }

    return new Pool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'historica_explorer',
      port: process.env.DB_PORT || 5432,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
    });
  })();

  return pgPoolPromise;
}

// Converts '?' positional placeholders (SQLite style) into '$1, $2, ...' (Postgres style).
function toPgQuery(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function pgAll(sql, params = []) {
  const pool = await getPgPool();
  const res = await pool.query(toPgQuery(sql), params);
  return res.rows;
}

async function pgGet(sql, params = []) {
  const rows = await pgAll(sql, params);
  return rows[0] || null;
}

async function pgRun(sql, params = []) {
  const pool = await getPgPool();
  // Auto-append RETURNING id on INSERTs so callers can read lastID like the SQLite adapter does,
  // unless the query already specifies RETURNING.
  let finalSql = toPgQuery(sql);
  const isInsert = /^\s*INSERT/i.test(sql);
  if (isInsert && !/RETURNING/i.test(sql)) {
    finalSql = `${finalSql} RETURNING id`;
  }
  const res = await pool.query(finalSql, params);
  return {
    lastID: res.rows[0]?.id,
    rowCount: res.rowCount
  };
}

let sqliteImplPromise = null;
function getSqliteImpl() {
  // Built from parts (not a string literal) so bundlers used by serverless
  // platforms (e.g. Vercel's build step) don't eagerly try to resolve and
  // bundle sqlite3 for deployments that only ever use Postgres and never
  // install the sqlite3 package.
  if (!sqliteImplPromise) {
    const modulePath = ['.', 'database.js'].join('/');
    sqliteImplPromise = import(modulePath);
  }
  return sqliteImplPromise;
}

export const dbAll = async (sql, params = []) => {
  if (DB_TYPE === 'postgres') return pgAll(sql, params);
  const { dbAll: sqliteDbAll } = await getSqliteImpl();
  return sqliteDbAll(sql, params);
};

export const dbGet = async (sql, params = []) => {
  if (DB_TYPE === 'postgres') return pgGet(sql, params);
  const { dbGet: sqliteDbGet } = await getSqliteImpl();
  return sqliteDbGet(sql, params);
};

export const dbRun = async (sql, params = []) => {
  if (DB_TYPE === 'postgres') return pgRun(sql, params);
  const { dbRun: sqliteDbRun } = await getSqliteImpl();
  return sqliteDbRun(sql, params);
};
