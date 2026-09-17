import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import SearchModal from './components/SearchModal';
import ChatWidget from './components/ChatWidget';

import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import CountryDetailPage from './pages/CountryDetailPage';
import CityDetailPage from './pages/CityDetailPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SavedPage from './pages/SavedPage';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Render view router based on activeTab
  const renderCurrentPage = () => {
    if (activeTab === 'home') {
      return <HomePage setActiveTab={setActiveTab} openSearchModal={() => setSearchModalOpen(true)} />;
    }
    if (activeTab === 'explore') {
      return <ExplorePage setActiveTab={setActiveTab} />;
    }
    if (activeTab === 'about') {
      return <AboutPage setActiveTab={setActiveTab} />;
    }
    if (activeTab === 'contact') {
      return <ContactPage />;
    }
    if (activeTab === 'saved') {
      return <SavedPage setActiveTab={setActiveTab} openAuthModal={() => setAuthModalOpen(true)} />;
    }

    // Dynamic country detail page: "country:slug"
    if (activeTab.startsWith('country:')) {
      const slug = activeTab.replace('country:', '');
      return <CountryDetailPage countrySlug={slug} setActiveTab={setActiveTab} />;
    }

    // Dynamic city detail page: "city:slug"
    if (activeTab.startsWith('city:')) {
      const slug = activeTab.replace('city:', '');
      return <CityDetailPage citySlug={slug} setActiveTab={setActiveTab} />;
    }

    // Dynamic place detail page: "place:slug"
    if (activeTab.startsWith('place:')) {
      const slug = activeTab.replace('place:', '');
      return (
        <PlaceDetailPage
          placeSlug={slug}
          setActiveTab={setActiveTab}
          openAuthModal={() => setAuthModalOpen(true)}
        />
      );
    }

    return <HomePage setActiveTab={setActiveTab} openSearchModal={() => setSearchModalOpen(true)} />;
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen flex flex-col justify-between selection:bg-sky-500 selection:text-white">

          {/* Navigation Bar */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openAuthModal={() => setAuthModalOpen(true)}
            openSearchModal={() => setSearchModalOpen(true)}
          />

          {/* Main View Area */}
          <main className="flex-1">
            {renderCurrentPage()}
          </main>

          {/* Footer */}
          <Footer setActiveTab={setActiveTab} />

          {/* Global Modals */}
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
          />

          <SearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            setActiveTab={setActiveTab}
          />

          {/* Global AI Chatbot — visible on every page */}
          <ChatWidget activeTab={activeTab} />

        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
