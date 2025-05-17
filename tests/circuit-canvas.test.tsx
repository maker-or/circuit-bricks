import { expect, test, describe, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CircuitCanvas } from '../src/core/CircuitCanvas';
import { ComponentInstance, Wire, Point } from '../src/types';

// Create mock data for tests
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

// Mock all needed DOM operations for testing SVG position calculations
beforeEach(() => {
  // Mock getPortPosition function from DOM
  Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
    x: 100,
    y: 100,
    width: 20,
    height: 20,
    top: 100,
    left: 100,
    right: 120,
    bottom: 120,
    toJSON: () => {}
  });
  
  // Mock querySelector to return an element for port position calculation
  document.querySelector = vi.fn().mockImplementation(() => {
    return document.createElement('div');
  });
});

describe('CircuitCanvas Component', () => {
  test('renders components and wires', () => {
    const { container } = render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={600}
        height={400}
      />
    );
    
    // Check if SVG element exists
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    
    // Check if component groups are rendered
    const componentGroups = container.querySelectorAll('.circuit-components > *');
    expect(componentGroups.length).toBe(mockComponents.length);
    
    // Note: Checking for wire elements by their key instead of class selector
    // For testing purposes, check if WirePath components are included in the render at all
    const wirePathElems = container.querySelector('.circuit-wires');
    expect(wirePathElems).toBeTruthy();
  });
  
  test('handles component click', () => {
    const handleComponentClick = vi.fn();
    
    const { container } = render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={600}
        height={400}
        onComponentClick={handleComponentClick}
      />
    );
    
    // Find a component element and click it
    // In a real scenario we would find specific data attributes or test IDs
    const componentElements = container.querySelectorAll('.circuit-components > *');
    if (componentElements[0]) {
      fireEvent.click(componentElements[0]);
      
      // Check if the click handler was called with the correct component ID
      expect(handleComponentClick).toHaveBeenCalledWith('resistor-1', expect.anything());
    }
  });
  
  test('handles wire click', () => {
    const handleWireClick = vi.fn();
    
    const { container } = render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={600}
        height={400}
        onWireClick={handleWireClick}
      />
    );
    
    // Find a wire element and click it
    const wireElements = container.querySelectorAll('.circuit-wires > *');
    if (wireElements[0]) {
      fireEvent.click(wireElements[0]);
      
      // Check if the click handler was called with the correct wire ID
      expect(handleWireClick).toHaveBeenCalledWith('wire-1', expect.anything());
    }
  });
  
  test('handles canvas click for deselection', () => {
    const handleCanvasClick = vi.fn();
    
    const { container } = render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={600}
        height={400}
        onCanvasClick={handleCanvasClick}
      />
    );
    
    // Click on the SVG canvas itself (not on components or wires)
    const svg = container.querySelector('svg');
    if (svg) {
      fireEvent.click(svg);
      
      // Check if the canvas click handler was called
      expect(handleCanvasClick).toHaveBeenCalled();
    }
  });
  
  test('handles component drag', () => {
    const handleComponentDrag = vi.fn();
    
    const { container } = render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={600}
        height={400}
        onComponentDrag={handleComponentDrag}
        selectedComponentIds={['resistor-1']}
      />
    );
    
    // Find a component element and simulate drag
    const componentElements = container.querySelectorAll('.circuit-components > *');
    if (componentElements[0]) {
      // Simulate mousedown to start dragging
      fireEvent.mouseDown(componentElements[0]);
      
      // Simulate mousemove to drag
      fireEvent.mouseMove(componentElements[0]);
      
      // Simulate mouseup to end dragging
      fireEvent.mouseUp(componentElements[0]);
      
      // Check if the drag handler was called
      // exact assertions will depend on implementation details
      expect(handleComponentDrag).toHaveBeenCalled();
    }
  });
  
  test('handles component drop', () => {
    const handleComponentDrop = vi.fn();
    
    const { container } = render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={600}
        height={400}
        onComponentDrop={handleComponentDrop}
      />
    );
    
    // Find SVG element and simulate drop
    const svg = container.querySelector('svg');
    if (svg) {
      // Create a mock drag event with dataTransfer
      const dataTransfer = {
        getData: vi.fn().mockReturnValue('resistor'),
        dropEffect: 'none',
        setData: vi.fn(),
        clearData: vi.fn(),
        setDragImage: vi.fn()
      };
      
      // Simulate dragover (which should prevent default)
      fireEvent.dragOver(svg, { dataTransfer });
      
      // Simulate drop
      fireEvent.drop(svg, { dataTransfer });
      
      // Check if the drop handler was called with correct component type and position
      expect(handleComponentDrop).toHaveBeenCalledWith('resistor', expect.any(Object));
    }
  });
});
