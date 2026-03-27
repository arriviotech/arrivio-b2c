import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, CheckCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../context/AuthContext';

const PaymentSummaryCard = ({ propertyId }) => {
  const { user } = useAuth();
  const shouldFetch = !!(user && propertyId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(shouldFetch);

  useEffect(() => {
    if (!shouldFetch) return;

    const fetch = async () => {
      // Find bookings for this property via units
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, units!unit_id ( property_id )')
        .eq('profile_id', user.id);

      if (!bookings?.length) { setLoading(false); return; }

      const bookingIds = bookings
        .filter(b => b.units?.property_id === propertyId)
        .map(b => b.id);

      if (!bookingIds.length) { setLoading(false); return; }

      // Fetch payments for these bookings
      const { data: payments } = await supabase
        .from('payments')
        .select('id, amount_cents, status, payment_type, created_at')
        .eq('reference_type', 'booking')
        .in('reference_id', bookingIds)
        .order('created_at', { ascending: false });

      if (!payments?.length) { setLoading(false); return; }

      // Fetch next unpaid rent statement
      const { data: nextDue } = await supabase
        .from('monthly_rent_statements')
        .select('amount_cents, due_date, period_month, period_year')
        .in('booking_id', bookingIds)
        .eq('status', 'unpaid')
        .order('due_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      const totalPaid = payments
        .filter(p => p.status === 'succeeded')
        .reduce((sum, p) => sum + (p.amount_cents || 0), 0);

      const totalPending = payments
        .filter(p => ['pending', 'processing'].includes(p.status))
        .reduce((sum, p) => sum + (p.amount_cents || 0), 0);

      setData({
        totalPaid,
        totalPending,
        paymentCount: payments.length,
        nextDue,
        propertyId,
      });
      setLoading(false);
    };

    fetch();
  }, [user, propertyId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-5 flex items-center justify-center h-24">
        <Loader2 size={18} className="animate-spin text-[#9ca3af]" />
      </div>
    );
  }

  // Don't render if user has no bookings/payments for this property
  if (!data) return null;

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af]">Your Payments</p>
        <CreditCard size={14} className="text-[#9ca3af]" />
      </div>

      <div className="space-y-3">
        {/* Total Paid */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
              <CheckCircle size={12} className="text-[#22C55E]" />
            </div>
            <span className="text-xs text-[#4b5563]">Total Paid</span>
          </div>
          <span className="text-sm font-bold text-[#111827] tabular-nums lining-nums">
            €{(data.totalPaid / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Pending */}
        {data.totalPending > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center">
                <Clock size={12} className="text-amber-500" />
              </div>
              <span className="text-xs text-[#4b5563]">Pending</span>
            </div>
            <span className="text-sm font-bold text-amber-500 tabular-nums lining-nums">
              €{(data.totalPending / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Next Due */}
        {data.nextDue && (
          <div className="mt-2 pt-3 border-t border-[#0f4c3a]/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#9ca3af]">Next Due</p>
                <p className="text-xs text-[#4b5563] mt-0.5">
                  {MONTHS[data.nextDue.period_month - 1]} {data.nextDue.period_year}
                </p>
              </div>
              <span className="text-sm font-bold text-[#111827] tabular-nums lining-nums">
                €{(data.nextDue.amount_cents / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* View Full History */}
      <Link
        to={`/profile/payments?property=${propertyId}`}
        className="mt-4 w-full py-2.5 bg-[#f2f2f2] hover:bg-[#0f4c3a] hover:text-white text-[#111827] rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
      >
        View full history
        <ArrowRight size={12} />
      </Link>
    </div>
  );
};

export default PaymentSummaryCard;
