import React, { useState, useEffect, useRef, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { useAuth } from "../../context/AuthContext";
import "react-datepicker/dist/react-datepicker.css";
import BookingDateFilter from "./BookingDateFilter";
import {
  Info,
  Eye,
  FileCheck,
  RefreshCcw,
  Calendar,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// =========================
// CUSTOM INPUT FOR DATE PICKER
// =========================
const CustomDateInput = forwardRef(({ value, onClick, label, minimal }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className={`w-full flex items-center gap-3 p-4 transition-all text-left group ${minimal
      ? 'bg-transparent border-none'
      : 'bg-white/50 hover:bg-white/80 border border-[#0f4c3a]/10 rounded-xl'
      }`}
  >
    <div className="flex items-center justify-center text-[#4b5563] group-hover:text-[#111827] transition-colors">
      <Calendar size={18} strokeWidth={1.5} />
    </div>
    <div className="flex flex-col justify-center">
      <span className="block text-xs font-bold uppercase tracking-widest text-[#374151] mb-0.5">
        {label}
      </span>
      <span className={`text-sm font-medium leading-none ${value ? 'text-[#111827]' : 'text-[#374151]'}`}>
        {value || "Select Date"}
      </span>
    </div>
  </button>
));

const BookingWidget = ({ property }) => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

  // =========================
  // ⛔ SAFETY GUARD
  // =========================
  if (!property) {
    return (
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 p-6 text-center">
        <p className="text-sm text-[#4b5563]">Loading pricing…</p>
      </div>
    );
  }

  // =========================
  // PROPERTY DATA
  // =========================
  const {
    title,
    price,
    utilities,
    booking_fee,
    cleaning_fee,
    security_deposit,
    min_stay_nights: min_stay_days,
    cover_image,
  } = property;

  // =========================
  // HARD CAST
  // =========================
  const baseRent = Number(price) || 0;
  const utilitiesCost = Number(utilities) || 0;
  const bookingFee = Number(booking_fee) || 0;
  const cleaningFee = Number(cleaning_fee) || 0;
  const deposit = Number(security_deposit) || 0;
  const minStay = Number(min_stay_days) || 31;

  // =========================
  // STATE
  // =========================
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [days, setDays] = useState(0);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isDatePopupOpen, setIsDatePopupOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const dateTriggerRef = useRef(null);

  // =========================
  // DATE HELPERS
  // =========================
  const today = new Date();

  // =========================
  // CALCULATIONS (Enhanced)
  // =========================
  const areDatesApplied = Boolean(startDate && endDate);
  const baseMonthly = baseRent + utilitiesCost;

  // Discount Logic
  let discountPercentage = 0;
  if (days >= 180) discountPercentage = 10;
  else if (days >= 90) discountPercentage = 5;

  const monthlyDiscount = (baseRent * discountPercentage) / 100;
  const finalMonthlyRent = baseRent - monthlyDiscount;
  const monthlyTotal = finalMonthlyRent + utilitiesCost;
  const oneTimeTotal = bookingFee + cleaningFee;
  const totalResidencySavings = Math.round(monthlyDiscount * (days / 30));

  useEffect(() => {
    if (startDate && endDate) {
      const diff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      setDays(diff > 0 ? diff : 0);
      setIsBreakdownOpen(true); // Auto-open when dates are selected
    } else {
      setDays(0); // Reset days when dates are cleared
      setIsBreakdownOpen(false);
    }
  }, [startDate, endDate]);

  // =========================
  // ACTION
  // =========================
  const proceedToBooking = async (loggedInUser) => {
    const total = oneTimeTotal + monthlyTotal * (days / 30);
    const checkInStr = startDate ? startDate.toISOString().split('T')[0] : "";
    const checkOutStr = endDate ? endDate.toISOString().split('T')[0] : "";

    const navigationState = {
      propertyId: property.id,
      title,
      image: cover_image,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      days,
      monthlyTotal,
      oneTimeTotal,
      deposit,
      total,
    };

    navigate("/booking/review", { state: navigationState });
  };

  const handleBooking = () => {
    if (!user) {
      // Build booking state for both OTP callback and Google OAuth redirect
      const total = oneTimeTotal + monthlyTotal * (days / 30);
      const checkInStr = startDate ? startDate.toISOString().split('T')[0] : "";
      const checkOutStr = endDate ? endDate.toISOString().split('T')[0] : "";
      const bookingState = {
        propertyId: property.id,
        title,
        image: cover_image,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        days,
        monthlyTotal,
        oneTimeTotal,
        deposit,
        total,
      };

      // Open auth modal with OTP callback + booking state for Google OAuth
      openAuthModal(
        (loggedInUser) => proceedToBooking(loggedInUser),
        bookingState
      );
      return;
    }

    proceedToBooking(user);
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="relative">
      <div className="bg-white rounded-[2rem] border border-[#0f4c3a]/5 shadow-lg">
        <div className="p-5">

          {/* HEADER */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-serif font-bold text-[#111827]">
                  €{monthlyTotal.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-[#4b5563]">/ month</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af]">
                  All bills included
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div
                className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm transition-all group cursor-help relative"
                title="3+ Months: 5% OFF | 6+ Months: 10% OFF"
              >
                <Sparkles size={12} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {discountPercentage > 0
                    ? `${discountPercentage}% OFF`
                    : "Long-stay Offer"}
                </span>
                <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                  <Info size={12} strokeWidth={2.5} />
                </div>
              </div>
              {totalResidencySavings > 0 && (
                <div className="mt-2 text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-100/50 px-2 py-1 rounded-md border border-emerald-100">
                  Total Saved: €{totalResidencySavings.toLocaleString()}
                </div>
              )}
            </div>
          </div>
          {/* UNIFIED DATE TRIGGER */}
          <div className="relative mb-4" ref={dateTriggerRef}>
            <button
              onClick={(e) => {
                const rect = dateTriggerRef.current.getBoundingClientRect();
                setPopoverPos({ top: rect.bottom + 8, left: rect.left });
                setIsDatePopupOpen(!isDatePopupOpen);
              }}
              className={`w-full flex items-center gap-3 p-4 transition-all text-left bg-[#f0f0f0] border border-[#0f4c3a]/15 rounded-2xl shadow-sm hover:bg-white/50 group ${isDatePopupOpen ? 'ring-2 ring-[#0f4c3a]/10' : ''}`}
            >
              <div className="flex items-center justify-center text-[#4b5563] group-hover:text-[#111827] transition-colors">
                <Calendar size={18} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col justify-center">
                <span className="block text-xs font-bold uppercase tracking-widest text-[#374151] mb-0.5">
                  Select dates
                </span>
                <span className={`text-sm font-medium leading-none ${startDate ? 'text-[#111827]' : 'text-[#374151]'}`}>
                  {startDate && endDate
                    ? `${startDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} to ${endDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
                    : startDate
                      ? `${startDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })} to Move Out`
                      : "Move In to Move Out"}
                </span>
              </div>
              <div className="ml-auto text-[#111827]/30 group-hover:text-[#4b5563] transition-colors">
                <ChevronDown size={14} className={`transition-transform duration-300 ${isDatePopupOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            <AnimatePresence>
              {isDatePopupOpen && (
                <BookingDateFilter
                  startDate={startDate}
                  endDate={endDate}
                  setDates={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                  }}
                  onClose={() => setIsDatePopupOpen(false)}
                  position={popoverPos}
                  minStay={minStay}
                />
              )}
            </AnimatePresence>
          </div>
          {!areDatesApplied ? (
            <div className="flex items-center gap-2 -mt-3 mb-3 px-2 text-[#4b5563]">
              <Info size={12} className="opacity-40" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Min Stay: {(() => {
                  const months = Math.floor(minStay / 30);
                  const days = minStay % 30;
                  const parts = [];
                  if (months > 0) parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
                  if (days > 0) parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);
                  return parts.length > 0 ? parts.join(', ') : '0 Days';
                })()}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between -mt-3 mb-3 px-2">
              <div className="text-xs text-[#4b5563] font-medium">
                {(() => {
                  const months = Math.floor(days / 30);
                  const remainingAfterMonths = days % 30;
                  const weeks = Math.floor(remainingAfterMonths / 7);
                  const remainingDays = remainingAfterMonths % 7;

                  const parts = [];
                  if (months > 0) parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
                  if (weeks > 0) parts.push(`${weeks} ${weeks === 1 ? 'Week' : 'Weeks'}`);
                  if (remainingDays > 0) parts.push(`${remainingDays} ${remainingDays === 1 ? 'Day' : 'Days'}`);

                  return parts.length > 0 ? parts.join(', ') : '0 Days';
                })()}
              </div>
              <button
                onClick={() => { setStartDate(null); setEndDate(null); }}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#4b5563] hover:text-[#111827] transition-colors"
              >
                <RefreshCcw size={10} />
                <span>Clear Dates</span>
              </button>
            </div>
          )}

          {/* CTA BUTTON */}
          <button
            onClick={areDatesApplied ? handleBooking : undefined}
            className={`w-full py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all duration-300 shadow-lg ${areDatesApplied
              ? 'bg-[#0f4c3a] text-[#f2f2f2] hover:shadow-xl hover:scale-[1.02]'
              : 'bg-[#f2f2f2] text-[#9ca3af] cursor-not-allowed'
              }`}
          >
            {areDatesApplied ? "Start Application" : "Select Move In Date"}
          </button>

          {/* COST BREAKDOWN (Collapsible) */}
          <AnimatePresence>
            {areDatesApplied && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-3 border-t border-[#0f4c3a]/5 space-y-3">
                  <div className="space-y-4">
                    <div className="bg-[#f7f7f7] rounded-2xl p-4 border border-[#0f4c3a]/5">
                      <div className="flex justify-between items-center text-sm mb-3">
                        <span className="text-[#4b5563]">Monthly Base Rent</span>
                        <div className="flex flex-col items-end">
                          <span className={discountPercentage > 0 ? "text-xs line-through opacity-30" : "font-semibold"}>€{baseRent}</span>
                          {discountPercentage > 0 && <span className="font-bold text-emerald-600">€{finalMonthlyRent}</span>}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-[#4b5563]">Flat-rate Utilities</span>
                        <span className="font-semibold text-[#111827]">€{utilitiesCost}</span>
                      </div>
                      {discountPercentage > 0 && (
                        <div className="flex justify-between items-center text-sm mb-4 text-emerald-600 font-medium">
                          <span>Long-stay Discount ({discountPercentage}%)</span>
                          <span>-€{monthlyDiscount}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center font-bold border-t border-[#0f4c3a]/5 pt-3 text-[#111827]">
                        <span className="uppercase text-xs tracking-widest">Calculated Monthly</span>
                        <span className="text-lg">€{monthlyTotal}</span>
                      </div>
                    </div>

                    <div className="px-2 space-y-3">
                      <div className="flex justify-between text-xs items-center">
                        <div className="flex items-center gap-1.5 group cursor-help">
                          <span className="text-[#6b7280] font-bold uppercase tracking-widest">One-time Fees</span>
                          <HelpCircle size={12} className="opacity-30 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="font-bold text-[#111827]">€{oneTimeTotal}</span>
                      </div>
                      <div className="flex justify-between text-xs items-center opacity-60 italic">
                        <span>• Arrivio Service & Cleaning</span>
                      </div>

                      <div className="flex justify-between text-[11px] font-bold border-t border-[#0f4c3a]/5 pt-3">
                        <span className="text-[#6b7280] uppercase tracking-widest">Security Deposit</span>
                        <span className="text-[#111827]">€{deposit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <button className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#f2f2f2]/50 border border-[#0f4c3a]/5 hover:bg-[#f2f2f2] text-[#1f2937] font-bold text-xs uppercase tracking-[0.2em] transition-all group">
        <Eye size={16} className="group-hover:translate-x-1 group-hover:scale-110 transition-transform" />
        <span>Schedule Private Viewing</span>
      </button>

      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-xs text-[#111827]/30 text-center max-w-[220px] leading-relaxed italic">
          Arrivio Direct: As the property owner, we charge no commissions. Your application is handled directly by our resident support team.
        </p>
      </div>
    </div>
  );
};

export default BookingWidget;
