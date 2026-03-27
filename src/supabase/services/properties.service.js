import { supabase } from "../client";

/*
  Normalize DB → frontend shape
*/
export function normalizeProperty(data) {
  const units = data.units || [];
  const photos = data.property_photos || [];

  // Flatten unit_availability from nested units
  const availability = units.flatMap((unit) =>
    (unit.unit_availability || []).map((a) => ({
      ...a,
      unit_id: unit.id,
    }))
  );

  // Find cheapest monthly rent across all units (for listing cards)
  const allPricing = units.flatMap((unit) =>
    (unit.unit_pricing_rules || []).map((p) => p.monthly_rent_cents)
  );
  const cheapestRentCents = allPricing.length > 0 ? Math.min(...allPricing) : 0;

  // Cover image = primary photo, or first photo, or fallback
  const sortedPhotos = [...photos].sort((a, b) => a.display_order - b.display_order);
  const primaryPhoto = sortedPhotos.find((p) => p.is_primary) || sortedPhotos[0];
  const coverImage = primaryPhoto?.storage_path || null;

  // All gallery images (sorted by display_order)
  const gallery = sortedPhotos.map((p) => ({
    url: p.storage_path,
    alt: p.alt_text,
    caption: p.caption,
    isPrimary: p.is_primary,
  }));

  return {
    ...data,

    // Map DB column names → frontend names
    title: data.name,
    location: data.district ? `${data.district}, ${data.city}` : data.city,
    lat: data.latitude || null,
    lng: data.longitude || null,

    // Pricing for display (cents → euros)
    price: cheapestRentCents / 100,
    priceFrom: cheapestRentCents / 100,

    // Cover image + gallery
    image: coverImage,
    cover_image: coverImage,
    gallery,

    // keep frontend naming clean
    thingsToKnow: data.house_rules,

    // Unit summary
    unitCount: units.length,
    availableUnits: units.filter((u) => u.status === 'available').length,

    // Property type label
    category: data.property_type?.replace(/_/g, ' '),

    // Build details from units for PropertyStats
    details: (() => {
      if (units.length === 0) return null;
      const sizes = units.map((u) => Number(u.size_sqm)).filter(Boolean);
      const floors = units.map((u) => u.floor).filter((f) => f !== null && f !== undefined);
      const minFloor = floors.length ? Math.min(...floors) : null;
      const maxFloor = floors.length ? Math.max(...floors) : null;
      const minSize = sizes.length ? Math.min(...sizes) : null;
      const maxSize = sizes.length ? Math.max(...sizes) : null;
      const unitTypes = [...new Set(units.map((u) => u.unit_type))];
      const bedroomMap = { studio: 0, shared_room: 0, one_bedroom: 1, two_bedroom: 2 };
      const maxBeds = Math.max(...unitTypes.map((t) => bedroomMap[t] ?? 0));

      return {
        size: minSize === maxSize ? minSize : `${minSize}–${maxSize}`,
        floor: minFloor === maxFloor
          ? minFloor
          : `${minFloor}–${maxFloor}`,
        beds: maxBeds,
        baths: 1,
        unitTypes: unitTypes.map((t) => t?.replace(/_/g, ' ')),
        totalUnits: units.length,
      };
    })(),

    // Furnishing from units
    furnishing: units.some((u) => u.is_furnished === false) ? 'unfurnished' : 'furnished',

    // Aggregate amenities across all units → { category: [name, ...] }
    amenities: (() => {
      const amenityMap = {};
      const seen = new Set();
      units.forEach((unit) => {
        (unit.unit_amenities || []).forEach((ua) => {
          const a = ua.amenity_catalogue;
          if (!a || seen.has(a.name)) return;
          seen.add(a.name);
          const cat = a.category || 'other';
          if (!amenityMap[cat]) amenityMap[cat] = [];
          amenityMap[cat].push(a.name);
        });
      });
      return Object.keys(amenityMap).length > 0 ? amenityMap : null;
    })(),

    // Address for display
    address: [data.address_line1, data.district, data.city].filter(Boolean).join(', '),

    availability,
  };
}

/* =========================================================
   GET ALL PROPERTIES (with photos, units, pricing)
========================================================= */
export async function getProperties() {
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      property_photos (
        id,
        storage_path,
        alt_text,
        caption,
        is_primary,
        display_order
      ),
      units (
        id,
        slug,
        unit_number,
        unit_type,
        tier,
        floor,
        size_sqm,
        max_occupants,
        is_furnished,
        status,
        unit_pricing_rules (
          tenant_type,
          monthly_rent_cents,
          security_deposit_cents,
          holding_deposit_cents
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
      )
    `)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }

  return (data || []).map(normalizeProperty);
}

/* =========================================================
   GET SINGLE PROPERTY (with photos, units, pricing)
========================================================= */
export async function getPropertyBySlug(slug) {
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      property_photos (
        id,
        storage_path,
        alt_text,
        caption,
        is_primary,
        display_order
      ),
      units (
        id,
        slug,
        unit_number,
        unit_type,
        tier,
        floor,
        size_sqm,
        max_occupants,
        is_furnished,
        status,
        unit_pricing_rules (
          tenant_type,
          monthly_rent_cents,
          security_deposit_cents,
          holding_deposit_cents
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
      )
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching property:", error);
    throw error;
  }

  return normalizeProperty(data);
}
