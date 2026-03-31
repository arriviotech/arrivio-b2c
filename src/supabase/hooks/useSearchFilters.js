import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_FILTERS = {
    city: "All",
    priceMin: 0,
    priceMax: 2000,
    minBeds: 0,
    floor: "Any",
    tags: [],
    propertyTypes: [],
    availableFrom: null,
    furniture: "Any"
};

/**
 * Custom hook that owns all filter/search state and URL sync logic
 * for the Search page.
 */
export function useSearchFilters() {
    const location = useLocation();

    const initialCity = location.state?.location || "All";

    // helper to get from session storage
    const getSession = (key, fallback) => {
        const saved = sessionStorage.getItem(`search_${key}`);
        if (!saved) return fallback;
        try {
            return JSON.parse(saved);
        } catch {
            return saved;
        }
    };

    const [searchTerm, setSearchTerm] = useState(() => {
        if (location.state?.location && location.state.location !== "All") return location.state.location;
        return getSession("searchTerm", "");
    });

    const [activeTab, setActiveTab] = useState(() => getSession("activeTab", "Anyone"));
    const [searchType, setSearchType] = useState("stays");
    const [showFilters, setShowFilters] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showMap, setShowMap] = useState(() => getSession("showMap", false));
    const [mapSearchBounds, setMapSearchBounds] = useState(null);
    const [sortBy, setSortBy] = useState(() => getSession("sortBy", "relevance"));

    const [filters, setFilters] = useState(() => {
        const savedFilters = getSession("filters", DEFAULT_FILTERS);
        return {
            ...savedFilters,
            city: location.state?.location || savedFilters.city || "All",
            priceMin: location.state?.priceMin ?? savedFilters.priceMin ?? DEFAULT_FILTERS.priceMin,
            priceMax: location.state?.priceMax ?? savedFilters.priceMax ?? DEFAULT_FILTERS.priceMax
        };
    });

    // Sync to sessionStorage
    useEffect(() => {
        sessionStorage.setItem("search_searchTerm", JSON.stringify(searchTerm));
    }, [searchTerm]);

    useEffect(() => {
        sessionStorage.setItem("search_activeTab", JSON.stringify(activeTab));
    }, [activeTab]);


    useEffect(() => {
        sessionStorage.setItem("search_showMap", JSON.stringify(showMap));
    }, [showMap]);

    useEffect(() => {
        sessionStorage.setItem("search_filters", JSON.stringify(filters));
    }, [filters]);

    useEffect(() => {
        sessionStorage.setItem("search_sortBy", JSON.stringify(sortBy));
    }, [sortBy]);

    const suggestionsRef = useRef(null);

    // Sync with navigation state (from hero search / city grid)
    useEffect(() => {
        if (location.state) {
            const { location: selectedCity, date, endDate, priceMin, priceMax } = location.state;

            setFilters(prev => ({
                ...prev,
                city: selectedCity || prev.city || "All",
                availableFrom: date || prev.availableFrom || null,
                priceMin: priceMin ?? prev.priceMin ?? DEFAULT_FILTERS.priceMin,
                priceMax: priceMax ?? prev.priceMax ?? DEFAULT_FILTERS.priceMax
            }));

            if (selectedCity && selectedCity !== "All") {
                setSearchTerm(selectedCity);
            }
        }
    }, [location.state]);

    // 1. Clear city filter when search term is empty
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilters(prev => ({ ...prev, city: "All" }));
        }
    }, [searchTerm]);

    // 2. Sync search term when city filter changes (from filter panel)
    // This ensures that selecting "All" in filters also clears the top search bar
    const lastCityRef = useRef(filters.city);

    useEffect(() => {
        if (filters.city !== lastCityRef.current) {
            if (filters.city === "All") {
                setSearchTerm("");
            } else {
                setSearchTerm(filters.city);
            }
            lastCityRef.current = filters.city;
        }
    }, [filters.city]);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const resetFilters = () => {
        setFilters({ ...DEFAULT_FILTERS });
        setSearchTerm("");
        setMapSearchBounds(null);
        // Clear session storage
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith("search_")) {
                sessionStorage.removeItem(key);
            }
        });
    };

    return {
        filters,
        setFilters,
        searchTerm,
        setSearchTerm,
        activeTab,
        setActiveTab,
        searchType,
        setSearchType,
        showFilters,
        setShowFilters,
        showSuggestions,
        setShowSuggestions,
        showMap,
        setShowMap,
        mapSearchBounds,
        setMapSearchBounds,
        sortBy,
        setSortBy,
        suggestionsRef,
        resetFilters
    };
}
