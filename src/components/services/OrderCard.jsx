import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, Landmark, Scale, ShieldCheck, GraduationCap,
  Car, Sofa, Sparkles, Shirt, Heart, Package,
  CheckCircle, Clock, Truck, XCircle, X, Loader2, AlertCircle
} from 'lucide-react';
import { supabase } from '../../supabase/client';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  connectivity: Smartphone,
  banking: Landmark,
  legal: Scale,
  insurance: ShieldCheck,
  career: GraduationCap,
  transport: Car,
  furniture: Sofa,
  cleaning: Sparkles,
  laundry: Shirt,
  wellness: Heart,
  other: Package,
};

const ORDER_STATUS = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-500', icon: Clock },
  confirmed: { label: 'Confirmed', bg: 'bg-[#22C55E]/10', text: 'text-[#16a34a]', icon: CheckCircle },
  delivered: { label: 'Delivered', bg: 'bg-[#22C55E]/10', text: 'text-[#16a34a]', icon: Truck },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-[#EA4335]', icon: XCircle },
};

const OrderCard = ({ order, index, onCancel }) => {
  const catalogue = order.addon_catalogue || {};
  const Icon = CATEGORY_ICONS[catalogue.category] || Package;
  const total = Math.round((order.total_cents || 0) / 100);
  const isFree = order.total_cents === 0;

  const [localStatus, setLocalStatus] = useState(order.status);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const canCancel = ['pending', 'confirmed'].includes(localStatus);
  const status = ORDER_STATUS[localStatus] || ORDER_STATUS.pending;
  const StatusIcon = status.icon;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data, error } = await supabase
        .from('addon_orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id)
        .select('id, status')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Update returned no data — possible RLS restriction');

      // Update local state immediately
      setLocalStatus('cancelled');
      toast.success(`${catalogue.name || 'Order'} cancelled`);
      setShowCancel(false);
      if (onCancel) onCancel(order.id);
    } catch (e) {
      console.error('Cancel order error:', e);
      toast.error(e.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className={`flex items-center gap-4 px-4 py-3.5 transition-colors group ${localStatus === 'cancelled' ? 'opacity-50' : 'hover:bg-[#f7f7f7]'}`}
      >
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl bg-[#f2f2f2] flex items-center justify-center shrink-0">
          <Icon size={16} className="text-[#374151]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className={`text-sm font-bold truncate ${localStatus === 'cancelled' ? 'text-[#9ca3af] line-through' : 'text-[#111827]'}`}>{catalogue.name || 'Service'}</p>
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${status.bg} ${status.text}`}>
              <StatusIcon size={9} /> {status.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#9ca3af]">
            <span>{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            {order.quantity > 1 && (
              <>
                <span>·</span>
                <span>Qty: {order.quantity}</span>
              </>
            )}
            {order.delivered_at && (
              <>
                <span>·</span>
                <span className="text-[#16a34a]">Delivered {new Date(order.delivered_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
              </>
            )}
          </div>
        </div>

        {/* Amount + Cancel */}
        <div className="flex items-center gap-3 shrink-0">
          <p className={`text-sm font-bold tabular-nums lining-nums ${localStatus === 'cancelled' ? 'text-[#9ca3af]' : 'text-[#111827]'}`}>
            {isFree ? 'Free' : `€${total.toLocaleString()}`}
          </p>
          {canCancel && (
            <button
              onClick={() => setShowCancel(true)}
              className="md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-lg text-[#9ca3af] hover:text-[#EA4335] hover:bg-[#EA4335]/5 transition-all"
              title="Cancel order"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Cancel Modal — portaled to body to escape framer-motion transform clipping */}
      {createPortal(
        <AnimatePresence>
          {showCancel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
              onClick={() => !cancelling && setShowCancel(false)}
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
                <h3 className="text-lg font-serif text-[#111827] text-center mb-2">Cancel order?</h3>
                <p className="text-[12px] text-[#6b7280] text-center mb-1">
                  You're about to cancel your order for <span className="font-semibold text-[#111827]">{catalogue.name}</span>.
                </p>
                {!isFree && (
                  <p className="text-[11px] text-[#9ca3af] text-center mb-4">
                    {order.status === 'confirmed'
                      ? 'Your refund will be processed within 5-7 business days.'
                      : 'No payment has been charged yet.'}
                  </p>
                )}
                {isFree && (
                  <p className="text-[11px] text-[#9ca3af] text-center mb-4">This was a free service. You can re-order anytime.</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancel(false)}
                    disabled={cancelling}
                    className="flex-1 py-2.5 bg-[#f2f2f2] text-[#4b5563] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#e5e5e5] transition-colors"
                  >
                    Keep it
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex-1 py-2.5 bg-[#EA4335] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#d63a2e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {cancelling ? <><Loader2 size={12} className="animate-spin" /> Cancelling...</> : 'Cancel Order'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default OrderCard;
