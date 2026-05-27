/**
 * Unit type display consolidation (B2C presentation layer).
 *
 * The database `unit_type` enum still stores: studio, one_bedroom, two_bedroom,
 * shared_room. B2C presents only THREE categories to users:
 *
 *   studio       → "Studio"
 *   one_bedroom  → "Single Room"
 *   two_bedroom  → "Shared Room"   (merged together with shared_room)
 *   shared_room  → "Shared Room"
 *
 * This is display-only — raw enum values are still used for data (filters that
 * write to the DB, application/booking records, etc.). Never persist the label.
 */

// Raw DB unit_type → canonical display category.
const CANONICAL_TYPE = {
  studio: "studio",
  one_bedroom: "single_room",
  single_room: "single_room",
  two_bedroom: "shared_room",
  shared_room: "shared_room",
};

// Canonical category → human label.
const CANONICAL_LABELS = {
  studio: "Studio",
  single_room: "Single Room",
  shared_room: "Shared Room",
};

// Stable display order for filter pills / lists.
const TYPE_ORDER = ["studio", "single_room", "shared_room"];

/** Map a raw DB unit_type (or canonical key) to its canonical display category. */
export function canonicalUnitType(type) {
  return CANONICAL_TYPE[type] || type;
}

/** Human-readable label for any raw DB unit_type or canonical key. */
export function unitTypeLabel(type) {
  if (!type) return "Unit";
  const key = canonicalUnitType(type);
  return (
    CANONICAL_LABELS[key] ||
    String(type).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/**
 * Distinct canonical unit-type categories present in a list of units,
 * in stable display order. Used for filter pills so that, e.g., two_bedroom
 * and shared_room collapse into a single "Shared Room" pill.
 */
export function distinctUnitTypes(units) {
  const present = new Set((units || []).map((u) => canonicalUnitType(u.unit_type)));
  const known = TYPE_ORDER.filter((t) => present.has(t));
  const extras = [...present].filter((t) => !TYPE_ORDER.includes(t));
  return [...known, ...extras];
}
