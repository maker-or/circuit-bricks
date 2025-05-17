import '@testing-library/jest-dom';

// Mock SVG namespace functions that jsdom doesn't implement
// Using type assertions to bypass TypeScript's strict checking for tests
(SVGElement.prototype as any).getBBox = function() {
  return {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    toString: () => '',
  } as DOMRect;
};

(SVGElement.prototype as any).getScreenCTM = function() {
  return {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0,
    inverse: function() {
      return {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
        multiplySelf: function() { return this; },
      } as DOMMatrix;
    },
    multiplySelf: function() { return this; },
  } as DOMMatrix;
};

// Mock createSVGPoint with proper DOMPoint properties
(SVGSVGElement.prototype as any).createSVGPoint = function() {
  return {
    x: 0,
    y: 0,
    w: 1,  // Required by DOMPoint interface
    z: 0,  // Required by DOMPoint interface
    matrixTransform: function(matrix: any) {
      // Apply actual transformation if matrix is provided
      if (matrix && typeof matrix.a === 'number') {
        return { 
          x: this.x * matrix.a + this.y * matrix.c + matrix.e,
          y: this.x * matrix.b + this.y * matrix.d + matrix.f,
          w: this.w,
          z: this.z
        };
      }
      return { x: this.x, y: this.y };
    },
    toJSON: function() {  // Required by DOMPoint interface
      return { x: this.x, y: this.y, w: this.w, z: this.z };
    }
  } as unknown as DOMPoint;
};

// Mock closest() to help with port position lookups
Element.prototype.closest = function(selector: string) {
  if (selector === 'svg') {
    // Return a mock SVG element
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    // Add needed methods
    (svgEl as any).createSVGPoint = (SVGSVGElement.prototype as any).createSVGPoint;
    (svgEl as any).getScreenCTM = (SVGElement.prototype as any).getScreenCTM;
    (svgEl as any).getBBox = (SVGElement.prototype as any).getBBox;
    return svgEl;
  }
  
  // Try to find a real matching element if it exists
  const originalClosest = Element.prototype.closest;
  try {
    return originalClosest.call(this, selector);
  } catch (e) {
    return null;
  }
};

// Set up ResizeObserver mock
class MockResizeObserver {
  private callback: ResizeObserverCallback;
  private elements: Set<Element>;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    this.elements = new Set();
  }
  observe(element: Element) {
    this.elements.add(element);
    // Trigger the callback immediately with default entry
    const entry = [{
      target: element,
      contentRect: element.getBoundingClientRect(),
      borderBoxSize: [{ inlineSize: 100, blockSize: 100 }],
      contentBoxSize: [{ inlineSize: 100, blockSize: 100 }],
      devicePixelContentBoxSize: [{ inlineSize: 100, blockSize: 100 }]
    }] as unknown as ResizeObserverEntry[];
    this.callback(entry, this);
  }
  unobserve(element: Element) {
    this.elements.delete(element);
  }
  disconnect() {
    this.elements.clear();
  }
}

// @ts-ignore - Mocking ResizeObserver
global.ResizeObserver = MockResizeObserver;
