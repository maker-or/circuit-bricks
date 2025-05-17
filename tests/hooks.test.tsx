import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCircuit } from '../src/hooks/useCircuit';

describe('useCircuit hook', () => {
  beforeEach(() => {
    // Clear any mock timers
    vi.restoreAllMocks();
  });

  test('initializes with empty circuit state', () => {
    const { result } = renderHook(() => useCircuit());
    const [state, _] = result.current;
    
    expect(state.components).toEqual([]);
    expect(state.wires).toEqual([]);
    expect(state.selectedComponentIds).toEqual([]);
    expect(state.selectedWireIds).toEqual([]);
  });

  test('adds a component correctly', () => {
    const { result } = renderHook(() => useCircuit());
    const [_, actions] = result.current;
    
    act(() => {
      actions.addComponent({
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      });
    });
    
    // Check that a component was added
    const [state] = result.current;
    expect(state.components.length).toBe(1);
    
    // Verify component properties
    const component = state.components[0];
    expect(component.type).toBe('resistor');
    expect(component.position.x).toBe(100);
    expect(component.position.y).toBe(100);
    expect(component.props.resistance).toBe(1000);
  });

  test('updates a component correctly', () => {
    const { result } = renderHook(() => useCircuit());
    
    // Add a component first
    let componentId;
    act(() => {
      const [_, actions] = result.current;
      componentId = actions.addComponent({
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      });
    });
    
    // Now update it
    act(() => {
      const [_, actions] = result.current;
      actions.updateComponent(componentId, {
        position: { x: 200, y: 200 },
        props: { resistance: 2000 }
      });
    });
    
    // Verify the update
    const [state] = result.current;
    const component = state.components.find(c => c.id === componentId);
    expect(component?.position.x).toBe(200);
    expect(component?.position.y).toBe(200);
    expect(component?.props.resistance).toBe(2000);
  });

  test('removes a component correctly', () => {
    const { result } = renderHook(() => useCircuit());
    
    // Add a component first
    let componentId;
    act(() => {
      const [_, actions] = result.current;
      componentId = actions.addComponent({
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      });
    });
    
    // Now remove it
    act(() => {
      const [_, actions] = result.current;
      actions.removeComponent(componentId);
    });
    
    // Verify it was removed
    const [state] = result.current;
    expect(state.components.length).toBe(0);
  });

  test('adds and removes wires correctly', () => {
    const { result } = renderHook(() => useCircuit());
    
    // Add two components
    let resistorId, batteryId;
    act(() => {
      const [_, actions] = result.current;
      resistorId = actions.addComponent({
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      });
      
      batteryId = actions.addComponent({
        type: 'battery',
        position: { x: 200, y: 100 },
        props: { voltage: 9 }
      });
    });
    
    // Add a wire between them
    let wireId;
    act(() => {
      const [_, actions] = result.current;
      wireId = actions.addWire(
        { componentId: batteryId, portId: 'positive' },
        { componentId: resistorId, portId: 'left' }
      );
    });
    
    // Verify wire was added
    const [state] = result.current;
    expect(state.wires.length).toBe(1);
    const wire = state.wires[0];
    expect(wire.from.componentId).toBe(batteryId);
    expect(wire.to.componentId).toBe(resistorId);
    
    // Remove the wire
    act(() => {
      const [_, actions] = result.current;
      actions.removeWire(wireId);
    });
    
    // Verify wire was removed
    const [updatedState] = result.current;
    expect(updatedState.wires.length).toBe(0);
  });

  test('selection state works correctly', () => {
    const { result } = renderHook(() => useCircuit());
    
    // Add a component
    let componentId;
    act(() => {
      const [_, actions] = result.current;
      componentId = actions.addComponent({
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      });
    });
    
    // Select the component
    act(() => {
      const [_, actions] = result.current;
      actions.selectComponent(componentId);
    });
    
    // Verify it's selected
    const [state] = result.current;
    expect(state.selectedComponentIds).toContain(componentId);
    
    // Clear selection
    act(() => {
      const [_, actions] = result.current;
      actions.deselectAll();
    });
    
    // Verify selection was cleared
    const [updatedState] = result.current;
    expect(updatedState.selectedComponentIds.length).toBe(0);
  });
});
