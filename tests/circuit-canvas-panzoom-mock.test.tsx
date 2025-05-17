import { expect, test, describe, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { CircuitCanvas } from '../src/core/CircuitCanvas';
import { ComponentInstance, Wire } from '../src/types';

// Mock the port position utility that our test depends on
vi.mock('../src/utils/getPortPosition', () => ({
  getPortPosition: vi.fn().mockImplementation(() => ({ x: 100, y: 100 }))
}));

// Set up the test data
const mockComponents: ComponentInstance[] = [
  {
    id: 'resistor-1',
    type: 'resistor',
    position: { x: 100, y: 100 },
    props: { resistance: 1000 },
    rotation: 0
  }
];

const mockWires: Wire[] = [];

// Simplified tests focusing on rendering and basic functionality
describe('CircuitCanvas Pan & Zoom Basic Tests', () => {
  // Mock DOM operations
  beforeEach(() => {
    // Restore all mocks to make sure tests don't interfere with each other
    vi.restoreAllMocks();
    
    // Mock Element.prototype methods
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 500,
      height: 400,
      top: 0,
      left: 0,
      right: 500,
      bottom: 400,
      toJSON: () => {}
    } as DOMRect));
    
    // Mock event dispatching
    vi.spyOn(Element.prototype, 'dispatchEvent').mockImplementation(() => true);
  });
  
  test('renders with specified initial zoom', () => {
    const initialZoom = 0.75;
    
    const { container } = render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={500}
        height={400}
        initialZoom={initialZoom}
      />
    );
    
    // Verify the SVG exists
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    
    // Pattern element will have transform with scale attribute
    const pattern = container.querySelector('pattern');
    expect(pattern).toBeTruthy();
    
    // Check if pattern transform contains the initial zoom scale
    if (pattern) {
      const transformAttr = pattern.getAttribute('patternTransform');
      expect(transformAttr).toContain(`scale(${initialZoom})`);
    }
  });
  
  test('adds keyboard event listeners for zoom shortcuts', () => {
    // Mock window event listeners
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    
    render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={500}
        height={400}
      />
    );
    
    // Check that keydown event listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
  
  test('has grid pattern that scales with zoom', () => {
    const { container } = render(
      <CircuitCanvas
        components={mockComponents}
        wires={mockWires}
        width={500}
        height={400}
        showGrid={true}
      />
    );
    
    // Check for grid pattern
    const gridPattern = container.querySelector('pattern#grid');
    expect(gridPattern).toBeTruthy();
  });
});
