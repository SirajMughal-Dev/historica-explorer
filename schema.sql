-- ============================================================
-- Historica Explorer - Universal Database Schema (MySQL / PostgreSQL / SQLite)
-- ============================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Countries Table
CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  flag VARCHAR(10),
  hero_image TEXT,
  history TEXT,
  timeline_json TEXT,
  culture TEXT,
  traditions TEXT,
  language VARCHAR(255),
  famous_places_summary TEXT
);

-- 3. Cities Table
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  country_id INT REFERENCES countries(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  hero_image TEXT,
  history TEXT,
  location_geo TEXT,
  food_cuisine TEXT
);

-- 4. Places / Landmarks Table
CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  city_id INT REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  main_image TEXT,
  images_json TEXT,
  overview TEXT,
  history TEXT,
  highlights_json TEXT,
  visitor_experience TEXT
);

-- 5. User Favorites / Bookmarks Table
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  place_id INT REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, place_id)
);
