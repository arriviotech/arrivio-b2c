import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  Lock,
  ArrowLeft,
  RefreshCcw,
  ChevronDown,
  ShieldCheck,
  CheckCircle,
  Loader2
} from 'lucide-react';
import BookingStepper from '../../components/booking/BookingStepper';
import api from '../../api/client';

/* =========================================================
   STRIPE SETUP
========================================================= */
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

/* =========================================================
   SHARED PRICE BREAKDOWN (STYLE UNCHANGED)
========================================================= */
const DetailedPriceBreakdown = ({ state, theme = "dark" }) => {
  const textColor =
    theme === "dark" ? "text-[#f2f2f2]" : "text-[#111827]";
  const subtleColor =
    theme === "dark" ? "text-[#f2f2f2]/60" : "text-[#4b5563]";
  const borderColor =
    theme === "dark" ? "border-white/10" : "border-[#0f4c3a]/10";

  const monthlyTotal = Number(state?.monthlyTotal) || 0;
  const bookingFee = Number(state?.bookingFee) || Number(state?.booking_fee) || 0;
  const cleaningFee = Number(state?.cleaningFee) || Number(state?.cleaning_fee) || 0;

  const totalFees = bookingFee + cleaningFee;
  const payNow = monthlyTotal + totalFees;

  return (
    <div className="space-y-1.5 text-xs w-full text-left">

      <div className={`flex justify-between font-bold ${textColor}`}>
        <span>First Month Rent</span>
        <span>€{monthlyTotal.toLocaleString()}</span>
      </div>

      <div className={`border-t ${borderColor} my-2`}></div>

      <div className={`flex justify-between font-bold ${textColor}`}>
        <span>Booking Fee</span>
        <span>€{bookingFee.toLocaleString()}</span>
      </div>

      <div className={`flex justify-between font-bold ${textColor}`}>
        <span>Cleaning Fee</span>
        <span>€{cleaningFee.toLocaleString()}</span>
      </div>

      <div
        className={`flex justify-between items-center ${subtleColor} px-2 py-1 border border-dashed ${borderColor} rounded opacity-80`}
      >
        <span className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wide">
          <RefreshCcw size={10} /> Security Deposit
        </span>
        <span className="font-medium">Pay Later</span>
      </div>

      <div className="pt-2 flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-widest text-green-400">
          Due Today
        </span>
        <span className={`text-xl font-serif font-bold ${textColor}`}>
          €{payNow.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   CHECKOUT FORM (inside Stripe Elements)
========================================================= */
const CheckoutForm = ({ bookingData, payNow }) => {
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

    // Payment succeeded — navigate to success page
    navigate('/paid', { state: bookingData });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-[#0f4c3a]/5 flex-shrink-0 mb-6">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#0f4c3a]/5">
          <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">
            Due Today
          </span>
          <span className="text-xl font-serif font-bold text-[#111827]">
            €{payNow.toLocaleString()}
          </span>
        </div>

        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />

        {error && (
          <p className="text-xs text-[#EA4335] mt-3 font-medium">{error}</p>
        )}

        <div className="flex items-center justify-between mt-4 pt-1">
          <div className="flex items-center gap-1 text-[8px] font-bold text-[#111827]/30 uppercase">
            <Lock size={10} /> Powered by Stripe
          </div>
        </div>
      </div>

      <div className="mt-auto flex-shrink-0 w-full pt-4">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full py-4 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {processing ? (
            <><Loader2 size={14} className="animate-spin" /> Processing...</>
          ) : (
            <><Lock size={14} /> Secure Checkout. Pay €{payNow.toLocaleString()}</>
          )}
        </button>
      </div>
    </form>
  );
};

/* =========================================================
   PAYMENT PAGE
========================================================= */
const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [initError, setInitError] = useState(null);

  const bookingData = state || {};

  const bookingFee = Number(bookingData.bookingFee) || Number(bookingData.booking_fee) || 0;
  const cleaningFee = Number(bookingData.cleaningFee) || Number(bookingData.cleaning_fee) || 0;
  const payNow = (Number(bookingData.monthlyTotal) || 0) + bookingFee + cleaningFee;

  // Create payment intent on mount
  useEffect(() => {
    if (!bookingData.applicationId) {
      setInitError('No application found. Please start the booking process again.');
      setLoadingPayment(false);
      return;
    }

    if (!stripePromise) {
      setInitError('Payment system is not configured yet. Please try again later.');
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

  return (
    <div className="h-screen w-full bg-[#f2f2f2] flex flex-col md:flex-row overflow-hidden relative">

      {/* HIDE SCROLLBARS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            ::-webkit-scrollbar { display:none }
            * { scrollbar-width:none }
          `
        }}
      />

      {/* =====================================================
         MOBILE HEADER
      ===================================================== */}
      <div className="md:hidden flex-shrink-0 z-50 bg-white border-b border-[#0f4c3a]/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200">
            <img
              src={bookingData.image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm font-serif font-bold text-[#111827]">
            €{payNow.toLocaleString()}
          </p>
        </div>

        <button onClick={() => setShowMobileSummary(!showMobileSummary)}>
          <ChevronDown size={16} />
        </button>
      </div>

      {/* =====================================================
         LEFT COLUMN — PAYMENT FORM
      ===================================================== */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col h-full bg-[#f2f2f2]">

        <div className="px-4 pt-4 sm:px-6 sm:pt-6 md:px-12 md:pt-10 flex-shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]"
          >
            <ArrowLeft size={12} /> Back
          </button>
        </div>

        <div className="flex-grow px-4 sm:px-6 md:px-12 pt-4 overflow-y-auto w-full max-h-screen">
          <div className="max-w-sm mx-auto flex flex-col min-h-full pb-20">

            <div className="mb-8 flex-shrink-0">
              <BookingStepper currentStep={3} bgClass="bg-[#f2f2f2]" />
            </div>

            <div className="mb-4 flex-shrink-0">
              <h2 className="text-3xl font-serif text-[#111827] leading-none mb-1">
                Final Step
              </h2>
              <p className="text-[11px] text-[#4b5563]">
                Confirm your reservation with a secure payment.
              </p>
            </div>

            {/* Loading state */}
            {loadingPayment && (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-[#9ca3af]" />
              </div>
            )}

            {/* Error state */}
            {initError && (
              <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-[#EA4335]/20 mb-6">
                <p className="text-xs text-[#EA4335] font-medium">{initError}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="mt-3 text-[10px] font-bold text-[#4b5563] uppercase tracking-widest"
                >
                  Go Back
                </button>
              </div>
            )}

            {/* Stripe Payment Form */}
            {clientSecret && stripePromise && (
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
                <CheckoutForm bookingData={bookingData} payNow={payNow} />
              </Elements>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
         RIGHT COLUMN — BOOKING SUMMARY
      ===================================================== */}
      <div className="hidden md:flex w-1/2 lg:w-[55%] bg-[#0f4c3a] relative flex-col h-full items-center justify-center overflow-hidden">
        <div className="relative z-10 w-full max-w-[360px]">
          <h3 className="text-lg font-serif mb-4 text-[#f2f2f2] opacity-90">
            Booking Summary
          </h3>

          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#212E24] mb-5">
            <div className="h-28 w-full">
              <img
                src={bookingData.image}
                className="w-full h-full object-cover opacity-80"
              />
            </div>

            <div className="p-5">
              <DetailedPriceBreakdown state={bookingData} theme="dark" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-[#f2f2f2] flex items-center gap-2">
              <ShieldCheck size={14} />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Scam Protection
              </span>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-[#f2f2f2] flex items-center gap-2">
              <CheckCircle size={14} />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Legal Contract
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PaymentPage;
