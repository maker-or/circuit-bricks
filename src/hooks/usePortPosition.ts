/**
 * usePortPosition Hook
 * 
 * A React hook for tracking the position of component ports.
 * Compatible with infinite circuit canvas with panning and zooming.
 */

import { useState, useEffect, useCallback } from 'react';
import { Point, Wire } from '../types';
import { getPortPosition } from '../utils/getPortPosition';

interface PortPositionState {
  from: Point | null;
  to: Point | null;
  error: string | null;
}

/**
 * A hook to track the positions of ports connected by a wire
 * 
 * @param wire - The wire connecting the ports
 * @param deps - Additional dependencies that should trigger position updates
 * @returns Object containing port positions and error state
 */
export function usePortPosition(
  wire: Wire | null,
  deps: any[] = []
): PortPositionState {
  const [state, setState] = useState<PortPositionState>({
    from: null,
    to: null,
    error: null
  });
  
  // Use callback to get port positions to avoid useEffect dependencies
  const updatePositions = useCallback(() => {
    if (!wire) {
      setState({
        from: null,
        to: null,
        error: 'No wire provided'
      });
      return;
    }
    
    // Small delay to ensure DOM has been updated
    setTimeout(() => {
      try {
        // Get source port position
        const fromPos = getPortPosition(wire.from.componentId, wire.from.portId);
        
        // Get destination port position
        const toPos = getPortPosition(wire.to.componentId, wire.to.portId);
        
        setState({
          from: fromPos,
          to: toPos,
          error: (!fromPos || !toPos) 
            ? `Could not find ports for wire ${wire.id}`
            : null
        });
      } catch (error) {
        setState({
          from: null,
          to: null,
          error: `Error getting port positions: ${error}`
        });
      }
    }, 0);
  }, [wire]);
  
  // Update positions when wire or dependencies change
  useEffect(() => {
    updatePositions();
    
    // Add event listeners for window resize and canvas transformations to update positions
    window.addEventListener('resize', updatePositions);
    
    // Listen to custom event for viewport transformations
    const handleViewportChange = () => {
      updatePositions();
    };
    
    // Find circuit canvas element to attach transformation event listeners
    const canvas = document.querySelector('[data-circuit-canvas]');
    if (canvas) {
      // Listen to mouse wheel events for zoom changes
      canvas.addEventListener('wheel', updatePositions, { passive: true });
      
      // Custom event for pan/zoom that can be dispatched by CircuitCanvas
      canvas.addEventListener('viewport-change', handleViewportChange);
    }
    
    return () => {
      window.removeEventListener('resize', updatePositions);
      
      if (canvas) {
        canvas.removeEventListener('wheel', updatePositions);
        canvas.removeEventListener('viewport-change', handleViewportChange);
      }
    };
  }, [wire, updatePositions, ...deps]);
  
  return state;
}

/**
 * Hook to track a single port position
 * 
 * @param componentId - The component ID
 * @param portId - The port ID
 * @param deps - Additional dependencies that should trigger position updates
 * @returns The port position or null if not found
 */
export function useSinglePortPosition(
  componentId: string | null,
  portId: string | null,
  deps: any[] = []
): Point | null {
  const [position, setPosition] = useState<Point | null>(null);
  
  const updatePosition = useCallback(() => {
    if (!componentId || !portId) {
      setPosition(null);
      return;
    }
    
    setTimeout(() => {
      try {
        const pos = getPortPosition(componentId, portId);
        setPosition(pos);
      } catch (error) {
        console.warn(`Error getting port position: ${error}`);
        setPosition(null);
      }
    }, 0);
  }, [componentId, portId]);
  
  useEffect(() => {
    updatePosition();
    
    // Add event listeners for window resize and canvas transformations
    window.addEventListener('resize', updatePosition);
    
    // Listen to custom event for viewport transformations
    const handleViewportChange = () => {
      updatePosition();
    };
    
    // Find circuit canvas element to attach transformation event listeners
    const canvas = document.querySelector('[data-circuit-canvas]');
    if (canvas) {
      // Listen to mouse wheel events for zoom changes
      canvas.addEventListener('wheel', updatePosition, { passive: true });
      
      // Custom event for pan/zoom that can be dispatched by CircuitCanvas
      canvas.addEventListener('viewport-change', handleViewportChange);
    }
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      
      if (canvas) {
        canvas.removeEventListener('wheel', updatePosition);
        canvas.removeEventListener('viewport-change', handleViewportChange);
      }
    };
  }, [componentId, portId, updatePosition, ...deps]);
  
  return position;
}

export default usePortPosition;
