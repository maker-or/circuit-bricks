import { describe, test, expect } from 'vitest';
import { 
  validateComponentSchema, 
  validateComponentInstance, 
  validateWire, 
  validateCircuitState 
} from '../src/utils/zodValidation';
import { ComponentSchema, PortType } from '../src/types';

describe('ZOD Schema Validation', () => {
  test('validates a valid component schema', () => {
    const validSchema: ComponentSchema = {
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

    const result = validateComponentSchema(validSchema);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  test('rejects an invalid component schema', () => {
    const invalidSchema = {
      id: 'test-component',
      name: 'Test Component',
      // Missing required fields
      defaultWidth: 50,
      defaultHeight: 30,
      ports: [
        { id: 'in', x: 0, y: 15, type: 'input' }
      ],
      properties: [
        { key: 'testProp', label: 'Test Property', type: 'number', default: 10 }
      ],
      svgPath: 'M10,15 h30'
    };

    const result = validateComponentSchema(invalidSchema);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('validates a valid component instance', () => {
    const validInstance = {
      id: 'resistor-1',
      type: 'resistor',
      position: { x: 100, y: 100 },
      props: { resistance: 330 }
    };

    const result = validateComponentInstance(validInstance);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  test('rejects an invalid component instance', () => {
    const invalidInstance = {
      id: 'resistor-1',
      // Missing required 'type' field
      position: { x: 100, y: 100 }
      // Missing required 'props' field
    };

    const result = validateComponentInstance(invalidInstance);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('validates a valid wire', () => {
    const validWire = {
      id: 'wire-1',
      from: {
        componentId: 'battery-1',
        portId: 'positive'
      },
      to: {
        componentId: 'resistor-1',
        portId: 'left'
      }
    };

    const result = validateWire(validWire);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  test('rejects an invalid wire', () => {
    const invalidWire = {
      id: 'wire-1',
      from: {
        componentId: 'battery-1'
        // Missing required 'portId' field
      },
      to: {
        componentId: 'resistor-1',
        portId: 'left'
      }
    };

    const result = validateWire(invalidWire);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('validates a valid circuit state', () => {
    const validCircuit = {
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
          props: { resistance: 330 }
        }
      ],
      wires: [
        {
          id: 'wire-1',
          from: {
            componentId: 'battery-1',
            portId: 'positive'
          },
          to: {
            componentId: 'resistor-1',
            portId: 'left'
          }
        }
      ],
      selectedComponentIds: [],
      selectedWireIds: []
    };

    const result = validateCircuitState(validCircuit);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  test('rejects an invalid circuit state', () => {
    const invalidCircuit = {
      components: [
        {
          id: 'battery-1',
          type: 'battery',
          position: { x: 100, y: 100 },
          props: { voltage: 9 }
        }
      ],
      // Missing required 'wires' field
      selectedComponentIds: []
      // Missing required 'selectedWireIds' field
    };

    const result = validateCircuitState(invalidCircuit);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
