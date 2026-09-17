import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'historica.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to Historica Explorer SQLite Database.');
  }
});

// Helper for promise-based queries
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const initDatabase = async () => {
  // Create Tables
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS countries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      flag TEXT,
      hero_image TEXT,
      history TEXT,
      timeline_json TEXT,
      culture TEXT,
      traditions TEXT,
      language TEXT,
      famous_places_summary TEXT
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country_id INTEGER,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      hero_image TEXT,
      history TEXT,
      location_geo TEXT,
      food_cuisine TEXT,
      FOREIGN KEY(country_id) REFERENCES countries(id)
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      main_image TEXT,
      images_json TEXT,
      overview TEXT,
      history TEXT,
      highlights_json TEXT,
      visitor_experience TEXT,
      FOREIGN KEY(city_id) REFERENCES cities(id)
    );
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      place_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, place_id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(place_id) REFERENCES places(id)
    );
  `);

  // Check if seeded
  const countryCount = await dbGet('SELECT COUNT(*) as count FROM countries');
  if (countryCount.count === 0) {
    console.log('Seeding Historica Explorer database with rich travel data...');
    await seedDatabase();
  }
};

const seedDatabase = async () => {
  // Demo Admin / User
  const sampleHash = await bcrypt.hash('password123', 10);
  await dbRun(`INSERT INTO users (name, email, password_hash) VALUES ('Explorer Admin', 'admin@historica.com', ?)`, [sampleHash]);

  // --- 1. JAPAN ---
  const resJapan = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Japan',
    'japan',
    '🇯🇵',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&auto=format&fit=crop',
    `Japan’s saga stretches over thousands of years, from ancient Jōmon hunter-gatherers who crafted intricate cord-marked pottery around 14,000 BCE to the dramatic feudal rivalries of the Sengoku period. Unified under the Tokugawa Shogunate in 1603, Japan enjoyed over two centuries of peaceful isolation (Sakoku), during which distinct arts, kabuki theater, woodblock prints, and tea ceremony blossomed. The 1868 Meiji Restoration ignited one of the fastest modernizations in global history, transforming Japan into an industrial and cultural powerhouse while preserving its sacred Shinto and Buddhist roots.`,
    JSON.stringify([
      { year: '14,000 BCE', event: 'Jōmon Period initiates settled village life and pottery arts.' },
      { year: '710 CE', event: 'Nara becomes Japan’s first permanent imperial capital.' },
      { year: '1192 CE', event: 'Kamakura Shogunate establishes military samurai governance.' },
      { year: '1603 CE', event: 'Tokugawa Shogunate establishes Edo (modern Tokyo) and 250 years of peace.' },
      { year: '1868 CE', event: 'Meiji Restoration restores imperial rule and initiates rapid industrialization.' },
      { year: '1964 CE', event: 'Tokyo hosts the Summer Olympics, launching the Shinkansen bullet train era.' }
    ]),
    `Japanese culture is built upon a subtle harmony between ancient spiritual reverence (Omotenashi hospitality) and cutting-edge technological innovation. Daily etiquette values deep respect, cleanliness, seasonal appreciation (such as Hanami cherry blossom viewing), and mindful discipline. Zen philosophies permeate architecture, garden design, martial arts, and minimalist home design.`,
    `Tea Ceremony (Chado), Hanami Cherry Blossom Festivals, Matsuri Shinto Parades, Calligraphy (Shodo), Noh & Kabuki Theater, Sumo Wrestling.`,
    `Japanese (Nihongo). Written in three scripts: Hiragana, Katakana, and Kanji characters derived from ancient China.`,
    `Highlighting ancient imperial shrines, serene bamboo groves, vibrant neon skylines of Tokyo, historic Kyoto geisha districts, and the majestic snow-capped peak of Mount Fuji.`
  ]);

  const japanId = resJapan.lastID;

  // Tokyo
  const resTokyo = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    japanId,
    'Tokyo',
    'tokyo',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1600&auto=format&fit=crop',
    `Originally a modest fishing village named Edo, Tokyo grew rapidly after Tokugawa Ieyasu chose it as his seat of military rule in 1603. By the 18th century, Edo had become one of the most populated cities in the world with over one million residents. Rebranded as Tokyo ("Eastern Capital") in 1868 when Emperor Meiji moved the imperial court from Kyoto, the metropolis rebuilt with astonishing resilience following the 1923 Great Kantō Earthquake and World War II, growing into a global center of design, commerce, and pop culture.`,
    `Situated on the Kantō Plain along the eastern shore of Honshu island facing Tokyo Bay. Tokyo features a humid subtropical climate with warm, humid summers, mild winters, and brilliant autumn foliage. It is framed to the west by the forested Okutama mountain range.`,
    `Tokyo is arguably the culinary capital of the world, boasting more Michelin stars than any other city. From high-end Edomae Sushi mastered over decades to steaming bowls of rich Tonkotsu and Shoyu Ramen in hidden alleyways (Omoide Yokocho). Key street food staples include Tsukiji market tamagoyaki (sweet omelet skewers), freshly fried Tempura, Yakitori skewers grilled over binchotan charcoal, and crispy Monjayaki pancakes in Tsukishima. Dining in Tokyo ranges from serene multi-course Kaiseki feasts to lively Tachinomi standing bars.`
  ]);

  const tokyoId = resTokyo.lastID;

  // Tokyo Places
  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    tokyoId,
    'Sensō-ji Temple',
    'senso-ji',
    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1541171781670-807083f28ba9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578637387939-43c525550085?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Sensō-ji is Tokyo’s oldest and most revered Buddhist temple, dedicated to Kannon, the Bodhisattva of Compassion. Situated in Asakusa, its iconic Kaminarimon Gate with a gigantic red paper lantern invites millions of spiritual pilgrims and travelers each year into a vibrant cultural courtyard.`,
    `According to legend, in 628 CE two fisherman brothers pulled a golden statue of Kannon from the Sumida River. Despite returning it to the river, it repeatedly returned to their nets. Recognizing its divine sanctity, Chief Hajino Nakamoto converted his residence into a temple so worshippers could venerate the icon. The temple expanded through centuries of imperial and shogunate patronage.`,
    JSON.stringify([
      'Kaminarimon (Thunder Gate) featuring the massive 700kg red paper lantern',
      'Nakamise-dori historic 250-meter shopping street with artisan crafts and sweet snacks',
      'Five-Story Pagoda standing 48 meters tall enshrining Buddha relics',
      'Incense Burner (Jokoro) where visitors bathe in fragrant purifying smoke for health'
    ]),
    `Visiting Sensō-ji is a multisensory journey. As you walk under the Kaminarimon, the scent of burning sandalwood incense fills the air alongside the cheerful chatter of shopkeepers offering freshly toasted senbei rice crackers and ningyo-yaki cakes. Early mornings offer serene tranquility, while dusk illuminates the five-story pagoda in warm golden lights.`
  ]);

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    tokyoId,
    'Meiji Shrine',
    'meiji-shrine',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1528164344705-4754268799af?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Nestled within a lush 170-acre man-made forest in the heart of Shibuya, Meiji Shrine (Meiji Jingū) is a sacred Shinto shrine dedicated to the deified spirits of Emperor Meiji and Empress Shōken. It provides a peaceful sanctuary step away from the bustling modern streets of Harajuku.`,
    `Completed in 1920 to honor Emperor Meiji who spearheaded Japan’s transition into a modern state, the shrine was built using donations of 100,000 trees planted by volunteers from across Japan. Rebuilt after WWII bombings in 1958, the forest has grown into a self-sustaining ecosystem harboring rare bird and plant species.`,
    JSON.stringify([
      'Grand Torii Gates constructed from 1,500-year-old Taiwanese cypress trees',
      'Sake & Wine Barrel Wall (Kazaridaru) donated by Japanese brewers and French vineyards',
      'Inner Garden (Jingū Gyoen) famous for the Iris Garden and Kiyomasa’s Sacred Well',
      'Ema Wooden Wish Plaques where visitors write prayers for happiness and good fortune'
    ]),
    `Walking through the soaring wooden Torii gate instantly softens the roar of urban traffic into the rustle of towering evergreen canopy leaves underfoot. Visitors clap twice and bow at the main shrine courtyard, write prayers on wooden ema plaques, and occasionally witness traditional Shinto wedding processions led by priests in ceremonial robes.`
  ]);

  // Kyoto
  const resKyoto = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    japanId,
    'Kyoto',
    'kyoto',
    'https://images.unsplash.com/photo-1541171781670-807083f28ba9?q=80&w=1600&auto=format&fit=crop',
    `Kyoto served as Japan’s imperial capital for over a millennium (794 to 1868 CE), under the original name Heian-kyō ("Capital of Peace and Tranquility"). As the epicenter of classical Japanese culture, Kyoto saw the rise of Zen Buddhism, imperial court literature, refined gardens, and samurai patronage. Spared from widespread destruction during World War II due to its immense cultural value, Kyoto retains thousands of original wooden temples, pagodas, and traditional Machiya townhouses.`,
    `Located in a scenic basin in the Kansai region of Honshu, surrounded on three sides by the gentle Higashiyama, Kitayama, and Nishiyama mountain ranges. The Kamo and Katsura rivers wind through the city, fostering cooler mountain breezes and distinct seasonal highlights from spring blossoms to fiery maple autumns.`,
    `Kyoto cuisine (Kyo-ryori) emphasizes subtle seasonal flavors, artistry, and Zen Buddhist vegetarian traditions. Essential culinary pillars include Shojin Ryori (monastic vegetarian multi-course meals featuring handmade tofu and yuba bean-curd skin), Kyo-kaiseki (seasonal imperial dining), Yudofu (hot tofu simmered in kelp broth), and Match-infused sweets like Yatsuhashi cinnamon pastry. Nishiki Market ("Kyoto's Kitchen") offers savory skewers of grilled dango, sweet tamagoyaki, and tsukemono (pickled seasonal vegetables).`
  ]);

  const kyotoId = resKyoto.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    kyotoId,
    'Fushimi Inari Shrine',
    'fushimi-inari',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1531572753322-ad063cecc140?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1528164344705-4754268799af?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Fushimi Inari-taisha is the premier Shinto shrine dedicated to Inari, the deity of rice, agriculture, business prosperity, and foxes. Situated at the base of Mount Inari, it is globally celebrated for its magical Senbon Torii—a winding tunnel of over 10,000 vivid vermilion torii gates stretching 4 kilometers up the mountain.`,
    `Founded in 711 CE by the Hata clan before Kyoto even became the national capital, Fushimi Inari grew in stature as emperors and merchants alike prayed for bountiful harvests and financial enterprise. Each torii gate lining the mountain trails was donated by a business or individual, with the donor's name and date inscribed in black kanji along the posts.`,
    JSON.stringify([
      'Senbon Torii (10,000 Vermilion Gates Pathway) creating a scarlet tunnel',
      'Kitsune (Fox Statue Messengers) carrying sacred keys, rice sheaves, or scrolls in their mouths',
      'Omokaru-ishi (Light-Heavy Stone) where visitors test if their wishes will come true easily',
      'Yotsutsuji Intersection offering breathtaking panoramic views over Kyoto city'
    ]),
    `Hiking through the vermilion gates feels like stepping into another dimension. Sunlight filters through the wooden posts creating dancing red shadows. As you climb higher past mountain tea houses, the crowds thin, leaving only the sound of mountain streams and whispering cedar trees.`
  ]);

  // --- 2. ITALY ---
  const resItaly = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Italy',
    'italy',
    '🇮🇹',
    'https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1600&auto=format&fit=crop',
    `Italy’s heritage is the cradle of Western civilization. From the mysterious Etruscans to the rise of the Roman Empire which governed the Mediterranean for centuries, Italy laid foundational legal, architectural, engineering, and linguistic systems across Europe. In the 14th century, the Italian Renaissance erupted in Florence and Venice, igniting an artistic and intellectual rebirth spearheaded by figures like Leonardo da Vinci, Michelangelo, and Galileo Galilei before national unification (Risorgimento) in 1861.`,
    JSON.stringify([
      { year: '753 BCE', event: 'Legendary founding of Rome by Romulus and Remus.' },
      { year: '27 BCE', event: 'Augustus becomes the first Roman Emperor, initiating Pax Romana.' },
      { year: '1300s CE', event: 'The Renaissance dawns in Florence, revitalizing art, science, and philosophy.' },
      { year: '1508 CE', event: 'Michelangelo begins painting the Sistine Chapel ceiling in Rome.' },
      { year: '1861 CE', event: 'The Kingdom of Italy is officially declared under King Victor Emmanuel II.' },
      { year: '1946 CE', event: 'Italy transitions to a democratic republic following a national referendum.' }
    ]),
    `Italian culture revolves around family, vibrant social life (la passeggiata evening stroll), artistic pride, and an unmatched passion for regional culinary mastery. Life moves to the rhythm of espresso breaks, lively square gatherings, and deep pride in artisanal craft—from leather working to winemaking.`,
    `La Passeggiata (evening promenade), Carnevale di Venezia masks, Palio di Siena horse races, Opera performances, August Ferragosto holidays.`,
    `Italian (Italiano), a Romance language directly descended from Latin, celebrated for its musicality and expressive hand gestures.`,
    `Featuring Rome's ancient gladiatorial Colosseum, Florence's Renaissance Duomo, Venice's winding canals, the cliffside villages of Amalfi, and the ruins of Pompeii.`
  ]);

  const italyId = resItaly.lastID;

  // Rome
  const resRome = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    italyId,
    'Rome',
    'rome',
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1600&auto=format&fit=crop',
    `Known as the "Eternal City" (La Città Eterna), Rome has stood for nearly 3,000 years. As the capital of the Roman Empire and later the heart of the Catholic Church in Vatican City, Rome boasts an extraordinary layering of ancient Roman ruins, Renaissance palaces, and Baroque fountains built directly atop one another across seven historic hills.`,
    `Situated in central Italy along the Tiber River in the Lazio region, approximately 24 kilometers inland from the Tyrrhenian Sea. Rome enjoys a warm Mediterranean climate with sunny summers, mild winters, and golden afternoon sunlight filtering through stone pine trees.`,
    `Roman gastronomy is hearty, flavorful, and deeply rooted in peasant traditions (cucina povera). World-renowned pasta dishes are anchored by four classics utilizing Pecorino Romano cheese and Guanciale (cured pork jowl): Spaghetti alla Carbonara, Cacio e Pepe, Rigatoni all'Amatrice, and Pasta alla Gricia. Street food icons include Suppli (fried risotto balls oozing with mozzarella), Pinsa Romana (crispy sourdough flatbread), and artisanal Gelato from neighborhood gelaterias.`
  ]);

  const romeId = resRome.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    romeId,
    'The Colosseum',
    'colosseum',
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1568322445389-f64ac9c556b0?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop'
    ]),
    `The Colosseum (Flavian Amphitheatre) is the largest ancient amphitheater ever constructed. Standing as an extraordinary monument to Roman engineering, it once held up to 80,000 spectators who gathered for gladiatorial contests, wild animal hunts, and dramatic mock naval battles.`,
    `Commissioned by Emperor Vespasian in 72 CE and completed by his son Titus in 80 CE using travertine stone, tuff, and brick-faced concrete. It served as Rome's central entertainment complex for over 400 years before earthquakes and stone looting transformed it into a majestic historic ruin.`,
    JSON.stringify([
      'Hypogeum subterranean network of tunnels and trapdoors for animals and gladiators',
      'Travertine Archways utilizing classical Doric, Ionic, and Corinthian order columns',
      'Arena Floor reconstruction offering a gladiator perspective',
      'Imperial Box viewing tier with dramatic vistas over the Roman Forum'
    ]),
    `Stepping inside the Colosseum evokes awe. Standing above the exposed subterranean mazes where gladiators once waited in darkness, visitors can feel the resonance of imperial history. Sunset casts a glowing ochre warmth across its tiered arches.`
  ]);

  // --- 3. EGYPT ---
  const resEgypt = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Egypt',
    'egypt',
    '🇪🇬',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop',
    `Egypt is the cradle of pharaonic civilization, boasting over 5,000 years of recorded history along the life-giving banks of the Nile River. Unified under Pharaoh Narmer around 3100 BCE, Egypt constructed monumental pyramids, developed hieroglyphic script, and pioneered medicine and astronomy. Later shaped by Greco-Roman rule under Cleopatra, Coptic Christianity, and Islamic dynasties, Egypt remains a cornerstone of world heritage.`,
    JSON.stringify([
      { year: '3100 BCE', event: 'Pharaoh Narmer unifies Upper and Lower Egypt.' },
      { year: '2560 BCE', event: 'Completion of the Great Pyramid of Giza under Pharaoh Khufu.' },
      { year: '332 BCE', event: 'Alexander the Great conquers Egypt and founds Alexandria.' },
      { year: '641 CE', event: 'Arab conquest introduces Islam and Arabic language.' },
      { year: '1922 CE', event: 'Howard Carter discovers the intact tomb of Tutankhamun in Luxor.' },
      { year: '1979 CE', event: 'Historic UNESCO designation of Ancient Thebes and Memphis.' }
    ]),
    `Egyptian culture blends ancient Nilotic traditions with warm Middle Eastern hospitality and vibrant artistic expressiveness. The concept of "Karam" (generosity) dictates guest treatment, while traditional music, Sufi whirling dance, and coffeehouse storytelling remain vibrant social pillars.`,
    `Moulid spiritual festivals, Sufi Whirling Dervish dances, Ramadan lantern (Fanous) celebrations, Henna night weddings.`,
    `Egyptian Arabic (Masri), with Classical Arabic used in official literature and Coptic in liturgical traditions.`,
    `Home to the Giza Pyramid Complex, Sphinx, Karnak Temple in Luxor, Abu Simbel, and the bustling medieval markets of Cairo.`
  ]);

  const egyptId = resEgypt.lastID;

  // Cairo
  const resCairo = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    egyptId,
    'Cairo',
    'cairo',
    'https://images.unsplash.com/photo-1572252821143-035a024857fc?q=80&w=1600&auto=format&fit=crop',
    `Cairo ("The Victorious") was founded in 969 CE by the Fatimid dynasty, though the area has been inhabited for millennia near ancient Memphis. Known affectionately as the "City of a Thousand Minarets," Cairo became a medieval intellectual center with Al-Azhar University and a crucial silk road trading hub. Today it stands as Africa's largest metropolis.`,
    `Located near the Nile Delta in northern Egypt, where the Nile river branches into two tributaries. The landscape merges fertile riverbanks with stark desert plateaus under a hot desert climate with virtually year-round sunshine.`,
    `Egyptian cuisine in Cairo is aromatic, vegetarian-friendly, and deeply comforting. The national dish is Koshary—a hearty bowl of rice, macaroni, lentils, and chickpeas smothered in spiced tomato sauce and topped with crispy fried onions. Other beloved foods include Ta'ameya (Egyptian fava-bean falafel), Ful Medames (slow-cooked fava beans with olive oil and cumin), Hawawshi (spiced minced beef stuffed in pita and baked), and sweet Konafa desserts dripped in orange-blossom syrup.`
  ]);

  const cairoId = resCairo.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    cairoId,
    'The Great Pyramids of Giza',
    'giza-pyramids',
    'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572252821143-035a024857fc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=1200&auto=format&fit=crop'
    ]),
    `The Great Pyramids of Giza are the sole surviving wonder of the Ancient Seven Wonders of the World. Standing on the Giza Plateau, this complex includes the Pyramid of Khufu, the Pyramid of Khafre, the Pyramid of Menkaure, and the iconic Great Sphinx.`,
    `Constructed around 2560 BCE during the Fourth Dynasty of the Old Kingdom as monumental royal tombs. Built using over 2.3 million limestone blocks weighing 2 to 15 tons each, their mathematical alignment to cardinal directions demonstrates peerless astronomical and engineering genius.`,
    JSON.stringify([
      'Pyramid of Khufu standing 138.8 meters tall',
      'The Great Sphinx carved out of a single monolithic limestone ridge',
      'Grand Gallery and King’s Chamber interior granite passages',
      'Solar Boat Museum housing Pharaoh Khufu’s excavated wooden cedar vessel'
    ]),
    `Gazing at the Pyramids across the golden desert dunes is unforgettable. As the sun sets, the ancient stones shift from pale yellow to deep amber, while sound & light shows tell the 4,500-year-old tale of the pharaohs.`
  ]);


  // --- FRANCE ---
  const resFrance = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'France',
    'france',
    '🇫🇷',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop',
    `France's story spans Roman Gaul, the Frankish kingdoms of Charlemagne, and the glittering absolutism of Versailles, before the 1789 Revolution reshaped the modern world with ideals of liberty, equality, and fraternity. Napoleon's empire, the Belle Époque's artistic explosion, and two World Wars forged a nation that remains a global capital of art, philosophy, gastronomy, and fashion.`,
    JSON.stringify([
      { year: '58 BCE', event: 'Julius Caesar begins the Roman conquest of Gaul.' },
      { year: '800 CE', event: 'Charlemagne is crowned Holy Roman Emperor in Rome.' },
      { year: '1789 CE', event: 'The French Revolution topples the monarchy at the Bastille.' },
      { year: '1889 CE', event: 'The Eiffel Tower is completed for the World’s Fair.' },
      { year: '1944 CE', event: 'Paris is liberated from wartime occupation.' },
      { year: '1957 CE', event: 'France co-founds the European Economic Community in Rome.' }
    ]),
    `French culture prizes intellectual debate, culinary artistry, and a deep reverence for beauty in everyday life, from the ritual of a café terrace to the choreography of a Michelin kitchen. Art de vivre shapes daily routines, seasonal markets, and unhurried Sunday lunches with family.`,
    `Bastille Day fireworks, Cannes Film Festival, Beaujolais Nouveau wine releases, Christmas Marchés de Noël, Tour de France cycling celebrations.`,
    `French (Français), a Romance language and the official tongue of diplomacy for centuries, rich in regional dialects like Provençal and Breton.`,
    `From the Eiffel Tower and Louvre in Paris to the lavender fields of Provence, the French Riviera coastline, and the fairy-tale châteaux of the Loire Valley.`
  ]);

  const franceId = resFrance.lastID;

  // Paris
  const resFranceParis = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    franceId,
    'Paris',
    'paris',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop',
    `Founded by the Celtic Parisii tribe on the Île de la Cité over 2,000 years ago, Paris grew into the seat of French kings and, after 1789, the crucible of revolution. Baron Haussmann's 19th-century redesign gave the city its iconic boulevards, while the Belle Époque crowned it the world's capital of art and ideas.`,
    `Situated in north-central France along the Seine River, spread across the Île-de-France region with a temperate oceanic climate of mild summers and cool, misty winters.`,
    `Parisian dining ranges from flaky croissants and buttery pain au chocolat at neighborhood boulangeries to refined bistro classics like Steak Frites, Coq au Vin, and French Onion Soup. Patisserie windows overflow with macarons, éclairs, and mille-feuille, while wine bars pour regional Bordeaux and Burgundy alongside plates of artisanal cheese and charcuterie.`
  ]);

  const parisId = resFranceParis.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    parisId,
    'Eiffel Tower',
    'eiffel-tower',
    'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541171781670-807083f28ba9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520939817895-152fca6c5dbc?q=80&w=1200&auto=format&fit=crop'
    ]),
    `The Eiffel Tower is the wrought-iron emblem of Paris, rising 330 meters above the Champ de Mars. Designed as a temporary marvel, it has become the most visited paid monument on Earth and a beacon of French engineering ambition.`,
    `Engineered by Gustave Eiffel for the 1889 Exposition Universelle marking the centennial of the French Revolution, the tower faced fierce criticism from artists who called it an eyesore. It was nearly dismantled in 1909 but was spared thanks to its usefulness as a radio transmission antenna.`,
    JSON.stringify([
      'Summit observation deck offering panoramic views up to 70 kilometers',
      'Champagne bar on the third level for sunset toasts above the city',
      'Nightly light show sparkling with 20,000 bulbs every hour after dusk',
      'Gustave Eiffel’s restored private apartment on the top floor'
    ]),
    `Riding the glass-floored elevator through the lattice ironwork builds anticipation before Paris unfolds beneath you in every direction. As evening falls, the tower shifts from golden sunset silhouette to a shimmering beacon, best admired from the lawns of Trocadéro.`
  ]);

  // Nice
  const resFranceNice = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    franceId,
    'Nice',
    'nice',
    'https://images.unsplash.com/photo-1531572753322-ad063cecc140?q=80&w=1600&auto=format&fit=crop',
    `Founded by Greek settlers from Marseille around 350 BCE and named Nikaia after the goddess of victory, Nice passed through Roman, Savoyard, and Italian rule before joining France in 1860. Its Promenade des Anglais was built in the 1820s for wintering English aristocrats seeking Riviera sunshine.`,
    `Perched on the French Riviera along the Baie des Anges in southeastern France, backed by the foothills of the Alps with a sunny Mediterranean climate year-round.`,
    `Niçoise cuisine blends French and Italian influences: Salade Niçoise with olives and anchovies, Socca chickpea flatbread grilled street-side, Pissaladière onion tart, and fresh Mediterranean seafood paired with crisp Provençal rosé.`
  ]);

  const niceId = resFranceNice.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    niceId,
    'Promenade des Anglais',
    'promenade-des-anglais',
    'https://images.unsplash.com/photo-1491166617655-0723a0999cfc?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?q=80&w=1200&auto=format&fit=crop'
    ]),
    `This sweeping seafront promenade curves for seven kilometers along the turquoise Baie des Anges, lined with palm trees, Belle Époque façades, and the famous blue chairs facing the Mediterranean.`,
    `Commissioned in 1820 by Reverend Lewis Way and funded by the English community wintering in Nice, the path was originally a modest walkway for genteel strolls before growing into the grand boulevard seen today.`,
    JSON.stringify([
      'Iconic blue chairs facing the Mediterranean for people-watching',
      'Belle Époque landmarks including the Hôtel Negresco',
      'Pebble beaches with crystal-clear swimming coves',
      'Vélo Bleu cycling paths stretching toward Villefranche-sur-Mer'
    ]),
    `Cycling or strolling the promenade at golden hour, with the Alps behind and the sea ahead, captures the timeless glamour that drew painters like Matisse to make Nice their home.`
  ]);

  // --- GREECE ---
  const resGreece = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Greece',
    'greece',
    '🇬🇷',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1600&auto=format&fit=crop',
    `Greece is the birthplace of Western philosophy, democracy, and theater, flourishing through the Mycenaean, Classical, and Hellenistic ages before Roman and Byzantine rule. Ottoman occupation gave way to independence in 1830, and the nation's ancient ruins, island villages, and Orthodox traditions continue to shape a proud modern identity.`,
    JSON.stringify([
      { year: '776 BCE', event: 'The first Olympic Games are held at Olympia.' },
      { year: '508 BCE', event: 'Athens establishes the world’s first democracy.' },
      { year: '447 BCE', event: 'Construction begins on the Parthenon atop the Acropolis.' },
      { year: '330 BCE', event: 'Alexander the Great spreads Hellenistic culture across three continents.' },
      { year: '1830 CE', event: 'Greece gains independence after the Ottoman era.' },
      { year: '2004 CE', event: 'Athens hosts the Summer Olympics, returning the Games to their birthplace.' }
    ]),
    `Greek culture is anchored in Filoxenia (sacred hospitality), lively taverna gatherings, and Orthodox Christian rhythms that mark the calendar with feast days and name-day celebrations. Island life moves to a slower rhythm of fishing, siestas, and sunset ouzo with neighbors.`,
    `Orthodox Easter candlelight processions, Greek Independence Day parades, Panigyri village festivals with folk dancing, Meze sharing-plate dining culture.`,
    `Greek (Ελληνικά), one of the world's oldest recorded languages, still using its original alphabet that gave rise to Latin and Cyrillic scripts.`,
    `Home to the Acropolis and Parthenon in Athens, the whitewashed cliffs of Santorini, the ancient oracle at Delphi, and the sun-drenched beaches of the Cyclades.`
  ]);

  const greeceId = resGreece.lastID;

  // Athens
  const resGreeceAthens = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    greeceId,
    'Athens',
    'athens',
    'https://images.unsplash.com/photo-1568322445389-f64ac9c556b0?q=80&w=1600&auto=format&fit=crop',
    `Continuously inhabited for over 3,400 years, Athens gave the world democracy, philosophy through Socrates and Plato, and dramatic arts under Sophocles. Golden Age monuments built under Pericles still crown the Acropolis, surviving centuries of conquest to anchor the modern Greek capital.`,
    `Located in the Attica basin of central Greece, ringed by the Hymettus, Pentelicus, and Parnitha mountains, with a hot-summer Mediterranean climate and views to the Saronic Gulf.`,
    `Athenian tables celebrate Souvlaki skewers, creamy Tzatziki, flaky Spanakopita spinach pie, and slow-roasted Moussaka layered with eggplant and béchamel. Neighborhood tavernas serve family-style Meze with grilled octopus, fava purée, and glasses of resin-scented Retsina wine.`
  ]);

  const athensId = resGreeceAthens.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    athensId,
    'The Acropolis & Parthenon',
    'acropolis-parthenon',
    'https://images.unsplash.com/photo-1555993539-1732b0258235?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500920571542-3b1b1e2b0c37?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1496947850313-7743325fa58c?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Crowning a rocky outcrop 150 meters above Athens, the Acropolis is the sacred citadel of ancient Greece, its centerpiece the Parthenon temple dedicated to the goddess Athena, patron of the city.`,
    `Built between 447 and 438 BCE under the statesman Pericles and the sculptor Phidias, the Parthenon celebrated Athens' victory over Persia. It survived millennia as a temple, church, and mosque before a 1687 gunpowder explosion damaged its structure, sparking ongoing restoration.`,
    JSON.stringify([
      'Parthenon’s Doric columns showcasing subtle architectural curvature for optical perfection',
      'Erechtheion temple with its six sculpted Caryatid maidens',
      'Propylaea monumental gateway framing the ascent to the summit',
      'Acropolis Museum displaying original friezes and sculptures at the base of the hill'
    ]),
    `Climbing the worn marble steps at sunrise, before the crowds arrive, reveals the Parthenon glowing amber against a brightening sky, with the entire city and distant Aegean Sea spread out below.`
  ]);

  // Santorini
  const resGreeceSantorini = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    greeceId,
    'Santorini',
    'santorini',
    'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?q=80&w=1600&auto=format&fit=crop',
    `Santorini's crescent shape is the scar of one of history's largest volcanic eruptions around 1600 BCE, which buried the Minoan settlement of Akrotiri in ash and may have inspired the legend of Atlantis. Rebuilt by Venetians, Ottomans, and Cycladic islanders, its caldera villages now epitomize Greek island beauty.`,
    `Located in the southern Aegean Sea within the Cyclades archipelago, Santorini rings a volcanic caldera with dramatic cliffs, black-sand beaches, and a dry Mediterranean climate.`,
    `Volcanic soil gives Santorini's cuisine standout ingredients: sweet cherry tomatoes, capers, and Fava yellow split-pea purée. Visitors savor Tomatokeftedes (tomato fritters), fresh grilled fish, and crisp Assyrtiko white wine grown in low, basket-shaped vines that shield grapes from island winds.`
  ]);

  const santoriniId = resGreeceSantorini.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    santoriniId,
    'Oia Village',
    'oia-village',
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Oia is Santorini's postcard village, its whitewashed cave houses and blue-domed churches cascading down caldera cliffs toward the sparkling Aegean, famed as one of the world's most photographed sunset spots.`,
    `Rebuilt after the devastating 1956 earthquake that leveled much of the island, Oia's captains' mansions and cliffside cave dwellings were carefully restored, transforming a once-quiet fishing village into an icon of Cycladic architecture.`,
    JSON.stringify([
      'Blue-domed churches overlooking the volcanic caldera',
      'Castle ruins offering the island’s most celebrated sunset viewpoint',
      'Narrow marble-paved lanes lined with art galleries and jewelry shops',
      'Ammoudi Bay’s tavernas at the base of 300 cliffside steps'
    ]),
    `Each evening, visitors gather along Oia's cliffside paths as the sun sinks into the caldera, painting the whitewashed walls in shades of pink and gold—a ritual as beloved today as it was decades ago.`
  ]);

  // --- PERU ---
  const resPeru = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Peru',
    'peru',
    '🇵🇪',
    'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1600&auto=format&fit=crop',
    `Peru cradled the mighty Inca Empire, the largest pre-Columbian civilization in the Americas, whose road networks and stonework linked the Andes from Ecuador to Chile. Spanish conquest in 1532 toppled the Inca and forged a colonial capital in Lima, while ancient traditions of the Quechua and Aymara peoples endure across the highlands today.`,
    JSON.stringify([
      { year: '1200 CE', event: 'The Kingdom of Cusco is founded, seeding the future Inca Empire.' },
      { year: '1450 CE', event: 'Machu Picchu is constructed as a royal Inca estate.' },
      { year: '1532 CE', event: 'Francisco Pizarro captures the Inca emperor Atahualpa.' },
      { year: '1535 CE', event: 'Lima is founded as the "City of Kings."' },
      { year: '1821 CE', event: 'Peru declares independence from Spain.' },
      { year: '1911 CE', event: 'Hiram Bingham brings global attention to Machu Picchu.' }
    ]),
    `Peruvian culture weaves Andean, Spanish, and Amazonian threads together through vibrant textiles, Pachamama earth-reverence rituals, and a globally celebrated culinary renaissance. Community minga labor traditions and colorful festivals keep highland customs alive alongside coastal cosmopolitan life.`,
    `Inti Raymi Sun Festival in Cusco, Corpus Christi processions, Andean weaving ceremonies, Marinera dance competitions, Pachamanca earth-oven feasts.`,
    `Spanish is the official language, spoken alongside Quechua and Aymara, the ancestral tongues of the Inca and Andean highland communities.`,
    `Home to the lost Inca citadel of Machu Picchu, the colonial heart of Lima, the Sacred Valley of Cusco, and the mysterious Nazca Lines etched into the desert.`
  ]);

  const peruId = resPeru.lastID;

  // Lima
  const resPeruLima = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    peruId,
    'Lima',
    'lima',
    'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop',
    `Founded in 1535 by conquistador Francisco Pizarro as the "City of Kings," Lima became the seat of Spanish viceregal power over most of South America. Its historic center preserves ornate colonial churches and balconied mansions, now a UNESCO World Heritage site overlooking the Pacific.`,
    `Situated on Peru's arid Pacific coast within the Rímac River valley, Lima enjoys a mild desert climate with a near-permanent gray coastal mist known locally as the garúa.`,
    `Lima is the epicenter of Peru's world-renowned cuisine: citrus-cured Ceviche, hearty Lomo Saltado stir-fry blending Chinese and Creole flavors, and Anticuchos grilled skewers. The city's Nikkei fusion restaurants, born from Japanese immigration, have earned Lima a reputation as a global gastronomic capital.`
  ]);

  const limaId = resPeruLima.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    limaId,
    'Historic Centre of Lima',
    'historic-centre-lima',
    'https://images.unsplash.com/photo-1531968455001-5c5272a41129?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544918877-7db2fbb27f83?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580881855537-7cd1d0d1e3cf?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Lima's Historic Centre gathers the Plaza Mayor, Government Palace, and Cathedral within a grid of colonial streets adorned with carved wooden balconies, a living record of Spain's 16th-century viceregal ambitions.`,
    `Laid out by Francisco Pizarro in 1535 following Spanish colonial city planning, the district grew as the political and religious hub of the Viceroyalty of Peru, surviving earthquakes and reconstruction to retain its Baroque and Neoclassical facades.`,
    JSON.stringify([
      'Plaza Mayor framed by the Government Palace and Lima Cathedral',
      'Basilica and Convent of San Francisco with catacombs and Mudéjar architecture',
      'Ornate carved wooden balconies unique to colonial Lima mansions',
      'Casa de Aliaga, one of the oldest continuously inhabited colonial homes in the Americas'
    ]),
    `Wandering the Historic Centre's plazas at dusk, as church bells echo and balconies glow under streetlights, offers a vivid sense of Lima's layered colonial and republican past.`
  ]);

  // Cusco
  const resPeruCusco = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    peruId,
    'Cusco',
    'cusco',
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1600&auto=format&fit=crop',
    `Once the sacred capital of the Inca Empire, Cusco ("navel of the world" in Quechua) was laid out in the shape of a puma under Emperor Pachacuti. Spanish conquistadors built colonial churches atop precise Inca stone foundations, creating the striking architectural fusion visible throughout the city today.`,
    `Nestled in a valley of the Peruvian Andes at 3,400 meters elevation, Cusco serves as the gateway to the Sacred Valley and Machu Picchu, with a dry season of crisp sunny days and cold nights.`,
    `Andean Cusco cuisine centers on Cuy (roasted guinea pig), hearty Chairo potato and lamb soup, and Rocoto Relleno stuffed peppers. Coca leaf tea is a staple for altitude acclimatization, while chicha morada purple corn drink accompanies most highland meals.`
  ]);

  const cuscoId = resPeruCusco.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    cuscoId,
    'Machu Picchu',
    'machu-picchu',
    'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580881855537-7cd1d0d1e3cf?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Perched on a ridge 2,430 meters above the Urubamba River, Machu Picchu is the best-preserved Inca citadel on Earth, its terraces and temples wrapped in cloud forest mist and framed by jagged Andean peaks.`,
    `Built around 1450 CE as a royal estate for Emperor Pachacuti, Machu Picchu was abandoned during the Spanish conquest and never discovered by colonizers. It lay hidden until 1911, when local guides led American historian Hiram Bingham to the overgrown ruins, launching global fascination.`,
    JSON.stringify([
      'Intihuatana ritual stone aligned precisely with the sun for astronomical ceremonies',
      'Temple of the Sun built upon natural bedrock with trapezoidal Inca windows',
      'Agricultural terraces engineered to prevent erosion and maximize crop yield',
      'Huayna Picchu peak trail offering a bird’s-eye view of the entire citadel'
    ]),
    `Arriving at the Sun Gate as morning mist lifts off the ruins reveals Machu Picchu in stages—first shadows, then stone, then the full sweep of terraces against the Andes, a moment trekkers describe as life-changing.`
  ]);




  // --- PAKISTAN ---
  const resPakistan = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Pakistan',
    'pakistan',
    '🇵🇰',
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1600&auto=format&fit=crop',
    `Pakistan's land holds one of humanity's oldest urban civilizations, the Bronze Age Indus Valley Civilisation at Mohenjo-daro and Harappa, followed by Gandhara Buddhist culture, Mughal splendor, and British colonial rule. Founded in 1947 as an independent homeland during the Partition of British India, Pakistan blends ancient Indus heritage with Islamic art, Sufi tradition, and vibrant regional cultures across Punjab, Sindh, Khyber Pakhtunkhwa, and Balochistan.`,
    JSON.stringify([
      { year: '2500 BCE', event: 'The Indus Valley Civilisation flourishes at Mohenjo-daro and Harappa.' },
      { year: '711 CE', event: 'Muhammad bin Qasim brings Islam to the Sindh region.' },
      { year: '1524 CE', event: 'Lahore becomes a key Mughal imperial city.' },
      { year: '1947 CE', event: 'Pakistan gains independence during the Partition of British India.' }
    ]),
    `Pakistani culture is rooted in warm hospitality, Sufi poetry and music, vivid truck art, and a deep sense of regional pride expressed through Punjabi, Sindhi, Pashtun, and Baloch traditions. Family gatherings, generous mehmaan-nawazi (hospitality), and devotional qawwali evenings shape everyday life.`,
    `Eid celebrations, Basant kite festival, Sufi shrine devotional gatherings, Independence Day parades, traditional wedding mehndi ceremonies.`,
    `Urdu is the national language, alongside regional languages including Punjabi, Sindhi, Pashto, and Balochi.`,
    `Home to the Mughal-era Badshahi Mosque and Lahore Fort, the modern capital of Islamabad framed by the Margalla Hills, and the ancient ruins of Mohenjo-daro.`
  ]);

  const pakistanId = resPakistan.lastID;

  // Lahore
  const resPakistanLahore = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    pakistanId,
    'Lahore',
    'lahore',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1600&auto=format&fit=crop',
    `Lahore, Pakistan's cultural heart, rose to prominence as a Mughal capital under Akbar and Jahangir, who filled the city with mosques, gardens, and forts. Layers of Sikh and British rule followed, but Lahore's Old City still beats with the rhythm of the Mughal empire that once ruled from its walls.`,
    `Located in the Punjab province of eastern Pakistan near the Indian border, along the Ravi River, with a hot semi-arid climate of scorching summers and cool, foggy winters.`,
    `Lahore is Pakistan's food capital: smoky Seekh Kebabs and Chargha roast chicken from Gawalmandi's food street, buttery Nihari slow-cooked overnight, stuffed Lahori Chaat, and fragrant Biryani. Street vendors serve sugarcane juice and kulfi falooda to cool down from the heat.`
  ]);

  const pakistanlahoreId = resPakistanLahore.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    pakistanlahoreId,
    'Badshahi Mosque',
    'badshahi-mosque',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578637387939-43c525550085?q=80&w=1200&auto=format&fit=crop'
    ]),
    `The Badshahi Mosque is one of the world's largest mosques, its red sandstone courtyard and three marble domes standing as a monument to Mughal architectural grandeur beside the historic Lahore Fort.`,
    `Commissioned in 1673 by Mughal Emperor Aurangzeb, the mosque was built to be the grandest in the empire, capable of holding tens of thousands of worshippers. It later served as a garrison under Sikh rule before being restored to its religious purpose.`,
    JSON.stringify([
      'Vast courtyard accommodating over 55,000 worshippers',
      'Intricate marble inlay and fresco work in Mughal style',
      'Four towering minarets marking each courtyard corner',
      'Adjacent Lahore Fort and Alamgiri Gate views'
    ]),
    `Standing in the mosque's immense courtyard at sunset, as the call to prayer echoes and the marble domes glow pink, offers a powerful sense of the scale and devotion of Mughal-era Lahore.`
  ]);

  // Islamabad
  const resPakistanIslamabad = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    pakistanId,
    'Islamabad',
    'islamabad',
    'https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=1600&auto=format&fit=crop',
    `Purpose-built in the 1960s to replace Karachi as Pakistan's capital, Islamabad was master-planned by Greek architect Constantinos Doxiadis as a modern, orderly city framed by the Margalla Hills, blending contemporary urban design with green spaces and national monuments.`,
    `Situated in northern Pakistan at the foot of the Margalla Hills within the Pothohar Plateau, Islamabad enjoys a milder climate than much of the country, with monsoon rains and cool winters.`,
    `Islamabad's dining scene ranges from Peshawari-style Chapli Kebab and creamy Karahi to Kashmiri pink tea (Noon Chai) in the hillside cafes of Daman-e-Koh, alongside modern fusion restaurants serving both local and international flavors.`
  ]);

  const pakistanislamabadId = resPakistanIslamabad.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    pakistanislamabadId,
    'Faisal Mosque',
    'faisal-mosque',
    'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1528164344705-4754268799af?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Faisal Mosque is one of the largest mosques in the world, its striking Bedouin tent-inspired design departing from traditional domed architecture, set dramatically against the backdrop of the Margalla Hills.`,
    `Designed by Turkish architect Vedat Dalokay and completed in 1986, the mosque was funded by Saudi Arabia's King Faisal, after whom it is named, and remains a symbol of modern Islamic architecture merging contemporary form with spiritual purpose.`,
    JSON.stringify([
      'Striking triangular prayer hall inspired by a Bedouin tent',
      'Four 90-meter minarets framing the structure',
      'Sweeping views over Islamabad from the Margalla foothills',
      'Tomb of General Zia-ul-Haq within the mosque grounds'
    ]),
    `Approaching the mosque at dusk, its white marble silhouette lit against the darkening Margalla Hills, visitors describe a striking sense of modern serenity distinct from Pakistan's older Mughal monuments.`
  ]);

  // --- CHINA ---
  const resChina = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'China',
    'china',
    '🇨🇳',
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=1600&auto=format&fit=crop',
    `China's civilization stretches back over 4,000 years through successive dynasties—Han, Tang, Song, Ming, and Qing—that gave the world the Great Wall, the Forbidden City, silk, paper, and gunpowder. From imperial glory through the 20th century's revolutions to today's economic rise, China's history is among the longest continuous civilizations on Earth.`,
    JSON.stringify([
      { year: '221 BCE', event: 'Qin Shi Huang unifies China and begins the Great Wall.' },
      { year: '618 CE', event: 'The Tang Dynasty ushers in a golden age of art and trade.' },
      { year: '1420 CE', event: 'The Forbidden City is completed as the imperial palace in Beijing.' },
      { year: '1949 CE', event: 'The People’s Republic of China is founded.' }
    ]),
    `Chinese culture is shaped by Confucian values of respect and harmony, Taoist philosophy, and millennia of artistic tradition in calligraphy, silk painting, and opera. Family reverence, tea ceremonies, and the lunar calendar's festivals anchor daily and seasonal life.`,
    `Chinese New Year with dragon dances and red lanterns, Mid-Autumn Festival mooncake sharing, Dragon Boat Festival races, traditional tea ceremony rituals.`,
    `Mandarin Chinese (Putonghua) is the official language, written with one of the world's oldest continuously used writing systems.`,
    `Home to the Great Wall of China, the Forbidden City and Temple of Heaven in Beijing, and the futuristic skyline of Shanghai's Bund.`
  ]);

  const chinaId = resChina.lastID;

  // Beijing
  const resChinaBeijing = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    chinaId,
    'Beijing',
    'beijing',
    'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=1600&auto=format&fit=crop',
    `Beijing has served as China's imperial and political capital for over 800 years, seat of the Yuan, Ming, and Qing dynasties. The Forbidden City stood as the world's largest palace complex and the sacred center of Chinese imperial power for five centuries.`,
    `Located in northern China on the North China Plain, ringed by mountains to the north and west, Beijing has a monsoon-influenced climate with hot summers and cold, dry winters.`,
    `Beijing's signature dish is Peking Duck, its lacquered skin carved tableside and wrapped in thin pancakes with scallion and hoisin sauce. Street food stalls serve Jianbing savory crepes, hand-pulled noodles, and skewered candied hawthorn (tanghulu).`
  ]);

  const chinabeijingId = resChinaBeijing.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    chinabeijingId,
    'The Great Wall of China',
    'great-wall-of-china',
    'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Snaking across mountain ridges for thousands of kilometers, the Great Wall is humanity's most monumental fortification, built and rebuilt over two millennia to defend China's northern frontier.`,
    `Begun under Emperor Qin Shi Huang around 221 BCE by connecting earlier state walls, the wall reached its most iconic form during the Ming Dynasty (1368-1644), when brick and stone sections like Badaling and Mutianyu were constructed near Beijing.`,
    JSON.stringify([
      'Badaling section, the most visited and well-restored stretch',
      'Watchtowers spaced along the ridge for signal-fire communication',
      'Mutianyu section offering cable car access and fewer crowds',
      'Sweeping mountain views along the wall’s undulating path'
    ]),
    `Walking the steep stone steps as the wall disappears into misty mountain ridges in both directions gives a visceral sense of the scale of ambition behind this 2,000-year-old defensive marvel.`
  ]);

  // Shanghai
  const resChinaShanghai = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    chinaId,
    'Shanghai',
    'shanghai',
    'https://images.unsplash.com/photo-1544918877-7db2fbb27f83?q=80&w=1600&auto=format&fit=crop',
    `Shanghai transformed from a fishing village into a treaty port after the 1842 Opium War, growing into a cosmopolitan hub of foreign concessions, jazz clubs, and trade. Since the 1990s, it has rocketed into one of the world's most futuristic skylines across the Huangpu River in Pudong.`,
    `Located on China's central eastern coast at the mouth of the Yangtze River, Shanghai has a humid subtropical climate with hot summers and mild, damp winters.`,
    `Shanghai cuisine is known for Xiaolongbao soup dumplings, sweet-savory Hongshao Rou braised pork belly, and delicate Shengjianbao pan-fried buns. The city's food scene spans century-old teahouses to some of Asia's most innovative modern restaurants.`
  ]);

  const chinashanghaiId = resChinaShanghai.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    chinashanghaiId,
    'The Bund',
    'the-bund',
    'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1200&auto=format&fit=crop'
    ]),
    `The Bund is Shanghai's iconic waterfront promenade, where colonial-era European facades face off against the futuristic Pudong skyline and its needle-topped Oriental Pearl Tower across the Huangpu River.`,
    `Developed as the financial heart of Shanghai's foreign concessions in the 19th and early 20th centuries, the Bund's Beaux-Arts and Art Deco buildings once housed international banks and trading houses, preserved today as a striking historical counterpoint to modern Pudong.`,
    JSON.stringify([
      'Row of preserved colonial-era Beaux-Arts and Art Deco buildings',
      'Panoramic views of the Pudong skyline and Oriental Pearl Tower',
      'Riverside promenade popular for evening walks and photography',
      'Illuminated night skyline considered among the world’s most dramatic'
    ]),
    `Standing on the Bund at night, with colonial facades lit warmly behind you and Pudong's neon towers blazing across the river, crystallizes Shanghai's identity as a city bridging two centuries.`
  ]);

  // --- INDIA ---
  const resIndia = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'India',
    'india',
    '🇮🇳',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop',
    `India's history spans the Indus Valley Civilisation, the Maurya and Gupta golden ages, centuries of Mughal rule that produced the Taj Mahal, and British colonial rule ending in 1947 independence led by Mahatma Gandhi's nonviolent movement. Today it is the world's most populous democracy and a civilizational mosaic of languages, faiths, and traditions.`,
    JSON.stringify([
      { year: '2500 BCE', event: 'The Indus Valley Civilisation thrives across the northwest subcontinent.' },
      { year: '320 CE', event: 'The Gupta Empire ushers in a golden age of science and art.' },
      { year: '1653 CE', event: 'The Taj Mahal is completed in Agra under Shah Jahan.' },
      { year: '1947 CE', event: 'India gains independence under Mahatma Gandhi’s leadership.' }
    ]),
    `Indian culture is a vast tapestry of religions, languages, and regional traditions united by shared values of family, hospitality (Atithi Devo Bhava), and spiritual diversity spanning Hinduism, Islam, Sikhism, Buddhism, and more. Classical dance, Bollywood cinema, and vibrant festivals color everyday life.`,
    `Diwali festival of lights, Holi color festival, elaborate Indian wedding ceremonies, classical dance forms like Bharatanatyam and Kathak.`,
    `Hindi and English are official languages at the national level, alongside 21 other officially recognized regional languages including Bengali, Tamil, and Punjabi.`,
    `Home to the Taj Mahal in Agra, Delhi's Red Fort and India Gate, the palaces of Rajasthan, and the backwaters of Kerala.`
  ]);

  const indiaId = resIndia.lastID;

  // Agra
  const resIndiaAgra = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    indiaId,
    'Agra',
    'agra',
    'https://images.unsplash.com/photo-1580881855537-7cd1d0d1e3cf?q=80&w=1600&auto=format&fit=crop',
    `Agra rose to prominence as a Mughal capital under Akbar in the 16th century, becoming the empire's cultural and architectural showcase. Shah Jahan's grief for his wife Mumtaz Mahal produced the Taj Mahal, cementing Agra's place as home to one of humanity's greatest monuments.`,
    `Located in the northern Indian state of Uttar Pradesh on the banks of the Yamuna River, Agra has a hot semi-arid climate with scorching summers and cool winters ideal for sightseeing.`,
    `Agra is famed for Petha, a translucent candied pumpkin sweet, alongside rich Mughlai dishes like Korma and Bedai (spiced fried bread) served with tangy potato curry for breakfast.`
  ]);

  const indiaagraId = resIndiaAgra.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    indiaagraId,
    'Taj Mahal',
    'taj-mahal',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop'
    ]),
    `The Taj Mahal is the crown jewel of Mughal architecture, a luminous white marble mausoleum on the Yamuna River regarded as one of the most beautiful buildings ever constructed and a UNESCO World Heritage Site.`,
    `Commissioned in 1632 by Emperor Shah Jahan as a mausoleum for his beloved wife Mumtaz Mahal, who died in childbirth, the Taj Mahal took over 20,000 artisans and 22 years to complete, symbolizing eternal love across Mughal history.`,
    JSON.stringify([
      'Perfectly symmetrical white marble dome and minarets',
      'Intricate pietra dura inlay work with semi-precious stones',
      'Reflecting pool creating a mirrored view of the monument',
      'Changing marble hues from pink dawn to golden sunset'
    ]),
    `Arriving at sunrise as mist lifts off the reflecting pool, the Taj Mahal's marble glows soft pink before turning brilliant white—a moment visitors consistently describe as breathtaking beyond photographs.`
  ]);

  // Delhi
  const resIndiaDelhi = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    indiaId,
    'Delhi',
    'delhi',
    'https://images.unsplash.com/photo-1520939817895-152fca6c5dbc?q=80&w=1600&auto=format&fit=crop',
    `Delhi has served as the seat of empires for over a millennium, from the Delhi Sultanate through the Mughals to the British Raj, each leaving architectural legacies from the Red Fort to colonial New Delhi designed by Edwin Lutyens. Modern Delhi is India's political capital and a living museum of layered history.`,
    `Located in northern India along the Yamuna River, Delhi has a humid subtropical climate with intensely hot summers, a monsoon season, and cool, foggy winters.`,
    `Delhi's street food is legendary: crispy Golgappa (pani puri), spiced Chole Bhature, kebabs from Old Delhi's Jama Masjid lanes, and rich Butter Chicken invented in the city's Moti Mahal restaurant.`
  ]);

  const indiadelhiId = resIndiaDelhi.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    indiadelhiId,
    'Red Fort',
    'red-fort',
    'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520939817895-152fca6c5dbc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=1200&auto=format&fit=crop'
    ]),
    `The Red Fort's massive red sandstone walls enclosed the seat of Mughal power for over 200 years, and today its ramparts host India's Independence Day flag-raising ceremony each August.`,
    `Built by Emperor Shah Jahan starting in 1638 as the fortified palace of the new Mughal capital Shahjahanabad, the Red Fort blended Persian, Timurid, and Indian architectural traditions until British forces seized and repurposed it after 1857.`,
    JSON.stringify([
      'Lahori Gate, the ceremonial main entrance and flag-raising site',
      'Diwan-i-Aam and Diwan-i-Khas halls of public and private audience',
      'Intricate marble inlay work in the imperial apartments',
      'Chatta Chowk covered bazaar leading to the fort entrance'
    ]),
    `Walking through Lahori Gate into the fort's sprawling courtyards, where marble pavilions once hosted emperors, offers a tangible connection to over three centuries of Indian history.`
  ]);

  // --- UNITED STATES ---
  const resUSA = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'United States',
    'united-states',
    '🇺🇸',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1600&auto=format&fit=crop',
    `From thirteen British colonies to a global superpower, the United States was forged through revolution in 1776, westward expansion, a defining Civil War over slavery, and 20th-century leadership through two World Wars. Its history is one of continual reinvention, immigration, and the ongoing pursuit of the ideals in its founding documents.`,
    JSON.stringify([
      { year: '1776 CE', event: 'The Declaration of Independence is signed in Philadelphia.' },
      { year: '1865 CE', event: 'The Civil War ends and slavery is abolished nationwide.' },
      { year: '1886 CE', event: 'The Statue of Liberty is dedicated in New York Harbor.' },
      { year: '1969 CE', event: 'Apollo 11 lands the first humans on the Moon.' }
    ]),
    `American culture is defined by its immigrant mosaic, entrepreneurial spirit, and regional diversity—from Southern hospitality to West Coast innovation. Baseball, jazz, Hollywood cinema, and a strong tradition of individual liberty and civic celebration shape national identity.`,
    `Fourth of July fireworks celebrating independence, Thanksgiving family feasts, Super Bowl Sunday, Broadway theater tradition.`,
    `English is the de facto national language, with Spanish widely spoken and no official language designated at the federal level.`,
    `Home to the Statue of Liberty and Times Square in New York, the Hollywood sign in Los Angeles, and countless national parks and monuments.`
  ]);

  const usaId = resUSA.lastID;

  // New York City
  const resUSANewYorkCity = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    usaId,
    'New York City',
    'new-york-city',
    'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?q=80&w=1600&auto=format&fit=crop',
    `Founded as the Dutch trading post of New Amsterdam in 1624 before becoming British New York, the city grew into America's largest metropolis and premier gateway for immigrants arriving through Ellis Island beneath the gaze of the Statue of Liberty.`,
    `Located on the northeastern Atlantic coast of the United States at the mouth of the Hudson River, New York City has a humid continental climate with hot summers and cold, snowy winters.`,
    `New York's food culture is legendary: foldable dollar pizza slices, towering pastrami sandwiches from Katz's Delicatessen, bagels with lox, and an endless diversity of global cuisines reflecting the city's immigrant history.`
  ]);

  const usanewyorkcityId = resUSANewYorkCity.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    usanewyorkcityId,
    'Statue of Liberty',
    'statue-of-liberty',
    'https://images.unsplash.com/photo-1508433957232-3107f5fd5995?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Standing on Liberty Island in New York Harbor, the Statue of Liberty has welcomed immigrants and visitors since 1886, her torch raised as an enduring symbol of freedom and opportunity.`,
    `A gift from France to commemorate the centennial of American independence, the statue was designed by sculptor Frédéric Auguste Bartholdi with an iron framework by Gustave Eiffel, and dedicated on October 28, 1886.`,
    JSON.stringify([
      'Crown observation deck offering harbor and skyline views',
      'Torch symbolizing enlightenment, though closed to public access',
      'Pedestal museum detailing the statue’s construction and history',
      'Ellis Island immigration museum accessible by the same ferry'
    ]),
    `Approaching by ferry as the statue grows from a distant silhouette to a towering copper figure against the Manhattan skyline captures the same awe felt by millions of arriving immigrants over a century ago.`
  ]);

  // Los Angeles
  const resUSALosAngeles = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    usaId,
    'Los Angeles',
    'los-angeles',
    'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?q=80&w=1600&auto=format&fit=crop',
    `Founded by Spanish settlers in 1781 as El Pueblo de Nuestra Señora la Reina de los Ángeles, Los Angeles transformed in the early 20th century into the global capital of film and entertainment, as studios fled New York's patent restrictions for California's sunshine and open land.`,
    `Located on the Pacific coast of Southern California, Los Angeles spans a sprawling basin between the Santa Monica Mountains and the sea, with a Mediterranean climate of warm, dry summers.`,
    `LA's food scene blends Mexican street tacos, Korean BBQ, and health-forward California cuisine, with iconic dishes like the French Dip sandwich (invented here) and endless food truck innovation reflecting the city's cultural diversity.`
  ]);

  const usalosangelesId = resUSALosAngeles.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    usalosangelesId,
    'Hollywood Sign & Walk of Fame',
    'hollywood-sign-walk-of-fame',
    'https://images.unsplash.com/photo-1534190760961-74e8c1b5c1b9?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1200&auto=format&fit=crop'
    ]),
    `The Hollywood Sign overlooks Los Angeles from Mount Lee, an enduring emblem of the global film industry, while the Walk of Fame below embeds thousands of bronze stars honoring entertainment icons.`,
    `Originally erected in 1923 as "Hollywoodland" to advertise a real estate development, the sign lost its last four letters in 1949 and became an official symbol of the film industry that had transformed the surrounding neighborhood.`,
    JSON.stringify([
      'Iconic 45-foot-tall letters visible across the Los Angeles basin',
      'Griffith Observatory hiking trails offering the classic sign view',
      'Hollywood Walk of Fame’s more than 2,700 bronze stars',
      'TCL Chinese Theatre with celebrity hand and footprints'
    ]),
    `Hiking up to a Griffith Park viewpoint at golden hour, with the Hollywood Sign catching the last light above a sprawling city grid, is a quintessential LA moment for first-time visitors.`
  ]);

  // --- UNITED KINGDOM ---
  const resUK = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'United Kingdom',
    'united-kingdom',
    '🇬🇧',
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1600&auto=format&fit=crop',
    `The United Kingdom's history spans Roman Britain, Anglo-Saxon kingdoms, Norman conquest, and centuries as a global maritime empire that once ruled a quarter of the world. From the Magna Carta's foundations of law to the Industrial Revolution born in its factories, Britain has profoundly shaped modern governance, science, and culture.`,
    JSON.stringify([
      { year: '1066 CE', event: 'The Norman Conquest reshapes English governance and culture.' },
      { year: '1215 CE', event: 'The Magna Carta establishes limits on royal power.' },
      { year: '1760 CE', event: 'The Industrial Revolution begins, transforming the global economy.' },
      { year: '1928 CE', event: 'Women gain equal voting rights with men.' }
    ]),
    `British culture blends centuries-old royal tradition with a thriving contemporary arts scene, from Shakespeare's theater and afternoon tea rituals to punk rock and Premier League football. Dry wit, queueing etiquette, and pub culture remain distinctly British social touchstones.`,
    `Royal ceremonial events like Trooping the Colour, Bonfire Night fireworks, Christmas pantomime theater, traditional Sunday roast dinners.`,
    `English originated in England and remains the official language, alongside recognized regional languages including Welsh, Scottish Gaelic, and Irish.`,
    `Home to Big Ben and the Tower of London in the capital, the ancient stones of Edinburgh Castle, and the prehistoric monument of Stonehenge.`
  ]);

  const ukId = resUK.lastID;

  // London
  const resUKLondon = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    ukId,
    'London',
    'london',
    'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=1600&auto=format&fit=crop',
    `Founded by the Romans as Londinium in 43 CE, London grew through the medieval and Tudor periods into the capital of a global empire. The Great Fire of 1666 and the Blitz of World War II each reshaped the city, which today stands as one of the world's great financial and cultural capitals.`,
    `Located in southeastern England along the River Thames, London has a temperate oceanic climate with mild, wet weather year-round and famously unpredictable skies.`,
    `London's food scene ranges from traditional Fish and Chips and hearty Sunday Roast to the city's beloved curry houses on Brick Lane, reflecting centuries of Commonwealth immigration alongside modern Michelin-starred dining.`
  ]);

  const uklondonId = resUKLondon.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    uklondonId,
    'Big Ben & Houses of Parliament',
    'big-ben-houses-of-parliament',
    'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Big Ben's great bell tolls from the Elizabeth Tower above the Houses of Parliament, an unmistakable silhouette on the River Thames and the beating heart of British democracy since the Victorian era.`,
    `Built after fire destroyed the old Palace of Westminster in 1834, the new Gothic Revival Houses of Parliament and its clock tower were completed in 1859, with "Big Ben" technically naming the tower's Great Bell.`,
    JSON.stringify([
      'Elizabeth Tower’s Gothic Revival architecture and iconic clock faces',
      'Great Bell’s deep chimes marking each hour across Westminster',
      'Westminster Bridge views of the Parliament facade along the Thames',
      'Nearby Westminster Abbey, site of royal coronations since 1066'
    ]),
    `Crossing Westminster Bridge as Big Ben chimes overhead, with the London Eye turning slowly across the river, is one of the most recognizable moments in world travel.`
  ]);

  // Edinburgh
  const resUKEdinburgh = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    ukId,
    'Edinburgh',
    'edinburgh',
    'https://images.unsplash.com/photo-1578637387939-43c525550085?q=80&w=1600&auto=format&fit=crop',
    `Scotland's capital grew around its ancient volcanic crag, where Edinburgh Castle has stood guard for nearly a thousand years. The city flourished during the 18th-century Scottish Enlightenment, producing thinkers like David Hume and Adam Smith in its atmospheric Old Town closes.`,
    `Located on Scotland's east coast along the Firth of Forth, Edinburgh has a cool temperate maritime climate with mild summers and crisp, often windy winters.`,
    `Edinburgh's cuisine features hearty Haggis with neeps and tatties, fresh Scottish salmon, and warming Cullen Skink smoked fish chowder, best enjoyed in a centuries-old Old Town pub with a dram of whisky.`
  ]);

  const ukedinburghId = resUKEdinburgh.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    ukedinburghId,
    'Edinburgh Castle',
    'edinburgh-castle',
    'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Perched atop an extinct volcano, Edinburgh Castle has dominated the city's skyline for centuries, a fortress that has witnessed sieges, royal births, and the safekeeping of Scotland's crown jewels.`,
    `Fortified since at least the Iron Age, the castle became a royal residence in the 12th century under David I. It withstood numerous sieges through the Wars of Scottish Independence and remains a working military garrison today.`,
    JSON.stringify([
      'Crown Jewels of Scotland, the oldest in Britain',
      'One O’Clock Gun fired daily except Sundays',
      'St Margaret’s Chapel, Edinburgh’s oldest surviving building',
      'Panoramic views over the Royal Mile and Firth of Forth'
    ]),
    `Climbing the Royal Mile toward the castle as bagpipes echo off centuries-old stone buildings builds a sense of anticipation that culminates in sweeping views over all of Edinburgh from the castle ramparts.`
  ]);

  // --- TURKEY ---
  const resTurkey = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Turkey',
    'turkey',
    '🇹🇷',
    'https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=1600&auto=format&fit=crop',
    `Straddling Europe and Asia, Turkey's land has hosted the Hittites, ancient Troy, the Byzantine Empire centered on Constantinople, and the Ottoman Empire that ruled for over 600 years. Modern Turkey emerged in 1923 under Mustafa Kemal Atatürk, forging a secular republic bridging East and West.`,
    JSON.stringify([
      { year: '330 CE', event: 'Constantinople is founded as the new Roman capital.' },
      { year: '1453 CE', event: 'Ottoman forces conquer Constantinople, ending the Byzantine Empire.' },
      { year: '1923 CE', event: 'The Republic of Turkey is founded under Atatürk.' }
    ]),
    `Turkish culture bridges European and Middle Eastern influences through Ottoman-era art, warm tea-house hospitality, and traditions of Turkish bath (hammam) rituals and vibrant bazaar commerce. Music, from classical Ottoman court traditions to modern pop, threads through daily life.`,
    `Turkish tea culture and coffee fortune-telling, Ramadan feast traditions, whirling dervish Sufi ceremonies, traditional Turkish wedding henna nights.`,
    `Turkish is the official language, written in the Latin alphabet since Atatürk's 1928 language reform.`,
    `Home to the Hagia Sophia and Blue Mosque in Istanbul, and the surreal fairy chimney landscapes of Cappadocia.`
  ]);

  const turkeyId = resTurkey.lastID;

  // Istanbul
  const resTurkeyIstanbul = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    turkeyId,
    'Istanbul',
    'istanbul',
    'https://images.unsplash.com/photo-1528164344705-4754268799af?q=80&w=1600&auto=format&fit=crop',
    `Founded as Byzantium, refounded as Constantinople by Roman Emperor Constantine in 330 CE, and finally conquered by Ottoman Sultan Mehmed II in 1453, Istanbul is the only major city spanning two continents, its layered history visible in Byzantine domes and Ottoman minarets alike.`,
    `Straddling the Bosphorus Strait between Europe and Asia, Istanbul has a temperate Mediterranean-continental climate with humid summers and cool, rainy winters.`,
    `Istanbul's cuisine spans smoky grilled Kebabs, flaky Baklava dripping with syrup, savory Simit sesame bread rings sold streetside, and endless tulip-glass servings of Turkish tea overlooking the Bosphorus.`
  ]);

  const turkeyistanbulId = resTurkeyIstanbul.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    turkeyistanbulId,
    'Hagia Sophia',
    'hagia-sophia',
    'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1465447142348-e9952c393450?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Hagia Sophia's massive dome has dominated Istanbul's skyline for nearly 1,500 years, transformed across history from Byzantine cathedral to Ottoman mosque to museum and back to mosque again.`,
    `Completed in 537 CE under Byzantine Emperor Justinian I, Hagia Sophia was the world's largest cathedral for centuries. After the 1453 Ottoman conquest, it was converted into a mosque, with minarets added, before becoming a museum in 1935 and reverting to a mosque in 2020.`,
    JSON.stringify([
      'Massive central dome, an engineering marvel of its era',
      'Byzantine gold mosaics alongside Islamic calligraphic medallions',
      'Marble columns sourced from ancient temples across the empire',
      'Layered architectural history spanning three religious eras'
    ]),
    `Standing beneath Hagia Sophia's soaring dome, where shafts of light illuminate centuries-old mosaics beside Ottoman calligraphy, offers a rare physical encounter with two great empires layered in one building.`
  ]);

  // Cappadocia
  const resTurkeyCappadocia = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    turkeyId,
    'Cappadocia',
    'cappadocia',
    'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1600&auto=format&fit=crop',
    `Cappadocia's otherworldly landscape was carved by volcanic eruptions and millennia of erosion, forming the surreal "fairy chimney" rock formations. Early Christians carved entire underground cities and cave churches into the soft volcanic rock to escape persecution, leaving a legacy still visible today.`,
    `Located in central Anatolia, Turkey, Cappadocia sits on a high plateau shaped by ancient volcanic activity, with hot dry summers and cold, snowy winters.`,
    `Cappadocia is known for Testi Kebab, meat and vegetables slow-cooked in a sealed clay pot and cracked open tableside, alongside local wines from vineyards grown in the region's volcanic soil.`
  ]);

  const turkeycappadociaId = resTurkeyCappadocia.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    turkeycappadociaId,
    'Goreme Open-Air Museum & Fairy Chimneys',
    'goreme-open-air-museum',
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541171781670-807083f28ba9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1200&auto=format&fit=crop'
    ]),
    `The Goreme Open-Air Museum preserves a cluster of rock-cut Byzantine churches decorated with frescoes, surrounded by the cone-shaped fairy chimney formations that make Cappadocia one of the world's most surreal landscapes.`,
    `Christian monks and communities carved churches, monasteries, and homes directly into Cappadocia's soft volcanic tuff rock beginning in the 4th century, seeking refuge and creating a UNESCO-listed complex of frescoed cave sanctuaries.`,
    JSON.stringify([
      'Rock-cut Byzantine churches with preserved frescoes',
      'Iconic cone-shaped fairy chimney rock formations',
      'Sunrise hot air balloon views over the valley',
      'Underground cities such as nearby Derinkuyu'
    ]),
    `Rising at dawn to watch dozens of hot air balloons drift silently over the fairy chimneys as the sun crests the horizon is widely considered one of the most magical sights in world travel.`
  ]);

  // --- UNITED ARAB EMIRATES ---
  const resUAE = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'United Arab Emirates',
    'united-arab-emirates',
    '🇦🇪',
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1600&auto=format&fit=crop',
    `Once a coastal region of pearl divers and Bedouin trading tribes, the seven emirates unified in 1971 into the United Arab Emirates following the discovery of oil. In just a few decades, the UAE transformed from a modest Gulf federation into a global hub of trade, tourism, and futuristic architecture.`,
    JSON.stringify([
      { year: '1853 CE', event: 'The Trucial States enter a maritime truce with Britain.' },
      { year: '1966 CE', event: 'Oil is discovered in Abu Dhabi, transforming the economy.' },
      { year: '1971 CE', event: 'The seven emirates unite to form the UAE.' },
      { year: '2010 CE', event: 'The Burj Khalifa opens as the world’s tallest building.' }
    ]),
    `Emirati culture blends Bedouin heritage and Islamic tradition with a remarkably cosmopolitan, multicultural society shaped by global trade and tourism. Falconry, majlis gatherings, and traditional dhow sailing endure alongside ultra-modern skyscraper skylines.`,
    `Ramadan iftar gatherings, traditional falconry displays, Eid celebrations with fireworks, National Day festivities each December.`,
    `Arabic is the official language, with English widely spoken as the practical language of business and tourism.`,
    `Home to the record-breaking Burj Khalifa and Palm Jumeirah in Dubai, and the resplendent Sheikh Zayed Grand Mosque in Abu Dhabi.`
  ]);

  const uaeId = resUAE.lastID;

  // Dubai
  const resUAEDubai = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    uaeId,
    'Dubai',
    'dubai',
    'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?q=80&w=1600&auto=format&fit=crop',
    `Dubai grew from a modest pearling and fishing settlement on Dubai Creek into a global city within two generations, driven by visionary rulers who diversified the economy beyond oil into trade, tourism, and finance, reshaping the skyline with record-breaking towers.`,
    `Located along the Persian Gulf coast of the UAE, Dubai has a hot desert climate with intensely hot summers exceeding 40°C and mild, pleasant winters.`,
    `Dubai's food scene mixes traditional Emirati Machboos spiced rice with lamb, fragrant Arabic Mezze platters, and an extraordinary global dining scene reflecting the city's international population and luxury hospitality industry.`
  ]);

  const uaedubaiId = resUAEDubai.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    uaedubaiId,
    'Burj Khalifa',
    'burj-khalifa',
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1531572753322-ad063cecc140?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568322445389-f64ac9c556b0?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?q=80&w=1200&auto=format&fit=crop'
    ]),
    `At 828 meters, the Burj Khalifa is the tallest building on Earth, its needle-like silhouette anchoring Dubai's futuristic skyline and offering observation decks with views stretching to the desert horizon.`,
    `Completed in 2010 after six years of construction, the tower was designed by Adrian Smith of Skidmore, Owings & Merrill, drawing inspiration from Islamic architecture and desert flowers in its tiered, spiraling form.`,
    JSON.stringify([
      'At the Top observation decks on the 124th, 125th, and 148th floors',
      'Dubai Fountain performances at the tower’s base each evening',
      'World’s highest restaurant, At.mosphere, on the 122nd floor',
      'Panoramic desert and Persian Gulf views on clear days'
    ]),
    `Riding the high-speed elevator to the 148th floor observation deck and watching Dubai's sprawling skyline shrink beneath you delivers a genuine sense of vertigo-inducing scale unmatched anywhere else.`
  ]);

  // Abu Dhabi
  const resUAEAbuDhabi = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    uaeId,
    'Abu Dhabi',
    'abu-dhabi',
    'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=1600&auto=format&fit=crop',
    `As the UAE's capital and largest emirate, Abu Dhabi transformed from a modest pearl-diving island settlement into a wealthy capital following oil discovery in the 1960s, investing heavily in culture, education, and monumental architecture like the Sheikh Zayed Grand Mosque.`,
    `Located on a T-shaped island jutting into the Persian Gulf, Abu Dhabi has a hot desert climate similar to Dubai, with high humidity along its coastline.`,
    `Abu Dhabi's cuisine features traditional Emirati Harees wheat and meat porridge, fresh Gulf seafood grills, and an abundance of dates served with Arabic coffee (gahwa) as a gesture of hospitality.`
  ]);

  const uaeabudhabiId = resUAEAbuDhabi.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    uaeabudhabiId,
    'Sheikh Zayed Grand Mosque',
    'sheikh-zayed-grand-mosque',
    'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop'
    ]),
    `The Sheikh Zayed Grand Mosque is one of the world's largest mosques, its 82 white marble domes and crystal chandeliers forming a breathtaking monument to Islamic art and architecture open to visitors of all faiths.`,
    `Commissioned by the UAE's founding president, Sheikh Zayed bin Sultan Al Nahyan, and completed in 2007, the mosque was designed to unite architectural styles from across the Islamic world, using materials and artisans from dozens of countries.`,
    JSON.stringify([
      'World’s largest hand-knotted carpet in the main prayer hall',
      'Swarovski crystal chandeliers, among the largest ever made',
      'Reflecting pools mirroring the mosque’s marble domes at sunset',
      'Intricate floral marble inlay using semi-precious stones'
    ]),
    `Walking the mosque's vast white marble courtyard barefoot at sunset, as the domes turn golden and reflect in the surrounding pools, is a serene and genuinely awe-inspiring experience regardless of faith.`
  ]);

  // --- SAUDI ARABIA ---
  const resSaudiArabia = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Saudi Arabia',
    'saudi-arabia',
    '🇸🇦',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1600&auto=format&fit=crop',
    `Birthplace of Islam and home to its two holiest cities, Saudi Arabia's modern state was founded in 1932 by King Abdulaziz Al Saud, unifying the Arabian Peninsula's tribal regions. From ancient trade routes to the discovery of vast oil reserves in 1938, the kingdom has shaped global energy markets and Islamic civilization alike.`,
    JSON.stringify([
      { year: '610 CE', event: 'The Prophet Muhammad begins receiving revelations near Mecca.' },
      { year: '1744 CE', event: 'The first Saudi state is founded in Diriyah.' },
      { year: '1932 CE', event: 'King Abdulaziz unifies the kingdom as Saudi Arabia.' },
      { year: '1938 CE', event: 'Vast oil reserves are discovered, transforming the economy.' }
    ]),
    `Saudi culture is deeply rooted in Islamic tradition, Bedouin hospitality, and tribal heritage, with poetry, traditional Ardah sword dance, and generous hospitality rituals central to social life. Rapid modernization under Vision 2030 is expanding cultural tourism and the arts.`,
    `Hajj pilgrimage traditions, Founding Day celebrations, traditional Ardah dance performances, Ramadan and Eid family gatherings.`,
    `Arabic is the official language, the language in which the Quran was revealed and a unifying force across the Islamic world.`,
    `Home to the holy cities of Mecca and Medina, the futuristic capital Riyadh, and the ancient Nabataean tombs of AlUla.`
  ]);

  const saudiarabiaId = resSaudiArabia.lastID;

  // Riyadh
  const resSaudiArabiaRiyadh = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    saudiarabiaId,
    'Riyadh',
    'riyadh',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
    `Riyadh grew from the walled town of Diriyah, cradle of the first Saudi state, into the kingdom's modern capital. Since the 1970s oil boom, Riyadh has rapidly modernized into a skyscraper-studded metropolis while preserving its role as the political heart of Saudi Arabia.`,
    `Located in the center of the Arabian Peninsula on the Najd plateau, Riyadh has a hot desert climate with extremely hot summers and mild winters, receiving minimal rainfall year-round.`,
    `Riyadh's cuisine centers on Kabsa, a fragrant spiced rice dish with meat considered the national dish, alongside Jareesh cracked wheat porridge and dates served with traditional Arabic coffee in welcoming majlis gatherings.`
  ]);

  const saudiarabiariyadhId = resSaudiArabiaRiyadh.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    saudiarabiariyadhId,
    'Diriyah (At-Turaif District)',
    'diriyah-at-turaif',
    'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544918877-7db2fbb27f83?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Diriyah's At-Turaif District, a UNESCO World Heritage Site, preserves the mudbrick palaces and towers of the birthplace of the Saudi state, now restored as a cultural showcase on the outskirts of Riyadh.`,
    `Founded in the 15th century and rising to prominence as the capital of the first Saudi state from 1727 to 1818, At-Turaif's distinctive Najdi mudbrick architecture was meticulously restored as part of Saudi Arabia's Vision 2030 heritage initiatives.`,
    JSON.stringify([
      'Salwa Palace, the historic seat of the Al Saud family',
      'Traditional Najdi mudbrick architecture and defensive towers',
      'Wadi Hanifah valley setting with restored palm groves',
      'Cultural district with museums, galleries, and dining'
    ]),
    `Walking through At-Turaif's earthen-toned palaces at dusk, as lights illuminate the mudbrick towers against the Wadi Hanifah valley, offers a striking connection to Saudi Arabia's founding history.`
  ]);

  // Jeddah
  const resSaudiArabiaJeddah = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    saudiarabiaId,
    'Jeddah',
    'jeddah',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1600&auto=format&fit=crop',
    `Jeddah has served as the principal gateway to Mecca for Muslim pilgrims for over a thousand years, growing wealthy as a Red Sea trading port. Its historic Al-Balad district preserves distinctive coral-stone merchant houses with ornate wooden balconies (rawasheen) reflecting centuries of Red Sea trade.`,
    `Located on the Red Sea coast of western Saudi Arabia, Jeddah has a hot desert climate tempered by coastal humidity, with year-round warm temperatures.`,
    `Jeddah's Red Sea location brings fresh Mandi grilled fish and seafood to the table, alongside Saleeg creamy rice with chicken and the city's famous Foul and Falafel breakfast spreads reflecting Hejazi cuisine.`
  ]);

  const saudiarabiajeddahId = resSaudiArabiaJeddah.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    saudiarabiajeddahId,
    'Al-Balad Historic District',
    'al-balad-historic-district',
    'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1580881855537-7cd1d0d1e3cf?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Al-Balad, Jeddah's UNESCO-listed old town, preserves centuries of Red Sea trading history in its coral-stone merchant houses, ornate wooden latticework balconies, and labyrinthine market alleys.`,
    `Flourishing from the 7th century onward as the main port for pilgrims arriving to Mecca, Al-Balad's multi-story coral-stone houses, built by wealthy merchant families, showcase a unique architectural style found nowhere else in the region.`,
    JSON.stringify([
      'Distinctive rawasheen carved wooden balcony screens',
      'Historic Souq Al-Alawi market alleys and spice traders',
      'Coral-stone merchant houses reflecting Red Sea trade wealth',
      'Naseef House museum showcasing traditional Hejazi life'
    ]),
    `Wandering Al-Balad's narrow alleys in the evening, past centuries-old coral houses with intricately carved balconies lit by lantern light, feels like stepping into a living memory of the historic Hejaz.`
  ]);

  // --- GERMANY ---
  const resGermany = await dbRun(`
    INSERT INTO countries (name, slug, flag, hero_image, history, timeline_json, culture, traditions, language, famous_places_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Germany',
    'germany',
    '🇩🇪',
    'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1600&auto=format&fit=crop',
    `Germany's history spans the Holy Roman Empire, fragmented kingdoms unified under Prussia in 1871, the upheavals of two World Wars, division during the Cold War, and reunification in 1990. Today it stands as Europe's economic engine, balancing deep historical reckoning with cultural and technological leadership.`,
    JSON.stringify([
      { year: '800 CE', event: 'Charlemagne is crowned Holy Roman Emperor.' },
      { year: '1871 CE', event: 'Germany is unified into a single empire under Prussia.' },
      { year: '1989 CE', event: 'The Berlin Wall falls, ending Cold War division.' },
      { year: '1990 CE', event: 'East and West Germany formally reunify.' }
    ]),
    `German culture prizes precision, philosophical inquiry, and a rich tradition of classical music from Bach to Beethoven, alongside modern innovations in engineering and design. Christmas markets, beer garden camaraderie, and a strong environmental consciousness shape everyday life.`,
    `Oktoberfest beer festival, Christmas market (Weihnachtsmarkt) traditions, Karneval pre-Lenten celebrations, St. Martin's Day lantern processions.`,
    `German is the official language, spoken by over 100 million people as a native tongue across Central Europe.`,
    `Home to the Brandenburg Gate and Berlin Wall remnants in Berlin, and the fairy-tale Neuschwanstein Castle in Bavaria.`
  ]);

  const germanyId = resGermany.lastID;

  // Berlin
  const resGermanyBerlin = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    germanyId,
    'Berlin',
    'berlin',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
    `Berlin's 20th century alone saw it serve as capital of the Kaiser's empire, Weimar cultural hub, Nazi capital, a city divided by the Berlin Wall during the Cold War, and finally the reunified capital of modern Germany since 1990, making it one of history's most transformed cities.`,
    `Located in northeastern Germany along the Spree River, Berlin has a temperate seasonal climate with warm summers and cold winters, spread across a relatively flat glacial plain.`,
    `Berlin is famous for Currywurst, a curry-spiced sausage street food invented in the city, alongside hearty Schnitzel, pretzels, and a thriving craft beer and Döner kebab scene reflecting its Turkish immigrant community.`
  ]);

  const germanyberlinId = resGermanyBerlin.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    germanyberlinId,
    'Brandenburg Gate',
    'brandenburg-gate',
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578637387939-43c525550085?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1528164344705-4754268799af?q=80&w=1200&auto=format&fit=crop'
    ]),
    `The Brandenburg Gate has witnessed nearly every pivotal moment in modern German history, from Napoleon's conquest to Cold War division to the jubilant crowds who gathered here as the Berlin Wall fell in 1989.`,
    `Built between 1788 and 1791 as a neoclassical city gate topped by the Quadriga sculpture, the gate stood in the no-man's-land of the Berlin Wall for decades before becoming the powerful symbol of German reunification.`,
    JSON.stringify([
      'Quadriga bronze sculpture crowning the gate’s roofline',
      'Pariser Platz square framing the monument',
      'Site of the historic 1989 Wall-fall celebrations',
      'Nearby Reichstag building and Holocaust Memorial'
    ]),
    `Standing before the illuminated Brandenburg Gate at night, where jubilant Berliners once celebrated reunification, offers a powerful sense of a city that rebuilt itself from division into unity.`
  ]);

  // Munich
  const resGermanyMunich = await dbRun(`
    INSERT INTO cities (country_id, name, slug, hero_image, history, location_geo, food_cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    germanyId,
    'Munich',
    'munich',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1600&auto=format&fit=crop',
    `Munich rose as the capital of Bavaria under the Wittelsbach dynasty, which ruled for over 700 years and shaped the city's grand architecture and cultural institutions. Today it balances centuries-old Bavarian tradition with a modern reputation as one of Germany's wealthiest and most livable cities.`,
    `Located in southern Germany near the Bavarian Alps, Munich has a continental climate with warm summers and cold, occasionally snowy winters, benefiting from proximity to alpine lakes and mountains.`,
    `Munich is the heart of Bavarian cuisine: golden pretzels, Weisswurst white sausage traditionally eaten before noon, hearty pork knuckle (Schweinshaxe), and of course the world-famous beer halls serving Bavarian lager by the liter.`
  ]);

  const germanymunichId = resGermanyMunich.lastID;

  await dbRun(`
    INSERT INTO places (city_id, name, slug, main_image, images_json, overview, history, highlights_json, visitor_experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    germanymunichId,
    'Neuschwanstein Castle',
    'neuschwanstein-castle',
    'https://images.unsplash.com/photo-1595867818082-083862f3d630?q=80&w=1600&auto=format&fit=crop',
    JSON.stringify([
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=1200&auto=format&fit=crop'
    ]),
    `Rising from a dramatic Bavarian hilltop near Munich, Neuschwanstein Castle's fairy-tale turrets inspired Disney's Sleeping Beauty Castle and remain one of the most photographed buildings in the world.`,
    `Commissioned in 1869 by the reclusive "Fairy Tale King" Ludwig II of Bavaria as a private retreat and homage to composer Richard Wagner, the castle was never fully completed and Ludwig lived there only 172 days before his mysterious death in 1886.`,
    JSON.stringify([
      'Throne Room with Byzantine-inspired golden mosaics',
      'Singers’ Hall built to honor Wagner’s operas',
      'Marienbrücke bridge offering the iconic castle photo view',
      'Surrounding Bavarian Alps and Alpsee lake scenery'
    ]),
    `Crossing the Marienbrücke bridge for the classic view of Neuschwanstein rising from the forest against alpine peaks feels like stepping directly into the fairy tale that inspired it.`
  ]);



  console.log('Historica Explorer database successfully seeded with countries, cities, and places!');
};
