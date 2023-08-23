export const genId = () => Math.random().toString(36).substr(2, 9);

export const prefersReducedMotion = (() => {
    // Cache result
    let shouldReduceMotion: boolean | undefined = undefined;

    return () => {
        if (shouldReduceMotion === undefined && typeof window !== "undefined") {
            const mediaQuery = matchMedia("(prefers-reduced-motion: reduce)");
            shouldReduceMotion = !mediaQuery || mediaQuery.matches;
        }
        return shouldReduceMotion;
    };
})();
