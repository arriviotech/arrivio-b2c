import { supabase } from "../client";

export async function createTicket({ userId, category, subject, message, priority = "medium", bookingId = null }) {
  // 1. Insert the ticket
  const { data: ticket, error: ticketErr } = await supabase
    .from("support_tickets")
    .insert({
      profile_id: userId,
      category,
      subject,
      priority,
      booking_id: bookingId,
    })
    .select("id")
    .single();

  if (ticketErr) throw ticketErr;

  // 2. Insert the initial message
  const { error: msgErr } = await supabase
    .from("support_ticket_messages")
    .insert({
      ticket_id: ticket.id,
      sender_type: "tenant",
      sender_profile_id: userId,
      message,
    });

  if (msgErr) throw msgErr;

  return ticket;
}

export async function getMyTickets(userId) {
  const { data, error } = await supabase
    .from("support_tickets")
    .select("id, category, subject, priority, status, resolved_at, created_at, updated_at")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTicketMessages(ticketId) {
  const { data, error } = await supabase
    .from("support_ticket_messages")
    .select("id, sender_type, message, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addMessage({ ticketId, userId, message }) {
  const { data, error } = await supabase
    .from("support_ticket_messages")
    .insert({
      ticket_id: ticketId,
      sender_type: "tenant",
      sender_profile_id: userId,
      message,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
