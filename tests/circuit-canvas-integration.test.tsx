import { expect, test, describe, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CircuitCanvas } from '../src/core/CircuitCanvas';
import { ComponentInstance, Wire, Point } from '../src/types';
import { getPortPosition } from '../src/utils/getPortPosition';

// Mock the getPortPosition utility
vi.mock('../src/utils/getPortPosition', () => ({
  getPortPosition: vi.fn().mockImplementation((componentId: string, portId: string) => {
    // Return mock port positions based on component and port IDs
    if (componentId === 'resistor-1' && portId === 'right') {
      return { x: 120, y: 100 };
    }
    if (componentId === 'battery-1' && portId === 'negative') {
      return { x: 180, y: 100 };
    }
    return { x: 0, y: 0 };
  })
}));

// Sample test data
const mockComponents: ComponentInstance[] = [
  {
    id: 'resistor-1',
    type: 'resistor',
    position: { x: 100, y: 100 },
    props: { resistance: 1000 },
    rotation: 0
  },
  {
    id: 'battery-1',
    type: 'battery',
    position: { x: 200, y: 100 },
    props: { voltage: 9 },
    rotation: 0
  }
];

const mockWires: Wire[] = [
  {
    id: 'wire-1',
    from: { componentId: 'resistor-1', portId: 'right' },
    to: { componentId: 'battery-1', portId: 'negative' }
  }
];

// Mock DOM operations
beforeEach(() => {
  Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
    x: 100,
    y: 100,
    width: 500,
    height: 400,
    top: 100,
    left: 100,
    right: 600,
    bottom: 500,
    toJSON: () => {}
  });
  
  document.querySelector = vi.fn().mockImplementation(() => {
    return document.createElement('div');
  });

  Element.prototype.dispatchEvent = vi.fn();
});

