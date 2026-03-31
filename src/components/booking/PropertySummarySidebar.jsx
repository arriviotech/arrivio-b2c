import React from "react";
import { motion } from "framer-motion";
import { Info, RefreshCcw, ShieldCheck } from "lucide-react";
import { calculateDuration } from "../../utils/dateUtils";
import OptimizedImage from "../common/OptimizedImage";
import { SIDEBAR_SIZES } from "../../utils/imageUtils";

const PropertySummarySidebar = ({ state }) => {
  if (!state) return null;

  const {
    title,
    propertyName,
    city,
    address,
    image,
    checkIn,
    checkOut,
    monthlyTotal = 0,
    deposit = 0,
    holdingDeposit = 150,
  } = state;

  const firstMonthAfterHolding = monthlyTotal - holdingDeposit;
  const dueAtMoveIn = firstMonthAfterHolding + deposit;
  const dailyRate = Math.round(monthlyTotal / 30);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-28 w-full max-w-md"
    >
      <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-lg overflow-hidden">
        {/* Property image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <OptimizedImage
            src={image}
            alt={title}
            width={400}
            sizes={SIDEBAR_SIZES}
            className="w-full h-full"
            imgClassName="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-serif text-lg leading-tight">{title}</h3>
            <p className="text-white/70 text-[11px] mt-0.5">{address || city}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af]">Move in</p>
              <p className="text-sm font-semibold text-[#111827]">{checkIn}</p>
            </div>
            <div className="flex-1 mx-4 border-t border-dashed border-[#0f4c3a]/15 relative">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[9px] font-bold text-[#D4A017] uppercase tracking-wider">
                {calculateDuration(checkIn, checkOut) || "—"}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af]">Move out</p>
              <p className="text-sm font-semibold text-[#111827]">{checkOut}</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#0f4c3a]/5 mx-5" />

        {/* Price breakdown */}
        <div className="px-5 py-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#4b5563]">Monthly rent</span>
            <span className="font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{monthlyTotal.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-[#6b7280]">That's just €{dailyRate}/day — all bills included</p>

          <div className="h-px bg-[#0f4c3a]/5" />

          <div className="flex justify-between">
            <span className="text-[#4b5563]">Holding deposit</span>
            <span className="font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{holdingDeposit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[#4b5563]">Security deposit</span>
              <div className="relative group/sinfo">
                <Info size={10} className="text-[#9ca3af]" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/sinfo:block z-50">
                  <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[200px]">
                    Your security deposit is returned within 14 days of move-out, after a final property inspection.
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{deposit.toLocaleString()}</span>
              <span className="text-[8px] text-[#22C55E] font-bold bg-[#22C55E]/10 px-1.5 py-0.5 rounded-full">Refundable</span>
            </div>
          </div>
        </div>

        {/* Due now — dark green */}
        <div className="mx-5 mb-5 bg-[#0f4c3a] rounded-xl px-4 py-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Due now</p>
              <p className="text-[10px] text-white/40 mt-0.5">Holding deposit to reserve</p>
            </div>
            <p className="text-2xl font-bold text-white" style={{ fontVariantNumeric: 'lining-nums' }}>€{holdingDeposit.toLocaleString()}</p>
          </div>
          <div className="h-px bg-white/10 my-3" />
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Due at move-in</p>
              <p className="text-[10px] text-white/40 mt-0.5">Rent (−holding) + security deposit</p>
            </div>
            <p className="text-lg font-bold text-white/80" style={{ fontVariantNumeric: 'lining-nums' }}>€{dueAtMoveIn.toLocaleString()}</p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="px-5 pb-4 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1 text-[9px] font-bold text-[#9ca3af]">
            <ShieldCheck size={12} className="text-[#22C55E]" /> Secure booking
          </span>
          <span className="flex items-center gap-1 text-[9px] font-bold text-[#9ca3af]">
            <RefreshCcw size={12} className="text-[#22C55E]" /> Deposit refundable
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertySummarySidebar;
