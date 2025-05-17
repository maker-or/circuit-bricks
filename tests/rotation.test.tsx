import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCircuit } from '../src/hooks/useCircuit';

describe('Component Rotation Functionality', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('rotates a single component', () => {
    const { result } = renderHook(() => useCircuit());
    let componentId: string;
    
    // Add a component
    act(() => {
      const [_, actions] = result.current;
      componentId = actions.addComponent({
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      });
    });
    
    // Rotate the component clockwise by 90 degrees
    act(() => {
      const [_, actions] = result.current;
      actions.rotateComponent(componentId!, 90);
    });
    
    // Verify rotation
    let [state, _] = result.current;
    const rotatedComponent = state.components[0];
    expect(rotatedComponent.rotation).toBe(90);
    
    // Rotate again by -45 degrees (counterclockwise)
    act(() => {
      const [_, actions] = result.current;
      actions.rotateComponent(componentId!, -45);
    });
    
    // Verify cumulative rotation (90 - 45 = 45)
    [state, _] = result.current;
    const rotatedAgain = state.components[0];
    expect(rotatedAgain.rotation).toBe(45);
  });
  
  test('rotates multiple selected components', () => {
    const { result } = renderHook(() => useCircuit());
    
    // Add two components
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
      
      // Select both components
      actions.selectComponent(resistorId, false);
      actions.selectComponent(batteryId, true);
    });
    
    // Rotate all selected components
    act(() => {
      const [_, actions] = result.current;
      actions.rotateSelectedComponents(180);
    });
    
    // Verify both components were rotated
    let [state, _] = result.current;
    expect(state.components[0].rotation).toBe(180);
    expect(state.components[1].rotation).toBe(180);
  });
  
  test('handles rotation normalization (0-359 degrees)', () => {
    const { result } = renderHook(() => useCircuit());
    let componentId: string;
    
    // Add a component
    act(() => {
      const [_, actions] = result.current;
      componentId = actions.addComponent({
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      });
    });
    
    // Rotate by 400 degrees (should normalize to 40)
    act(() => {
      const [_, actions] = result.current;
      actions.rotateComponent(componentId!, 400);
    });
    
    // Verify normalized rotation
    let [state, _] = result.current;
    expect(state.components[0].rotation).toBe(40);
    
    // Rotate by -45 degrees (should become 355)
    act(() => {
      const [_, actions] = result.current;
      actions.rotateComponent(componentId!, -45);
    });
    
    // Verify normalized negative rotation
    [state, _] = result.current;
    expect(state.components[0].rotation).toBe(355);
  });
  
  test('rotation changes are saved in undo history', () => {
    const { result } = renderHook(() => useCircuit());
    let componentId: string;
    
    // Add a component
    act(() => {
      const [_, actions] = result.current;
      componentId = actions.addComponent({
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      });
    });
    
    // Rotate the component
    act(() => {
      const [_, actions] = result.current;
      actions.rotateComponent(componentId!, 90);
    });
    
    // Verify rotation
    let [state, actions] = result.current;
    expect(state.components[0].rotation).toBe(90);
    
    // Undo the rotation
    act(() => {
      actions.undo();
    });
    
    // Verify rotation was undone
    [state, actions] = result.current;
    expect(state.components[0].rotation).toBe(undefined);
    
    // Redo the rotation
    act(() => {
      actions.redo();
    });
    
    // Verify rotation was redone
    [state, actions] = result.current;
    expect(state.components[0].rotation).toBe(90);
  });
});
