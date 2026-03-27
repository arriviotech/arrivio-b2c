import React from "react";
import { motion } from "framer-motion";
import { calculateDuration } from "../../utils/dateUtils";

/**
 * PropertySummarySidebar - Sticky sidebar showing property summary and price breakdown
 */
const PropertySummarySidebar = ({ state }) => {
    if (!state) return null;

    const {
        title,
        city,
        address,
        image,
        checkIn,
        checkOut,
        monthlyTotal = 1786,
        utilities = 400,
        bookingFee = 465,
        cleaningFee = 240,
        deposit = 1000,
    } = state;

    const monthlySubtotal = monthlyTotal;
    const totalFees = bookingFee + cleaningFee;
    const dueNow = monthlyTotal + totalFees;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="sticky top-32 w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl shadow-arrivio-green/5 border border-arrivio-green/5"
        >
            {/* Property Image & Header */}
            <div className="p-5 pb-0">
                <div className="aspect-[16/11] w-full rounded-2xl overflow-hidden shadow-md group relative">
                    <img
                        src={image || "/placeholder-property.jpg"}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-arrivio-green/20 to-transparent opacity-60" />
                </div>

                <div className="mt-6 px-1">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-serif text-arrivio-green leading-tight pr-2" title={title}>
                                {title}
                            </h3>
                            <p className="text-[10px] font-bold text-arrivio-accent uppercase tracking-[0.2em]">
                                {city} • {address?.split(',').pop().trim() || 'Germany'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Dates Summary */}
                <div className="relative flex flex-col sm:flex-row items-center justify-between py-4 px-4 bg-arrivio-beige/30 rounded-2xl border border-arrivio-green/5 gap-4 sm:gap-0">
                    <div className="flex flex-col gap-1 items-center sm:items-start min-w-fit">
                        <span className="text-[9px] font-bold text-arrivio-green/40 uppercase tracking-[0.15em]">Move in</span>
                        <span className="text-sm font-semibold text-arrivio-green whitespace-nowrap">{checkIn}</span>
                    </div>

                    <div className="flex-grow w-full sm:w-auto sm:mx-3 relative flex flex-col items-center">
                        <div className="hidden sm:block w-full border-t border-dashed border-arrivio-green/20 mb-1"></div>
                        <div className="sm:hidden w-[1px] h-6 border-l border-dashed border-arrivio-green/20 absolute -top-4 -bottom-4"></div>
                        <span className="relative z-10 text-[8px] font-bold text-arrivio-accent uppercase tracking-widest whitespace-nowrap bg-white/80 px-2 py-0.5 rounded-full border border-arrivio-green/5">
                            {calculateDuration(checkIn, checkOut) || "N/A"}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1 items-center sm:items-end sm:text-right min-w-fit">
                        <span className="text-[9px] font-bold text-arrivio-green/40 uppercase tracking-[0.15em]">Move out</span>
                        <span className="text-sm font-semibold text-arrivio-green whitespace-nowrap">{checkOut}</span>
                    </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-5">
                    <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-arrivio-green/60">
                            <span className="text-[13px] font-medium">Rent per month</span>
                            <span className="font-semibold text-arrivio-green/80 text-[15px]">€{(monthlyTotal - utilities).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-arrivio-green/60">
                            <span className="text-[13px] font-medium">Utilities per month</span>
                            <span className="font-semibold text-arrivio-green/80 text-[15px]">€{utilities.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-arrivio-green/5 mt-2">
                            <span className="text-[13px] font-bold text-arrivio-green">Monthly subtotal</span>
                            <span className="text-[15px] font-bold text-arrivio-green">€{monthlySubtotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-3.5 pt-2">
                        <div className="flex justify-between items-center text-arrivio-green/60">
                            <span className="text-[13px] font-medium">Booking fee</span>
                            <span className="font-semibold text-arrivio-green/80 text-[15px]">€{bookingFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-arrivio-green/60">
                            <span className="text-[13px] font-medium">Cleaning fee</span>
                            <span className="font-semibold text-arrivio-green/80 text-[15px]">€{cleaningFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-arrivio-green/5 mt-2">
                            <span className="text-[13px] font-bold text-arrivio-green">Total service fees</span>
                            <span className="text-[15px] font-bold text-arrivio-green">€{totalFees.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Total Summary - Subtle but clear */}
                <div className="pt-2">
                    <div className="bg-arrivio-green/95 text-[#f2f2f2] p-5 rounded-2xl shadow-xl shadow-arrivio-green/20">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Due now to book</p>
                                <p className="text-[11px] opacity-50 leading-tight pr-4 font-medium">First month rent & service fees</p>
                            </div>
                            <p className="text-3xl font-serif">€{dueNow.toLocaleString()}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-[10px] text-center text-arrivio-green/40 font-medium px-4">
                        Deposit is settled after signing the contract.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default PropertySummarySidebar;
