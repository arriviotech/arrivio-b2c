import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, ChevronLeft, ChevronRight, Grid, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PropertyGallery = ({ images, title, rating, property }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Safe fallback if images are missing
  const uniqueImages = images && images.length > 0 ? images : ["/api/placeholder/800/600"];

  const openLightbox = (index) => {
    const realIndex = index % uniqueImages.length;
    setCurrentImageIndex(realIndex);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % uniqueImages.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, uniqueImages.length, currentImageIndex]);

  return (
    <>
      {/* --- SURROUND GRID GALLERY (Desktop) --- */}
      <div className="hidden md:grid grid-cols-12 grid-rows-3 gap-1.5 h-[500px] mb-8 rounded-[2.5rem] overflow-hidden">

        {/* 1. MAIN IMAGE (Top-Left 8x2) */}
        <div className="col-span-8 row-span-2 relative group cursor-pointer overflow-hidden rounded-tl-[2.5rem] bg-gray-200">
          <div className="w-full h-full relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                src={uniqueImages[currentImageIndex]}
                alt={`${title} - View ${currentImageIndex + 1}`}
                onClick={() => openLightbox(currentImageIndex)}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </AnimatePresence>



            {/* NAVIGATION ARROWS */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button onClick={prevImage} className="p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-xl hover:bg-white transition-all transform hover:scale-110 active:scale-95">
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextImage} className="p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-xl hover:bg-white transition-all transform hover:scale-110 active:scale-95">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* 2. SIDE COLUMN (Top-Right Stack) */}
        <div className="col-span-4 row-span-1 relative group cursor-pointer overflow-hidden rounded-tr-[2.5rem] bg-gray-200">
          <img
            src={uniqueImages[1] || uniqueImages[0]}
            onClick={() => openLightbox(1)}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            alt="Side 1"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </div>

        <div className="col-span-4 row-span-1 relative group cursor-pointer overflow-hidden bg-gray-200">
          <img
            src={uniqueImages[2] || uniqueImages[0]}
            onClick={() => openLightbox(2)}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            alt="Side 2"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </div>

        {/* 3. BOTTOM ROW (Full Width) */}
        <div className="col-span-4 row-span-1 relative group cursor-pointer overflow-hidden rounded-bl-[2.5rem] bg-gray-200">
          <img
            src={uniqueImages[3] || uniqueImages[0]}
            onClick={() => openLightbox(3)}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            alt="Bottom 1"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </div>

        <div className="col-span-4 row-span-1 relative group cursor-pointer overflow-hidden bg-gray-200">
          <img
            src={uniqueImages[4] || uniqueImages[0]}
            onClick={() => openLightbox(4)}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            alt="Bottom 2"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </div>

        {/* Final Block: Show All Photos */}
        <div
          className="col-span-4 row-span-1 relative group cursor-pointer overflow-hidden rounded-br-[2.5rem] bg-gray-200"
          onClick={() => openLightbox(0)}
        >
          <img
            src={uniqueImages[5] || uniqueImages[0]}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-60"
            alt="See More"
          />
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-center text-white p-4">
            <span className="text-2xl font-serif mb-1">+{uniqueImages.length}</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/10">
              <Grid size={14} />
              <span className="text-xs font-bold uppercase tracking-widest text-white">Photos</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE CAROUSEL (Keep original simple UX) --- */}
      <div className="md:hidden relative w-full aspect-[4/3] max-h-[360px] mb-6 rounded-3xl overflow-hidden group shadow-lg">
        <div
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
          onScroll={(e) => {
            const scrollLeft = e.currentTarget.scrollLeft;
            const width = e.currentTarget.offsetWidth;
            const newIndex = Math.round(scrollLeft / width);
            if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
          }}
        >
          {uniqueImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`View ${index + 1}`}
              onClick={() => openLightbox(index)}
              className="w-full h-full flex-shrink-0 snap-center object-cover"
              loading="lazy"
            />
          ))}
        </div>
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium pointer-events-none">
          {currentImageIndex + 1} / {uniqueImages.length}
        </div>
      </div>

      {/* --- ORIGINAL LIGHTBOX MODAL (Restored) --- */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* 1. Header Area (Compact) */}
            <div className="w-full p-4 md:p-6 flex justify-between items-center z-[210] pointer-events-none">
              {/* Counter (Minimal) */}
              <div className="pointer-events-auto text-white/60 text-xs font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
                {currentImageIndex + 1} / {uniqueImages.length}
              </div>

              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="pointer-events-auto p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all group active:scale-95 backdrop-blur-md"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* 2. Main Image Area (Maximized Canvas) */}
            <div className="relative flex-grow flex items-center justify-center overflow-hidden px-2 md:px-4">
              {/* Navigation Arrows (Low-profile) */}
              <button
                onClick={prevImage}
                className="absolute left-2 md:left-6 p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all z-[210] backdrop-blur-sm"
              >
                <ChevronLeft size={48} strokeWidth={1} />
              </button>

              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={uniqueImages[currentImageIndex]}
                onClick={(e) => e.stopPropagation()}
                alt="Fullscreen"
                className="max-w-full max-h-full object-contain rounded-sm shadow-2xl z-[205]"
              />

              <button
                onClick={nextImage}
                className="absolute right-2 md:right-6 p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all z-[210] backdrop-blur-sm"
              >
                <ChevronRight size={48} strokeWidth={1} />
              </button>
            </div>

            {/* 3. Thumbnails Strip (Compact) */}
            <div className="w-full flex justify-center py-6 px-4 z-[210]" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-full">
                {uniqueImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-14 h-11 md:w-20 md:h-14 rounded overflow-hidden flex-shrink-0 transition-opacity ${currentImageIndex === idx ? 'opacity-100' : 'opacity-40 hover:opacity-100'
                      }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="thumb" />
                    {currentImageIndex === idx && (
                      <div className="absolute inset-0 border-2 border-white rounded-[1px] pointer-events-none z-10" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertyGallery;