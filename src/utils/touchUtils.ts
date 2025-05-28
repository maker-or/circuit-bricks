/**
 * Touch and Mobile Utilities
 *
 * Utilities for handling touch interactions and mobile-specific functionality
 * in Circuit-Bricks. Provides enhanced touch gesture support for circuit
 * manipulation on mobile devices.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Point } from '../schemas/componentSchema';
import { isBrowser } from './ssrUtils';

/**
 * Touch gesture types
 */
export type TouchGesture = 'tap' | 'double-tap' | 'long-press' | 'pan' | 'pinch' | 'swipe';

/**
 * Touch event data
 */
export interface TouchEventData {
  type: TouchGesture;
  startPoint: Point;
  currentPoint: Point;
  deltaX: number;
  deltaY: number;
  distance: number;
  scale?: number;
  velocity?: Point;
  duration: number;
}

/**
 * Touch gesture configuration
 */
export interface TouchConfig {
  tapThreshold: number; // Maximum movement for tap (px)
  longPressDelay: number; // Long press delay (ms)
  doubleTapDelay: number; // Double tap max delay (ms)
  swipeThreshold: number; // Minimum distance for swipe (px)
  swipeVelocityThreshold: number; // Minimum velocity for swipe (px/ms)
  pinchThreshold: number; // Minimum scale change for pinch
  preventDefaultOnTouch: boolean;
}

/**
 * Default touch configuration
 */
const defaultTouchConfig: TouchConfig = {
  tapThreshold: 10,
  longPressDelay: 500,
  doubleTapDelay: 300,
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.5,
  pinchThreshold: 0.1,
  preventDefaultOnTouch: true
};

/**
 * Touch state interface
 */
interface TouchState {
  isActive: boolean;
  startTime: number;
  startPoint: Point;
  currentPoint: Point;
  lastTapTime: number;
  touches: Touch[];
  initialDistance?: number;
  initialScale: number;
}

/**
 * Calculate distance between two points
 */
const getDistance = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate distance between two touches
 */
const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
  return getDistance(
    { x: touch1.clientX, y: touch1.clientY },
    { x: touch2.clientX, y: touch2.clientY }
  );
};

/**
 * Get touch point from touch event
 */
const getTouchPoint = (touch: Touch): Point => ({
  x: touch.clientX,
  y: touch.clientY
});

/**
 * Hook for handling touch gestures
 */
export const useTouchGestures = (
  onGesture: (gesture: TouchEventData) => void,
  config: Partial<TouchConfig> = {}
) => {
  const touchConfig = { ...defaultTouchConfig, ...config };
  const stateRef = useRef<TouchState>({
    isActive: false,
    startTime: 0,
    startPoint: { x: 0, y: 0 },
    currentPoint: { x: 0, y: 0 },
    lastTapTime: 0,
    touches: [],
    initialScale: 1
  });
  const longPressTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = undefined;
    }
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (touchConfig.preventDefaultOnTouch) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    const currentTime = Date.now();
    const touchPoint = getTouchPoint(touch);

    stateRef.current = {
      isActive: true,
      startTime: currentTime,
      startPoint: touchPoint,
      currentPoint: touchPoint,
      lastTapTime: stateRef.current.lastTapTime,
      touches: Array.from(event.touches),
      initialScale: 1
    };

    // Set up long press detection
    longPressTimerRef.current = setTimeout(() => {
      if (stateRef.current.isActive) {
        const distance = getDistance(stateRef.current.startPoint, stateRef.current.currentPoint);
        if (distance < touchConfig.tapThreshold) {
          onGesture({
            type: 'long-press',
            startPoint: stateRef.current.startPoint,
            currentPoint: stateRef.current.currentPoint,
            deltaX: 0,
            deltaY: 0,
            distance: 0,
            duration: currentTime - stateRef.current.startTime
          });
        }
      }
    }, touchConfig.longPressDelay);

    // Handle pinch start
    if (event.touches.length === 2) {
      stateRef.current.initialDistance = getTouchDistance(event.touches[0], event.touches[1]);
    }
  }, [onGesture, touchConfig]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!stateRef.current.isActive) return;

    if (touchConfig.preventDefaultOnTouch) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    const currentPoint = getTouchPoint(touch);
    const currentTime = Date.now();

    stateRef.current.currentPoint = currentPoint;
    stateRef.current.touches = Array.from(event.touches);

    const deltaX = currentPoint.x - stateRef.current.startPoint.x;
    const deltaY = currentPoint.y - stateRef.current.startPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = currentTime - stateRef.current.startTime;

    // Clear long press if moved too much
    if (distance > touchConfig.tapThreshold) {
      clearLongPressTimer();
    }

    // Handle pinch gesture
    if (event.touches.length === 2 && stateRef.current.initialDistance) {
      const currentDistance = getTouchDistance(event.touches[0], event.touches[1]);
      const scale = currentDistance / stateRef.current.initialDistance;

      if (Math.abs(scale - stateRef.current.initialScale) > touchConfig.pinchThreshold) {
        onGesture({
          type: 'pinch',
          startPoint: stateRef.current.startPoint,
          currentPoint,
          deltaX,
          deltaY,
          distance,
          scale,
          duration
        });
        stateRef.current.initialScale = scale;
      }
    }
    // Handle pan gesture
    else if (event.touches.length === 1 && distance > touchConfig.tapThreshold) {
      const velocity = {
        x: deltaX / Math.max(duration, 1),
        y: deltaY / Math.max(duration, 1)
      };

      onGesture({
        type: 'pan',
        startPoint: stateRef.current.startPoint,
        currentPoint,
        deltaX,
        deltaY,
        distance,
        velocity,
        duration
      });
    }
  }, [onGesture, touchConfig, clearLongPressTimer]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!stateRef.current.isActive) return;

    if (touchConfig.preventDefaultOnTouch) {
      event.preventDefault();
    }

    clearLongPressTimer();

    const currentTime = Date.now();
    const deltaX = stateRef.current.currentPoint.x - stateRef.current.startPoint.x;
    const deltaY = stateRef.current.currentPoint.y - stateRef.current.startPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = currentTime - stateRef.current.startTime;

    // Handle tap gestures
    if (distance < touchConfig.tapThreshold && duration < touchConfig.longPressDelay) {
      const timeSinceLastTap = currentTime - stateRef.current.lastTapTime;

      if (timeSinceLastTap < touchConfig.doubleTapDelay) {
        // Double tap
        onGesture({
          type: 'double-tap',
          startPoint: stateRef.current.startPoint,
          currentPoint: stateRef.current.currentPoint,
          deltaX: 0,
          deltaY: 0,
          distance: 0,
          duration
        });
        stateRef.current.lastTapTime = 0; // Reset to prevent triple tap
      } else {
        // Single tap
        onGesture({
          type: 'tap',
          startPoint: stateRef.current.startPoint,
          currentPoint: stateRef.current.currentPoint,
          deltaX: 0,
          deltaY: 0,
          distance: 0,
          duration
        });
        stateRef.current.lastTapTime = currentTime;
      }
    }
    // Handle swipe gestures
    else if (distance > touchConfig.swipeThreshold) {
      const velocity = {
        x: deltaX / Math.max(duration, 1),
        y: deltaY / Math.max(duration, 1)
      };
      const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

      if (velocityMagnitude > touchConfig.swipeVelocityThreshold) {
        onGesture({
          type: 'swipe',
          startPoint: stateRef.current.startPoint,
          currentPoint: stateRef.current.currentPoint,
          deltaX,
          deltaY,
          distance,
          velocity,
          duration
        });
      }
    }

    stateRef.current.isActive = false;
  }, [onGesture, touchConfig, clearLongPressTimer]);

  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd
  };

  return touchHandlers;
};

/**
 * Hook for detecting device orientation
 */
export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    if (!isBrowser()) return;

    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
};

/**
 * Hook for safe area insets (for devices with notches)
 */
export const useSafeAreaInsets = () => {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    if (!isBrowser()) return;

    const updateInsets = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      setInsets({
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0')
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);

    return () => {
      window.removeEventListener('resize', updateInsets);
    };
  }, []);

  return insets;
};

/**
 * Prevent zoom on double tap (iOS Safari)
 */
export const usePreventZoom = (enabled: boolean = true) => {
  useEffect(() => {
    if (!isBrowser() || !enabled) return;

    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventZoom = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('touchstart', preventDefault, { passive: false });
    document.addEventListener('gesturestart', preventZoom, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventDefault);
      document.removeEventListener('gesturestart', preventZoom);
    };
  }, [enabled]);
};

/**
 * SSR-safe user agent detection (internal)
 */
const useUserAgentInternal = () => {
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    if (isBrowser()) {
      setUserAgent(navigator.userAgent);
    }
  }, []);

  return userAgent;
};

/**
 * SSR-safe media query hook (internal)
 */
const useMediaQueryInternal = (query: string): boolean => {
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
 * Detect mobile devices
 */
export const useIsMobileTouch = (): boolean => {
  const userAgent = useUserAgentInternal();
  const isSmallScreen = useMediaQueryInternal('(max-width: 768px)');

  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  return isMobileUA || isSmallScreen;
};

/**
 * Detect touch support
 */
export const useHasTouchSupportTouch = (): boolean => {
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
