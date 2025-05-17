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
    matrixTransform: function() {
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
    return svgEl;
  }
  return null;
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
