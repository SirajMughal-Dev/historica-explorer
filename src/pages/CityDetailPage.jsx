import React, { useState, useEffect } from 'react';
import { apiUrl } from '../lib/api';
import { BookOpen, MapPin, Utensils, Landmark, ArrowRight, Compass, Sun, Mountain, ChevronLeft } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

const CityDetailPage = ({ citySlug, setActiveTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl(`/api/cities/${citySlug}`))
      .then(res => {
        if (!res.ok) throw new Error('City record not found');
        return res.json();
      })
      .then(data => setData(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [citySlug]);

  if (loading) {
    return (
      <div className="container py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm">Retrieving city archives...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-20 text-center text-slate-400 space-y-4">
        <h2 className="text-2xl font-bold text-white">City Record Not Found</h2>
        <p className="text-sm">{error || 'Unable to load city data.'}</p>
        <button onClick={() => setActiveTab('explore')} className="btn-primary">
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-16 animate-fade-in">
      
      {/* Hero Banner */}
      <section className="relative h-[48vh] min-h-[360px] flex items-end pb-10 overflow-hidden border-b border-slate-800">
        <img
          src={data.hero_image}
          alt={data.name}
          fetchpriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20"></div>

        <div className="container relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab(`country:${data.country_slug}`); window.scrollTo(0,0); }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:underline bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur-md"
            >
              <ChevronLeft size={16} /> Back to {data.country_name} {data.country_flag}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white font-heading">
              {data.name}
            </h1>
            <span className="badge-tag">{data.country_name}</span>
          </div>

          <p className="text-slate-300 text-sm md:text-base max-w-2xl">
            Historic metropolis guide, geography, and culinary heritage.
          </p>
        </div>
      </section>

      <div className="container grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column (2 Cols Main Content) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* SECTION 1: HISTORY */}
          <section id="city-history" className="content-section-card">
            <div className="content-section-header">
              <div className="content-section-icon bg-sky-500/15 text-sky-400">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading">
                  1. City Origins & Historical Evolution
                </h2>
                <p className="text-xs text-slate-400">Founding, development, and pivotal historic eras</p>
              </div>
            </div>

            <div className="text-slate-300 text-sm leading-relaxed space-y-4">
              <p>{data.history}</p>
            </div>
          </section>

          {/* SECTION 2: LOCATION & GEOGRAPHY */}
          <section id="city-geo" className="content-section-card">
            <div className="content-section-header">
              <div className="content-section-icon bg-emerald-500/15 text-emerald-400">
                <MapPin size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading">
                  2. Location, Climate & Landscape
                </h2>
                <p className="text-xs text-slate-400">Geographical setting, seasonal weather, and top physical features</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-slate-300 text-sm leading-relaxed space-y-3">
              <p>{data.location_geo}</p>
            </div>
          </section>

          {/* SECTION 3: FOOD & CUISINE (VERY IMPORTANT 🍲) */}
          <section id="city-food" className="content-section-card border-l-amber-500">
            <div className="content-section-header">
              <div className="content-section-icon bg-amber-500/20 text-amber-400">
                <Utensils size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2">
                  3. Food & Gastronomical Culture 🍲
                </h2>
                <p className="text-xs text-slate-400">Famous regional dishes, street food markets & dining etiquette</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/30 space-y-4">
                <div className="badge-gold">DESCRIPTIVE CULINARY LOG</div>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {data.food_cuisine}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 4: PLACES IN THIS CITY */}
          <section id="city-places" className="content-section-card">
            <div className="content-section-header">
              <div className="content-section-icon bg-purple-500/15 text-purple-400">
                <Landmark size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading">
                  4. Iconic Landmarks & Tourist Locations
                </h2>
                <p className="text-xs text-slate-400">Must-visit places with multi-photo image galleries</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {data.places && data.places.map((place, index) => (
                <ScrollReveal
                  key={place.slug}
                  delay={(index % 4) * 90}
                  onClick={() => { setActiveTab(`place:${place.slug}`); window.scrollTo(0,0); }}
                  className="glass-card group overflow-hidden cursor-pointer flex flex-col"
                >
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={place.main_image}
                      alt={place.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <span className="level-tag level-tag-place">Place</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-base text-white group-hover:text-purple-400 transition-colors">
                        {place.name}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1">{place.overview}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-800 text-xs font-semibold text-purple-400 flex items-center justify-between">
                      <span>Explore Overview & Gallery</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white font-heading">Explore Quick Nav</h3>
              <ul className="space-y-2 text-xs font-semibold text-slate-300">
                <li><a href="#city-history" className="hover:text-sky-400 flex items-center gap-2"><span>•</span> City Origins & History</a></li>
                <li><a href="#city-geo" className="hover:text-sky-400 flex items-center gap-2"><span>•</span> Location & Geography</a></li>
                <li><a href="#city-food" className="hover:text-amber-400 flex items-center gap-2"><span>•</span> Food & Cuisine (Street Food)</a></li>
                <li><a href="#city-places" className="hover:text-purple-400 flex items-center gap-2"><span>•</span> Landmarks & Photo Galleries</a></li>
              </ul>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CityDetailPage;
