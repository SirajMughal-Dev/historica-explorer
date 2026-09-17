import React, { useState, useEffect, useContext } from 'react';
import { apiUrl } from '../lib/api';
import { BookOpen, MapPin, Landmark, Sparkles, Image as ImageIcon, Bookmark, ArrowRight, CheckCircle2, ChevronLeft, Eye } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import LightboxModal from '../components/LightboxModal';
import ScrollReveal from '../components/ScrollReveal';

const PlaceDetailPage = ({ placeSlug, setActiveTab, openAuthModal }) => {
  const { user, token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Lightbox Modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl(`/api/places/${placeSlug}`))
      .then(res => {
        if (!res.ok) throw new Error('Place record not found');
        return res.json();
      })
      .then(data => {
        setData(data);
        if (token) checkIfFavorite(data.id);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [placeSlug, token]);

  const checkIfFavorite = async (placeId) => {
    try {
      const res = await fetch(apiUrl('/api/user/favorites'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        const found = list.some(item => item.id === placeId);
        setIsFavorite(found);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    try {
      const res = await fetch(apiUrl('/api/user/favorites/toggle'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ place_id: data.id })
      });
      const result = await res.json();
      if (res.ok) {
        setIsFavorite(result.isFavorite);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openLightbox = (index) => {
    setActivePhotoIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="container py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm">Retrieving landmark archive...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-20 text-center text-slate-400 space-y-4">
        <h2 className="text-2xl font-bold text-white">Landmark Record Not Found</h2>
        <p className="text-sm">{error || 'Unable to load place data.'}</p>
        <button onClick={() => setActiveTab('explore')} className="btn-primary">
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-14 pb-16 animate-fade-in">
      
      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={data.images || [data.main_image]}
        initialIndex={activePhotoIndex}
        placeName={data.name}
      />

      {/* Hero Header */}
      <section className="relative h-[52vh] min-h-[380px] flex items-end pb-10 overflow-hidden border-b border-slate-800">
        <img
          src={data.main_image}
          alt={data.name}
          fetchpriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20"></div>

        <div className="container relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setActiveTab(`city:${data.city_slug}`); window.scrollTo(0,0); }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:underline bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur-md"
              >
                <ChevronLeft size={16} /> Back to {data.city_name} Guide
              </button>
            </div>

            {/* Bookmark Action */}
            <button
              onClick={handleToggleBookmark}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 border shadow-lg ${
                isFavorite
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20'
                  : 'bg-slate-900/80 text-white border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Bookmark size={16} className={isFavorite ? 'fill-slate-950' : ''} />
              <span>{isFavorite ? 'Saved in Explorer Bookmarks' : 'Bookmark Landmark'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
              <span>{data.country_flag}</span>
              <span>{data.country_name}</span>
              <span>•</span>
              <span>{data.city_name}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white font-heading">
              {data.name}
            </h1>
          </div>
        </div>
      </section>

      <div className="container grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Details Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* SECTION 1: OVERVIEW */}
          <section id="place-overview" className="content-section-card">
            <div className="content-section-header">
              <div className="content-section-icon bg-sky-500/15 text-sky-400">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading">
                  1. Overview & Architectural Significance
                </h2>
                <p className="text-xs text-slate-400">Essential introduction and global status</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {data.overview}
            </p>
          </section>

          {/* SECTION 2: HISTORY */}
          <section id="place-history" className="content-section-card">
            <div className="content-section-header">
              <div className="content-section-icon bg-purple-500/15 text-purple-400">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading">
                  2. Historical Origin & Chronicles
                </h2>
                <p className="text-xs text-slate-400">Founding era, construction legend, and historical lineage</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {data.history}
            </p>
          </section>

          {/* SECTION 3: HIGHLIGHTS */}
          <section id="place-highlights" className="content-section-card">
            <div className="content-section-header">
              <div className="content-section-icon bg-amber-500/15 text-amber-400">
                <Landmark size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading">
                  3. Key Architectural Highlights
                </h2>
                <p className="text-xs text-slate-400">Top features, sacred elements & design marvels</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.highlights && data.highlights.map((highlight, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-200 font-semibold leading-relaxed">{highlight}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: VISITOR EXPERIENCE */}
          <section id="place-experience" className="content-section-card border-l-emerald-500">
            <div className="content-section-header">
              <div className="content-section-icon bg-emerald-500/15 text-emerald-400">
                <Eye size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading">
                  4. Visitor Experience & Atmosphere
                </h2>
                <p className="text-xs text-slate-400">Sensory journey, best times to visit & spiritual ambiance</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              {data.visitor_experience}
            </p>
          </section>

          {/* SECTION 5: 3-5 PHOTO GALLERY (MANDATORY REQUIREMENT) */}
          <section id="place-gallery" className="content-section-card">
            <div className="content-section-header">
              <div className="content-section-icon bg-sky-500/15 text-sky-400">
                <ImageIcon size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2">
                  5. High-Resolution Photo Gallery
                  <span className="badge-tag">{data.images?.length || 1} High-Res Imagery</span>
                </h2>
                <p className="text-xs text-slate-400">Click any image to expand full-screen lightbox slider</p>
              </div>
            </div>

            <div className="gallery-grid">
              {data.images && data.images.map((imgUrl, idx) => (
                <ScrollReveal
                  key={idx}
                  delay={(idx % 4) * 80}
                  y={16}
                  onClick={() => openLightbox(idx)}
                  className="gallery-item group"
                >
                  <img src={imgUrl} alt={`${data.name} gallery ${idx + 1}`} loading="lazy" decoding="async" />
                  <div className="gallery-overlay">
                    <div className="flex items-center gap-2 text-white text-xs font-bold">
                      <Eye size={16} className="text-sky-400" />
                      <span>Click to Enlarge ({idx + 1}/{data.images.length})</span>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white font-heading">Landmark Quick Info</h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Country</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    {data.country_flag} {data.country_name}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">City</span>
                  <span className="font-bold text-white">{data.city_name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Gallery Photos</span>
                  <span className="font-bold text-sky-400">{data.images?.length || 1} Photos Available</span>
                </div>
              </div>

              <button
                onClick={handleToggleBookmark}
                className="w-full btn-primary py-2.5 text-xs justify-center"
              >
                <Bookmark size={16} />
                <span>{isFavorite ? 'Saved in Bookmarks' : 'Save to Favorites'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PlaceDetailPage;
