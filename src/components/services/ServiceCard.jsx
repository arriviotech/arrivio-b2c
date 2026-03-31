import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, Landmark, Scale, ShieldCheck, GraduationCap,
  Car, Sofa, Sparkles, Shirt, Heart, Package,
  Plus, Minus, Loader2
} from 'lucide-react';
import { createAddonOrder } from '../../supabase/services/addons.service';
import { useAuth } from '../../context/AuthContext';
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

const CATEGORY_COLORS = {
  connectivity: 'bg-blue-50 text-blue-600',
  banking: 'bg-emerald-50 text-emerald-600',
  legal: 'bg-purple-50 text-purple-600',
  insurance: 'bg-amber-50 text-amber-600',
  career: 'bg-[#0f4c3a]/5 text-[#0f4c3a]',
  transport: 'bg-orange-50 text-orange-600',
  furniture: 'bg-rose-50 text-rose-600',
  cleaning: 'bg-cyan-50 text-cyan-600',
  laundry: 'bg-indigo-50 text-indigo-600',
  wellness: 'bg-pink-50 text-pink-600',
  other: 'bg-[#f2f2f2] text-[#374151]',
};

const ServiceCard = ({ addon, index, onOrderComplete }) => {
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const Icon = CATEGORY_ICONS[addon.category] || Package;
  const colorClass = CATEGORY_COLORS[addon.category] || CATEGORY_COLORS.other;
  const price = addon.price_cents / 100;
  const isFree = addon.price_cents === 0;

  const handleOrder = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await createAddonOrder({
        userId: user.id,
        addonId: addon.id,
        quantity,
        unitPriceCents: addon.price_cents,
        notes: notes.trim() || null,
      });
      toast.success(`${addon.name} requested!`);
      setShowConfirm(false);
      setQuantity(1);
      setNotes('');
      onOrderComplete?.();
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden hover:shadow-sm transition-shadow"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
            <Icon size={20} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af]">
            {addon.category}
          </span>
        </div>

        {/* Info */}
        <h3 className="text-sm font-bold text-[#111827] mb-1">{addon.name}</h3>
        <p className="text-xs text-[#6b7280] leading-relaxed mb-4 line-clamp-2">{addon.description}</p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            {isFree ? (
              <span className="text-sm font-bold text-[#22C55E]">Free</span>
            ) : (
              <span className="text-sm font-bold text-[#111827] tabular-nums lining-nums">
                €{price.toLocaleString('de-DE', { minimumFractionDigits: price % 1 === 0 ? 0 : 2 })}
              </span>
            )}
          </div>
          {!showConfirm && (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 bg-[#0f4c3a] hover:bg-[#0a3a2b] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              Request
            </button>
          )}
        </div>
      </div>

      {/* Inline Confirmation */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-[#e5e7eb]">
              {/* Quantity */}
              {!isFree && (
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#374151] font-medium">Quantity</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-lg border border-[#e5e7eb] flex items-center justify-center text-[#374151] hover:bg-[#f2f2f2] transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold text-[#111827] w-6 text-center tabular-nums">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(10, q + 1))}
                      className="w-7 h-7 rounded-lg border border-[#e5e7eb] flex items-center justify-center text-[#374151] hover:bg-[#f2f2f2] transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special requests? (optional)"
                rows={2}
                className="w-full px-3 py-2 text-xs text-[#111827] bg-[#f7f7f7] border border-[#e5e7eb] rounded-xl resize-none focus:outline-none focus:border-[#0f4c3a]/30 transition-colors mb-3"
              />

              {/* Total + Actions */}
              {!isFree && quantity > 1 && (
                <p className="text-xs text-[#374151] mb-3">
                  Total: <span className="font-bold tabular-nums">€{((addon.price_cents * quantity) / 100).toLocaleString('de-DE')}</span>
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowConfirm(false); setQuantity(1); setNotes(''); }}
                  className="flex-1 py-2 bg-white border border-[#e5e7eb] rounded-lg text-[10px] font-bold uppercase tracking-widest text-[#374151] hover:bg-[#f7f7f7] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOrder}
                  disabled={submitting}
                  className="flex-1 py-2 bg-[#0f4c3a] hover:bg-[#0a3a2b] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {submitting ? <Loader2 size={12} className="animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ServiceCard;
