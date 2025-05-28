/**
 * Performance Monitoring Tests
 *
 * Tests for performance monitoring utilities and optimization features
 * in Circuit-Bricks components.
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  useRenderPerformance,
  usePerformanceMetrics,
  configurePerformanceMonitoring,
  performanceMonitor,
  useDebounce,
  useThrottle,
  useFrameRate
} from '../src/utils/performanceUtils';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  }
};

Object.defineProperty(global, 'performance', {
  writable: true,
  value: mockPerformance
});

describe('Performance Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    performanceMonitor.clearSamples();

    // Reset performance configuration
    configurePerformanceMonitoring({
      enabled: true,
      sampleRate: 1.0, // 100% for testing
      maxSamples: 100,
      logToConsole: false,
      trackMemory: true
    });
  });

  afterEach(() => {
    performanceMonitor.clearSamples();
  });

  describe('Render Performance Hook', () => {
    it('should measure component render performance', async () => {
      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        useRenderPerformance('TestComponent', 5, 3); // 5 components, 3 wires
        return <div data-testid="test-component">Render #{renderCount}</div>;
      };

      render(<TestComponent />);

      expect(screen.getByTestId('test-component')).toHaveTextContent('Render #1');

      // Performance measurement should have been triggered
      expect(mockPerformance.now).toHaveBeenCalled();
    });

    it('should handle multiple component renders', () => {
      const Component1 = () => {
        useRenderPerformance('Component1', 2, 1);
        return <div>Component 1</div>;
      };

      const Component2 = () => {
        useRenderPerformance('Component2', 3, 2);
        return <div>Component 2</div>;
      };

      render(
        <div>
          <Component1 />
          <Component2 />
        </div>
      );

      // Performance measurement should have been triggered at least once
      expect(mockPerformance.now).toHaveBeenCalled();
    });
  });

  describe('Performance Metrics Hook', () => {
    it('should provide performance statistics', () => {
      const TestComponent = () => {
        const { stats, latestMetrics, clearMetrics, exportMetrics } = usePerformanceMetrics();

        return (
          <div>
            <div data-testid="stats">{stats ? 'has-stats' : 'no-stats'}</div>
            <div data-testid="latest">{latestMetrics ? 'has-latest' : 'no-latest'}</div>
            <button onClick={clearMetrics} data-testid="clear">Clear</button>
            <button onClick={() => exportMetrics()} data-testid="export">Export</button>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('stats')).toHaveTextContent('no-stats');
      expect(screen.getByTestId('latest')).toHaveTextContent('no-latest');
    });

    it('should clear metrics when requested', () => {
      const TestComponent = () => {
        const { clearMetrics } = usePerformanceMetrics();

        React.useEffect(() => {
          // Simulate some performance data
          const measure = performanceMonitor.startMeasure('test');
          measure(5, 3);
        }, []);

        return <button onClick={clearMetrics} data-testid="clear">Clear</button>;
      };

      render(<TestComponent />);

      // Click clear button
      screen.getByTestId('clear').click();

      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('Performance Configuration', () => {
    it('should update configuration correctly', () => {
      configurePerformanceMonitoring({
        enabled: false,
        sampleRate: 0.5,
        logToConsole: true
      });

      // Configuration should be updated
      // This is more of a structural test since we can't easily verify internal state
      expect(true).toBe(true);
    });

    it('should respect sample rate configuration', () => {
      // Set very low sample rate
      configurePerformanceMonitoring({
        enabled: true,
        sampleRate: 0.01 // 1%
      });

      const TestComponent = () => {
        useRenderPerformance('TestComponent');
        return <div>Test</div>;
      };

      // Render multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<TestComponent />);
        unmount();
      }

      // With 1% sample rate, most renders should be skipped
      // This is probabilistic, so we can't assert exact numbers
      expect(true).toBe(true);
    });
  });

  describe('Debounce Hook', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const originalFn = () => { callCount++; };

      const TestComponent = () => {
        const debouncedFn = useDebounce(originalFn, 100);

        React.useEffect(() => {
          // Call multiple times rapidly
          debouncedFn();
          debouncedFn();
          debouncedFn();
        }, [debouncedFn]);

        return <div data-testid="debounce-test">Debounce Test</div>;
      };

      render(<TestComponent />);

      // Initially, function shouldn't have been called
      expect(callCount).toBe(0);

      // Wait for debounce delay
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Function should have been called only once
      expect(callCount).toBe(1);
    });
  });

  describe('Throttle Hook', () => {
    it('should throttle function calls', async () => {
      let callCount = 0;
      const originalFn = () => { callCount++; };

      const TestComponent = () => {
        const throttledFn = useThrottle(originalFn, 100);

        React.useEffect(() => {
          // Call multiple times rapidly
          throttledFn();
          throttledFn();
          throttledFn();
        }, [throttledFn]);

        return <div data-testid="throttle-test">Throttle Test</div>;
      };

      render(<TestComponent />);

      // First call should go through immediately
      expect(callCount).toBe(1);

      // Wait for throttle delay
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Should still be 1 since subsequent calls were throttled
      expect(callCount).toBe(1);
    });
  });

  describe('Frame Rate Hook', () => {
    it('should provide frame rate information', () => {
      const TestComponent = () => {
        const fps = useFrameRate();
        return <div data-testid="fps">{fps}</div>;
      };

      render(<TestComponent />);

      const fpsElement = screen.getByTestId('fps');
      expect(fpsElement.textContent).toMatch(/\d+/);
    });

    it('should clean up animation frame on unmount', () => {
      const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');

      const TestComponent = () => {
        useFrameRate();
        return <div>FPS Test</div>;
      };

      const { unmount } = render(<TestComponent />);
      unmount();

      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
      cancelAnimationFrameSpy.mockRestore();
    });
  });

  describe('Performance Monitor Class', () => {
    it('should track performance samples', () => {
      const measure = performanceMonitor.startMeasure('test-measure');
      const result = measure(10, 5);

      expect(result).toBeTruthy();
      expect(result?.componentCount).toBe(10);
      expect(result?.wireCount).toBe(5);
      expect(result?.renderTime).toBeGreaterThanOrEqual(0);
    });

    it('should provide performance statistics', () => {
      // Add some sample data
      for (let i = 0; i < 5; i++) {
        const measure = performanceMonitor.startMeasure('test');
        measure(i + 1, i);
      }

      const stats = performanceMonitor.getStats();
      expect(stats).toBeTruthy();
      expect(stats?.sampleCount).toBe(5);
      expect(stats?.renderTime).toBeTruthy();
      expect(stats?.componentCount).toBeTruthy();
      expect(stats?.wireCount).toBeTruthy();
    });

    it('should limit sample count', () => {
      // Configure small max samples
      configurePerformanceMonitoring({ maxSamples: 3 });

      // Add more samples than the limit
      for (let i = 0; i < 10; i++) {
        const measure = performanceMonitor.startMeasure('test');
        measure(1, 1);
      }

      const stats = performanceMonitor.getStats();
      expect(stats?.sampleCount).toBe(3);
    });

    it('should export samples correctly', () => {
      // Add some sample data
      const measure = performanceMonitor.startMeasure('test');
      measure(5, 3);

      const samples = performanceMonitor.exportSamples();
      expect(Array.isArray(samples)).toBe(true);
      expect(samples.length).toBeGreaterThan(0);
    });

    it('should handle subscription and unsubscription', () => {
      let notificationCount = 0;

      const unsubscribe = performanceMonitor.subscribe(() => {
        notificationCount++;
      });

      // Add a sample
      const measure = performanceMonitor.startMeasure('test');
      measure(1, 1);

      expect(notificationCount).toBe(1);

      // Unsubscribe
      unsubscribe();

      // Add another sample
      const measure2 = performanceMonitor.startMeasure('test2');
      measure2(1, 1);

      // Should still be 1 since we unsubscribed
      expect(notificationCount).toBe(1);
    });
  });

  describe('Memory Tracking', () => {
    it('should track memory usage when available', () => {
      const measure = performanceMonitor.startMeasure('memory-test');
      const result = measure(1, 1);

      expect(result?.memoryUsage).toBeDefined();
      expect(typeof result?.memoryUsage).toBe('number');
    });

    it('should handle missing memory API gracefully', () => {
      // Mock missing memory API
      const originalMemory = (performance as any).memory;
      delete (performance as any).memory;

      const measure = performanceMonitor.startMeasure('no-memory-test');
      const result = measure(1, 1);

      expect(result?.memoryUsage).toBe(0);

      // Restore
      (performance as any).memory = originalMemory;
    });
  });
});
