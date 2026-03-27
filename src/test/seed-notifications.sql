-- =============================================
-- SEED: Test Notifications
-- =============================================
-- Replace YOUR_USER_ID_HERE with your Supabase auth UUID
-- Run in Supabase SQL Editor after the notifications migration
-- =============================================

INSERT INTO notifications (profile_id, type, title, body, reference_type, reference_id, is_read, created_at) VALUES
  ('5bfbda87-452a-48e9-aa39-75154451935f', 'welcome',
   'Welcome to Arrivio!',
   'We are thrilled to have you. Explore our properties and find your perfect home in Germany.',
   NULL, NULL, FALSE, NOW() - INTERVAL '2 days'),

  ('5bfbda87-452a-48e9-aa39-75154451935f', 'document_verified',
   'Passport verified',
   'Your passport document has been reviewed and verified by our team. You are one step closer!',
   'document', NULL, FALSE, NOW() - INTERVAL '1 day'),

  ('5bfbda87-452a-48e9-aa39-75154451935f', 'payment_reminder',
   'Rent due soon',
   'Your monthly rent of €850 is due on March 27. Please make the payment to avoid late fees.',
   'payment', NULL, FALSE, NOW() - INTERVAL '6 hours'),

  ('5bfbda87-452a-48e9-aa39-75154451935f', 'application_approved',
   'Application approved!',
   'Great news! Your application for Arrivio Mitte Residence has been approved. Next step: sign your rental agreement.',
   'application', NULL, FALSE, NOW() - INTERVAL '3 hours'),

  ('5bfbda87-452a-48e9-aa39-75154451935f', 'ticket_replied',
   'Support replied to your ticket',
   'Our support team has responded to your maintenance request. Check the conversation for details.',
   'support_ticket', NULL, TRUE, NOW() - INTERVAL '5 days'),

  ('5bfbda87-452a-48e9-aa39-75154451935f', 'addon_confirmed',
   'SIM Card order confirmed',
   'Your German SIM Card order has been confirmed. It will be delivered to your unit on move-in day.',
   'addon_order', NULL, FALSE, NOW() - INTERVAL '1 hour'),

  ('5bfbda87-452a-48e9-aa39-75154451935f', 'admin_message',
   'Property maintenance notice',
   'Scheduled elevator maintenance on March 28, 10:00-14:00. Please use the stairs during this time.',
   NULL, NULL, FALSE, NOW() - INTERVAL '30 minutes');
