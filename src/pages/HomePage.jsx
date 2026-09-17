import React, { useState, useEffect } from 'react';
import { apiUrl } from '../lib/api';
import { Compass, Plane, MapPin, Landmark, ArrowRight, Sparkles, Utensils, BookOpen, Globe, Shield } from 'lucide-react';
import AirplaneFlight from '../components/AirplaneFlight';
import ScrollReveal from '../components/ScrollReveal';
import { useLanguage } from '../context/LanguageContext';

const HomePage = ({ setActiveTab, openSearchModal }) => {
  const { t } = useLanguage();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/api/countries'))
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(err => console.error('Failed to load countries:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-20 pb-12">
      
      {/* Hero Section with Airplane Animation */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-10 overflow-hidden">
        
        {/* Animated Flying Airplane Sky Effect */}
        <AirplaneFlight />

        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="container relative z-10 text-center max-w-4xl space-y-8 animate-fade-in">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-sky-500/30 text-sky-400 text-xs font-bold uppercase tracking-widest shadow-lg shadow-sky-500/10">
            <Sparkles size={14} />
            <span>Discover Ancient Civilizations & Living Culture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-none font-heading">
            Unfold the Legacy of <br />
            <span className="bg-gradient-to-r from-sky-400 via-amber-300 to-indigo-400 bg-clip-text text-transparent">
              World Civilizations
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Immerse yourself in rich historical chronicles, architectural masterpieces, deep cultural traditions, and legendary culinary heritage.
          </p>

          {/* Interactive Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('explore')}
              className="btn-primary px-8 py-4 text-base"
            >
              <Compass size={20} />
              <span>Start Exploring Hierarchy</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={openSearchModal}
              className="btn-secondary px-8 py-4 text-base"
            >
              <Globe size={20} className="text-sky-400" />
              <span>{t('hero_search_cta')}</span>
            </button>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-slate-800/80 max-w-3xl mx-auto text-left">
            <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <BookOpen className="text-sky-400 mb-1" size={20} />
              <p className="text-xs font-bold text-white">Editorial History</p>
              <p className="text-[11px] text-slate-400">Deep, non-superficial logs</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <Utensils className="text-amber-400 mb-1" size={20} />
              <p className="text-xs font-bold text-white">Food & Cuisine</p>
              <p className="text-[11px] text-slate-400">Street foods & dining secrets</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <Landmark className="text-emerald-400 mb-1" size={20} />
              <p className="text-xs font-bold text-white">Monuments & Shrines</p>
              <p className="text-[11px] text-slate-400">3-5 imagery per landmark</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <Shield className="text-purple-400 mb-1" size={20} />
              <p className="text-xs font-bold text-white">Authentic Records</p>
              <p className="text-[11px] text-slate-400">Verified cultural origins</p>
            </div>
          </div>

        </div>

      </section>

      {/* Featured Countries Grid */}
      <section className="container space-y-10">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="badge-tag mb-2">{t('hero_badge')}</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white font-heading">
              Select a Country to Explore
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Dive into separate historical timelines, cultural pillars, and city guides.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('explore')}
            className="text-sky-400 font-semibold text-sm hover:underline flex items-center gap-1.5 self-start md:self-auto"
          >
            <span>{t('hero_view_all')}</span>
            <ArrowRight size={16} />
          </button>
        </ScrollReveal>

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Fetching country records...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {countries.map((country, index) => (
              <ScrollReveal
                key={country.slug}
                delay={(index % 3) * 100}
                onClick={() => { setActiveTab(`country:${country.slug}`); window.scrollTo(0,0); }}
                className="glass-card group overflow-hidden cursor-pointer flex flex-col"
              >
                {/* Hero Photo Banner */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={country.hero_image}
                    alt={country.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-lg">
                    {country.flag}
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="level-tag level-tag-country">Country</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-extrabold text-white font-heading group-hover:text-sky-400 transition-colors">
                      {country.name}
                    </h3>
                  </div>
                </div>

                {/* Country Summary Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    {country.famous_places_summary}
                  </p>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-sky-400">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} /> Full History & Culture
                    </span>
                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* Culinary & Heritage Showcase Banner */}
      <section className="container">
        <ScrollReveal y={40} className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 md:p-14 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
            <div className="space-y-6">
              <div className="badge-gold">
                <Utensils size={14} /> GASTRONOMY & STREET FOOD CULTURE
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white font-heading leading-tight">
                Taste the History Behind Every Iconic Dish
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Food isn't just sustenance—it's centuries of cultural evolution. Explore Tokyo's Edomae sushi heritage, Rome's ancient guanciale pasta, and Cairo's aromatic spice bazaars in rich, non-superficial detail.
              </p>
              <button
                onClick={() => { setActiveTab('city:tokyo'); window.scrollTo(0,0); }}
                className="btn-primary bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/20"
              >
                <span>Explore Tokyo Culinary Guide</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-amber-500/30">
              <img
                src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1200&auto=format&fit=crop"
                alt="Ancient Gastronomy & Architecture"
                loading="lazy"
                decoding="async"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-6">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">FOOD & CITY CHRONICLES</span>
                  <p className="text-base font-bold text-white">Rome & Tokyo Culinary Deep Dives Included</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
};

export default HomePage;
