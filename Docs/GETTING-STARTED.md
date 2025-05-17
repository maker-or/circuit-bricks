# Getting Started with Circuit-Bricks

This guide will help you quickly get up and running with Circuit-Bricks, a React + TypeScript library for creating interactive SVG-based electrical circuit diagrams.

## Prerequisites

- Node.js (v14.0.0 or higher)
- React (v16.8.0 or higher)
- TypeScript (recommended, but optional)

## Installation

Install Circuit-Bricks using your preferred package manager:

```bash
# npm
npm install circuit-bricks

# yarn
yarn add circuit-bricks

# pnpm
pnpm add circuit-bricks
```

## Key Features

### Infinite Canvas

Circuit-Bricks now features an infinite canvas that allows you to create circuits of any size. This gives you unlimited space to design complex circuits while providing intuitive navigation:

```tsx
<CircuitCanvas
  components={components}
  wires={wires}
  showGrid={true}
  initialZoom={1.0}
  minZoom={0.25}
  maxZoom={3.0}
/>
```

#### Navigation Controls:
- **Pan**: Hold Alt key + drag mouse, or use middle mouse button
- **Zoom**: Ctrl/⌘ + mouse wheel, or use on-screen zoom controls
- **Reset View**: Ctrl/⌘ + 0 key, or click the reset button
- **Arrow Navigation**: Alt + Arrow keys (with Shift for faster movement)

#### Visual Aids:
- A minimap in the bottom-right corner helps with navigation
- On-screen controls for zooming in, out, and resetting view
- Grid pattern that adapts to the zoom level

### Basic Usage

### Step 1: Import the library

```tsx
import React from 'react';
import { 
  CircuitCanvas, 
  useCircuit 
} from 'circuit-bricks';
```

### Step 2: Create a basic component

```tsx
const SimpleCircuit = () => {
  const { 
    components, 
    wires, 
    addComponent, 
    addWire 
  } = useCircuit();

  // Add a resistor and battery when the component mounts
  React.useEffect(() => {
    const resistorId = addComponent({
      type: 'resistor',
      position: { x: 100, y: 100 },
      props: { resistance: 220 }
    });

    const batteryId = addComponent({
      type: 'battery',
      position: { x: 20, y: 100 },
      props: { voltage: 9 }
    });

    // Connect them with a wire
    addWire({
      from: { componentId: batteryId, portId: 'positive' },
      to: { componentId: resistorId, portId: 'left' }
    });
  }, [addComponent, addWire]);

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <CircuitCanvas
        components={components}
        wires={wires}
        showGrid={true}
        initialZoom={1.0}
        minZoom={0.25}
        maxZoom={3.0}
      />
    </div>
  );
};
```

### Step 3: Add interactive features

Let's enhance our circuit with selection capabilities:

```tsx
const InteractiveCircuit = () => {
  const { 
    components, 
    wires, 
    addComponent, 
    addWire,
    selectedComponent,
    setSelectedComponent,
    clearSelection
  } = useCircuit();

  // Same component creation code as before...

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <CircuitCanvas
        components={components}
        wires={wires}
        showGrid={true}
        onComponentClick={(id) => setSelectedComponent(id)}
        onCanvasClick={() => clearSelection()}
      />
      
      {selectedComponent && (
        <div className="info-panel">
          <h3>Selected Component</h3>
          <p>Type: {components[selectedComponent].type}</p>
          <pre>{JSON.stringify(components[selectedComponent].props, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
```

## Building a Complete Circuit Editor

To create a full-featured circuit editor, you can use the additional UI components:

```tsx
import React from 'react';
import {
  CircuitCanvas,
  useCircuit,
  PropertyPanel,
  ComponentPalette,
  CircuitToolbar
} from 'circuit-bricks';

const CircuitEditor = () => {
  const {
    components,
    wires,
    addComponent,
    updateComponent,
    removeComponent,
    selectedComponent,
    selectedWire,
    setSelectedComponent,
    setSelectedWire,
    clearSelection
  } = useCircuit();

  const handleToolbarAction = (action) => {
    if (action === 'delete' && selectedComponent) {
      removeComponent(selectedComponent);
    }
    // Handle other actions...
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <CircuitToolbar
        onAction={handleToolbarAction}
        hasSelection={!!selectedComponent}
      />
      
      <div style={{ display: 'flex', flex: 1 }}>
        <ComponentPalette
          onSelectComponent={(type) => {
            addComponent({
              type,
              position: { x: 200, y: 200 },
              props: {}
            });
          }}
        />
        
        <CircuitCanvas
          components={components}
          wires={wires}
          onComponentClick={setSelectedComponent}
          onWireClick={setSelectedWire}
          onCanvasClick={clearSelection}
          showGrid={true}
        />
        
        {selectedComponent && (
          <PropertyPanel
            component={components[selectedComponent]}
            onPropertyChange={(key, value) => {
              updateComponent(selectedComponent, {
                props: { ...components[selectedComponent].props, [key]: value }
              });
            }}
          />
        )}
      </div>
    </div>
  );
};
```

## Adding Custom Components

