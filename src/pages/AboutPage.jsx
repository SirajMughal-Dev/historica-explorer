import React from 'react';
import { Compass, BookOpen, Utensils, Globe, Shield, Award, Users, ArrowRight, MessageCircle, Languages, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ScrollReveal from '../components/ScrollReveal';

const AboutPage = ({ setActiveTab }) => {
  const { t } = useLanguage();
  return (
    <div className="container py-12 space-y-16 animate-fade-in">
      
      {/* Header */}
      <div className="max-w-3xl space-y-4 text-center mx-auto">
        <div className="badge-tag mx-auto">{t('about_title').toUpperCase()}</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-heading leading-tight">
          Restoring Depth & Authenticity to Global Travel
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          {t('about_subtitle')} Historica Explorer exists to replace superficial travel listicles with editorial-grade history, living cultural traditions, regional food stories, and a personal AI guide that can answer questions in the language you're most comfortable in.
        </p>
      </div>

      {/* Purpose */}
      <ScrollReveal className="max-w-4xl mx-auto content-section-card space-y-3">
        <div className="content-section-icon bg-sky-500/15 text-sky-400">
          <Compass size={24} />
        </div>
        <h3 className="text-xl font-bold text-white font-heading">Our Purpose</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          Most travel sites reduce a country to a photo and a sentence. We built Historica Explorer to do the opposite: to give every country, city, and landmark the same depth you'd expect from a knowledgeable local guide — real history, real cultural context, real food, and now, real conversation through our built-in AI assistant.
        </p>
      </ScrollReveal>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ScrollReveal delay={0} className="content-section-card space-y-4">
          <div className="content-section-icon bg-sky-500/15 text-sky-400">
            <BookOpen size={24} />
          </div>
          <h3 className="text-xl font-bold text-white font-heading">Historical Rigor</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every country, city, and monument is accompanied by verified historical timelines, origins, and cultural significance rather than short summary snippets.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={100} className="content-section-card space-y-4 border-l-amber-500">
          <div className="content-section-icon bg-amber-500/15 text-amber-400">
            <Utensils size={24} />
          </div>
          <h3 className="text-xl font-bold text-white font-heading">Gastronomic Heritage</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            We celebrate food as a living cultural chronicle—documenting street food markets, regional specialty dishes, and centuries-old culinary secrets.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200} className="content-section-card space-y-4 border-l-purple-500">
          <div className="content-section-icon bg-purple-500/15 text-purple-400">
            <Globe size={24} />
          </div>
          <h3 className="text-xl font-bold text-white font-heading">Multi-Photo Galleries</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Each landmark features 3-5 high-resolution photography assets with interactive lightbox controls so users can visualize destinations in vivid detail.
          </p>
        </ScrollReveal>
      </div>

      {/* Feature Highlights */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white font-heading text-center">What Makes Historica Explorer Different</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal delay={0} className="content-section-card space-y-4 border-l-sky-500">
            <div className="content-section-icon bg-sky-500/15 text-sky-400">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-white font-heading">AI Travel Guide</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              A built-in AI assistant, available on every page, that answers questions about countries, cities, landmarks, and food — and knows what page you're on so it can give context-aware answers.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100} className="content-section-card space-y-4 border-l-emerald-500">
            <div className="content-section-icon bg-emerald-500/15 text-emerald-400">
              <Languages size={24} />
            </div>
            <h3 className="text-xl font-bold text-white font-heading">Multi-Language Support</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Browse the interface and chat with our assistant in English, Urdu, or Chinese, with more languages planned as the platform grows.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200} className="content-section-card space-y-4 border-l-amber-500">
            <div className="content-section-icon bg-amber-500/15 text-amber-400">
              <MapPin size={24} />
            </div>
            <h3 className="text-xl font-bold text-white font-heading">Growing World Coverage</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              From Japan and Egypt to Pakistan, the UAE, and beyond — a simple, consistent Country → City → Landmark structure that's easy to browse and easy to grow.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Stats Counter Banner */}
      <ScrollReveal y={30} className="rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <p className="text-3xl md:text-5xl font-extrabold text-sky-400 font-heading">15</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">Countries Covered</p>
        </div>
        <div>
          <p className="text-3xl md:text-5xl font-extrabold text-amber-400 font-heading">3–5</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">Images Per Landmark</p>
        </div>
        <div>
          <p className="text-3xl md:text-5xl font-extrabold text-purple-400 font-heading">3</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">Languages Supported</p>
        </div>
        <div>
          <p className="text-3xl md:text-5xl font-extrabold text-emerald-400 font-heading">24/7</p>
          <p className="text-xs text-slate-400 font-semibold mt-1">AI Travel Guide</p>
        </div>
      </ScrollReveal>

      {/* Action CTA */}
      <div className="text-center space-y-4 pt-6">
        <h3 className="text-2xl font-bold text-white font-heading">Ready to Begin Your Cultural Journey?</h3>
        <button onClick={() => setActiveTab('explore')} className="btn-primary">
          <Compass size={20} />
          <span>Explore Destination Archives</span>
          <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
};

export default AboutPage;
