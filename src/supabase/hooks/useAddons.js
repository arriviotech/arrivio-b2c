import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAddonCatalogue, getMyAddonOrders } from "../services/addons.service";

export function useAddonCatalogue() {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAddonCatalogue()
      .then(setAddons)
      .catch(() => setAddons([]))
      .finally(() => setLoading(false));
  }, []);

  return { addons, loading };
}

export function useMyAddonOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(!!user);
  const [fetchCount, setFetchCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const run = async () => {
      try {
        const data = await getMyAddonOrders(user.id);
        if (!cancelled) setOrders(data);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [user, fetchCount]);

  const refetch = useCallback(() => setFetchCount(c => c + 1), []);

  return { orders, loading, refetch };
}
