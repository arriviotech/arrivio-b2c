import { useMemo } from 'react';

const CATEGORY_ORDER = ['connectivity', 'appliances', 'furniture', 'building', 'services', 'security'];

const CATEGORY_LABELS = {
  connectivity: 'Connectivity',
  appliances: 'Appliances',
  furniture: 'Furniture',
  building: 'Building Features',
  services: 'Services',
  security: 'Safety & Security',
  facilities: 'Facilities',
};

/**
 * Extracts unique amenities from loaded properties, grouped by DB category.
 * Same pattern as CITIES derivation in FilterPanel.
 */
export const useAvailableAmenities = (properties) => {
  return useMemo(() => {
    const categoryMap = new Map();
    const allNamesSet = new Set();

    // Collect amenities from property.amenities (grouped by category from DB)
    (properties || []).forEach((p) => {
      if (p.amenities && typeof p.amenities === 'object') {
        Object.entries(p.amenities).forEach(([category, names]) => {
          if (!Array.isArray(names)) return;
          if (!categoryMap.has(category)) categoryMap.set(category, new Set());
          const set = categoryMap.get(category);
          names.forEach((name) => {
            set.add(name);
            allNamesSet.add(name);
          });
        });
      }

      // Also collect property.tags into a "facilities" pseudo-category
      if (Array.isArray(p.tags)) {
        if (!categoryMap.has('facilities')) categoryMap.set('facilities', new Set());
        const facilitySet = categoryMap.get('facilities');
        p.tags.forEach((tag) => {
          facilitySet.add(tag);
          allNamesSet.add(tag);
        });
      }
    });

    // Build sorted result in fixed display order
    const grouped = {};
    // DB categories first
    CATEGORY_ORDER.forEach((cat) => {
      if (categoryMap.has(cat)) {
        grouped[cat] = Array.from(categoryMap.get(cat)).sort();
      }
    });
    // Facilities pseudo-category
    if (categoryMap.has('facilities')) {
      grouped.facilities = Array.from(categoryMap.get('facilities')).sort();
    }
    // Any unknown categories
    categoryMap.forEach((set, cat) => {
      if (!grouped[cat]) {
        grouped[cat] = Array.from(set).sort();
      }
    });

    return {
      grouped,
      allNames: Array.from(allNamesSet).sort(),
      categoryLabels: CATEGORY_LABELS,
      categoryOrder: [...CATEGORY_ORDER, 'facilities'].filter((c) => grouped[c]),
    };
  }, [properties]);
};
