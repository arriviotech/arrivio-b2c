import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, PenTool, CheckCircle, Loader2, Download, Info } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import ContractPDF from "./ContractPDF";
import BookingStepper from "../../components/booking/BookingStepper";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase/client";
import { calculateDuration } from "../../utils/dateUtils";

const SignLease = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const bookingData = state || JSON.parse(localStorage.getItem("current_application")) || {};
  const [signatureName, setSignatureName] = useState("");
  const [signatureDate, setSignatureDate] = useState(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startDateObj = bookingData.checkIn ? new Date(bookingData.checkIn) : null;
  const endDateObj = bookingData.checkOut ? new Date(bookingData.checkOut) : null;
  const duration = calculateDuration(bookingData.checkIn, bookingData.checkOut);
  const monthlyRent = Number(bookingData.monthlyTotal) || 0;

  // Pre-fill name from auth
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setSignatureName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleSign = async () => {
    if (!signatureName.trim() || !agreed) return;
    setSigning(true);

    try {
      // Update application status in DB
      if (bookingData.applicationId) {
        await supabase
          .from('applications')
          .update({ status: 'under_review' })
          .eq('id', bookingData.applicationId);
      }

      // Simulate signing delay
      await new Promise(r => setTimeout(r, 1500));
      setSigned(true);
    } catch (e) {
      console.error('Signing error:', e);
    } finally {
      setSigning(false);
    }
  };

  const handleDownloadContract = async () => {
    const pdfProperty = {
      title: bookingData.title || "Property",
      address: bookingData.address || "",
      apartmentNo: bookingData.unitNumber || "",
      floor: bookingData.floor || "",
      size: bookingData.size || "",
    };
    const pdfBooking = {
      checkIn: bookingData.checkIn || "",
      checkOut: bookingData.checkOut || "",
      monthlyRent: monthlyRent,
      utilities: 0,
      totalMonthly: monthlyRent,
      deposit: bookingData.deposit || 0,
    };
    const docId = `ARR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const blob = await pdf(<ContractPDF property={pdfProperty} booking={pdfBooking} docId={docId} />).toBlob();
    window.open(URL.createObjectURL(blob), "_blank");
  };

  if (!bookingData.title) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <p className="text-sm text-[#4b5563] mb-4">No active application found.</p>
          <button onClick={() => navigate('/profile')} className="text-[#0f4c3a] font-semibold text-sm hover:underline">Go to dashboard</button>
        </div>
      </div>
    );
  }

  // Success state after signing
  if (signed) {
    const SERVICES = [
      { icon: "🚗", title: "Airport Pickup", desc: "We'll pick you up from the airport on move-in day", tag: "Popular" },
      { icon: "📱", title: "German SIM Card", desc: "Get a pre-activated SIM card delivered to your unit", tag: "Free" },
      { icon: "🛋️", title: "Furniture Package", desc: "Extra furniture and home essentials for your stay", tag: null },
      { icon: "📦", title: "Move-in Kit", desc: "Bedding, towels, kitchen starter pack ready on arrival", tag: "Popular" },
      { icon: "📋", title: "City Registration", desc: "We help you register at the Burgeramt (Anmeldung)", tag: null },
      { icon: "🏥", title: "Health Insurance", desc: "Guidance on choosing the right insurance plan", tag: null },
    ];

    return (
      <div className="min-h-screen bg-[#f2f2f2]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-20">

          {/* Success card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f4c3a] rounded-2xl shadow-lg p-6 sm:p-8 text-center mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] rounded-full -translate-y-12 translate-x-12" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/[0.03] rounded-full translate-y-8 -translate-x-8" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-14 h-14 rounded-full bg-[#22C55E] flex items-center justify-center mx-auto mb-4 relative"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>
            </motion.div>

            <h2 className="text-2xl font-serif text-white mb-2 relative">Application complete!</h2>
            <p className="text-[13px] text-white/60 max-w-md mx-auto relative">
              Your lease has been signed and submitted. Our team is now reviewing your application. You'll be notified once approved.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 relative">
              <button onClick={handleDownloadContract} className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-colors inline-flex items-center gap-2 justify-center">
                <Download size={12} /> Download Contract
              </button>
            </div>
          </motion.div>

          {/* What happens next */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-5 mb-6"
          >
            <h3 className="text-lg font-serif text-[#111827] mb-4">What happens next</h3>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className={`flex-1 h-1.5 rounded-full ${step === 1 ? 'bg-[#0f4c3a]' : 'bg-[#e5e7eb]'}`} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[9px] font-bold text-[#0f4c3a]">Now</p>
                <p className="text-[8px] text-[#6b7280]">Under review</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#9ca3af]">Soon</p>
                <p className="text-[8px] text-[#9ca3af]">Approval notification</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#9ca3af]">Move-in day</p>
                <p className="text-[8px] text-[#9ca3af]">Collect your keys</p>
              </div>
            </div>
          </motion.div>

          {/* Services promotion */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-serif text-[#111827]">Make your move easier</h3>
                <p className="text-[11px] text-[#6b7280]">Services to help you settle in</p>
              </div>
              <button onClick={() => navigate('/profile/services')} className="text-[10px] font-bold text-[#0f4c3a] hover:underline">
                View all →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SERVICES.map((service, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  onClick={() => navigate('/profile/services')}
                  className="bg-white rounded-xl border border-[#0f4c3a]/5 shadow-sm p-3.5 cursor-pointer hover:shadow-md hover:border-[#0f4c3a]/15 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xl">{service.icon}</span>
                    {service.tag && (
                      <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                        service.tag === 'Free' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#D4A017]/10 text-[#D4A017]'
                      }`}>{service.tag}</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#111827] mb-0.5">{service.title}</p>
                  <p className="text-[9px] text-[#6b7280] leading-relaxed">{service.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Community + Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button onClick={() => navigate('/profile/community')} className="flex-1 py-3 bg-white border border-[#0f4c3a]/10 text-[#4b5563] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#f9f9f7] transition-colors text-center">
              Join Community
            </button>
            <button onClick={() => navigate('/profile')} className="flex-1 py-3 bg-[#0f4c3a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a3a2b] transition-colors text-center">
              Go to Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-24 sm:pt-28 pb-20">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#4b5563] hover:text-[#111827] transition-colors group mb-6"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </button>

        {/* Stepper */}
        <div className="flex justify-center mb-10">
          <div className="w-full max-w-lg">
            <BookingStepper currentStep={4} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT — Signing form */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="text-2xl font-serif text-[#111827] mb-1">Sign your lease</h2>
              <p className="text-[12px] text-[#6b7280]">Review and sign your rental agreement to finalize your booking</p>
            </div>

            {/* Contract preview */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-[#0f4c3a]" />
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">Rental Agreement</h3>
                    <p className="text-[10px] text-[#6b7280]">{bookingData.title}</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadContract}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#f9f9f7] hover:bg-[#f2f2f2] border border-[#0f4c3a]/10 rounded-lg transition-colors"
                >
                  <Download size={13} className="text-[#0f4c3a]" />
                  <span className="text-[10px] font-semibold text-[#111827]">Preview PDF</span>
                </button>
              </div>

              {/* Key terms summary */}
              <div className="bg-[#f9f9f7] rounded-xl p-4 space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Property</span>
                  <span className="font-semibold text-[#111827]">{bookingData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Move-in</span>
                  <span className="font-semibold text-[#111827]">
                    {startDateObj ? `${startDateObj.getDate()} ${MONTHS[startDateObj.getMonth()]} ${startDateObj.getFullYear()}` : bookingData.checkIn}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Move-out</span>
                  <span className="font-semibold text-[#111827]">
                    {endDateObj ? `${endDateObj.getDate()} ${MONTHS[endDateObj.getMonth()]} ${endDateObj.getFullYear()}` : bookingData.checkOut}
                  </span>
                </div>
                {duration && (
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Duration</span>
                    <span className="font-semibold text-[#D4A017]">{duration}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Monthly rent</span>
                  <span className="font-semibold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{monthlyRent.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>

            {/* Signature section */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <PenTool size={16} className="text-[#0f4c3a]" />
                <h3 className="text-sm font-bold text-[#111827]">Your signature</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#4b5563]">Full legal name <span className="text-[#EA4335]">*</span></label>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="w-full bg-[#f9f9f7] border border-[#0f4c3a]/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0f4c3a]/30 text-[#111827]"
                    placeholder="Enter your full legal name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#4b5563]">Date</label>
                  <input
                    type="text"
                    value={signatureDate}
                    readOnly
                    className="w-full bg-[#f9f9f7] border border-[#0f4c3a]/10 rounded-lg px-3.5 py-2.5 text-sm text-[#111827]"
                  />
                </div>

                {/* Signature preview */}
                {signatureName && (
                  <div className="border-2 border-dashed border-[#0f4c3a]/10 rounded-xl p-6 text-center">
                    <p className="font-serif text-3xl text-[#0f4c3a] italic">{signatureName}</p>
                    <p className="text-[9px] text-[#9ca3af] mt-2">Digital signature preview</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Agreement + Sign */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-4"
            >
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setAgreed(!agreed)}
              >
                <div className={`mt-0.5 w-4 h-4 rounded border-[1.5px] flex-shrink-0 flex items-center justify-center transition-all ${
                  agreed ? 'bg-[#0f4c3a] border-[#0f4c3a]' : 'border-[#d1d5db] bg-white'
                }`}>
                  {agreed && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <p className="text-[12px] text-[#4b5563] leading-relaxed">
                  I have read and agree to the <span className="text-[#0f4c3a] font-semibold">Rental Agreement</span>, including all terms, conditions, and house rules. I understand this is a legally binding contract.
                </p>
              </div>

              <button
                onClick={handleSign}
                disabled={!signatureName.trim() || !agreed || signing}
                className={`w-full py-3.5 rounded-xl font-bold uppercase text-sm tracking-widest transition-colors flex items-center justify-center gap-2 ${
                  signatureName.trim() && agreed
                    ? "bg-[#0f4c3a] text-[#f2f2f2] hover:bg-[#0a3a2b]"
                    : "bg-[#e5e5e5] text-[#9ca3af] cursor-not-allowed"
                }`}
              >
                {signing ? (
                  <><Loader2 size={14} className="animate-spin" /> Signing...</>
                ) : (
                  <><PenTool size={14} /> Sign & Submit</>
                )}
              </button>

              <p className="text-[10px] text-[#9ca3af] leading-relaxed text-center">
                By signing, you confirm that all information provided is accurate. This digital signature is legally equivalent to a handwritten signature under German law (BGB §126a).
              </p>
            </motion.div>
          </div>

          {/* RIGHT — Info sidebar */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {/* What signing means */}
              <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-5">
                <h3 className="text-lg font-serif text-[#111827] mb-4">Before you sign</h3>
                <div className="space-y-3">
                  {[
                    { title: "Review the contract", desc: "Make sure all details are correct: dates, rent amount, and terms." },
                    { title: "Understand your commitment", desc: "This is a binding agreement for the duration of your stay." },
                    { title: "Cancellation after signing", desc: "You have a 14-day withdrawal right after signing (German law)." },
                    { title: "What happens next", desc: "We review your application. Once approved, you're ready to move in!" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[8px] font-bold text-[#0f4c3a]">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#111827]">{item.title}</p>
                        <p className="text-[10px] text-[#6b7280] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info note */}
              <div className="bg-[#f9f9f7] rounded-2xl border border-[#0f4c3a]/5 p-4 flex items-start gap-2">
                <Info size={14} className="text-[#9ca3af] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#6b7280] leading-relaxed">
                  When DocuSign is integrated, you'll sign directly through their secure platform. This demo uses a typed signature for testing purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignLease;