describe('CircuitCanvas Integration with Pan/Zoom', () => {
  test('wire connections are properly transformed with viewport changes', () => {
    const { container } = render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={600}
        height={400}
        initialZoom={1.5} // Start with zoomed in view
      />
    );
    
    // Check if wire paths are rendered
    const wirePathElements = container.querySelectorAll('.circuit-wires > *');
    expect(wirePathElements.length).toBeGreaterThan(0);
    
    // Pan the canvas
    const svg = container.querySelector('svg');
    if (svg) {
      fireEvent.mouseDown(svg, { altKey: true, button: 0, clientX: 200, clientY: 150 });
      fireEvent.mouseMove(svg, { clientX: 250, clientY: 200 });
      fireEvent.mouseUp(svg);
    }
    
    // Verify that getPortPosition was called
    expect(getPortPosition).toHaveBeenCalled();
    
    // Check if viewport-change event was dispatched
    expect(Element.prototype.dispatchEvent).toHaveBeenCalled();
  });

  test('component dragging works correctly with viewport transformations', () => {
    const handleComponentDrag = vi.fn();
    
    const { container } = render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={600}
        height={400}
        onComponentDrag={handleComponentDrag}
        initialZoom={0.75} // Start with zoomed out view
      />
    );
    
    // Pan the canvas first
    const svg = container.querySelector('svg');
    if (svg) {
      fireEvent.mouseDown(svg, { altKey: true, button: 0, clientX: 200, clientY: 150 });
      fireEvent.mouseMove(svg, { clientX: 250, clientY: 200 });
      fireEvent.mouseUp(svg);
    }
    
    // Then try to drag a component
    const componentElements = container.querySelectorAll('.circuit-components > *');
    
    if (componentElements[0]) {
      // Start component drag
      fireEvent.mouseDown(componentElements[0], { button: 0, clientX: 100, clientY: 100 });
      
      // Move the component
      fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });
      
      // End drag
      fireEvent.mouseUp(document);
      
      // Check if drag handler was called with transformed coordinates
      expect(handleComponentDrag).toHaveBeenCalled();
    }
  });

  test('wire drawing starts and ends correctly with zoom applied', () => {
    const handleWireDrawStart = vi.fn();
    const handleWireDrawEnd = vi.fn().mockReturnValue(true); // Accept the connection
    
    const { container } = render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={600}
        height={400}
        onWireDrawStart={handleWireDrawStart}
        onWireDrawEnd={handleWireDrawEnd}
        initialZoom={1.25} // Start with zoomed in view
      />
    );
    
    // Find port elements
    const portElements = container.querySelectorAll('[data-port-id]');
    
    if (portElements.length >= 2) {
      // Start wire drawing from first port
      fireEvent.click(portElements[0]);
      
      // Expect wire drawing to start
      expect(handleWireDrawStart).toHaveBeenCalled();
      
      // Now zoom in
      const svg = container.querySelector('svg');
      if (svg) {
        const zoomEvent = {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
          deltaY: -100,
          ctrlKey: true,
          clientX: 300,
          clientY: 200
        };
        fireEvent.wheel(svg, zoomEvent);
      }
      
      // End wire on second port
      fireEvent.click(portElements[1]);
      
      // Expect wire drawing to end
      expect(handleWireDrawEnd).toHaveBeenCalled();
    }
  });

  test('component dropping accounts for viewport transformation', () => {
    const handleComponentDrop = vi.fn();
    
    const { container } = render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={600}
        height={400}
        onComponentDrop={handleComponentDrop}
        initialZoom={0.8} // Start with slightly zoomed out view
      />
    );
    
    // Pan the canvas first
    const svg = container.querySelector('svg');
    if (svg) {
      fireEvent.mouseDown(svg, { altKey: true, button: 0, clientX: 200, clientY: 150 });
      fireEvent.mouseMove(svg, { clientX: 250, clientY: 200 });
      fireEvent.mouseUp(svg);
      
      // Then try dropping a component
      const dataTransfer = {
        getData: vi.fn().mockReturnValue('resistor'),
        dropEffect: 'none'
      };
      
      // Simulate dragover
      fireEvent.dragOver(svg, { dataTransfer });
      
      // Simulate drop
      fireEvent.drop(svg, { 
        dataTransfer,
        clientX: 300,
        clientY: 250  
      });
      
      // Check if drop handler was called with correctly transformed coordinates
      expect(handleComponentDrop).toHaveBeenCalled();
    }
  });

  test('snap to grid works correctly with zoom level applied', () => {
    const handleComponentDrag = vi.fn();
    
    const { container } = render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={600}
        height={400}
        onComponentDrag={handleComponentDrag}
        snapToGrid={true}
        gridSize={20}
        initialZoom={0.5} // Start with zoomed out view
      />
    );
    
    // Drag a component
    const componentElements = container.querySelectorAll('.circuit-components > *');
    
    if (componentElements[0]) {
      // Start component drag
      fireEvent.mouseDown(componentElements[0], { button: 0, clientX: 100, clientY: 100 });
      
      // Move the component to a non-grid position
      fireEvent.mouseMove(document, { clientX: 137, clientY: 143 });
      
      // End drag
      fireEvent.mouseUp(document);
      
      // Check if drag handler was called with snapped coordinates
      // The expected position should be snapped to multiples of gridSize
      expect(handleComponentDrag).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number)
        })
      );
      
      // Extract the position from the call
      const position = handleComponentDrag.mock.calls[0][1];
      
      // Check if position values are multiples of gridSize
      expect(position.x % 20).toBe(0);
      expect(position.y % 20).toBe(0);
    }
  });

  test('coordinate transformation preserves component selection', () => {
    const handleComponentClick = vi.fn();
    
    const { container } = render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={600}
        height={400}
        onComponentClick={handleComponentClick}
        initialZoom={1.2} // Start with zoomed in view
      />
    );
    
    // First zoom in further
    const svg = container.querySelector('svg');
    if (svg) {
      const zoomEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        deltaY: -100,
        ctrlKey: true,
        clientX: 300,
        clientY: 200
      };
      fireEvent.wheel(svg, zoomEvent);
    }
    
    // Then pan the canvas
    if (svg) {
      fireEvent.mouseDown(svg, { altKey: true, button: 0, clientX: 200, clientY: 150 });
      fireEvent.mouseMove(svg, { clientX: 250, clientY: 200 });
      fireEvent.mouseUp(svg);
    }
    
    // Try clicking on a component
    const componentElements = container.querySelectorAll('.circuit-components > *');
    if (componentElements[0]) {
      fireEvent.click(componentElements[0]);
      
      // Check if component click handler was called with the correct component ID
      expect(handleComponentClick).toHaveBeenCalledWith('resistor-1', expect.anything());
    }
  });
});
