/**
 * SimpleCircuitExample Component
 * 
 * A simple example of using the Circuit-Bricks library.
 */

import React, { useEffect } from 'react';
import { 
  CircuitCanvas, 
  useCircuit, 
  PropertyPanel, 
  ComponentPalette,
  CircuitToolbar
} from '../index';

const SimpleCircuitExample: React.FC = () => {
  const [circuit, actions] = useCircuit();
  const {
    addComponent,
    updateComponent,
    removeComponent,
    addWire,
    updateWire,
    removeWire,
    selectComponent,
    selectWire,
    deselectAll
  } = actions;

  // Create a simple circuit on component mount
  useEffect(() => {
    // Add a battery
    const batteryId = addComponent({
      type: 'battery',
      position: { x: 100, y: 200 },
      props: { voltage: 9 }
    });

    // Add a resistor
    const resistorId = addComponent({
      type: 'resistor',
      position: { x: 200, y: 200 },
      props: { resistance: 220 }
    });

    // Add an LED
    const diodeId = addComponent({
      type: 'diode',
      position: { x: 300, y: 200 },
      props: { forwardVoltage: 1.8 }
    });

    // Add a ground
    const groundId = addComponent({
      type: 'ground',
      position: { x: 200, y: 300 },
      props: {}
    });

    // Connect the components with wires
    addWire(
      { componentId: batteryId, portId: 'positive' },
      { componentId: resistorId, portId: 'left' }
    );

    addWire(
      { componentId: resistorId, portId: 'right' },
      { componentId: diodeId, portId: 'anode' }
    );

    addWire(
      { componentId: diodeId, portId: 'cathode' },
      { componentId: groundId, portId: 'terminal' }
    );

    addWire(
      { componentId: batteryId, portId: 'negative' },
      { componentId: groundId, portId: 'terminal' }
    );
  }, []);

  // Handle component selection
  const handleComponentClick = (id: string) => {
    selectComponent(id);
  };

  // Handle wire selection
  const handleWireClick = (id: string) => {
    selectWire(id);
  };

  // Handle canvas click (deselect all)
  const handleCanvasClick = () => {
    deselectAll();
  };

  // Handle property changes
  const handlePropertyChange = (id: string, key: string, value: any) => {
    updateComponent(id, {
      props: {
        ...circuit.components.find(c => c.id === id)?.props,
        [key]: value
      }
    });
  };

  // Handle component selection from palette
  const handleSelectComponent = (componentType: string) => {
    addComponent({
      type: componentType,
      position: { x: 200, y: 200 }, // Center of canvas, should be improved
      props: {}
    });
  };

  // Handle toolbar actions
  const handleToolbarAction = (action: string) => {
    switch (action) {
      case 'delete':
        // Delete selected components
        circuit.selectedComponentIds.forEach(id => removeComponent(id));
        // Delete selected wires
        circuit.selectedWireIds.forEach(id => removeWire(id));
        break;
      
      // Other actions would be implemented here
      
      default:
        console.log(`Action not implemented: ${action}`);
    }
  };

  // Get the currently selected component (first one if multiple)
  const selectedComponent = circuit.selectedComponentIds.length > 0
    ? circuit.components.find(c => c.id === circuit.selectedComponentIds[0]) || null
    : null;

  return (
    <div className="circuit-example">
      <div className="circuit-toolbar-container">
        <CircuitToolbar
          onAction={handleToolbarAction}
          hasSelection={circuit.selectedComponentIds.length > 0 || circuit.selectedWireIds.length > 0}
        />
      </div>
      
      <div className="circuit-workspace">
        <div className="component-palette-container">
          <ComponentPalette onSelectComponent={handleSelectComponent} />
        </div>
        
        <div className="circuit-canvas-container">
          <CircuitCanvas
            components={circuit.components}
            wires={circuit.wires}
            selectedComponentIds={circuit.selectedComponentIds}
            selectedWireIds={circuit.selectedWireIds}
            onComponentClick={handleComponentClick}
            onWireClick={handleWireClick}
            onCanvasClick={handleCanvasClick}
            width="800px"
            height="600px"
          />
        </div>
        
        <div className="property-panel-container">
          <PropertyPanel
            component={selectedComponent}
            onPropertyChange={handlePropertyChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SimpleCircuitExample;
