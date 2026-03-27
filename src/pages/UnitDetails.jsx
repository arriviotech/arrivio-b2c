import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, MapPin, ShieldCheck, Star, Share2, Heart,
  Ruler, Layers, Users, Sofa, BedDouble, Home,
  Calendar, Lock, ChevronDown, RefreshCcw, Info, Eye, Bell, UserCircle
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [days, setDays] = useState(0);
  const [isDatePopupOpen, setIsDatePopupOpen] = useState(false);
  const [isMobileDateOpen, setIsMobileDateOpen] = useState(false);

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
      title: `${unit.unitTypeLabel} · ${unit.property.title}`,
      image: unit.coverImage,
      unitNumber: unit.unit_number,
      unitType: unit.unit_type,
      monthlyTotal: unit.price,
      deposit: unit.deposit,
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
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <button onClick={handleShare} className="p-2.5 rounded-full bg-white border border-[#0f4c3a]/10 shadow-sm hover:shadow-md transition-all group">
                <Share2 size={16} className="text-[#111827] group-hover:scale-110 transition-transform" />
              </button>
              {copied && <span className="absolute -bottom-10 right-0 text-[10px] font-bold text-[#111827] bg-white px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap z-50 border border-[#0f4c3a]/5">Copied!</span>}
            </div>
            <button onClick={() => toggleUnitWishlist(unit, unit.properties?.id || unit.property_id)} className="p-2.5 rounded-full bg-white border border-[#0f4c3a]/10 shadow-sm hover:shadow-md transition-all group">
              <Heart size={16} className={wishlisted ? "fill-red-500 text-red-500" : "text-[#111827] group-hover:text-red-500"} />
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6">

          {/* LEFT CONTENT */}
          <div className="lg:col-span-8 space-y-8">

            {/* GALLERY */}
            <PropertyGallery
              images={unit.gallery}
              title={`${unit.unitTypeLabel} - Unit ${unit.unit_number}`}
              property={property}
            />

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
              <div className="bg-white rounded-[2rem] border border-[#0f4c3a]/5 shadow-lg p-5">

                {unit.status !== "available" ? (
                  /* UNIT NOT AVAILABLE — NOTIFY ME */
                  <div className="text-center space-y-4">
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
                {/* Price */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-serif font-bold text-[#111827]">€{(unit.price || 0).toLocaleString()}</span>
                      <span className="text-sm font-medium text-[#4b5563]">/ month</span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mt-1">All bills included</p>
                  </div>
                </div>

                {/* Date picker trigger */}
                <button
                  onClick={() => setIsDatePopupOpen(!isDatePopupOpen)}
                  className="w-full flex items-center gap-3 p-4 bg-[#f0f0f0] border border-[#0f4c3a]/15 rounded-2xl shadow-sm hover:bg-white/50 mb-3 text-left"
                >
                  <Calendar size={18} className="text-[#4b5563]" />
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-[#374151] mb-0.5">Select dates</span>
                    <span className={`text-sm font-medium ${startDate ? "text-[#111827]" : "text-[#374151]"}`}>
                      {startDate && endDate
                        ? `${startDate.toLocaleDateString("en-GB")} – ${endDate.toLocaleDateString("en-GB")}`
                        : "Move In to Move Out"}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`ml-auto text-[#111827]/30 transition-transform ${isDatePopupOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isDatePopupOpen && (
                    <BookingDateFilter
                      startDate={startDate}
                      endDate={endDate}
                      setDates={(start, end) => { setStartDate(start); setEndDate(end); }}
                      onClose={() => setIsDatePopupOpen(false)}
                      minStay={minStayDays}
                    />
                  )}
                </AnimatePresence>

                <p className="text-xs text-[#6b7280] font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                  <Info size={10} /> Min stay: {unit.minStay} months
                </p>

                {/* CTA */}
                <button
                  onClick={startDate && endDate ? handleBooking : undefined}
                  className={`w-full py-3.5 rounded-xl font-bold uppercase text-xs tracking-widest transition-all shadow-lg ${
                    startDate && endDate
                      ? "bg-[#0f4c3a] text-[#f2f2f2] hover:shadow-xl hover:scale-[1.02]"
                      : "bg-[#f2f2f2] text-[#9ca3af] cursor-not-allowed"
                  }`}
                >
                  {startDate && endDate ? "Start Application" : "Select Move In Date"}
                </button>

                {/* Cost breakdown */}
                {startDate && endDate && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                    <div className="pt-4 mt-3 border-t border-[#0f4c3a]/5 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#4b5563]">Monthly rent</span>
                        <span className="font-semibold">€{(unit.price || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#4b5563]">Security deposit</span>
                        <span className="font-semibold">€{(unit.deposit || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#4b5563]">Holding deposit</span>
                        <span className="font-semibold">€{(unit.holdingDeposit || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-[#9ca3af] pt-1">
                        <span className="flex items-center gap-1"><RefreshCcw size={10} /> Security deposit</span>
                        <span>Refundable at move-out</span>
                      </div>
                    </div>
                  </motion.div>
                )}
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

      {/* MOBILE BOOKING BAR — simple, matches property page style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-4 py-3 z-50 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {unit.status === "available" ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-serif font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>
                €{(unit.price || 0).toLocaleString()}<span className="text-base font-sans font-medium text-[#6b7280]"> /mo</span>
              </p>
              {startDate && endDate ? (
                <button onClick={() => setIsMobileDateOpen(true)} className="text-sm text-[#0f4c3a] font-semibold hover:underline text-left">
                  {startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} → {endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </button>
              ) : (
                <p className="text-sm text-[#22C55E] font-semibold">Available now</p>
              )}
            </div>
            <button
              onClick={startDate && endDate ? handleBooking : () => setIsMobileDateOpen(true)}
              className="px-6 py-3.5 bg-[#0f4c3a] text-white rounded-xl text-sm font-bold shrink-0 shadow-lg"
            >
              {startDate && endDate ? 'Apply Now' : 'Select Dates'}
            </button>
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
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnitDetailsPage;
