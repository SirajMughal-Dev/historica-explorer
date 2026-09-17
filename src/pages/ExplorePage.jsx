import React, { useState, useEffect } from 'react';
import { apiUrl } from '../lib/api';
import { Compass, MapPin, Landmark, ArrowRight, Search, Globe, Filter } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

const ExplorePage = ({ setActiveTab }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(apiUrl('/api/countries'))
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(err => console.error('Failed to load explore data:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCountries = countries.filter(c => {
    const matchesCountry = selectedCountry === 'all' || c.slug === selectedCountry;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.famous_places_summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  return (
    <div className="container py-10 space-y-10 animate-fade-in">
      
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="badge-tag">EXPLORE DIRECTORY</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white font-heading">
          Global Destination Explorer
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          Navigate through our structured hierarchy: select a country to unveil its history and culture, pick a city for local culinary secrets, and select individual places for 3-5 image photo galleries.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter destinations..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Country Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter size={14} /> Filter:
          </span>

          <button
            onClick={() => setSelectedCountry('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCountry === 'all'
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Countries
          </button>

          {countries.map(c => (
            <button
              key={c.slug}
              onClick={() => setSelectedCountry(c.slug)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedCountry === c.slug
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading destinations directory...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {filteredCountries.map((country, index) => (
            <ScrollReveal key={country.slug} delay={Math.min(index, 4) * 80} className="content-section-card space-y-6">
              
              {/* Country Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{country.flag}</span>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
                      {country.name}
                    </h2>
                    <p className="text-xs text-slate-400">Cultural & Historical Guide</p>
                  </div>
                </div>

                <button
                  onClick={() => { setActiveTab(`country:${country.slug}`); window.scrollTo(0,0); }}
                  className="btn-secondary py-2 px-5 text-xs self-start sm:self-auto"
                >
                  <span>Open Full {country.name} Guide</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Summary Paragraph */}
              <p className="text-sm text-slate-300 leading-relaxed">
                {country.famous_places_summary}
              </p>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div
                  onClick={() => { setActiveTab(`country:${country.slug}`); window.scrollTo(0,0); }}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                      <Globe size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">History & Culture</p>
                      <p className="text-[11px] text-slate-400">Timeline & Traditions</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-transform" />
                </div>

                <div
                  onClick={() => { setActiveTab(`country:${country.slug}`); window.scrollTo(0,0); }}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Cities & Cuisine</p>
                      <p className="text-[11px] text-slate-400">Food & Urban History</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
                </div>

                <div
                  onClick={() => { setActiveTab(`country:${country.slug}`); window.scrollTo(0,0); }}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                      <Landmark size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Famous Places</p>
                      <p className="text-[11px] text-slate-400">3-5 Imagery Galleries</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </ScrollReveal>
          ))}
        </div>
      )}

    </div>
  );
};

export default ExplorePage;
