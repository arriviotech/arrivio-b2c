import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Bed,
  Wifi,
  Users,
  Sparkles,
  Bath,
  CheckCircle,
  Utensils,
  Monitor,
  Wrench,
  Building2,
  Camera,
  ArrowRight,
  Columns,
  Waves,
  UserCheck,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

// YOUR IMAGES
import room850 from "../../assets/room850.webp";
import room950 from "../../assets/room950.webp";
import room1200 from "../../assets/room1200.webp";

const PricingTiersSection = () => {
  const { t } = useLanguage();

  const pricingTiers = [
    {
      id: 1,
      name: t("collection.essential"),
      priceLabel: t("collection.essentialPrice"),
      minPrice: 350,
      maxPrice: 600,
      features: [
        { label: t("collection.privateBedroom"), icon: Bed },
        { label: t("collection.sharedKitchen"), icon: Utensils },
        { label: t("collection.biWeeklyCleaning"), icon: Sparkles },
        { label: t("collection.wifiIncluded"), icon: Wifi },
        { label: t("collection.communityEvents"), icon: Users },
      ],
      image: room850,
    },
    {
      id: 2,
      name: t("collection.comfort"),
      priceLabel: t("collection.comfortPrice"),
      minPrice: 600,
      maxPrice: 850,
      features: [
        { label: t("collection.privateEnsuite"), icon: Bath },
        { label: t("collection.cityView"), icon: Building2 },
        { label: t("collection.smartHome"), icon: Camera },
        { label: t("collection.dedicatedWorkspace"), icon: Monitor },
        { label: t("collection.priorityMaintenance"), icon: Wrench },
      ],
      image: room950,
    },
    {
      id: 3,
      name: t("collection.studio"),
      priceLabel: t("collection.studioPrice"),
      minPrice: 850,
      maxPrice: 1200,
      features: [
        { label: t("collection.privateKitchenette"), icon: Utensils },
        { label: t("collection.kingSizeBed"), icon: Bed },
        { label: t("collection.floorWindows"), icon: Columns },
        { label: t("collection.inUnitWasher"), icon: Waves },
        { label: t("collection.concierge"), icon: UserCheck },
      ],
      image: room1200,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section
      id="living-spaces"
      className="bg-[#f2f2f2] py-24 px-4 sm:px-6 lg:px-8"
    >
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
              {t("collection.label")}
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
            {t("collection.title1")} <br />
            <span className="italic text-[#111827]">{t("collection.title2")}</span>
          </motion.h2>
        </div>

        {/* --- THE PRICING GRID --- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.id}
              variants={cardVariants}
              className="group relative flex flex-col rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2"
            >
              {/* GLASS BACKGROUND */}
              <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-lg shadow-black/5 transition-all duration-500 group-hover:bg-white/60 group-hover:shadow-xl group-hover:border-[#0f4c3a]/15"></div>

              {/* CONTENT WRAPPER */}
              <div className="relative z-10 flex flex-col h-full p-4">

                {/* IMAGE */}
                <div className="h-48 sm:h-56 md:h-64 relative overflow-hidden rounded-[2rem] shadow-sm mb-6">
                  <img
                    src={tier.image}
                    alt={tier.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-[#0f4c3a] mix-blend-multiply opacity-10 transition-opacity group-hover:opacity-0"></div>

                  <div className="absolute top-4 right-4 bg-[#f0f0f0]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#111827] shadow-sm">
                    {tier.name}
                  </div>
                </div>

                {/* PRICE + FEATURES */}
                <div className="px-4 pb-4 flex flex-col flex-grow text-center">

                  {/* PRICE */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center gap-1 text-[#111827]">
                      <span className="font-serif text-3xl sm:text-4xl md:text-5xl">
                        {tier.priceLabel}
                      </span>
                      <span className="font-sans text-sm text-[#5C5C50] font-medium">
                        / month
                      </span>
                    </div>
                    <div className="w-12 h-[1px] bg-[#0f4c3a]/10 mx-auto mt-4 group-hover:w-24 transition-all duration-500"></div>
                  </div>

                  {/* FEATURES */}
                  <ul className="space-y-3 mb-8 text-left mx-auto w-full max-w-[90%]">
                    {tier.features.map((feature, index) => {
                      const Icon = feature.icon || CheckCircle;

                      return (
                        <li key={index} className="flex items-start gap-3">
                          <Icon
                            size={16}
                            className="text-[#9ca3af] flex-shrink-0 mt-0.5 group-hover:text-[#111827] transition-colors"
                          />
                          <span className="font-sans text-sm text-[#5C5C50] group-hover:text-[#1A1A1A] transition-colors">
                            {feature.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA BUTTON — 🔥 LINKED TO FILTER */}
                  <div className="mt-auto">
                    <Link
                      to={{
                        pathname: "/search",
                      }}
                      state={{
                        priceMin: tier.minPrice,
                        priceMax: tier.maxPrice,
                      }}
                      className="block"
                    >
                      <button className="w-full h-14 bg-[#f2f2f2] border border-[#0f4c3a]/10 rounded-full font-sans font-bold text-xs uppercase tracking-[0.2em] text-[#111827] flex items-center justify-center gap-2 hover:bg-[#0f4c3a] hover:text-[#f2f2f2] transition-all duration-300 shadow-sm group-hover:shadow-md">
                        {t("collection.viewDetails")}
                        <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>

                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingTiersSection;