You can extend Circuit-Bricks with your own custom components:

```tsx
import { registerComponent } from 'circuit-bricks';

// Define a custom component schema
const myInductor = {
  id: 'inductor',
  name: 'Inductor',
  category: 'passive',
  description: 'A passive component that stores energy in a magnetic field',
  defaultWidth: 80,
  defaultHeight: 30,
  ports: [
    { id: 'left', x: 0, y: 15, type: 'inout' },
    { id: 'right', x: 80, y: 15, type: 'inout' }
  ],
  properties: [
    {
      key: 'inductance',
      label: 'Inductance',
      type: 'number',
      unit: 'mH',
      default: 10,
      min: 0
    }
  ],
  svgPath: "M10,15 h10 C25,5 25,25 35,15 C45,5 45,25 55,15 C65,5 65,25 70,15 h10"
};

// Register it with the component registry
registerComponent(myInductor);

// Now you can use it like any built-in component
const inductorId = addComponent({
  type: 'inductor',
  position: { x: 100, y: 150 },
  props: { inductance: 15 }
});
```

## Creating Wires

Wires connect ports between components:

```tsx
// Add a wire between two components
addWire({
  from: { componentId: 'component1', portId: 'output' },
  to: { componentId: 'component2', portId: 'input' }
});

// Update wire properties (like style)
updateWire('wire1', {
  style: {
    color: '#ff0000',
    strokeWidth: 2,
    dashArray: '5,5'
  }
});

// Remove a wire
removeWire('wire1');
```

## Validating Circuits

Circuit-Bricks can check for common circuit problems:

```tsx
const { validateCircuit } = useCircuit();

const handleValidate = () => {
  const issues = validateCircuit();
  
  if (issues.length === 0) {
    alert('Circuit is valid!');
  } else {
    // Display issues
    issues.forEach(issue => {
      console.log(`${issue.type}: ${issue.message}`);
    });
  }
};
```

## Using Component Properties

Each component type has specific properties that can be edited:

```tsx
// Add a resistor with specific properties
const resistorId = addComponent({
  type: 'resistor',
  position: { x: 100, y: 100 },
  props: { 
    resistance: 1000,  // 1k ohm
    tolerance: 5       // 5%
  }
});

// Update a component's properties
updateComponent(resistorId, {
  props: {
    ...components[resistorId].props,
    resistance: 2200  // Change to 2.2k ohm
  }
});
```

## Working with the Infinite Canvas

The infinite canvas feature gives you unlimited space to design circuits of any complexity. Here's how to effectively use this feature:

### Navigating the Canvas

```tsx
// In your circuit component
return (
  <div style={{ width: '100%', height: '100vh' }}>
    <CircuitCanvas
      components={components}
      wires={wires}
      showGrid={true}
      initialZoom={0.8} // Start with a slightly zoomed out view
    />
  </div>
);
```

### Navigation Tips

1. **For Large Circuits**: Start with a lower initialZoom value (e.g., 0.5) to see more of the circuit at once
2. **Precision Work**: Zoom in (up to maxZoom) when connecting small components or working on detailed sections
3. **Strategic Component Placement**: Use different areas of the canvas for different circuit sections
4. **Minimap**: Use the minimap in the bottom-right corner to keep track of your position in large designs

### Programmatic Control

You can programmatically respond to viewport changes by listening to the viewport-change event:

```tsx
// Add this in a useEffect in your component
useEffect(() => {
  const canvas = document.querySelector('[data-circuit-canvas]');
  if (canvas) {
    const handleViewportChange = (e) => {
      console.log('Viewport changed:', e.detail);
      // Access current position and zoom: e.detail.x, e.detail.y, e.detail.scale
    };
    canvas.addEventListener('viewport-change', handleViewportChange);
    return () => {
      canvas.removeEventListener('viewport-change', handleViewportChange);
    };
  }
}, []);
```

## Next Steps

Now that you have the basics, you can:

1. Explore the built-in components in more detail
2. Create custom component schemas for your specific needs
3. Build a full circuit editor with the UI components
4. Implement validation and simulation features
5. Leverage the infinite canvas for complex circuit designs

For more details, check the following resources:

- [Technical Design](./TECHNICAL-DESIGN.md): Architecture and implementation details
- [Component Schemas](./COMPONENT-SCHEMAS.md): Component schema reference
- [Documentation](./DOCUMENTATION.md): Complete API reference

## Troubleshooting

### Common Issues

- **Components not showing up**: Make sure the component type is correctly registered and spelled correctly.
- **Wires not connecting**: Verify that port IDs match those defined in the component schema.
- **SVG rendering issues**: Check that your component schemas have valid SVG path data.
- **Property updates not reflecting**: Ensure you're using immutable updates to the component props object.

### Browser Compatibility

Circuit-Bricks is built on standard SVG and React, so it works in all modern browsers. For best results:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Internet Explorer is not supported.

## Conclusion

With Circuit-Bricks, you can create interactive electrical circuit diagrams with ease. The modular component system, combined with React's declarative approach, makes it simple to build rich, interactive circuit applications.

Happy circuit building!
