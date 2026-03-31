import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

const LanguageDropdown = ({ className }) => {
    const { language: selectedLang, setLanguage, languages } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (code) => {
        setLanguage(code);
        setIsOpen(false);
    };

    // Default color if no class passed
    const textColorClass = className || "text-[#111827]";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`flex items-center gap-1.5 focus:outline-none group opacity-80 hover:opacity-100 transition-opacity ${textColorClass}`}
            >
                <Globe size={16} className="currentColor" />
                <span className="text-[11px] font-bold uppercase tracking-widest">
                    {selectedLang}
                </span>
                <ChevronDown
                    size={12}
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden z-[200]"
                    >
                        <div className="py-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleSelect(lang.code)}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between transition-colors
                    ${selectedLang === lang.code
                                            ? "bg-[#0f4c3a]/5 text-[#111827]"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        {lang.label}
                                    </span>
                                    {selectedLang === lang.code && <Check size={12} className="text-[#D4A017]" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageDropdown;
