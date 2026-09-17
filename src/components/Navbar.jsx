import logo from '../assets/logo.png'
import React, { useState, useContext } from 'react';
import { Compass, Plane, Search, User, LogOut, Menu, X, Bookmark, Globe2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../i18n/translations';

const Navbar = ({ activeTab, setActiveTab, openAuthModal, openSearchModal }) => {
  const { user, logout } = useContext(AuthContext);
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('nav_home') },
    { id: 'explore', label: t('nav_explore') },
    { id: 'about', label: t('nav_about') },
    { id: 'contact', label: t('nav_contact') }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 py-3 transition-all duration-300">
      <div className="container flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center drop-shadow-[0_4px_14px_rgba(34,168,98,0.35)] group-hover:scale-105 group-hover:drop-shadow-[0_6px_18px_rgba(34,168,98,0.5)] transition-all duration-300">
            <img src={logo} alt="Historica Explorer logo" className="logo" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xl tracking-tight text-white font-heading">
              HISTORICA <span className="text-sky-400 font-extrabold flex items-center gap-1">EXPLORER <Plane size={16} className="transform rotate-45 text-sky-400" /></span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">CULTURAL & HISTORICAL TRAVEL</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80">
          {navItems.map((item) => {
            const isActive = activeTab === item.id || (activeTab.startsWith(item.id));
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-link px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Search Button */}
          <button
            onClick={openSearchModal}
            className="p-2.5 rounded-full bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 transition-all flex items-center gap-2 px-4 text-xs font-medium"
          >
            <Search size={16} className="text-sky-400" />
            <span>{t('nav_search_placeholder')}</span>
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(prev => !prev)}
              className="p-2.5 rounded-full bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 transition-all"
              title={t('chat_language_label')}
            >
              <Globe2 size={18} />
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-28 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-10">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setLangMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      language === lang.code ? 'bg-sky-500/20 text-sky-400' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick('saved')}
                className={`p-2.5 rounded-full border transition-all ${
                  activeTab === 'saved'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:text-white'
                }`}
                title="Saved Places"
              >
                <Bookmark size={18} />
              </button>

              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-full">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={logout}
                  className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="btn-primary"
            >
              <User size={18} />
              <span>{t('nav_login')} / Signup</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={openSearchModal}
            className="p-2 rounded-full bg-slate-800/60 text-slate-300"
          >
            <Search size={20} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 px-6 py-6 space-y-4 animate-slide-down">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                  activeTab === item.id ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-300 hover:bg-slate-900 hover:translate-x-1'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Language Switcher (mobile) */}
          <div className="flex items-center gap-2 pt-2">
            <Globe2 size={16} className="text-slate-400" />
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  language === lang.code ? 'bg-sky-500 text-white' : 'bg-slate-800/60 text-slate-300'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-semibold"
                >
                  {t('nav_logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => { openAuthModal(); setMobileMenuOpen(false); }}
                className="w-full btn-primary"
              >
                <User size={18} />
                <span>{t('nav_login')} / Signup</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
