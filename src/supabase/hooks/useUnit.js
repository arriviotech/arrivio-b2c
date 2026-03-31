import { useEffect, useState } from "react";
import { getUnitBySlug } from "../services/units.service";

export function useUnit(slug) {
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getUnitBySlug(slug)
      .then(setUnit)
      .catch(() => setUnit(null))
      .finally(() => setLoading(false));
  }, [slug]);

  return { unit, loading };
}
