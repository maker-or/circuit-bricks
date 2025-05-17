/**
 * useCircuit Hook
 * 
 * A React hook for managing circuit state and operations. Provides a complete
 * state management solution for circuit components and wires, with support for
 * selection, wire drawing, and undo/redo functionality.
 * 
 * @returns {[CircuitState, CircuitActions]} A tuple containing the current circuit state and actions to modify it
 * 
 * @example
 * const [state, actions] = useCircuit();
 * 
 * // Add a new component
 * const resistorId = actions.addComponent({
 *   type: 'resistor',
 *   position: { x: 100, y: 100 },
 *   props: { resistance: 1000 }
 * });
 * 
 * // Connect components with a wire
 * actions.addWire(
 *   { componentId: resistorId, portId: 'left' },
 *   { componentId: 'battery-1', portId: 'positive' }
 * );
 * 
 * // Access current state
 * console.log(state.components, state.wires);
 */

import { useState, useCallback, useRef } from 'react';
import { ComponentInstance, Wire, CircuitState, Point } from '../types';
import { getComponentSchema } from '../registry';

export interface CircuitActions {
  /** Adds a new component to the circuit and returns its generated ID */
  addComponent: (component: Omit<ComponentInstance, 'id'>) => string;
  
  /** Updates properties of an existing component */
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void;
  
  /** Removes a component from the circuit */
  removeComponent: (id: string) => void;
  
  /** Adds a new wire between two ports and returns its generated ID */
  addWire: (from: Wire['from'], to: Wire['to'], style?: Wire['style']) => string;
  
  /** Updates properties of an existing wire */
  updateWire: (id: string, updates: Partial<Wire>) => void;
  
  /** Removes a wire from the circuit */
  removeWire: (id: string) => void;
  
  /** Selects a component, optionally adding to the current selection */
  selectComponent: (id: string, addToSelection?: boolean) => void;
  
  /** Selects a wire, optionally adding to the current selection */
  selectWire: (id: string, addToSelection?: boolean) => void;
  
  /** Deselects all currently selected components and wires */
  deselectAll: () => void;
  
  /** Returns an array of currently selected components */
  getSelectedComponents: () => ComponentInstance[];
  
  /** Returns an array of currently selected wires */
  getSelectedWires: () => Wire[];
  
  /** Moves a component to a new position */
  moveComponent: (id: string, newPosition: Point) => void;
  
  /** Moves all currently selected components by a delta */
  moveSelectedComponents: (dx: number, dy: number) => void;
  
  /** Starts the process of drawing a wire from a component port */
  startWireDrawing: (componentId: string, portId: string) => void;
  
  /** Completes the wire drawing process, connecting to another port */
  completeWireDrawing: (componentId: string, portId: string) => boolean;
  
  /** Cancels the wire drawing process */
  cancelWireDrawing: () => void;
  
  /** Checks if a connection between two ports is valid */
  isValidConnection: (fromId: string, fromPortId: string, toId: string, toPortId: string) => boolean;
  
  /** Rotates a component by the specified degrees */
  rotateComponent: (id: string, degrees: number) => void;
  
  /** Rotates all currently selected components by the specified degrees */
  rotateSelectedComponents: (degrees: number) => void;
  
  /** Undoes the last action */
  undo: () => void;
  
  /** Redoes the last undone action */
  redo: () => void;
  
  /** Checks if an undo action is possible */
  canUndo: () => boolean;
  
  /** Checks if a redo action is possible */
  canRedo: () => boolean;
}

/**
 * React hook for managing circuit state
 * 
 * @param initialState - Optional initial state for the circuit
 * @returns A tuple containing the circuit state and action functions
 */
