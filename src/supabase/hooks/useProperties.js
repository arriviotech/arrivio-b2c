import { useEffect, useState } from "react";
import { getProperties } from "../services/properties.service";

export function useProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProperties()
      .then(setProperties)
      .finally(() => setLoading(false));
  }, []);

  return { properties, loading };
}
