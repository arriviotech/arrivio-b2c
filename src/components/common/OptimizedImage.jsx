import React, { useState, useRef, useEffect } from "react";
import { getOptimizedUrl, generateSrcSet, DEFAULT_SIZES } from "../../utils/imageUtils";

const FALLBACK_IMAGE = "/placeholder-property.jpg";

/**
 * OptimizedImage — drop-in <img> replacement with:
 *  - Supabase image transforms (auto width/quality)
 *  - Responsive srcSet for Supabase images
 *  - Native lazy loading
 *  - Skeleton shimmer while loading
 *  - Graceful error fallback
 *
 * Props:
 *  - src          — image URL
 *  - alt          — alt text
 *  - width        — desired render width (for Supabase transform, optional)
 *  - quality      — JPEG quality 1-100 (default 75)
 *  - sizes        — <img> sizes attribute (default: responsive)
 *  - fallback     — custom fallback image URL
 *  - className    — applied to wrapper div
 *  - imgClassName — applied to the <img> element
 *  - eager        — set true for above-the-fold images (disables lazy)
 *  - onClick      — click handler
 *  - ...rest      — forwarded to <img>
 */
const OptimizedImage = ({
  src,
  alt = "",
  width: transformWidth,
  quality = 75,
  sizes = DEFAULT_SIZES,
  fallback = FALLBACK_IMAGE,
  className = "",
  imgClassName = "",
  eager = false,
  onClick,
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  // Reset state when src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  // Check if already cached (loaded from browser cache instantly)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  // Normalize: handle gallery objects { url: "..." }
  const rawSrc = (src && typeof src === "object" && src.url) ? src.url : src;

  const optimizedSrc = transformWidth
    ? getOptimizedUrl(rawSrc, { width: transformWidth, quality })
    : rawSrc;

  const srcSet = generateSrcSet(rawSrc, { quality });

  const handleLoad = () => setLoaded(true);

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  const displaySrc = error ? fallback : (optimizedSrc || fallback);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton shimmer — visible until image loads */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      <img
        ref={imgRef}
        src={displaySrc}
        alt={alt}
        srcSet={!error && srcSet ? srcSet : undefined}
        sizes={!error && srcSet ? sizes : undefined}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
        {...rest}
      />
    </div>
  );
};

export default OptimizedImage;
