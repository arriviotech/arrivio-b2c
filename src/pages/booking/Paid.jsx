import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OptimizedImage from "../../components/common/OptimizedImage";
import { SIDEBAR_SIZES } from "../../utils/imageUtils";
import {
  ArrowRight,
  Download,
  CheckCircle,
  Clock,
  ClipboardList,
  PenTool,
  Home,
  ArrowLeft,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import BookingStepper from "../../components/booking/BookingStepper";
import { calculateDuration } from "../../utils/dateUtils";

const Paid = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const bookingData =
    state ||
    JSON.parse(localStorage.getItem("arrivio_booking")) ||
    {};

  const holdingDeposit = Number(bookingData.holdingDeposit) || 150;
  const monthlyRent = Number(bookingData.monthlyTotal) || 0;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startDateObj = bookingData.checkIn ? new Date(bookingData.checkIn) : null;
  const endDateObj = bookingData.checkOut ? new Date(bookingData.checkOut) : null;
  const duration = calculateDuration(bookingData.checkIn, bookingData.checkOut);

  const downloadReceipt = () => {
    const blob = new Blob(
      [`ARRIVIO HOLDING DEPOSIT RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Property: ${bookingData.title}
Move-in: ${bookingData.checkIn}
Move-out: ${bookingData.checkOut}
Monthly Rent: €${monthlyRent}

Holding Deposit Paid: €${holdingDeposit}
Status: Reserved — Pending Verification

Note: This amount will be deducted from your first month's rent upon move-in.

Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}

Thank you for choosing Arrivio.`],
      { type: "text/plain;charset=utf-8;" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `arrivio-receipt-${Date.now()}.txt`;
    link.click();
  };

  const nextSteps = [
    { icon: ClipboardList, title: "Complete application", desc: "Upload ID, proof of income & personal details", color: "text-[#0f4c3a]", bg: "bg-[#0f4c3a]/5", active: true },
    { icon: PenTool, title: "Sign the lease", desc: "Digital signature via DocuSign", color: "text-[#0f4c3a]", bg: "bg-[#0f4c3a]/5", active: false },
    { icon: Home, title: "Move in!", desc: "Collect your keys and settle in", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10", active: false },
  ];

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-24 sm:pt-28 pb-20">

        {/* Stepper */}
        <div className="flex justify-center mb-10">
          <div className="w-full max-w-lg">
            <BookingStepper currentStep={3} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ═══ LEFT COLUMN ═══ */}
          <div className="lg:col-span-7 space-y-6">

            {/* Success card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="bg-[#0f4c3a] rounded-2xl shadow-lg overflow-hidden relative"
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.04] rounded-full -translate-y-12 translate-x-12" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/[0.03] rounded-full translate-y-8 -translate-x-8" />

              <div className="px-6 py-6 relative">
                {/* Animated checkmark */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 relative flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full border-[3px] border-[#22C55E]/30"
                    />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                      className="absolute inset-1 rounded-full bg-[#22C55E] shadow-lg shadow-[#22C55E]/30"
                    />
                    <motion.svg
                      width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      className="relative z-10"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7, duration: 0.3 }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </motion.svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif text-white">Payment successful!</h2>
                    <p className="text-[12px] text-white/60 mt-0.5">Your unit is now reserved</p>
                  </div>
                </div>

                {/* Amount paid */}
                <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3 mb-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">Amount paid</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Holding deposit</p>
                  </div>
                  <span className="text-2xl font-bold text-white" style={{ fontVariantNumeric: 'lining-nums' }}>€{holdingDeposit.toLocaleString()}</span>
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A017] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A017]"></span>
                    </span>
                    <span className="text-[11px] font-semibold text-white/80">Reserved — Pending Verification</span>
                  </div>
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#D4A017]/20 text-[#D4A017] rounded-full text-[9px] font-bold uppercase tracking-wider">
                    <Clock size={10} /> 48h left
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Property card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm overflow-hidden"
            >
              <div className="relative h-32 overflow-hidden">
                <OptimizedImage src={bookingData.image} alt={bookingData.title} width={400} sizes={SIDEBAR_SIZES} className="w-full h-full" imgClassName="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-base font-serif text-white leading-tight">{bookingData.title}</p>
                  <p className="text-[10px] text-white/70 mt-0.5">
                    {bookingData.unitNumber ? `Unit ${bookingData.unitNumber}` : ''}{bookingData.city ? ` · ${bookingData.city}` : ''}
                  </p>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>
                    {startDateObj ? `${startDateObj.getDate()} ${MONTHS[startDateObj.getMonth()]} ${startDateObj.getFullYear()}` : bookingData.checkIn}
                  </span>
                  <span className="text-[#9ca3af]">→</span>
                  <span className="font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>
                    {endDateObj ? `${endDateObj.getDate()} ${MONTHS[endDateObj.getMonth()]} ${endDateObj.getFullYear()}` : bookingData.checkOut}
                  </span>
                </div>
                {duration && <span className="text-[9px] font-bold text-[#D4A017] bg-[#D4A017]/10 px-2 py-0.5 rounded-full">{duration}</span>}
              </div>
            </motion.div>

            {/* 48h warning */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#D4A017]/5 border border-[#D4A017]/15 rounded-2xl px-5 py-4 flex gap-3 items-start"
            >
              <Clock size={18} className="text-[#D4A017] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#111827]">Complete within 48 hours</p>
                <p className="text-[11px] text-[#6b7280] leading-relaxed mt-0.5">
                  Please complete your application and sign the lease within 48 hours to confirm your reservation. If not completed in time, your booking will be cancelled and deposit refunded.
                </p>
              </div>
            </motion.div>

            {/* Payment summary */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-[#22C55E]/20 shadow-sm p-5 border-l-4 border-l-[#22C55E]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#22C55E]">Payment received</p>
                </div>
                <button onClick={downloadReceipt} className="flex items-center gap-1 text-[10px] font-bold text-[#0f4c3a] hover:underline">
                  <Download size={11} /> Download receipt
                </button>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#4b5563]">Holding deposit</span>
                <span className="font-bold text-[#22C55E]" style={{ fontVariantNumeric: 'lining-nums' }}>€{holdingDeposit.toLocaleString()} paid</span>
              </div>
              <p className="text-[10px] text-[#9ca3af] mt-1">Deducted from your first month's rent upon move-in</p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <button
                onClick={() => {
                  const pendingApps = JSON.parse(localStorage.getItem("my_applications") || "[]");
                  const newApp = { ...bookingData, status: "In Progress", paymentStatus: "Paid", date: new Date().toISOString() };
                  if (!pendingApps.some(app => app.title === newApp.title)) {
                    pendingApps.push(newApp);
                    localStorage.setItem("my_applications", JSON.stringify(pendingApps));
                  }
                  localStorage.setItem("current_application", JSON.stringify(bookingData));
                  navigate("/application/details", { state: bookingData });
                }}
                className="w-full py-3.5 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0a3a2b] transition-colors"
              >
                Continue to application <ArrowRight size={14} />
              </button>

              <p className="text-[10px] text-[#9ca3af] text-center">
                Or <button onClick={() => navigate("/")} className="text-[#0f4c3a] font-semibold hover:underline underline-offset-2">complete later from your dashboard</button> — you have 48 hours.
              </p>
            </motion.div>
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="sticky top-24 space-y-4">

              {/* What's next */}
              <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-5">
                <h3 className="text-lg font-serif text-[#111827] mb-5">What's next</h3>
                <div className="space-y-0">
                  {nextSteps.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-full ${item.bg} flex items-center justify-center shrink-0 ${item.active ? 'ring-2 ring-[#0f4c3a]/20' : ''}`}>
                            <Icon size={16} className={item.color} />
                          </div>
                          {i < nextSteps.length - 1 && <div className="w-px flex-1 bg-[#e5e7eb] min-h-[20px]" />}
                        </div>
                        <div className="pb-4 -mt-0.5">
                          <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                          <p className="text-[10px] text-[#6b7280] leading-relaxed">{item.desc}</p>
                          {item.active && (
                            <span className="inline-block mt-1 text-[8px] font-bold text-[#0f4c3a] bg-[#0f4c3a]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Up next</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Helpful info */}
              <div className="bg-[#f9f9f7] rounded-2xl border border-[#0f4c3a]/5 p-4 flex items-start gap-2">
                <Info size={14} className="text-[#9ca3af] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#6b7280] leading-relaxed">
                  Your holding deposit is <span className="font-semibold text-[#4b5563]">fully refundable</span> if your application is not approved. It will be <span className="font-semibold text-[#4b5563]">deducted from your first month's rent</span> upon move-in.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paid;
