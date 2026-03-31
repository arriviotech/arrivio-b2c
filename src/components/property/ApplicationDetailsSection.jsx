import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    GraduationCap,
    Briefcase,
    Users,
    Download,
    ArrowRight,
    Info,
    FileText,
    UserCheck,
    CreditCard,
    Shield,
    Home
} from "lucide-react";

/**
 * ApplicationDetailsSection
 * Displays required documents based on resident type (Student, Professional, Family).
 */
const ApplicationDetailsSection = () => {
    const [residentType, setResidentType] = useState("student");

    const documentProfiles = {
        student: [
            {
                title: "University Enrollment",
                description: "Official certificate of enrollment or letter of acceptance from your university.",
                icon: <GraduationCap className="text-blue-500" size={20} />,
            },
            {
                title: "Identity Verification",
                description: "A valid Passport or National ID card from your home country.",
                icon: <UserCheck className="text-emerald-500" size={20} />,
            },
            {
                title: "Financial Proof",
                description: "Blocked account statement, scholarship letter, or 3 months of bank statements.",
                icon: <CreditCard className="text-amber-500" size={20} />,
            },
            {
                title: "Visa / Residence Permit",
                description: "Your valid German student visa or temporary residence permit (if applicable).",
                icon: <FileText className="text-purple-500" size={20} />,
            }
        ],
        professional: [
            {
                title: "Employment Contract",
                description: "A signed copy of your current employment contract in Germany.",
                icon: <Briefcase className="text-blue-500" size={20} />,
            },
            {
                title: "Last 3 Pay Slips",
                description: "Proof of consistent income from the last three consecutive months.",
                icon: <CreditCard className="text-emerald-500" size={20} />,
            },
            {
                title: "Identity Verification",
                description: "A valid Passport or National ID card.",
                icon: <UserCheck className="text-amber-500" size={20} />,
            },
            {
                title: "Visa / Residence Permit",
                description: "Your valid German work visa or residence permit (EU citizens exempt).",
                icon: <FileText className="text-purple-500" size={20} />,
            }
        ],
        azubi: [
            {
                title: "Ausbildungsvertrag",
                description: "Your signed apprenticeship training contract (Ausbildungsvertrag) with your employer.",
                icon: <Briefcase className="text-blue-500" size={20} />,
            },
            {
                title: "Identity Verification",
                description: "A valid Passport or National ID card from your home country.",
                icon: <UserCheck className="text-emerald-500" size={20} />,
            },
            {
                title: "Stipend / Income Proof",
                description: "Proof of your apprenticeship stipend or financial support documentation.",
                icon: <CreditCard className="text-amber-500" size={20} />,
            },
            {
                title: "Visa / Residence Permit",
                description: "Your valid German visa or residence permit for the duration of your Ausbildung.",
                icon: <FileText className="text-purple-500" size={20} />,
            }
        ]
    };

    const tabs = [
        { id: "student", label: "Student", icon: <GraduationCap size={14} /> },
        { id: "professional", label: "Professional", icon: <Briefcase size={14} /> },
        { id: "azubi", label: "Azubi", icon: <Users size={14} /> }
    ];

    return (
        <div id="details" className="pt-16 border-t border-[#0f4c3a]/10 scroll-mt-40">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
                <div className="space-y-3">
                    <h3 className="font-serif text-2xl text-[#111827]">Application Details</h3>
                    <p className="text-xs text-[#6b7280] font-bold uppercase tracking-widest leading-relaxed max-w-xl">
                        Select your profile to view the specific documents required for this residency.
                    </p>
                </div>
            </div>

            {/* Profile Selector Tabs & Global Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                <div className="flex p-1 bg-[#f7f7f7] border border-[#0f4c3a]/5 rounded-xl w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setResidentType(tab.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${residentType === tab.id
                                ? "bg-white text-[#111827] shadow-sm ring-1 ring-[#0f4c3a]/5"
                                : "text-[#9ca3af] hover:text-[#4b5563]"
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <button className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-white border border-[#0f4c3a]/10 rounded-full text-xs font-semibold text-[#111827] hover:bg-[#0f4c3a] hover:text-white transition-all shadow-sm ml-auto">
                    <Download size={13} />
                    <span>Download Checklist</span>
                </button>
            </div>

            {/* Documents Grid with Animation */}
            <div className="relative">

                <div className="relative min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {/* ... existing motion logic ... */}
                        <motion.div
                            key={residentType}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-3"
                        >
                            {documentProfiles[residentType].map((doc, idx) => (
                                <div
                                    key={idx}
                                    className="p-6 bg-white/40 border border-[#0f4c3a]/5 rounded-[2.5rem] transition-all group lg:p-8"
                                >
                                    <div className="flex items-start gap-5">
                                        <div className="p-4 bg-[#f2f2f2] rounded-2xl transition-all duration-500">
                                            {doc.icon}
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <h4 className="text-sm font-bold text-[#111827]">
                                                {doc.title}
                                            </h4>
                                            <p className="text-xs text-[#4b5563] leading-relaxed font-medium">
                                                {doc.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Information Note - Centered and narrowed */}
                <div className="mt-8 flex items-center gap-4 px-6 py-4 bg-emerald-50/50 border border-emerald-100/50 rounded-3xl max-w-md mx-auto">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                        <Info size={18} className="text-emerald-600" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-xs text-[#374151] font-medium leading-relaxed">
                            <span className="font-bold text-[#111827]">Ready to apply?</span> Download the full document checklist for your records.
                        </p>
                        <p className="text-xs text-[#6b7280] font-bold uppercase tracking-widest">
                            Estimated time to complete application: 10-15 minutes
                        </p>
                    </div>
                </div>
            </div>

            {/* Download button — mobile only, at bottom */}
            <button className="md:hidden flex items-center justify-center gap-1.5 w-full mt-6 px-4 py-3 bg-white border border-[#0f4c3a]/10 rounded-xl text-xs font-semibold text-[#111827] hover:bg-[#0f4c3a] hover:text-white transition-all shadow-sm">
                <Download size={13} />
                <span>Download Checklist</span>
            </button>
        </div>
    );
};

export default ApplicationDetailsSection;
