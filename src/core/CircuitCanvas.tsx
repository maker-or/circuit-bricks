/**
 * CircuitCanvas Component
 * 
 * The main canvas component that renders circuit components and wires.
 * Supports infinite panning and zooming for a free-flowing design experience.
 * 
 * @component
 * @example
 * <CircuitCanvas
 *   components={state.components}
 *   wires={state.wires}
 *   width={800}
 *   height={600}
 *   onComponentClick={handleComponentClick}
 *   showGrid={true}
 * />
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ComponentInstance, Wire, Point } from '../types';
import Brick from './Brick';
import WirePath from './WirePath';
import { getPortPosition } from '../utils/getPortPosition';
import { getComponentSchema } from '../registry';

export interface CircuitCanvasProps {
  /** Array of component instances to render on the canvas */
  components: ComponentInstance[];
  
  /** Array of wires connecting components */
  wires: Wire[];
  
  /** Width of the canvas. Can be a number (pixels) or string (e.g., '100%') */
  width?: number | string;
  
  /** Height of the canvas. Can be a number (pixels) or string (e.g., '100%') */
  height?: number | string;
  
  /** Callback when a component is clicked */
  onComponentClick?: (id: string, event: React.MouseEvent) => void;
  
  /** Callback when a wire is clicked */
  onWireClick?: (id: string, event: React.MouseEvent) => void;
  
  /** Callback when the canvas background is clicked */
  onCanvasClick?: (event: React.MouseEvent) => void;
  
  /** Callback when a component is dragged to a new position */
  onComponentDrag?: (id: string, newPosition: Point) => void;
  
  /** Callback when wire drawing starts from a port */
  onWireDrawStart?: (componentId: string, portId: string) => void;
  
  /** Callback when wire drawing ends on a port. Return true to accept the connection. */
  onWireDrawEnd?: (componentId: string, portId: string) => boolean;
  
  /** Callback when wire drawing is canceled */
  onWireDrawCancel?: () => void;
  
  /** Object representing the current wire drawing state */
  wireDrawing?: {
    isDrawing: boolean;
    fromComponentId: string | null;
    fromPortId: string | null;
  };
  
  /** Array of currently selected component IDs */
  selectedComponentIds?: string[];
  
  /** Array of currently selected wire IDs */
  selectedWireIds?: string[];
  
  /** Whether to show the grid on the canvas */
  showGrid?: boolean;
  
  /** Size of the grid cells in pixels */
  gridSize?: number;
  
  /** Whether to snap components to the grid */
  snapToGrid?: boolean;
  
  /** Callback when a component is dropped onto the canvas */
  onComponentDrop?: (componentType: string, position: Point) => void;
  
  /** Initial zoom level for the canvas (1.0 = 100%) */
  initialZoom?: number;
  
  /** Minimum allowed zoom level */
  minZoom?: number;
  
  /** Maximum allowed zoom level */
  maxZoom?: number;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  components,
  wires,
  width = '100%',
  height = '100%',
  onComponentClick,
  onWireClick,
  onCanvasClick,
  onComponentDrag,
  onWireDrawStart,
  onWireDrawEnd,
  onWireDrawCancel,
  wireDrawing = {
    isDrawing: false,
    fromComponentId: null,
    fromPortId: null
  },
  selectedComponentIds = [],
  selectedWireIds = [],
  showGrid = true,
  gridSize = 20,
  snapToGrid = false,
  onComponentDrop,
  initialZoom = 1.0,
  minZoom = 0.25,
  maxZoom = 3.0
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    componentId: string | null;
    startPos: Point | null;
    currentPos: Point | null;
  }>({
    isDragging: false,
    componentId: null,
    startPos: null,
    currentPos: null
  });
  
  const [currentMousePos, setCurrentMousePos] = useState<Point | null>(null);
  const [sourcePortPos, setSourcePortPos] = useState<Point | null>(null);
  
  // Viewport state for infinite canvas
  const [viewportTransform, setViewportTransform] = useState({
    x: 0,
    y: 0,
    scale: initialZoom
  });
  
  // For canvas panning
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPos, setPanStartPos] = useState<Point | null>(null);
  
  // Ref to detect if mouse is down (for panning)
  const isMouseDownRef = useRef(false);

  // Effect to dispatch viewport-change event when transform changes
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Create a custom event for viewport changes
    const viewportChangeEvent = new CustomEvent('viewport-change', {
      detail: viewportTransform,
      bubbles: true
    });
    
    // Dispatch the event
    svgRef.current.dispatchEvent(viewportChangeEvent);
  }, [viewportTransform]);

  // Effect to update the source port position when wire drawing starts
  useEffect(() => {
    if (wireDrawing.isDrawing && wireDrawing.fromComponentId && wireDrawing.fromPortId) {
      // Schedule a brief timeout to allow the DOM to update
      const timer = setTimeout(() => {
        const portPos = getPortPosition(wireDrawing.fromComponentId!, wireDrawing.fromPortId!);
        if (portPos) {
          setSourcePortPos(portPos);
        }
      }, 0);
      
      return () => clearTimeout(timer);
    } else {
      setSourcePortPos(null);
    }
  }, [wireDrawing]);

  // Convert screen coordinates to SVG coordinates (accounting for pan and zoom)
  const screenToSvgCoordinates = useCallback((clientX: number, clientY: number): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = (clientX - svgRect.left - viewportTransform.x) / viewportTransform.scale;
    const y = (clientY - svgRect.top - viewportTransform.y) / viewportTransform.scale;
    
    // Snap to grid if enabled
    if (snapToGrid) {
      return { 
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize
      };
    }
    
    return { x, y };
  }, [gridSize, snapToGrid, viewportTransform]);

  // Get SVG coordinates from mouse event (accounting for pan and zoom)
  const getSvgCoordinates = useCallback((e: React.MouseEvent | React.DragEvent): Point => {
    return screenToSvgCoordinates(e.clientX, e.clientY);
  }, [screenToSvgCoordinates]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only trigger if the click is directly on the canvas
    if (e.target === e.currentTarget) {
      // If we weren't panning, trigger the canvas click
      if (!isPanning) {
        onCanvasClick?.(e);
        
        // If we're drawing a wire, cancel it
        if (wireDrawing.isDrawing) {
          onWireDrawCancel?.();
        }
      }
    }
  };

  const handleComponentClick = (id: string, event: React.MouseEvent) => {
    // Only handle click if we're not dragging
    if (!dragState.isDragging && !isPanning) {
      onComponentClick?.(id, event);
    }
  };

  const handleWireClick = (id: string, event: React.MouseEvent) => {
    if (!isPanning) {
      onWireClick?.(id, event);
    }
  };

  const handleMouseDown = (componentId: string, event: React.MouseEvent) => {
    // Start dragging - allow dragging of any clicked component
    const startPos = getSvgCoordinates(event);
    setDragState({
      isDragging: true,
      componentId,
      startPos,
      currentPos: startPos
    });
    
    // Ensure the component is selected
    if (!selectedComponentIds.includes(componentId) && onComponentClick) {
      onComponentClick(componentId, event);
    }
    
    event.stopPropagation();
  };

  // Handle mouse down on the canvas for panning
  const handleCanvasMouseDown = (event: React.MouseEvent) => {
    // Only start panning if we click the canvas background and it's a middle mouse button or space + left click
    if (event.target === event.currentTarget && (event.button === 1 || (event.button === 0 && event.altKey))) {
      setIsPanning(true);
      setPanStartPos({ x: event.clientX, y: event.clientY });
      isMouseDownRef.current = true;
      
      // Prevent default to avoid text selection
      event.preventDefault();
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    // Handle pan movement
    if (isPanning && panStartPos) {
      const dx = event.clientX - panStartPos.x;
      const dy = event.clientY - panStartPos.y;
      
      setViewportTransform(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      setPanStartPos({ x: event.clientX, y: event.clientY });
      return;
    }
    
    // For regular interaction, convert coordinates
    const currentPos = getSvgCoordinates(event);
    setCurrentMousePos(currentPos);
    
    // Update drag position if dragging
    if (dragState.isDragging && dragState.componentId) {
      setDragState({ ...dragState, currentPos });
      
      // Find the component being dragged
      const component = components.find(c => c.id === dragState.componentId);
      if (component && dragState.startPos && currentPos) {
        // Calculate the new position
        const dx = currentPos.x - dragState.startPos.x;
        const dy = currentPos.y - dragState.startPos.y;
        const newPosition = {
          x: component.position.x + dx,
          y: component.position.y + dy
        };
        
        // Snap to grid if needed (now controlled by snapToGrid prop)
        if (snapToGrid) {
          newPosition.x = Math.round(newPosition.x / gridSize) * gridSize;
          newPosition.y = Math.round(newPosition.y / gridSize) * gridSize;
        }
        
        // Call the onComponentDrag handler
        onComponentDrag?.(dragState.componentId, newPosition);
      }
    }
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    // End dragging
    if (dragState.isDragging) {
      setDragState({
        isDragging: false,
        componentId: null,
        startPos: null,
        currentPos: null
      });
    }
    
    // End panning
    if (isPanning) {
      setIsPanning(false);
      setPanStartPos(null);
    }
    
    isMouseDownRef.current = false;
  };
  
  // Handle mouse leaving the canvas
  const handleMouseLeave = () => {
    if (isPanning) {
      setIsPanning(false);
      setPanStartPos(null);
    }
    isMouseDownRef.current = false;
  };
  
  // Handle wheel event for zooming
  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    
    // Only zoom if ctrl key is pressed
    if (event.ctrlKey || event.metaKey) {
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(minZoom, Math.min(maxZoom, viewportTransform.scale + delta));
      
      // Get mouse position relative to SVG
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      
      const mouseX = event.clientX - svgRect.left;
      const mouseY = event.clientY - svgRect.top;
      
      // Calculate new transform origin based on mouse position
      setViewportTransform(prev => {
        // Calculate the point in world coordinates
        const worldX = (mouseX - prev.x) / prev.scale;
        const worldY = (mouseY - prev.y) / prev.scale;
        
        // Calculate new transform (zoom around mouse position)
        const newX = mouseX - worldX * newScale;
        const newY = mouseY - worldY * newScale;
        
        return {
          x: newX,
          y: newY,
          scale: newScale
        };
      });
    } else {
      // Pan horizontally with shift+wheel
      if (event.shiftKey) {
        setViewportTransform(prev => ({
          ...prev,
          x: prev.x - event.deltaY
        }));
      } else {
        // Pan vertically with wheel
        setViewportTransform(prev => ({
          ...prev,
          y: prev.y - event.deltaY
        }));
      }
    }
  };

  const handlePortClick = (componentId: string, portId: string, event: React.MouseEvent) => {
    // Ignore port clicks when panning
    if (isPanning) return;
    
    event.stopPropagation();
    
    // If we're not drawing a wire, start drawing
    if (!wireDrawing.isDrawing) {
      onWireDrawStart?.(componentId, portId);
    } else {
      // If we are drawing a wire, end drawing and connect to this port
      if (wireDrawing.fromComponentId && wireDrawing.fromPortId) {
        onWireDrawEnd?.(componentId, portId);
      }
    }
  };

  // Generate a bezier curve path between two points - updated to match WirePath
  const generateWirePath = (from: Point, to: Point): string => {
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
  
  // Handle drag and drop events for component palette
  const handleDragOver = (event: React.DragEvent) => {
    // Prevent default to allow drop
    event.preventDefault();
    // Set the drop effect to copy
    event.dataTransfer.dropEffect = 'copy';
  };
  
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    
    // Get the component type from the drag data
    const componentType = event.dataTransfer.getData('application/circuit-component');
    if (!componentType || !onComponentDrop) return;
    
    // Get drop position in SVG coordinates (taking into account pan/zoom)
    const position = getSvgCoordinates(event);
    
    // Create a new component at this position
    onComponentDrop(componentType, position);
  };

  // Create keyboard shortcut handlers for common operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process when the canvas is active
      if (!svgRef.current) return;
      
      // Ignore if we're in an input field
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Handle space key for panning toggle
      if (e.code === 'Space' && !isPanning && document.activeElement === document.body) {
        e.preventDefault(); // Prevent page scroll
      }
      
      // Reset view with key '0'
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setViewportTransform({
          x: 0,
          y: 0,
          scale: 1.0
        });
      }
      
      // Zoom in with + or =
      if ((e.key === '+' || e.key === '=') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setViewportTransform(prev => ({
          ...prev,
          scale: Math.min(maxZoom, prev.scale + 0.1)
        }));
      }
      
      // Zoom out with -
      if (e.key === '-' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setViewportTransform(prev => ({
          ...prev,
          scale: Math.max(minZoom, prev.scale - 0.1)
        }));
      }
      
      // Arrow keys for panning when Alt is pressed
      if (e.altKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const panAmount = e.shiftKey ? 50 : 20; // Faster panning with Shift
        
        setViewportTransform(prev => {
          let dx = 0, dy = 0;
          if (e.key === 'ArrowLeft') dx = panAmount;
          if (e.key === 'ArrowRight') dx = -panAmount;
          if (e.key === 'ArrowUp') dy = panAmount;
          if (e.key === 'ArrowDown') dy = -panAmount;
          
          return {
            ...prev,
            x: prev.x + dx,
            y: prev.y + dy
          };
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPanning, maxZoom, minZoom]);

  // State for showing help message
  const [showHelp, setShowHelp] = useState(true);
  
  // Hide help message after 15 seconds
  useEffect(() => {
    if (showHelp) {
      const timer = setTimeout(() => {
        setShowHelp(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [showHelp]);

  // Cursor style based on current interaction mode
  const getCursorStyle = () => {
    if (isPanning) return 'grabbing';
    if (isMouseDownRef.current) return 'grabbing';
    if (wireDrawing.isDrawing) return 'crosshair';
    return 'default';
  };

  // Calculate grid pattern sizing based on zoom
  const getGridSize = () => {
    // Adjust grid density based on zoom level for better visualization
    const scaledGridSize = gridSize * (1 + (1 - Math.min(viewportTransform.scale, 1)) * 2);
    return scaledGridSize;
  };

  return (
    <svg 
      ref={svgRef}
      width={width}
      height={height}
      style={{ 
        backgroundColor: '#111111',
        userSelect: 'none',
        cursor: getCursorStyle(),
        overflow: 'hidden'
      }}
      onClick={handleCanvasClick}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-circuit-canvas
    >
      {/* Grid pattern */}
      <defs>
        <pattern
          id="grid"
          width={getGridSize()}
          height={getGridSize()}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${viewportTransform.x % getGridSize()},${viewportTransform.y % getGridSize()}) scale(${viewportTransform.scale})`}
        >
          <rect width={getGridSize()} height={getGridSize()} fill="#111111" />
          <circle cx={getGridSize()} cy={getGridSize()} r="0.5" fill="#222222" />
        </pattern>
        
        <pattern
          id="dots"
          width={getGridSize()}
          height={getGridSize()}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${viewportTransform.x % getGridSize()},${viewportTransform.y % getGridSize()}) scale(${viewportTransform.scale})`}
        >
          <rect width={getGridSize()} height={getGridSize()} fill="#111111" />
          <circle cx={getGridSize()/2} cy={getGridSize()/2} r="0.7" fill="#222222" />
        </pattern>
        
        {/* Pattern for infinite grid that adjusts with pan/zoom */}
        <pattern
          id="infinite-grid"
          width={getGridSize() * 5}
          height={getGridSize() * 5}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${viewportTransform.x % (getGridSize() * 5)},${viewportTransform.y % (getGridSize() * 5)}) scale(${viewportTransform.scale})`}
        >
          <rect width={getGridSize() * 5} height={getGridSize() * 5} fill="#111111" />
          <path 
            d={`M 0 0 H ${getGridSize() * 5} M 0 ${getGridSize()} H ${getGridSize() * 5} M 0 ${getGridSize() * 2} H ${getGridSize() * 5} M 0 ${getGridSize() * 3} H ${getGridSize() * 5} M 0 ${getGridSize() * 4} H ${getGridSize() * 5} M 0 0 V ${getGridSize() * 5} M ${getGridSize()} 0 V ${getGridSize() * 5} M ${getGridSize() * 2} 0 V ${getGridSize() * 5} M ${getGridSize() * 3} 0 V ${getGridSize() * 5} M ${getGridSize() * 4} 0 V ${getGridSize() * 5}`}
            stroke="#222222"
            strokeWidth="0.3"
          />
          <path 
            d={`M 0 0 H ${getGridSize() * 5} M 0 ${getGridSize() * 5} H ${getGridSize() * 5} M 0 0 V ${getGridSize() * 5} M ${getGridSize() * 5} 0 V ${getGridSize() * 5}`}
            stroke="#333333"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      {showGrid && <rect width="100%" height="100%" fill="url(#infinite-grid)" />}

      {/* Viewport transformation group */}
      <g transform={`translate(${viewportTransform.x}, ${viewportTransform.y}) scale(${viewportTransform.scale})`}>
        {/* Layers in correct order to ensure proper rendering */}
        {/* 1. Wires layer (bottom) */}
        <g className="circuit-wires">
          {wires.map(wire => (
            <WirePath
              key={wire.id}
              wire={wire}
              components={components}
              selected={selectedWireIds.includes(wire.id)}
              onClick={(e) => handleWireClick(wire.id, e)}
            />
          ))}
          
          {/* Wire currently being drawn */}
          {wireDrawing.isDrawing && sourcePortPos && currentMousePos && (
            <path
              d={generateWirePath(sourcePortPos, currentMousePos)}
              stroke="#4f8ef7"
              strokeWidth={2}
              strokeDasharray="5,5"
              fill="none"
              className="wire-preview"
              style={{ pointerEvents: 'visible' }}
            />
          )}
        </g>

        {/* 2. Components layer (top) - ensures components are rendered on top of wires */}
        <g className="circuit-components">
          {components.map(component => (
            <Brick
              key={component.id}
              component={component}
              selected={selectedComponentIds.includes(component.id)}
              onClick={(e) => handleComponentClick(component.id, e)}
              onMouseDown={(e) => handleMouseDown(component.id, e)}
              onPortClick={handlePortClick}
            />
          ))}
        </g>
      </g>
      
      {/* Viewport information overlay (optional for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <text
          x="10"
          y="20"
          fill="#666"
          fontSize="12"
          pointerEvents="none"
        >
          {`Position: (${Math.round(viewportTransform.x)}, ${Math.round(viewportTransform.y)}) | Zoom: ${viewportTransform.scale.toFixed(2)}`}
        </text>
      )}
      
      {/* Minimap for navigation in infinite canvas (bottom-left) */}
      <g className="circuit-minimap" transform={`translate(10, ${typeof height === 'number' ? height - 120 : 'calc(100% - 120px)'})`}>
        <rect
          x="0"
          y="0"
          width="110"
          height="110"
          fill="#222"
          fillOpacity="0.7"
          stroke="#444"
          strokeWidth="1"
          rx="4"
        />
        
        {/* Viewport indicator */}
        <rect
          x={5}
          y={5}
          width={100}
          height={100}
          fill="none"
          stroke="#333"
          strokeWidth="1"
        />
        
        {/* Components representation */}
        <g transform="scale(0.1) translate(50, 50)">
          {components.map(component => (
            <circle 
              key={component.id}
              cx={component.position.x}
              cy={component.position.y}
              r={15}
              fill={selectedComponentIds.includes(component.id) ? "#4f8ef7" : "#666"}
            />
          ))}
          
          {/* Viewport window representation */}
          <rect
            x={-viewportTransform.x / viewportTransform.scale}
            y={-viewportTransform.y / viewportTransform.scale}
            width={typeof width === 'number' ? width / viewportTransform.scale : 1000 / viewportTransform.scale}
            height={typeof height === 'number' ? height / viewportTransform.scale : 800 / viewportTransform.scale}
            fill="none"
            stroke="#4f8ef7"
            strokeWidth="10"
            strokeDasharray="20,10"
          />
        </g>
        
        {/* Toggle button */}
        <rect
          x="85"
          y="0"
          width="25"
          height="25"
          fill="#333"
          rx="4"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            const minimapEl = document.querySelector('.circuit-minimap');
            if (minimapEl) {
              minimapEl.setAttribute('style', 'display: none');
            }
          }}
        />
        <text x="93" y="17" fill="#fff" fontSize="16" style={{ cursor: 'pointer' }}>
          ×
        </text>
      </g>
      
      {/* Help message for infinite canvas */}
      {showHelp && (
        <g transform={`translate(${typeof width === 'number' ? width / 2 - 150 : '50%'}, 30)`}>
          <rect
            x="-10"
            y="-10"
            width="320"
            height="85"
            rx="8"
            fill="rgba(0, 0, 0, 0.7)"
            stroke="#4f8ef7"
            strokeWidth="1"
          />
          <text x="0" y="15" fill="#fff" fontSize="14" fontWeight="bold">
            Infinite Canvas Controls:
          </text>
          <text x="0" y="35" fill="#eee" fontSize="12">
            • Alt + drag/middle mouse: Pan canvas
          </text>
          <text x="0" y="50" fill="#eee" fontSize="12">
            • Ctrl/⌘ + scroll: Zoom in/out
          </text>
          <text x="0" y="65" fill="#eee" fontSize="12">
            • Ctrl/⌘ + 0: Reset view
          </text>
          <rect
            x="290"
            y="-10"
            width="20"
            height="20"
            rx="4"
            fill="rgba(100, 100, 100, 0.5)"
            cursor="pointer"
            onClick={() => setShowHelp(false)}
          />
          <text x="296" y="5" fill="#fff" fontSize="16" cursor="pointer" onClick={() => setShowHelp(false)}>
            ×
          </text>
        </g>
      )}
      
      {/* Mini controls overlay */}
      <g 
        transform="translate(10, 10)"
        style={{ opacity: 0.7 }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        <rect
          x="0"
          y="0"
          width="80"
          height="22"
          rx="4"
          fill="#222"
          fillOpacity="0.8"
        />
        <g 
          transform="translate(10, 11)"
          cursor="pointer"
          onClick={() => setViewportTransform(prev => ({...prev, scale: Math.min(maxZoom, prev.scale + 0.1)}))}
        >
          <circle r="8" fill="#333" />
          <path d="M-4,0 H4 M0,-4 V4" stroke="#aaa" strokeWidth="1.5" />
        </g>
        <g 
          transform="translate(40, 11)"
          cursor="pointer"
          onClick={() => setViewportTransform(prev => ({...prev, scale: Math.max(minZoom, prev.scale - 0.1)}))}
        >
          <circle r="8" fill="#333" />
          <path d="M-4,0 H4" stroke="#aaa" strokeWidth="1.5" />
        </g>
        <g 
          transform="translate(70, 11)"
          cursor="pointer"
          onClick={() => setViewportTransform({x: 0, y: 0, scale: 1})}
        >
          <circle r="8" fill="#333" />
          <path d="M-3,-3 L3,3 M-3,3 L3,-3" stroke="#aaa" strokeWidth="1.5" />
        </g>
      </g>
    </svg>
  );
};

export default CircuitCanvas;
