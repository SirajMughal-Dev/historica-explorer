import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

const LightboxModal = ({ images = [], initialIndex = 0, isOpen, onClose, placeName }) => {
  if (!isOpen || images.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      
      {/* Top Header Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800">
          <ImageIcon size={18} className="text-sky-400" />
          <span className="text-sm font-bold text-white font-heading">{placeName}</span>
          <span className="text-xs text-slate-400 font-medium">({currentIndex + 1} of {images.length})</span>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
        >
          <X size={22} />
        </button>
      </div>

      {/* Main Image View */}
      <div className="relative max-w-5xl w-full h-[70vh] flex items-center justify-center">
        <img
          src={images[currentIndex]}
          alt={`${placeName} photo ${currentIndex + 1}`}
          className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800/80 transition-all duration-300"
        />

        {/* Previous Button */}
        <button
          onClick={prevImage}
          className="absolute left-4 p-3 rounded-full bg-slate-900/80 hover:bg-sky-500 text-white border border-slate-800 transition-colors shadow-lg"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Next Button */}
        <button
          onClick={nextImage}
          className="absolute right-4 p-3 rounded-full bg-slate-900/80 hover:bg-sky-500 text-white border border-slate-800 transition-colors shadow-lg"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-3 px-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
              currentIndex === idx ? 'border-sky-400 scale-110 shadow-lg shadow-sky-500/30' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={img} alt={`thumb ${idx}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

    </div>
  );
};

export default LightboxModal;
