import { expect, test, describe } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import BaseComponent from '../src/core/BaseComponent';
import Port from '../src/core/Port';
import { getComponentSchema } from '../src/registry';

// Mock SVG for testing
const mockSvgEnv = (component) => {
  return (
    <svg width="500" height="500">
      {component}
    </svg>
  );
};

// Test core components
describe('Core Components', () => {
  test('BaseComponent renders with schema and instance', () => {
    const schema = getComponentSchema('resistor');
    const component = {
      id: 'test-resistor',
      type: 'resistor',
      position: { x: 100, y: 100 },
      props: { resistance: 1000 }
    };

    if (!schema) {
      throw new Error('Resistor schema not found');
    }

    const { container } = render(
      mockSvgEnv(
        <BaseComponent
          schema={schema}
          component={component}
          onClick={() => {}}
          selected={false}
        />
      )
    );

    // Should render an SVG g element
    expect(container.querySelector('g')).toBeDefined();
    
    // Should have a path element for the resistor
    expect(container.querySelector('path')).toBeDefined();
    
    // Should have port elements
    expect(container.querySelectorAll('[data-port-id]').length).toBe(schema.ports.length);
  });

  test('Port component renders correctly', () => {
    const { container } = render(
      mockSvgEnv(
        <Port
          componentId="test-component"
          port={{ id: 'test-port', x: 10, y: 20, type: 'input' }}
          onClick={() => {}}
          selected={false}
        />
      )
    );

    // Should render a circle for the port
    const portElement = container.querySelector('circle');
    expect(portElement).toBeDefined();
    
    // Should have correct data attributes
    expect(portElement?.getAttribute('data-component-id')).toBe('test-component');
    expect(portElement?.getAttribute('data-port-id')).toBe('test-port');
    
    // Should be at the right position
    expect(portElement?.getAttribute('cx')).toBe('10');
    expect(portElement?.getAttribute('cy')).toBe('20');
  });
});
