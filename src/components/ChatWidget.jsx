import React, { useState, useRef, useEffect } from 'react';
import { apiUrl } from '../lib/api';
import { MessageCircle, X, Send, Globe2, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../i18n/translations';

// Reads the current page context (country/city) out of the App's activeTab string
// so the assistant can answer "what's the food like here" style questions correctly.
const parseContext = (activeTab) => {
  if (!activeTab) return {};
  if (activeTab.startsWith('country:')) {
    return { contextCountrySlug: activeTab.replace('country:', '') };
  }
  if (activeTab.startsWith('city:')) {
    return { contextCityName: activeTab.replace('city:', '') };
  }
  return {};
};

const ChatWidget = ({ activeTab }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          language,
          ...parseContext(activeTab)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || t('chat_error'));
        setIsLoading(false);
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setErrorMsg(t('chat_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating toggle button — visible on every page */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={t('chat_button_label')}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] glass-nav rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-down border border-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
            <div>
              <p className="font-heading font-bold text-white text-sm">{t('chat_title')}</p>
              <p className="text-xs text-slate-400">{t('chat_subtitle')}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(prev => !prev)}
                aria-label={t('chat_language_label')}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Globe2 size={18} />
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
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
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <div className="bg-slate-800/60 text-slate-200 text-sm rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
              {t('chat_greeting')}
            </div>

            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm px-4 py-2.5 max-w-[85%] rounded-2xl ${
                  m.role === 'user'
                    ? 'ml-auto bg-sky-500 text-white rounded-br-sm'
                    : 'bg-slate-800/60 text-slate-200 rounded-tl-sm'
                }`}
              >
                {m.content}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-sm px-4 py-2.5">
                <Loader2 size={14} className="animate-spin" />
                {t('chat_thinking')}
              </div>
            )}

            {errorMsg && (
              <div className="text-sm px-4 py-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 max-w-[90%]">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-800 p-3 flex items-center gap-2 bg-slate-950/60">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat_placeholder')}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label={t('chat_send')}
              className="w-10 h-10 flex-shrink-0 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
