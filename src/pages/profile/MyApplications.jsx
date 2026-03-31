import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Calendar, CreditCard, FileText, Clock,
  ClipboardList, PenTool, Home, Loader2, Trash2
} from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../context/AuthContext';
import OptimizedImage from '../../components/common/OptimizedImage';
import { THUMBNAIL_SIZES } from '../../utils/imageUtils';

const STATUS_CONFIG = {
  pending_payment: { label: 'Pending Payment', color: 'text-[#D4A017]', bg: 'bg-[#D4A017]/10' },
  pending_profile: { label: 'Complete Application', color: 'text-[#0f4c3a]', bg: 'bg-[#0f4c3a]/5' },
  pending_signature: { label: 'Sign Lease', color: 'text-[#0f4c3a]', bg: 'bg-[#0f4c3a]/5' },
  pending_approval: { label: 'Under Review', color: 'text-blue-500', bg: 'bg-blue-50' },
  under_review: { label: 'Under Review', color: 'text-blue-500', bg: 'bg-blue-50' },
  approved: { label: 'Approved', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
  rejected: { label: 'Rejected', color: 'text-[#EA4335]', bg: 'bg-[#EA4335]/10' },
  withdrawn: { label: 'Withdrawn', color: 'text-[#6b7280]', bg: 'bg-[#f2f2f2]' },
  cancelled: { label: 'Cancelled', color: 'text-[#6b7280]', bg: 'bg-[#f2f2f2]' },
};

const STEP_ITEMS = [
  { label: "Pay", icon: CreditCard },
  { label: "Apply", icon: ClipboardList },
  { label: "Sign", icon: PenTool },
  { label: "Review", icon: Clock },
  { label: "Move in", icon: Home },
];

const STEP_KEYS = ['pending_payment', 'pending_profile', 'pending_signature', 'under_review', 'approved'];

const MyApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('in_progress');
  const [withdrawApp, setWithdrawApp] = useState(null); // app to withdraw
  const [withdrawing, setWithdrawing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from('applications')
          .select(`id, status, move_in_date, move_out_date, tenant_type, unit_id, created_at,
            units!unit_id ( id, unit_number, unit_type, unit_pricing_rules ( monthly_rent_cents ),
              properties ( id, name, slug, city, property_photos ( storage_path, is_primary, display_order ) ) )`)
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false });
        setApplications(data || []);
      } catch (e) {
        console.error('Fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const handleContinue = (app) => {
    const unit = app.units || {};
    const property = unit.properties || {};
    const rent = unit.unit_pricing_rules?.[0]?.monthly_rent_cents;
    const appState = {
      applicationId: app.id,
      propertyId: property.id,
      unitId: unit.id,
      title: `${property.name}. ${unit.unit_type?.replace(/_/g, ' ')}`,
      propertyName: property.name,
      unitNumber: unit.unit_number,
      unitType: unit.unit_type,
      city: property.city,
      checkIn: app.move_in_date,
      checkOut: app.move_out_date,
      monthlyTotal: rent ? Math.round(rent / 100) : 0,
    };
    if (app.status === 'pending_payment') navigate('/booking/review', { state: appState });
    else if (app.status === 'pending_profile') navigate('/application/details', { state: appState });
    else if (app.status === 'pending_signature') navigate('/application/details', { state: appState });
    else navigate(`/profile/applications/${app.id}`);
  };

  const handleWithdraw = async () => {
    if (!withdrawApp) return;
    setWithdrawing(true);
    try {
      await supabase.from('applications').update({ status: 'withdrawn' }).eq('id', withdrawApp.id);
      setApplications(prev => prev.map(a => a.id === withdrawApp.id ? { ...a, status: 'withdrawn' } : a));
      setWithdrawApp(null);
    } catch (e) {
      console.error('Withdraw error:', e);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-[#9ca3af]" /></div>;
  }

  const activeApps = applications.filter(a => ['pending_payment', 'pending_profile', 'pending_signature', 'pending_approval', 'under_review'].includes(a.status));
  const pastApps = applications.filter(a => ['approved', 'rejected', 'withdrawn', 'cancelled'].includes(a.status));

  const filteredApps = filter === 'in_progress' ? activeApps :
    filter === 'approved' ? applications.filter(a => a.status === 'approved') :
    filter === 'closed' ? applications.filter(a => ['withdrawn', 'cancelled', 'rejected'].includes(a.status)) : activeApps;

  const FILTERS = [
    { key: 'in_progress', label: 'In Progress', count: activeApps.length },
    { key: 'approved', label: 'Approved', count: applications.filter(a => a.status === 'approved').length },
    { key: 'closed', label: 'Closed', count: applications.filter(a => ['withdrawn', 'cancelled', 'rejected'].includes(a.status)).length },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-serif text-[#111827] mb-1">My Applications</h1>
        <p className="text-sm text-[#6b7280]">Track and manage your rental applications</p>
      </div>

      {/* Filter pills */}
      {applications.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                filter === f.key
                  ? 'bg-[#0f4c3a] text-white'
                  : 'bg-white border border-[#e5e7eb] text-[#4b5563] hover:border-[#0f4c3a]/30'
              }`}
            >
              {f.label} {f.count > 0 && <span className={filter === f.key ? 'text-white/60' : 'text-[#9ca3af]'}>({f.count})</span>}
            </button>
          ))}
        </div>
      )}

      {applications.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={24} className="text-[#9ca3af]" />
          </div>
          <h3 className="font-serif text-lg text-[#111827] mb-2">No applications yet</h3>
          <p className="text-xs text-[#6b7280] mb-5 max-w-xs mx-auto">Find your perfect furnished apartment. Browse our available stays and start your application in minutes.</p>
          <button onClick={() => navigate('/search')} className="px-6 py-3 bg-[#0f4c3a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a3a2b] transition-colors inline-flex items-center gap-2">
            Browse Stays <ArrowRight size={12} />
          </button>
        </div>
      )}

      {filteredApps.length > 0 && (() => {
        const ITEMS_PER_PAGE = 5;
        const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
        const paginatedApps = filteredApps.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

        return (
        <div>
          <div className="space-y-3">
            {paginatedApps.map(app => {
              const unit = app.units || {};
              const property = unit.properties || {};
              const photos = (property.property_photos || []).sort((a, b) => a.display_order - b.display_order);
              const coverImage = photos.find(p => p.is_primary)?.storage_path || photos[0]?.storage_path;
              const statusConfig = STATUS_CONFIG[app.status] || {};
              const rent = unit.unit_pricing_rules?.[0]?.monthly_rent_cents;
              const statusKey = app.status === 'pending_approval' ? 'under_review' : app.status;
              const idx = STEP_KEYS.indexOf(statusKey);
              const isActive = ['pending_payment', 'pending_profile', 'pending_signature', 'pending_approval', 'under_review'].includes(app.status);

              return (
                <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isActive ? 'border-[#0f4c3a]/10' : 'border-[#e5e7eb] opacity-60'}`}
                >
                  {/* Status + Applied date */}
                  <div className="px-4 pt-3 pb-0 flex items-center justify-between">
                    <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>{statusConfig.label}</span>
                    <span className="text-[8px] text-[#9ca3af]">Applied {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  <div className="flex gap-3 p-4 pt-2 pb-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#f2f2f2]">
                      {coverImage && <OptimizedImage src={coverImage} alt={property.name} width={80} sizes={THUMBNAIL_SIZES} className="w-full h-full" imgClassName="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-sm text-[#111827] truncate">{property.name}</h3>
                      <p className="text-[9px] text-[#6b7280]">{unit.unit_type?.replace(/_/g, ' ')}{unit.unit_number ? ` · Unit ${unit.unit_number}` : ''}{property.city ? ` · ${property.city}` : ''}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1 text-[9px] text-[#9ca3af]">
                          <Calendar size={9} />
                          {app.move_in_date ? (
                            <span className="text-[#111827] font-medium">
                              {new Date(app.move_in_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} → {new Date(app.move_out_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          ) : <span>Dates TBD</span>}
                        </div>
                        {rent && <span className="text-xs font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{Math.round(rent / 100)}/mo</span>}
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  {isActive && idx >= 0 && (
                    <div className="px-4 pb-2">
                      <div className="flex items-center">
                        {STEP_ITEMS.map((step, i) => {
                          const isComplete = i < idx;
                          const isCurrent = i === idx;
                          const Icon = step.icon;
                          return (
                            <React.Fragment key={i}>
                              <div className="flex flex-col items-center gap-0.5">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                  isComplete ? 'bg-[#22C55E]' : isCurrent ? 'bg-[#0f4c3a]' : 'bg-[#f2f2f2]'
                                }`}>
                                  {isComplete ? (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                  ) : (
                                    <Icon size={12} className={isCurrent ? 'text-white' : 'text-[#9ca3af]'} />
                                  )}
                                </div>
                                <p className={`text-[7px] font-bold ${isCurrent ? 'text-[#0f4c3a]' : isComplete ? 'text-[#22C55E]' : 'text-[#9ca3af]'}`}>{step.label}</p>
                              </div>
                              {i < STEP_ITEMS.length - 1 && (
                                <div className={`flex-1 h-[2px] -mt-4 mx-0.5 ${isComplete ? 'bg-[#22C55E]' : 'bg-[#e5e7eb]'}`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isActive ? (
                    <div className="px-4 pb-3">
                      <button onClick={() => handleContinue(app)} className="w-full py-2.5 bg-[#0f4c3a] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0a3a2b] transition-colors mb-2">
                        {app.status === 'pending_payment' ? 'Continue to Payment' :
                         app.status === 'pending_profile' ? 'Complete Application' :
                         app.status === 'pending_signature' ? 'Sign Lease' : 'View Status'} <ArrowRight size={12} />
                      </button>
                      <div className="flex items-center justify-center mt-1">
                        <button onClick={() => setWithdrawApp(app)} className="text-[10px] text-[#EA4335] font-semibold hover:underline">Withdraw application</button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 pb-3 flex items-center justify-between">
                      <p className="text-[9px] text-[#9ca3af]">This application is no longer active</p>
                      <button
                        onClick={async () => {
                          await supabase.from('application_profiles').delete().eq('application_id', app.id);
                          await supabase.from('applications').delete().eq('id', app.id);
                          setApplications(prev => prev.filter(a => a.id !== app.id));
                        }}
                        className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#EA4335] hover:bg-[#EA4335]/5 transition-colors"
                        title="Delete application"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-[11px] text-[#9ca3af]">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredApps.length)} of {filteredApps.length} applications
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg border border-[#e5e7eb] flex items-center justify-center text-[#374151] hover:bg-[#f7f7f7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs">‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${currentPage === page ? 'bg-[#0f4c3a] text-white' : 'border border-[#e5e7eb] text-[#374151] hover:bg-[#f7f7f7]'}`}
                  >{page}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg border border-[#e5e7eb] flex items-center justify-center text-[#374151] hover:bg-[#f7f7f7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs">›</button>
              </div>
            </div>
          )}
        </div>
        );
      })()}

      {/* Empty filter state */}
      {applications.length > 0 && filteredApps.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 text-center">
          <p className="text-sm text-[#6b7280]">No applications match this filter</p>
        </div>
      )}

      {/* Withdraw confirmation modal */}
      <AnimatePresence>
        {withdrawApp && (() => {
          const unit = withdrawApp.units || {};
          const property = unit.properties || {};
          const hasPaid = withdrawApp.status !== 'pending_payment';

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
              onClick={() => !withdrawing && setWithdrawApp(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-[#EA4335]/10 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>

                <h3 className="text-lg font-serif text-[#111827] text-center mb-2">Withdraw application?</h3>
                <p className="text-[12px] text-[#6b7280] text-center mb-2">
                  You're about to withdraw your application for <span className="font-semibold text-[#111827]">{property.name}</span>.
                </p>

                {hasPaid && (
                  <div className="bg-[#D4A017]/5 border border-[#D4A017]/15 rounded-lg px-3 py-2.5 mb-4">
                    <p className="text-[11px] text-[#92700C]">
                      You've already paid the holding deposit. Your refund will be processed according to our cancellation policy.
                    </p>
                  </div>
                )}

                {!hasPaid && (
                  <p className="text-[11px] text-[#9ca3af] text-center mb-4">
                    No payment has been made. This will simply cancel your application.
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setWithdrawApp(null)}
                    disabled={withdrawing}
                    className="flex-1 py-2.5 bg-[#f2f2f2] text-[#4b5563] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#e5e5e5] transition-colors"
                  >
                    Keep it
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className="flex-1 py-2.5 bg-[#EA4335] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#d63a2e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {withdrawing ? (
                      <><Loader2 size={12} className="animate-spin" /> Withdrawing...</>
                    ) : (
                      'Withdraw'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default MyApplications;
