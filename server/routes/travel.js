import express from 'express';
import { dbAll, dbGet } from '../db.js';

const router = express.Router();

// Get all countries
router.get('/countries', async (req, res) => {
  try {
    const countries = await dbAll('SELECT id, name, slug, flag, hero_image, famous_places_summary FROM countries ORDER BY name ASC');
    res.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

// Get single country details with its cities
router.get('/countries/:slug', async (req, res) => {
  try {
    const country = await dbGet('SELECT * FROM countries WHERE slug = ?', [req.params.slug]);
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }

    // Parse JSON fields
    if (country.timeline_json) {
      try { country.timeline = JSON.parse(country.timeline_json); } catch (e) { country.timeline = []; }
    }

    const cities = await dbAll('SELECT id, name, slug, hero_image, history FROM cities WHERE country_id = ? ORDER BY name ASC', [country.id]);
    
    // Also fetch featured places in this country
    const places = await dbAll(`
      SELECT p.id, p.name, p.slug, p.main_image, p.overview, c.name as city_name, c.slug as city_slug
      FROM places p
      JOIN cities c ON p.city_id = c.id
      WHERE c.country_id = ?
      LIMIT 6
    `, [country.id]);

    res.json({
      ...country,
      cities,
      featured_places: places
    });
  } catch (error) {
    console.error('Error fetching country detail:', error);
    res.status(500).json({ error: 'Failed to fetch country detail' });
  }
});

// Get single city details with country info and list of places
router.get('/cities/:slug', async (req, res) => {
  try {
    const city = await dbGet(`
      SELECT c.*, co.name as country_name, co.slug as country_slug, co.flag as country_flag
      FROM cities c
      JOIN countries co ON c.country_id = co.id
      WHERE c.slug = ?
    `, [req.params.slug]);

    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    const places = await dbAll('SELECT id, name, slug, main_image, overview FROM places WHERE city_id = ? ORDER BY name ASC', [city.id]);

    res.json({
      ...city,
      places
    });
  } catch (error) {
    console.error('Error fetching city detail:', error);
    res.status(500).json({ error: 'Failed to fetch city detail' });
  }
});

// Get single place details with city & country breadcrumbs and photo gallery
router.get('/places/:slug', async (req, res) => {
  try {
    const place = await dbGet(`
      SELECT p.*, c.name as city_name, c.slug as city_slug, co.name as country_name, co.slug as country_slug, co.flag as country_flag
      FROM places p
      JOIN cities c ON p.city_id = c.id
      JOIN countries co ON c.country_id = co.id
      WHERE p.slug = ?
    `, [req.params.slug]);

    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    // Parse JSON fields
    try { place.images = JSON.parse(place.images_json || '[]'); } catch (e) { place.images = [place.main_image]; }
    try { place.highlights = JSON.parse(place.highlights_json || '[]'); } catch (e) { place.highlights = []; }

    res.json(place);
  } catch (error) {
    console.error('Error fetching place detail:', error);
    res.status(500).json({ error: 'Failed to fetch place detail' });
  }
});

// Search API
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ countries: [], cities: [], places: [] });
    }

    const term = `%${q.trim()}%`;
    const countries = await dbAll('SELECT name, slug, flag, hero_image FROM countries WHERE name LIKE ? LIMIT 5', [term]);
    const cities = await dbAll('SELECT c.name, c.slug, c.hero_image, co.name as country_name FROM cities c JOIN countries co ON c.country_id = co.id WHERE c.name LIKE ? LIMIT 5', [term]);
    const places = await dbAll('SELECT p.name, p.slug, p.main_image, c.name as city_name FROM places p JOIN cities c ON p.city_id = c.id WHERE p.name LIKE ? LIMIT 5', [term]);

    res.json({ countries, cities, places });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

export default router;
