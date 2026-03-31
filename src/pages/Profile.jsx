import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Heart, CreditCard, HelpCircle, FileText,
  Users, ArrowRight, Calendar, Clock, CheckCircle,
  AlertCircle, User, ShoppingBag, Loader2,
  Smartphone, Landmark, Scale, ShieldCheck, GraduationCap, Package, Home, ClipboardList
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { supabase } from "../supabase/client";
import { useAddonCatalogue, useMyAddonOrders } from "../supabase/hooks/useAddons";
import DashboardSkeleton from "../components/skeletons/DashboardSkeleton";
import SEO from "../components/common/SEO";

const Profile = () => {
  const { user } = useAuth();
  const { totalSaved } = useWishlist();
  const navigate = useNavigate();

  const { addons } = useAddonCatalogue();
  const { orders: addonOrders } = useMyAddonOrders();
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState(null);
  const [activeApplication, setActiveApplication] = useState(null);
  const [totalActiveApps, setTotalActiveApps] = useState(0);
  const [nextPayment, setNextPayment] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchDashboard = async () => {
      try {
        const { data: bookingData } = await supabase
          .from("bookings")
          .select(`id, status, move_in_date, move_out_date, monthly_rent_cents,
            units!unit_id ( unit_number, unit_type, slug, properties ( name, slug, city ) )`)
          .eq("profile_id", user.id)
          .in("status", ["active", "confirmed", "pending_signature", "pending_payment"])
          .order("created_at", { ascending: false })
          .limit(1).maybeSingle();
        if (bookingData) setActiveBooking(bookingData);

        // Always fetch applications (even if there's an active booking)
        const { data: appData } = await supabase
          .from("applications")
          .select(`id, status, move_in_date, move_out_date, tenant_type, unit_id, created_at,
            units!unit_id ( unit_number, unit_type, unit_pricing_rules ( monthly_rent_cents ), properties ( id, name, slug, city, property_photos ( storage_path, is_primary, display_order ) ) )`)
          .eq("profile_id", user.id)
          .in("status", ["pending_payment", "pending_profile", "pending_signature", "pending_approval", "under_review"])
          .order("created_at", { ascending: false })
          .limit(1).maybeSingle();
        if (appData) setActiveApplication(appData);

        const { count } = await supabase
          .from("applications")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", user.id)
          .in("status", ["pending_payment", "pending_profile", "pending_signature", "pending_approval", "under_review"]);
        setTotalActiveApps(count || 0);

        const { data: paymentData } = await supabase
          .from("monthly_rent_statements")
          .select("id, amount_cents, due_date")
          .eq("profile_id", user.id).eq("status", "unpaid")
          .order("due_date", { ascending: true })
          .limit(1).maybeSingle();
        if (paymentData) setNextPayment(paymentData);

        const { data: paymentsData } = await supabase
          .from("payments")
          .select("id, payment_type, amount_cents, status, paid_at, created_at")
          .eq("payer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        if (paymentsData) setRecentPayments(paymentsData);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  const STATUS_CONFIG = {
    active: { label: "Active", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
    confirmed: { label: "Confirmed", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
    pending_signature: { label: "Pending Signature", color: "text-amber-500", bg: "bg-amber-50" },
    pending_payment: { label: "Pending Payment", color: "text-amber-500", bg: "bg-amber-50" },
    pending_profile: { label: "Complete Profile", color: "text-amber-500", bg: "bg-amber-50" },
    pending_approval: { label: "Under Review", color: "text-blue-500", bg: "bg-blue-50" },
    under_review: { label: "Under Review", color: "text-blue-500", bg: "bg-blue-50" },
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const firstName = (user?.user_metadata?.full_name || "User").split(" ")[0];

  return (
    <div className="space-y-5">
      <SEO title="Dashboard" path="/profile" />

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-serif text-[#111827] mb-1">Welcome back, {firstName}</h1>
        <p className="text-sm text-[#6b7280]">Here's what's happening with your account</p>
      </div>

      {/* Mobile quick nav — hidden on desktop (sidebar handles it) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar md:hidden">
        <Link to="/profile/applications" className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#e5e7eb] rounded-full text-[10px] font-bold text-[#374151] whitespace-nowrap shrink-0">
          <ClipboardList size={12} className="text-[#9ca3af]" />
          Applications {totalActiveApps > 0 && <span className="bg-[#0f4c3a] text-white text-[7px] font-bold min-w-[14px] h-[14px] px-1 flex items-center justify-center rounded-full">{totalActiveApps}</span>}
        </Link>
        <Link to="/profile/bookings" className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#e5e7eb] rounded-full text-[10px] font-bold text-[#374151] whitespace-nowrap shrink-0">
          <Calendar size={12} className="text-[#9ca3af]" />
          Bookings
        </Link>
        <Link to="/profile/payments" className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#e5e7eb] rounded-full text-[10px] font-bold text-[#374151] whitespace-nowrap shrink-0">
          <CreditCard size={12} className="text-[#9ca3af]" />
          Payments
        </Link>
        <Link to="/profile/documents" className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#e5e7eb] rounded-full text-[10px] font-bold text-[#374151] whitespace-nowrap shrink-0">
          <FileText size={12} className="text-[#9ca3af]" />
          Documents
        </Link>
        <Link to="/profile/edit" className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#e5e7eb] rounded-full text-[10px] font-bold text-[#374151] whitespace-nowrap shrink-0">
          <User size={12} className="text-[#9ca3af]" />
          Profile
        </Link>
      </div>

      {/* Active Booking */}
      {activeBooking && (() => {
        const unit = activeBooking.units || {};
        const property = unit.properties || {};
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-sm">
            <div className="flex">
              {/* Green accent stripe */}
              <div className="w-1.5 bg-[#0f4c3a] shrink-0" />
              <div className="flex-1 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Your Home</p>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${STATUS_CONFIG[activeBooking.status]?.bg} ${STATUS_CONFIG[activeBooking.status]?.color}`}>
                    {STATUS_CONFIG[activeBooking.status]?.label}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-[#111827] mb-1">{property.name}</h3>
                <p className="text-xs text-[#6b7280] mb-4">{unit.unit_type?.replace(/_/g, ' ')} · Unit {unit.unit_number} · {property.city}</p>
                <div className="flex items-center gap-4 text-xs text-[#6b7280] mb-5">
                  <span className="flex items-center gap-1"><Calendar size={12} className="text-[#9ca3af]" /> {activeBooking.move_in_date}</span>
                  <span className="text-[#d1d5db]">→</span>
                  <span className="flex items-center gap-1"><Calendar size={12} className="text-[#9ca3af]" /> {activeBooking.move_out_date}</span>
                  <span className="ml-auto font-bold text-[#111827] text-lg" style={{ fontVariantNumeric: 'lining-nums' }}>€{Math.round(activeBooking.monthly_rent_cents / 100)}/mo</span>
                </div>
                <div className="flex gap-3">
                  <Link to={`/profile/bookings/${activeBooking.id}`} className="flex-1 py-3 bg-[#f2f2f2] hover:bg-[#e5e5e5] rounded-xl text-xs font-bold uppercase tracking-widest text-center text-[#374151] transition-colors">View Booking</Link>
                  <Link to="/profile/payments" className="flex-1 py-3 bg-[#0f4c3a] hover:bg-[#0a3a2b] text-white rounded-xl text-xs font-bold uppercase tracking-widest text-center transition-colors">Pay Rent</Link>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Application In Progress */}
      {activeApplication && (() => {
        const unit = activeApplication.units || {};
        const property = unit.properties || {};
        const photos = (property.property_photos || []).sort((a, b) => a.display_order - b.display_order);
        const coverImage = photos.find(p => p.is_primary)?.storage_path || photos[0]?.storage_path;
        const navigateToApp = () => {
          const appState = {
            applicationId: activeApplication.id,
            propertyId: property.id,
            unitId: activeApplication.unit_id,
            title: `${property.name}. ${unit.unit_type?.replace(/_/g, ' ')}`,
            propertyName: property.name,
            unitNumber: unit.unit_number,
            unitType: unit.unit_type,
            city: property.city,
            checkIn: activeApplication.move_in_date,
            checkOut: activeApplication.move_out_date,
          };
          if (activeApplication.status === 'pending_payment') navigate("/booking/review", { state: appState });
          else if (activeApplication.status === 'pending_profile') navigate("/application/details", { state: appState });
          else if (activeApplication.status === 'pending_signature') navigate("/application/details", { state: appState });
          else navigate(`/profile/applications/${activeApplication.id}`);
        };
        const ctaLabel = activeApplication.status === 'pending_payment' ? 'Continue to Payment' :
          activeApplication.status === 'pending_profile' ? 'Complete Application' :
          activeApplication.status === 'pending_signature' ? 'Sign Lease' : 'View Status';
        const stepText = activeApplication.status === 'pending_payment' ? 'Step 1 of 4: Pay holding deposit' :
          activeApplication.status === 'pending_profile' ? 'Step 2 of 4: Complete your application' :
          activeApplication.status === 'pending_signature' ? 'Step 3 of 4: Sign your lease' :
          activeApplication.status === 'pending_approval' || activeApplication.status === 'under_review' ? 'Step 4 of 4: Under review' : '';

        return (
        /* Compact application card */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#0f4c3a]/10 shadow-sm overflow-hidden"
        >
          {(() => {
            const steps = ['pending_payment', 'pending_profile', 'pending_signature', 'under_review', 'approved'];
            const statusKey = activeApplication.status === 'pending_approval' ? 'under_review' : activeApplication.status;
            const idx = steps.indexOf(statusKey);
            const STEP_ITEMS = [
              { label: "Pay", icon: CreditCard },
              { label: "Apply", icon: FileText },
              { label: "Sign", icon: FileText },
              { label: "Review", icon: Clock },
              { label: "Move in", icon: Home },
            ];
            const rent = unit.unit_pricing_rules?.[0]?.monthly_rent_cents;

            return (
              <>
                {/* Applied date + status */}
                {activeApplication.created_at && (
                  <div className="px-4 pt-3 pb-0 flex items-center justify-between">
                    <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase shrink-0 ${STATUS_CONFIG[activeApplication.status]?.bg} ${STATUS_CONFIG[activeApplication.status]?.color}`}>
                      {STATUS_CONFIG[activeApplication.status]?.label}
                    </span>
                    <span className="text-[8px] text-[#9ca3af]">Applied {new Date(activeApplication.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}

                {/* Top: thumbnail + info */}
                <div className="flex gap-3 p-4 pt-2 pb-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    {coverImage ? (
                      <img src={coverImage} alt={property.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#0f4c3a]/10" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm text-[#111827] truncate">{property.name}</h3>
                    <p className="text-[9px] text-[#6b7280]">{unit.unit_type?.replace(/_/g, ' ')}{unit.unit_number ? ` · Unit ${unit.unit_number}` : ''}{property.city ? ` · ${property.city}` : ''}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-[9px] text-[#9ca3af] flex-wrap">
                      <Calendar size={9} className="shrink-0" />
                      {activeApplication.move_in_date ? (
                        <span className="text-[#111827] font-medium">{new Date(activeApplication.move_in_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} → {new Date(activeApplication.move_out_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      ) : <span>Dates TBD</span>}
                      {rent && <span className="ml-auto text-xs font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{Math.round(rent / 100)}/mo</span>}
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="px-4 pb-3">
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
                            <div className={`flex-1 h-[2px] -mt-3.5 mx-0.5 ${isComplete ? 'bg-[#22C55E]' : 'bg-[#e5e7eb]'}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* CTA + info */}
                <div className="px-4 pb-4">
                  <button onClick={navigateToApp} className="w-full py-2.5 bg-[#0f4c3a] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0a3a2b] transition-colors">
                    {ctaLabel} <ArrowRight size={12} />
                  </button>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <button onClick={() => setShowWithdraw(true)} className="text-[10px] text-[#EA4335] font-semibold hover:underline">Withdraw application</button>
                    {totalActiveApps > 1 && (
                      <>
                        <span className="text-[#d1d5db]">·</span>
                        <button onClick={() => navigate('/profile/applications')} className="text-[10px] font-semibold text-[#0f4c3a] hover:underline">
                          View all ({totalActiveApps}) →
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </motion.div>
        );
      })()}

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdraw && activeApplication && (() => {
          const wUnit = activeApplication.units || {};
          const wProperty = wUnit.properties || {};
          const hasPaid = activeApplication.status !== 'pending_payment';

          const handleWithdraw = async () => {
            setWithdrawing(true);
            try {
              await supabase.from('applications').update({ status: 'withdrawn' }).eq('id', activeApplication.id);
              setActiveApplication(null);
              setShowWithdraw(false);
              toast.success('Application withdrawn');
            } catch (e) {
              toast.error('Failed to withdraw');
            } finally {
              setWithdrawing(false);
            }
          };

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
              onClick={() => !withdrawing && setShowWithdraw(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-12 rounded-full bg-[#EA4335]/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={24} className="text-[#EA4335]" />
                </div>
                <h3 className="text-lg font-serif text-[#111827] text-center mb-2">Withdraw application?</h3>
                <p className="text-[12px] text-[#6b7280] text-center mb-2">
                  You're about to withdraw your application for <span className="font-semibold text-[#111827]">{wProperty.name}</span>.
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
                    onClick={() => setShowWithdraw(false)}
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
                    {withdrawing ? <><Loader2 size={12} className="animate-spin" /> Withdrawing...</> : 'Withdraw'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* No Activity */}
      {!activeBooking && !activeApplication && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-[#e5e7eb] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-[#9ca3af]" />
          </div>
          <h3 className="font-serif text-xl text-[#111827] mb-2">Find Your New Home</h3>
          <p className="text-sm text-[#6b7280] mb-6 max-w-sm mx-auto">Browse furnished units across Germany. No credit checks, no paperwork stress.</p>
          <Link to="/search" className="inline-flex items-center gap-2 px-8 py-3 bg-[#0f4c3a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a3a2b] transition-colors">
            Browse Units <ArrowRight size={14} />
          </Link>
        </motion.div>
      )}

      {/* Upcoming Payment */}
      {nextPayment && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-[#e5e7eb] p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertCircle size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#111827]">Rent Due</p>
              <p className="text-xs text-[#6b7280]">{new Date(nextPayment.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-serif text-xl font-bold text-[#111827]">€{Math.round(nextPayment.amount_cents / 100)}</p>
            <Link to="/profile/payments" className="text-[10px] font-bold text-[#0f4c3a] uppercase tracking-widest hover:underline">Pay now →</Link>
          </div>
        </motion.div>
      )}

      {/* Popular Services */}
      {addons.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Popular Services</p>
            <Link to="/profile/services" className="text-[10px] font-bold uppercase tracking-widest text-[#0f4c3a] hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {pickFeaturedServices(addons).map(addon => (
              <ServiceQuickCard key={addon.id} addon={addon} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Addon Orders */}
      {addonOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Recent Service Orders</p>
            <Link to="/profile/services?view=orders" className="text-[10px] font-bold uppercase tracking-widest text-[#0f4c3a] hover:underline">View all →</Link>
          </div>
          <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden divide-y divide-[#e5e7eb]">
            {addonOrders.slice(0, 3).map(order => {
              const catalogue = order.addon_catalogue || {};
              const Icon = SERVICE_ICONS[catalogue.category] || Package;
              const total = Math.round((order.total_cents || 0) / 100);
              const statusStyle = ORDER_STYLES[order.status] || ORDER_STYLES.pending;
              return (
                <div key={order.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f2f2f2] flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-[#374151]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#111827] truncate">{catalogue.name || 'Service'}</p>
                    <p className="text-[10px] text-[#9ca3af]">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${statusStyle.bg} ${statusStyle.text}`}>
                      {statusStyle.label}
                    </span>
                    <p className="text-xs font-bold text-[#111827] mt-0.5 tabular-nums">{total === 0 ? 'Free' : `€${total}`}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Payments */}
      {recentPayments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Recent Payments</p>
            <Link to="/profile/payments" className="text-[10px] font-bold uppercase tracking-widest text-[#0f4c3a] hover:underline">View all →</Link>
          </div>
          <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden divide-y divide-[#e5e7eb]">
            {recentPayments.map(p => {
              const amount = Math.round((p.amount_cents || 0) / 100);
              const isSuccess = p.status === 'succeeded';
              const isPending = ['pending', 'processing'].includes(p.status);
              const isRefund = p.payment_type?.includes('refund');
              const typeLabel = PAYMENT_TYPE_LABELS[p.payment_type] || p.payment_type;
              const statusStyle = isSuccess ? { label: 'Paid', bg: 'bg-[#22C55E]/10', text: 'text-[#16a34a]', stripe: 'bg-[#22C55E]' }
                : isPending ? { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-500', stripe: 'bg-amber-400' }
                : isRefund ? { label: 'Refunded', bg: 'bg-purple-50', text: 'text-purple-500', stripe: 'bg-purple-400' }
                : { label: 'Failed', bg: 'bg-red-50', text: 'text-[#EA4335]', stripe: 'bg-[#EA4335]' };
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-1 h-8 rounded-full ${statusStyle.stripe} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-xs font-bold text-[#111827] truncate">{typeLabel}</p>
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#9ca3af]">
                      {new Date(p.paid_at || p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <p className={`text-sm font-bold tabular-nums lining-nums shrink-0 ${isRefund ? 'text-purple-500' : 'text-[#111827]'}`}>
                    {isRefund ? '+' : ''}€{amount.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions — compact, at bottom */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-2 px-1">Quick Actions</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <QuickAction icon={Search} label="Browse" to="/search" />
          <QuickAction icon={Heart} label="Saved" to="/profile/wishlist" badge={totalSaved || null} />
          <QuickAction icon={CreditCard} label="Payments" to="/profile/payments" />
          <QuickAction icon={ShoppingBag} label="Services" to="/profile/services" />
          <QuickAction icon={FileText} label="Documents" to="/profile/documents" />
          <QuickAction icon={HelpCircle} label="Help" to="/profile/help" />
        </div>
      </div>
    </div>
  );
};

const PAYMENT_TYPE_LABELS = {
  holding_deposit: 'Holding Deposit',
  security_deposit: 'Security Deposit',
  monthly_rent: 'Monthly Rent',
  addon: 'Add-on Service',
  deposit_refund: 'Deposit Refund',
  holding_deposit_refund: 'Deposit Refund',
};

// Featured services to highlight on dashboard — order matters
const FEATURED_NAMES = [
  'German SIM Card',
  'City Registration',
  'Health Insurance Setup',
  'Bank Account Opening',
  'Student Starter Package',
  'Azubi Starter Package',
];

function pickFeaturedServices(addons) {
  const featured = [];
  for (const name of FEATURED_NAMES) {
    const match = addons.find(a => a.name === name);
    if (match) featured.push(match);
    if (featured.length >= 4) break;
  }
  // Fallback: if fewer than 4 matched, fill with remaining
  if (featured.length < 4) {
    for (const a of addons) {
      if (!featured.includes(a)) featured.push(a);
      if (featured.length >= 4) break;
    }
  }
  return featured;
}

const SERVICE_ICONS = {
  connectivity: Smartphone, banking: Landmark, legal: Scale,
  insurance: ShieldCheck, career: GraduationCap, other: Package,
};

const ORDER_STYLES = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-500' },
  confirmed: { label: 'Confirmed', bg: 'bg-[#22C55E]/10', text: 'text-[#16a34a]' },
  delivered: { label: 'Delivered', bg: 'bg-[#22C55E]/10', text: 'text-[#16a34a]' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-[#EA4335]' },
};

const QuickAction = ({ icon: Icon, label, to, badge }) => (
  <Link to={to} className="bg-white rounded-xl px-3 py-3 border border-[#e5e7eb] hover:shadow-sm hover:border-[#0f4c3a]/15 transition-all group text-center relative">
    <div className="w-8 h-8 rounded-lg bg-[#f2f2f2] group-hover:bg-[#0f4c3a] group-hover:text-white flex items-center justify-center text-[#6b7280] transition-colors mx-auto mb-1.5">
      <Icon size={15} />
    </div>
    <p className="text-[10px] font-bold text-[#111827] uppercase tracking-wider">{label}</p>
    {badge && (
      <span className="absolute -top-1 -right-1 bg-[#EA4335] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{badge}</span>
    )}
  </Link>
);

const ServiceQuickCard = ({ addon }) => {
  const Icon = SERVICE_ICONS[addon.category] || Package;
  const price = addon.price_cents / 100;
  return (
    <Link to="/profile/services" className="bg-white rounded-xl p-3 border border-[#e5e7eb] hover:shadow-sm hover:border-[#0f4c3a]/15 transition-all group">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-[#f2f2f2] group-hover:bg-[#0f4c3a]/5 flex items-center justify-center shrink-0 transition-colors">
          <Icon size={13} className="text-[#374151]" />
        </div>
        <p className="text-[11px] font-bold text-[#111827] truncate">{addon.name}</p>
      </div>
      <p className="text-[10px] text-[#6b7280] line-clamp-1 mb-1.5">{addon.description}</p>
      <p className="text-xs font-bold text-[#0f4c3a] tabular-nums">{addon.price_cents === 0 ? 'Free' : `€${price}`}</p>
    </Link>
  );
};

export default Profile;
