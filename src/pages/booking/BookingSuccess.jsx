import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Check,
  Calendar,
  Home,
  Download,
  MapPin,
  MessageCircle,
  Instagram,
  Loader2,
  Clock,
  FileText,
  CreditCard,
  PenTool,
  ShieldCheck,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/client';

/* =========================================================
   BOOKING STATUS STEPS
========================================================= */
const STEPS = [
  { key: 'pending_payment', label: 'Holding Deposit', icon: CreditCard, description: 'Pay holding deposit to secure your unit' },
  { key: 'pending_profile', label: 'Profile & Documents', icon: FileText, description: 'Upload required documents' },
  { key: 'pending_signature', label: 'Sign Agreement', icon: PenTool, description: 'Sign the rental agreement via DocuSign' },
  { key: 'pending_approval', label: 'Under Review', icon: Clock, description: 'Our team is reviewing your application' },
  { key: 'approved', label: 'Approved', icon: ShieldCheck, description: 'Application approved, booking confirmed' },
  { key: 'active', label: 'Move-in Ready', icon: Home, description: 'Welcome to your new home!' },
];

function getStepIndex(status) {
  // Map both application and booking statuses
  const statusMap = {
    pending_payment: 0,
    pending_profile: 1,
    pending_signature: 2,
    pending_approval: 3,
    under_review: 3,
    approved: 4,
    confirmed: 4,
    active: 5,
    completed: 5,
  };
  return statusMap[status] ?? 0;
}

const StepTracker = ({ currentStatus }) => {
  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex gap-4">
            {/* Vertical line + circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isComplete
                    ? 'bg-[#22C55E] text-white'
                    : isCurrent
                      ? 'bg-[#0f4c3a] text-[#f2f2f2] ring-4 ring-[#0f4c3a]/10'
                      : 'bg-[#0f4c3a]/10 text-[#9ca3af]'
                }`}
              >
                {isComplete ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-0.5 h-10 ${isComplete ? 'bg-[#22C55E]' : 'bg-[#0f4c3a]/10'}`} />
              )}
            </div>

            {/* Label */}
            <div className="pt-1 pb-6">
              <p className={`text-sm font-bold ${isCurrent ? 'text-[#111827]' : isComplete ? 'text-[#374151]' : 'text-[#9ca3af]'}`}>
                {step.label}
              </p>
              <p className={`text-[11px] ${isCurrent ? 'text-[#4b5563]' : 'text-[#111827]/30'}`}>
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* =========================================================
   BOOKING SUCCESS PAGE
========================================================= */
const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // bookingId from navigation state or URL search params
  const bookingId = state?.bookingId || new URLSearchParams(window.location.search).get('id');

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const { data } = await api.get(`/bookings/${bookingId}/status`);
        setBooking(data.data);
      } catch (err) {
        console.warn('Could not fetch booking status:', err.response?.data?.error?.message || err.message);
        // Fall back to state data if API unavailable
        if (state) {
          setBooking(state);
        } else {
          setError('Could not load booking details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [bookingId, state]);

  // Fallback to passed state if no bookingId
  useEffect(() => {
    if (!bookingId && state) {
      setBooking(state);
      setLoading(false);
    } else if (!bookingId && !state) {
      navigate('/', { replace: true });
    }
  }, [bookingId, state, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#9ca3af]" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#4b5563] mb-4">{error || 'Booking not found.'}</p>
          <button onClick={() => navigate('/')} className="text-xs font-bold text-[#111827] underline">Go Home</button>
        </div>
      </div>
    );
  }

  const currentStatus = booking.status || 'pending_payment';

  return (
    <div className="min-h-screen bg-[#f2f2f2] flex justify-center pt-24 p-6 relative overflow-hidden">

      {/* BACKGROUND ORBS */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#D4A017]/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#0f4c3a]/10 rounded-full blur-[100px]" />

      <div className="flex flex-col lg:flex-row gap-12 items-start max-w-4xl w-full">

        {/* ================= LEFT — STATUS CARD ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white"
        >
          {/* HEADER */}
          <div className="h-48 w-full relative">
            <img
              src={booking.image || booking.cover_image}
              alt={booking.title || booking.property_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />

            <div className="absolute top-6 right-6 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl border-2 border-white">
              <Check size={24} className="text-white stroke-[4]" />
            </div>

            <div className="absolute bottom-6 left-8">
              <h1 className="text-2xl font-serif text-white mb-1">
                Booking Status
              </h1>
              <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-bold uppercase tracking-widest">
                <MapPin size={12} /> {booking.title || booking.property_name}
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="p-8 space-y-6">

            {/* DATES */}
            <div className="bg-[#f0f0f0] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#9ca3af]">Move-in</span>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Calendar size={14} className="opacity-40" />
                    {booking.checkIn || booking.move_in_date}
                  </div>
                </div>

                <div className="w-px h-8 bg-[#0f4c3a]/10" />

                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-widest text-[#9ca3af]">Move-out</span>
                  <div className="flex items-center gap-2 font-bold text-sm justify-end">
                    {booking.checkOut || booking.move_out_date}
                    <Calendar size={14} className="opacity-40" />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP TRACKER */}
            <StepTracker currentStatus={currentStatus} />

            {/* ACTIONS */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate('/')}
                className="w-full py-4 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Home size={14} /> Back to Home
              </button>

              <button className="w-full py-3 text-[#9ca3af] text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <Download size={14} /> Download Receipt
              </button>
            </div>
          </div>
        </motion.div>

        {/* ================= RIGHT SIDE PANEL ================= */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-72 space-y-6 hidden lg:block"
        >
          {/* Booking ID */}
          {(booking.id || bookingId) && (
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <p className="text-[10px] uppercase tracking-widest text-[#9ca3af] font-bold mb-2">
                Booking Reference
              </p>
              <p className="font-bold text-[#111827] text-xs font-mono">
                {(booking.id || bookingId).slice(0, 8).toUpperCase()}
              </p>
            </div>
          )}

          {/* Community */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#9ca3af] font-bold">
              <Users size={14} /> Community
            </div>

            <a href="https://wa.me/" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-[#111827] hover:opacity-70">
              <MessageCircle size={16} /> WhatsApp
            </a>

            <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-[#111827] hover:opacity-70">
              <Instagram size={16} /> Instagram
            </a>
          </div>

          {/* Help */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <p className="text-xs text-[#4b5563] leading-relaxed">
              Questions about your booking? Our team is here to help.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="mt-3 w-full py-2 border border-[#0f4c3a]/10 rounded-lg text-xs font-bold uppercase tracking-widest text-[#4b5563] hover:bg-[#f0f0f0] transition-colors"
            >
              Contact Support
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default BookingSuccess;
