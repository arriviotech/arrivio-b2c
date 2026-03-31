import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase/client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import { normalizeProperty } from "../supabase/services/properties.service";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const { user, openAuthModal } = useAuth();
    const [propertyWishlist, setPropertyWishlist] = useState([]);
    const [unitWishlist, setUnitWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    // Total count for badges
    const totalSaved = propertyWishlist.length + unitWishlist.length;

    // Backwards compat — `wishlist` returns all saved items count-wise but property array for iteration
    const wishlist = propertyWishlist;

    // ========================
    // FETCH
    // ========================
    useEffect(() => {
        let mounted = true;

        const fetchWishlist = async () => {
            if (!user) {
                setPropertyWishlist([]);
                setUnitWishlist([]);
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                // Step 1: Get wishlist rows (lightweight)
                const { data: wishlistRows, error: wError } = await supabase
                    .from("wishlist")
                    .select("id, property_id, unit_id, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                if (wError) throw wError;
                if (!mounted || !wishlistRows) return;

                const propertyIds = wishlistRows.filter(r => !r.unit_id).map(r => r.property_id).filter(Boolean);
                const unitIds = wishlistRows.filter(r => r.unit_id).map(r => r.unit_id).filter(Boolean);

                // Step 2 + 3: Fetch properties and units in parallel
                const [propResult, unitResult] = await Promise.all([
                    propertyIds.length > 0
                        ? supabase.from("properties").select(`
                            *,
                            property_photos ( id, storage_path, alt_text, caption, is_primary, display_order ),
                            units (
                                id, slug, unit_number, unit_type, tier, floor, size_sqm,
                                max_occupants, is_furnished, status,
                                unit_pricing_rules ( tenant_type, monthly_rent_cents, security_deposit_cents, holding_deposit_cents ),
                                unit_amenities ( amenity_catalogue ( name, icon_key, category ) ),
                                unit_availability ( id, date, status )
                            )
                        `).in("id", propertyIds)
                        : { data: [] },
                    unitIds.length > 0
                        ? supabase.from("units").select(`
                            id, slug, unit_number, unit_type, tier, floor, size_sqm,
                            max_occupants, is_furnished, status,
                            unit_pricing_rules ( tenant_type, monthly_rent_cents, security_deposit_cents, holding_deposit_cents ),
                            properties ( id, name, slug, city, district, address_line1,
                                property_photos ( id, storage_path, alt_text, is_primary, display_order, unit_id )
                            )
                        `).in("id", unitIds)
                        : { data: [] },
                ]);

                let normalizedProperties = [];
                if (propResult.data?.length) {
                    const propMap = {};
                    propResult.data.forEach(p => { propMap[p.id] = normalizeProperty(p); });
                    normalizedProperties = propertyIds.map(id => propMap[id]).filter(Boolean);
                }

                let normalizedUnits = [];
                if (unitResult.data?.length) {
                    const unitMap = {};
                    unitResult.data.forEach(u => { unitMap[u.id] = normalizeUnitWishlistItem(u); });
                    normalizedUnits = unitIds.map(id => unitMap[id]).filter(Boolean);
                }

                if (mounted) {
                    setPropertyWishlist(normalizedProperties);
                    setUnitWishlist(normalizedUnits);
                }
            } catch (error) {
                console.error("Error fetching wishlist:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchWishlist();
        return () => { mounted = false; };
    }, [user]);

    // ========================
    // PROPERTY ACTIONS
    // ========================
    const isInWishlist = (propertyId) => propertyWishlist.some(item => item.id === propertyId);

    const addToWishlist = async (property) => {
        if (!user) { openAuthModal(); return; }
        const prev = [...propertyWishlist];
        setPropertyWishlist(list => [property, ...list]);

        try {
            const { error } = await supabase
                .from("wishlist")
                .insert({ user_id: user.id, property_id: property.id });
            if (error) throw error;
            toast.success("Property saved");
        } catch (error) {
            console.error("Error adding to wishlist:", error);
            toast.error("Failed to save property");
            setPropertyWishlist(prev);
        }
    };

    const removeFromWishlist = async (propertyId) => {
        if (!user) return;
        const prev = [...propertyWishlist];
        setPropertyWishlist(list => list.filter(item => item.id !== propertyId));

        try {
            const { error } = await supabase
                .from("wishlist")
                .delete()
                .eq("user_id", user.id)
                .eq("property_id", propertyId)
                .is("unit_id", null);
            if (error) throw error;
            toast.success("Removed from saved");
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            toast.error("Failed to remove");
            setPropertyWishlist(prev);
        }
    };

    const toggleWishlist = (property) => {
        if (!user) { openAuthModal(); return; }
        const propertyId = property.id || property;
        if (isInWishlist(propertyId)) {
            removeFromWishlist(propertyId);
        } else {
            addToWishlist(property);
        }
    };

    // ========================
    // UNIT ACTIONS
    // ========================
    const isUnitInWishlist = (unitId) => unitWishlist.some(item => item.id === unitId);

    const addUnitToWishlist = async (unit, propertyId) => {
        if (!user) { openAuthModal(); return; }
        const prev = [...unitWishlist];
        // Normalize the unit for immediate optimistic display
        const normalized = unit.unitTypeLabel ? unit : normalizeUnitWishlistItem(unit);
        setUnitWishlist(list => [normalized, ...list]);

        try {
            const { error } = await supabase
                .from("wishlist")
                .insert({ user_id: user.id, property_id: propertyId, unit_id: unit.id });
            if (error) throw error;
            toast.success("Unit saved");
        } catch (error) {
            console.error("Error saving unit:", error);
            toast.error("Failed to save unit");
            setUnitWishlist(prev);
        }
    };

    const removeUnitFromWishlist = async (unitId) => {
        if (!user) return;
        const prev = [...unitWishlist];
        setUnitWishlist(list => list.filter(item => item.id !== unitId));

        try {
            const { error } = await supabase
                .from("wishlist")
                .delete()
                .eq("user_id", user.id)
                .eq("unit_id", unitId);
            if (error) throw error;
            toast.success("Removed from saved");
        } catch (error) {
            console.error("Error removing unit:", error);
            toast.error("Failed to remove");
            setUnitWishlist(prev);
        }
    };

    const toggleUnitWishlist = (unit, propertyId) => {
        if (!user) { openAuthModal(); return; }
        if (isUnitInWishlist(unit.id)) {
            removeUnitFromWishlist(unit.id);
        } else {
            addUnitToWishlist(unit, propertyId);
        }
    };

    const value = {
        // Property wishlist
        wishlist,
        propertyWishlist,
        loading,
        totalSaved,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        // Unit wishlist
        unitWishlist,
        addUnitToWishlist,
        removeUnitFromWishlist,
        isUnitInWishlist,
        toggleUnitWishlist,
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

// Normalize a unit from direct Supabase query into display shape
function normalizeUnitWishlistItem(unit) {
    const property = unit.properties || {};
    const allPhotos = property.property_photos || [];

    // Unit-specific photos first, then property-level
    const unitPhotos = allPhotos.filter(p => p.unit_id === unit.id).sort((a, b) => a.display_order - b.display_order);
    const propertyPhotos = allPhotos.filter(p => !p.unit_id || p.is_primary).sort((a, b) => a.display_order - b.display_order);
    const photos = unitPhotos.length > 0 ? unitPhotos : propertyPhotos;
    const coverImage = photos[0]?.storage_path || null;

    const pricing = (unit.unit_pricing_rules || [])
        .filter(p => p.tenant_type !== "b2b")
        .sort((a, b) => a.monthly_rent_cents - b.monthly_rent_cents);
    const cheapest = pricing[0];

    const UNIT_TYPE_LABELS = { studio: "Studio", one_bedroom: "1 Bedroom", two_bedroom: "2 Bedroom", shared_room: "Shared Room" };
    const TIER_LABELS = { standard: "Standard", premium: "Premium", executive: "Executive" };

    return {
        ...unit,
        coverImage,
        gallery: photos.map(p => p.storage_path).filter(Boolean),
        price: cheapest ? Math.round(cheapest.monthly_rent_cents / 100) : 0,
        property: {
            id: property.id,
            name: property.name,
            slug: property.slug,
            city: property.city,
            district: property.district,
            location: property.district ? `${property.district}, ${property.city}` : property.city,
        },
        unitTypeLabel: UNIT_TYPE_LABELS[unit.unit_type] || unit.unit_type?.replace(/_/g, ' ') || 'Unit',
        tierLabel: TIER_LABELS[unit.tier] || unit.tier || 'Standard',
    };
}
