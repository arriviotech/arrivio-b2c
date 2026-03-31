import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { pdf } from "@react-pdf/renderer";
import ContractPDF from "./ContractPDF";
import OptimizedImage from "../../components/common/OptimizedImage";
import { SIDEBAR_SIZES } from "../../utils/imageUtils";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  FileText,
  ChevronRight,
  CheckCircle,
  CreditCard,
  ClipboardList,
  PenTool,
  Home,
  Info,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import BookingStepper from "../../components/booking/BookingStepper";
import { useProperty } from "../../supabase/hooks/useProperty";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase/client";
import PageLoader from "../../components/common/PageLoader";
import { calculateDuration } from "../../utils/dateUtils";

const BookingReview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [applicationId, setApplicationId] = useState(state?.applicationId || null);
  const [creatingApp, setCreatingApp] = useState(false);

  useEffect(() => {
    if (!state?.propertyId && !state?.id) {
      navigate("/");
    }
  }, [state, navigate]);

  // Create application in DB on mount (or find existing one)
  const creatingRef = React.useRef(false);

  useEffect(() => {
    if (!user?.id || !state?.unitId || applicationId || creatingRef.current) return;
    creatingRef.current = true;

    const createOrFindApplication = async () => {
      setCreatingApp(true);
      try {
        // Check if user already has a pending application for this unit
        const { data: existing } = await supabase
          .from('applications')
          .select('id, status')
          .eq('profile_id', user.id)
          .eq('unit_id', state.unitId)
          .in('status', ['pending_payment', 'pending_profile', 'pending_signature', 'pending_approval', 'under_review'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing) {
          if (['under_review', 'pending_approval'].includes(existing.status)) {
            toast('You already have an application under review for this unit.', { icon: '📋' });
            navigate('/profile/applications', { replace: true });
            return;
          }
          setApplicationId(existing.id);
        } else {
          // Create new application
          const { data: newApp, error } = await supabase
            .from('applications')
            .insert({
              profile_id: user.id,
              unit_id: state.unitId,
              move_in_date: state.checkIn || null,
              move_out_date: state.checkOut || null,
              occupants: 1,
              source: 'b2c',
              status: 'pending_payment',
            })
            .select('id')
            .single();

          if (error) {
            console.error('Failed to create application:', error);
          } else {
            setApplicationId(newApp.id);
          }
        }
      } catch (e) {
        console.error('Application creation error:', e);
      } finally {
        setCreatingApp(false);
      }
    };

    createOrFindApplication();
  }, [user?.id, state?.unitId, applicationId]);

  const propertyId = state?.propertyId || state?.id;
  const { property: dbProperty, loading } = useProperty(propertyId);

  if (!state) return null;
  if (loading || creatingApp) return <PageLoader />;

  const propertyData = dbProperty ? { ...state, ...dbProperty } : state;
  const { title, checkIn, checkOut } = propertyData;
  const monthlyRent = propertyData.monthlyTotal || 0;
  const deposit = propertyData.deposit || 0;
  const holdingDeposit = propertyData.holdingDeposit || 150;
  const duration = calculateDuration(checkIn, checkOut) || "—";
  const dailyRate = Math.round(monthlyRent / 30);
  const firstMonthAfterHolding = monthlyRent - holdingDeposit;
  const dueAtMoveIn = firstMonthAfterHolding + deposit;

  // Timeline computation
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startDateObj = checkIn ? new Date(checkIn) : null;
  const endDateObj = checkOut ? new Date(checkOut) : null;
  const diffDays = startDateObj && endDateObj ? Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) : 0;
  const stayMonths = Math.max(1, Math.round(diffDays / 30));

  const timeline = [];
  if (startDateObj) {
    timeline.push({ label: 'Now', desc: 'Holding deposit', amount: holdingDeposit, type: 'now' });
    timeline.push({
      label: `${MONTHS[startDateObj.getMonth()]} ${startDateObj.getFullYear()}`,
      desc: `Rent (€${monthlyRent}) − Holding (€${holdingDeposit}) + Security (€${deposit})`,
      amount: dueAtMoveIn,
      type: 'movein',
    });
    for (let i = 1; i < Math.min(stayMonths, 5); i++) {
      const d = new Date(startDateObj);
      d.setMonth(d.getMonth() + i);
      timeline.push({
        label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        desc: 'Monthly rent',
        amount: monthlyRent,
        type: 'monthly',
      });
    }
  }
  const remainingMonths = stayMonths - 5;

  const staySteps = [
    { icon: CreditCard, title: "Pay holding deposit", desc: `€${holdingDeposit}, reserves the unit. Deducted from first month`, color: "text-[#D4A017]", bg: "bg-[#D4A017]/10", active: true },
    { icon: ClipboardList, title: "Complete application", desc: "Upload ID, proof of income & personal details", color: "text-[#0f4c3a]", bg: "bg-[#0f4c3a]/5", active: false },
    { icon: PenTool, title: "Sign the lease", desc: "Digital signature via DocuSign", color: "text-[#0f4c3a]", bg: "bg-[#0f4c3a]/5", active: false },
    { icon: Home, title: "Move in", desc: "Collect your keys and settle in!", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10", active: false },
  ];

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
            <BookingStepper currentStep={1} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ═══ LEFT COLUMN ═══ */}
          <div className="lg:col-span-7 space-y-6">

            {/* Property + Stay card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm overflow-hidden"
            >
              {/* Property image banner */}
              <div className="relative h-52 sm:h-56 overflow-hidden">
                <OptimizedImage src={propertyData.image} alt={title} width={640} sizes={SIDEBAR_SIZES} className="w-full h-full" imgClassName="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-5 sm:right-5">
                  <h2 className="text-base sm:text-xl font-serif text-white leading-tight">{title}</h2>
                  <p className="text-[10px] sm:text-[11px] text-white/70 mt-0.5">
                    {propertyData.unitNumber ? `Unit ${propertyData.unitNumber}` : ''}{propertyData.unitNumber && propertyData.city ? ' · ' : ''}{propertyData.city || ''}
                  </p>
                </div>
                {/* Price badge */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-md">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-base sm:text-lg font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{monthlyRent.toLocaleString()}</span>
                    <span className="text-[9px] sm:text-[10px] text-[#9ca3af]">/mo</span>
                  </div>
                  <p className="text-[8px] sm:text-[9px] text-[#6b7280]">€{dailyRate}/day · bills incl.</p>
                </div>
              </div>

              {/* Dates */}
              <div className="px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-[#9ca3af]">Move in</p>
                    <p className="text-sm sm:text-base font-bold text-[#111827] mt-0.5" style={{ fontVariantNumeric: 'lining-nums' }}>
                      {startDateObj ? `${startDateObj.getDate()} ${MONTHS[startDateObj.getMonth()]} ${startDateObj.getFullYear()}` : checkIn}
                    </p>
                  </div>
                  <div className="flex-1 mx-2 sm:mx-4 border-t border-dashed border-[#0f4c3a]/15 relative">
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2.5 sm:px-3 py-0.5 text-[10px] sm:text-[11px] font-bold text-[#D4A017] uppercase tracking-wider whitespace-nowrap">
                      {duration}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-[#9ca3af]">Move out</p>
                    <p className="text-sm sm:text-base font-bold text-[#111827] mt-0.5" style={{ fontVariantNumeric: 'lining-nums' }}>
                      {endDateObj ? `${endDateObj.getDate()} ${MONTHS[endDateObj.getMonth()]} ${endDateObj.getFullYear()}` : checkOut}
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>

            {/* Price summary */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-5"
            >
              <h3 className="text-lg font-serif text-[#111827] mb-4">Price summary</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[#4b5563]">Monthly rent</span>
                    <div className="relative group/mrent">
                      <Info size={11} className="text-[#9ca3af]" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/mrent:block z-50">
                        <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[220px]">
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
                    <div className="relative group/hinfo">
                      <Info size={11} className="text-[#9ca3af]" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/hinfo:block z-50">
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
                    <div className="relative group/sinfo">
                      <Info size={11} className="text-[#9ca3af]" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/sinfo:block z-50">
                        <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[200px]">
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

                <div className="h-px bg-[#0f4c3a]/5 my-1" />

                {/* Due now — Design 3+6: Gradient split */}
                <div className="grid grid-cols-2 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-br from-[#0f4c3a] to-[#0a3a2b] px-4 py-4 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.03] rounded-full -translate-y-6 translate-x-6" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 relative">Due now</p>
                    <p className="text-2xl font-bold text-white mt-1.5 relative" style={{ fontVariantNumeric: 'lining-nums' }}>€{holdingDeposit.toLocaleString()}</p>
                    <p className="text-[9px] text-[#D4A017] font-semibold mt-1 relative">Holding deposit</p>
                    <p className="text-[8px] text-white/35 mt-0.5 relative">Deducted from first rent</p>
                  </div>
                  <div className="bg-[#f9f9f7] border border-[#0f4c3a]/10 border-l-0 px-4 py-4 text-center relative overflow-hidden shadow-inner">
                    <div className="absolute bottom-0 left-0 w-14 h-14 bg-[#0f4c3a]/[0.03] rounded-full translate-y-5 -translate-x-5" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] relative">At move-in</p>
                    <p className="text-2xl font-bold text-[#111827] mt-1.5 relative" style={{ fontVariantNumeric: 'lining-nums' }}>€{dueAtMoveIn.toLocaleString()}</p>
                    <p className="text-[9px] text-[#0f4c3a] font-semibold mt-1 relative">Rent + security</p>
                    <p className="text-[8px] text-[#9ca3af] mt-0.5 relative">After holding deduction</p>
                  </div>
                </div>

                <div className="h-px bg-[#0f4c3a]/5 my-1" />

                {/* Payment timeline */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3">Payment timeline</p>
                  {timeline.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          item.type === 'now' ? 'bg-[#D4A017]' : item.type === 'movein' ? 'bg-[#0f4c3a]' : 'bg-[#d1d5db]'
                        }`} />
                        {(i < timeline.length - 1 || remainingMonths > 0) && <div className="w-px flex-1 bg-[#e5e7eb] min-h-[28px]" />}
                      </div>
                      <div className="flex-1 pb-3 -mt-0.5">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold ${item.type === 'now' ? 'text-[#D4A017]' : 'text-[#111827]'}`}>{item.label}</p>
                          <span className="text-sm font-bold text-[#111827] shrink-0" style={{ fontVariantNumeric: 'lining-nums' }}>€{item.amount.toLocaleString()}</span>
                        </div>
                        <p className="text-[10px] text-[#9ca3af]" style={{ fontVariantNumeric: 'lining-nums' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                  {remainingMonths > 0 && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#d1d5db]" />
                      </div>
                      <div className="flex-1 flex items-start justify-between -mt-0.5">
                        <div>
                          <p className="text-xs font-bold text-[#9ca3af]">+{remainingMonths} more month{remainingMonths !== 1 ? 's' : ''}</p>
                          <p className="text-[10px] text-[#9ca3af]">€{monthlyRent.toLocaleString()}/mo each</p>
                        </div>
                        <span className="text-sm font-bold text-[#9ca3af]" style={{ fontVariantNumeric: 'lining-nums' }}>€{(monthlyRent * remainingMonths).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  {/* Move-out refund */}
                  <div className="flex gap-3 mt-2 pt-2 border-t border-[#0f4c3a]/5">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                    </div>
                    <div className="flex-1 flex items-start justify-between -mt-0.5">
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-bold text-[#22C55E]">At move-out</p>
                          <div className="relative group/rmove">
                            <Info size={12} className="text-[#22C55E]" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/rmove:block z-50">
                              <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[210px]">
                                Your security deposit is returned within 14 days of move-out, after a final property inspection.
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-[#9ca3af]">Security deposit returned</p>
                      </div>
                      <span className="text-sm font-bold text-[#22C55E]" style={{ fontVariantNumeric: 'lining-nums' }}>+€{deposit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Bills included */}
                <div className="bg-[#f9f9f7] rounded-xl px-3 py-3">
                  <div className="flex items-center gap-1 mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">All bills included</p>
                    <div className="relative group/rbills">
                      <Info size={10} className="text-[#9ca3af]" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/rbills:block z-50">
                        <div className="bg-[#111827] text-white text-[10px] leading-relaxed rounded-lg px-3 py-2 shadow-lg w-[220px]">
                          No surprise bills. Your monthly rent covers all utilities including WiFi, water, electricity, and heating. Nothing extra to pay.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['WiFi', 'Water', 'Electricity', 'Heating'].map((bill) => (
                      <span key={bill} className="px-2.5 py-1 bg-white border border-[#e5e7eb] text-[#4b5563] rounded-full text-[10px] font-medium">{bill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 48h notice */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#D4A017]/5 border border-[#D4A017]/15 rounded-2xl px-5 py-4 flex gap-3 items-start"
            >
              <Clock size={18} className="text-[#D4A017] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#111827]">48 hours to complete</p>
                <p className="text-[11px] text-[#6b7280] leading-relaxed mt-0.5">
                  Complete your application and sign the lease within 48 hours after payment. Otherwise your reservation is cancelled and deposit refunded.
                </p>
              </div>
            </motion.div>

            {/* Contract preview — mobile only */}
            <div className="lg:hidden bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-serif text-[#111827]">Lease contract</h3>
                  <p className="text-[10px] text-[#6b7280] mt-0.5">Preview the template before proceeding</p>
                </div>
                <button
                  onClick={async () => {
                    const pdfProperty = {
                      title: title || "Property",
                      address: propertyData.address || title || "",
                      apartmentNo: propertyData.apartmentNo || propertyData.unitNumber || "—",
                      floor: propertyData.floor || "Not specified",
                      size: propertyData.size || "Not specified",
                    };
                    const bookingData = {
                      checkIn: checkIn || "",
                      checkOut: checkOut || "",
                      monthlyRent: monthlyRent - (propertyData.utilities || 0),
                      utilities: propertyData.utilities || 0,
                      totalMonthly: monthlyRent,
                      bookingFee: propertyData.bookingFee || 0,
                      cleaningFee: propertyData.cleaningFee || 0,
                      deposit: deposit,
                    };
                    const docId = `ARR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                    const blob = await pdf(<ContractPDF property={pdfProperty} booking={bookingData} docId={docId} />).toBlob();
                    window.open(URL.createObjectURL(blob), "_blank");
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#f9f9f7] hover:bg-[#f2f2f2] border border-[#0f4c3a]/10 rounded-lg transition-colors shrink-0"
                >
                  <FileText size={14} className="text-[#0f4c3a]" />
                  <span className="text-[11px] font-semibold text-[#111827]">Preview</span>
                </button>
              </div>
            </div>

            {/* Agreement + CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
                  I agree to the <span className="text-[#0f4c3a] font-semibold">Terms & Conditions</span>, the payment plan, and the <span className="text-[#0f4c3a] font-semibold">building rules</span>.
                </p>
              </div>

              <button
                onClick={() => navigate("/payment", { state: { ...propertyData, applicationId } })}
                disabled={!agreed}
                className={`w-full py-3.5 rounded-xl font-bold uppercase text-sm tracking-widest transition-colors ${
                  agreed
                    ? "bg-[#0f4c3a] text-[#f2f2f2] hover:bg-[#0a3a2b]"
                    : "bg-[#e5e5e5] text-[#9ca3af] cursor-not-allowed"
                }`}
              >
                Reserve for €{holdingDeposit}
              </button>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-[9px] text-[#9ca3af]">Holding deposit</span>
                <span className="w-0.5 h-0.5 rounded-full bg-[#d1d5db]" />
                <span className="text-[9px] text-[#9ca3af]">Deducted from first rent</span>
                <span className="w-0.5 h-0.5 rounded-full bg-[#d1d5db]" />
                <span className="text-[9px] text-[#9ca3af]">Stripe secured</span>
              </div>

              <p className="text-[10px] text-[#9ca3af] leading-relaxed text-center">
                Your holding deposit of <span className="font-semibold text-[#4b5563]">€{holdingDeposit}</span> is processed securely via Stripe. This amount is <span className="font-semibold text-[#4b5563]">fully refundable</span> if your application is not approved, and is <span className="font-semibold text-[#4b5563]">deducted from your first month's rent</span> upon move-in. You may also request a refund within 8 weeks through your bank.
              </p>
            </motion.div>
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="sticky top-24">
              {/* What happens next */}
              <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-5">
                <h3 className="text-lg font-serif text-[#111827] mb-5">What happens next</h3>
                <div className="space-y-0">
                  {staySteps.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-full ${item.bg} flex items-center justify-center shrink-0 ${item.active ? 'ring-2 ring-[#0f4c3a]/20' : ''}`}>
                            <Icon size={16} className={item.color} />
                          </div>
                          {i < staySteps.length - 1 && <div className="w-px flex-1 bg-[#e5e7eb] min-h-[20px]" />}
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

              {/* Lease contract */}
              <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-5 mt-4">
                <h3 className="text-lg font-serif text-[#111827] mb-1">Lease contract</h3>
                <p className="text-[11px] text-[#6b7280] mb-4">Preview the template. You'll sign the final version in step 4.</p>
                <button
                  onClick={async () => {
                    const pdfProperty = {
                      title: title || "Property",
                      address: propertyData.address || title || "",
                      apartmentNo: propertyData.apartmentNo || propertyData.unitNumber || "—",
                      floor: propertyData.floor || "Not specified",
                      size: propertyData.size || "Not specified",
                    };
                    const bookingData = {
                      checkIn: checkIn || "",
                      checkOut: checkOut || "",
                      monthlyRent: monthlyRent - (propertyData.utilities || 0),
                      utilities: propertyData.utilities || 0,
                      totalMonthly: monthlyRent,
                      bookingFee: propertyData.bookingFee || 0,
                      cleaningFee: propertyData.cleaningFee || 0,
                      deposit: deposit,
                    };
                    const docId = `ARR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                    const blob = await pdf(<ContractPDF property={pdfProperty} booking={bookingData} docId={docId} />).toBlob();
                    window.open(URL.createObjectURL(blob), "_blank");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#f9f9f7] hover:bg-[#f2f2f2] border border-[#0f4c3a]/10 rounded-xl transition-colors"
                >
                  <FileText size={16} className="text-[#0f4c3a]" />
                  <span className="text-xs font-semibold text-[#111827]">Preview contract template</span>
                  <ChevronRight size={14} className="text-[#9ca3af]" />
                </button>
              </div>

              {/* Trust */}
              <div className="flex items-center justify-center gap-5 mt-4 px-4">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#9ca3af]">
                  <RefreshCcw size={12} className="text-[#22C55E]" /> Security deposit refundable
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#9ca3af]">
                  <Clock size={12} className="text-[#D4A017]" /> 48h to complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReview;
