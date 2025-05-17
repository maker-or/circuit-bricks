import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCircuit } from '../src/hooks/useCircuit';

describe('Complex Circuit Scenarios', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('creates a voltage divider circuit with resistors', () => {
    const { result } = renderHook(() => useCircuit());
    
    // Create a voltage divider circuit (two resistors in series with a voltage source)
    act(() => {
      const [_, actions] = result.current;
      
      // Add voltage source
      const sourceId = actions.addComponent({
        type: 'voltage-source',
        position: { x: 100, y: 100 },
        props: { voltage: 5 }
      });
      
      // Add two resistors in series
      const resistor1Id = actions.addComponent({
        type: 'resistor',
        position: { x: 200, y: 100 },
        props: { resistance: 1000 }  // 1kΩ
      });
      
      const resistor2Id = actions.addComponent({
        type: 'resistor',
        position: { x: 300, y: 100 },
        props: { resistance: 2000 }  // 2kΩ
      });
      
      // Add ground
      const groundId = actions.addComponent({
        type: 'ground',
        position: { x: 300, y: 200 },
        props: {}
      });
      
      // Connect components with wires
      actions.addWire(
        { componentId: sourceId, portId: 'positive' },
        { componentId: resistor1Id, portId: 'left' }
      );
      
      actions.addWire(
        { componentId: resistor1Id, portId: 'right' },
        { componentId: resistor2Id, portId: 'left' }
      );
      
      actions.addWire(
        { componentId: resistor2Id, portId: 'right' },
        { componentId: groundId, portId: 'terminal' }
      );
      
      actions.addWire(
        { componentId: sourceId, portId: 'negative' },
        { componentId: groundId, portId: 'terminal' }
      );
    });
    
    // Verify circuit state
    const [state] = result.current;
    
    // Should have 4 components
    expect(state.components.length).toBe(4);
    
    // Should have 4 wires
    expect(state.wires.length).toBe(4);
    
    // Verify component types
    const componentTypes = state.components.map(c => c.type);
    expect(componentTypes).toContain('voltage-source');
    expect(componentTypes).toContain('resistor');
    expect(componentTypes).toContain('ground');
    
    // Count number of resistors
    const resistorCount = componentTypes.filter(t => t === 'resistor').length;
    expect(resistorCount).toBe(2);
  });

  test('creates an RC circuit with capacitor and resistor', () => {
    const { result } = renderHook(() => useCircuit());
    
    // Create an RC circuit (resistor and capacitor in series with a voltage source)
    act(() => {
      const [_, actions] = result.current;
      
      // Add battery
      const batteryId = actions.addComponent({
        type: 'battery',
        position: { x: 100, y: 100 },
        props: { voltage: 9 }
      });
      
      // Add resistor
      const resistorId = actions.addComponent({
        type: 'resistor',
        position: { x: 200, y: 100 },
        props: { resistance: 10000 }  // 10kΩ
      });
      
      // Add capacitor
      const capacitorId = actions.addComponent({
        type: 'capacitor',
        position: { x: 300, y: 100 },
        props: { capacitance: 0.000001 }  // 1µF
      });
      
      // Add ground
      const groundId = actions.addComponent({
        type: 'ground',
        position: { x: 300, y: 200 },
        props: {}
      });
      
      // Connect components with wires
      actions.addWire(
        { componentId: batteryId, portId: 'positive' },
        { componentId: resistorId, portId: 'left' }
      );
      
      actions.addWire(
        { componentId: resistorId, portId: 'right' },
        { componentId: capacitorId, portId: 'positive' }
      );
      
      actions.addWire(
        { componentId: capacitorId, portId: 'negative' },
        { componentId: groundId, portId: 'terminal' }
      );
      
      actions.addWire(
        { componentId: batteryId, portId: 'negative' },
        { componentId: groundId, portId: 'terminal' }
      );
    });
    
    // Verify circuit state
    const [state] = result.current;
    
    // Should have 4 components
    expect(state.components.length).toBe(4);
    
    // Should have 4 wires
    expect(state.wires.length).toBe(4);
    
    // Verify component types
    const componentTypes = state.components.map(c => c.type);
    expect(componentTypes).toContain('battery');
    expect(componentTypes).toContain('resistor');
    expect(componentTypes).toContain('capacitor');
    expect(componentTypes).toContain('ground');
  });
});
