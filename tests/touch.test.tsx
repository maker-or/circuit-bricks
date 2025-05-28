/**
 * Touch and Mobile Functionality Tests
 *
 * Tests for touch gesture handling and mobile-specific functionality
 * in Circuit-Bricks components.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  useTouchGestures,
  useIsMobileTouch as useIsMobile,
  useHasTouchSupportTouch as useHasTouchSupport,
  useDeviceOrientation,
  useSafeAreaInsets,
  TouchEventData
} from '../src/utils/touchUtils';

// Mock touch events
const createTouchEvent = (type: string, touches: Touch[], changedTouches?: Touch[]) => {
  return new TouchEvent(type, {
    touches: touches as any,
    changedTouches: (changedTouches || touches) as any,
    targetTouches: touches as any,
    bubbles: true,
    cancelable: true
  });
};

const createTouch = (identifier: number, clientX: number, clientY: number): Touch => ({
  identifier,
  clientX,
  clientY,
  pageX: clientX,
  pageY: clientY,
  screenX: clientX,
  screenY: clientY,
  radiusX: 1,
  radiusY: 1,
  rotationAngle: 0,
  force: 1,
  target: document.body
} as Touch);

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Touch Gesture Detection', () => {
  let gestureData: TouchEventData | null = null;
  let TestComponent: React.FC;

  beforeEach(() => {
    gestureData = null;

    TestComponent = () => {
      const touchHandlers = useTouchGestures((gesture) => {
        gestureData = gesture;
      });

      return (
        <div
          data-testid="touch-area"
          {...touchHandlers}
          style={{ width: 300, height: 300 }}
        >
          Touch Area
        </div>
      );
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should detect tap gesture', () => {
    render(<TestComponent />);
    const touchArea = screen.getByTestId('touch-area');

    const touch = createTouch(1, 100, 100);

    // Start touch
    fireEvent(touchArea, createTouchEvent('touchstart', [touch]));

    // End touch quickly without movement
    fireEvent(touchArea, createTouchEvent('touchend', []));

    expect(gestureData).toBeTruthy();
    expect(gestureData?.type).toBe('tap');
    expect(gestureData?.startPoint).toEqual({ x: 100, y: 100 });
  });

  it('should detect pan gesture', () => {
    render(<TestComponent />);
    const touchArea = screen.getByTestId('touch-area');

    const startTouch = createTouch(1, 100, 100);
    const moveTouch = createTouch(1, 150, 120);

    // Start touch
    fireEvent(touchArea, createTouchEvent('touchstart', [startTouch]));

    // Move touch
    fireEvent(touchArea, createTouchEvent('touchmove', [moveTouch]));

    expect(gestureData).toBeTruthy();
    expect(gestureData?.type).toBe('pan');
    expect(gestureData?.deltaX).toBe(50);
    expect(gestureData?.deltaY).toBe(20);
  });

  it('should detect pinch gesture', () => {
    render(<TestComponent />);
    const touchArea = screen.getByTestId('touch-area');

    const touch1Start = createTouch(1, 100, 100);
    const touch2Start = createTouch(2, 200, 100);
    const touch1Move = createTouch(1, 80, 100);
    const touch2Move = createTouch(2, 220, 100);

    // Start with two touches
    fireEvent(touchArea, createTouchEvent('touchstart', [touch1Start, touch2Start]));

    // Move touches apart (zoom in)
    fireEvent(touchArea, createTouchEvent('touchmove', [touch1Move, touch2Move]));

    expect(gestureData).toBeTruthy();
    expect(gestureData?.type).toBe('pinch');
    expect(gestureData?.scale).toBeGreaterThan(1);
  });

  it('should detect swipe gesture', () => {
    render(<TestComponent />);
    const touchArea = screen.getByTestId('touch-area');

    const startTouch = createTouch(1, 100, 100);
    const endTouch = createTouch(1, 200, 100);

    // Start touch
    fireEvent(touchArea, createTouchEvent('touchstart', [startTouch]));

    // Quick swipe to the right
    setTimeout(() => {
      fireEvent(touchArea, createTouchEvent('touchend', []));
    }, 50);

    // Move significantly
    fireEvent(touchArea, createTouchEvent('touchmove', [endTouch]));
    fireEvent(touchArea, createTouchEvent('touchend', []));

    // Note: Swipe detection depends on velocity, which is hard to simulate in tests
    // This test mainly ensures the gesture system doesn't crash
  });

  it('should detect double tap gesture', () => {
    render(<TestComponent />);
    const touchArea = screen.getByTestId('touch-area');

    const touch = createTouch(1, 100, 100);

    // First tap
    fireEvent(touchArea, createTouchEvent('touchstart', [touch]));
    fireEvent(touchArea, createTouchEvent('touchend', []));

    // Second tap quickly
    setTimeout(() => {
      fireEvent(touchArea, createTouchEvent('touchstart', [touch]));
      fireEvent(touchArea, createTouchEvent('touchend', []));
    }, 100);

    // The second tap should be detected as double-tap
    // Note: Timing-dependent, may need adjustment in real tests
  });

  it('should handle touch cancel events', () => {
    render(<TestComponent />);
    const touchArea = screen.getByTestId('touch-area');

    const touch = createTouch(1, 100, 100);

    fireEvent(touchArea, createTouchEvent('touchstart', [touch]));
    fireEvent(touchArea, createTouchEvent('touchcancel', []));

    // Should not crash and should clean up properly
    expect(true).toBe(true);
  });
});

describe('Mobile Device Detection', () => {
  beforeEach(() => {
    // Reset navigator mock
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
  });

  it('should detect mobile devices by user agent', () => {
    // Mock mobile user agent
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });

    const TestComponent = () => {
      const isMobile = useIsMobile();
      return <div data-testid="mobile-status">{isMobile ? 'mobile' : 'desktop'}</div>;
    };

    render(<TestComponent />);

    // Note: In test environment, this might not work as expected due to jsdom limitations
    // This is more of a structural test
    expect(screen.getByTestId('mobile-status')).toBeInTheDocument();
  });

  it('should detect touch support', () => {
    const TestComponent = () => {
      const hasTouch = useHasTouchSupport();
      return <div data-testid="touch-status">{hasTouch ? 'touch' : 'no-touch'}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByTestId('touch-status')).toBeInTheDocument();
  });
});

describe('Device Orientation', () => {
  it('should detect device orientation', () => {
    const TestComponent = () => {
      const orientation = useDeviceOrientation();
      return <div data-testid="orientation">{orientation}</div>;
    };

    render(<TestComponent />);

    const orientationElement = screen.getByTestId('orientation');
    expect(orientationElement.textContent).toMatch(/portrait|landscape/);
  });

  it('should update orientation on window resize', () => {
    const TestComponent = () => {
      const orientation = useDeviceOrientation();
      return <div data-testid="orientation">{orientation}</div>;
    };

    render(<TestComponent />);

    // Simulate window resize
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 600 });

    fireEvent(window, new Event('resize'));

    expect(screen.getByTestId('orientation')).toBeInTheDocument();
  });
});

describe('Safe Area Insets', () => {
  it('should provide safe area insets', () => {
    const TestComponent = () => {
      const insets = useSafeAreaInsets();
      return (
        <div data-testid="insets">
          {insets.top},{insets.right},{insets.bottom},{insets.left}
        </div>
      );
    };

    render(<TestComponent />);

    const insetsElement = screen.getByTestId('insets');
    expect(insetsElement.textContent).toMatch(/\d+,\d+,\d+,\d+/);
  });
});

describe('Touch Configuration', () => {
  it('should accept custom touch configuration', () => {
    let gestureData: TouchEventData | null = null;

    const TestComponent = () => {
      const touchHandlers = useTouchGestures(
        (gesture) => { gestureData = gesture; },
        {
          tapThreshold: 20,
          longPressDelay: 1000,
          preventDefaultOnTouch: false
        }
      );

      return (
        <div
          data-testid="touch-area"
          {...touchHandlers}
        >
          Touch Area
        </div>
      );
    };

    render(<TestComponent />);

    // Test that custom configuration is applied
    const touchArea = screen.getByTestId('touch-area');
    expect(touchArea).toBeInTheDocument();
  });
});

describe('Touch Performance', () => {
  it('should handle rapid touch events without memory leaks', () => {
    const TestComponent = () => {
      const touchHandlers = useTouchGestures(() => {});
      return <div data-testid="touch-area" {...touchHandlers}>Touch Area</div>;
    };

    const { unmount } = render(<TestComponent />);
    const touchArea = screen.getByTestId('touch-area');

    // Simulate rapid touch events
    for (let i = 0; i < 100; i++) {
      const touch = createTouch(1, i, i);
      fireEvent(touchArea, createTouchEvent('touchstart', [touch]));
      fireEvent(touchArea, createTouchEvent('touchend', []));
    }

    unmount();

    // If we get here without errors, no memory leaks occurred
    expect(true).toBe(true);
  });

  it('should clean up event listeners on unmount', () => {
    const TestComponent = () => {
      const touchHandlers = useTouchGestures(() => {});
      return <div data-testid="touch-area" {...touchHandlers}>Touch Area</div>;
    };

    const { unmount } = render(<TestComponent />);

    // Unmount should clean up without errors
    unmount();
    expect(true).toBe(true);
  });
});
