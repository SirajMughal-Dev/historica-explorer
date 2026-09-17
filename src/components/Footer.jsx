import React from 'react';
import { Compass, Plane, Heart, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = ({ setActiveTab }) => {
  const { t } = useLanguage();
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 mt-20 text-slate-400">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand info */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2 font-bold text-xl text-white font-heading">
            <Compass className="text-sky-400" size={26} />
            HISTORICA <span className="text-sky-400">EXPLORER</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            {t('footer_tagline')}
          </p>
          <div className="flex items-center gap-3 pt-2 text-slate-400">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-pointer">
              <Globe size={16} />
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-pointer">
              <Mail size={16} />
            </div>
          </div>
        </div>

        {/* Quick Nav */}
        <div>
          <h4 className="text-white font-bold text-base mb-4 font-heading tracking-wide">EXPLORE WORLD</h4>
          <ul className="space-y-2.5 text-sm">
            <li><button onClick={() => { setActiveTab('country:japan'); window.scrollTo(0,0); }} className="hover:text-sky-400 transition-colors">Japan Heritage Guide</button></li>
            <li><button onClick={() => { setActiveTab('country:italy'); window.scrollTo(0,0); }} className="hover:text-sky-400 transition-colors">Italy Renaissance & Empire</button></li>
            <li><button onClick={() => { setActiveTab('country:egypt'); window.scrollTo(0,0); }} className="hover:text-sky-400 transition-colors">Egypt Ancient Wonders</button></li>
            <li><button onClick={() => { setActiveTab('country:france'); window.scrollTo(0,0); }} className="hover:text-sky-400 transition-colors">France Art & Riviera</button></li>
            <li><button onClick={() => { setActiveTab('country:greece'); window.scrollTo(0,0); }} className="hover:text-sky-400 transition-colors">Greece Islands & Myth</button></li>
            <li><button onClick={() => { setActiveTab('country:peru'); window.scrollTo(0,0); }} className="hover:text-sky-400 transition-colors">Peru Andes & Inca Trail</button></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-bold text-base mb-4 font-heading tracking-wide">{t('footer_quick_links').toUpperCase()}</h4>
          <ul className="space-y-2.5 text-sm">
            <li><button onClick={() => { setActiveTab('home'); window.scrollTo(0,0); }} className="hover:text-sky-400 transition-colors">{t('nav_home')}</button></li>
            <li><button onClick={() => { setActiveTab('explore'); window.scrollTo(0,0); }} className="hover:text-sky-400 transition-colors">{t('footer_destinations')}</button></li>
            <li><button onClick={() => { setActiveTab('about'); window.scrollTo(0,0); }} className="hover:text-sky-400 transition-colors">{t('nav_about')}</button></li>
            <li><button onClick={() => { setActiveTab('contact'); window.scrollTo(0,0); }} className="hover:text-sky-400 transition-colors">{t('nav_contact')}</button></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-bold text-base mb-4 font-heading tracking-wide">HISTORICA DISPATCH</h4>
          <p className="text-sm text-slate-400 mb-3">
            Subscribe for curated monthly travel dispatches, hidden history logs, and culinary maps.
          </p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500 w-full"
            />
            <button className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1">
              <Plane size={16} className="transform rotate-45" />
            </button>
          </div>
        </div>

      </div>

      <div className="container border-t border-slate-900 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>© 2026 Historica Explorer. {t('footer_rights')}</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart size={14} className="text-rose-500 fill-rose-500" /> for global travelers & history lovers
        </p>
      </div>
    </footer>
  );
};

export default Footer;
