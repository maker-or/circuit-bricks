/**
 * Responsive Design Utilities
 *
 * Utilities for handling responsive design and adaptive layouts
 * in Circuit-Bricks across different screen sizes and devices.
 */

import { useState, useEffect } from 'react';
import { isBrowser } from './ssrUtils';

/**
 * Breakpoint definitions
 */
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Device type detection
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Screen size information
 */
export interface ScreenInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  deviceType: DeviceType;
  isPortrait: boolean;
  isLandscape: boolean;
  pixelRatio: number;
}

/**
 * Get current breakpoint based on width
 */
export const getBreakpoint = (width: number): Breakpoint => {
  if (width >= breakpoints.xxl) return 'xxl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

/**
 * Get device type based on width and user agent
 */
export const getDeviceType = (width: number, userAgent: string = ''): DeviceType => {
  // Check user agent for mobile/tablet indicators
  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTabletUA = /iPad|Android(?!.*Mobile)/i.test(userAgent);

  if (isMobileUA || width < breakpoints.md) return 'mobile';
  if (isTabletUA || (width >= breakpoints.md && width < breakpoints.lg)) return 'tablet';
  return 'desktop';
};

/**
 * Hook for responsive screen information
 */
export const useScreenInfo = (): ScreenInfo => {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>({
    width: 1024,
    height: 768,
    breakpoint: 'lg',
    deviceType: 'desktop',
    isPortrait: false,
    isLandscape: true,
    pixelRatio: 1
  });

  useEffect(() => {
    if (!isBrowser()) return;

    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const breakpoint = getBreakpoint(width);
      const deviceType = getDeviceType(width, navigator.userAgent);
      const isPortrait = height > width;
      const isLandscape = !isPortrait;
      const pixelRatio = window.devicePixelRatio || 1;

      setScreenInfo({
        width,
        height,
        breakpoint,
        deviceType,
        isPortrait,
        isLandscape,
        pixelRatio
      });
    };

    updateScreenInfo();

    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  return screenInfo;
};

/**
 * Hook for breakpoint-specific values
 */
export const useBreakpointValue = <T>(values: Partial<Record<Breakpoint, T>>, fallback: T): T => {
  const { breakpoint } = useScreenInfo();

  // Find the best matching value for current breakpoint
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  // Look for exact match first
  if (values[breakpoint] !== undefined) {
    return values[breakpoint]!;
  }

  // Look for smaller breakpoints (mobile-first approach)
  for (let i = currentIndex - 1; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }

  // Look for larger breakpoints only if no smaller ones found
  for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }

  return fallback;
};

/**
 * Responsive grid configuration
 */
export interface ResponsiveGridConfig {
  gridSize: number;
  snapThreshold: number;
  minZoom: number;
  maxZoom: number;
  zoomStep: number;
  panSensitivity: number;
}

/**
 * Get responsive grid configuration based on device type
 */
export const useResponsiveGridConfig = (): ResponsiveGridConfig => {
  const { deviceType } = useScreenInfo();

  return useBreakpointValue<ResponsiveGridConfig>({
    xs: {
      gridSize: 15,
      snapThreshold: 12,
      minZoom: 0.25,
      maxZoom: 3,
      zoomStep: 0.15,
      panSensitivity: 1.2
    },
    sm: {
      gridSize: 18,
      snapThreshold: 15,
      minZoom: 0.3,
      maxZoom: 4,
      zoomStep: 0.2,
      panSensitivity: 1.1
    },
    md: {
      gridSize: 20,
      snapThreshold: 18,
      minZoom: 0.4,
      maxZoom: 5,
      zoomStep: 0.25,
      panSensitivity: 1.0
    },
    lg: {
      gridSize: 25,
      snapThreshold: 20,
      minZoom: 0.5,
      maxZoom: 8,
      zoomStep: 0.3,
      panSensitivity: 0.9
    },
    xl: {
      gridSize: 30,
      snapThreshold: 25,
      minZoom: 0.1,
      maxZoom: 10,
      zoomStep: 0.5,
      panSensitivity: 0.8
    }
  }, {
    gridSize: 20,
    snapThreshold: 18,
    minZoom: 0.1,
    maxZoom: 10,
    zoomStep: 0.25,
    panSensitivity: 1.0
  });
};

/**
 * Responsive component sizing
 */
export interface ResponsiveComponentConfig {
  minComponentSize: number;
  maxComponentSize: number;
  portSize: number;
  wireStrokeWidth: number;
  fontSize: number;
  iconSize: number;
}

/**
 * Get responsive component configuration
 */
export const useResponsiveComponentConfig = (): ResponsiveComponentConfig => {
  return useBreakpointValue<ResponsiveComponentConfig>({
    xs: {
      minComponentSize: 30,
      maxComponentSize: 80,
      portSize: 6,
      wireStrokeWidth: 2,
      fontSize: 10,
      iconSize: 16
    },
    sm: {
      minComponentSize: 35,
      maxComponentSize: 90,
      portSize: 7,
      wireStrokeWidth: 2.5,
      fontSize: 11,
      iconSize: 18
    },
    md: {
      minComponentSize: 40,
      maxComponentSize: 100,
      portSize: 8,
      wireStrokeWidth: 3,
      fontSize: 12,
      iconSize: 20
    },
    lg: {
      minComponentSize: 50,
      maxComponentSize: 120,
      portSize: 10,
      wireStrokeWidth: 3,
      fontSize: 14,
      iconSize: 24
    },
    xl: {
      minComponentSize: 60,
      maxComponentSize: 150,
      portSize: 12,
      wireStrokeWidth: 4,
      fontSize: 16,
      iconSize: 28
    }
  }, {
    minComponentSize: 40,
    maxComponentSize: 100,
    portSize: 8,
    wireStrokeWidth: 3,
    fontSize: 12,
    iconSize: 20
  });
};

/**
 * Check if current screen matches a breakpoint
 */
export const useMatchesBreakpoint = (targetBreakpoint: Breakpoint): boolean => {
  const { breakpoint } = useScreenInfo();
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  const targetIndex = breakpointOrder.indexOf(targetBreakpoint);

  return currentIndex >= targetIndex;
};

/**
 * Get optimal canvas dimensions for current screen
 */
export const useOptimalCanvasDimensions = (
  containerWidth?: number,
  containerHeight?: number
): { width: number; height: number } => {
  const { width: screenWidth, height: screenHeight, deviceType } = useScreenInfo();

  const width = containerWidth || screenWidth;
  const height = containerHeight || screenHeight;

  // Adjust for mobile devices to account for virtual keyboards and UI
  if (deviceType === 'mobile') {
    return {
      width: Math.min(width, screenWidth * 0.95),
      height: Math.min(height, screenHeight * 0.8)
    };
  }

  if (deviceType === 'tablet') {
    return {
      width: Math.min(width, screenWidth * 0.98),
      height: Math.min(height, screenHeight * 0.9)
    };
  }

  return { width, height };
};
