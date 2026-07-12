import { useEffect, useRef } from 'react';

export function useIntersectionObserver({
    onIntersect,
    enabled = true,
    threshold = 0.1,
    rootMargin = '200px', // 🚀 Performance trick: Prefetch 200px BEFORE the user hits the bottom
}) {
    const targetRef = useRef(null);

    useEffect(() => {
        // If pagination is disabled (e.g., loading or no more pages), do not attach observer
        if (!enabled) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        onIntersect();
                    }
                });
            },
            { threshold, rootMargin }
        );

        const currentTarget = targetRef.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        // 🧼 Safe cleanup when target changes or query parameters adjust
        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [enabled, onIntersect, threshold, rootMargin]);

    return targetRef;
}
