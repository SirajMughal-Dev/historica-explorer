import React, { useState } from 'react';
import { apiUrl } from '../lib/api';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Phone, MapPin, Globe, ChevronDown, ChevronUp } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'How detailed is the historical and culinary content on Historica Explorer?',
      a: 'We strictly mandate well-explained, medium-to-long form travel blog articles. Every city features a dedicated Food & Cuisine section outlining famous street food, regional delicacies, and dining culture.'
    },
    {
      q: 'How many images are provided for each tourist landmark?',
      a: 'Every tourist location includes a minimum of 3 to 5 high-resolution curated photos accessible via an interactive full-screen lightbox modal.'
    },
    {
      q: 'Is user authentication required to browse the site?',
      a: 'No! Anyone can explore countries, cities, and landmarks freely. Creating an account or logging in with JWT allows you to save and bookmark favorite places for future trips.'
    }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus({ loading: false, success: null, error: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ loading: false, success: null, error: 'Please complete all required fields.' });
      return;
    }

    setStatus({ loading: true, success: null, error: null });

    try {
      const res = await fetch(apiUrl('/api/user/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ loading: false, success: data.message, error: null });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error(data.error || 'Failed to submit message.');
      }
    } catch (err) {
      setStatus({ loading: false, success: null, error: err.message });
    }
  };

  return (
    <div className="container py-12 space-y-16 animate-fade-in">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="badge-tag">CONCIERGE & SUPPORT</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white font-heading">
          Get in Touch with Historica
        </h1>
        <p className="text-slate-300 text-base">
          Have questions about specific cultural archives, partnership opportunities, or travel itineraries? Send us a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Contact Form (2 Cols) */}
        <div className="lg:col-span-2">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            
            <h3 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
              <MessageSquare className="text-sky-400" size={24} />
              Send a Direct Message
            </h3>

            {status.success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-start gap-3">
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                <span>{status.success}</span>
              </div>
            )}

            {status.error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <span>{status.error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alexander Wright"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alexander@example.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Cultural Guide Feedback or Itinerary Query"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Message Content *
                </label>
                <textarea
                  rows="5"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message or inquiry here..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition-colors resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status.loading}
                className="btn-primary py-3.5 px-8 text-sm"
              >
                {status.loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

        {/* Sidebar Info & FAQ */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white font-heading">Global Concierge HQ</h3>
            
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-sky-400" />
                <span>concierge@historica-explorer.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-emerald-400" />
                <span>www.historica-explorer.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-amber-400" />
                <span>Global Heritage Bureau, Tokyo & Rome</span>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white font-heading">Frequently Asked Questions</h3>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-slate-800 pb-3">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left flex items-center justify-between text-xs font-bold text-slate-200 hover:text-sky-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {openFaq === idx && (
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed animate-fade-in">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ContactPage;
