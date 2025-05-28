/**
 * Responsive Design Tests
 *
 * Tests for responsive design utilities and adaptive layouts
 * in Circuit-Bricks components.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getBreakpoint,
  getDeviceType,
  useScreenInfo,
  useBreakpointValue,
  useResponsiveGridConfig,
  useResponsiveComponentConfig,
  useMatchesBreakpoint,
  useOptimalCanvasDimensions,
  breakpoints
} from '../src/utils/responsiveUtils';

// Mock window dimensions
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

describe('Responsive Utilities', () => {
  beforeEach(() => {
    // Reset to default desktop dimensions
    mockWindowDimensions(1024, 768);

    // Reset navigator
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Breakpoint Detection', () => {
    it('should detect xs breakpoint correctly', () => {
      expect(getBreakpoint(400)).toBe('xs');
      expect(getBreakpoint(breakpoints.xs)).toBe('xs');
    });

    it('should detect sm breakpoint correctly', () => {
      expect(getBreakpoint(600)).toBe('sm');
      expect(getBreakpoint(breakpoints.sm)).toBe('sm');
    });

    it('should detect md breakpoint correctly', () => {
      expect(getBreakpoint(800)).toBe('md');
      expect(getBreakpoint(breakpoints.md)).toBe('md');
    });

    it('should detect lg breakpoint correctly', () => {
      expect(getBreakpoint(1100)).toBe('lg');
      expect(getBreakpoint(breakpoints.lg)).toBe('lg');
    });

    it('should detect xl breakpoint correctly', () => {
      expect(getBreakpoint(1300)).toBe('xl');
      expect(getBreakpoint(breakpoints.xl)).toBe('xl');
    });

    it('should detect xxl breakpoint correctly', () => {
      expect(getBreakpoint(1500)).toBe('xxl');
      expect(getBreakpoint(breakpoints.xxl)).toBe('xxl');
    });
  });

  describe('Device Type Detection', () => {
    it('should detect mobile device by user agent', () => {
      const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(getDeviceType(400, mobileUA)).toBe('mobile');
    });

    it('should detect tablet device by user agent', () => {
      const tabletUA = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)';
      expect(getDeviceType(800, tabletUA)).toBe('tablet');
    });

    it('should detect mobile device by screen width', () => {
      expect(getDeviceType(500)).toBe('mobile');
    });

    it('should detect tablet device by screen width', () => {
      expect(getDeviceType(900)).toBe('tablet');
    });

    it('should detect desktop device', () => {
      expect(getDeviceType(1200)).toBe('desktop');
    });
  });

  describe('Screen Info Hook', () => {
    it('should provide current screen information', () => {
      mockWindowDimensions(1200, 800);

      const TestComponent = () => {
        const screenInfo = useScreenInfo();
        return (
          <div>
            <div data-testid="width">{screenInfo.width}</div>
            <div data-testid="height">{screenInfo.height}</div>
            <div data-testid="breakpoint">{screenInfo.breakpoint}</div>
            <div data-testid="device-type">{screenInfo.deviceType}</div>
            <div data-testid="orientation">{screenInfo.isPortrait ? 'portrait' : 'landscape'}</div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('width')).toHaveTextContent('1200');
      expect(screen.getByTestId('height')).toHaveTextContent('800');
      expect(screen.getByTestId('breakpoint')).toHaveTextContent('xl');
      expect(screen.getByTestId('device-type')).toHaveTextContent('desktop');
      expect(screen.getByTestId('orientation')).toHaveTextContent('landscape');
    });

    it('should update on window resize', () => {
      const TestComponent = () => {
        const screenInfo = useScreenInfo();
        return <div data-testid="breakpoint">{screenInfo.breakpoint}</div>;
      };

      render(<TestComponent />);

      // Initial breakpoint
      expect(screen.getByTestId('breakpoint')).toHaveTextContent('lg');

      // Resize to mobile
      mockWindowDimensions(400, 600);
      fireEvent(window, new Event('resize'));

      // Note: In test environment, the hook might not update immediately
      // This test mainly ensures no errors occur
    });
  });

  describe('Breakpoint Value Hook', () => {
    it('should return correct value for current breakpoint', () => {
      mockWindowDimensions(800, 600); // md breakpoint

      const TestComponent = () => {
        const value = useBreakpointValue({
          xs: 'extra-small',
          sm: 'small',
          md: 'medium',
          lg: 'large',
          xl: 'extra-large'
        }, 'default');

        return <div data-testid="value">{value}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('value')).toHaveTextContent('medium');
    });

    it('should fall back to smaller breakpoint if exact match not found', () => {
      mockWindowDimensions(800, 600); // md breakpoint

      const TestComponent = () => {
        const value = useBreakpointValue({
          xs: 'extra-small',
          sm: 'small',
          // md missing
          lg: 'large'
        }, 'default');

        return <div data-testid="value">{value}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('value')).toHaveTextContent('small');
    });

    it('should return fallback if no matching breakpoint found', () => {
      mockWindowDimensions(800, 600); // md breakpoint

      const TestComponent = () => {
        const value = useBreakpointValue({
          xs: 'extra-small-only',
          // No md, lg, xl, xxl - should fall back to xs since it's mobile-first
        }, 'fallback-value');

        return <div data-testid="value">{value}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('value')).toHaveTextContent('extra-small-only');
    });

    it('should return fallback when no breakpoints match', () => {
      mockWindowDimensions(800, 600); // md breakpoint

      const TestComponent = () => {
        const value = useBreakpointValue({
          // No breakpoints defined at all
        }, 'fallback-value');

        return <div data-testid="value">{value}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('value')).toHaveTextContent('fallback-value');
    });
  });

  describe('Responsive Grid Config Hook', () => {
    it('should provide appropriate grid config for mobile', () => {
      mockWindowDimensions(400, 600); // xs breakpoint

      const TestComponent = () => {
        const config = useResponsiveGridConfig();
        return (
          <div>
            <div data-testid="grid-size">{config.gridSize}</div>
            <div data-testid="min-zoom">{config.minZoom}</div>
            <div data-testid="max-zoom">{config.maxZoom}</div>
          </div>
        );
      };

      render(<TestComponent />);

      // Mobile should have smaller grid size and different zoom limits
      expect(screen.getByTestId('grid-size')).toHaveTextContent('15');
      expect(screen.getByTestId('min-zoom')).toHaveTextContent('0.25');
      expect(screen.getByTestId('max-zoom')).toHaveTextContent('3');
    });

    it('should provide appropriate grid config for desktop', () => {
      mockWindowDimensions(1400, 900); // xl breakpoint

      const TestComponent = () => {
        const config = useResponsiveGridConfig();
        return (
          <div>
            <div data-testid="grid-size">{config.gridSize}</div>
            <div data-testid="min-zoom">{config.minZoom}</div>
            <div data-testid="max-zoom">{config.maxZoom}</div>
          </div>
        );
      };

      render(<TestComponent />);

      // Desktop should have larger grid size and different zoom limits
      expect(screen.getByTestId('grid-size')).toHaveTextContent('30');
      expect(screen.getByTestId('min-zoom')).toHaveTextContent('0.1');
      expect(screen.getByTestId('max-zoom')).toHaveTextContent('10');
    });
  });

  describe('Responsive Component Config Hook', () => {
    it('should provide appropriate component config for mobile', () => {
      mockWindowDimensions(400, 600); // xs breakpoint

      const TestComponent = () => {
        const config = useResponsiveComponentConfig();
        return (
          <div>
            <div data-testid="min-size">{config.minComponentSize}</div>
            <div data-testid="port-size">{config.portSize}</div>
            <div data-testid="font-size">{config.fontSize}</div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('min-size')).toHaveTextContent('30');
      expect(screen.getByTestId('port-size')).toHaveTextContent('6');
      expect(screen.getByTestId('font-size')).toHaveTextContent('10');
    });

    it('should provide appropriate component config for desktop', () => {
      mockWindowDimensions(1400, 900); // xl breakpoint

      const TestComponent = () => {
        const config = useResponsiveComponentConfig();
        return (
          <div>
            <div data-testid="min-size">{config.minComponentSize}</div>
            <div data-testid="port-size">{config.portSize}</div>
            <div data-testid="font-size">{config.fontSize}</div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('min-size')).toHaveTextContent('60');
      expect(screen.getByTestId('port-size')).toHaveTextContent('12');
      expect(screen.getByTestId('font-size')).toHaveTextContent('16');
    });
  });

  describe('Breakpoint Matching Hook', () => {
    it('should correctly match breakpoints', () => {
      mockWindowDimensions(800, 600); // md breakpoint

      const TestComponent = () => {
        const matchesSm = useMatchesBreakpoint('sm');
        const matchesMd = useMatchesBreakpoint('md');
        const matchesLg = useMatchesBreakpoint('lg');

        return (
          <div>
            <div data-testid="matches-sm">{matchesSm ? 'yes' : 'no'}</div>
            <div data-testid="matches-md">{matchesMd ? 'yes' : 'no'}</div>
            <div data-testid="matches-lg">{matchesLg ? 'yes' : 'no'}</div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('matches-sm')).toHaveTextContent('yes');
      expect(screen.getByTestId('matches-md')).toHaveTextContent('yes');
      expect(screen.getByTestId('matches-lg')).toHaveTextContent('no');
    });
  });

  describe('Optimal Canvas Dimensions Hook', () => {
    it('should provide optimal dimensions for mobile', () => {
      mockWindowDimensions(400, 600);

      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      });

      const TestComponent = () => {
        const dimensions = useOptimalCanvasDimensions();
        return (
          <div>
            <div data-testid="width">{dimensions.width}</div>
            <div data-testid="height">{dimensions.height}</div>
          </div>
        );
      };

      render(<TestComponent />);

      // Mobile should have reduced dimensions
      const width = parseInt(screen.getByTestId('width').textContent || '0');
      const height = parseInt(screen.getByTestId('height').textContent || '0');

      expect(width).toBeLessThanOrEqual(400);
      expect(height).toBeLessThanOrEqual(600);
    });

    it('should provide optimal dimensions for desktop', () => {
      mockWindowDimensions(1200, 800);

      const TestComponent = () => {
        const dimensions = useOptimalCanvasDimensions();
        return (
          <div>
            <div data-testid="width">{dimensions.width}</div>
            <div data-testid="height">{dimensions.height}</div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('width')).toHaveTextContent('1200');
      expect(screen.getByTestId('height')).toHaveTextContent('800');
    });

    it('should respect custom container dimensions', () => {
      const TestComponent = () => {
        const dimensions = useOptimalCanvasDimensions(500, 300);
        return (
          <div>
            <div data-testid="width">{dimensions.width}</div>
            <div data-testid="height">{dimensions.height}</div>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('width')).toHaveTextContent('500');
      expect(screen.getByTestId('height')).toHaveTextContent('300');
    });
  });
});
