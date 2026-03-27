import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, MapPin, Home, ArrowRight, Search,
  CheckCircle, Clock, CreditCard, FileText, AlertCircle,
  ChevronRight, XCircle
} from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import MyBookingsSkeleton from '../../components/skeletons/MyBookingsSkeleton';

const BOOKING_STATUS = {
  active: { label: 'Active', bg: 'bg-[#22C55E]/10', text: 'text-[#16a34a]' },
  confirmed: { label: 'Confirmed', bg: 'bg-[#22C55E]/10', text: 'text-[#16a34a]' },
  pending_signature: { label: 'Pending Signature', bg: 'bg-amber-50', text: 'text-amber-500' },
  pending_payment: { label: 'Pending Payment', bg: 'bg-amber-50', text: 'text-amber-500' },
  completed: { label: 'Completed', bg: 'bg-[#f2f2f2]', text: 'text-[#6b7280]' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-[#EA4335]' },
};

const APP_STATUS = {
  pending_payment: { label: 'Pay Deposit', step: 1 },
  pending_profile: { label: 'Upload Docs', step: 2 },
  pending_signature: { label: 'Sign Agreement', step: 3 },
  pending_approval: { label: 'Under Review', step: 4 },
  under_review: { label: 'Under Review', step: 4 },
  approved: { label: 'Approved', step: 5 },
  rejected: { label: 'Rejected', step: -1 },
  withdrawn: { label: 'Withdrawn', step: -1 },
};

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [bookingsRes, appsRes] = await Promise.all([
          supabase
            .from('bookings')
            .select(`id, status, move_in_date, move_out_date, monthly_rent_cents, created_at,
              units!unit_id ( unit_number, unit_type, slug, property_id,
                properties ( name, slug, city, district )
              )`)
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false }),

          supabase
            .from('applications')
            .select(`id, status, move_in_date, move_out_date, tenant_type, created_at,
              units!unit_id ( unit_number, unit_type, slug, property_id,
                properties ( name, slug, city, district )
              )`)
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false }),
        ]);

        if (bookingsRes.data) setBookings(bookingsRes.data);
        if (appsRes.data) setApplications(appsRes.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleWithdraw = async (applicationId) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'withdrawn' })
        .eq('id', applicationId)
        .eq('profile_id', user.id);

      if (error) throw error;

      // Update local state
      setApplications(prev =>
        prev.map(a => a.id === applicationId ? { ...a, status: 'withdrawn' } : a)
      );
      toast.success('Application withdrawn. Your deposit refund will be processed.');
    } catch (err) {
      console.error('Withdraw error:', err);
      toast.error('Failed to withdraw. Please try again.');
    }
  };

  if (loading) {
    return <MyBookingsSkeleton />;
  }

  const activeBookings = bookings.filter(b => ['active', 'confirmed', 'pending_signature', 'pending_payment'].includes(b.status));
  const pastBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
  const activeApps = applications.filter(a => ['pending_payment', 'pending_profile', 'pending_signature', 'pending_approval', 'under_review'].includes(a.status));
  const pastApps = applications.filter(a => ['approved', 'rejected', 'withdrawn'].includes(a.status));

  const isEmpty = bookings.length === 0 && applications.length === 0;

  const TABS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active', count: activeBookings.length + activeApps.length },
    { key: 'past', label: 'Past', count: pastBookings.length + pastApps.length },
  ];

  return (
    <div>
      <h2 className="text-xl font-serif text-[#111827] mb-6">My Bookings</h2>

      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center mx-auto mb-4">
            <Home size={28} className="text-[#9ca3af]" />
          </div>
          <h3 className="font-serif text-lg text-[#111827] mb-2">No Bookings Yet</h3>
          <p className="text-sm text-[#6b7280] mb-6 max-w-sm mx-auto">
            Start exploring our furnished units and find your perfect home in Germany.
          </p>
          <Link to="/search" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f4c3a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a3a2b] transition-colors">
            Browse Units <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Tabs */}
          <div className="flex gap-2">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  tab === t.key
                    ? 'bg-[#0f4c3a] text-white'
                    : 'bg-white border border-[#e5e7eb] text-[#374151] hover:border-[#0f4c3a]/30'
                }`}
              >
                {t.label} {t.count !== undefined ? `(${t.count})` : `(${bookings.length + applications.length})`}
              </button>
            ))}
          </div>

          {/* Active Bookings */}
          {(tab === 'all' || tab === 'active') && activeBookings.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3 px-1">Active Bookings</p>
              <div className="space-y-3">
                {activeBookings.map((booking, i) => (
                  <BookingCard key={booking.id} booking={booking} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Active Applications */}
          {(tab === 'all' || tab === 'active') && activeApps.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3 px-1">Applications In Progress</p>
              <div className="space-y-3">
                {activeApps.map((app, i) => (
                  <ApplicationCard key={app.id} app={app} index={i} navigate={navigate} onWithdraw={handleWithdraw} />
                ))}
              </div>
            </div>
          )}

          {/* Past Bookings */}
          {(tab === 'all' || tab === 'past') && pastBookings.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3 px-1">Past Bookings</p>
              <div className="space-y-3">
                {pastBookings.map((booking, i) => (
                  <BookingCard key={booking.id} booking={booking} index={i} past />
                ))}
              </div>
            </div>
          )}

          {/* Past Applications */}
          {(tab === 'all' || tab === 'past') && pastApps.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3 px-1">Past Applications</p>
              <div className="space-y-3">
                {pastApps.map((app, i) => (
                  <ApplicationCard key={app.id} app={app} index={i} navigate={navigate} onWithdraw={handleWithdraw} past />
                ))}
              </div>
            </div>
          )}

          {/* Empty filtered state */}
          {tab === 'active' && activeBookings.length === 0 && activeApps.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-[#9ca3af]">No active bookings or applications</p>
            </div>
          )}
          {tab === 'past' && pastBookings.length === 0 && pastApps.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-[#9ca3af]">No past bookings</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ──── Booking Card ──── */
const BookingCard = ({ booking, index, past }) => {
  const unit = booking.units || {};
  const property = unit.properties || {};
  const status = BOOKING_STATUS[booking.status] || BOOKING_STATUS.active;
  const rent = Math.round((booking.monthly_rent_cents || 0) / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-xl border border-[#e5e7eb] overflow-hidden hover:shadow-sm transition-shadow ${past ? 'opacity-75' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-[#111827] truncate">{property.name || 'Property'}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <p className="text-[11px] text-[#6b7280]">
              {unit.unit_type?.replace(/_/g, ' ')} · Unit {unit.unit_number} · {property.city}
            </p>
          </div>
          <div className="text-right shrink-0 ml-3">
            <p className="text-base font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{rent}</p>
            <p className="text-[9px] text-[#9ca3af]">/month</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#6b7280] mb-3">
          <span className="flex items-center gap-1"><Calendar size={11} /> {booking.move_in_date}</span>
          <span className="text-[#d1d5db]">→</span>
          <span className="flex items-center gap-1"><Calendar size={11} /> {booking.move_out_date}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/profile/bookings/${booking.id}`}
            className="flex-1 min-w-[100px] py-2 bg-[#f2f2f2] hover:bg-[#e5e5e5] rounded-lg text-[10px] font-bold uppercase tracking-widest text-center text-[#374151] transition-colors"
          >
            View Details
          </Link>
          {unit.property_id && (
            <Link
              to={`/profile/payments?property=${unit.property_id}`}
              className="flex-1 py-2 bg-white border border-[#e5e7eb] hover:border-[#0f4c3a]/30 rounded-lg text-[10px] font-bold uppercase tracking-widest text-center text-[#374151] transition-colors flex items-center justify-center gap-1"
            >
              <CreditCard size={11} /> Payments
            </Link>
          )}
          {!past && (
            <Link
              to="/profile/payments"
              className="flex-1 py-2 bg-[#0f4c3a] hover:bg-[#0a3a2b] rounded-lg text-[10px] font-bold uppercase tracking-widest text-center text-white transition-colors"
            >
              Pay Rent
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ──── Application Steps Config ──── */
const APP_STEPS = [
  { key: "pending_payment", label: "Pay Deposit", icon: CreditCard, desc: "Pay holding deposit to secure your unit" },
  { key: "pending_profile", label: "Upload Docs", icon: FileText, desc: "Upload passport, contract & ID" },
  { key: "pending_signature", label: "Sign Agreement", icon: FileText, desc: "Sign rental agreement via DocuSign" },
  { key: "pending_approval", label: "Review", icon: Clock, desc: "Our team reviews your application" },
  { key: "approved", label: "Approved", icon: CheckCircle, desc: "Booking confirmed!" },
];

/* ──── Application Card ──── */
const ApplicationCard = ({ app, index, navigate, past, onWithdraw }) => {
  const unit = app.units || {};
  const property = unit.properties || {};
  const isApproved = app.status === 'approved';
  const isRejected = app.status === 'rejected';
  const isWithdrawn = app.status === 'withdrawn';
  const currentStepIdx = APP_STEPS.findIndex(s => s.key === app.status);
  const activeIdx = app.status === 'under_review' ? 3 : currentStepIdx;
  const [showConfirm, setShowConfirm] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-xl border border-[#e5e7eb] overflow-hidden hover:shadow-sm transition-shadow ${past ? 'opacity-75' : ''}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#111827] truncate mb-0.5">{property.name || 'Property'}</h3>
            <p className="text-[11px] text-[#6b7280]">
              {unit.unit_type?.replace(/_/g, ' ')} · {property.city} · {app.tenant_type}
            </p>
          </div>
          <span className="text-[10px] text-[#9ca3af] shrink-0 ml-2">
            {new Date(app.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Step Progress — only for active */}
        {!past && !isRejected && !isWithdrawn && activeIdx >= 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-3">
              {APP_STEPS.map((step, i) => (
                <div key={step.key} className={`flex-1 h-1.5 rounded-full ${
                  i < activeIdx ? 'bg-[#22C55E]' : i === activeIdx ? 'bg-[#0f4c3a]' : 'bg-[#e5e7eb]'
                }`} />
              ))}
            </div>

            {/* Step Icons + Labels */}
            <div className="flex justify-between mb-3">
              {APP_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isComplete = i < activeIdx;
                const isCurrent = i === activeIdx;
                return (
                  <div key={step.key} className="flex flex-col items-center" style={{ width: `${100 / APP_STEPS.length}%` }}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                      isComplete ? 'bg-[#22C55E] text-white' :
                      isCurrent ? 'bg-[#0f4c3a] text-white' :
                      'bg-[#e5e7eb] text-[#9ca3af]'
                    }`}>
                      {isComplete ? <CheckCircle size={12} /> : <StepIcon size={12} />}
                    </div>
                    <span className={`text-[8px] font-bold uppercase tracking-wider text-center leading-tight ${
                      isCurrent ? 'text-[#0f4c3a]' : isComplete ? 'text-[#16a34a]' : 'text-[#9ca3af]'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Current Step Info */}
            {activeIdx >= 0 && activeIdx < APP_STEPS.length && (
              <div className="p-2.5 bg-[#f7f7f7] rounded-lg flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#0f4c3a] text-white flex items-center justify-center shrink-0">
                  {React.createElement(APP_STEPS[activeIdx].icon, { size: 11 })}
                </div>
                <p className="text-[11px] text-[#374151]">
                  <span className="font-bold">Next: </span>{APP_STEPS[activeIdx].desc}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-3 text-[11px] text-[#6b7280] mb-3">
          <span className="flex items-center gap-1"><Calendar size={11} /> {app.move_in_date}</span>
          <span className="text-[#d1d5db]">→</span>
          <span className="flex items-center gap-1"><Calendar size={11} /> {app.move_out_date}</span>
        </div>

        {/* CTA */}
        {!past && !isRejected && !isWithdrawn && (
          <div className="space-y-2">
            <button
              onClick={() => navigate("/application/details")}
              className="w-full py-2.5 bg-[#0f4c3a] hover:bg-[#0a3a2b] rounded-lg text-[10px] font-bold uppercase tracking-widest text-white text-center transition-colors flex items-center justify-center gap-2"
            >
              Continue Application <ArrowRight size={12} />
            </button>

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] hover:text-[#EA4335] transition-colors text-center"
              >
                Withdraw Application
              </button>
            ) : (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-xs text-[#EA4335] font-medium mb-3">
                  Are you sure? Your holding deposit will be refunded within 1-2 business days.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-2 bg-white border border-[#e5e7eb] rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#374151] hover:bg-[#f7f7f7] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setWithdrawing(true);
                      await onWithdraw(app.id);
                      setWithdrawing(false);
                    }}
                    disabled={withdrawing}
                    className="flex-1 py-2 bg-[#EA4335] rounded-lg text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#d33426] transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {withdrawing ? 'Withdrawing...' : <><XCircle size={12} /> Confirm Withdraw</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Approved — application completed, booking should exist */}
        {isApproved && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 py-2.5 px-3 bg-[#22C55E]/10 rounded-lg">
              <CheckCircle size={14} className="text-[#16a34a] shrink-0" />
              <span className="text-[11px] text-[#16a34a] font-medium">Application approved. Booking created.</span>
            </div>
            <div className="flex gap-2">
              <Link to="/profile/payments" className="flex-1 py-2 bg-[#f2f2f2] hover:bg-[#e5e5e5] rounded-lg text-[10px] font-bold uppercase tracking-widest text-center text-[#374151] transition-colors flex items-center justify-center gap-1">
                <CreditCard size={11} /> Payments
              </Link>
              {unit.slug ? (
                <Link to={`/unit/${unit.slug}`} className="flex-1 py-2 bg-[#0f4c3a] hover:bg-[#0a3a2b] rounded-lg text-[10px] font-bold uppercase tracking-widest text-center text-white transition-colors">
                  View Unit
                </Link>
              ) : (
                <Link to="/profile/bookings" className="flex-1 py-2 bg-[#0f4c3a] hover:bg-[#0a3a2b] rounded-lg text-[10px] font-bold uppercase tracking-widest text-center text-white transition-colors">
                  View Bookings
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Rejected */}
        {isRejected && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 py-2.5 px-3 bg-red-50 rounded-lg">
              <XCircle size={14} className="text-[#EA4335] shrink-0" />
              <span className="text-[11px] text-[#EA4335] font-medium">Application was rejected. Refund initiated within 1-2 business days.</span>
            </div>
            <div className="flex gap-2">
              <Link to="/profile/payments" className="flex-1 py-2 bg-[#f2f2f2] hover:bg-[#e5e5e5] rounded-lg text-[10px] font-bold uppercase tracking-widest text-center text-[#374151] transition-colors flex items-center justify-center gap-1">
                <CreditCard size={11} /> Payments
              </Link>
              {unit.slug ? (
                <Link to={`/unit/${unit.slug}`} className="flex-1 py-2 bg-[#0f4c3a] hover:bg-[#0a3a2b] rounded-lg text-[10px] font-bold uppercase tracking-widest text-center text-white transition-colors">
                  View Unit
                </Link>
              ) : (
                <Link to="/search" className="flex-1 py-2 bg-[#0f4c3a] hover:bg-[#0a3a2b] rounded-lg text-[10px] font-bold uppercase tracking-widest text-center text-white transition-colors">
                  Browse Units
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Withdrawn */}
        {isWithdrawn && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 py-2.5 px-3 bg-[#f2f2f2] rounded-lg">
              <AlertCircle size={14} className="text-[#6b7280] shrink-0" />
              <span className="text-[11px] text-[#6b7280] font-medium">You withdrew this application.</span>
            </div>
            <div className="flex gap-2">
              <Link to="/profile/payments" className="flex-1 py-2 bg-[#f2f2f2] hover:bg-[#e5e5e5] rounded-lg text-[10px] font-bold uppercase tracking-widest text-center text-[#374151] transition-colors flex items-center justify-center gap-1">
                <CreditCard size={11} /> Payments
              </Link>
              {unit.slug ? (
                <Link to={`/unit/${unit.slug}`} className="flex-1 py-2 bg-[#0f4c3a] hover:bg-[#0a3a2b] rounded-lg text-[10px] font-bold uppercase tracking-widest text-center text-white transition-colors">
                  View Unit
                </Link>
              ) : (
                <Link to="/search" className="flex-1 py-2 bg-[#0f4c3a] hover:bg-[#0a3a2b] rounded-lg text-[10px] font-bold uppercase tracking-widest text-center text-white transition-colors">
                  Browse Units
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyBookings;
