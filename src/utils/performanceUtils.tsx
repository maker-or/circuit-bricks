/**
 * Performance Monitoring Utilities
 *
 * Utilities for monitoring and optimizing rendering performance in Circuit-Bricks.
 * These tools help track component render times, memory usage, and provide
 * insights for performance optimization.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { isBrowser } from './ssrUtils';

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  wireCount: number;
  memoryUsage?: number;
  timestamp: number;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, percentage of renders to measure
  maxSamples: number; // Maximum number of samples to keep
  logToConsole: boolean;
  trackMemory: boolean;
}

/**
 * Default performance configuration
 */
const defaultConfig: PerformanceConfig = {
  enabled: process.env.NODE_ENV === 'development',
  sampleRate: 0.1, // 10% of renders
  maxSamples: 100,
  logToConsole: false,
  trackMemory: true
};

/**
 * Performance monitor class
 */
class PerformanceMonitor {
  private config: PerformanceConfig;
  private samples: PerformanceMetrics[] = [];
  private observers: ((metrics: PerformanceMetrics) => void)[] = [];

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PerformanceConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if monitoring should occur for this render
   */
  shouldMeasure(): boolean {
    return this.config.enabled && Math.random() < this.config.sampleRate;
  }

  /**
   * Start measuring a render
   */
  startMeasure(label: string = 'circuit-render'): () => PerformanceMetrics | null {
    if (!this.shouldMeasure() || !isBrowser()) {
      return () => null;
    }

    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    return (componentCount: number = 0, wireCount: number = 0): PerformanceMetrics | null => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      const endMemory = this.getMemoryUsage();

      const metrics: PerformanceMetrics = {
        renderTime,
        componentCount,
        wireCount,
        memoryUsage: endMemory - startMemory,
        timestamp: Date.now()
      };

      this.addSample(metrics);
      return metrics;
    };
  }

  /**
   * Get memory usage (if available)
   */
  private getMemoryUsage(): number {
    if (!this.config.trackMemory || !isBrowser()) return 0;

    // @ts-ignore - performance.memory is not in all browsers
    const memory = (performance as any).memory;
    return memory ? memory.usedJSHeapSize : 0;
  }

  /**
   * Add a performance sample
   */
  private addSample(metrics: PerformanceMetrics) {
    this.samples.push(metrics);

    // Keep only the most recent samples
    if (this.samples.length > this.config.maxSamples) {
      this.samples = this.samples.slice(-this.config.maxSamples);
    }

    // Log to console if enabled
    if (this.config.logToConsole) {
      console.log('Circuit Performance:', metrics);
    }

    // Notify observers
    this.observers.forEach(observer => observer(metrics));
  }

  /**
   * Subscribe to performance updates
   */
  subscribe(observer: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.push(observer);
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * Get performance statistics
   */
  getStats() {
    if (this.samples.length === 0) {
      return null;
    }

    const renderTimes = this.samples.map(s => s.renderTime);
    const componentCounts = this.samples.map(s => s.componentCount);
    const wireCounts = this.samples.map(s => s.wireCount);

    return {
      sampleCount: this.samples.length,
      renderTime: {
        avg: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
        min: Math.min(...renderTimes),
        max: Math.max(...renderTimes),
        p95: this.percentile(renderTimes, 0.95),
        p99: this.percentile(renderTimes, 0.99)
      },
      componentCount: {
        avg: componentCounts.reduce((a, b) => a + b, 0) / componentCounts.length,
        min: Math.min(...componentCounts),
        max: Math.max(...componentCounts)
      },
      wireCount: {
        avg: wireCounts.reduce((a, b) => a + b, 0) / wireCounts.length,
        min: Math.min(...wireCounts),
        max: Math.max(...wireCounts)
      }
    };
  }

  /**
   * Calculate percentile
   */
  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }

  /**
   * Clear all samples
   */
  clearSamples() {
    this.samples = [];
  }

  /**
   * Export samples for analysis
   */
  exportSamples() {
    return [...this.samples];
  }
}

// Global performance monitor instance
const globalMonitor = new PerformanceMonitor();

/**
 * Hook for measuring component render performance
 */
export const useRenderPerformance = (
  componentName: string,
  componentCount: number = 0,
  wireCount: number = 0
) => {
  const measureRef = useRef<((componentCount?: number, wireCount?: number) => PerformanceMetrics | null) | null>(null);

  useEffect(() => {
    // Start measuring at the beginning of render
    measureRef.current = globalMonitor.startMeasure(`${componentName}-render`);

    // Finish measuring after render is complete
    return () => {
      if (measureRef.current) {
        measureRef.current(componentCount, wireCount);
      }
    };
  });
};

/**
 * Hook for subscribing to performance metrics
 */
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [stats, setStats] = useState(globalMonitor.getStats());

  useEffect(() => {
    const unsubscribe = globalMonitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      setStats(globalMonitor.getStats());
    });

    return unsubscribe;
  }, []);

  const clearMetrics = useCallback(() => {
    globalMonitor.clearSamples();
    setStats(null);
  }, []);

  const exportMetrics = useCallback(() => {
    return globalMonitor.exportSamples();
  }, []);

  return {
    latestMetrics: metrics,
    stats,
    clearMetrics,
    exportMetrics
  };
};

/**
 * Configure global performance monitoring
 */
export const configurePerformanceMonitoring = (config: Partial<PerformanceConfig>) => {
  globalMonitor.updateConfig(config);
};

/**
 * Performance-aware component wrapper
 */
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    useRenderPerformance(componentName);
    return <Component {...props} />;
  });
};

/**
 * Debounced function utility for performance optimization
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  return useCallback(
    ((...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => func(...args), delay);
    }) as T,
    [func, delay]
  );
};

/**
 * Throttled function utility for performance optimization
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        return func(...args);
      }
    }) as T,
    [func, delay]
  );
};

/**
 * Frame rate monitor
 */
export const useFrameRate = () => {
  const [fps, setFps] = useState(60);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    if (!isBrowser()) return;

    let animationId: number;

    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();

      if (currentTime - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return fps;
};

export { globalMonitor as performanceMonitor };
