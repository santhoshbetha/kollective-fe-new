import { useEffect, useState } from 'react';

/**
 * Returns the intrinsic aspect ratio (width / height) of an image once it loads.
 * Returns null until the image is loaded (or if it fails to load).
 */
export function useImageAspect(src) {
  const [aspect, setAspect] = useState(null);

  useEffect(() => {
    if (!src) {
      setAspect(null);
      return undefined;
    }

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled && img.naturalWidth > 0 && img.naturalHeight > 0) {
        setAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.onerror = () => {
      if (!cancelled) setAspect(null);
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  return aspect;
}
