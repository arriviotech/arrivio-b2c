import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Star,
  Share2,
  Heart,
  X,
  UserCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useProperty } from "@/supabase/hooks/useProperty";
import { useWishlist } from "@/context/WishlistContext";

import PropertyGallery from "../components/property/PropertyGallery";
import Neighborhood from "../components/property/Neighborhood";
import PropertyDetailsSkeleton from "../components/skeletons/PropertyDetailsSkeleton";

import AmenitiesSection from "../components/property/AmenitiesSection";
import ResidentGuidelinesSection from "../components/property/ResidentGuidelinesSection";
import ReviewsMetricsSection from "../components/property/ReviewsMetricsSection";

// Extracted sub-components
import DescriptionSection from "../components/property/DescriptionSection";
import StickyNav from "../components/property/StickyNav";
import SimilarProperties from "../components/property/SimilarProperties";
import PropertyStats from "../components/property/PropertyStats";
import SEO from "../components/common/SEO";
import NotifyMeButton from "../components/common/NotifyMeButton";
import ApplicationDetailsSection from "../components/property/ApplicationDetailsSection";
import UnitListingSection from "../components/property/UnitListingSection";

// =========================
// SECTION IDS (stable ref)
// =========================
const SECTION_IDS = ["about", "units", "amenities", "policies", "details", "neighborhood"];

