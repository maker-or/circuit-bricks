/**
 * WirePath Component
 * 
 * Renders a wire connection between two component ports.
 */

import React, { useEffect, useState, useRef } from 'react';
import { Wire, ComponentInstance, Point } from '../types';
import { getPortPosition } from '../utils/getPortPosition';

export interface WirePathProps {
  wire: Wire;
  components: ComponentInstance[];
  selected?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

interface PortPosition {
  x: number;
  y: number;
  found: boolean;
}

const WirePath: React.FC<WirePathProps> = ({
  wire,
  components,
  selected = false,
  onClick
}) => {
  const [fromPos, setFromPos] = useState<PortPosition>({ x: 0, y: 0, found: false });
  const [toPos, setToPos] = useState<PortPosition>({ x: 0, y: 0, found: false });
  const pathRef = useRef<SVGPathElement>(null);

  // Function to update port positions
  const updatePortPositions = () => {
    try {
      const fromPosition = getPortPosition(wire.from.componentId, wire.from.portId);
      if (fromPosition) {
        setFromPos({ ...fromPosition, found: true });
      }
    } catch (error) {
      console.warn(`Could not find source port for wire ${wire.id}:`, error);
    }

    try {
      const toPosition = getPortPosition(wire.to.componentId, wire.to.portId);
      if (toPosition) {
        setToPos({ ...toPosition, found: true });
      }
    } catch (error) {
      console.warn(`Could not find destination port for wire ${wire.id}:`, error);
    }
  };

  // Setup a MutationObserver to watch for component position changes
  useEffect(() => {
    updatePortPositions();
    
    // Watch for changes in component attributes (like x, y, transform)
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'transform' || 
             mutation.attributeName === 'x' || 
             mutation.attributeName === 'y')) {
          shouldUpdate = true;
        }
      });
      
      if (shouldUpdate) {
        updatePortPositions();
      }
    });
    
    // Find all relevant component SVG elements to observe
    const fromComponent = document.querySelector(`[data-component-id="${wire.from.componentId}"]`);
    const toComponent = document.querySelector(`[data-component-id="${wire.to.componentId}"]`);
    
    if (fromComponent) {
      observer.observe(fromComponent, { attributes: true, attributeFilter: ['transform', 'x', 'y'] });
    }
    
    if (toComponent) {
      observer.observe(toComponent, { attributes: true, attributeFilter: ['transform', 'x', 'y'] });
    }
    
    // Also set up a resize observer to update positions when the canvas resizes
    const resizeObserver = new ResizeObserver(() => {
      updatePortPositions();
    });
    
    if (pathRef.current) {
      const svgElement = pathRef.current.closest('svg');
      if (svgElement) {
        resizeObserver.observe(svgElement);
      }
    }
    
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [wire, components]);

  // Update positions when components array changes (new components added or removed)
  useEffect(() => {
    updatePortPositions();
  }, [components.length]);

  // Do not render the wire if either port was not found
  if (!fromPos.found || !toPos.found) {
    return null;
  }

  // Calculate a bezier curve path with proper spacing between components
  const generatePath = (from: Point, to: Point): string => {
    // Calculate distance between points
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // For very short distances, use a straight line
    if (distance < 20) {
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    }
    
    // Calculate control points with optimized offset
    const controlPointLength = Math.min(distance / 3, 60); // Reduced for smoother curves
    
    // Determine dominant axis and adjust control points to create natural curves
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal dominant
      const cp1x = from.x + controlPointLength;
      const cp1y = from.y;
      const cp2x = to.x - controlPointLength;
      const cp2y = to.y;
      return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
    } else {
      // Vertical dominant
      const cp1x = from.x;
      const cp1y = from.y + controlPointLength;
      const cp2x = to.x;
      const cp2y = to.y - controlPointLength;
      return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
    }
  };

  // Wire style based on selected state and custom style
  const wireStyle = {
    stroke: selected ? '#4f8ef7' : (wire.style?.color || '#333'),
    strokeWidth: selected ? 3 : (wire.style?.strokeWidth || 2),
    strokeDasharray: wire.style?.dashArray || 'none',
    fill: 'none',
    vectorEffect: 'non-scaling-stroke' as const,
  };

  return (
    <path
      ref={pathRef}
      d={generatePath(fromPos, toPos)}
      className={`wire ${selected ? 'selected' : ''}`}
      {...wireStyle}
      onClick={onClick}
      data-wire-id={wire.id}
      data-from-component={wire.from.componentId}
      data-from-port={wire.from.portId}
      data-to-component={wire.to.componentId}
      data-to-port={wire.to.portId}
      style={{ cursor: 'pointer' }}
    />
  );
};

export default WirePath;
