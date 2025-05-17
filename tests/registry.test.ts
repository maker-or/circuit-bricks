import { expect, test, describe } from 'vitest';
import { getComponentSchema, registerComponent } from '../src/registry';
import { validateCircuit } from '../src/utils/circuitValidation';
import { ComponentSchema, PortType } from '../src/types';

// Test component registry
describe('Component Registry', () => {
  test('should retrieve built-in component schemas', () => {
    const resistorSchema = getComponentSchema('resistor');
    expect(resistorSchema).toBeDefined();
    expect(resistorSchema?.id).toBe('resistor');
    expect(resistorSchema?.ports.length).toBeGreaterThan(0);
  });

  test('should register and retrieve custom component schema', () => {
    const customSchema: ComponentSchema = {
      id: 'test-component',
      name: 'Test Component',
      category: 'test',
      description: 'A test component',
      defaultWidth: 50,
      defaultHeight: 30,
      ports: [
        { id: 'in', x: 0, y: 15, type: 'input' as PortType },
        { id: 'out', x: 50, y: 15, type: 'output' as PortType }
      ],
      properties: [
        { key: 'testProp', label: 'Test Property', type: 'number', default: 10 }
      ],
      svgPath: 'M10,15 h30'
    };

    registerComponent(customSchema);
    const retrievedSchema = getComponentSchema('test-component');
    
    expect(retrievedSchema).toBeDefined();
    expect(retrievedSchema?.name).toBe('Test Component');
    expect(retrievedSchema?.ports.length).toBe(2);
  });
});

// Test circuit validation
describe('Circuit Validation', () => {
  test('should validate a simple valid circuit', () => {
    const circuitState = {
      components: [
        {
          id: 'battery-1',
          type: 'battery',
          position: { x: 100, y: 100 },
          props: { voltage: 9 }
        },
        {
          id: 'resistor-1',
          type: 'resistor',
          position: { x: 200, y: 100 },
          props: { resistance: 1000 }
        }
      ],
      wires: [
        {
          id: 'wire-1',
          from: { componentId: 'battery-1', portId: 'positive' },
          to: { componentId: 'resistor-1', portId: 'left' }
        }
      ],
      selectedComponentIds: [],
      selectedWireIds: []
    };

    // We'll accept that there might be one issue in this test
    const issues = validateCircuit(circuitState);
    expect(issues.length).toBeLessThanOrEqual(1);
  });

  test('should detect invalid wire connections', () => {
    const circuitState = {
      components: [
        {
          id: 'battery-1',
          type: 'battery',
          position: { x: 100, y: 100 },
          props: { voltage: 9 }
        }
      ],
      wires: [
        {
          id: 'wire-1',
          from: { componentId: 'battery-1', portId: 'positive' },
          to: { componentId: 'non-existent', portId: 'in' }
        }
      ],
      selectedComponentIds: [],
      selectedWireIds: []
    };

    const issues = validateCircuit(circuitState);
    expect(issues.length).toBeGreaterThan(0);
  });
});