// Interactive booking widget (Design 2+3 merged)
const PropertyWidget = ({ units, unitTypes, allTiers, property, UNIT_TYPE_LABELS, TIER_LABELS, TIER_STYLES, TIER_DOTS }) => {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");

  const filtered = units.filter((u) => {
    if (selectedType !== "all" && u.unit_type !== selectedType) return false;
    if (selectedTier !== "all" && u.tier !== selectedTier) return false;
    return true;
  });

  const availableFiltered = filtered.filter((u) => u.status === "available");
  const allPrices = filtered.flatMap((u) => (u.unit_pricing_rules || []).map((p) => p.monthly_rent_cents));
  const minPrice = allPrices.length > 0 ? Math.round(Math.min(...allPrices) / 100) : 0;
  const maxPrice = allPrices.length > 0 ? Math.round(Math.max(...allPrices) / 100) : 0;

  // Group filtered units by type for price breakdown
  const typeMap = {};
  filtered.forEach((u) => {
    const type = u.unit_type;
    if (!typeMap[type]) typeMap[type] = { prices: [], available: 0, total: 0, tiers: new Set() };
    typeMap[type].total++;
    if (u.status === "available") typeMap[type].available++;
    (u.unit_pricing_rules || []).forEach((p) => typeMap[type].prices.push(p.monthly_rent_cents));
    if (u.tier) typeMap[type].tiers.add(u.tier);
  });

  return (
    <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-lg overflow-hidden">
      {/* Dark green price header */}
      <div className="bg-[#0f4c3a] px-6 py-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Starting from</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white" style={{ fontVariantNumeric: 'lining-nums' }}>€{minPrice.toLocaleString()}</span>
          {maxPrice !== minPrice && (
            <span className="text-lg text-white/50 font-medium" style={{ fontVariantNumeric: 'lining-nums' }}>– €{maxPrice.toLocaleString()}</span>
          )}
          <span className="text-sm text-white/50">/month</span>
        </div>
        <p className="text-[11px] text-white/50 mt-1">
          {availableFiltered.length} of {filtered.length} {selectedType !== "all" || selectedTier !== "all" ? "matching " : ""}units available
        </p>
      </div>

      {/* Interactive selectors */}
      <div className="px-6 pt-4 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-2.5">Unit type</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedType === "all" ? "bg-[#0f4c3a] text-white" : "bg-[#f2f2f2] text-[#4b5563] hover:bg-[#e5e5e5]"
            }`}
          >
            All
          </button>
          {unitTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedType === type ? "bg-[#0f4c3a] text-white" : "bg-[#f2f2f2] text-[#4b5563] hover:bg-[#e5e5e5]"
              }`}
            >
              {UNIT_TYPE_LABELS[type] || type}
            </button>
          ))}
        </div>
      </div>

      {allTiers.length > 1 && (
        <div className="px-6 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-2.5">Tier</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTier("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                selectedTier === "all" ? "bg-[#0f4c3a] text-white border-[#0f4c3a]" : "bg-white text-[#4b5563] border-[#0f4c3a]/10 hover:border-[#0f4c3a]/30"
              }`}
            >
              All
            </button>
            {allTiers.map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  selectedTier === tier ? "bg-[#0f4c3a] text-white border-[#0f4c3a]" : `${TIER_STYLES[tier] || "bg-white text-[#4b5563]"} hover:opacity-80`
                }`}
              >
                {TIER_LABELS[tier] || tier}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price breakdown by type */}
      <div className="px-6 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-2.5">Price breakdown</p>
        <div className="space-y-2">
          {Object.entries(typeMap).sort((a, b) => Math.min(...a[1].prices) - Math.min(...b[1].prices)).map(([type, data]) => {
            const min = Math.round(Math.min(...data.prices) / 100);
            const max = Math.round(Math.max(...data.prices) / 100);
            const isCheapest = min === minPrice;
            return (
              <div key={type} className={`flex items-center justify-between py-2 px-3 rounded-xl ${isCheapest ? 'bg-[#0f4c3a]/5 ring-1 ring-[#0f4c3a]/10' : 'bg-[#f9f9f7]'}`}>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{UNIT_TYPE_LABELS[type] || type}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold ${data.available > 0 ? 'text-[#22C55E]' : 'text-[#EA4335]'}`}>
                      {data.available > 0 ? `${data.available} available` : 'Occupied'}
                    </span>
                    <div className="flex items-center gap-1">
                      {[...data.tiers].map((t) => (
                        <span key={t} className={`w-1.5 h-1.5 rounded-full ${TIER_DOTS[t] || TIER_DOTS.standard}`} title={t} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>
                    €{min.toLocaleString()}{max !== min ? `–${max.toLocaleString()}` : ''}
                  </p>
                  <p className="text-[10px] text-[#9ca3af]">/month</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-5 pt-1">
        {availableFiltered.length > 0 ? (
          <a
            href="#units"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById("units");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="w-full py-3 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0a3a2b] transition-colors"
          >
            View {availableFiltered.length} available unit{availableFiltered.length !== 1 ? 's' : ''}
          </a>
        ) : (
          <NotifyMeButton
            propertyId={property.id}
            city={property.city}
            propertyName={property.title}
          />
        )}
      </div>
    </div>
  );
};

const PropertyDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { property, loading } = useProperty(slug);

  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("about");
  const [copied, setCopied] = useState(false);

  // SECTION OBSERVER FOR STICKY NAV
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-100px 0px -70% 0px",
      threshold: 0
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    SECTION_IDS.forEach((sectionId) => {
      const el = document.getElementById(sectionId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [property]);

  // Stable callbacks
  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: property?.title || 'Property', url });
      } catch (err) { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [property?.title]);

  const handleToggleWishlist = useCallback(() => {
    toggleWishlist(property);
  }, [toggleWishlist, property]);

  const openDescriptionModal = useCallback(() => {
    setIsDescriptionModalOpen(true);
  }, []);

  const closeDescriptionModal = useCallback(() => {
    setIsDescriptionModalOpen(false);
  }, []);

  const openBooking = useCallback(() => {
    setIsBookingOpen(true);
  }, []);

  const closeBooking = useCallback(() => {
    setIsBookingOpen(false);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Memoized gallery images array — extract URLs from gallery objects
  const galleryImages = useMemo(() => {
    if (!property) return [];
    const gallery = (property.gallery || []).map((img) =>
      typeof img === 'string' ? img : img.url
    ).filter(Boolean);
    // If gallery is empty, use cover image
    if (gallery.length === 0 && property.cover_image) return [property.cover_image];
    return gallery;
  }, [property?.cover_image, property?.gallery]);

  // Memoized total price
  const totalPrice = useMemo(() => {
    if (!property) return 0;
    return (Number(property.price) + Number(property.utilities)).toLocaleString();
  }, [property?.price, property?.utilities]);

  const wishlisted = isInWishlist(property?.id);

  if (loading) {
    return <PropertyDetailsSkeleton />;
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f2f2f2]">
        <h2 className="text-2xl font-serif text-[#111827] mb-4">
          Property not found
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="text-sm underline font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] pb-32 md:pb-20">
      <SEO
        title={property.title}
        description={`${property.title} in ${property.city}, Germany. Furnished, move-in ready housing from €${property.price}/mo.`}
        image={property.images?.[0]}
        path={`/property/${slug}`}
      />
      <div className="pt-24 px-4 md:px-12 max-w-7xl mx-auto">

        {/* NAVIGATION: Back Button & Breadcrumbs */}
        <div className="mb-6 space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#4b5563] hover:text-[#111827] transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#111827]">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="text-[#9ca3af]">/</span>
            <Link to="/cities" className="hover:underline">Cities</Link>
            {property?.city && (
              <>
                <span className="text-[#9ca3af]">/</span>
                <Link to={`/search?city=${property.city}`} className="hover:underline">
                  {property.city}
                </Link>
              </>
            )}
            {property?.title && (
              <>
                <span className="text-[#9ca3af]">/</span>
                <span className="text-[#6b7280] truncate max-w-[300px]" title={property.title}>
                  {property.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* --- GRID HEADER ROW (Tags & Static Actions) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 mb-6">
          {/* LEFT: Status Tags (8 cols) */}
          <div className="lg:col-span-8 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0f4c3a] border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#f2f2f2] shadow-md hover:bg-[#324536] transition-colors cursor-default">
              <ShieldCheck size={12} className="text-[#D4A017]" />
              <span>Official Arrivio Residence</span>
            </span>

            <span className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-[#0f4c3a]/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#111827] shadow-sm">
              <Star size={12} className="fill-emerald-500 text-emerald-500" />
              <span className="text-[#111827]">{property.rating || "4.8"}</span>
              <span className="text-[#9ca3af] font-medium">({property.reviews_count || "12"})</span>
            </span>
          </div>

        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 transition-all duration-500">

          {/* LEFT: MAIN CONTENT AREA (8 cols) */}
          <div className="lg:col-span-8 space-y-8">

            {/* 1. GALLERY */}
            <div className="relative group/gallery">
              <PropertyGallery
                images={galleryImages}
                title={property.title}
                rating={property.rating}
                property={property}
              />
              {/* Like & Share overlay */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all group"
                    title="Share Property"
                  >
                    <Share2 size={16} className="text-[#111827] group-hover:scale-110 transition-transform" />
                  </button>
                  {copied && (
                    <span className="absolute -bottom-10 right-0 text-[10px] font-bold uppercase tracking-wider text-[#111827] bg-white px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap z-50 border border-[#0f4c3a]/5">
                      Copied!
                    </span>
                  )}
                </div>
                <button
                  onClick={handleToggleWishlist}
                  className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all group"
                  title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart
                    size={16}
                    className={`transition-all ${wishlisted
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-[#111827] group-hover:text-red-500 group-hover:scale-110"
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* 2. HEADER INFO */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-serif text-[#111827] tracking-tight leading-tight">
                {property.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#4b5563] font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-[#9ca3af]" />
                  {property.address || `${property.city}, Germany`}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#0f4c3a]/20 hidden md:block" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#9ca3af]">
                  {property.category}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#0f4c3a]/20 hidden md:block" />
                <span className="text-xs font-bold text-[#22C55E]">
                  {property.availableUnits} of {property.unitCount} units available
                </span>
              </div>
            </div>

            {/* PROPERTY STATS */}
            <PropertyStats
              details={property.details}
              propertyType={property.category}
              furnishing={property.furnishing}
            />

            {/* STICKY SECTION NAV */}
            <StickyNav activeSection={activeSection} />

            {/* 3. DESCRIPTION */}
            <DescriptionSection property={property} onOpenModal={openDescriptionModal} />

            {/* 4. AVAILABLE UNITS — main section */}
            <UnitListingSection
              property={property}
              onSelectUnit={(unit) => {
                navigate(`/unit/${unit.slug || unit.id}`);
              }}
            />

            {/* 5. AMENITIES */}
            <AmenitiesSection
              property={property}
              isAmenitiesOpen={isAmenitiesOpen}
              setIsAmenitiesOpen={setIsAmenitiesOpen}
            />

            {/* 6. POLICIES & GUIDELINES */}
            <ResidentGuidelinesSection />

            {/* 6.5. APPLICATION DETAILS */}
            <ApplicationDetailsSection />


            {/* 8. NEIGHBORHOOD */}
            <div id="neighborhood" className="pt-10 border-t border-[#0f4c3a]/10 scroll-mt-40">
              <Neighborhood property={property} />
            </div>

            {/* 9. EXPERIENCE & PROOF */}
            <ReviewsMetricsSection property={property} />

            {/* 10. SIMILAR PROPERTIES */}
            <SimilarProperties currentPropertyId={property.id} city={property.city} />
          </div>

          {/* RIGHT — PROPERTY INFO SIDEBAR */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-[96px] space-y-6 mt-12 lg:mt-0">
              {/* Property summary card — Design 2+3: Pricing-focused + Interactive */}
              {(() => {
                const units = property.units || [];
                const UNIT_TYPE_LABELS = { studio: "Studio", one_bedroom: "1 Bedroom", two_bedroom: "2 Bedroom", shared_room: "Shared Room" };
                const TIER_LABELS = { standard: "Standard", premium: "Premium", executive: "Executive" };
                const TIER_STYLES = {
                  standard: "border-[#0f4c3a]/15 text-[#111827] bg-white",
                  premium: "border-[#DAA520] text-[#92700C] bg-[#DAA520]/5",
                  executive: "border-[#0f4c3a] text-[#0f4c3a] bg-[#0f4c3a]/5",
                };
                const TIER_DOTS = { standard: "bg-[#9ca3af]", premium: "bg-[#DAA520]", executive: "bg-[#0f4c3a]" };

                const unitTypes = [...new Set(units.map((u) => u.unit_type))];
                const allTiers = [...new Set(units.map((u) => u.tier).filter(Boolean))];

                return <PropertyWidget units={units} unitTypes={unitTypes} allTiers={allTiers} property={property} UNIT_TYPE_LABELS={UNIT_TYPE_LABELS} TIER_LABELS={TIER_LABELS} TIER_STYLES={TIER_STYLES} TIER_DOTS={TIER_DOTS} />;
              })()}


              {/* Manager info */}
              {property.manager_name && (
                <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-3">Property Manager</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center shrink-0">
                      <UserCircle size={22} className="text-[#6b7280]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#111827] text-sm">{property.manager_name}</p>
                      {property.manager_email && (
                        <p className="text-xs text-[#6b7280]">{property.manager_email}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DESCRIPTION MODAL */}
        <AnimatePresence>
          {isDescriptionModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDescriptionModal}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#f2f2f2] w-full max-w-2xl max-h-[80vh] rounded-[2rem] overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col border border-white/20"
              >
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-[#0f4c3a]/5 flex items-center justify-between bg-white/60 backdrop-blur-xl sticky top-0 z-10">
                  <div>
                    <h3 className="font-serif text-xl text-[#111827] tracking-tight">About this home</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-5 h-[1px] bg-[#186b53]"></span>
                      <p className="text-xs text-[#186b53] font-bold uppercase tracking-[0.2em]">The Arrivio Collection</p>
                    </div>
                  </div>
                  <button
                    onClick={closeDescriptionModal}
                    className="p-2 bg-white hover:bg-[#0f4c3a] hover:text-white rounded-full transition-all duration-300 shadow-sm border border-[#0f4c3a]/5 group"
                  >
                    <X size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="px-6 py-6 md:px-8 md:py-8 overflow-y-auto flex-1 arrivio-scrollbar">
                  <p className="text-[#1f2937] text-[15px] leading-[1.75] font-medium whitespace-pre-line tracking-tight">
                    {property.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ MOBILE BOOKING BAR ═══ */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-4 py-3 z-50 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          {property.availableUnits > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[#9ca3af] font-medium">from</p>
                <p className="text-2xl font-serif font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>
                  €{property.price?.toLocaleString()}<span className="text-base font-sans font-medium text-[#6b7280]"> /mo</span>
                </p>
                <p className="text-sm text-[#22C55E] font-semibold">{property.availableUnits} unit{property.availableUnits !== 1 ? 's' : ''} available</p>
              </div>
              <a
                href="#units"
                onClick={(e) => { e.preventDefault(); document.getElementById("units")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                className="px-6 py-3.5 bg-[#0f4c3a] text-white rounded-xl text-sm font-bold shrink-0 shadow-lg"
              >
                Browse Units
              </a>
            </div>
          ) : (
            <NotifyMeButton
              propertyId={property.id}
              city={property.city}
              propertyName={property.title}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
