import { useMemo } from "react";
import { getDistance } from "../../utils/geoUtils";

/**
 * Filters a list of properties based on the current search/filter state.
 * Returns memoized filteredProperties and suggestions arrays.
 */
export function useFilteredProperties(properties, { filters, searchTerm, activeTab, mapSearchBounds, geoSearch, sortBy }) {
    const safeProperties = properties || [];

    // 1. Core filtering + Sorting
    const { nearby: filteredProperties, others: otherProperties } = useMemo(() => {
        const allMatches = safeProperties.filter(p => {
            // City / Map bounds
            const matchesCity =
                mapSearchBounds || filters.city === "All" || p.city === filters.city;

            let matchesBounds = true;
            if (mapSearchBounds) {
                const sw = mapSearchBounds._southWest;
                const ne = mapSearchBounds._northEast;
                matchesBounds =
                    p.lat >= sw.lat &&
                    p.lat <= ne.lat &&
                    p.lng >= sw.lng &&
                    p.lng <= ne.lng;
            }

            // Free-text search
            const searchLower = searchTerm.trim().toLowerCase();
            const matchesSearch =
                searchLower === "" ||
                p.title?.toLowerCase().includes(searchLower) ||
                p.city?.toLowerCase().includes(searchLower) ||
                p.tags?.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(searchLower));

            // Price
            const price = p.price || 0;
            const matchesPrice = price >= filters.priceMin && price <= filters.priceMax;

            // Floor
            let matchesFloor = true;
            if (filters.floor !== "Any") {
                if (filters.floor === "5th+") {
                    const floorNum = parseInt(p.details?.floor) || 0;
                    matchesFloor = floorNum >= 5;
                } else {
                    matchesFloor = p.details?.floor === filters.floor;
                }
            }

            // Tags / Amenities
            const matchesTags =
                filters.tags.length === 0 ||
                filters.tags.every(tag => {
                    const lowerTag = tag.toLowerCase();
                    const isInTags = p.tags?.some(t => typeof t === 'string' && t.toLowerCase() === lowerTag);
                    const isInAmenities = p.amenities
                        ? Object.values(p.amenities).some(categoryList =>
                            Array.isArray(categoryList) && categoryList.some(a => a.toLowerCase() === lowerTag)
                        )
                        : false;
                    return isInTags || isInAmenities;
                });

            // Furniture
            const matchesFurniture =
                filters.furniture === "Any" ||
                p.furnishing === filters.furniture;


            // Availability dates
            let matchesAvailability = true;
            if (filters.availableFrom) {
                const userStart = new Date(filters.availableFrom);
                userStart.setHours(0, 0, 0, 0);
                const userEnd = filters.availableTo ? new Date(filters.availableTo) : null;
                if (userEnd) userEnd.setHours(23, 59, 59, 999);

                const hasSlot = p.availability?.some(slot => {
                    if (slot.status !== 'available') return false;
                    const slotStart = new Date(slot.start_date);
                    const slotEnd = slot.end_date ? new Date(slot.end_date) : null;
                    const startsBeforeMoveIn = slotStart <= userStart;
                    const coversDuration = !userEnd || (!slotEnd || slotEnd >= userEnd);
                    return startsBeforeMoveIn && coversDuration;
                });
                if (!hasSlot) matchesAvailability = false;
            }

            // Property type
            const matchesPropertyType =
                !filters.propertyTypes ||
                filters.propertyTypes.length === 0 ||
                filters.propertyTypes.some(type => {
                    if (p.type === type) return true;

                    const keywords = [type.toLowerCase()];
                    if (type === "Studio") keywords.push("1 room", "studio");
                    if (type === "Private Room") keywords.push("room", "wg", "shared");
                    if (type === "Shared Room" || type === "Shared room") keywords.push("shared", "roommate");
                    if (type === "Apartment") keywords.push("flat", "appartment", "apartment", "penthouse", "loft");

                    const textToCheck = (p.title + " " + (p.tags?.join(" ") || "")).toLowerCase();
                    return keywords.some(k => textToCheck.includes(k));
                });

            // Tab-based audience filter (matches properties.available_for array)
            let matchesTab = true;
            if (activeTab !== "Anyone") {
                const availableFor = p.available_for || [];
                if (activeTab === "Professionals") {
                    matchesTab = availableFor.includes("professional");
                } else if (activeTab === "Students") {
                    matchesTab = availableFor.includes("student");
                } else if (activeTab === "Azubis") {
                    matchesTab = availableFor.includes("azubi");
                }
            }

            return (
                matchesCity &&
                matchesSearch &&
                matchesPrice &&
                matchesFloor &&
                matchesTags &&
                matchesAvailability &&
                matchesPropertyType &&
                matchesFurniture &&
                matchesTab &&
                matchesBounds
            );
        }).sort((a, b) => {
            if (sortBy === "price_asc") {
                return (a.price || 0) - (b.price || 0);
            }
            if (sortBy === "price_desc") {
                return (b.price || 0) - (a.price || 0);
            }
            if (sortBy === "newest") {
                return new Date(b.created_at) - new Date(a.created_at);
            }
            if (sortBy === "availability") {
                const getEarliestDate = (p) => {
                    const availableSlots = p.availability?.filter(s => s.status === 'available');
                    if (!availableSlots || availableSlots.length === 0) return new Date(8640000000000000); // Max date
                    return new Date(Math.min(...availableSlots.map(s => new Date(s.start_date))));
                };
                return getEarliestDate(a) - getEarliestDate(b);
            }
            // "relevance" or default: Sort by created_at desc
            return new Date(b.created_at) - new Date(a.created_at);
        });

        // Split into Nearby vs Others if geoSearch is active
        if (geoSearch && geoSearch.lat && geoSearch.lng) {
            const nearby = [];
            const others = [];

            allMatches.forEach(p => {
                const dist = getDistance(p.lat, p.lng, geoSearch.lat, geoSearch.lng);
                if (dist <= geoSearch.radius) {
                    nearby.push(p);
                } else {
                    others.push(p);
                }
            });

            return { nearby, others };
        }

        return { nearby: allMatches, others: [] };
    }, [safeProperties, filters, searchTerm, activeTab, mapSearchBounds, geoSearch, sortBy]);

    const suggestions = useMemo(() => {
        if (searchTerm.trim().length === 0) return [];
        return safeProperties
            .filter(
                p =>
                    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.city?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 5);
    }, [safeProperties, searchTerm]);

    return { filteredProperties, otherProperties, suggestions };
}
