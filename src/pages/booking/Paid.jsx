import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Download,
  CheckCircle,
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";

/* =========================================================
   PRICE BREAKDOWN (same as payment page)
========================================================= */
const DetailedPriceBreakdown = ({ state, theme = "dark" }) => {
  const textColor =
    theme === "dark" ? "text-[#f2f2f2]" : "text-[#111827]";
  const labelColor =
    theme === "dark" ? "text-[#f2f2f2]/70" : "text-[#374151]";
  const borderColor =
    theme === "dark" ? "border-white/10" : "border-[#0f4c3a]/10";

  const monthlyTotal = Number(state?.monthlyTotal) || 0;
  const bookingFee = Number(state?.bookingFee) || Number(state?.booking_fee) || 0;
  const cleaningFee = Number(state?.cleaningFee) || Number(state?.cleaning_fee) || 0;
  const payNow = monthlyTotal + bookingFee + cleaningFee;

  return (
    <div className="space-y-3 text-xs w-full text-left">
      <div className={`flex justify-between items-center ${textColor}`}>
        <span className={labelColor}>First Month Rent</span>
        <span className="font-semibold tracking-wide">€{monthlyTotal.toLocaleString()}</span>
      </div>

      <div className={`border-t ${borderColor}`} />

      <div className={`flex justify-between items-center ${textColor}`}>
        <span className={labelColor}>Booking Fee</span>
        <span className="font-semibold tracking-wide">€{bookingFee.toLocaleString()}</span>
      </div>

      <div className={`flex justify-between items-center ${textColor}`}>
        <span className={labelColor}>Cleaning Fee</span>
        <span className="font-semibold tracking-wide">€{cleaningFee.toLocaleString()}</span>
      </div>

      <div className="pt-2 flex justify-between items-center font-bold text-green-400">
        <span className="uppercase tracking-wider text-[10px]">Total Paid</span>
        <span className="text-sm">€{payNow.toLocaleString()}</span>
      </div>
    </div>
  );
};

/* =========================================================
   PAID PAGE
========================================================= */
/* =========================================================
   PAID PAGE
========================================================= */
const Paid = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // ✅ SAFE FALLBACK FOR CASHFREE REDIRECT
  const bookingData =
    state ||
    JSON.parse(localStorage.getItem("arrivio_booking")) ||
    {};

  const payNow =
    (Number(bookingData.monthlyTotal) || 0) +
    (Number(bookingData.bookingFee) || Number(bookingData.booking_fee) || 0) +
    (Number(bookingData.cleaningFee) || Number(bookingData.cleaning_fee) || 0);

  const downloadInvoice = () => {
    const blob = new Blob(
      [
        `INVOICE

Property: ${bookingData.title}
Amount Paid: €${payNow}
Check-in: ${bookingData.checkIn}
Check-out: ${bookingData.checkOut}

Thank you for booking with Arrivio.`
      ],
      { type: "text/plain;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "invoice.txt";
    link.click();
  };

  return (
    <div className="min-h-screen w-full bg-[#f2f2f2] flex flex-col md:flex-row overflow-hidden font-sans text-[#111827]">

      {/* LEFT COLUMN - Message & Actions */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center px-8 md:px-14 py-12 md:py-0 relative z-10">
        <div className="max-w-md mx-auto md:mx-0 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Success Icon */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-green-600/10 flex items-center justify-center text-green-700">
              <CheckCircle size={28} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-[#111827]">
              Payment Successful
            </h2>
          </div>

          <div className="space-y-6 border-l-2 border-[#0f4c3a]/10 pl-6 mb-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4b5563] mb-1">
                Status
              </p>
              <p className="text-sm font-semibold text-[#111827]">
                Reserved — Pending Verification
              </p>
            </div>

            <p className="text-sm text-[#374151] leading-relaxed max-w-sm">
              You’re just a few minutes away from completing your booking.
              Fill in the remaining details to finalize everything.
            </p>

            <div className="bg-[#0f4c3a]/5 p-4 rounded-lg border border-[#0f4c3a]/5">
              <p className="text-sm text-[#1f2937] leading-relaxed">
                ⚠️ Please note: You have <strong>48 hours</strong> to complete your profile verification to confirm your reservation.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                // Save application to local storage for Profile page
                const pendingApps = JSON.parse(localStorage.getItem("my_applications") || "[]");
                const newApp = { ...bookingData, status: "In Progress", paymentStatus: "Paid", date: new Date().toISOString() };

                // Avoid duplicates
                if (!pendingApps.some(app => app.title === newApp.title)) {
                  pendingApps.push(newApp);
                  localStorage.setItem("my_applications", JSON.stringify(pendingApps));
                }

                // Also save as current for immediate access
                localStorage.setItem("current_application", JSON.stringify(bookingData));

                navigate("/application/details", { state: bookingData });
              }}
              className="group w-full py-4 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl text-sm font-medium tracking-wide flex items-center justify-center gap-3 hover:bg-[#0a3a2b] hover:scale-[1.01] transition-all duration-300 shadow-xl shadow-[#0f4c3a]/10"
            >
              Continue Application <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={downloadInvoice}
              className="w-full py-3 bg-transparent border border-[#0f4c3a]/20 text-[#111827] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/50 hover:border-[#0f4c3a]/40 transition-colors"
            >
              <Download size={14} />
              Download Receipt
            </button>

            <div className="pt-2 text-center">
              <p className="text-[10px] text-[#6b7280] mb-2">
                Need to finish later? You can return to this form at any time.
              </p>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 bg-transparent text-[#4b5563] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#0f4c3a]/5 transition-colors"
              >
                <LayoutDashboard size={14} />
                Return to Dashboard
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN - Booking Summary Card */}
      <div className="hidden md:flex w-1/2 lg:w-[55%] bg-[#212E24] relative items-center justify-center overflow-hidden">

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#2F5D50]/30 rounded-full blur-3xl"></div>

        <div className="relative w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6 opacity-80">
            <div className="h-[1px] w-8 bg-[#f2f2f2]"></div>
            <span className="text-xs font-serif italic text-[#f2f2f2]">Your upcoming stay</span>
          </div>

          <div className="bg-[#0f4c3a]/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            {/* Image Header */}
            <div className="relative h-48 w-full group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f4c3a] to-transparent z-10 opacity-60"></div>
              <img
                src={bookingData.image}
                alt={bookingData.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 z-20">
                <h4 className="font-serif text-xl text-[#f2f2f2] leading-tight shadow-sm">
                  {bookingData.title}
                </h4>
              </div>
            </div>

            {/* Price Content */}
            <div className="p-6 bg-[#212E24]">
              <DetailedPriceBreakdown state={bookingData} theme="dark" />
            </div>
          </div>

          {/* Badges */}
          <div className="mt-6 flex gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#f2f2f2] text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
              <ShieldCheck size={12} className="text-green-400" />
              Secure Booking
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#f2f2f2] text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
              <CheckCircle size={12} className="text-green-400" />
              Instant Confirmation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paid;


