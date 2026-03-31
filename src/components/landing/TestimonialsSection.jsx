import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const rawTestimonials = [
  {
    id: 1,
    name: "Aarav Mehta",
    role: "Product Designer",
    location: "Berlin",
    image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=128&q=80",
    content:
      "The first week itself, someone invited me for chai at the common kitchen. That turned into a late-night rooftop bonfire with guitars, stories, and strangers who didn’t feel like strangers anymore.",
    rating: 5
  },
  {
    id: 2,
    name: "Zoya Khan",
    role: "Marketing Strategist",
    location: "Hamburg",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80",
    content:
      "I moved cities knowing no one. Within days, I had a movie club, weekend potlucks, and people knocking on my door asking if I was joining the bonfire night. I’ve never felt this included.",
    rating: 5
  },
  {
    id: 3,
    name: "Li Wei",
    role: "Data Analyst",
    location: "Bonn",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&q=80",
    content:
      "What I love is how natural friendships feel here. Board game nights turn into deep conversations. Cultural evenings turn into shared playlists. ARRIVIO makes connection effortless.",
    rating: 5
  },
  {
    id: 4,
    name: "Amara Okoye",
    role: "Creative Director",
    location: "Aachen",
    image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=128&q=80",
    content:
      "There’s something magical about sitting around a bonfire with people from five countries, laughing over food and music. It reminds you that home isn’t a place, it’s people.",
    rating: 5
  },
  {
    id: 5,
    name: "Oliver Grant",
    role: "Urban Planner",
    location: "Munich",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80",
    content:
      "From rooftop sunset sessions to community-run clubs, the energy here is calm yet alive. You can be quiet when you want, and connected when you need.",
    rating: 5
  }
];

// Duplicate for infinite scroll
const testimonials = [...rawTestimonials, ...rawTestimonials];

const TestimonialsSection = () => {
  const { t } = useLanguage();
  return (
    <section className="py-24 bg-[#f2f2f2] overflow-hidden">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 mb-6 opacity-60"
          >
            <div className="w-8 h-[1px] bg-[#0f4c3a]"></div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#111827] font-sans">
              {t("testimonials.label")}
            </span>
            <div className="w-8 h-[1px] bg-[#0f4c3a]"></div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] leading-tight mb-6"
          >
            {t("testimonials.title1")} <br />
            <span className="italic text-[#111827]">{t("testimonials.title2")}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#5C5C50] font-sans text-lg max-w-2xl mx-auto"
          >
            {t("testimonials.subtitle")}
          </motion.p>
        </div>
      </div>

      {/* MARQUEE */}
      <div className="relative w-full">
        <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-[#f2f2f2] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#f2f2f2] to-transparent z-10 pointer-events-none"></div>

        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-8 px-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 45 }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${index}`}
                className="w-[350px] md:w-[450px] flex-shrink-0"
              >
                <div className="relative bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-lg shadow-black/5 hover:shadow-xl hover:bg-white/60 transition-all duration-300 h-full flex flex-col hover:-translate-y-1">

                  <div className="absolute top-8 right-8 text-[#111827]/10">
                    <Quote size={48} fill="currentColor" />
                  </div>

                  <div className="flex gap-1 mb-6 text-[#D4A017]">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>

                  <p className="text-[#1A1A1A]/80 font-serif text-lg leading-relaxed mb-8 flex-grow italic">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center gap-4 mt-auto">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#0f4c3a]/20"
                      loading="lazy"
                      decoding="async"
                    />
                    <div>
                      <h4 className="font-sans font-bold text-[#1A1A1A] text-sm">
                        {testimonial.name}
                      </h4>
                      <p className="text-[10px] text-[#5C5C50] font-bold uppercase tracking-wider">
                        {testimonial.role} • {testimonial.location}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

    </section>
  );
};

export default TestimonialsSection;

