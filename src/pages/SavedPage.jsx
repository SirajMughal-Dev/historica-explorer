import React, { useState, useEffect, useContext } from 'react';
import { apiUrl } from '../lib/api';
import { Bookmark, MapPin, Landmark, ArrowRight, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const SavedPage = ({ setActiveTab, openAuthModal }) => {
  const { user, token } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(apiUrl('/api/user/favorites'), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFavorites(data))
      .catch(err => console.error('Error loading favorites:', err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleRemove = async (placeId) => {
    try {
      const res = await fetch(apiUrl('/api/user/favorites/toggle'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ place_id: placeId })
      });
      if (res.ok) {
        setFavorites(favorites.filter(item => item.id !== placeId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="container py-20 text-center text-slate-400 space-y-4">
        <Bookmark size={40} className="mx-auto text-amber-400" />
        <h2 className="text-2xl font-bold text-white">Login Required</h2>
        <p className="text-sm">Please sign in to view your saved places and historical bookmarks.</p>
        <button onClick={openAuthModal} className="btn-primary">
          Login / Signup
        </button>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <div className="badge-gold">SAVED ARCHIVES</div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white font-heading">
          Your Saved Bookmarks ({favorites.length})
        </h1>
        <p className="text-slate-400 text-sm">
          Quick access to your bookmarked landmarks and travel spots.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading saved places...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-900/40 rounded-3xl border border-slate-800">
          <p className="text-base font-bold text-white">No Bookmarks Saved Yet</p>
          <p className="text-xs text-slate-500">Browse places across Tokyo, Rome, and Giza to bookmark them!</p>
          <button onClick={() => setActiveTab('explore')} className="btn-primary">
            Explore Destinations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {favorites.map(place => (
            <div key={place.id} className="glass-card group overflow-hidden flex flex-col">
              <div className="h-44 overflow-hidden relative">
                <img src={place.main_image} alt={place.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <button
                  onClick={() => handleRemove(place.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 hover:bg-rose-500 text-slate-300 hover:text-white transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">{place.country_name} • {place.city_name}</span>
                  <h4 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors mt-1">{place.name}</h4>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-1">{place.overview}</p>
                </div>

                <button
                  onClick={() => { setActiveTab(`place:${place.slug}`); window.scrollTo(0,0); }}
                  className="pt-2 border-t border-slate-800 text-xs font-semibold text-amber-400 flex items-center justify-between group-hover:underline"
                >
                  <span>Open Details & Gallery</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPage;
