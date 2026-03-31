import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Map as MapIcon,
  List as ListIcon,
  Search as SearchIcon,
  X as CloseIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars

import { useProperties } from "@/supabase/hooks/useProperties";
import { useSearchFilters } from "@/supabase/hooks/useSearchFilters";
import { useFilteredProperties } from "@/supabase/hooks/useFilteredProperties";
import { useAvailableAmenities } from "@/supabase/hooks/useAvailableAmenities";

import PropertyMap from "../components/search/PropertyMap";
import { fetchCoordinates, getDistance } from "../utils/geoUtils";
import FilterSidePanel from "../components/search/FilterSidePanel";
import PropertyCard from "@/components/property/PropertyCard";
import SearchSkeleton from "@/components/skeletons/SearchSkeleton";
import SEO from "@/components/common/SEO";
import SearchControlBar from "../components/search/SearchControlBar";
import SearchHeader from "../components/search/SearchHeader";
import CityGrid from "../components/search/CityGrid";
import UnitSearchCard from "../components/search/UnitSearchCard";
import SortDropdown from "../components/search/SortDropdown";


const Search = () => {
  const navigate = useNavigate();

  // Data
  const { properties, loading } = useProperties();

  // Filter/search state (extracted hook)
  const {
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
    showMap,
    setShowMap,
    mapSearchBounds,
    setMapSearchBounds,
    sortBy,
    setSortBy,
    resetFilters
  } = useSearchFilters();

  // Dynamic amenities from property data
  const availableAmenities = useAvailableAmenities(properties);

  const [geoSearch, setGeoSearch] = useState(null); // { lat, lng, radius, label }
  const [viewMode, setViewMode] = useState("units"); // "units" | "properties"
  const PROPERTIES_PER_PAGE = 12;
  const UNITS_PER_PAGE = 16;
  const [visibleCount, setVisibleCount] = useState(PROPERTIES_PER_PAGE);

  // Computed filtered results (memoized)
  const { filteredProperties, otherProperties } = useFilteredProperties(properties, {
    filters,
    searchTerm,
    activeTab,
    mapSearchBounds,
    geoSearch,
    sortBy
  });

  // Flatten all units from filtered properties (for units view)
  const allUnits = useMemo(() => {
    return filteredProperties.flatMap((prop) =>
      (prop.units || [])
        .filter((u) => u.status === "available")
        .map((u) => ({ unit: u, property: prop }))
    ).sort((a, b) => {
      const priceA = (a.unit.unit_pricing_rules?.[0]?.monthly_rent_cents) || 0;
      const priceB = (b.unit.unit_pricing_rules?.[0]?.monthly_rent_cents) || 0;
      if (sortBy === "price_asc") return priceA - priceB;
      if (sortBy === "price_desc") return priceB - priceA;
      return 0;
    });
  }, [filteredProperties, sortBy]);

  // Reset visible count when filters or view mode change
  useEffect(() => {
    setVisibleCount(viewMode === "units" ? UNITS_PER_PAGE : PROPERTIES_PER_PAGE);
  }, [filters, searchTerm, activeTab, sortBy, viewMode]);

  const visibleProperties = filteredProperties.slice(0, visibleCount);
  const visibleUnits = allUnits.slice(0, visibleCount);
  const hasMore = viewMode === "units"
    ? visibleCount < allUnits.length
    : visibleCount < filteredProperties.length;
  const totalCount = viewMode === "units" ? allUnits.length : filteredProperties.length;

  // Track mobile bottom nav visibility (mirrors MobileNavbar logic)
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 50) setMobileNavVisible(true);
      else if (currentY > lastScrollYRef.current + 5) setMobileNavVisible(false);
      else if (currentY < lastScrollYRef.current - 5) setMobileNavVisible(true);
      lastScrollYRef.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Local UI state
  const [hoveredId, setHoveredId] = useState(null);

  // Filter panel state
  const [filterScrollTarget, setFilterScrollTarget] = useState(null);
  const handleOpenFilters = useCallback((section = null) => {
    setFilterScrollTarget(section);
    setShowFilters(true);
  }, [setShowFilters]);
  const handleCloseFilters = useCallback(() => setShowFilters(false), [setShowFilters]);
  const handleToggleMap = useCallback(() => setShowMap(prev => !prev), [setShowMap]);
  const handleMapSearchArea = useCallback((bounds) => setMapSearchBounds(bounds), [setMapSearchBounds]);
  const handleHoverEnter = useCallback((id) => setHoveredId(id), []);
  const handleHoverLeave = useCallback(() => setHoveredId(null), []);

  // Shared function for geo-searching
  const performGeoSearch = useCallback(async (query) => {
    if (!query || query.length < 3) return;
    
    // Convert "All Germany" or "All" to null search
    if (query.toLowerCase() === 'all' || query.toLowerCase() === 'all germany') {
      setGeoSearch(null);
      return;
    }

    const coords = await fetchCoordinates(query);
    if (coords) {
      // Find best radius
      const radii = [15, 30, 45, 60, 100];
      let foundRadius = radii[0];

      for (const r of radii) {
        const count = (properties || []).filter(p => {
          if (!p.lat || !p.lng) return false;
          return getDistance(p.lat, p.lng, coords.lat, coords.lng) <= r;
        }).length;

        if (count > 0) {
          foundRadius = r;
          break;
        }
        foundRadius = r;
      }

      setGeoSearch({
        ...coords,
        radius: foundRadius,
        label: query
      });
    }
  }, [properties]);

  // Handle initial search from navigation state
  const initialGeocodeRef = useRef(false);
  useEffect(() => {
    if (!initialGeocodeRef.current && searchTerm && !loading && properties.length > 0) {
      // Only geocode if it was an initial landing from Hero bar
      // We check if history state has location
      if (window.history.state?.usr?.location) {
        performGeoSearch(searchTerm);
        initialGeocodeRef.current = true;
      }
    }
  }, [searchTerm, loading, properties, performGeoSearch]);

  if (loading) {
    return <SearchSkeleton />;
  }

  return (
    <div className="min-h-screen w-full bg-[#f2f2f2] pt-20 flex flex-col relative">
      <SEO title="Search Apartments" description="Browse furnished apartments and rooms across Germany. Filter by city, price, amenities, and move-in date." path="/search" />

      {/* ── STICKY CONTROL BAR ── */}
      <SearchControlBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={performGeoSearch}
        filters={filters}
        setFilters={setFilters}
        onOpenFilters={handleOpenFilters}
        onReset={resetFilters}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 w-full flex flex-col lg:flex-row gap-8 relative">

        {/* LEFT (LIST) */}
        <div className={`transition-all duration-500 ease-in-out ${showMap ? 'lg:w-[60%]' : 'w-full'}`}>

          {searchType === "cities" ? (
            <CityGrid onCityClick={(cityName) => {
              setSearchTerm(cityName);
              setFilters(prev => ({ ...prev, city: cityName }));
              setSearchType("stays");
              performGeoSearch(cityName);
            }} />
          ) : (
            <>
              {/* 3. HEADER (Breadcrumbs + Title) */}
              <SearchHeader
                city={filters.city}
                count={totalCount}
                searchTerm={searchTerm}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />

              {/* VIEW MODE TOGGLE + SORT */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex p-0.5 bg-white border border-[#0f4c3a]/10 rounded-lg shadow-sm">
                  <button
                    onClick={() => setViewMode("units")}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                      viewMode === "units"
                        ? "bg-[#0f4c3a] text-[#f2f2f2] shadow-sm"
                        : "text-[#6b7280] hover:text-[#111827]"
                    }`}
                  >
                    Units
                  </button>
                  <button
                    onClick={() => setViewMode("properties")}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                      viewMode === "properties"
                        ? "bg-[#0f4c3a] text-[#f2f2f2] shadow-sm"
                        : "text-[#6b7280] hover:text-[#111827]"
                    }`}
                  >
                    Properties
                  </button>
                </div>

                <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
              </div>

              {/* GEO SEARCH BANNER */}
              <AnimatePresence>
                {geoSearch && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="bg-[#0f4c3a] text-white p-4 rounded-2xl flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <MapIcon size={16} />
                        </div>
                        <div>
                          <p className="text-xs opacity-60 uppercase font-bold tracking-widest leading-none mb-1">Searching near</p>
                          <p className="text-sm font-serif">{geoSearch.label} <span className="opacity-60 italic ml-1">({geoSearch.radius}km)</span></p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setGeoSearch(null)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <CloseIcon size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 4. CARDS GRID OR EMPTY STATE */}
              {viewMode === "units" ? (
                /* ====== UNITS VIEW ====== */
                allUnits.length > 0 ? (
                  <section>
                    <div className={`grid gap-5 transition-all duration-500 ${showMap
                      ? 'grid-cols-1 md:grid-cols-2'
                      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    }`}>
                      {visibleUnits.map(({ unit, property }) => (
                        <div
                          key={unit.id}
                          onMouseEnter={() => handleHoverEnter(property.id)}
                          onMouseLeave={handleHoverLeave}
                        >
                          <UnitSearchCard
                            unit={unit}
                            property={property}
                            onClick={() => navigate(`/unit/${unit.slug || unit.id}`)}
                          />
                        </div>
                      ))}
                    </div>

                    {/* LOAD MORE */}
                    {hasMore && (
                      <div className="flex flex-col items-center gap-3 mt-10 mb-20">
                        <p className="text-xs text-[#9ca3af] font-medium">
                          Showing {visibleCount} of {allUnits.length} units
                        </p>
                        <button
                          onClick={() => setVisibleCount(prev => prev + UNITS_PER_PAGE)}
                          className="px-8 py-3 bg-white text-[#111827] border border-[#0f4c3a]/20 rounded-full text-sm sm:text-xs font-bold uppercase tracking-widest hover:bg-[#0f4c3a] hover:text-[#f2f2f2] transition-colors"
                        >
                          Show more units
                        </button>
                      </div>
                    )}
                  </section>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <p className="text-xl font-serif text-[#4b5563] mb-2">No available units found</p>
                    <p className="text-sm text-[#9ca3af]">Try adjusting your filters</p>
                  </motion.div>
                )
              ) : (
              /* ====== PROPERTIES VIEW ====== */
              filteredProperties.length > 0 || otherProperties.length > 0 ? (
                  <div className="flex flex-col gap-12">
                    {filteredProperties.length > 0 && (
                      <section>
                        {geoSearch && (
                          <h2 className="text-xl font-serif text-[#111827] mb-6 flex items-center gap-2">
                            Nearby properties
                            <span className="text-sm font-sans font-normal opacity-40">({filteredProperties.length})</span>
                          </h2>
                        )}
                        <div className={`grid gap-6 transition-all duration-500 ${showMap
                          ? 'grid-cols-1 md:grid-cols-2'
                          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                          }`}>
                          {visibleProperties.map(property => (
                            <PropertyCard
                              key={property.id}
                              property={property}
                              activeTab={activeTab}
                              onClick={() => navigate(`/property/${property.slug || property.id}`)}
                              onMouseEnter={() => handleHoverEnter(property.id)}
                              onMouseLeave={handleHoverLeave}
                            />
                          ))}
                        </div>

                        {hasMore && (
                          <div className="flex flex-col items-center gap-3 mt-10 mb-20">
                            <p className="text-xs text-[#9ca3af] font-medium">
                              Showing {visibleCount} of {filteredProperties.length} properties
                            </p>
                            <button
                              onClick={() => setVisibleCount(prev => prev + PROPERTIES_PER_PAGE)}
                              className="px-8 py-3 bg-white text-[#111827] border border-[#0f4c3a]/20 rounded-full text-sm sm:text-xs font-bold uppercase tracking-widest hover:bg-[#0f4c3a] hover:text-[#f2f2f2] transition-colors"
                            >
                              Show more properties
                            </button>
                          </div>
                        )}
                      </section>
                    )}

                    {otherProperties.length > 0 && (
                      <section className={`${filteredProperties.length > 0 ? 'pt-8 border-t border-[#0f4c3a]/5' : ''}`}>
                        <h2 className="text-xl font-serif text-[#111827] mb-6 flex items-center gap-2">
                          {geoSearch ? "Explore all properties in Germany" : "All properties"}
                          <span className="text-sm font-sans font-normal opacity-40">({otherProperties.length})</span>
                        </h2>
                        <div className={`grid gap-6 transition-all duration-500 ${showMap
                          ? 'grid-cols-1 md:grid-cols-2'
                          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                          }`}>
                          {otherProperties.map(property => (
                            <PropertyCard
                              key={property.id}
                              property={property}
                              activeTab={activeTab}
                              onClick={() => navigate(`/property/${property.slug || property.id}`)}
                              onMouseEnter={() => handleHoverEnter(property.id)}
                              onMouseLeave={handleHoverLeave}
                            />
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/50 rounded-3xl border border-[#f2f2f2] mt-4"
                >
                  <div className="w-16 h-16 bg-[#0f4c3a]/5 rounded-full flex items-center justify-center mb-6">
                    <SearchIcon size={32} className="text-[#9ca3af]" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#111827] mb-2">No properties found</h3>
                  <p className="text-[#4b5563] max-w-sm mb-8">
                    We couldn't find any properties matching your current filters. Try adjusting your search or resetting all filters.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-8 py-3 bg-[#0f4c3a] text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    Reset all filters
                  </button>
                </motion.div>
              )
              )}
            </>
          )}

          {/* FLOATING MAP TOGGLE */}
          {filteredProperties.length > 0 && (
            <div className={`sticky z-20 flex justify-center pointer-events-none transition-all duration-300 md:bottom-6 ${mobileNavVisible ? 'bottom-[88px]' : 'bottom-6'}`}>
              <button
                onClick={handleToggleMap}
                className="pointer-events-auto bg-[#0f4c3a] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-medium text-base sm:text-sm hover:bg-[#0a3a2b] transition-colors border border-white/10"
              >
                {showMap ? (
                  <>
                    <ListIcon size={16} />
                    Show List
                  </>
                ) : (
                  <>
                    <MapIcon size={16} />
                    Show Map
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* MAP CONTAINER */}
        <div
          className={`fixed inset-0 z-[60] pt-20 bg-[#f0f0f0] transition-transform duration-300 ease-in-out lg:fixed lg:top-[80px] lg:right-3 lg:bottom-3 lg:left-auto lg:w-[38%] lg:z-[25] lg:pt-0 lg:rounded-xl lg:border lg:border-[#e5e7eb] lg:shadow-lg overflow-hidden ${showMap
            ? 'translate-y-0 lg:translate-x-0'
            : 'translate-y-full lg:translate-x-full'
            }`}
        >
          {/* MOBILE CLOSE BUTTON */}
          <button
            onClick={handleToggleMap}
            className="absolute top-24 right-6 z-[110] bg-white p-3 rounded-full shadow-xl border border-black/5 lg:hidden text-[#111827] active:scale-95 transition-transform"
          >
            <CloseIcon size={20} />
          </button>

          <PropertyMap
            properties={filteredProperties}
            allProperties={properties}
            hoveredId={hoveredId}
            onSearchArea={handleMapSearchArea}
            geoSearch={geoSearch}
            setGeoSearch={setGeoSearch}
          />
        </div>

      </div>

      {/* FILTER SIDE PANEL (portaled overlay) */}
      <FilterSidePanel
        isOpen={showFilters}
        onClose={handleCloseFilters}
        scrollToSection={filterScrollTarget}
        filters={filters}
        setFilters={setFilters}
        onReset={resetFilters}
        properties={properties || []}
        availableAmenities={availableAmenities}
        totalCount={totalCount}
      />

    </div>
  );
};

export default Search;
