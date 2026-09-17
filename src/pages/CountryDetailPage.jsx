import React, { useState, useEffect } from 'react';
import { apiUrl } from '../lib/api';
import { BookOpen, Sparkles, MapPin, Landmark, ArrowRight, Languages, Users, Clock, Compass, ChevronLeft } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

const CountryDetailPage = ({ countrySlug, setActiveTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl(`/api/countries/${countrySlug}`))
      .then(res => {
        if (!res.ok) throw new Error('Country not found');
        return res.json();
      })
      .then(data => setData(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [countrySlug]);

  if (loading) {
    return (
      <div className="container py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm">Retrieving country chronicles...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-20 text-center text-slate-400 space-y-4">
        <h2 className="text-2xl font-bold text-white">Country Record Not Found</h2>
        <p className="text-sm">{error || 'Unable to load country data.'}</p>
        <button onClick={() => setActiveTab('explore')} className="btn-primary">
          Return to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-16 animate-fade-in">
      
      {/* Hero Banner Header */}
      <section className="relative h-[50vh] min-h-[380px] flex items-end pb-10 overflow-hidden border-b border-slate-800">
        <img
          src={data.hero_image}
          alt={data.name}
          fetchpriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20"></div>

        <div className="container relative z-10 space-y-4">
          <button
            onClick={() => setActiveTab('explore')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:underline mb-2 bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur-md"
          >
            <ChevronLeft size={16} /> Back to Destinations Directory
          </button>

          <div className="flex items-center gap-3">
            <span className="text-5xl">{data.flag}</span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white font-heading">
              {data.name}
            </h1>
          </div>

          <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">
            {data.famous_places_summary}
          </p>
        </div>
      </section>

      <div className="container grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Details (2 Columns) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* SECTION 1: HISTORY (Mandatory Section) */}
          <section id="history" className="content-section-card">
            <div className="content-section-header">
              <div className="content-section-icon">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading">
                  1. History & Cultural Significance
                </h2>
                <p className="text-xs text-slate-400">Historical background & pivotal developments</p>
              </div>
            </div>

            <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
              <p>{data.history}</p>
            </div>

            {/* Timeline Breakdown */}
            {data.timeline && data.timeline.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800/80">
                <h3 className="text-base font-bold text-white font-heading mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-amber-400" /> Historical Timeline Highlights
                </h3>

                <div className="space-y-4 border-l-2 border-slate-800 pl-4 ml-2">
                  {data.timeline.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-sky-500 border-2 border-slate-950 group-hover:scale-125 transition-transform"></div>
                      <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">{item.year}</span>
                      <p className="text-sm text-slate-300 font-medium mt-0.5">{item.event}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* SECTION 2: CULTURE (Mandatory Section) */}
          <section id="culture" className="content-section-card">
            <div className="content-section-header">
              <div className="content-section-icon bg-purple-500/15 text-purple-400">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading">
                  2. Culture, Traditions & Language
                </h2>
                <p className="text-xs text-slate-400">Lifestyle, social etiquette & national language</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                  <Users size={16} /> Heritage & Lifestyle
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{data.culture}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Sparkles size={16} /> Key Traditions & Festivals
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{data.traditions}</p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
              <Languages size={22} className="text-sky-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Official Language</h4>
                <p className="text-xs text-slate-300 mt-0.5">{data.language}</p>
              </div>
            </div>
          </section>

          {/* SECTION 3: FAMOUS PLACES & CITIES GRID */}
          <section id="places" className="content-section-card">
            <div className="content-section-header">
              <div className="content-section-icon bg-emerald-500/15 text-emerald-400">
                <Landmark size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading">
                  3. Iconic Destinations & Landmark Highlights
                </h2>
                <p className="text-xs text-slate-400">Top historical cities and monuments</p>
              </div>
            </div>

            {/* Featured Places */}
            {data.featured_places && data.featured_places.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {data.featured_places.map((place, index) => (
                  <ScrollReveal
                    key={place.slug}
                    delay={(index % 4) * 90}
                    onClick={() => { setActiveTab(`place:${place.slug}`); window.scrollTo(0,0); }}
                    className="glass-card group overflow-hidden cursor-pointer flex flex-col"
                  >
                    <div className="h-40 overflow-hidden relative">
                      <img
                        src={place.main_image}
                        alt={place.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-400 border border-slate-800">
                        {place.city_name}
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="level-tag level-tag-place">Place</span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {place.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{place.overview}</p>
                      <div className="mt-3 pt-2 border-t border-slate-800 text-xs font-semibold text-emerald-400 flex items-center justify-between">
                        <span>View 3-5 Photo Gallery</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Sidebar: Cities in this Country */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
                <MapPin className="text-sky-400" size={20} />
                Historical Cities in {data.name}
              </h3>
              <p className="text-xs text-slate-400">
                Select a city to read its origin stories, geographical overview, and rich street food & cuisine profiles.
              </p>

              <div className="space-y-3">
                {data.cities && data.cities.map((city) => (
                  <div
                    key={city.slug}
                    onClick={() => { setActiveTab(`city:${city.slug}`); window.scrollTo(0,0); }}
                    className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all flex items-center gap-3 group"
                  >
                    <img
                      src={city.hero_image}
                      alt={city.name}
                      loading="lazy"
                      decoding="async"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors truncate">
                          {city.name}
                        </h4>
                        <span className="level-tag level-tag-city shrink-0">City</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        History & Food Guide
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default CountryDetailPage;
