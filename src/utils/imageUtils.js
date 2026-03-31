/**
 * Image optimization utilities for Supabase Storage transforms.
 *
 * Supabase Storage supports on-the-fly image transforms via the render endpoint:
 *   /storage/v1/render/image/public/{bucket}/{path}?width=W&height=H&quality=Q&resize=cover
 *
 * Normal storage URL:
 *   /storage/v1/object/public/{bucket}/{path}
 */

const SUPABASE_STORAGE_OBJECT = "/storage/v1/object/public/";
const SUPABASE_STORAGE_RENDER = "/storage/v1/render/image/public/";

/**
 * Convert a Supabase storage URL to use image transforms.
 * Non-Supabase URLs are returned as-is.
 *
 * @param {string} url  — original image URL
 * @param {object} opts — { width, height, quality, resize }
 * @returns {string}
 */
export function getOptimizedUrl(url, { width, height, quality = 75, resize = "cover" } = {}) {
  // Handle gallery objects { url: "..." }
  if (url && typeof url === "object" && url.url) url = url.url;
  if (!url || typeof url !== "string") return url;

  // Only transform Supabase storage URLs
  if (!url.includes(SUPABASE_STORAGE_OBJECT)) return url;

  const transformed = url.replace(SUPABASE_STORAGE_OBJECT, SUPABASE_STORAGE_RENDER);

  const params = new URLSearchParams();
  if (width) params.set("width", String(width));
  if (height) params.set("height", String(height));
  params.set("quality", String(quality));
  params.set("resize", resize);

  return `${transformed}?${params.toString()}`;
}

/**
 * Responsive breakpoints for srcSet generation.
 * Each entry: [width, descriptor]
 */
const SRCSET_BREAKPOINTS = [
  [400, "400w"],
  [640, "640w"],
  [800, "800w"],
  [1024, "1024w"],
  [1280, "1280w"],
];

/**
 * Generate a srcSet string for responsive images.
 * Only works for Supabase storage URLs; returns empty string otherwise.
 *
 * @param {string} url     — original image URL
 * @param {object} opts    — { quality, resize }
 * @returns {string}       — srcSet attribute value, or ""
 */
export function generateSrcSet(url, { quality = 75, resize = "cover" } = {}) {
  // Handle gallery objects { url: "..." }
  if (url && typeof url === "object" && url.url) url = url.url;
  if (!url || typeof url !== "string" || !url.includes(SUPABASE_STORAGE_OBJECT)) return "";

  return SRCSET_BREAKPOINTS.map(([w, descriptor]) => {
    const optimized = getOptimizedUrl(url, { width: w, quality, resize });
    return `${optimized} ${descriptor}`;
  }).join(", ");
}

/**
 * Default sizes attribute for common layout patterns.
 */
export const DEFAULT_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

export const CARD_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px";

export const GALLERY_SIZES = "(max-width: 768px) 100vw, 800px";

export const THUMBNAIL_SIZES = "80px";

export const SIDEBAR_SIZES = "(max-width: 1024px) 100vw, 400px";
