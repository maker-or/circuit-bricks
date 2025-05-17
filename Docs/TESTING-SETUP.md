# Circuit-Bricks Testing Setup

This document describes the testing setup for the Circuit-Bricks library, including important TypeScript configurations and mocks required for running tests.

## Overview

The Circuit-Bricks testing environment uses:
- Vitest as the test runner
- React Testing Library for component testing
- JSDOM for simulating a browser environment
- Custom mocks for SVG functionality not provided by JSDOM

## Test Structure

Tests are organized into several categories:
1. **Component Tests**: Test rendering and behavior of individual circuit components
2. **Registry Tests**: Verify component schema definitions and registration
3. **Hook Tests**: Test custom React hooks like useCircuit
4. **Complex Circuit Tests**: Test interactions between multiple connected components
5. **Validation Tests**: Test circuit validation utilities
6. **Pan/Zoom Tests**: Test infinite canvas with pan/zoom functionality
7. **Integration Tests**: Test how features like pan/zoom interact with component selection and wire connections

## Running Tests

To run all tests:
```bash
npm test
```

To run specific test files:
```bash
npm test -- -t "CircuitCanvas"
```

To run tests related to pan/zoom functionality:
```bash
npm test -- -t "pan|zoom"
```

## TypeScript Configuration

The TypeScript configuration for testing includes:
- Node.js type definitions (`@types/node`)
- Vitest global type definitions (`vitest/globals`)
- JSON module resolution for component schemas
- Composite project setup for better module resolution

## SVG Mocks

JSDOM doesn't implement SVG functionality required by Circuit-Bricks. The following mocks are set up in `tests/setup.ts`:

### SVGElement.getBBox

```typescript
(SVGElement.prototype as any).getBBox = function() {
  return {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    toString: () => '',
  } as DOMRect;
};
```

### SVGElement.getScreenCTM

```typescript
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
```

### SVGSVGElement.createSVGPoint

```typescript
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
```

## ResizeObserver Mock

Since JSDOM doesn't provide ResizeObserver, we implement a mock version:

```typescript
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

global.ResizeObserver = MockResizeObserver;
```

## Type Compatibility Issues

Some common type issues you might encounter when working with the tests:

1. **SVG Element Properties**: JSDOM doesn't implement SVG properties like getBBox or getScreenCTM, so we use type assertions (`as any`) to apply them.

2. **DOMMatrix and DOMPoint**: The TypeScript types for these interfaces are strict, requiring properties like `w`, `z`, and `toJSON()` for DOMPoint.

3. **Validation Types**: Be careful when comparing validation issue types - they are strictly typed in the validation utilities.

## Testing Pan/Zoom Functionality

Testing the infinite canvas pan/zoom functionality requires special consideration because it involves DOM events, coordinate transformations, and viewport state changes.

### Event Mocking

1. **Wheel Events**: When testing zoom:
   ```typescript
   const wheelEvent = {
     preventDefault: vi.fn(),
     stopPropagation: vi.fn(),
     deltaY: -100, // negative for zoom in, positive for zoom out
     ctrlKey: true, // Ctrl key must be pressed for zooming
     clientX: 300, // Mouse position X
     clientY: 200, // Mouse position Y
     target: document.createElement('div') // Target element
   };
   fireEvent.wheel(svg, wheelEvent);
   ```

2. **Mouse Events for Panning**:
   ```typescript
   // Start panning
   fireEvent.mouseDown(svg, { 
     altKey: true, // Alt key for panning
     button: 0,    // Left button
     clientX: 200, 
     clientY: 150 
   });
   
   // Pan movement
   fireEvent.mouseMove(svg, { 
     clientX: 250, 
     clientY: 200 
   });
   
   // End panning
   fireEvent.mouseUp(svg);
   ```

3. **Keyboard Shortcuts**:
   ```typescript
   // Reset view (Ctrl+0)
   fireEvent.keyDown(document, { 
     key: '0', 
     ctrlKey: true 
   });
   
   // Zoom in (Ctrl+=)
   fireEvent.keyDown(document, { 
     key: '+', 
     ctrlKey: true 
   });
   ```

### Viewport Transformation Verification

The most reliable way to verify viewport transformation is to check pattern transforms in the SVG:

```typescript
const pattern = container.querySelector('pattern#grid');
const transformAttr = pattern?.getAttribute('patternTransform');
expect(transformAttr).toContain(`scale(${expectedZoom})`);
```

### Special Considerations

1. **Event Coordinates**: When testing mouse events with pan/zoom applied, remember that screen coordinates must be transformed to SVG coordinates.

2. **Component Selection**: Ensure components remain selectable at different zoom levels by verifying click event handlers are still triggered correctly.

3. **Wire Connections**: Verify that wire connections work properly with pan/zoom applied by testing getPortPosition calculations.

## Adding New Tests

When adding new component tests, you may need to extend the SVG mocks if you use SVG functionality not currently mocked. Follow the existing patterns in `tests/setup.ts`.

For tests that require browser-specific functionality not provided by JSDOM, consider using conditional logic to skip those tests in the JSDOM environment or provide appropriate mocks.
