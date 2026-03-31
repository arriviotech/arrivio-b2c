import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar, MapPin, CreditCard, FileText, Home, Clock,
  CheckCircle, AlertCircle, XCircle, ArrowRight,
  DoorOpen, Ruler, Layers, Users, Sofa, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../supabase/client";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import BookingDetailSkeleton from "../../components/skeletons/BookingDetailSkeleton";

const BOOKING_STATUS = {
  active: { label: "Active", color: "text-[#16a34a]", bg: "bg-[#22C55E]/10", icon: CheckCircle },
  confirmed: { label: "Confirmed", color: "text-[#16a34a]", bg: "bg-[#22C55E]/10", icon: CheckCircle },
  pending_signature: { label: "Pending Signature", color: "text-amber-500", bg: "bg-amber-50", icon: Clock },
  pending_payment: { label: "Pending Payment", color: "text-amber-500", bg: "bg-amber-50", icon: CreditCard },
  completed: { label: "Completed", color: "text-[#6b7280]", bg: "bg-[#f2f2f2]", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-[#EA4335]", bg: "bg-red-50", icon: XCircle },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BookingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showAllMonths, setShowAllMonths] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`*,
          units!unit_id (
            unit_number, unit_type, tier, floor, size_sqm, max_occupants, is_furnished, slug, property_id,
            properties ( name, slug, city, district, address_line1, manager_name, manager_email, manager_phone,
              property_photos ( storage_path, is_primary, display_order )
            )
          ),
          rental_agreements ( status, tenant_signed_at, arrivio_signed_at )
        `)
        .eq("id", id)
        .eq("profile_id", user.id)
        .single();

      if (!error && data) {
        setBooking(data);
        // Fetch payments for this booking
        const { data: paymentData } = await supabase
          .from('payments')
          .select('id, payment_type, amount_cents, status, currency, description, paid_at, created_at')
          .eq('reference_type', 'booking')
          .eq('reference_id', id)
          .order('created_at', { ascending: false });
        if (paymentData) setPayments(paymentData);
      }
      setLoading(false);
    };
    fetchBooking();
  }, [id, user]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancellation_reason: "Cancelled by tenant" })
        .eq("id", id).eq("profile_id", user.id);
      if (error) throw error;
      setBooking(prev => ({ ...prev, status: "cancelled" }));
      toast.success("Booking cancelled. Your deposit refund will be processed.");
      setShowCancel(false);
    } catch { toast.error("Failed to cancel. Please contact support."); }
    finally { setCancelling(false); }
  };

  if (loading) return <BookingDetailSkeleton />;
  if (!booking) return <div className="text-center py-20"><p className="text-sm text-[#6b7280] mb-4">Booking not found</p><Link to="/profile/bookings" className="text-xs font-bold text-[#0f4c3a] underline">Back to My Bookings</Link></div>;

  const unit = booking.units || {};
  const property = unit.properties || {};
  const propertyId = unit.property_id;
  const photos = property.property_photos || [];
  const coverImage = [...photos].sort((a, b) => a.display_order - b.display_order).find(p => p.is_primary)?.storage_path || photos[0]?.storage_path;
  const agreement = booking.rental_agreements?.[0] || null;
  const status = BOOKING_STATUS[booking.status] || BOOKING_STATUS.active;
  const StatusIcon = status.icon;
  const rent = Math.round((booking.monthly_rent_cents || 0) / 100);
  const deposit = Math.round((booking.security_deposit_cents || 0) / 100);
  const holdingDeposit = Math.round((booking.holding_deposit_cents || 0) / 100);
  const isActive = ["active", "confirmed", "pending_signature", "pending_payment"].includes(booking.status);
  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled";

  const moveIn = new Date(booking.move_in_date);
  const moveOut = new Date(booking.move_out_date);
  const daysUntilMoveIn = Math.ceil((moveIn - new Date()) / (1000 * 60 * 60 * 24));

  // Build monthly breakdown
  const monthlyBreakdown = [];
  const cursor = new Date(moveIn);
  while (cursor < moveOut) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const effectiveStart = cursor > monthStart ? cursor : monthStart;
    const effectiveEnd = moveOut < monthEnd ? moveOut : monthEnd;
    const daysInMonth = monthEnd.getDate();
    const activeDays = Math.ceil((effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24));
    const isPartial = activeDays < daysInMonth;
    const amount = isPartial ? Math.round((rent / daysInMonth) * activeDays) : rent;
    const isPast = new Date(year, month + 1, 0) < new Date();

    monthlyBreakdown.push({
      label: `${MONTHS[month]} ${year}`,
      amount,
      isPartial,
      activeDays,
      totalDays: daysInMonth,
      isPast,
      isCurrent: new Date().getMonth() === month && new Date().getFullYear() === year,
    });

    cursor.setMonth(cursor.getMonth() + 1);
    cursor.setDate(1);
  }

  const visibleMonths = showAllMonths ? monthlyBreakdown : monthlyBreakdown.slice(0, 4);
  const totalRent = monthlyBreakdown.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif text-[#111827]">Booking Details</h2>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.color}`}>
          <StatusIcon size={12} /> {status.label}
        </span>
      </div>

      {/* Property Card — Redesigned with image */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
        {/* Image header */}
        {coverImage && (
          <div className="relative h-44 overflow-hidden">
            <img src={coverImage} alt={property.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <h3 className="font-serif text-xl text-white mb-0.5">{property.name}</h3>
              <p className="text-xs text-white/70 flex items-center gap-1">
                <MapPin size={11} /> {property.address_line1}, {property.district}, {property.city}
              </p>
            </div>
          </div>
        )}

        {/* Unit details */}
        <div className="p-5">
          {!coverImage && (
            <div className="mb-4">
              <h3 className="font-serif text-xl text-[#111827] mb-0.5">{property.name}</h3>
              <p className="text-xs text-[#6b7280] flex items-center gap-1"><MapPin size={11} /> {property.city}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-4">
            <StatPill icon={DoorOpen} label={unit.unit_type?.replace(/_/g, ' ')} />
            <StatPill icon={Ruler} label={`${unit.size_sqm} m²`} />
            <StatPill icon={Layers} label={unit.floor === 0 ? 'Ground' : `Floor ${unit.floor}`} />
            <StatPill icon={Users} label={`Max ${unit.max_occupants}`} />
            <StatPill icon={Sofa} label={unit.is_furnished ? 'Furnished' : 'Unfurnished'} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#111827]">Unit {unit.unit_number} <span className="text-xs font-medium text-[#6b7280]">· {unit.tier}</span></span>
            <Link to={unit.slug ? `/unit/${unit.slug}` : `/property/${property.slug}`} className="text-[10px] font-bold uppercase tracking-widest text-[#0f4c3a] hover:underline">
              View Unit →
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Lease Period */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#374151] mb-4">Lease Period</p>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-[#9ca3af] uppercase tracking-widest mb-1">Move-in</p>
            <p className="text-sm font-bold text-[#111827]">{moveIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-px bg-[#e5e7eb]" />
            <span className="text-[10px] font-bold text-[#9ca3af]">{monthlyBreakdown.length} mo</span>
            <div className="w-6 h-px bg-[#e5e7eb]" />
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#9ca3af] uppercase tracking-widest mb-1">Move-out</p>
            <p className="text-sm font-bold text-[#111827]">{moveOut.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        {isActive && daysUntilMoveIn > 0 && (
          <div className="p-3 bg-[#0f4c3a]/5 rounded-xl text-center">
            <p className="text-xs text-[#0f4c3a] font-medium"><span className="font-bold">{daysUntilMoveIn} days</span> until your move-in date</p>
          </div>
        )}
        {isCompleted && (
          <div className="p-3 bg-[#22C55E]/10 rounded-xl text-center">
            <p className="text-xs text-[#16a34a] font-medium">Stay completed · {monthlyBreakdown.length} months</p>
          </div>
        )}
      </motion.div>

      {/* Monthly Rent Breakdown */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#374151]">Monthly Rent Schedule</p>
          <p className="text-xs font-bold text-[#111827]">Total: €{totalRent.toLocaleString()}</p>
        </div>

        {/* Vertical Timeline Tracker */}
        <div className="relative ml-1">
          {visibleMonths.map((m, i) => {
            const isLast = i === visibleMonths.length - 1;
            const nextMonth = visibleMonths[i + 1];
            return (
              <div key={i} className="flex gap-4">
                {/* Timeline column */}
                <div className="flex flex-col items-center shrink-0 w-5">
                  {/* Icon */}
                  {m.isPast ? (
                    <CheckCircle size={18} className="text-[#22C55E] shrink-0" />
                  ) : m.isCurrent ? (
                    <div className="relative flex shrink-0 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-[#0f4c3a] opacity-25"></span>
                      <Clock size={18} className="relative text-[#0f4c3a]" />
                    </div>
                  ) : (
                    <Clock size={18} className="text-[#d1d5db] shrink-0" />
                  )}
                  {/* Connecting line */}
                  {!isLast && (
                    <div className="relative w-0.5 flex-1 min-h-[36px] bg-[#e5e7eb] overflow-hidden">
                      {/* Filled progress overlay */}
                      {m.isPast && nextMonth?.isPast && (
                        <div className="absolute inset-0 bg-[#22C55E]" />
                      )}
                      {m.isPast && nextMonth?.isCurrent && (
                        <div className="absolute inset-0 bg-gradient-to-b from-[#22C55E] to-[#0f4c3a]" />
                      )}
                      {m.isCurrent && (
                        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[#0f4c3a] to-transparent" />
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 flex items-center justify-between pb-5 ${isLast ? 'pb-0' : ''}`}>
                  <div>
                    <p className={`text-sm font-medium ${
                      m.isCurrent ? 'text-[#0f4c3a] font-bold' : m.isPast ? 'text-[#6b7280]' : 'text-[#111827]'
                    }`}>
                      {m.label}
                    </p>
                    {m.isPartial && (
                      <p className="text-[10px] text-[#9ca3af]">{m.activeDays} of {m.totalDays} days (prorated)</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${m.isPast ? 'text-[#6b7280]' : 'text-[#111827]'}`} style={{ fontVariantNumeric: 'lining-nums' }}>
                      €{m.amount.toLocaleString()}
                    </p>
                    {m.isPast && <p className="text-[9px] text-[#22C55E] font-bold uppercase">Paid</p>}
                    {m.isCurrent && <p className="text-[9px] text-[#0f4c3a] font-bold uppercase">Due Now</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {monthlyBreakdown.length > 4 && (
          <button
            onClick={() => setShowAllMonths(!showAllMonths)}
            className="w-full mt-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] hover:text-[#111827] transition-colors flex items-center justify-center gap-1"
          >
            {showAllMonths ? 'Show less' : `Show all ${monthlyBreakdown.length} months`}
            <ChevronDown size={12} className={`transition-transform ${showAllMonths ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Cost Summary */}
        <div className="mt-4 pt-4 border-t border-[#e5e7eb] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#374151]">Total Rent ({monthlyBreakdown.length} months)</span>
            <span className="text-sm font-bold text-[#111827]">€{totalRent.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#374151] flex items-center gap-1.5">
              Security Deposit
              <span className="relative group cursor-help">
                <AlertCircle size={13} className="text-[#9ca3af] group-hover:text-[#0f4c3a] transition-colors" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#111827] text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
                  Fully refundable at move-out after unit inspection
                </span>
              </span>
            </span>
            <span className="text-sm font-bold text-[#111827]">€{deposit.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#374151] flex items-center gap-1.5">
              Holding Deposit
              <span className="relative group cursor-help">
                <AlertCircle size={13} className="text-[#9ca3af] group-hover:text-[#0f4c3a] transition-colors" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#111827] text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
                  Applied to your first month's rent
                </span>
              </span>
            </span>
            <span className="text-sm font-bold text-[#111827]">€{holdingDeposit.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t border-[#e5e7eb]">
            <span className="text-sm font-bold text-[#111827]">Total Cost</span>
            <span className="text-lg font-bold text-[#0f4c3a]" style={{ fontVariantNumeric: 'lining-nums' }}>
              €{(totalRent + deposit + holdingDeposit).toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>


      {/* Payment History */}
      {payments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#374151]">Payment History</p>
            <span className="text-[10px] font-bold text-[#9ca3af]">{payments.length} transactions</span>
          </div>

          <div className="space-y-2">
            {payments.slice(0, 5).map(p => {
              const amount = Math.round((p.amount_cents || 0) / 100);
              const isSuccess = p.status === 'succeeded';
              const isPending = ['pending', 'processing'].includes(p.status);
              const isRefund = p.payment_type?.includes('refund');
              const typeLabels = {
                holding_deposit: 'Holding Deposit',
                security_deposit: 'Security Deposit',
                monthly_rent: 'Monthly Rent',
                deposit_refund: 'Deposit Refund',
                holding_deposit_refund: 'Deposit Refund',
              };
              return (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#f7f7f7]">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-8 rounded-full ${
                      isSuccess ? 'bg-[#22C55E]' : isPending ? 'bg-amber-400' : isRefund ? 'bg-purple-400' : 'bg-[#EA4335]'
                    }`} />
                    <div>
                      <p className="text-xs font-bold text-[#111827]">{typeLabels[p.payment_type] || p.payment_type}</p>
                      <p className="text-[10px] text-[#9ca3af]">
                        {new Date(p.paid_at || p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}
                        <span className={isSuccess ? 'text-[#16a34a]' : isPending ? 'text-amber-500' : isRefund ? 'text-purple-500' : 'text-[#EA4335]'}>
                          {isSuccess ? 'Paid' : isPending ? 'Pending' : isRefund ? 'Refunded' : p.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold tabular-nums lining-nums ${isRefund ? 'text-purple-500' : 'text-[#111827]'}`}>
                    {isRefund ? '+' : ''}€{amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          {propertyId && (
            <Link
              to={`/profile/payments?property=${propertyId}`}
              className="mt-4 w-full py-2.5 bg-[#f2f2f2] hover:bg-[#0f4c3a] hover:text-white text-[#111827] rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              View all payments <ArrowRight size={12} />
            </Link>
          )}
        </motion.div>
      )}

      {/* Agreement */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#374151] mb-4">Rental Agreement</p>
        {agreement ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#374151]">Status</span>
              <span className={`text-xs font-bold uppercase ${agreement.status === 'completed' ? 'text-[#16a34a]' : 'text-amber-500'}`}>
                {agreement.status?.replace(/_/g, ' ')}
              </span>
            </div>
            {agreement.tenant_signed_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#374151]">You signed</span>
                <span className="text-xs text-[#6b7280]">{new Date(agreement.tenant_signed_at).toLocaleDateString('en-GB')}</span>
              </div>
            )}
            {agreement.arrivio_signed_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#374151]">Countersigned</span>
                <span className="text-xs text-[#6b7280]">{new Date(agreement.arrivio_signed_at).toLocaleDateString('en-GB')}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#9ca3af]">No rental agreement on file yet.</p>
        )}
      </motion.div>

      {/* Property Manager */}
      {property.manager_name && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#374151] mb-3">Property Manager</p>
          <p className="text-sm font-bold text-[#111827]">{property.manager_name}</p>
          {property.manager_email && <p className="text-xs text-[#6b7280] mt-1">{property.manager_email}</p>}
          {property.manager_phone && <p className="text-xs text-[#6b7280] mt-0.5">{property.manager_phone}</p>}
        </motion.div>
      )}

      {/* Actions */}
      {isActive && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          <Link to={propertyId ? `/profile/payments?property=${propertyId}` : '/profile/payments'} className="w-full py-3 bg-[#0f4c3a] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0a3a2b] transition-colors">
            <CreditCard size={14} /> Pay Rent
          </Link>

          {!showCancel ? (
            <button onClick={() => setShowCancel(true)} className="w-full py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] hover:text-[#EA4335] transition-colors text-center">
              Cancel Booking
            </button>
          ) : (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs text-[#EA4335] font-medium mb-1">Are you sure you want to cancel?</p>
              <p className="text-[11px] text-[#EA4335]/70 mb-4">Your security deposit will be reviewed. Remaining balance refunded within 5-7 business days.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowCancel(false)} className="flex-1 py-2.5 bg-white border border-[#e5e7eb] rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#374151]">Keep Booking</button>
                <button onClick={handleCancel} disabled={cancelling} className="flex-1 py-2.5 bg-[#EA4335] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#d33426] disabled:opacity-50 flex items-center justify-center gap-1">
                  {cancelling ? 'Cancelling...' : <><XCircle size={12} /> Confirm</>}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Completed Stay Summary */}
      {isCompleted && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          <div className="p-5 bg-white rounded-2xl border border-[#e5e7eb]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                <CheckCircle size={20} className="text-[#16a34a]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111827]">Stay Completed</p>
                <p className="text-[10px] text-[#6b7280]">
                  {moveIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} – {moveOut.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-[#f7f7f7] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-[#111827] tabular-nums lining-nums">{monthlyBreakdown.length}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af]">Months</p>
              </div>
              <div className="bg-[#f7f7f7] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-[#111827] tabular-nums lining-nums">€{totalRent.toLocaleString()}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af]">Total Rent</p>
              </div>
              <div className="bg-[#f7f7f7] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-purple-500 tabular-nums lining-nums">€{deposit.toLocaleString()}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af]">Refunded</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to={propertyId ? `/profile/payments?property=${propertyId}` : '/profile/payments'} className="flex-1 py-3 bg-[#f2f2f2] hover:bg-[#e5e5e5] rounded-xl text-xs font-bold uppercase tracking-widest text-center text-[#374151] transition-colors flex items-center justify-center gap-2">
              <CreditCard size={14} /> View Payments
            </Link>
            <Link to="/search" className="flex-1 py-3 bg-[#0f4c3a] hover:bg-[#0a3a2b] text-white rounded-xl text-xs font-bold uppercase tracking-widest text-center transition-colors flex items-center justify-center gap-2">
              <Home size={14} /> Book Again
            </Link>
          </div>
        </motion.div>
      )}

      {isCancelled && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
          <XCircle size={18} className="text-[#EA4335] shrink-0" />
          <div>
            <p className="text-sm font-bold text-[#EA4335]">Booking Cancelled</p>
            <p className="text-xs text-[#EA4335]/70">
              {booking.cancelled_at && `${new Date(booking.cancelled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              {booking.cancellation_reason && ` · ${booking.cancellation_reason}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const StatPill = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-1.5 bg-[#f7f7f7] rounded-lg px-2.5 py-2">
    <Icon size={13} className="text-[#374151] shrink-0" />
    <span className="text-[11px] font-medium text-[#374151] truncate">{label}</span>
  </div>
);

export default BookingDetail;
