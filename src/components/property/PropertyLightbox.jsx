import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Grid } from 'lucide-react';

const PropertyLightbox = ({ isOpen, onClose, images, title }) => {
    // Prevent scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col"
            >
                {/* TOOLBAR */}
                <div className="flex items-center justify-between p-6 px-8 text-white/70">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                            Arrivio Immersive Gallery
                        </span>
                        <h4 className="font-serif text-xl text-white">{title}</h4>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all group active:scale-90"
                    >
                        <X size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* CONTENT: MASONRY-ISH GRID */}
                <div className="flex-grow overflow-y-auto no-scrollbar p-4 md:p-12">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                            className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
                        >
                            {images.map((img, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    className="relative group rounded-2xl overflow-hidden bg-white/5 border border-white/10"
                                >
                                    <img
                                        src={img}
                                        alt={`${title} - ${idx + 1}`}
                                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700 ease-out"
                                        loading="lazy"
                                    />
                                    {/* Sublte Overlay on Hover */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-8 flex justify-center border-t border-white/5 bg-black/40">
                    <div className="flex items-center gap-2 text-white/40 text-xs uppercase font-bold tracking-widest">
                        <Grid size={12} />
                        {images.length} High Resolution Images
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PropertyLightbox;
