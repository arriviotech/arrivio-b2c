import { supabase } from "../client";

export async function getUnitBySlug(slug) {
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
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching unit:", error);
    throw error;
  }

  return normalizeUnit(data);
}

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
    unitTypeLabel: {
      studio: "Studio",
      one_bedroom: "1 Bedroom Apartment",
      two_bedroom: "2 Bedroom Apartment",
      shared_room: "Shared Room",
    }[data.unit_type] || data.unit_type,

    tierLabel: {
      standard: "Standard",
      premium: "Premium",
      executive: "Executive",
    }[data.tier] || data.tier,
  };
}
