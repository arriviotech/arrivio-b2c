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
import NotifyMeButton from "../components/common/NotifyMeButton";
import ApplicationDetailsSection from "../components/property/ApplicationDetailsSection";
import UnitListingSection from "../components/property/UnitListingSection";
import PaymentSummaryCard from "../components/property/PaymentSummaryCard";

// =========================
// SECTION IDS (stable ref)
// =========================
const SECTION_IDS = ["about", "units", "amenities", "policies", "details", "neighborhood"];

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

          {/* RIGHT: Static Action Icons (4 cols) */}
          <div className="lg:col-span-4 flex items-center justify-end gap-3 px-1">
            <div className="relative">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white border border-[#0f4c3a]/10 shadow-sm hover:shadow-md transition-all group"
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
              className="p-2.5 rounded-full bg-white border border-[#0f4c3a]/10 shadow-sm hover:shadow-md transition-all group"
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
              {/* Property summary card */}
              <div className="bg-white rounded-[2rem] border border-[#0f4c3a]/5 shadow-lg p-6">
                <h3 className="font-serif text-xl text-[#111827] mb-2">Property Overview</h3>
                <p className="text-xs text-[#6b7280] font-medium mb-4">{property.category}</p>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#4b5563]">Total units</span>
                    <span className="font-bold text-[#111827]">{property.unitCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4b5563]">Available</span>
                    <span className="font-bold text-[#22C55E]">{property.availableUnits} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4b5563]">Starting from</span>
                    <span className="font-bold text-[#111827]">€{property.price}/mo</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#0f4c3a]/5">
                  {property.availableUnits > 0 ? (
                    <a
                      href="#units"
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById("units");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="w-full py-3 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0a3a2b] transition-colors"
                    >
                      Browse available units
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

              {/* Payment Summary — only renders if user has bookings here */}
              <PaymentSummaryCard propertyId={property.id} />

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
