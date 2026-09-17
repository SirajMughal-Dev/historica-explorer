/**
 * fix-images.js
 * ---------------------------------------------------------------
 * One-time repair script for mismatched/irrelevant destination images.
 *
 * Why this exists: hard-coded stock-photo URLs are a guessing game and
 * inevitably drift out of sync with the place they're supposed to show.
 * This script instead calls the Pexels image search API with the *exact*
 * country / city / place name and stores whatever real photo that search
 * genuinely returns — so "Badshahi Mosque" gets a photo actually tagged
 * "Badshahi Mosque", not a guess.
 *
 * Setup:
 *   1. Get a free API key at https://www.pexels.com/api/ (instant, no card needed)
 *   2. Add it to .env:  PEXELS_API_KEY=your-key-here
 *   3. Run:  npm run fix-images
 *
 * Safe to re-run any time (e.g. after reseeding a fresh database).
 * Does NOT touch text content, structure, or any other feature — only the
 * hero_image / main_image / images_json columns.
 */
import 'dotenv/config';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const DB_TYPE = process.env.DB_TYPE || 'sqlite';

if (!PEXELS_API_KEY) {
  console.error('====================================================');
  console.error('❌ PEXELS_API_KEY is not set.');
  console.error('Get a free key at https://www.pexels.com/api/');
  console.error('then add PEXELS_API_KEY=your-key to your .env file.');
  console.error('====================================================');
  process.exit(1);
}

// Simple delay so we stay well under Pexels' generous rate limits.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function searchPexels(query, perPage = 4) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
  if (!res.ok) {
    throw new Error(`Pexels API error ${res.status} for query "${query}"`);
  }
  const data = await res.json();
  return (data.photos || []).map((p) => p.src.large2x || p.src.large || p.src.original);
}

async function fetchImagesFor(name, context, fallbackQuery) {
  // Try the most specific query first (e.g. "Badshahi Mosque Lahore"),
  // fall back to a broader one if nothing comes back.
  const primaryQuery = context ? `${name} ${context}` : name;
  let photos = await searchPexels(primaryQuery);
  if (photos.length === 0 && fallbackQuery) {
    photos = await searchPexels(fallbackQuery);
  }
  return photos;
}

async function run() {
  let db;
  if (DB_TYPE === 'postgres') {
    const pkg = await import('pg');
    const { Pool } = pkg.default || pkg;
    const connectionString = process.env.DATABASE_URL;
    const pool = connectionString
      ? new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
      : new Pool({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'historica_explorer',
          port: process.env.DB_PORT || 5432,
          ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
        });
    db = {
      all: async (sql, params = []) => (await pool.query(sql, params)).rows,
      run: async (sql, params = []) => pool.query(sql, params),
      close: async () => pool.end(),
      placeholder: (i) => `$${i}`,
    };
  } else {
    const { dbAll, dbRun } = await import('../database.js');
    db = {
      all: dbAll,
      run: dbRun,
      close: async () => {},
      placeholder: () => '?',
    };
  }

  console.log(`Fixing images using ${DB_TYPE.toUpperCase()} database...\n`);

  let fixedCount = 0;

  // --- Countries ---
  const countries = await db.all('SELECT id, name FROM countries');
  for (const country of countries) {
    try {
      const photos = await fetchImagesFor(country.name, 'famous landmark travel', `${country.name} travel`);
      if (photos[0]) {
        await db.run(`UPDATE countries SET hero_image = ${db.placeholder(1)} WHERE id = ${db.placeholder(2)}`, [photos[0], country.id]);
        console.log(`✔ Country: ${country.name}`);
        fixedCount++;
      } else {
        console.log(`⚠ No result for country: ${country.name}`);
      }
      await sleep(250);
    } catch (err) {
      console.error(`✘ Failed for country ${country.name}:`, err.message);
    }
  }

  // --- Cities ---
  const cities = await db.all(`
    SELECT cities.id, cities.name, countries.name AS country_name
    FROM cities JOIN countries ON cities.country_id = countries.id
  `);
  for (const city of cities) {
    try {
      const photos = await fetchImagesFor(city.name, `${city.country_name} skyline`, `${city.name} city`);
      if (photos[0]) {
        await db.run(`UPDATE cities SET hero_image = ${db.placeholder(1)} WHERE id = ${db.placeholder(2)}`, [photos[0], city.id]);
        console.log(`✔ City: ${city.name}, ${city.country_name}`);
        fixedCount++;
      } else {
        console.log(`⚠ No result for city: ${city.name}`);
      }
      await sleep(250);
    } catch (err) {
      console.error(`✘ Failed for city ${city.name}:`, err.message);
    }
  }

  // --- Places ---
  const places = await db.all(`
    SELECT places.id, places.name, cities.name AS city_name
    FROM places JOIN cities ON places.city_id = cities.id
  `);
  for (const place of places) {
    try {
      const photos = await fetchImagesFor(place.name, place.city_name, place.name);
      if (photos[0]) {
        const gallery = photos.length > 1 ? photos : [photos[0], photos[0], photos[0]];
        await db.run(
          `UPDATE places SET main_image = ${db.placeholder(1)}, images_json = ${db.placeholder(2)} WHERE id = ${db.placeholder(3)}`,
          [photos[0], JSON.stringify(gallery), place.id]
        );
        console.log(`✔ Place: ${place.name} (${place.city_name}) — ${gallery.length} photos`);
        fixedCount++;
      } else {
        console.log(`⚠ No result for place: ${place.name}`);
      }
      await sleep(250);
    } catch (err) {
      console.error(`✘ Failed for place ${place.name}:`, err.message);
    }
  }

  await db.close();
  console.log(`\n✅ Done. Updated images for ${fixedCount} records.`);
  console.log('Restart your server (npm run server) to see the corrected images.');
}

run().catch((err) => {
  console.error('Fatal error while fixing images:', err);
  process.exit(1);
});
