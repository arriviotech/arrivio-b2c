import { supabase } from "../client";

export async function getAddonCatalogue() {
  const { data, error } = await supabase
    .from("addon_catalogue")
    .select("id, name, description, category, price_cents, display_order")
    .eq("is_active", true)
    .contains("available_for", ["b2c"])
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getMyAddonOrders(userId) {
  const { data, error } = await supabase
    .from("addon_orders")
    .select("id, quantity, unit_price_cents, total_cents, status, notes, delivered_at, created_at, addon_catalogue ( name, category )")
    .eq("ordered_by_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAddonOrder({ userId, addonId, quantity, unitPriceCents, notes, bookingId }) {
  const { data, error } = await supabase
    .from("addon_orders")
    .insert({
      ordered_by_id: userId,
      ordered_by_type: "tenant",
      addon_id: addonId,
      booking_id: bookingId || null,
      quantity,
      unit_price_cents: unitPriceCents,
      total_cents: unitPriceCents * quantity,
      notes: notes || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
