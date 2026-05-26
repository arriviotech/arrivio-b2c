import { supabase } from "../client";
import { unitTypeLabel } from "../../utils/unitTypes";

// Units have BOTH a UUID `id` and an optional `slug` column (added in migration 11).
// The backfill set slugs on units that existed at that point, but NEW units inserted
// without an explicit slug have NULL — those navigate via UUID instead.
// So callers may pass either a UUID (new units) or a slug (older backfilled units).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (v) => typeof v === "string" && UUID_RE.test(v);

export async function getUnit(idOrSlug) {
  const column = isUUID(idOrSlug) ? "id" : "slug";
  const { data, error } = await supabase
    .from("units")
    .select(`
      *,
      properties (
        id,
        name,
        slug,
        description,
        address_line1,
        address_line2,
        city,
        postal_code,
        district,
        latitude,
        longitude,
        property_type,
        available_for,
        house_rules,
        manager_name,
        manager_phone,
        manager_email,
        status,
        property_photos (
          id,
          storage_path,
          alt_text,
          caption,
          is_primary,
          display_order,
          unit_id
        )
      ),
      unit_pricing_rules (
        tenant_type,
        monthly_rent_cents,
        security_deposit_cents,
        holding_deposit_cents,
        min_stay_months,
        max_stay_months,
        discount_pct
      ),
      unit_amenities (
        amenity_catalogue (
          name,
          icon_key,
          category
        )
      ),
      unit_availability (
        id,
        date,
        status
      )
    `)
    .eq(column, idOrSlug)
    .single();

  if (error) {
    console.error(`Error fetching unit by ${column}:`, error);
    throw error;
  }

  return normalizeUnit(data);
}

// Back-compat aliases — keep old names working for any imports we haven't touched yet.
export const getUnitById = getUnit;
export const getUnitBySlug = getUnit;

function normalizeUnit(data) {
  const property = data.properties || {};
  const allPhotos = property.property_photos || [];

  // Unit-specific photos (where unit_id matches)
  const unitPhotos = allPhotos
    .filter((p) => p.unit_id === data.id)
    .sort((a, b) => a.display_order - b.display_order);

  // Property-level photos (no unit_id or is_primary)
  const propertyPhotos = allPhotos
    .filter((p) => !p.unit_id || p.is_primary)
    .sort((a, b) => a.display_order - b.display_order);

  // Combine: unit photos first, then property photos as fallback
  const photos = unitPhotos.length > 0
    ? unitPhotos
    : propertyPhotos;

  const gallery = photos.map((p) => p.storage_path).filter(Boolean);
  const coverImage = gallery[0] || null;

  // Pricing (sorted cheapest first, excluding b2b)
  const pricingRules = (data.unit_pricing_rules || [])
    .filter((p) => p.tenant_type !== "b2b")
    .sort((a, b) => a.monthly_rent_cents - b.monthly_rent_cents);
  const cheapest = pricingRules[0];

  // Amenities grouped by category
  const amenities = {};
  const seen = new Set();
  (data.unit_amenities || []).forEach((ua) => {
    const a = ua.amenity_catalogue;
    if (!a || seen.has(a.name)) return;
    seen.add(a.name);
    const cat = a.category || "other";
    if (!amenities[cat]) amenities[cat] = [];
    amenities[cat].push(a.name);
  });

  return {
    ...data,
    // Clean up nested data
    property: {
      ...property,
      title: property.name,
      address: [property.address_line1, property.district, property.city].filter(Boolean).join(", "),
      location: property.district ? `${property.district}, ${property.city}` : property.city,
      lat: property.latitude || null,
      lng: property.longitude || null,
    },

    // Images
    coverImage,
    gallery,

    // Pricing
    price: cheapest ? Math.round(cheapest.monthly_rent_cents / 100) : 0,
    deposit: cheapest ? Math.round(cheapest.security_deposit_cents / 100) : 0,
    holdingDeposit: cheapest ? Math.round(cheapest.holding_deposit_cents / 100) : 0,
    pricingRules,
    minStay: cheapest?.min_stay_months || 3,
    maxStay: cheapest?.max_stay_months || 24,

    // Amenities
    amenities: Object.keys(amenities).length > 0 ? amenities : null,

    // Display helpers
    unitTypeLabel: unitTypeLabel(data.unit_type),

    tierLabel: {
      standard: "Standard",
      premium: "Premium",
      executive: "Executive",
    }[data.tier] || data.tier,
  };
}
