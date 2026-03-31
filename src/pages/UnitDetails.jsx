import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, MapPin, ShieldCheck, Star, Share2, Heart,
  Ruler, Layers, Users, Sofa, BedDouble, Home,
  Calendar, Lock, ChevronDown, RefreshCcw, Info, Eye, Bell, UserCircle, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useUnit } from "@/supabase/hooks/useUnit";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

import PropertyGallery from "../components/property/PropertyGallery";
import AmenitiesSection from "../components/property/AmenitiesSection";
import ResidentGuidelinesSection from "../components/property/ResidentGuidelinesSection";
import ApplicationDetailsSection from "../components/property/ApplicationDetailsSection";
import Neighborhood from "../components/property/Neighborhood";
import BookingDateFilter from "../components/property/BookingDateFilter";
import HeroDatePicker from "../components/landing/HeroDatePicker";
import PropertyDetailsSkeleton from "../components/skeletons/PropertyDetailsSkeleton";
import NotifyMeButton from "../components/common/NotifyMeButton";
import { calculateDuration } from "../utils/dateUtils";
import SEO from "../components/common/SEO";

const UNIT_TYPE_ICONS = {
  studio: BedDouble,
  one_bedroom: BedDouble,
  two_bedroom: BedDouble,
  shared_room: Users,
};

const TIER_STYLES = {
  standard: "bg-[#0f4c3a]/5 text-[#4b5563] border-[#0f4c3a]/10",
  premium: "bg-[#186b53]/10 text-[#186b53] border-[#186b53]/30",
  executive: "bg-[#0f4c3a] text-[#f2f2f2] border-[#0f4c3a]",
};

const NAV_ITEMS = [
  { label: "Overview", id: "overview" },
  { label: "Amenities", id: "amenities" },
  { label: "House Rules", id: "policies" },
  { label: "Documents", id: "details" },
  { label: "Location", id: "neighborhood" },
];

