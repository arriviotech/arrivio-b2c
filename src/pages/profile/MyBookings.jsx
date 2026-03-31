import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Home, ArrowRight, Loader2, Search } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../context/AuthContext';
import OptimizedImage from '../../components/common/OptimizedImage';
import { THUMBNAIL_SIZES } from '../../utils/imageUtils';

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
  confirmed: { label: 'Confirmed', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
  completed: { label: 'Completed', color: 'text-[#6b7280]', bg: 'bg-[#f2f2f2]' },
  cancelled: { label: 'Cancelled', color: 'text-[#6b7280]', bg: 'bg-[#f2f2f2]' },
};

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from('bookings')
          .select(`id, status, move_in_date, move_out_date, monthly_rent_cents, created_at,
            units!unit_id ( id, unit_number, unit_type,
              properties ( id, name, slug, city, property_photos ( storage_path, is_primary, display_order ) ) )`)
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false });
        setBookings(data || []);
      } catch (e) {
        console.error('Fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-[#9ca3af]" /></div>;
  }

  const active = bookings.filter(b => ['active', 'confirmed'].includes(b.status));
  const past = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  const filtered = filter === 'active' ? active :
    filter === 'past' ? past : active;

  const FILTERS = [
    { key: 'active', label: 'Active', count: active.length },
    { key: 'past', label: 'Past', count: past.length },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-serif text-[#111827] mb-1">My Bookings</h1>
        <p className="text-sm text-[#6b7280]">Your confirmed stays and rental history</p>
      </div>

      {/* Filter pills */}
      {bookings.length > 0 && (
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

      {bookings.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center mx-auto mb-4">
            <Home size={24} className="text-[#9ca3af]" />
          </div>
          <h3 className="font-serif text-lg text-[#111827] mb-2">No bookings yet</h3>
          <p className="text-xs text-[#6b7280] mb-5 max-w-xs mx-auto">Your confirmed stays will appear here once your application is approved. Start by browsing our available apartments.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate('/search')} className="px-6 py-3 bg-[#0f4c3a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a3a2b] transition-colors inline-flex items-center gap-2">
              Browse Stays <ArrowRight size={12} />
            </button>
            <button onClick={() => navigate('/profile/applications')} className="px-5 py-3 bg-white border border-[#e5e7eb] text-[#4b5563] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#f9f9f7] transition-colors">
              View Applications
            </button>
          </div>
        </div>
      )}

      {filtered.length > 0 && (() => {
        const ITEMS_PER_PAGE = 5;
        const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        const paginatedBookings = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

        return (
        <div>
          <div className="space-y-3">
            {paginatedBookings.map(b => {
              const unit = b.units || {};
              const property = unit.properties || {};
              const photos = (property.property_photos || []).sort((a, b2) => a.display_order - b2.display_order);
              const coverImage = photos.find(p => p.is_primary)?.storage_path || photos[0]?.storage_path;
              const statusConfig = STATUS_CONFIG[b.status] || {};

              const isActive = ['active', 'confirmed'].includes(b.status);
              return (
                <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isActive ? 'border-[#22C55E]/15' : 'border-[#e5e7eb] opacity-60'}`}
                >
                  <div className="flex gap-3 p-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#f2f2f2]">
                      {coverImage && <OptimizedImage src={coverImage} alt={property.name} width={80} sizes={THUMBNAIL_SIZES} className="w-full h-full" imgClassName="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif text-sm text-[#111827] truncate">{property.name}</h3>
                        <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>{statusConfig.label}</span>
                      </div>
                      <p className="text-[9px] text-[#6b7280]">{unit.unit_type?.replace(/_/g, ' ')}{unit.unit_number ? ` · Unit ${unit.unit_number}` : ''}{property.city ? ` · ${property.city}` : ''}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1 text-[9px] text-[#9ca3af]">
                          <Calendar size={9} />
                          <span className="text-[#111827] font-medium">
                            {new Date(b.move_in_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} → {new Date(b.move_out_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#111827]" style={{ fontVariantNumeric: 'lining-nums' }}>€{Math.round(b.monthly_rent_cents / 100)}/mo</span>
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <div className="px-4 pb-3 flex gap-2">
                      <Link to={`/profile/bookings/${b.id}`} className="flex-1 py-2.5 bg-[#f2f2f2] hover:bg-[#e5e5e5] rounded-xl text-[10px] font-bold uppercase tracking-widest text-center text-[#374151] transition-colors">View Booking</Link>
                      <Link to="/profile/payments" className="flex-1 py-2.5 bg-[#0f4c3a] hover:bg-[#0a3a2b] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest text-center transition-colors">Pay Rent</Link>
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
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} bookings
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
      {bookings.length > 0 && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 text-center">
          <p className="text-sm text-[#6b7280]">No bookings match this filter</p>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
