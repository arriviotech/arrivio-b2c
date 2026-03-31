-- =============================================
-- SEED TEST DATA: Booking + Payments
-- =============================================
-- HOW TO USE:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Replace YOUR_USER_ID_HERE with your actual auth user ID
--    (Find it: Supabase → Authentication → Users → click your user → copy UUID)
-- 3. Run this script
-- 4. Visit any property detail page where you now have a booking
-- =============================================

DO $$
DECLARE
  v_user_id       UUID := '5bfbda87-452a-48e9-aa39-75154451935f';  -- <-- REPLACE THIS
  v_property_id   UUID;
  v_unit_id       UUID;
  v_application_id UUID := gen_random_uuid();
  v_booking_id    UUID := gen_random_uuid();
  v_now           TIMESTAMPTZ := NOW();
BEGIN

  -- Pick the first available unit
  SELECT u.id, u.property_id
    INTO v_unit_id, v_property_id
    FROM units u
    JOIN properties p ON p.id = u.property_id
   WHERE u.status = 'available'
     AND p.status = 'active'
   LIMIT 1;

  IF v_unit_id IS NULL THEN
    RAISE EXCEPTION 'No available unit found. Make sure seed properties exist.';
  END IF;

  RAISE NOTICE 'Using property: %, unit: %', v_property_id, v_unit_id;

  -- 0. Create an application (required FK for bookings)
  INSERT INTO applications (id, profile_id, unit_id, tenant_type, move_in_date, move_out_date, status, created_at, updated_at)
  VALUES (
    v_application_id,
    v_user_id,
    v_unit_id,
    'professional',
    (v_now - INTERVAL '2 months')::DATE,
    (v_now + INTERVAL '10 months')::DATE,
    'approved',
    v_now - INTERVAL '3 months',
    v_now - INTERVAL '2 months'
  );

  -- 1. Create a booking
  INSERT INTO bookings (id, application_id, unit_id, profile_id, status, move_in_date, move_out_date, monthly_rent_cents, security_deposit_cents, holding_deposit_cents, created_at, updated_at)
  VALUES (
    v_booking_id,
    v_application_id,
    v_unit_id,
    v_user_id,
    'active',
    (v_now - INTERVAL '2 months')::DATE,
    (v_now + INTERVAL '10 months')::DATE,
    85000,   -- 850.00 EUR
    170000,  -- 1700.00 EUR
    25000,   -- 250.00 EUR
    v_now - INTERVAL '2 months',
    v_now
  );

  -- 2. Insert payments

  -- Holding deposit (paid)
  INSERT INTO payments (id, payer_id, payment_type, reference_type, reference_id, amount_cents, currency, status, description, paid_at, created_at)
  VALUES (
    gen_random_uuid(), v_user_id, 'holding_deposit', 'booking', v_booking_id,
    25000, 'EUR', 'succeeded', 'Holding deposit', v_now - INTERVAL '2 months', v_now - INTERVAL '2 months'
  );

  -- Security deposit (paid)
  INSERT INTO payments (id, payer_id, payment_type, reference_type, reference_id, amount_cents, currency, status, description, paid_at, created_at)
  VALUES (
    gen_random_uuid(), v_user_id, 'security_deposit', 'booking', v_booking_id,
    170000, 'EUR', 'succeeded', 'Security deposit (2x monthly rent)', v_now - INTERVAL '2 months', v_now - INTERVAL '2 months'
  );

  -- Month 1 rent (paid)
  INSERT INTO payments (id, payer_id, payment_type, reference_type, reference_id, amount_cents, currency, status, description, paid_at, created_at)
  VALUES (
    gen_random_uuid(), v_user_id, 'monthly_rent', 'booking', v_booking_id,
    85000, 'EUR', 'succeeded', 'Monthly rent - Month 1', v_now - INTERVAL '2 months', v_now - INTERVAL '2 months'
  );

  -- Month 2 rent (paid)
  INSERT INTO payments (id, payer_id, payment_type, reference_type, reference_id, amount_cents, currency, status, description, paid_at, created_at)
  VALUES (
    gen_random_uuid(), v_user_id, 'monthly_rent', 'booking', v_booking_id,
    85000, 'EUR', 'succeeded', 'Monthly rent - Month 2', v_now - INTERVAL '1 month', v_now - INTERVAL '1 month'
  );

  -- Month 3 rent (pending - current month)
  INSERT INTO payments (id, payer_id, payment_type, reference_type, reference_id, amount_cents, currency, status, description, created_at)
  VALUES (
    gen_random_uuid(), v_user_id, 'monthly_rent', 'booking', v_booking_id,
    85000, 'EUR', 'pending', 'Monthly rent - Month 3', v_now
  );

  -- 3. Insert monthly rent statements

  -- Month 1 (paid)
  INSERT INTO monthly_rent_statements (id, booking_id, profile_id, period_year, period_month, amount_cents, status, due_date, paid_at, generated_by, created_at)
  VALUES (
    gen_random_uuid(), v_booking_id, v_user_id,
    EXTRACT(YEAR FROM v_now - INTERVAL '2 months')::INT,
    EXTRACT(MONTH FROM v_now - INTERVAL '2 months')::INT,
    85000, 'paid',
    (v_now - INTERVAL '2 months')::DATE,
    v_now - INTERVAL '45 days',
    'manual', v_now - INTERVAL '2 months'
  );

  -- Month 2 (paid)
  INSERT INTO monthly_rent_statements (id, booking_id, profile_id, period_year, period_month, amount_cents, status, due_date, paid_at, generated_by, created_at)
  VALUES (
    gen_random_uuid(), v_booking_id, v_user_id,
    EXTRACT(YEAR FROM v_now - INTERVAL '1 month')::INT,
    EXTRACT(MONTH FROM v_now - INTERVAL '1 month')::INT,
    85000, 'paid',
    (v_now - INTERVAL '1 month')::DATE,
    v_now - INTERVAL '15 days',
    'manual', v_now - INTERVAL '1 month'
  );

  -- Month 3 (unpaid - current month, this triggers "Next Due")
  INSERT INTO monthly_rent_statements (id, booking_id, profile_id, period_year, period_month, amount_cents, status, due_date, generated_by, created_at)
  VALUES (
    gen_random_uuid(), v_booking_id, v_user_id,
    EXTRACT(YEAR FROM v_now)::INT,
    EXTRACT(MONTH FROM v_now)::INT,
    85000, 'unpaid',
    (DATE_TRUNC('month', v_now) + INTERVAL '4 days')::DATE,
    'manual', v_now
  );

  RAISE NOTICE 'Done! Booking ID: %. Visit the property page to see the payment card.', v_booking_id;

END $$;
