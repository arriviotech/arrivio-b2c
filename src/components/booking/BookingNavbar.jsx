import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones } from "lucide-react";
import LanguageDropdown from "../common/LanguageDropdown";
import greenLogo from '../../assets/greenlogo.webp';

const BookingNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] h-20 px-6 md:px-12 bg-[#f2f2f2]/90 backdrop-blur-xl shadow-md">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        {/* Left: Back + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#4b5563] hover:text-[#111827] transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Back</span>
          </button>

          <div className="h-5 w-px bg-[#0f4c3a]/10 hidden sm:block" />

          <Link to="/" className="flex items-center">
            <img src={greenLogo} alt="Arrivio" className="h-7 sm:h-8 object-contain" />
          </Link>
        </div>

        {/* Right: Support + Language */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button className="flex items-center gap-1.5 text-[#4b5563] hover:text-[#111827] transition-colors group">
            <Headphones size={16} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Support</span>
          </button>

          <div className="h-4 w-px bg-[#0f4c3a]/10" />

          <LanguageDropdown className="text-[#4b5563] hover:text-[#111827]" />
        </div>
      </div>
    </nav>
  );
};

export default BookingNavbar;
