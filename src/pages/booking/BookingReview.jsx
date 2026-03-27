import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import ContractPDF from "./ContractPDF";
import {
  ArrowRight,
  Hourglass,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import BookingStepper from "../../components/booking/BookingStepper";
import PropertySummarySidebar from "../../components/booking/PropertySummarySidebar";
import BookingNavbar from "../../components/booking/BookingNavbar";
import { useProperty } from "../../supabase/hooks/useProperty";
import PageLoader from "../../components/common/PageLoader";
import { calculateDuration } from "../../utils/dateUtils";

const BookingReview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  // 🔒 SAFETY GUARD
  useEffect(() => {
    if (!state?.propertyId && !state?.id) {
      navigate("/");
    }
  }, [state, navigate]);

  // Fetch real-time data from DB
  const propertyId = state?.propertyId || state?.id;
  const { property: dbProperty, loading } = useProperty(propertyId);

  if (!state) return null;
  if (loading) return <PageLoader />;

  // Merge state with DB data (DB data takes precedence for accuracy)
  const propertyData = dbProperty ? { ...state, ...dbProperty } : state;

  const {
    title,
    checkIn,
    checkOut,
  } = propertyData;

  return (
    <div className="min-h-screen bg-[#FDF9F6] pt-20 sm:pt-24 md:pt-36 px-4 sm:px-6 md:px-12 pb-20 font-body text-[#111827]">
      {/* 🧭 NAVIGATION */}
      <BookingNavbar />

      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[1.3fr_1fr] lg:gap-12 max-w-7xl mx-auto items-start">
          {/* --- TOP LEFT: STEPPER & CONTENT --- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full space-y-12 lg:col-start-1 lg:row-start-1"
          >
            {/* 1. STEPPER */}
            <div className="w-full max-w-lg">
              <BookingStepper currentStep={2} />
            </div>

            <div className="h-[1px] w-full bg-[#0f4c3a]/5" />

            {/* 2. YOUR STAY SECTION */}
            <div className="space-y-10">
              <h2 className="text-4xl font-serif text-arrivio-green tracking-tight">Your stay</h2>

              <div className="space-y-12 max-w-2xl">
                {/* Stay Details Info Card */}
                <div className="relative flex flex-col md:flex-row items-center justify-between py-6 px-6 md:px-8 bg-arrivio-beige/30 rounded-3xl border border-arrivio-green/5 shadow-sm gap-6 md:gap-0">
                  <div className="flex flex-col gap-1.5 items-center md:items-start min-w-fit">
                    <span className="text-[10px] font-bold text-arrivio-green/40 uppercase tracking-[0.2em]">Move in</span>
                    <span className="text-lg font-semibold text-arrivio-green whitespace-nowrap">{checkIn}</span>
                  </div>

                  <div className="flex-grow w-full md:w-auto md:mx-6 relative flex flex-col items-center">
                    <div className="hidden md:block w-full border-t border-dashed border-arrivio-green/20 mb-2"></div>
                    <div className="md:hidden w-[1px] h-8 border-l border-dashed border-arrivio-green/20 absolute -top-5 -bottom-5"></div>
                    <span className="relative z-10 text-[9px] font-bold text-arrivio-accent uppercase tracking-widest whitespace-nowrap bg-white px-4 py-1 rounded-full border border-arrivio-green/5 shadow-sm">
                      {calculateDuration(checkIn, checkOut) || "—"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 items-center md:items-end md:text-right min-w-fit">
                    <span className="text-[10px] font-bold text-arrivio-green/40 uppercase tracking-[0.2em]">Move out</span>
                    <span className="text-lg font-semibold text-arrivio-green whitespace-nowrap">{checkOut}</span>
                  </div>
                </div>

                {/* 48h Timer Alert */}
                <div className="relative group max-w-xl">
                  {/* The Offset Shadow */}
                  <div className="absolute inset-0 bg-[#FDF9F6] translate-x-3 translate-y-3 rounded-3xl border border-arrivio-green/10 -z-10 transition-transform group-hover:translate-x-4 group-hover:translate-y-4" />

                  {/* Main Card */}
                  <div className="bg-white rounded-3xl p-6 md:p-8 border border-arrivio-green/10 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center shadow-xl shadow-arrivio-green/5 relative overflow-hidden">
                    <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 bg-arrivio-beige/30 rounded-full flex items-center justify-center border border-arrivio-green/5 relative">
                      <div className="absolute inset-1 border border-arrivio-green/10 rounded-full" />
                      <Hourglass size={24} strokeWidth={1.5} className="text-arrivio-green md:w-7 md:h-7" />
                    </div>
                    <div className="space-y-2 md:space-y-2.5">
                      <h4 className="font-serif text-arrivio-green text-lg md:text-xl leading-tight tracking-tight">
                        You will have 48h to finalise your booking
                      </h4>
                      <p className="text-arrivio-green/60 text-[13px] leading-relaxed font-medium">
                        Please complete your identity verification and sign the lease contract within this timeframe to secure your reservation. If these steps are not completed, your booking will be automatically canceled.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN (SIDEBAR) --- */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full flex justify-center lg:justify-end lg:col-start-2 lg:row-start-1 lg:row-span-2"
          >
            <PropertySummarySidebar state={propertyData} />
          </motion.div>

          {/* --- BOTTOM LEFT: CONTRACT PREVIEW --- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full space-y-10 lg:pt-4 lg:col-start-1 lg:row-start-2"
          >
            <div className="hidden lg:block h-[1px] w-full bg-[#0f4c3a]/5" />

            <div className="space-y-7">
              <div className="space-y-4">
                <h2 className="text-[34px] font-serif text-[#18342D] tracking-tight">Preview the contract</h2>
                <p className="text-[#6C7E83] text-[15px] leading-[1.6] max-w-md">
                  This is a preview of the lease contract template you are about to sign in the next step. You can review it here:
                </p>
              </div>

              <button
                onClick={async () => {
                  const pdfProperty = {
                    title: title || "Property",
                    address: propertyData.address || title || "",
                    apartmentNo: propertyData.apartmentNo || "________________",
                    floor: propertyData.floor || "Not specified",
                    size: propertyData.size || "Not specified",
                  };
                  const bookingData = {
                    checkIn: checkIn || "",
                    checkOut: checkOut || "",
                    monthlyRent: propertyData.monthlyTotal - (propertyData.utilities || 400),
                    utilities: propertyData.utilities || 400,
                    totalMonthly: propertyData.monthlyTotal,
                    bookingFee: propertyData.bookingFee || 465,
                    cleaningFee: propertyData.cleaningFee || 240,
                    deposit: propertyData.deposit || 0,
                  };
                  const docId = `ARR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

                  const blob = await pdf(<ContractPDF property={pdfProperty} booking={bookingData} docId={docId} />).toBlob();
                  const url = URL.createObjectURL(blob);
                  window.open(url, "_blank");
                }}
                className="flex items-center gap-2 px-6 py-4 bg-[#F5F4F0] hover:bg-[#EAE8E3] text-[#18342D] font-bold text-[15px] rounded-2xl w-fit transition-all border border-black/5"
              >
                Show contract template
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start gap-4 group cursor-pointer pt-2" onClick={() => setAgreed(!agreed)}>
              <div className={`mt-[3px] w-[22px] h-[22px] rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${agreed ? 'bg-[#2E4033] border-[#2E4033]' : 'border-[#2E4033]/20 bg-transparent'}`}>
                {agreed && (
                  <motion.svg
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5 text-white fill-current"
                  >
                    <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                  </motion.svg>
                )}
              </div>
              <p className="text-[#6C7E83] text-[15px] leading-relaxed">
                I agree to the <span className="text-[#D39B78]">Terms and conditions</span> the payment plan and the <span className="text-[#D39B78]">apartment/building rules</span>.
              </p>
            </div>

            {/* Main CTA */}
            <div className="space-y-6 pt-4">
              <button
                onClick={() => navigate("/payment", { state: propertyData })}
                disabled={!agreed}
                className={`w-full max-w-xl py-5 rounded-[20px] font-bold text-lg transition-all shadow-lg shadow-[#2E4033]/10 ${agreed ? 'bg-[#2E4033] text-white hover:scale-[1.01] active:scale-[0.99]' : 'bg-[#2E4033]/40 text-white/50 cursor-not-allowed'}`}
              >
                Continue booking & pay
              </button>

              <p className="text-[12px] text-[#A3B1B5] leading-[1.6] max-w-xl">
                By clicking 'Continue booking & pay' you authorize tenitt and Stripe, our payment service provider, to process the payment using your selected method. You are entitled to request a refund of the debited amount within eight weeks from the debit date, in accordance with the terms agreed upon with your financial institution.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingReview;
