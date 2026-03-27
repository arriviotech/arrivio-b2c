import { useEffect, useState } from "react";
import { getPropertyBySlug } from "../services/properties.service";

export function useProperty(slug) {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    getPropertyBySlug(slug)
      .then(setProperty)
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [slug]);

  return { property, loading };
}
