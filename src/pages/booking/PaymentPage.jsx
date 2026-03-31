import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import OptimizedImage from '../../components/common/OptimizedImage';
import { SIDEBAR_SIZES } from '../../utils/imageUtils';
import {
  Lock,
  ArrowLeft,
  RefreshCcw,
  ShieldCheck,
  Info,
  Clock,
  Loader2
} from 'lucide-react';
import BookingStepper from '../../components/booking/BookingStepper';
import { calculateDuration } from '../../utils/dateUtils';
import { supabase } from '../../supabase/client';
import api from '../../api/client';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

/* =========================================================
   CHECKOUT FORM
========================================================= */
const CheckoutForm = ({ bookingData, holdingDeposit }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/paid`,
      },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
      return;
    }

    navigate('/paid', { state: bookingData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#0f4c3a]/5">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#0f4c3a]/5">
          <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">Holding deposit</span>
          <span className="text-xl font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{holdingDeposit.toLocaleString()}</span>
        </div>

        <PaymentElement options={{ layout: 'tabs' }} />

        {error && (
          <p className="text-xs text-[#EA4335] mt-3 font-medium">{error}</p>
        )}

        <div className="flex items-center gap-1 mt-3 text-[8px] font-bold text-[#9ca3af] uppercase">
          <Lock size={9} /> Secured by Stripe
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3.5 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0a3a2b] transition-colors disabled:opacity-50"
      >
        {processing ? (
          <><Loader2 size={14} className="animate-spin" /> Processing...</>
        ) : (
          <><Lock size={13} /> Pay €{holdingDeposit.toLocaleString()}</>
        )}
      </button>
    </form>
  );
};

/* =========================================================
   PAYMENT PAGE
========================================================= */
const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [initError, setInitError] = useState(null);
  const [demoProcessing, setDemoProcessing] = useState(false);

  const bookingData = state || {};
  const monthlyRent = Number(bookingData.monthlyTotal) || 0;
  const deposit = Number(bookingData.deposit) || 0;
  const holdingDeposit = Number(bookingData.holdingDeposit) || 150;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startDateObj = bookingData.checkIn ? new Date(bookingData.checkIn) : null;
  const endDateObj = bookingData.checkOut ? new Date(bookingData.checkOut) : null;
  const duration = calculateDuration(bookingData.checkIn, bookingData.checkOut);

  // Demo mode: show UI without Stripe when no applicationId
  const isDemoMode = !bookingData.applicationId || !stripePromise;

  useEffect(() => {
    if (isDemoMode) {
      setLoadingPayment(false);
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const { data } = await api.post('/payments/holding-deposit', {
          applicationId: bookingData.applicationId,
        });
        setClientSecret(data.data.clientSecret);
      } catch (err) {
        const message = err.response?.data?.error?.message || 'Failed to initialize payment. Please try again.';
        setInitError(message);
      } finally {
        setLoadingPayment(false);
      }
    };

    createPaymentIntent();
  }, [bookingData.applicationId]);

  const handleDemoPayment = async () => {
    setDemoProcessing(true);

    // Update application status in DB
    if (bookingData.applicationId) {
      try {
        await supabase
          .from('applications')
          .update({ status: 'pending_profile' })
          .eq('id', bookingData.applicationId);
      } catch (e) {
        console.error('Failed to update application status:', e);
      }
    }

    setTimeout(() => {
      navigate('/paid', { state: bookingData });
    }, 1500);
  };

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
            <BookingStepper currentStep={2} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ═══ LEFT — Payment form ═══ */}
          <div className="lg:col-span-7 space-y-6">

            <div>
              <h2 className="text-2xl font-serif text-[#111827] mb-1">Pay holding deposit</h2>
              <p className="text-[12px] text-[#6b7280]">Secure your unit with a €{holdingDeposit} holding deposit. Deducted from your first month's rent.</p>
            </div>

            {/* Loading */}
            {loadingPayment && (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-[#9ca3af]" />
              </div>
            )}

            {/* Error (only in live mode) */}
            {!isDemoMode && initError && (
              <div className="bg-white p-5 rounded-2xl border border-[#EA4335]/20">
                <p className="text-xs text-[#EA4335] font-medium mb-3">{initError}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="text-[10px] font-bold text-[#4b5563] uppercase tracking-widest hover:text-[#111827]"
                >
                  ← Go back
                </button>
              </div>
            )}

            {/* Demo mode — mock payment form */}
            {isDemoMode && !loadingPayment && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#0f4c3a]/5">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#0f4c3a]/5">
                    <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">Holding deposit</span>
                    <span className="text-xl font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{holdingDeposit.toLocaleString()}</span>
                  </div>

                  {/* Mock card input */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] block mb-1.5">Card number</label>
                      <div className="bg-[#f0f0f0] rounded-xl px-4 py-3 text-sm text-[#111827] border border-[#e5e7eb]">
                        4242 4242 4242 4242
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] block mb-1.5">Expiry</label>
                        <div className="bg-[#f0f0f0] rounded-xl px-4 py-3 text-sm text-[#111827] border border-[#e5e7eb]">
                          12/28
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] block mb-1.5">CVC</label>
                        <div className="bg-[#f0f0f0] rounded-xl px-4 py-3 text-sm text-[#111827] border border-[#e5e7eb]">
                          •••
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-3 text-[8px] font-bold text-[#9ca3af] uppercase">
                    <Lock size={9} /> Secured by Stripe
                  </div>
                </div>

                <button
                  onClick={handleDemoPayment}
                  disabled={demoProcessing}
                  className="w-full py-3.5 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0a3a2b] transition-colors disabled:opacity-50"
                >
                  {demoProcessing ? (
                    <><Loader2 size={14} className="animate-spin" /> Processing...</>
                  ) : (
                    <><Lock size={13} /> Pay €{holdingDeposit.toLocaleString()}</>
                  )}
                </button>
              </div>
            )}

            {/* Stripe form (live mode) */}
            {!isDemoMode && clientSecret && stripePromise && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'flat',
                    variables: {
                      colorPrimary: '#0f4c3a',
                      colorBackground: '#f0f0f0',
                      colorText: '#0f4c3a',
                      fontFamily: 'Inter, sans-serif',
                      borderRadius: '12px',
                      fontSizeBase: '13px',
                    },
                  },
                }}
              >
                <CheckoutForm bookingData={bookingData} holdingDeposit={holdingDeposit} />
              </Elements>
            )}

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-5">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#9ca3af]">
                <ShieldCheck size={12} className="text-[#22C55E]" /> Stripe encrypted
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#9ca3af]">
                <RefreshCcw size={12} className="text-[#22C55E]" /> Fully refundable
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#9ca3af]">
                <Clock size={12} className="text-[#D4A017]" /> 48h to complete
              </span>
            </div>

            <p className="text-[10px] text-[#9ca3af] leading-relaxed text-center">
              Your holding deposit of <span className="font-semibold text-[#4b5563]">€{holdingDeposit}</span> is <span className="font-semibold text-[#4b5563]">fully refundable</span> if your application is not approved, and is <span className="font-semibold text-[#4b5563]">deducted from your first month's rent</span> upon move-in.
            </p>
          </div>

          {/* ═══ RIGHT — Booking summary ═══ */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="sticky top-24 space-y-4">

              {/* Property card */}
              <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm overflow-hidden">
                <div className="relative h-36 overflow-hidden">
                  <OptimizedImage src={bookingData.image} alt={bookingData.title} width={400} sizes={SIDEBAR_SIZES} className="w-full h-full" imgClassName="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-base font-serif text-white leading-tight">{bookingData.title}</h3>
                    <p className="text-[10px] text-white/70 mt-0.5">
                      {bookingData.unitNumber ? `Unit ${bookingData.unitNumber}` : ''}{bookingData.city ? ` · ${bookingData.city}` : ''}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-[#9ca3af]">Move in</p>
                    <p className="text-xs font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>
                      {startDateObj ? `${startDateObj.getDate()} ${MONTHS[startDateObj.getMonth()]} ${startDateObj.getFullYear()}` : bookingData.checkIn}
                    </p>
                  </div>
                  <div className="flex-1 mx-3 border-t border-dashed border-[#0f4c3a]/15 relative">
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[8px] font-bold text-[#D4A017] uppercase tracking-wider whitespace-nowrap">
                      {duration}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-[#9ca3af]">Move out</p>
                    <p className="text-xs font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>
                      {endDateObj ? `${endDateObj.getDate()} ${MONTHS[endDateObj.getMonth()]} ${endDateObj.getFullYear()}` : bookingData.checkOut}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price summary */}
              <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3">Price summary</p>
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-[#4b5563]">Monthly rent</span>
                      <div className="relative group/pmrent">
                        <Info size={10} className="text-[#9ca3af]" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/pmrent:block z-50">
                          <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[200px]">
                            No surprise bills. Your monthly rent covers all utilities including WiFi, water, electricity, and heating. Nothing extra to pay.
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-[#4b5563]">Holding deposit</span>
                      <div className="relative group/phld">
                        <Info size={10} className="text-[#9ca3af]" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/phld:block z-50">
                          <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[200px]">
                            Reserves the unit for you. Deducted from your first month's rent upon move-in.
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{holdingDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-[#4b5563]">Security deposit</span>
                      <div className="relative group/psec">
                        <Info size={10} className="text-[#9ca3af]" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/psec:block z-50">
                          <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[210px]">
                            Your security deposit is returned within 14 days of move-out, after a final property inspection.
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{deposit.toLocaleString()}</span>
                      <span className="text-[8px] text-[#22C55E] font-bold bg-[#22C55E]/10 px-1.5 py-0.5 rounded-full">Refundable</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-[#9ca3af]">
                    {monthlyRent > 0 ? `${Math.round(deposit / monthlyRent)} month${Math.round(deposit / monthlyRent) !== 1 ? 's' : ''} rent` : ''} · returned at move-out
                  </p>

                  <div className="h-px bg-[#0f4c3a]/5" />

                  {/* Paying now — Design 1+3: Bold today + greyed later */}
                  <div className="bg-[#0f4c3a]/[0.10] rounded-lg px-3.5 py-3 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold text-[#111827]">Today</span>
                      <span className="text-2xl font-bold text-[#0f4c3a]" style={{ fontVariantNumeric: 'lining-nums' }}>€{holdingDeposit.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] text-[#6b7280]">Holding deposit · Deducted from first rent</p>
                  </div>
                  <div className="h-px bg-[#0f4c3a]/5 my-1" />
                  <div className="space-y-1 text-[#9ca3af]">
                    <div className="flex justify-between items-center text-[11px]">
                      <span>At move-in</span>
                      <span className="font-medium" style={{ fontVariantNumeric: 'lining-nums' }}>€{(monthlyRent - holdingDeposit + deposit).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span>Then monthly</span>
                      <span className="font-medium" style={{ fontVariantNumeric: 'lining-nums' }}>€{monthlyRent.toLocaleString()}/mo</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
