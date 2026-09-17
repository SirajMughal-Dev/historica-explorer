import express from 'express';
import { authenticateToken } from './auth.js';
import { dbAll, dbGet, dbRun } from '../db.js';

const router = express.Router();

// Get User Favorites
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const favorites = await dbAll(`
      SELECT p.id, p.name, p.slug, p.main_image, p.overview, c.name as city_name, co.name as country_name, f.created_at
      FROM favorites f
      JOIN places p ON f.place_id = p.id
      JOIN cities c ON p.city_id = c.id
      JOIN countries co ON c.country_id = co.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [req.user.id]);

    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Toggle Favorite (Add/Remove)
router.post('/favorites/toggle', authenticateToken, async (req, res) => {
  try {
    const { place_id } = req.body;
    if (!place_id) return res.status(400).json({ error: 'Place ID required' });

    const existing = await dbGet('SELECT * FROM favorites WHERE user_id = ? AND place_id = ?', [req.user.id, place_id]);

    if (existing) {
      await dbRun('DELETE FROM favorites WHERE user_id = ? AND place_id = ?', [req.user.id, place_id]);
      res.json({ isFavorite: false, message: 'Removed from your saved places.' });
    } else {
      await dbRun('INSERT INTO favorites (user_id, place_id) VALUES (?, ?)', [req.user.id, place_id]);
      res.json({ isFavorite: true, message: 'Saved to your explorer bookmarks!' });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to update favorite' });
  }
});

// Contact Form Endpoint
router.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill out all required fields.' });
  }

  // In production, send email or save to DB
  console.log(`Received contact query from ${name} (${email}): [${subject}] ${message}`);

  res.json({
    success: true,
    message: 'Thank you for reaching out to Historica Explorer! Our travel concierge will get back to you shortly.'
  });
});

export default router;
