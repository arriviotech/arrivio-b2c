import React from "react";
import {
    CigaretteOff, PawPrint, Music, Users,
    Clock, CalendarCheck, AlertTriangle
} from "lucide-react";

const ResidentGuidelinesSection = () => {
    return (
        <div id="policies" className="pt-12 border-t border-[#0f4c3a]/10 scroll-mt-40">
            <h3 className="font-serif text-2xl text-[#111827] mb-6">House Rules</h3>

            {/* Single clean list */}
            <div className="space-y-5">
                {/* Rules */}
                <div className="flex flex-wrap gap-2.5">
                    {[
                        { icon: <CigaretteOff size={14} />, text: "No smoking" },
                        { icon: <PawPrint size={14} />, text: "No pets" },
                        { icon: <Music size={14} />, text: "No parties" },
                        { icon: <Users size={14} />, text: "Max 2 guests" },
                    ].map((rule, i) => (
                        <span key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#e5e7eb] bg-white text-sm font-medium text-[#111827]">
                            <span className="text-[#9ca3af]">{rule.icon}</span>
                            {rule.text}
                        </span>
                    ))}
                </div>

                {/* Check-in / Check-out */}
                <div className="flex flex-wrap gap-2.5">
                    <span className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#e5e7eb] bg-white text-sm font-medium text-[#111827]">
                        <Clock size={14} className="text-[#9ca3af]" />
                        Check-in: 15:00 <span className="text-xs text-[#9ca3af]">· Contactless</span>
                    </span>
                    <span className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#e5e7eb] bg-white text-sm font-medium text-[#111827]">
                        <CalendarCheck size={14} className="text-[#9ca3af]" />
                        Check-out: 11:00 <span className="text-xs text-[#9ca3af]">· Flexible</span>
                    </span>
                </div>

            </div>

            {/* Cancellation — highlighted */}
            <div className="mt-6 bg-amber-50/60 rounded-2xl border border-amber-200/60 p-5">
                <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-[#111827] mb-1">Cancellation policy</p>
                        <p className="text-xs text-[#4b5563] leading-relaxed">
                            Full refund if cancelled 30+ days before move-in. 50% refund if cancelled within 48 hours of booking. No refund after that.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResidentGuidelinesSection;
