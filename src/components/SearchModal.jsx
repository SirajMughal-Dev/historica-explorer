import React, { useState, useEffect } from 'react';
import { apiUrl } from '../lib/api';
import { Search, X, MapPin, Landmark, Globe, ArrowRight } from 'lucide-react';

const SearchModal = ({ isOpen, onClose, setActiveTab }) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ countries: [], cities: [], places: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ countries: [], cities: [], places: [] });
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(apiUrl(`/api/search?q=${encodeURIComponent(query)}`))
        .then(res => res.json())
        .then(data => setResults(data))
        .catch(err => console.error('Search error:', err))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (tabTarget) => {
    setActiveTab(tabTarget);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        
        {/* Search input bar */}
        <div className="relative flex items-center mb-6">
          <Search size={22} className="absolute left-4 text-sky-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search countries, historical cities, or landmarks (e.g. Japan, Tokyo, Colosseum)..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl py-3.5 pl-12 pr-12 text-base text-white placeholder-slate-500 focus:outline-none shadow-inner"
          />
          <button
            onClick={onClose}
            className="absolute right-4 p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800/50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-8 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs">Searching global archives...</p>
          </div>
        )}

        {/* Search Results */}
        {!loading && query.trim() !== '' && (
          <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-2">
            
            {/* Countries */}
            {results.countries?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Globe size={14} className="text-sky-400" /> Countries
                </h4>
                <div className="space-y-2">
                  {results.countries.map(c => (
                    <div
                      key={c.slug}
                      onClick={() => handleSelect(`country:${c.slug}`)}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.flag}</span>
                        <span className="font-semibold text-white group-hover:text-sky-400 transition-colors">{c.name}</span>
                      </div>
                      <ArrowRight size={16} className="text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cities */}
            {results.cities?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin size={14} className="text-emerald-400" /> Cities
                </h4>
                <div className="space-y-2">
                  {results.cities.map(c => (
                    <div
                      key={c.slug}
                      onClick={() => handleSelect(`city:${c.slug}`)}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={c.hero_image} alt={c.name} loading="lazy" decoding="async" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.country_name}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Places */}
            {results.places?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Landmark size={14} className="text-amber-400" /> Famous Landmarks
                </h4>
                <div className="space-y-2">
                  {results.places.map(p => (
                    <div
                      key={p.slug}
                      onClick={() => handleSelect(`place:${p.slug}`)}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={p.main_image} alt={p.name} loading="lazy" decoding="async" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.city_name}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {results.countries?.length === 0 && results.cities?.length === 0 && results.places?.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <p className="text-base font-semibold text-slate-300">No destinations found matching "{query}"</p>
                <p className="text-xs text-slate-500 mt-1">Try searching for Japan, Tokyo, Rome, or Pyramids.</p>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default SearchModal;
