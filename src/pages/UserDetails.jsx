import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, MapPin, Calendar, Check, PartyPopper, Bookmark, Loader2 } from "lucide-react";

import PersonalDetails from "../components/UserDetails/PersonalDetails";
import AddressDetails from "../components/UserDetails/AddressDetails";
import OccupationDetails from "../components/UserDetails/OccupationDetails";
import RequiredDocuments from "../components/UserDetails/RequiredDocuments";
import CameraModal from "../components/UserDetails/CameraModal";
import api from "../api/client";

// Map frontend doc keys → API document_type values
const DOCUMENT_TYPE_MAP = {
    passport: 'passport',
    visa: 'residence_permit',
    govId: 'national_id',
    workDocument: 'employment_contract',
    admissionLetter: 'enrollment_letter',
};

// Convert a File object to base64 string
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const UserDetails = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    // Retrieve booking data either from state or fallback (localStorage if saved)
    const bookingData = state || JSON.parse(localStorage.getItem("current_application")) || {};

    const [documents, setDocuments] = useState({
        passport: null,
        visa: null,
        govId: null,
        selfie: null,
        workDocument: null,
        admissionLetter: null
    });

    // Camera state
    const [showCamera, setShowCamera] = useState(false);
    const [modal, setModal] = useState(null); // { type: 'saved' | 'submitted' }

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dob: "",
        email: "",
        phone: "",
        currentAddress: "",

        // Dynamic Occupation Fields
        occupation: "work", // 'work' or 'study'

        // Work Fields
        employer: "",
        jobTitle: "",

        // Study Fields
        university: "",
        course: "",

        income: "", // Shared: Monthly Income or Budget
        emergencyContactName: "",
        emergencyContactPhone: "",
    });

    const [countryCode, setCountryCode] = useState("+49");
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Initial state setup: Load draft if exists, else use empty
    // We use a specific key for the draft based on the property or a generic one
    const DRAFT_KEY = `draft_application_${bookingData.title || 'generic'}`;

    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                setFormData(parsed.formData || {});
                setCountryCode(parsed.countryCode || "+49");
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        }
    }, [DRAFT_KEY]);

    // Auto-save effect
    useEffect(() => {
        if (!isSubmitted && bookingData.title) {
            const draft = {
                formData,
                countryCode,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        }
    }, [formData, countryCode, isSubmitted, bookingData.title, DRAFT_KEY]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveAndLeave = (e) => {
        e.preventDefault();
        // Force save current state
        const draft = {
            formData,
            countryCode,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setModal('saved');
    };

    // File Handling
    const handleFileChange = (e, type) => {
        if (e.target.files && e.target.files[0]) {
            setDocuments(prev => ({ ...prev, [type]: e.target.files[0] }));
        }
    };

    const handleCameraConfirm = (dataUrl) => {
        setDocuments(prev => ({ ...prev, selfie: dataUrl }));
        setShowCamera(false);
    };

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bookingData.applicationId) {
            setUploadError('No application found. Please start the booking process again.');
            return;
        }

        setUploading(true);
        setUploadError(null);

        try {
            // Upload each document that has a file
            const uploadPromises = Object.entries(documents)
                .filter(([key, file]) => file && DOCUMENT_TYPE_MAP[key])
                .map(async ([key, file]) => {
                    // file can be a File object or a data URL string (selfie)
                    const base64 = typeof file === 'string' ? file : await fileToBase64(file);
                    const fileName = typeof file === 'string' ? 'selfie.jpg' : file.name;
                    const mimeType = typeof file === 'string' ? 'image/jpeg' : file.type;

                    return api.post('/documents/upload', {
                        applicationId: bookingData.applicationId,
                        documentType: DOCUMENT_TYPE_MAP[key],
                        file: base64,
                        fileName,
                        mimeType,
                    });
                });

            // Upload selfie separately (not in DOCUMENT_TYPE_MAP — stored as passport photo)
            if (documents.selfie) {
                const selfieBase64 = typeof documents.selfie === 'string'
                    ? documents.selfie
                    : await fileToBase64(documents.selfie);

                uploadPromises.push(
                    api.post('/documents/upload', {
                        applicationId: bookingData.applicationId,
                        documentType: 'passport',
                        file: selfieBase64,
                        fileName: 'selfie-verification.jpg',
                        mimeType: 'image/jpeg',
                    })
                );
            }

            await Promise.all(uploadPromises);

            // Trigger DocuSign envelope for tenant signing
            try {
                const { data } = await api.post('/docusign/send', {
                    applicationId: bookingData.applicationId,
                });
                // If API returns an embedded signing URL, redirect to it
                if (data.data?.signingUrl) {
                    window.location.href = data.data.signingUrl;
                    return;
                }
            } catch (docuSignErr) {
                // DocuSign may not be configured yet — don't block the flow
                console.warn('DocuSign not available:', docuSignErr.response?.data?.error?.message || docuSignErr.message);
            }

            setIsSubmitted(true);
            localStorage.removeItem(DRAFT_KEY);
            setModal('submitted');
        } catch (err) {
            const message = err.response?.data?.error?.message || 'Failed to upload documents. Please try again.';
            setUploadError(message);
        } finally {
            setUploading(false);
        }
    };

    if (!bookingData.title) {
        return <div className="p-10 text-center">No active application found. <button onClick={() => navigate('/')} className="underline">Go Home</button></div>;
    }

    // Duration Logic
    const getDurationText = (start, end) => {
        if (!start || !end) return "";
        const s = new Date(start);
        const e = new Date(end);
        if (isNaN(s) || isNaN(e)) return "";

        const diffTime = Math.abs(e - s);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const months = Math.floor(totalDays / 30);
        const weeks = Math.floor((totalDays % 30) / 7);
        const days = (totalDays % 30) % 7;

        const parts = [];
        if (months > 0) parts.push(`${months} Month${months !== 1 ? 's' : ''}`);
        if (weeks > 0) parts.push(`${weeks} Week${weeks !== 1 ? 's' : ''}`);
        if (days > 0) parts.push(`${days} Day${days !== 1 ? 's' : ''}`);

        return parts.length > 0 ? parts.join(', ') : "1 Day";
    };

    const durationText = getDurationText(bookingData.checkIn, bookingData.checkOut);
    const utilitiesFee = 45; // Estimated utilities
    const monthlyRent = parseFloat(bookingData.monthlyTotal) || 0;
    const totalMonthly = monthlyRent + utilitiesFee;

    return (
        <div className="min-h-screen bg-[#f2f2f2] font-sans text-[#111827]">
            {/* Header */}
            <div className="bg-white border-b border-[#0f4c3a]/10 px-6 py-4 sticky top-0 z-20 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#f0f0f0] rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-serif text-xl font-bold">Application Details</h1>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-[#4b5563]">Completing for: <span className="font-bold">{bookingData.title}</span></p>
                            <span className="text-[10px] bg-[#0f4c3a]/5 px-2 py-0.5 rounded text-[#6b7280]">Auto-saving drafts</span>
                        </div>
                    </div>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-green-100 text-green-700 rounded-full">
                    In Progress
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* LEFT: FORM */}
                <div className="lg:col-span-3 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        <PersonalDetails
                            formData={formData}
                            handleChange={handleChange}
                            setFormData={setFormData}
                            countryCode={countryCode}
                            setCountryCode={setCountryCode}
                        />

                        <AddressDetails
                            formData={formData}
                            handleChange={handleChange}
                        />

                        <OccupationDetails
                            formData={formData}
                            handleChange={handleChange}
                            documents={documents}
                            handleFileChange={handleFileChange}
                        />

                        <RequiredDocuments
                            documents={documents}
                            handleFileChange={handleFileChange}
                            onStartCamera={() => setShowCamera(true)}
                        />

                        {uploadError && (
                            <div className="bg-[#EA4335]/5 border border-[#EA4335]/20 rounded-xl p-4">
                                <p className="text-xs text-[#EA4335] font-medium">{uploadError}</p>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-4">
                            <button
                                type="button"
                                onClick={handleSaveAndLeave}
                                disabled={uploading}
                                className="bg-[#0f4c3a] text-[#f2f2f2] px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#0a3a2b] transition-colors shadow-lg shadow-[#0f4c3a]/10 flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={16} /> Save & Leave
                            </button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="bg-[#0f4c3a] text-[#f2f2f2] px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#0a3a2b] transition-colors shadow-lg shadow-[#0f4c3a]/10 flex items-center gap-2 disabled:opacity-50"
                            >
                                {uploading ? (
                                    <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                                ) : (
                                    <>Save & Continue <ArrowLeft size={16} className="rotate-180" /></>
                                )}
                            </button>
                        </div>

                    </form>
                </div>

                {/* RIGHT: SUMMARY CARD */}
                <div className="hidden lg:col-span-2 lg:block">
                    <div className="sticky top-28 space-y-6">
                        <div className="bg-[#212E24] rounded-2xl overflow-hidden shadow-2xl text-[#f2f2f2]">
                            <div className="h-40 relative">
                                <img src={bookingData.image} alt="Property" className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#212E24] to-transparent"></div>
                                <div className="absolute bottom-4 left-4">
                                    <h3 className="font-serif text-xl">{bookingData.title}</h3>
                                    <div className="flex items-center gap-1 text-xs text-[#f2f2f2]/80 mt-1 font-medium tracking-wide">
                                        <MapPin size={12} className="text-white/60" />
                                        <span>{bookingData.city || bookingData.location || "Berlin, Germany"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 text-xs">
                                {/* DATES - BOOKING WIDGET STYLE */}
                                <div className="flex mb-2 relative z-20 bg-[#f0f0f0]/10 border border-white/10 rounded-2xl shadow-sm">
                                    {/* MOVE-IN */}
                                    <div className="w-1/2 border-r border-white/10 relative p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-white/60">
                                                <Calendar size={18} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <span className="block text-[9px] font-bold uppercase tracking-widest text-white/50 mb-0.5">
                                                    Move In
                                                </span>
                                                <span className="text-sm font-medium leading-none text-[#f2f2f2]">
                                                    {bookingData.checkIn}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* MOVE-OUT */}
                                    <div className="w-1/2 relative p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-white/60">
                                                <Calendar size={18} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <span className="block text-[9px] font-bold uppercase tracking-widest text-white/50 mb-0.5">
                                                    Move Out
                                                </span>
                                                <span className="text-sm font-medium leading-none text-[#f2f2f2]">
                                                    {bookingData.checkOut}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {durationText && (
                                    <div className="bg-[#0f4c3a]/60 p-3 rounded-xl mb-4 text-center border border-white/5">
                                        <span className="text-xs font-medium text-[#f2f2f2]/80">Duration: <span className="text-white">{durationText}</span></span>
                                    </div>
                                )}

                                <div className="space-y-2 pb-2 border-t border-white/10 pt-4">
                                    <div className="flex justify-between text-xs">
                                        <span className="opacity-60">Base Rent</span>
                                        <span className="font-medium">€{bookingData.monthlyTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="opacity-60">Utilities & Services</span>
                                        <span className="font-medium">€{utilitiesFee}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-white/10 mt-2">
                                        <span className="font-bold text-[#f2f2f2]">Total Monthly</span>
                                        <span className="font-bold text-white">€{totalMonthly}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/5 p-4 text-center">
                                <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Application Status</p>
                                <p className="text-sm font-bold text-yellow-400 mt-1">Incomplete</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#0f4c3a]/5 shadow-sm">
                            <h4 className="font-bold text-[#111827] mb-2 text-sm">Need Help?</h4>
                            <p className="text-xs text-[#4b5563] leading-relaxed mb-4">
                                If you have questions about the application process, our support team is available 24/7.
                            </p>
                            <button className="w-full py-2 border border-[#0f4c3a]/10 rounded-lg text-xs font-bold uppercase tracking-widest text-[#4b5563] hover:bg-[#f0f0f0] transition-colors">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* CAMERA OVERLAY */}
            {showCamera && (
                <CameraModal
                    onClose={() => setShowCamera(false)}
                    onConfirm={handleCameraConfirm}
                />
            )}

            {/* CUTE MODAL */}
            <AnimatePresence>
                {modal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                        onClick={() => { setModal(null); navigate('/profile'); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* ICON */}
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${modal === 'submitted'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-amber-50 text-amber-500'
                                }`}>
                                {modal === 'submitted'
                                    ? <PartyPopper size={28} />
                                    : <Bookmark size={28} />
                                }
                            </div>

                            {/* TEXT */}
                            <h3 className="font-serif text-xl font-bold text-[#111827] mb-2">
                                {modal === 'submitted' ? 'Application Submitted!' : 'Draft Saved!'}
                            </h3>
                            <p className="text-sm text-[#4b5563] leading-relaxed mb-6">
                                {modal === 'submitted'
                                    ? 'Your application has been submitted successfully. We\'ll review it and get back to you soon! ✨'
                                    : 'Your progress has been saved. You can come back anytime to pick up where you left off 💾'
                                }
                            </p>

                            {/* BUTTON */}
                            <button
                                onClick={() => { setModal(null); navigate('/profile'); }}
                                className="w-full py-3.5 bg-[#0f4c3a] text-[#f2f2f2] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#0a3a2b] transition-colors shadow-lg shadow-[#0f4c3a]/20"
                            >
                                {modal === 'submitted' ? 'Back to Profile' : 'Got it!'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default UserDetails;


