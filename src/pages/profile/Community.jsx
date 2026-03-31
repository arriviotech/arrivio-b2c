import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  Users, Calendar, MessageCircle, Coffee, Music, Dumbbell,
  Camera, BookOpen, Utensils, Bike, Sparkles, ArrowRight
} from "lucide-react";
import SEO from "../../components/common/SEO";

import communityImg1 from "../../assets/communityImg1.jpeg";
import communityImg2 from "../../assets/communityImg2.jpeg";
import communityImg3 from "../../assets/communityImg3.jpeg";
import communityImg4 from "../../assets/communityImg4.jpeg";
import communityImg5 from "../../assets/communityImg5.jpeg";
import communityImg6 from "../../assets/communityImg6.jpeg";

const FEATURES = [
  { icon: Calendar, label: "Events", desc: "Property movie nights, rooftop BBQs, welcome parties", color: "#E8F5E9" },
  { icon: MessageCircle, label: "Feed", desc: "Share updates, ask questions, post recommendations", color: "#FFF3E0" },
  { icon: Coffee, label: "Shared Spaces", desc: "Book co-working desks, yoga rooms, lounge areas", color: "#E3F2FD" },
  { icon: Users, label: "Neighbours", desc: "See who lives nearby, connect over shared interests", color: "#F3E5F5" },
  { icon: Music, label: "Clubs", desc: "Join hiking, photography, cooking, or language clubs", color: "#FFF8E1" },
  { icon: Dumbbell, label: "Wellness", desc: "Community yoga, gym buddy finder, meditation groups", color: "#E0F2F1" },
];

const UPCOMING_EVENTS = [
  { title: "Welcome Brunch", date: "Every 1st Saturday", icon: Utensils, img: communityImg1 },
  { title: "Photography Walk", date: "Bi-weekly, Sundays", icon: Camera, img: communityImg2 },
  { title: "Book Club", date: "Monthly, Thursdays", icon: BookOpen, img: communityImg3 },
  { title: "City Bike Tour", date: "Weekly, Saturdays", icon: Bike, img: communityImg4 },
];

const TESTIMONIALS = [
  { name: "Maya", text: "Found my running buddy through the community board on day one!", img: communityImg5 },
  { name: "Rohan", text: "The co-working lounge bookings saved me from crowded cafes.", img: communityImg6 },
];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const Community = () => {
  return (
    <div className="space-y-6">
      <SEO title="Community" path="/profile/community" />

      {/* ── HERO ── */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
        <div className="relative bg-gradient-to-br from-[#0f4c3a] to-[#1a6b52] px-6 py-10 md:px-10 md:py-14 text-center overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-5">
              <Users size={26} className="text-white" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-white mb-3">Your Community Hub</h2>
            <p className="text-sm text-white/70 max-w-md mx-auto leading-relaxed">
              Connect with your neighbours, join events, book shared spaces, and make your building feel like home.
            </p>
          </motion.div>

          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <Sparkles size={14} className="text-[#D4A017]" />
            <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Unlocks at move-in</span>
          </motion.div>
        </div>
      </div>

      {/* ── FEATURES GRID ── */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, label, desc, color }) => (
          <motion.div
            key={label}
            variants={fadeUp}
            className="bg-white rounded-2xl border border-[#e5e7eb] p-5 hover:shadow-sm hover:border-[#0f4c3a]/15 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors" style={{ backgroundColor: color }}>
              <Icon size={18} className="text-[#0f4c3a]" />
            </div>
            <h3 className="text-sm font-bold text-[#111827] mb-1">{label}</h3>
            <p className="text-xs text-[#6b7280] leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── SAMPLE EVENTS ── */}
      <div>
        <h3 className="text-lg font-serif text-[#111827] mb-4">What to expect</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {UPCOMING_EVENTS.map(({ title, date, icon: Icon, img }) => (
            <div key={title} className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden flex hover:shadow-sm transition-shadow">
              <div className="w-24 h-24 shrink-0">
                <img src={img} alt={title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} className="text-[#0f4c3a] shrink-0" />
                  <p className="text-sm font-bold text-[#111827] truncate">{title}</p>
                </div>
                <p className="text-xs text-[#9ca3af]">{date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TESTIMONIALS.map(({ name, text, img }) => (
          <div key={name} className="bg-white rounded-2xl border border-[#e5e7eb] p-5 flex gap-4 items-start">
            <img src={img} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" />
            <div>
              <p className="text-xs text-[#374151] leading-relaxed mb-2">"{text}"</p>
              <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">{name}, Arrivio Resident</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA FOOTER ── */}
      <div className="bg-[#0f4c3a] rounded-2xl p-6 md:p-8 text-center">
        <p className="font-serif text-lg text-white mb-2">Community activates with your booking</p>
        <p className="text-xs text-white/50 mb-5 max-w-sm mx-auto">
          Once your move-in is confirmed, you'll get instant access to your building's community — events, clubs, shared spaces, and neighbours.
        </p>
        <a
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#0f4c3a] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#f2f2f2] transition-colors"
        >
          Browse Stays <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
};

export default Community;
