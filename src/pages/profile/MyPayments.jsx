import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard, Calendar, Receipt, ArrowRight,
  CheckCircle, Clock, AlertCircle, RefreshCcw, Search,
  ChevronDown, Home, X
} from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../context/AuthContext';
import MyPaymentsSkeleton from '../../components/skeletons/MyPaymentsSkeleton';

const PAYMENT_TYPE_LABELS = {
  holding_deposit: 'Holding Deposit',
  security_deposit: 'Security Deposit',
  monthly_rent: 'Monthly Rent',
  addon: 'Add-on Service',
  event_ticket: 'Event Ticket',
  deposit_refund: 'Deposit Refund',
  holding_deposit_refund: 'Deposit Refund',
};

const STATUS_STYLES = {
  succeeded: { label: 'Paid', color: 'text-[#16a34a]', bg: 'bg-[#22C55E]/10', stripe: 'bg-[#22C55E]' },
  pending: { label: 'Pending', color: 'text-amber-500', bg: 'bg-amber-50', stripe: 'bg-amber-400' },
  processing: { label: 'Processing', color: 'text-blue-500', bg: 'bg-blue-50', stripe: 'bg-blue-400' },
  failed: { label: 'Failed', color: 'text-[#EA4335]', bg: 'bg-red-50', stripe: 'bg-[#EA4335]' },
  refunded: { label: 'Refunded', color: 'text-purple-500', bg: 'bg-purple-50', stripe: 'bg-purple-400' },
  partially_refunded: { label: 'Partial Refund', color: 'text-purple-500', bg: 'bg-purple-50', stripe: 'bg-purple-400' },
  disputed: { label: 'Disputed', color: 'text-amber-600', bg: 'bg-amber-50', stripe: 'bg-amber-500' },
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'rent', label: 'Rent', types: ['monthly_rent'] },
  { key: 'deposits', label: 'Deposits', types: ['holding_deposit', 'security_deposit'] },
  { key: 'refunds', label: 'Refunds', types: ['deposit_refund', 'holding_deposit_refund'] },
];

