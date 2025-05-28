/**
 * SSR (Server-Side Rendering) Utilities
 *
 * Utilities for handling server-side rendering compatibility and hydration safety.
 * These utilities help prevent client-server mismatch errors and ensure components
 * work correctly in SSR environments like Next.js, Gatsby, and Remix.
 */

import { useEffect, useState } from 'react';

/**
 * Check if code is running in a browser environment
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Check if code is running on the server
 */
export const isServer = (): boolean => {
  return !isBrowser();
};

/**
 * Safe access to window object
 */
export const safeWindow = (): Window | null => {
  return isBrowser() ? window : null;
};

/**
 * Safe access to document object
 */
export const safeDocument = (): Document | null => {
  return isBrowser() ? document : null;
};

/**
 * Hook to detect when component has hydrated on the client
 * This prevents hydration mismatches by ensuring client-only code
 * only runs after hydration is complete.
 */
export const useIsClient = (): boolean => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

/**
 * Hook to safely access browser APIs after hydration
 * Returns null during SSR and initial render, then the actual value after hydration
 */
export const useSafeBrowserAPI = <T>(
  getBrowserValue: () => T,
  fallbackValue: T | null = null
): T | null => {
  const isClient = useIsClient();
  const [value, setValue] = useState<T | null>(fallbackValue);

  useEffect(() => {
    if (isClient) {
      try {
        setValue(getBrowserValue());
      } catch (error) {
        console.warn('Error accessing browser API:', error);
        setValue(fallbackValue);
      }
    }
  }, [isClient, getBrowserValue, fallbackValue]);

  return isClient ? value : fallbackValue;
};

/**
 * SSR-safe localStorage access
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser()) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (!isBrowser()) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('Error setting localStorage:', error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    if (!isBrowser()) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Error removing from localStorage:', error);
      return false;
    }
  }
};

/**
 * SSR-safe sessionStorage access
 */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser()) return null;
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn('Error accessing sessionStorage:', error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (!isBrowser()) return false;
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('Error setting sessionStorage:', error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    if (!isBrowser()) return false;
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Error removing from sessionStorage:', error);
      return false;
    }
  }
};

/**
 * SSR-safe DOM query selector
 */
export const safeQuerySelector = (selector: string): Element | null => {
  if (!isBrowser()) return null;
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.warn('Error querying DOM:', error);
    return null;
  }
};

/**
 * SSR-safe DOM query selector all
 */
export const safeQuerySelectorAll = (selector: string): NodeListOf<Element> | null => {
  if (!isBrowser()) return null;
  try {
    return document.querySelectorAll(selector);
  } catch (error) {
    console.warn('Error querying DOM:', error);
    return null;
  }
};

/**
 * SSR-safe event listener management
 */
export const safeEventListener = {
  add: (
    element: Element | Window | Document | null,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): boolean => {
    if (!isBrowser() || !element) return false;
    try {
      element.addEventListener(event, handler, options);
      return true;
    } catch (error) {
      console.warn('Error adding event listener:', error);
      return false;
    }
  },

  remove: (
    element: Element | Window | Document | null,
    event: string,
    handler: EventListener,
    options?: EventListenerOptions
  ): boolean => {
    if (!isBrowser() || !element) return false;
    try {
      element.removeEventListener(event, handler, options);
      return true;
    } catch (error) {
      console.warn('Error removing event listener:', error);
      return false;
    }
  }
};

/**
 * SSR-safe viewport dimensions
 */
export const useViewportDimensions = () => {
  const [dimensions, setDimensions] = useState({
    width: 1024, // Default fallback values
    height: 768
  });

  useEffect(() => {
    if (!isBrowser()) return;

    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Set initial dimensions
    updateDimensions();

    // Listen for resize events
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return dimensions;
};

/**
 * SSR-safe media query hook
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (!isBrowser()) return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
};

/**
 * SSR-safe user agent detection
 */
export const useUserAgent = () => {
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    if (isBrowser()) {
      setUserAgent(navigator.userAgent);
    }
  }, []);

  return userAgent;
};

/**
 * Detect mobile devices
 */
export const useIsMobile = (): boolean => {
  const userAgent = useUserAgent();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  return isMobileUA || isSmallScreen;
};

/**
 * Detect touch support
 */
export const useHasTouchSupport = (): boolean => {
  const [hasTouch, setHasTouch] = useState(false);

  useEffect(() => {
    if (isBrowser()) {
      setHasTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - for older browsers
        navigator.msMaxTouchPoints > 0
      );
    }
  }, []);

  return hasTouch;
};
