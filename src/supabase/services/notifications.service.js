import { supabase } from "../client";

export async function getMyNotifications(userId, limit = 30) {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, reference_type, reference_id, is_read, read_at, created_at")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getUnreadCount(userId) {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", userId)
    .eq("is_read", false);

  if (error) throw error;
  return count || 0;
}

export async function markAsRead(notificationId) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) throw error;
}

export async function markAllAsRead(userId) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("profile_id", userId)
    .eq("is_read", false);

  if (error) throw error;
}
