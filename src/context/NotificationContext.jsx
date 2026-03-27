import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead as markAsReadApi,
  markAllAsRead as markAllAsReadApi,
} from "../supabase/services/notifications.service";

const NotificationContext = createContext(null);

const POLL_INTERVAL = 30000;

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const [notifs, count] = await Promise.all([
        getMyNotifications(userId),
        getUnreadCount(userId),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  }, [userId]);

  // Fetch + poll when user changes
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const init = async () => {
      setLoading(true);
      await fetchNotifications();
      if (!cancelled) setLoading(false);
    };
    init();

    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(intervalRef.current);
      // Reset on cleanup (user logout or unmount)
      setNotifications([]);
      setUnreadCount(0);
    };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await markAsReadApi(notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    try {
      await markAllAsReadApi(userId);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }, [userId]);

  const value = {
    notifications: userId ? notifications : [],
    unreadCount: userId ? unreadCount : 0,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
