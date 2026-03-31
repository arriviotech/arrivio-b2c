import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCircle, AlertCircle, FileText, CreditCard,
  MessageSquare, Package, UserCheck, XCircle, Clock,
  Truck, Shield, CheckCheck
} from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

const TYPE_ICONS = {
  welcome: { icon: Bell, color: "text-[#0f4c3a]", bg: "bg-[#0f4c3a]/5" },
  application_submitted: { icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
  application_approved: { icon: CheckCircle, color: "text-[#16a34a]", bg: "bg-[#22C55E]/10" },
  application_rejected: { icon: XCircle, color: "text-[#EA4335]", bg: "bg-red-50" },
  document_verified: { icon: Shield, color: "text-[#16a34a]", bg: "bg-[#22C55E]/10" },
  document_rejected: { icon: AlertCircle, color: "text-[#EA4335]", bg: "bg-red-50" },
  booking_confirmed: { icon: CheckCircle, color: "text-[#16a34a]", bg: "bg-[#22C55E]/10" },
  booking_cancelled: { icon: XCircle, color: "text-[#EA4335]", bg: "bg-red-50" },
  payment_received: { icon: CreditCard, color: "text-[#16a34a]", bg: "bg-[#22C55E]/10" },
  payment_reminder: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
  payment_failed: { icon: AlertCircle, color: "text-[#EA4335]", bg: "bg-red-50" },
  ticket_replied: { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50" },
  ticket_resolved: { icon: CheckCircle, color: "text-[#16a34a]", bg: "bg-[#22C55E]/10" },
  addon_confirmed: { icon: Package, color: "text-[#0f4c3a]", bg: "bg-[#0f4c3a]/5" },
  addon_delivered: { icon: Truck, color: "text-[#16a34a]", bg: "bg-[#22C55E]/10" },
  admin_message: { icon: UserCheck, color: "text-[#0f4c3a]", bg: "bg-[#0f4c3a]/5" },
};

const REFERENCE_ROUTES = {
  application: "/profile/bookings",
  booking: (id) => `/profile/bookings/${id}`,
  payment: "/profile/payments",
  support_ticket: "/profile/help",
  addon_order: "/profile/services",
  document: "/profile/documents",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const handleClick = async (notif) => {
    if (!notif.is_read) await markAsRead(notif.id);

    // Navigate based on reference_type
    if (notif.reference_type) {
      const route = REFERENCE_ROUTES[notif.reference_type];
      if (typeof route === "function") {
        navigate(route(notif.reference_id));
      } else if (route) {
        navigate(route);
      }
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-[#e5e7eb] shadow-xl overflow-hidden z-[100]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e5e7eb]">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-[#111827]">Notifications</p>
              {unreadCount > 0 && (
                <span className="bg-[#EA4335] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-bold uppercase tracking-widest text-[#0f4c3a] hover:underline flex items-center gap-1"
              >
                <CheckCheck size={11} /> Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                const typeStyle = TYPE_ICONS[notif.type] || TYPE_ICONS.admin_message;
                const Icon = typeStyle.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors hover:bg-[#f7f7f7] border-b border-[#e5e7eb] last:border-b-0 ${
                      !notif.is_read ? "bg-[#0f4c3a]/[0.02]" : ""
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="pt-1.5 shrink-0 w-2">
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-[#0f4c3a]" />
                      )}
                    </div>

                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg ${typeStyle.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={14} className={typeStyle.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-tight ${!notif.is_read ? "font-bold text-[#111827]" : "font-medium text-[#374151]"}`}>
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-[#6b7280] mt-0.5 line-clamp-2 leading-relaxed">{notif.body}</p>
                      <p className="text-[10px] text-[#9ca3af] mt-1">{timeAgo(notif.created_at)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center mx-auto mb-3">
                  <Bell size={20} className="text-[#9ca3af]" />
                </div>
                <p className="text-sm font-bold text-[#111827] mb-0.5">You're all caught up!</p>
                <p className="text-xs text-[#9ca3af]">No notifications at the moment</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
