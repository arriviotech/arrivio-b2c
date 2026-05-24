import { useEffect, useState } from "react";
import { getUnit } from "../services/units.service";

// `idOrSlug` is the URL param. The units table has both `id` (UUID) and `slug` (nullable),
// and the navigation falls back to `unit.id` when `unit.slug` is NULL. The fetch detects
// which one it got and queries the right column.
export function useUnit(idOrSlug) {
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idOrSlug) return;
    setLoading(true);
    getUnit(idOrSlug)
      .then(setUnit)
      .catch(() => setUnit(null))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  return { unit, loading };
}
