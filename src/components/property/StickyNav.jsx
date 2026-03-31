import React from "react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
    { label: "About", id: "about" },
    { label: "Available Units", id: "units" },
    { label: "Amenities", id: "amenities" },
    { label: "House Rules", id: "policies" },
    { label: "Documents", id: "details" },
    { label: "Location", id: "neighborhood" }
];

const StickyNav = ({ activeSection }) => {
    const scrollToSection = (e, sectionId) => {
        e.preventDefault();
        const el = document.getElementById(sectionId);
        if (el) {
            const offset = 120; // account for sticky nav height
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    return (
        <div className="hidden md:block sticky top-[80px] z-[25] bg-[#f2f2f2] mb-8 mt-6">
            <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={(e) => scrollToSection(e, item.id)}
                        className={`relative px-4 py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${activeSection === item.id
                            ? "text-[#111827]"
                            : "text-[#6b7280] hover:text-[#1f2937]"
                            }`}
                    >
                        {item.label}
                        {activeSection === item.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0f4c3a]"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default React.memo(StickyNav);
