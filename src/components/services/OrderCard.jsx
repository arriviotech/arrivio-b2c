import React from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone, Landmark, Scale, ShieldCheck, GraduationCap,
  Car, Sofa, Sparkles, Shirt, Heart, Package,
  CheckCircle, Clock, Truck, XCircle
} from 'lucide-react';

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

const OrderCard = ({ order, index }) => {
  const catalogue = order.addon_catalogue || {};
  const Icon = CATEGORY_ICONS[catalogue.category] || Package;
  const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
  const StatusIcon = status.icon;
  const total = Math.round((order.total_cents || 0) / 100);
  const isFree = order.total_cents === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-4 px-4 py-3.5 hover:bg-[#f7f7f7] transition-colors"
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-[#f2f2f2] flex items-center justify-center shrink-0">
        <Icon size={16} className="text-[#374151]" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-bold text-[#111827] truncate">{catalogue.name || 'Service'}</p>
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

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-[#111827] tabular-nums lining-nums">
          {isFree ? 'Free' : `€${total.toLocaleString()}`}
        </p>
      </div>
    </motion.div>
  );
};

export default OrderCard;
