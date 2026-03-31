-- =============================================
-- CLEANUP: Find & remove duplicate bookings and applications
-- =============================================
-- STEP 1: Run the SELECT queries first to see what's duplicated
-- STEP 2: Once confirmed, run the DELETE queries
-- =============================================

-- ════════════════════════════════════════
-- STEP 1: IDENTIFY DUPLICATES (run these first)
-- ════════════════════════════════════════

-- Duplicate bookings (same user + unit + dates)
SELECT id, profile_id, unit_id, status, move_in_date, move_out_date, monthly_rent_cents, created_at
FROM bookings
WHERE profile_id = '5bfbda87-452a-48e9-aa39-75154451935f'
ORDER BY unit_id, created_at;

-- Duplicate applications (same user + unit + dates)
SELECT id, profile_id, unit_id, status, move_in_date, move_out_date, tenant_type, created_at
FROM applications
WHERE profile_id = '5bfbda87-452a-48e9-aa39-75154451935f'
ORDER BY unit_id, created_at;

-- ════════════════════════════════════════
-- STEP 2: REMOVE DUPLICATES (keep oldest, delete newer copies)
-- ════════════════════════════════════════
-- Uncomment and run after verifying Step 1

-- Delete duplicate bookings (keeps the first created, deletes later copies)
/*
DELETE FROM bookings
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY profile_id, unit_id, move_in_date, move_out_date
        ORDER BY created_at ASC
      ) AS rn
    FROM bookings
    WHERE profile_id = '5bfbda87-452a-48e9-aa39-75154451935f'
  ) dupes
  WHERE rn > 1
);
*/

-- Delete duplicate applications (keeps the first created, deletes later copies)
/*
DELETE FROM applications
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY profile_id, unit_id, move_in_date, move_out_date
        ORDER BY created_at ASC
      ) AS rn
    FROM applications
    WHERE profile_id = '5bfbda87-452a-48e9-aa39-75154451935f'
  ) dupes
  WHERE rn > 1
);
*/

-- Delete orphaned payments (payments referencing deleted bookings)
/*
DELETE FROM payments
WHERE reference_type = 'booking'
  AND reference_id NOT IN (SELECT id FROM bookings);
*/

-- Delete orphaned monthly_rent_statements
/*
DELETE FROM monthly_rent_statements
WHERE booking_id NOT IN (SELECT id FROM bookings);
*/
