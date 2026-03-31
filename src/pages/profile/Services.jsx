import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, ShoppingBag } from 'lucide-react';
import { useAddonCatalogue, useMyAddonOrders } from '../../supabase/hooks/useAddons';
import ServiceCard from '../../components/services/ServiceCard';
import OrderCard from '../../components/services/OrderCard';
import ServicesSkeleton from '../../components/skeletons/ServicesSkeleton';

const CATEGORY_TABS = [
  { key: 'all', label: 'All' },
  { key: 'connectivity', label: 'Connectivity' },
  { key: 'banking', label: 'Banking' },
  { key: 'legal', label: 'Legal' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'career', label: 'Career' },
  { key: 'other', label: 'More' },
];

const ITEMS_PER_PAGE = 6;

const Services = () => {
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') === 'orders' ? 'orders' : 'browse';

  const { addons, loading: catalogueLoading } = useAddonCatalogue();
  const { orders, loading: ordersLoading, refetch: refetchOrders } = useMyAddonOrders();
  const [view, setView] = useState(initialView);
  const [category, setCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [orderFilter, setOrderFilter] = useState('active');

  const filtered = category === 'all'
    ? addons
    : addons.filter(a => a.category === category);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const visibleServices = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when category changes
  const handleCategoryChange = (key) => {
    setCategory(key);
    setCurrentPage(1);
  };

  if (catalogueLoading) {
    return <ServicesSkeleton />;
  }

  return (
    <div>
      <h2 className="text-xl font-serif text-[#111827] mb-1">Services</h2>
      <p className="text-xs text-[#6b7280] mb-5">Everything you need to settle into life in Germany</p>

      {/* Main Tabs: Browse / My Orders */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setView('browse')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${
            view === 'browse'
              ? 'bg-[#0f4c3a] text-white'
              : 'bg-white border border-[#e5e7eb] text-[#374151] hover:border-[#0f4c3a]/30'
          }`}
        >
          Browse Services
        </button>
        <button
          onClick={() => setView('orders')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors relative ${
            view === 'orders'
              ? 'bg-[#0f4c3a] text-white'
              : 'bg-white border border-[#e5e7eb] text-[#374151] hover:border-[#0f4c3a]/30'
          }`}
        >
          My Orders
          {orders.length > 0 && view !== 'orders' && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#EA4335] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {orders.length}
            </span>
          )}
        </button>
      </div>

      {/* ── BROWSE VIEW ── */}
      {view === 'browse' && (
        <>
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
            {CATEGORY_TABS.map(tab => {
              const count = tab.key === 'all' ? addons.length : addons.filter(a => a.category === tab.key).length;
              if (tab.key !== 'all' && count === 0) return null;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleCategoryChange(tab.key)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                    category === tab.key
                      ? 'bg-[#111827] text-white'
                      : 'bg-white border border-[#e5e7eb] text-[#374151] hover:border-[#0f4c3a]/30'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Service Grid — paginated */}
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-[#9ca3af]">No services in this category</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleServices.map((addon, i) => (
                  <ServiceCard key={addon.id} addon={addon} index={i} onOrderComplete={() => { refetchOrders(); setView('orders'); }} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-5">
                  <p className="text-[11px] text-[#9ca3af]">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} services
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
            </>
          )}
        </>
      )}

      {/* ── ORDERS VIEW ── */}
      {view === 'orders' && (() => {
        const activeOrders = orders.filter(o => ['pending', 'confirmed'].includes(o.status));
        const deliveredOrders = orders.filter(o => o.status === 'delivered');
        const cancelledOrders = orders.filter(o => o.status === 'cancelled');

        const ORDER_FILTERS = [
          { key: 'active', label: 'Active', count: activeOrders.length },
          { key: 'delivered', label: 'Delivered', count: deliveredOrders.length },
          { key: 'cancelled', label: 'Cancelled', count: cancelledOrders.length },
        ];

        const filteredOrders =
          orderFilter === 'active' ? activeOrders :
          orderFilter === 'delivered' ? deliveredOrders :
          orderFilter === 'cancelled' ? cancelledOrders :
          activeOrders;

        return (
          <>
            {/* Filter Pills */}
            {orders.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
                {ORDER_FILTERS.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setOrderFilter(f.key)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                      orderFilter === f.key
                        ? 'bg-[#111827] text-white'
                        : 'bg-white border border-[#e5e7eb] text-[#374151] hover:border-[#0f4c3a]/30'
                    }`}
                  >
                    {f.label}{f.count > 0 ? ` (${f.count})` : ''}
                  </button>
                ))}
              </div>
            )}

            {ordersLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={24} className="animate-spin text-[#9ca3af]" />
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden divide-y divide-[#e5e7eb]">
                {filteredOrders.map((order, i) => (
                  <OrderCard key={order.id} order={order} index={i} onCancel={() => refetchOrders()} />
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 text-center">
                <p className="text-sm text-[#9ca3af]">No {orderFilter} orders</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag size={22} className="text-[#9ca3af]" />
                </div>
                <p className="text-sm font-bold text-[#111827] mb-1">No orders yet</p>
                <p className="text-xs text-[#6b7280] mb-4">Browse our services and request what you need.</p>
                <button
                  onClick={() => setView('browse')}
                  className="px-5 py-2.5 bg-[#0f4c3a] hover:bg-[#0a3a2b] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  Browse Services
                </button>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
};

export default Services;
