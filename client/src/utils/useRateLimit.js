import { useCallback, useRef, useMemo } from 'react';
import { debounce, throttle } from './rateLimiter';

export function useDebounce(callback, delay) {
    const debouncedFn = useMemo(() => {
        return debounce(callback, delay);
    }, [callback, delay]);

    return debouncedFn;
}

export function useThrottle(callback, limit) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const throttledCallback = useRef(
        throttle((...args) => {
            callbackRef.current(...args);
        }, limit)
    ).current;

    return throttledCallback;
}

export function useRateLimitedFetch() {
    const requestCache = useRef(new Map());
    const pendingRequests = useRef(new Map());

    const fetchWithCache = useCallback(async (key, fetchFn, cacheTime = 5000) => {
        const cached = requestCache.current.get(key);
        if (cached && Date.now() - cached.timestamp < cacheTime) {
            return cached.data;
        }

        if (pendingRequests.current.has(key)) {
            return pendingRequests.current.get(key);
        }

        const promise = fetchFn().then(data => {
            requestCache.current.set(key, {
                data,
                timestamp: Date.now()
            });
            pendingRequests.current.delete(key);
            return data;
        }).catch(error => {
            pendingRequests.current.delete(key);
            throw error;
        });

        pendingRequests.current.set(key, promise);
        return promise;
    }, []);

    const clearCache = useCallback((key) => {
        if (key) {
            requestCache.current.delete(key);
        } else {
            requestCache.current.clear();
        }
    }, []);

    return { fetchWithCache, clearCache };
}
