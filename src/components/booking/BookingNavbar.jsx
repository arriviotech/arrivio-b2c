import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones } from "lucide-react";
import LanguageDropdown from "../common/LanguageDropdown";

/**
 * BookingNavbar - Specialized navbar for the booking process
 * Floating card style as per reference image
 */
const BookingNavbar = () => {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-2 sm:top-4 left-0 w-full z-[100] px-4 sm:px-12 md:px-24">
            <div className="max-w-[1440px] mx-auto bg-white rounded-xl sm:rounded-2xl shadow-sm border border-[#0f4c3a]/5 px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-1">
                {/* Left: Back Link */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 sm:gap-3 group transition-all"
                >
                    <div className="w-7 h-7 flex-shrink-0 rounded-sm border border-[#0f4c3a]/10 flex items-center justify-center bg-white group-hover:bg-[#0f4c3a] group-hover:text-white transition-all">
                        <ArrowLeft size={14} />
                    </div>
                    <span className="text-[12px] sm:text-[10px] font-bold uppercase tracking-wide sm:tracking-widest text-[#111827] text-left leading-[1.1] sm:leading-tight max-w-[65px] sm:max-w-none">Back</span>
                </button>

                {/* Right: Support & EN */}
                <div className="flex items-center gap-3 sm:gap-8 flex-shrink-0">
                    <button className="flex items-center gap-1 sm:gap-1.5 text-[#4b5563] hover:text-[#111827] transition-colors group">
                        <Headphones size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wide sm:tracking-widest">Support</span>
                    </button>

                    <div className="h-3 w-[1px] bg-[#0f4c3a]/10" />

                    <div className="scale-90 sm:scale-100 origin-right flex items-center">
                        <LanguageDropdown className="text-[#4b5563] hover:text-[#111827]" />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default BookingNavbar;
