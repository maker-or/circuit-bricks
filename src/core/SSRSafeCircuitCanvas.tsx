/**
 * SSR-Safe CircuitCanvas Component
 *
 * A server-side rendering safe wrapper around the main CircuitCanvas component.
 * This component handles hydration mismatches and ensures the circuit renders
 * correctly in SSR environments like Next.js, Gatsby, and Remix.
 */

import React, { useState, useEffect, forwardRef } from 'react';
import { CircuitCanvasProps } from './CircuitCanvas';
import { useIsClient } from '../utils/ssrUtils';

// Extended props for SSR-safe component
interface SSRSafeCircuitCanvasProps extends CircuitCanvasProps {
  className?: string;
  style?: React.CSSProperties;
}

// Lazy import the actual CircuitCanvas to enable code splitting
const CircuitCanvasImpl = React.lazy(() =>
  import('./CircuitCanvas').then(module => ({ default: module.default }))
);

/**
 * Loading placeholder component for SSR
 */
const CircuitCanvasPlaceholder: React.FC<{
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ width = '100%', height = '100%', className, style }) => (
  <div
    className={`circuit-canvas-loading ${className || ''}`}
    style={{
      width,
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '4px',
      color: '#6c757d',
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      ...style
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '8px' }}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animation: 'spin 1s linear infinite' }}
        >
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      </div>
      <div>Loading Circuit...</div>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  </div>
);

/**
 * Error boundary for circuit canvas
 */
class CircuitCanvasErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CircuitCanvas Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: '#dc3545',
            border: '1px solid #dc3545',
            borderRadius: '4px',
            backgroundColor: '#f8d7da'
          }}
        >
          <h4>Circuit Canvas Error</h4>
          <p>Failed to load the circuit canvas. Please refresh the page.</p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '10px', textAlign: 'left' }}>
              <summary>Error Details</summary>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * SSR-Safe CircuitCanvas component
 */
export const SSRSafeCircuitCanvas = forwardRef<SVGSVGElement, SSRSafeCircuitCanvasProps>(
  (props, ref) => {
    const { className, style, ...circuitProps } = props;
    const isClient = useIsClient();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      if (isClient) {
        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
          setIsLoaded(true);
        }, 0);

        return () => clearTimeout(timer);
      }
    }, [isClient]);

    // During SSR or before hydration, show placeholder
    if (!isClient || !isLoaded) {
      return (
        <CircuitCanvasPlaceholder
          width={props.width}
          height={props.height}
          className={className}
          style={style}
        />
      );
    }

    // After hydration, render the actual component with error boundary
    return (
      <CircuitCanvasErrorBoundary>
        <React.Suspense
          fallback={
            <CircuitCanvasPlaceholder
              width={props.width}
              height={props.height}
              className={className}
              style={style}
            />
          }
        >
          <CircuitCanvasImpl {...circuitProps} ref={ref} />
        </React.Suspense>
      </CircuitCanvasErrorBoundary>
    );
  }
);

SSRSafeCircuitCanvas.displayName = 'SSRSafeCircuitCanvas';

export default SSRSafeCircuitCanvas;