export function useCircuit(initialState?: Partial<CircuitState>): [CircuitState, CircuitActions] {
  // History for undo/redo
  const undoStack = useRef<CircuitState[]>([]);
  const redoStack = useRef<CircuitState[]>([]);
  
  const [state, setState] = useState<CircuitState>({
    components: initialState?.components || [],
    wires: initialState?.wires || [],
    selectedComponentIds: initialState?.selectedComponentIds || [],
    selectedWireIds: initialState?.selectedWireIds || []
  });

  // Helper to save state for undo
  const saveStateForUndo = useCallback((prevState: CircuitState) => {
    undoStack.current.push(JSON.parse(JSON.stringify(prevState)));
    // Clear redo stack when a new action is performed
    redoStack.current = [];
  }, []);
  
  // Wrapped setState with history tracking
  const setStateWithHistory = useCallback((updater: (prev: CircuitState) => CircuitState) => {
    setState(prev => {
      // Save the current state for undoing
      saveStateForUndo(prev);
      // Apply the update
      return updater(prev);
    });
  }, [saveStateForUndo]);

  // Generate a unique ID for new components/wires
  const generateId = useCallback((prefix: string): string => {
    return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  // Add a component
  const addComponent = useCallback((component: Omit<ComponentInstance, 'id'>): string => {
    const id = generateId('component');
    setStateWithHistory(prev => ({
      ...prev,
      components: [...prev.components, { ...component, id }]
    }));
    return id;
  }, [generateId, setStateWithHistory]);

  // Update a component
  const updateComponent = useCallback((id: string, updates: Partial<ComponentInstance>): void => {
    setStateWithHistory(prev => ({
      ...prev,
      components: prev.components.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
    }));
  }, [setStateWithHistory]);

  // Remove a component
  const removeComponent = useCallback((id: string): void => {
    setStateWithHistory(prev => {
      // Remove the component
      const components = prev.components.filter(c => c.id !== id);
      
      // Remove any wires connected to this component
      const wires = prev.wires.filter(w => 
        w.from.componentId !== id && w.to.componentId !== id
      );
      
      // Remove from selection if selected
      const selectedComponentIds = prev.selectedComponentIds.filter(selectedId => selectedId !== id);
      
      return { 
        ...prev, 
        components, 
        wires, 
        selectedComponentIds 
      };
    });
  }, [setStateWithHistory]);

  // Add a wire
  const addWire = useCallback((from: Wire['from'], to: Wire['to'], style?: Wire['style']): string => {
    const id = generateId('wire');
    setStateWithHistory(prev => ({
      ...prev,
      wires: [...prev.wires, { id, from, to, style }]
    }));
    return id;
  }, [generateId, setStateWithHistory]);

  // Update a wire
  const updateWire = useCallback((id: string, updates: Partial<Wire>): void => {
    setStateWithHistory(prev => ({
      ...prev,
      wires: prev.wires.map(w => 
        w.id === id ? { ...w, ...updates } : w
      )
    }));
  }, [setStateWithHistory]);

  // Remove a wire
  const removeWire = useCallback((id: string): void => {
    setStateWithHistory(prev => ({
      ...prev,
      wires: prev.wires.filter(w => w.id !== id),
      selectedWireIds: prev.selectedWireIds.filter(wireId => wireId !== id)
    }));
  }, [setStateWithHistory]);

  // Select a component
  const selectComponent = useCallback((id: string, addToSelection: boolean = false): void => {
    setState(prev => {
      // If adding to selection, keep previous selections, otherwise start fresh
      const selectedComponentIds = addToSelection 
        ? [...prev.selectedComponentIds, id]
        : [id];
      
      return {
        ...prev,
        selectedComponentIds: [...new Set(selectedComponentIds)] // Deduplicate
      };
    });
  }, []);

  // Select a wire
  const selectWire = useCallback((id: string, addToSelection: boolean = false): void => {
    setState(prev => {
      // If adding to selection, keep previous selections, otherwise start fresh
      const selectedWireIds = addToSelection 
        ? [...prev.selectedWireIds, id]
        : [id];
      
      return {
        ...prev,
        selectedWireIds: [...new Set(selectedWireIds)] // Deduplicate
      };
    });
  }, []);

  // Deselect all components and wires
  const deselectAll = useCallback((): void => {
    setState(prev => ({
      ...prev,
      selectedComponentIds: [],
      selectedWireIds: []
    }));
  }, []);

  // Get selected components
  const getSelectedComponents = useCallback((): ComponentInstance[] => {
    return state.components.filter(c => 
      state.selectedComponentIds.includes(c.id)
    );
  }, [state.components, state.selectedComponentIds]);

  // Get selected wires
  const getSelectedWires = useCallback((): Wire[] => {
    return state.wires.filter(w => 
      state.selectedWireIds.includes(w.id)
    );
  }, [state.wires, state.selectedWireIds]);

  // Move a component to a new position
  const moveComponent = useCallback((id: string, newPosition: Point): void => {
    setStateWithHistory(prev => ({
      ...prev,
      components: prev.components.map(c => 
        c.id === id ? { ...c, position: newPosition } : c
      )
    }));
  }, [setStateWithHistory]);

  // Move all selected components by a delta
  const moveSelectedComponents = useCallback((dx: number, dy: number): void => {
    setStateWithHistory(prev => ({
      ...prev,
      components: prev.components.map(c => {
        if (prev.selectedComponentIds.includes(c.id)) {
          return {
            ...c,
            position: {
              x: c.position.x + dx,
              y: c.position.y + dy
            }
          };
        }
        return c;
      })
    }));
  }, [setStateWithHistory]);

  // Rotate a component by the specified degrees
  const rotateComponent = useCallback((id: string, degrees: number): void => {
    setStateWithHistory(prev => ({
      ...prev,
      components: prev.components.map(c => {
        if (c.id === id) {
          // Calculate new rotation, normalizing between 0-359
          const currentRotation = c.rotation || 0;
          const newRotation = (currentRotation + degrees) % 360;
          return {
            ...c,
            rotation: newRotation < 0 ? newRotation + 360 : newRotation
          };
        }
        return c;
      })
    }));
  }, [setStateWithHistory]);

  // Rotate all selected components
  const rotateSelectedComponents = useCallback((degrees: number): void => {
    setStateWithHistory(prev => ({
      ...prev,
      components: prev.components.map(c => {
        if (prev.selectedComponentIds.includes(c.id)) {
          // Calculate new rotation, normalizing between 0-359
          const currentRotation = c.rotation || 0;
          const newRotation = (currentRotation + degrees) % 360;
          return {
            ...c,
            rotation: newRotation < 0 ? newRotation + 360 : newRotation
          };
        }
        return c;
      })
    }));
  }, [setStateWithHistory]);

  // Undo the last action
  const undo = useCallback((): void => {
    if (undoStack.current.length > 0) {
      // Save current state to redo stack
      redoStack.current.push(JSON.parse(JSON.stringify(state)));
      
      // Pop the last state from undo stack
      const prevState = undoStack.current.pop()!;
      
      // Apply the previous state
      setState(prevState);
    }
  }, [state]);

  // Redo the last undone action
  const redo = useCallback((): void => {
    if (redoStack.current.length > 0) {
      // Save current state to undo stack
      undoStack.current.push(JSON.parse(JSON.stringify(state)));
      
      // Pop the last state from redo stack
      const nextState = redoStack.current.pop()!;
      
      // Apply the next state
      setState(nextState);
    }
  }, [state]);

  // Check if undo is possible
  const canUndo = useCallback((): boolean => {
    return undoStack.current.length > 0;
  }, []);

  // Check if redo is possible
  const canRedo = useCallback((): boolean => {
    return redoStack.current.length > 0;
  }, []);

  // Wire drawing state
  const [wireDrawingState, setWireDrawingState] = useState<{
    isDrawing: boolean;
    fromComponentId: string | null;
    fromPortId: string | null;
  }>({
    isDrawing: false,
    fromComponentId: null,
    fromPortId: null
  });

  // Start drawing a wire from a component port
  const startWireDrawing = useCallback((componentId: string, portId: string): void => {
    setWireDrawingState({
      isDrawing: true,
      fromComponentId: componentId,
      fromPortId: portId
    });
  }, []);

  // Complete wire drawing by connecting to another port
  const completeWireDrawing = useCallback((toComponentId: string, toPortId: string): boolean => {
    const { isDrawing, fromComponentId, fromPortId } = wireDrawingState;
    
    if (!isDrawing || !fromComponentId || !fromPortId) {
      return false;
    }

    // Check if this is a valid connection
    const isValid = isValidConnection(
      fromComponentId,
      fromPortId,
      toComponentId,
      toPortId
    );

    if (isValid) {
      // Create the wire
      addWire(
        { componentId: fromComponentId, portId: fromPortId },
        { componentId: toComponentId, portId: toPortId }
      );
      
      // Reset wire drawing state
      setWireDrawingState({
        isDrawing: false,
        fromComponentId: null,
        fromPortId: null
      });
      
      return true;
    }
    
    return false;
  }, [wireDrawingState, addWire]);

  // Cancel wire drawing
  const cancelWireDrawing = useCallback((): void => {
    setWireDrawingState({
      isDrawing: false,
      fromComponentId: null,
      fromPortId: null
    });
  }, []);

  // Check if a connection between two ports is valid
  const isValidConnection = useCallback((
    fromId: string, 
    fromPortId: string, 
    toId: string, 
    toPortId: string
  ): boolean => {
    // Don't allow connections to the same component
    if (fromId === toId) {
      return false;
    }
    
    // Don't allow duplicate connections
    const isDuplicate = state.wires.some(wire => 
      (wire.from.componentId === fromId && wire.from.portId === fromPortId &&
       wire.to.componentId === toId && wire.to.portId === toPortId) ||
      (wire.from.componentId === toId && wire.from.portId === toPortId &&
       wire.to.componentId === fromId && wire.to.portId === fromPortId)
    );
    
    if (isDuplicate) {
      return false;
    }
    
    // Get component schemas for port type checking
    const fromComponent = state.components.find(c => c.id === fromId);
    const toComponent = state.components.find(c => c.id === toId);
    
    if (!fromComponent || !toComponent) {
      return false;
    }
    
    const fromSchema = getComponentSchema(fromComponent.type);
    const toSchema = getComponentSchema(toComponent.type);
    
    if (!fromSchema || !toSchema) {
      return false;
    }
    
    // Get port info
    const fromPort = fromSchema.ports.find(p => p.id === fromPortId);
    const toPort = toSchema.ports.find(p => p.id === toPortId);
    
    if (!fromPort || !toPort) {
      return false;
    }
    
    // Basic port compatibility check - outputs can connect to inputs
    if (fromPort.type === 'output' && toPort.type === 'input') {
      return true;
    }
    
    // Inputs can connect to outputs
    if (fromPort.type === 'input' && toPort.type === 'output') {
      return true;
    }
    
    // Bidirectional ports can connect to anything
    if (fromPort.type === 'inout' || toPort.type === 'inout') {
      return true;
    }
    
    return false;
  }, [state.components, state.wires]);

  const actions: CircuitActions = {
    addComponent,
    updateComponent,
    removeComponent,
    addWire,
    updateWire,
    removeWire,
    selectComponent,
    selectWire,
    deselectAll,
    getSelectedComponents,
    getSelectedWires,
    moveComponent,
    moveSelectedComponents,
    startWireDrawing,
    completeWireDrawing,
    cancelWireDrawing,
    isValidConnection,
    rotateComponent,
    rotateSelectedComponents,
    undo,
    redo,
    canUndo,
    canRedo
  };

  return [state, actions];
}

export default useCircuit;