const UnitDetailsPage = () => {
  const { slug } = useParams();
  const id = slug;
  const navigate = useNavigate();
  const { toggleUnitWishlist, isUnitInWishlist } = useWishlist();
  const { user, openAuthModal } = useAuth();
  const { unit, loading } = useUnit(id);

  const [activeSection, setActiveSection] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  // Restore dates: unit-specific first, then global search dates
  const [startDate, setStartDate] = useState(() => {
    const saved = sessionStorage.getItem(`arrivio_dates_${id}`);
    if (saved) { const d = JSON.parse(saved); if (d.start) return new Date(d.start); }
    const global = sessionStorage.getItem('arrivio_search_dates');
    if (global) { const d = JSON.parse(global); if (d.start) return new Date(d.start); }
    return null;
  });
  const [endDate, setEndDate] = useState(() => {
    const saved = sessionStorage.getItem(`arrivio_dates_${id}`);
    if (saved) { const d = JSON.parse(saved); if (d.end) return new Date(d.end); }
    const global = sessionStorage.getItem('arrivio_search_dates');
    if (global) { const d = JSON.parse(global); if (d.end) return new Date(d.end); }
    return null;
  });
  const [days, setDays] = useState(0);
  const [isDatePopupOpen, setIsDatePopupOpen] = useState(false);
  const [datePickerField, setDatePickerField] = useState('start');
  const [isMobileDateOpen, setIsMobileDateOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  // Save dates to sessionStorage when they change
  useEffect(() => {
    if (id) {
      sessionStorage.setItem(`arrivio_dates_${id}`, JSON.stringify({
        start: startDate?.toISOString() || null,
        end: endDate?.toISOString() || null,
      }));
      // Also update global search dates
      if (startDate || endDate) {
        sessionStorage.setItem('arrivio_search_dates', JSON.stringify({
          start: startDate?.toISOString() || null,
          end: endDate?.toISOString() || null,
        }));
      }
    }
  }, [startDate, endDate, id]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  // Section observer
  useEffect(() => {
    if (!unit) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { root: null, rootMargin: "-100px 0px -70% 0px", threshold: 0 }
    );
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [unit]);

  useEffect(() => {
    if (startDate && endDate) {
      setDays(Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    } else {
      setDays(0);
    }
  }, [startDate, endDate]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: unit?.unitTypeLabel, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [unit?.unitTypeLabel]);

  const wishlisted = isUnitInWishlist(unit?.id);

  const buildBookingState = () => {
    const checkInStr = startDate ? startDate.toISOString().split("T")[0] : "";
    const checkOutStr = endDate ? endDate.toISOString().split("T")[0] : "";
    return {
      propertyId: unit.property.id,
      unitId: unit.id,
      title: `${unit.property.title}. ${unit.unitTypeLabel}`,
      propertyName: unit.property.title,
      image: unit.coverImage,
      address: unit.property.address,
      unitNumber: unit.unit_number,
      unitType: unit.unit_type,
      tier: unit.tier,
      monthlyTotal: unit.price,
      deposit: unit.deposit,
      holdingDeposit: unit.holdingDeposit,
      minStay: unit.minStay,
      city: unit.property.city,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      days,
    };
  };

  const handleBooking = () => {
    const bookingState = buildBookingState();

    if (!user) {
      // Pass callback for OTP login + booking state for Google OAuth redirect recovery
      openAuthModal(
        (loggedInUser) => navigate("/booking/review", { state: bookingState }),
        bookingState
      );
      return;
    }

    navigate("/booking/review", { state: bookingState });
  };

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  if (loading) return <PropertyDetailsSkeleton />;

  if (!unit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f2f2f2]">
        <h2 className="text-2xl font-serif text-[#111827] mb-4">Unit not found</h2>
        <button onClick={() => navigate(-1)} className="text-sm underline font-bold">Go Back</button>
      </div>
    );
  }

  const property = unit.property;
  const minStayDays = (unit.minStay || 3) * 30;

  return (
    <div className="min-h-screen bg-[#f2f2f2] pb-36 md:pb-20">
      <SEO
        title={`${unit.unitTypeLabel} at ${property?.title}`}
        description={`${unit.unitTypeLabel} in ${property?.city}, Germany. From €${unit.price}/mo, move-in ready.`}
        image={unit.images?.[0]}
        path={`/unit/${id}`}
      />
      <div className="pt-24 px-4 md:px-12 max-w-7xl mx-auto">

        {/* BREADCRUMBS */}
        <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#4b5563] hover:text-[#111827] transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#111827] overflow-x-auto no-scrollbar">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="text-[#9ca3af]">/</span>
            <Link to="/search" className="hover:underline">Search</Link>
            <span className="text-[#9ca3af]">/</span>
            <Link to={`/property/${property.slug || property.id}`} className="hover:underline">{property.title}</Link>
            <span className="text-[#9ca3af]">/</span>
            <span className="text-[#6b7280]">Unit {unit.unit_number}</span>
          </div>
        </div>

        {/* BADGES */}
        <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-6">
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${TIER_STYLES[unit.tier]}`}>
            {unit.tierLabel}
          </span>
          <span className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0f4c3a] border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#f2f2f2] shadow-md">
            <ShieldCheck size={12} className="text-[#D4A017]" />
            Official Arrivio Residence
          </span>
          {unit.status === "available" ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22C55E]/15 text-[#16a34a] border border-[#22C55E]/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
              </span>
              Available now
            </span>
          ) : unit.status === "occupied" && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-[#EA4335]"></span>
              Occupied
            </span>
          )}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6">

          {/* LEFT CONTENT */}
          <div className="lg:col-span-8 space-y-8">

            {/* GALLERY */}
            <div className="relative">
              <PropertyGallery
                images={unit.gallery}
                title={`${unit.unitTypeLabel} - Unit ${unit.unit_number}`}
                property={property}
              />
              {/* Like & Share overlay */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all group"
                    title="Share Unit"
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
                  onClick={() => toggleUnitWishlist(unit, unit.properties?.id || unit.property_id)}
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

            {/* HEADER */}
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-[#111827] tracking-tight leading-tight mb-2" style={{ fontVariantNumeric: 'lining-nums' }}>
                {unit.unitTypeLabel}
              </h1>
              <p className="text-sm text-[#4b5563] font-medium mb-1">
                Unit {unit.unit_number} at {property.title}
              </p>
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <MapPin size={16} />
                <span>{property.address}</span>
              </div>
            </div>

            {/* UNIT STATS */}
            <div id="overview" className="py-5 border-y border-[#0f4c3a]/5 scroll-mt-40">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#0f4c3a]/5 rounded-xl"><Ruler size={18} className="text-[#4b5563]" /></div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af]">Size</p>
                    <p className="text-sm font-bold text-[#111827]">{unit.size_sqm} m²</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#0f4c3a]/5 rounded-xl"><Layers size={18} className="text-[#4b5563]" /></div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af]">Floor</p>
                    <p className="text-sm font-bold text-[#111827]">{unit.floor === 0 ? "Ground Floor" : `${unit.floor}${unit.floor === 1 ? "st" : unit.floor === 2 ? "nd" : unit.floor === 3 ? "rd" : "th"} Floor`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#0f4c3a]/5 rounded-xl"><Users size={18} className="text-[#4b5563]" /></div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af]">Occupants</p>
                    <p className="text-sm font-bold text-[#111827]">Max {unit.max_occupants}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#0f4c3a]/5 rounded-xl"><Sofa size={18} className="text-[#4b5563]" /></div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af]">Furnishing</p>
                    <p className="text-sm font-bold text-[#111827]">{unit.is_furnished ? "Fully Furnished" : "Unfurnished"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* STICKY NAV — desktop only */}
            <div className="hidden md:block sticky top-[80px] z-[25] bg-[#f2f2f2] mb-8 mt-2">
              <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={(e) => scrollToSection(e, item.id)}
                    className={`relative px-4 py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                      activeSection === item.id ? "text-[#111827]" : "text-[#6b7280] hover:text-[#1f2937]"
                    }`}
                  >
                    {item.label}
                    {activeSection === item.id && (
                      <motion.div layoutId="unitActiveTab" className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0f4c3a]" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ABOUT THE PROPERTY */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-2xl text-[#111827]">About the residence</h3>
                <Link
                  to={`/property/${property.slug || property.id}`}
                  className="text-xs font-bold uppercase tracking-widest text-[#6b7280] hover:text-[#111827] transition-colors flex items-center gap-1"
                >
                  View property <ArrowLeft size={12} className="rotate-180" />
                </Link>
              </div>
              <p className="text-[#4b5563] text-sm leading-relaxed font-medium">
                {property.description}
              </p>
            </div>

            {/* AMENITIES */}
            {unit.amenities && (
              <AmenitiesSection
                property={{ amenities: unit.amenities }}
                isAmenitiesOpen={isAmenitiesOpen}
                setIsAmenitiesOpen={setIsAmenitiesOpen}
                variant="unit"
              />
            )}

            {/* POLICIES */}
            <ResidentGuidelinesSection />

            {/* APPLICATION DETAILS */}
            <ApplicationDetailsSection />

            {/* NEIGHBORHOOD */}
            <div id="neighborhood" className="pt-10 border-t border-[#0f4c3a]/10 scroll-mt-40">
              <Neighborhood property={property} />
            </div>
          </div>

          {/* RIGHT — BOOKING WIDGET */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-[96px] space-y-6">
              <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-lg overflow-hidden">

                {unit.status !== "available" ? (
                  /* UNIT NOT AVAILABLE — NOTIFY ME */
                  <div className="p-6 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-[#EA4335]/10 flex items-center justify-center mx-auto">
                      <Bell size={24} className="text-[#EA4335]" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-[#111827] mb-1">Currently Occupied</h3>
                      <p className="text-xs text-[#6b7280]">This unit is not available right now</p>
                    </div>
                    <NotifyMeButton
                      propertyId={unit.property?.id}
                      unitId={unit.id}
                      city={unit.property?.city}
                      propertyName={`${unit.unitTypeLabel} at ${unit.property?.title}`}
                    />
                  </div>
                ) : (
                <>
                {/* Dark green price header */}
                <div className="bg-[#0f4c3a] px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Monthly rent</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-bold text-white" style={{ fontVariantNumeric: 'lining-nums' }}>€{(unit.price || 0).toLocaleString()}</span>
                        <span className="text-xs text-white/50">/month</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 text-white/80 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22C55E]"></span>
                      </span>
                      Available
                    </span>
                  </div>
                  <p className="text-[10px] text-white/50 mt-0.5">All bills included</p>
                </div>

                <div className="px-5 pt-3 pb-4 space-y-3">
                  {/* Side-by-side date fields */}
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setDatePickerField('start'); setIsDatePopupOpen(true); }}
                        className={`flex-1 px-2.5 py-2 rounded-lg border text-left transition-colors ${
                          startDate ? "border-[#0f4c3a]/20 bg-white" : "border-[#0f4c3a]/10 hover:border-[#0f4c3a]/20"
                        }`}
                      >
                        <p className="text-[8px] font-bold uppercase tracking-widest text-[#9ca3af]">Move in</p>
                        <p className={`text-[13px] font-semibold ${startDate ? "text-[#111827]" : "text-[#d1d5db]"}`} style={{ fontVariantNumeric: 'lining-nums' }}>
                          {startDate ? startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Select"}
                        </p>
                      </button>
                      {startDate && endDate && (
                        <span className="text-[8px] font-bold text-[#D4A017] uppercase tracking-wider whitespace-nowrap">
                          {calculateDuration(startDate, endDate)}
                        </span>
                      )}
                      <button
                        onClick={() => { setDatePickerField(startDate ? 'end' : 'start'); setIsDatePopupOpen(true); }}
                        className={`flex-1 px-2.5 py-2 rounded-lg border text-left transition-colors ${
                          endDate ? "border-[#0f4c3a]/20 bg-white" : "border-[#0f4c3a]/10 hover:border-[#0f4c3a]/20"
                        }`}
                      >
                        <p className="text-[8px] font-bold uppercase tracking-widest text-[#9ca3af]">Move out</p>
                        <p className={`text-[13px] font-semibold ${endDate ? "text-[#111827]" : "text-[#d1d5db]"}`} style={{ fontVariantNumeric: 'lining-nums' }}>
                          {endDate ? endDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Select"}
                        </p>
                      </button>
                    </div>
                    <p className="text-[9px] text-[#9ca3af] mt-1 flex items-center gap-1">
                      <Info size={9} /> Min stay: {unit.minStay} months
                    </p>
                  </div>

                  <AnimatePresence>
                    {isDatePopupOpen && (
                      <HeroDatePicker
                        startDate={startDate}
                        endDate={endDate}
                        onDatesChange={(start, end) => { setStartDate(start); setEndDate(end); }}
                        onClose={() => setIsDatePopupOpen(false)}
                        minStayMonths={unit.minStay || 0}
                        initialField={datePickerField}
                      />
                    )}
                  </AnimatePresence>

                  {/* Cost breakdown — Design 4: Monthly + savings badge */}
                  {startDate && endDate && (() => {
                    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                    const stayMonths = Math.max(1, Math.round(diffDays / 30));
                    const monthlyRent = unit.price || 0;
                    const securityDeposit = unit.deposit || 0;
                    const holdingDeposit = unit.holdingDeposit || 0;
                    const firstMonthAfterHolding = monthlyRent - holdingDeposit;
                    const dueAtMoveIn = firstMonthAfterHolding + securityDeposit;
                    const dailyRate = Math.round(monthlyRent / 30);
                    const billsIncluded = ['WiFi', 'Water', 'Electricity', 'Heating'];
                    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                    // Build timeline
                    const timeline = [];
                    timeline.push({ label: 'Now', desc: 'Holding deposit', amount: holdingDeposit, type: 'now' });
                    const m1Date = new Date(startDate);
                    timeline.push({
                      label: `${MONTHS[m1Date.getMonth()]} ${m1Date.getFullYear()}`,
                      desc: 'First month (after holding deduction) + security deposit',
                      amount: dueAtMoveIn,
                      type: 'movein',
                    });
                    for (let i = 1; i < Math.min(stayMonths, 4); i++) {
                      const d = new Date(startDate);
                      d.setMonth(d.getMonth() + i);
                      timeline.push({
                        label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
                        desc: 'Monthly rent',
                        amount: monthlyRent,
                        type: 'monthly',
                      });
                    }
                    const remainingMonths = stayMonths - 4;

                    return (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                        <div className="space-y-2.5 text-sm">

                          {/* Monthly price with value badges */}
                          <div className="text-center">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">You pay monthly</p>
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-2xl font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{monthlyRent.toLocaleString()}</span>
                              <span className="text-xs text-[#9ca3af]">/mo</span>
                            </div>
                            <p className="text-[10px] text-[#6b7280] mt-0.5">Just <span className="font-bold text-[#0f4c3a]">€{dailyRate}/day</span> , all bills included</p>
                            <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#16a34a] rounded-full text-[9px] font-bold">Save 40% vs hotels</span>
                              {billsIncluded.map((bill) => (
                                <span key={bill} className="px-2 py-0.5 bg-[#f2f2f2] text-[#6b7280] rounded-full text-[8px] font-medium">
                                  {bill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="h-px bg-[#0f4c3a]/5" />

                          {/* Deposits */}
                          <div className="space-y-1.5 text-[13px]">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1">
                                <span className="text-[#4b5563]">Holding deposit</span>
                                <div className="relative group/hinfo">
                                  <Info size={10} className="text-[#9ca3af]" />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/hinfo:block z-50">
                                    <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[200px]">
                                      Reserves the unit for you. Deducted from your first month's rent upon move-in.
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <span className="font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{holdingDeposit.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1">
                                <span className="text-[#4b5563]">Security deposit</span>
                                <div className="relative group/info">
                                  <Info size={10} className="text-[#9ca3af]" />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/info:block z-50">
                                    <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[200px]">
                                      Your security deposit is returned within 14 days of move-out, after a final property inspection.
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{securityDeposit.toLocaleString()}</span>
                                <span className="text-[8px] text-[#22C55E] font-bold bg-[#22C55E]/10 px-1.5 py-0.5 rounded-full">Refundable</span>
                              </div>
                            </div>
                            <p className="text-[9px] text-[#9ca3af]">
                              {monthlyRent > 0 ? `${Math.round(securityDeposit / monthlyRent)} month${Math.round(securityDeposit / monthlyRent) !== 1 ? 's' : ''} rent` : ''} · returned at move-out
                            </p>
                          </div>

                          {/* CTA */}
                          <button
                            onClick={handleBooking}
                            className="w-full py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors bg-[#0f4c3a] text-[#f2f2f2] hover:bg-[#0a3a2b]"
                          >
                            Start Application
                          </button>

                          <div className="h-px bg-[#0f4c3a]/5" />

                          {/* Payment timeline */}
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3">Payment timeline</p>
                            {timeline.map((item, i) => (
                              <div key={i} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                    item.type === 'now' ? 'bg-[#D4A017]' : item.type === 'movein' ? 'bg-[#0f4c3a]' : 'bg-[#d1d5db]'
                                  }`} />
                                  {(i < timeline.length - 1 || remainingMonths > 0) && <div className="w-px flex-1 bg-[#e5e7eb] min-h-[28px]" />}
                                </div>
                                <div className="flex-1 pb-3 -mt-0.5">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-xs font-bold ${item.type === 'now' ? 'text-[#D4A017]' : 'text-[#111827]'}`}>{item.label}</p>
                                    <span className="text-sm font-bold text-[#111827] shrink-0" style={{ fontVariantNumeric: 'lining-nums' }}>€{item.amount.toLocaleString()}</span>
                                  </div>
                                  <p className="text-[10px] text-[#9ca3af]" style={{ fontVariantNumeric: 'lining-nums' }}>
                                    {item.type === 'movein'
                                      ? `Rent (€${monthlyRent.toLocaleString()}) − Holding (€${holdingDeposit.toLocaleString()}) + Security (€${securityDeposit.toLocaleString()})`
                                      : item.desc}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {remainingMonths > 0 && (
                              <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#d1d5db]" />
                                </div>
                                <div className="flex-1 flex items-start justify-between -mt-0.5">
                                  <div>
                                    <p className="text-xs font-bold text-[#9ca3af]">+{remainingMonths} more month{remainingMonths !== 1 ? 's' : ''}</p>
                                    <p className="text-[10px] text-[#9ca3af]">€{monthlyRent.toLocaleString()}/mo each</p>
                                  </div>
                                  <span className="text-sm font-bold text-[#9ca3af]" style={{ fontVariantNumeric: 'lining-nums' }}>€{(monthlyRent * remainingMonths).toLocaleString()}</span>
                                </div>
                              </div>
                            )}
                            {/* Move-out refund */}
                            <div className="flex gap-3 mt-2 pt-2 border-t border-[#0f4c3a]/5">
                              <div className="flex flex-col items-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                              </div>
                              <div className="flex-1 flex items-start justify-between -mt-0.5">
                                <div>
                                  <div className="flex items-center gap-1">
                                    <p className="text-xs font-bold text-[#22C55E]">At move-out</p>
                                    <div className="relative group/moveout">
                                      <Info size={12} className="text-[#22C55E]" />
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/moveout:block z-50">
                                        <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[210px]">
                                          Your security deposit is returned within 14 days of move-out, after a final property inspection.
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-[#9ca3af]">Security deposit returned</p>
                                </div>
                                <span className="text-sm font-bold text-[#22C55E]" style={{ fontVariantNumeric: 'lining-nums' }}>+€{securityDeposit.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* See complete breakdown link */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => setIsBreakdownOpen(true)}
                              className="text-[11px] font-semibold text-[#0f4c3a] hover:underline underline-offset-2 transition-colors"
                            >
                              See complete breakdown →
                            </button>
                          </div>

                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* Select dates CTA when no dates */}
                  {!(startDate && endDate) && (
                    <button
                      className="w-full py-3.5 rounded-xl font-bold uppercase text-xs tracking-widest bg-[#f2f2f2] text-[#9ca3af] cursor-not-allowed"
                    >
                      Select dates to continue
                    </button>
                  )}
                </div>
                </>
                )}
              </div>

              {/* View property link */}
              <Link
                to={`/property/${property.slug || property.id}`}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-[#0f4c3a]/5 text-[#4b5563] font-bold text-[10px] uppercase tracking-widest hover:bg-[#0f4c3a]/5 transition-colors"
              >
                <Home size={14} />
                View all units at {property.title}
              </Link>

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
                      {property.manager_phone && (
                        <p className="text-xs text-[#6b7280]">{property.manager_phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE BOOKING BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-4 py-3 z-50 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {unit.status === "available" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-serif font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>
                    €{(unit.price || 0).toLocaleString()}<span className="text-base font-sans font-medium text-[#6b7280]"> /mo</span>
                  </p>
                  <span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#16a34a] rounded-full text-[8px] font-bold">Save 40%</span>
                </div>
                <p className="text-[10px] text-[#6b7280]">
                  €{Math.round((unit.price || 0) / 30)}/day · All bills included
                </p>
                {startDate && endDate ? (
                  <button onClick={() => setIsMobileDateOpen(true)} className="text-[11px] text-[#0f4c3a] font-semibold hover:underline text-left">
                    {startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} → {endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </button>
                ) : (
                  <p className="text-[11px] text-[#22C55E] font-semibold">Available now</p>
                )}
              </div>
              <button
                onClick={startDate && endDate ? handleBooking : () => setIsMobileDateOpen(true)}
                className="px-5 py-3 bg-[#0f4c3a] text-white rounded-xl text-sm font-bold shrink-0 shadow-lg"
              >
                {startDate && endDate ? 'Apply Now' : 'Select Dates'}
              </button>
            </div>
            {startDate && endDate && (
              <button
                onClick={() => setIsBreakdownOpen(true)}
                className="w-full text-center text-[11px] font-semibold text-[#0f4c3a] hover:underline underline-offset-2"
              >
                See complete breakdown →
              </button>
            )}
          </div>
        ) : (
          <NotifyMeButton
            propertyId={unit.property?.id}
            unitId={unit.id}
            city={unit.property?.city}
            propertyName={`${unit.unitTypeLabel} at ${unit.property?.title}`}
          />
        )}
      </div>

      {/* MOBILE DATE PICKER — HeroDatePicker style */}
      <AnimatePresence>
        {isMobileDateOpen && (
          <HeroDatePicker
            startDate={startDate}
            endDate={endDate}
            onDatesChange={(start, end) => { setStartDate(start); setEndDate(end); }}
            onClose={() => setIsMobileDateOpen(false)}
            minStayMonths={unit.minStay || 0}
          />
        )}
      </AnimatePresence>

      {/* COMPLETE BREAKDOWN SLIDE-IN PANEL */}
      <AnimatePresence>
        {isBreakdownOpen && startDate && endDate && (() => {
          const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          const stayMonths = Math.max(1, Math.round(diffDays / 30));
          const monthlyRent = unit.price || 0;
          const securityDeposit = unit.deposit || 0;
          const holdingDeposit = unit.holdingDeposit || 0;
          const totalRent = monthlyRent * stayMonths;
          const totalCost = holdingDeposit + securityDeposit + totalRent;
          const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

          // Build full month list
          const allMonths = [];
          for (let i = 0; i < stayMonths; i++) {
            const d = new Date(startDate);
            d.setMonth(d.getMonth() + i);
            allMonths.push({
              month: MONTHS[d.getMonth()],
              year: d.getFullYear(),
              rent: i === 0 ? monthlyRent - holdingDeposit : monthlyRent,
              extras: i === 0 ? [
                { label: 'Rent', amount: monthlyRent },
                { label: 'Holding deposit deducted', amount: -holdingDeposit },
                { label: 'Security deposit', amount: securityDeposit },
              ] : [],
              total: i === 0 ? (monthlyRent - holdingDeposit) + securityDeposit : monthlyRent,
            });
          }

          return (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9998]"
                onClick={() => setIsBreakdownOpen(false)}
              />

              {/* Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.15)] z-[9999] flex flex-col"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#f0f0f0] flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-lg font-serif text-[#111827]">Complete Breakdown</h2>
                    <p className="text-[11px] text-[#9ca3af] mt-0.5">{stayMonths} month stay · {unit.unitTypeLabel}</p>
                  </div>
                  <button
                    onClick={() => setIsBreakdownOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#f3f4f6] hover:bg-[#e5e7eb] flex items-center justify-center text-[#6b7280] hover:text-[#111827] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                  {/* Upfront payment */}
                  <div className="bg-[#D4A017]/10 border border-[#D4A017]/20 rounded-xl px-4 py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-bold text-[#92700C]">Due now</p>
                          <div className="relative group/phold">
                            <Info size={11} className="text-[#92700C]/60" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/phold:block z-50">
                              <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[200px]">
                                Reserves the unit for you. This amount is deducted from your first month's rent.
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-[#92700C]/70">Holding deposit to reserve</p>
                      </div>
                      <span className="text-lg font-bold text-[#92700C]" style={{ fontVariantNumeric: 'lining-nums' }}>€{holdingDeposit.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Month by month — boxes with timeline */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3">Month-by-month payments</p>
                    <div>
                      {allMonths.map((m, i) => (
                        <div key={i} className="flex gap-3">
                          {/* Timeline line */}
                          <div className="flex flex-col items-center">
                            {i > 0 && <div className="w-px flex-1 bg-[#e5e7eb] min-h-[8px]" />}
                            <div className={`w-3 h-3 rounded-full shrink-0 ${i === 0 ? 'bg-[#D4A017]' : 'bg-[#d1d5db]'}`} />
                            {i < allMonths.length - 1 && <div className="w-px flex-1 bg-[#e5e7eb]" />}
                          </div>
                          {/* Card */}
                          <div className={`flex-1 rounded-xl border px-4 py-3 mb-2 shadow-sm ${i === 0 ? 'border-[#0f4c3a]/20 bg-[#0f4c3a]/[0.03]' : 'border-[#e5e7eb] bg-white'}`}>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${i === 0 ? 'text-[#0f4c3a]' : 'text-[#111827]'}`}>
                                  {m.month} {m.year}
                                </span>
                                {i === 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] font-bold text-[#0f4c3a] bg-[#0f4c3a]/10 px-1.5 py-0.5 rounded-full">Move-in</span>
                                    <div className="relative group/pmovein">
                                      <Info size={10} className="text-[#9ca3af]" />
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/pmovein:block z-50">
                                        <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[210px]">
                                          First month rent (minus holding deposit already paid) plus security deposit due at move-in.
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{m.total.toLocaleString()}</span>
                            </div>
                            {/* Sub-items for month 1 */}
                            {m.extras.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-[#0f4c3a]/5 space-y-1">
                                {m.extras.map((e, j) => (
                                  <div key={j} className="flex justify-between text-[11px]">
                                    <div className="flex items-center gap-1">
                                      <span className={e.amount < 0 ? "text-[#22C55E]" : "text-[#6b7280]"}>{e.label}</span>
                                      {e.label === 'Security deposit' && (
                                        <div className="relative group/psec">
                                          <Info size={10} className="text-[#9ca3af]" />
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/psec:block z-50">
                                            <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[210px]">
                                              Your security deposit is returned within 14 days of move-out, after a final property inspection.
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      {e.label === 'Holding deposit deducted' && (
                                        <div className="relative group/phdeduct">
                                          <Info size={10} className="text-[#22C55E]" />
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/phdeduct:block z-50">
                                            <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[200px]">
                                              The holding deposit you already paid is deducted from your first month's rent.
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <span className={`font-medium ${e.amount < 0 ? "text-[#22C55E]" : "text-[#4b5563]"}`} style={{ fontVariantNumeric: 'lining-nums' }}>
                                      {e.amount < 0 ? `−€${Math.abs(e.amount).toLocaleString()}` : `€${e.amount.toLocaleString()}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All bills included */}
                  <div className="bg-[#f9f9f7] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-1 mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">All bills included in rent</p>
                      <div className="relative group/pbills">
                        <Info size={10} className="text-[#9ca3af]" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/pbills:block z-50">
                          <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[220px]">
                            No surprise bills. Your monthly rent covers all utilities including WiFi, water, electricity, and heating. Nothing extra to pay.
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['WiFi', 'Water', 'Electricity', 'Heating'].map((bill) => (
                        <span key={bill} className="px-2.5 py-1 bg-white border border-[#e5e7eb] text-[#4b5563] rounded-full text-[10px] font-medium">
                          {bill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Move-out */}
                  <div className="bg-[#22C55E]/5 border border-[#22C55E]/15 rounded-xl px-4 py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-bold text-[#16a34a]">At move-out</p>
                          <div className="relative group/pmove">
                            <Info size={11} className="text-[#16a34a]" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/pmove:block z-50">
                              <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[210px]">
                                Your security deposit is returned within 14 days of move-out, after a final property inspection.
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-[#16a34a]/70">Security deposit returned to you</p>
                      </div>
                      <span className="text-lg font-bold text-[#22C55E]" style={{ fontVariantNumeric: 'lining-nums' }}>+€{securityDeposit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer total */}
                <div className="px-6 py-4 border-t border-[#f0f0f0] bg-[#fafafa] shrink-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-[#111827]">Total cost of stay</span>
                    <span className="text-xl font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{totalCost.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-[#9ca3af]">
                    Holding deposit (€{holdingDeposit.toLocaleString()}) + {stayMonths} months rent + security deposit (€{securityDeposit.toLocaleString()})
                  </p>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default UnitDetailsPage;
