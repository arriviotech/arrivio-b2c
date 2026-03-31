import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  MapPin,
  Sofa,
  Wallet,
  Monitor,
  BadgePercent,
  Users,
  Building2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const WhoWeServeSection = () => {
  const { t } = useLanguage();

  const personas = [
    {
      title: t("whoWeServe.professionals"),
      description: t("whoWeServe.professionalsDesc"),
      features: [
        { label: t("whoWeServe.professionalsTag1"), icon: MapPin },
        { label: t("whoWeServe.professionalsTag2"), icon: Building2 },
        { label: t("whoWeServe.professionalsTag3"), icon: Sofa },
      ],
      icon: Briefcase,
    },
    {
      title: t("whoWeServe.students"),
      description: t("whoWeServe.studentsDesc"),
      features: [
        { label: t("whoWeServe.studentsTag1"), icon: GraduationCap },
        { label: t("whoWeServe.studentsTag2"), icon: Wallet },
        { label: t("whoWeServe.studentsTag3"), icon: Monitor },
      ],
      icon: GraduationCap,
    },
    {
      title: t("whoWeServe.azubis"),
      description: t("whoWeServe.azubisDesc"),
      features: [
        { label: t("whoWeServe.azubisTag1"), icon: MapPin },
        { label: t("whoWeServe.azubisTag2"), icon: BadgePercent },
        { label: t("whoWeServe.azubisTag3"), icon: Users },
      ],
      icon: Sparkles,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Cards appear one by one
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    // Background: Warm Stone (#f2f2f2) ensures perfect flow from previous section
    <section id="who-we-serve" className="bg-[#f2f2f2] py-24 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto">

        {/* --- HEADER --- */}
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 mb-6 opacity-60"
          >
            <div className="w-8 h-[1px] bg-[#0f4c3a]"></div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#111827] font-sans">
              {t("whoWeServe.label")}
            </span>
            <div className="w-8 h-[1px] bg-[#0f4c3a]"></div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] leading-tight"
          >
            {t("whoWeServe.title1")} <br />
            <span className="italic text-[#111827]">{t("whoWeServe.title2")}</span>
          </motion.h2>
        </div>


        {/* --- THE GLASS PILLARS GRID --- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {personas.map((persona, index) => {
            const IconComponent = persona.icon;

            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className="group relative flex flex-col p-5 sm:p-8 rounded-[2rem] transition-all duration-500 hover:-translate-y-2"
              >
                {/* GLASS CARD BACKGROUND */}
                {/* Default: Semi-transparent. Hover: Solid & Shadowed */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-lg shadow-black/5 transition-all duration-500 group-hover:bg-white/60 group-hover:shadow-xl group-hover:border-[#0f4c3a]/15"></div>

                {/* CONTENT LAYER */}
                <div className="relative z-10 flex flex-col h-full">

                  {/* Icon Circle */}
                  <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center mb-6 text-[#111827] shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-[#0f4c3a] group-hover:text-white">
                    <IconComponent size={28} strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-2xl text-[#1A1A1A] mb-4 group-hover:text-[#111827] transition-colors">
                    {persona.title}
                  </h3>

                  {/* Decorative Divider (Expands on Hover) */}
                  <div className="w-8 h-[1px] bg-[#0f4c3a]/20 mb-6 group-hover:w-full transition-all duration-700"></div>

                  {/* Description */}
                  <p className="font-sans text-[#5C5C50] leading-relaxed mb-8 flex-grow">
                    {persona.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-4 mt-auto">
                    {persona.features.map((feature, featureIndex) => {
                      const Icon = feature.icon || CheckCircle;
                      return (
                        <li key={featureIndex} className="flex items-start gap-3 group/item">
                          <Icon
                            size={18}
                            className="text-[#9ca3af] flex-shrink-0 mt-0.5 group-hover:text-[#111827] transition-colors"
                          />
                          <span className="font-sans text-sm text-[#1A1A1A]/70 group-hover:text-[#1A1A1A] transition-colors font-medium">
                            {feature.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

export default WhoWeServeSection;