const ITEMS_PER_PAGE = 10;
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const MyPayments = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const propertyFilter = searchParams.get('property');
  const [payments, setPayments] = useState([]);
  const [propertyName, setPropertyName] = useState(null);
  const [filterPropertyName, setFilterPropertyName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Fetch all user bookings with property info
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, units!unit_id ( property_id, properties ( name ) )')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      // Set display property name from most recent booking
      if (bookings?.[0]?.units?.properties?.name) {
        setPropertyName(bookings[0].units.properties.name);
      }

      // If filtering by property, get booking IDs for that property
      let bookingIdsForProperty = null;
      if (propertyFilter && bookings?.length) {
        const matched = bookings.filter(b => b.units?.property_id === propertyFilter);
        bookingIdsForProperty = matched.map(b => b.id);
        if (matched[0]?.units?.properties?.name) {
          setFilterPropertyName(matched[0].units.properties.name);
        }
      }

      // Fetch payments
      let query = supabase
        .from('payments')
        .select('id, payment_type, amount_cents, status, currency, description, paid_at, created_at, reference_type, reference_id')
        .eq('payer_id', user.id)
        .order('created_at', { ascending: false });

      // Filter by property's booking IDs if applicable
      if (bookingIdsForProperty) {
        query = query.eq('reference_type', 'booking').in('reference_id', bookingIdsForProperty);
      }

      const { data, error } = await query;
      if (!error && data) setPayments(data);

      setLoading(false);
    };
    fetchData();
  }, [user, propertyFilter]);

  const clearPropertyFilter = () => {
    setSearchParams({});
    setFilterPropertyName(null);
  };

  // Summary
  const totalPaid = payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + (p.amount_cents || 0), 0);
  const totalPending = payments.filter(p => ['pending', 'processing'].includes(p.status)).reduce((sum, p) => sum + (p.amount_cents || 0), 0);
  const totalRefunded = payments.filter(p => ['refunded', 'partially_refunded'].includes(p.status)).reduce((sum, p) => sum + (p.amount_cents || 0), 0);

  // Filter
  const activeFilter = FILTER_TABS.find(t => t.key === filter);
  const filteredPayments = filter === 'all' ? payments : payments.filter(p => activeFilter?.types?.includes(p.payment_type));

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const visiblePayments = filteredPayments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Group by month
  const grouped = {};
  visiblePayments.forEach(p => {
    const d = new Date(p.paid_at || p.created_at);
    const key = `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  if (loading) {
    return <MyPaymentsSkeleton />;
  }

  return (
    <div>
      <h2 className="text-xl font-serif text-[#111827] mb-4">Payment History</h2>

      {/* Property filter banner */}
      {filterPropertyName && (
        <div className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-[#0f4c3a]/5 border border-[#0f4c3a]/10 rounded-xl">
          <Home size={13} className="text-[#0f4c3a] shrink-0" />
          <span className="text-xs font-medium text-[#111827] truncate">
            Showing payments for <span className="font-bold">{filterPropertyName}</span>
          </span>
          <button
            onClick={clearPropertyFilter}
            className="ml-auto shrink-0 p-1 rounded-full hover:bg-[#0f4c3a]/10 transition-colors"
            title="Show all payments"
          >
            <X size={13} className="text-[#4b5563]" />
          </button>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center mx-auto mb-4">
            <Receipt size={28} className="text-[#9ca3af]" />
          </div>
          <h3 className="font-serif text-lg text-[#111827] mb-2">No Payments Yet</h3>
          <p className="text-sm text-[#6b7280] mb-6 max-w-sm mx-auto">Your payment history will appear here once you start your booking journey.</p>
          <Link to="/search" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f4c3a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a3a2b] transition-colors">
            Browse Units <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle size={13} className="text-[#16a34a]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#374151]">Total Paid</span>
              </div>
              <p className="text-base sm:text-xl font-serif font-bold text-[#16a34a]" style={{ fontVariantNumeric: 'lining-nums' }}>€{Math.round(totalPaid / 100).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock size={13} className="text-amber-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#374151]">Pending</span>
              </div>
              <p className="text-base sm:text-xl font-serif font-bold text-amber-500" style={{ fontVariantNumeric: 'lining-nums' }}>€{Math.round(totalPending / 100).toLocaleString()}</p>
              {totalPending > 0 && (
                <Link to="/profile/payments" className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-1 inline-block hover:underline">Pay now →</Link>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <RefreshCcw size={13} className="text-purple-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#374151]">Refunded</span>
              </div>
              <p className="text-base sm:text-xl font-serif font-bold text-purple-500" style={{ fontVariantNumeric: 'lining-nums' }}>€{Math.round(totalRefunded / 100).toLocaleString()}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setFilter(tab.key); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                  filter === tab.key
                    ? 'bg-[#0f4c3a] text-white'
                    : 'bg-white border border-[#e5e7eb] text-[#374151] hover:border-[#0f4c3a]/30'
                }`}
              >
                {tab.label} ({tab.key === 'all' ? payments.length : payments.filter(p => tab.types?.includes(p.payment_type)).length})
              </button>
            ))}
          </div>

          {/* Payment List — grouped by month */}
          {filteredPayments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-[#9ca3af]">No {activeFilter?.label?.toLowerCase()} payments</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([month, items]) => (
                <div key={month}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#374151] mb-2 px-1">{month}</p>
                  <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden divide-y divide-[#e5e7eb]">
                    {items.map((payment, i) => {
                      const amount = Math.round((payment.amount_cents || 0) / 100);
                      const date = new Date(payment.paid_at || payment.created_at);
                      const statusConfig = STATUS_STYLES[payment.status] || STATUS_STYLES.pending;
                      const typeLabel = PAYMENT_TYPE_LABELS[payment.payment_type] || payment.payment_type;
                      const isRefund = payment.payment_type?.includes('refund');

                      return (
                        <motion.div
                          key={payment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-4 px-4 py-3.5 hover:bg-[#f7f7f7] transition-colors"
                        >
                          {/* Status stripe */}
                          <div className={`w-1 h-10 rounded-full ${statusConfig.stripe} shrink-0`} />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-bold text-[#111827] truncate">{typeLabel}</p>
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${statusConfig.bg} ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[#9ca3af]">
                              <span>{date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                              {payment.description && (
                                <>
                                  <span>·</span>
                                  <span className="truncate">{payment.description}</span>
                                </>
                              )}
                              {propertyName && (
                                <>
                                  <span>·</span>
                                  <span className="flex items-center gap-0.5 text-[#6b7280]">
                                    <Home size={9} /> {propertyName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="text-right shrink-0">
                            <p className={`text-sm font-bold ${isRefund ? 'text-purple-500' : 'text-[#111827]'}`} style={{ fontVariantNumeric: 'lining-nums' }}>
                              {isRefund ? '+' : ''}€{amount.toLocaleString()}
                            </p>
                            <p className="text-[9px] text-[#9ca3af]">{payment.currency || 'EUR'}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-[#9ca3af]">
                    Page {currentPage} of {totalPages} · {filteredPayments.length} payments
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 rounded-lg border border-[#e5e7eb] flex items-center justify-center text-[#374151] hover:bg-[#f7f7f7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                    >‹</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                          currentPage === page ? 'bg-[#0f4c3a] text-white' : 'border border-[#e5e7eb] text-[#374151] hover:bg-[#f7f7f7]'
                        }`}
                      >{page}</button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 rounded-lg border border-[#e5e7eb] flex items-center justify-center text-[#374151] hover:bg-[#f7f7f7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                    >›</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyPayments;
