/**
 * InteractiveCircuitExample Component
 * 
 * Example component showcasing interactive features of the circuit-bricks library.
 */

import React, { useRef, useEffect, useState } from 'react';
import { 
  CircuitCanvas, 
  useCircuit,
  ComponentPalette,
  PropertyPanel,
  CircuitToolbar,
  Point
} from '../index';
import { validateCircuit } from '../utils/circuitValidation';

const InteractiveCircuitExample: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize the circuit state
  const [state, {
    addComponent,
    updateComponent,
    removeComponent,
    addWire,
    removeWire,
    selectComponent,
    selectWire,
    deselectAll,
    moveComponent,
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
  }] = useCircuit();
  
  // Wire drawing state
  const [wireDrawing, setWireDrawing] = React.useState<{
    isDrawing: boolean;
    fromComponentId: string | null;
    fromPortId: string | null;
  }>({
    isDrawing: false,
    fromComponentId: null,
    fromPortId: null
  });
  
  // State for validation issues
  const [validationIssues, setValidationIssues] = useState<number>(0);
  
  // Handler for selecting a component from the palette
  const handleSelectComponent = (componentType: string) => {
    // Calculate position in the middle of the canvas
    const container = containerRef.current;
    let posX = 200;
    let posY = 200;
    
    if (container) {
      const rect = container.getBoundingClientRect();
      posX = rect.width / 2;
      posY = rect.height / 2;
    }
    
    // Add the component to the circuit
    const id = addComponent({
      type: componentType,
      position: { x: posX, y: posY },
      props: {}
    });
    
    // Select the new component
    selectComponent(id);
  };
  
  // Handler for drag and drop
  const handleComponentDrop = (componentType: string, position: Point) => {
    // Add the component to the circuit at the drop position
    const id = addComponent({
      type: componentType,
      position,
      props: {}
    });
    
    // Select the new component
    selectComponent(id);
  };
  
  // Handler for toolbar actions
  const handleToolbarAction = (action: string) => {
    switch (action) {
      case 'delete':
        // Delete selected components and wires
        state.selectedComponentIds.forEach(id => removeComponent(id));
        state.selectedWireIds.forEach(id => removeWire(id));
        break;
      case 'grid-toggle':
        // Toggle grid visibility
        break;
      case 'undo':
        undo();
        break;
      case 'redo':
        redo();
        break;
      case 'rotate-cw':
        rotateSelectedComponents(90);
        break;
      case 'rotate-ccw':
        rotateSelectedComponents(-90);
        break;
      case 'validate':
        // Use the validation utility
        const issues = validateCircuit(state);
        setValidationIssues(issues.length);
        
        if (issues.length > 0) {
          // Display first few issues
          const message = issues
            .slice(0, 3)
            .map(issue => `- ${issue.message}`)
            .join('\n');
          
          alert(`Circuit validation found ${issues.length} issues:\n${message}${
            issues.length > 3 ? '\n\n...and ' + (issues.length - 3) + ' more' : ''
          }`);
        } else {
          alert('Circuit validation successful! No issues found.');
        }
        break;
      default:
        console.log(`Action not implemented: ${action}`);
    }
  };
  
  // Handler for component property changes
  const handlePropertyChange = (id: string, key: string, value: any) => {
    const component = state.components.find(c => c.id === id);
    if (component) {
      const updatedProps = { ...component.props, [key]: value };
      updateComponent(id, { props: updatedProps });
    }
  };

  // Handle starting to draw a wire
  const handleWireDrawStart = (componentId: string, portId: string) => {
    setWireDrawing({
      isDrawing: true,
      fromComponentId: componentId,
      fromPortId: portId
    });
    startWireDrawing(componentId, portId);
  };
  
  // Handle completing a wire
  const handleWireDrawEnd = (componentId: string, portId: string) => {
    if (wireDrawing.fromComponentId && wireDrawing.fromPortId) {
      const success = completeWireDrawing(componentId, portId);
      setWireDrawing({
        isDrawing: false,
        fromComponentId: null,
        fromPortId: null
      });
      return success;
    }
    return false;
  };
  
  // Handle canceling wire drawing
  const handleWireDrawCancel = () => {
    setWireDrawing({
      isDrawing: false,
      fromComponentId: null,
      fromPortId: null
    });
    cancelWireDrawing();
  };
  
  // Handle component clicks
  const handleComponentClick = (id: string, event: React.MouseEvent) => {
    // Use Shift key for multi-selection
    const addToSelection = event.shiftKey;
    selectComponent(id, addToSelection);
  };
  
  // Handle wire clicks
  const handleWireClick = (id: string, event: React.MouseEvent) => {
    // Use Shift key for multi-selection
    const addToSelection = event.shiftKey;
    selectWire(id, addToSelection);
  };
  
  // Handle canvas click (deselect all when clicking on empty space)
  const handleCanvasClick = () => {
    deselectAll();
  };
  
  return (
    <div className="interactive-circuit-example">
      <div className="circuit-container" ref={containerRef}>
        <CircuitToolbar
          onAction={handleToolbarAction}
          hasSelection={state.selectedComponentIds.length > 0 || state.selectedWireIds.length > 0}
          showGrid={true}
          canUndo={canUndo()}
          canRedo={canRedo()}
          validationIssues={validationIssues}
        />
        
        <div className="circuit-content">
          <ComponentPalette onSelectComponent={handleSelectComponent} />
          
          <div className="circuit-canvas-container">
            <CircuitCanvas
              components={state.components}
              wires={state.wires}
              selectedComponentIds={state.selectedComponentIds}
              selectedWireIds={state.selectedWireIds}
              showGrid={true}
              onComponentClick={handleComponentClick}
              onWireClick={handleWireClick}
              onCanvasClick={handleCanvasClick}
              onComponentDrag={moveComponent}
              onWireDrawStart={handleWireDrawStart}
              onWireDrawEnd={handleWireDrawEnd}
              onWireDrawCancel={handleWireDrawCancel}
              wireDrawing={wireDrawing}
              onComponentDrop={handleComponentDrop}
            />
          </div>
          
          <PropertyPanel
            component={state.selectedComponentIds.length === 1
              ? state.components.find(c => c.id === state.selectedComponentIds[0]) || null
              : null
            }
            onPropertyChange={handlePropertyChange}
          />
        </div>
      </div>
      
      <style>
        {`
        .interactive-circuit-example {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
        }
        
        .circuit-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .circuit-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        .circuit-canvas-container {
          flex: 1;
          position: relative;
          overflow: hidden;
        }
        `}
      </style>
    </div>
  );
};

export default InteractiveCircuitExample;
