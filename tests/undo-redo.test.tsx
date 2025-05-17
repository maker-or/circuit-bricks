import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCircuit } from '../src/hooks/useCircuit';

describe('Circuit Undo/Redo Functionality', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('can undo adding a component', () => {
    const { result } = renderHook(() => useCircuit());
    
    // Add a component
    act(() => {
      const [_, actions] = result.current;
      actions.addComponent({
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      });
    });
    
    // Verify component was added
    let [state, actions] = result.current;
    expect(state.components.length).toBe(1);
    
    // Undo the action
    act(() => {
      actions.undo();
    });
    
    // Verify component was removed
    [state, actions] = result.current;
    expect(state.components.length).toBe(0);
  });
  
  test('can redo after undoing', () => {
    const { result } = renderHook(() => useCircuit());
    
    // Add a component
    act(() => {
      const [_, actions] = result.current;
      actions.addComponent({
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      });
    });
    
    // Undo the action
    act(() => {
      const [_, actions] = result.current;
      actions.undo();
    });
    
    // Verify component was removed
    let [state, actions] = result.current;
    expect(state.components.length).toBe(0);
    
    // Redo the action
    act(() => {
      actions.redo();
    });
    
    // Verify component was re-added
    [state, actions] = result.current;
    expect(state.components.length).toBe(1);
  });
  
  test('undo/redo stack is cleared after new action', () => {
    const { result } = renderHook(() => useCircuit());
    
    // Add a component
    act(() => {
      const [_, actions] = result.current;
      actions.addComponent({
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      });
    });
    
    // Undo the action
    act(() => {
      const [_, actions] = result.current;
      actions.undo();
    });
    
    // Add a different component
    act(() => {
      const [_, actions] = result.current;
      actions.addComponent({
        type: 'battery',
        position: { x: 200, y: 100 },
        props: { voltage: 9 }
      });
    });
    
    // Verify new component was added
    let [state, actions] = result.current;
    expect(state.components.length).toBe(1);
    expect(state.components[0].type).toBe('battery');
    
    // Verify redo is not possible
    expect(actions.canRedo()).toBe(false);
    
    // Undo should still work
    act(() => {
      actions.undo();
    });
    
    [state, actions] = result.current;
    expect(state.components.length).toBe(0);
  });
  
  test('undo/redo for multiple operations in sequence', () => {
    const { result } = renderHook(() => useCircuit());
    
    // Add multiple components
    act(() => {
      const [_, actions] = result.current;
      const resistorId = actions.addComponent({
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      });
      
      const batteryId = actions.addComponent({
        type: 'battery',
        position: { x: 200, y: 100 },
        props: { voltage: 9 }
      });
      
      // Add a wire between them
      actions.addWire(
        { componentId: resistorId, portId: 'right' },
        { componentId: batteryId, portId: 'negative' }
      );
    });
    
    // Verify all entities were added
    let [state, actions] = result.current;
    expect(state.components.length).toBe(2);
    expect(state.wires.length).toBe(1);
    
    // Undo last action (adding wire)
    act(() => {
      actions.undo();
    });
    
    [state, actions] = result.current;
    expect(state.components.length).toBe(2);
    expect(state.wires.length).toBe(0);
    
    // Undo adding battery
    act(() => {
      actions.undo();
    });
    
    [state, actions] = result.current;
    expect(state.components.length).toBe(1);
    expect(state.components[0].type).toBe('resistor');
    
    // Redo adding battery
    act(() => {
      actions.redo();
    });
    
    [state, actions] = result.current;
    expect(state.components.length).toBe(2);
    
    // Redo adding wire
    act(() => {
      actions.redo();
    });
    
    [state, actions] = result.current;
    expect(state.wires.length).toBe(1);
  });
  
  test('canUndo and canRedo return correct values', () => {
    const { result } = renderHook(() => useCircuit());
    
    // Initially, neither undo nor redo should be available
    let [_, actions] = result.current;
    expect(actions.canUndo()).toBe(false);
    expect(actions.canRedo()).toBe(false);
    
    // Add a component
    act(() => {
      actions.addComponent({
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      });
    });
    
    // Now undo should be available but not redo
    [_, actions] = result.current;
    expect(actions.canUndo()).toBe(true);
    expect(actions.canRedo()).toBe(false);
    
    // Undo the action
    act(() => {
      actions.undo();
    });
    
    // Now redo should be available but not undo
    [_, actions] = result.current;
    expect(actions.canUndo()).toBe(false);
    expect(actions.canRedo()).toBe(true);
  });
});
