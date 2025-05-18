# Circuit-Bricks

> **⚠️ DEVELOPMENT STATUS:** This library is currently in early development stage and not recommended for production use. APIs may change, features might be incomplete, and there could be significant bugs. Use at your own risk.

A React + TypeScript library for creating SVG-based electrical circuit diagrams with a Lego-style component system.

![Circuit-Bricks Banner](https://github.com/sphere-labs/circuit-bricks/raw/main/assets/banner.png)

## Features

- **Modular Component System**: Each electrical element is a self-contained SVG "brick"
- **Infinite Canvas**: Free-flowing design with pan and zoom capabilities for circuits of any size
- **Pure Rendering Core**: Focuses on rendering with optional editing UI components
- **AI-First Design**: Deterministic JSON schema makes it easy for AI agents to generate circuits
- **TypeScript Support**: Fully typed API for better developer experience
- **SVG-Based Rendering**: Vector graphics for crisp rendering at any scale
- **Component Registry**: Extensible system for creating custom circuit elements
- **Customizable UI Components**: Optional UI elements for circuit editing
- **Dual Package Format**: Supports both ESM and CommonJS

## Installation

```bash
# npm
npm install circuit-bricks

# yarn
yarn add circuit-bricks

# pnpm
pnpm add circuit-bricks
```

## Development Status

**Circuit-Bricks is currently in active development and should NOT be used in production environments.**

- **Alpha Stage**: The API is subject to change without notice
- **Limited Testing**: While we have tests, real-world usage is limited
- **Incomplete Features**: Some advanced features may still be in development
- **Possible Bugs**: You may encounter unexpected issues
- **Performance Tuning**: Optimizations are still ongoing

We welcome contributors and early adopters to help shape the future of the library, but please be aware of the current limitations before integrating it into critical projects.

For the latest updates on stability and roadmap, please check our [GitHub repository](https://github.com/sphere-labs/circuit-bricks).

## Security

Circuit-Bricks is designed with security in mind:

- No external dependencies in the production build
- Regular security audits on all dependencies
- Complete type safety with TypeScript
- Content Security Policy (CSP) compatible - no inline scripts or styles
- All SVG content is properly sanitized

To verify the security of the package:

```bash
# Run a security audit
npm audit --production

# Check for outdated dependencies
npm outdated
```

## Quick Start

Here's a simple example to get you started:

```tsx
import React from 'react';
import { CircuitCanvas, useCircuit } from 'circuit-bricks';

const SimpleCircuitExample = () => {
  const [state, actions] = useCircuit();

  // Add a battery, resistor and LED on mount
  React.useEffect(() => {
    const batteryId = actions.addComponent({
      type: 'battery',
      position: { x: 100, y: 150 },
      props: { voltage: 9 }
    });

    const resistorId = addComponent({
      type: 'resistor',
      position: { x: 250, y: 100 },
      props: { resistance: 1000 }
    });

    const ledId = addComponent({
      type: 'led',
      position: { x: 400, y: 150 },
      props: { color: '#ff0000' }
    });

    const groundId = addComponent({
      type: 'ground',
      position: { x: 250, y: 200 },
      props: {}
    });

    // Connect components
    addWire({
      from: { componentId: batteryId, portId: 'positive' },
      to: { componentId: resistorId, portId: 'left' }
    });

    addWire({
      from: { componentId: resistorId, portId: 'right' },
      to: { componentId: ledId, portId: 'anode' }
    });

    addWire({
      from: { componentId: ledId, portId: 'cathode' },
      to: { componentId: groundId, portId: 'terminal' }
    });

    addWire({
      from: { componentId: batteryId, portId: 'negative' },
      to: { componentId: groundId, portId: 'terminal' }
    });
  }, [addComponent, addWire]);

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <CircuitCanvas 
        components={components} 
        wires={wires}
        onComponentClick={(id) => setSelectedComponent(id)}
        showGrid={true}
      />
    </div>
  );
};
```

## Available Components

The library includes a variety of built-in electrical components:

### Basic Components
- Resistor
- Capacitor
- Switch
- Ground

### Power Sources
- Battery
- Voltage Source

### Semiconductors
- Diode
- LED
- Transistor (NPN)

### Advanced
- Integrated Circuit (generic)

## Component System

Components in Circuit-Bricks are defined by JSON schemas that specify their appearance, connection points, and configurable properties.

### Component Schema

```typescript
interface ComponentSchema {
  id: string;                  // Unique identifier for the component type
  name: string;                // Human-readable name for display
  category: string;            // Category grouping for UI organization
  description: string;         // Description of the component
  defaultWidth: number;        // Default width in SVG units
  defaultHeight: number;       // Default height in SVG units
  ports: PortSchema[];         // Connection points definition
  properties: PropertySchema[]; // Configurable properties
  svgPath: string;             // SVG path data or complete SVG markup
}
```

### Custom Components

You can create and register your own components:

```tsx
import { registerComponent } from 'circuit-bricks';

const customComponent = {
  id: 'custom-op-amp',
  name: 'Op-Amp',
  category: 'integrated',
  description: 'Operational Amplifier',
  defaultWidth: 60,
  defaultHeight: 60,
  ports: [
    { id: 'in+', x: 0, y: 20, type: 'input', label: '+' },
    { id: 'in-', x: 0, y: 40, type: 'input', label: '-' },
    { id: 'out', x: 60, y: 30, type: 'output' },
    { id: 'vcc', x: 30, y: 0, type: 'input' },
    { id: 'gnd', x: 30, y: 60, type: 'input' }
  ],
  properties: [
    { 
      key: 'gain', 
      label: 'Gain', 
      type: 'number', 
      default: 100000 
    }
  ],
  svgPath: 'M10,25 h80' // SVG path data
});
```

## Main Components

### CircuitCanvas

The main container component that renders a circuit:

```tsx
<CircuitCanvas
  components={componentMap}
  wires={wireMap}
  width={800}
  height={600}
  showGrid={true}
  gridSize={20}
  onComponentClick={(id) => {}}
  onWireClick={(id) => {}}
  onCanvasClick={() => {}}
/>
```

### Hooks and State Management

Circuit-Bricks provides a powerful hook for managing circuit state:

```tsx
const { 
  // Circuit state
  components,           // Map of component instances
  wires,                // Map of wire connections
  selectedComponent,    // Selected component ID
  selectedWire,         // Selected wire ID
  
  // Actions
  addComponent,         // Add a new component
  updateComponent,      // Update an existing component
  removeComponent,      // Remove a component
  addWire,              // Add a new wire
  updateWire,           // Update a wire
  removeWire,           // Remove a wire
  setSelectedComponent, // Select a component
  setSelectedWire,      // Select a wire
  clearSelection,       // Clear all selections
  validateCircuit       // Validate circuit and return issues
} = useCircuit();
```

### UI Components

Optional UI components for circuit editing:

```tsx
// Component property editor
<PropertyPanel
  component={componentInstance}
  onPropertyChange={(key, value) => {}}
/>

// Component selection palette
<ComponentPalette
  onSelectComponent={(type) => {}}
  filter={['basic', 'passive']}
/>

// Circuit operation toolbar
<CircuitToolbar
  onAction={(action) => {}}
  hasSelection={true}
/>
```

## Complete Example: Interactive Circuit Editor

Here's a complete example of an interactive circuit editor:

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
    addWire,
    removeWire,
    selectedComponent,
    selectedWire,
    setSelectedComponent,
    setSelectedWire,
    clearSelection
  } = useCircuit();

  const handleAction = (action) => {
    switch (action) {
      case 'delete':
        if (selectedComponent) {
          removeComponent(selectedComponent);
        } else if (selectedWire) {
          removeWire(selectedWire);
        }
        break;
      case 'rotate':
        if (selectedComponent) {
          const currentRotation = components[selectedComponent].rotation || 0;
          updateComponent(selectedComponent, {
            rotation: (currentRotation + 90) % 360
          });
        }
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <CircuitToolbar
          onAction={handleAction}
          hasSelection={!!(selectedComponent || selectedWire)}
        />
      </div>
      
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ width: '200px', borderRight: '1px solid #ccc', overflow: 'auto' }}>
          <ComponentPalette
            onSelectComponent={(type) => {
              addComponent({
                type,
                position: { x: 200, y: 200 },
                props: {}
              });
            }}
          />
        </div>
        
        <div style={{ flex: 1, position: 'relative' }}>
          <CircuitCanvas
            components={components}
            wires={wires}
            showGrid={true}
            onComponentClick={(id) => {
              setSelectedComponent(id);
              setSelectedWire(null);
            }}
            onWireClick={(id) => {
              setSelectedWire(id);
              setSelectedComponent(null);
            }}
            onCanvasClick={() => {
              clearSelection();
            }}
          />
        </div>
        
        <div style={{ width: '250px', borderLeft: '1px solid #ccc', padding: '10px' }}>
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
          
          {!selectedComponent && !selectedWire && (
            <div className="empty-panel">
              <p>Select a component or wire to view properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

## Examples and Demos

Circuit-Bricks comes with several ready-to-use example circuits that showcase different features and use cases:

### Simple Circuit Example

A basic circuit with a battery, resistor, and LED - perfect for getting started.

```tsx
import { SimpleCircuitExample } from 'circuit-bricks';

const App = () => (
  <div style={{ width: '800px', height: '600px' }}>
    <SimpleCircuitExample />
  </div>
);
```

### Interactive Circuit Editor

A complete circuit editor with component palette, property panel, and circuit validation.

```tsx
import { InteractiveCircuitExample } from 'circuit-bricks';

const App = () => (
  <div style={{ width: '100%', height: '800px' }}>
    <InteractiveCircuitExample />
  </div>
);
```

### Voltage Regulator Circuit

A 7805 voltage regulator circuit that converts 9V to 5V with input and output capacitors.

```tsx
import { VoltageRegulatorExample } from 'circuit-bricks';

const App = () => (
  <div style={{ width: '100%', height: '500px' }}>
    <VoltageRegulatorExample />
  </div>
);
```

### 555 Timer LED Blinker

An astable multivibrator circuit using the 555 timer IC to blink an LED.

```tsx
import { TimerCircuitExample } from 'circuit-bricks';

const App = () => (
  <div style={{ width: '100%', height: '600px' }}>
    <TimerCircuitExample />
  </div>
);
```

Each example is fully interactive and can be used as a starting point for your own circuits. You can also find these examples in the CodeSandbox demos.

## Documentation

For comprehensive documentation, please check these files:

- [Technical Design](./TECHNICAL-DESIGN.md): Architecture and implementation details
- [Component Schemas](./COMPONENT-SCHEMAS.md): Component schema reference and examples
- [Documentation](./DOCUMENTATION.md): Complete API reference and usage guide

## Project Structure

```
src/
├─ index.ts                 # Main exports
├─ types.ts                 # Core type definitions
├─ core/                    # Core rendering components
│  ├─ BaseComponent.tsx     # Base SVG rendering
│  ├─ Brick.tsx             # Schema to component mapper
│  ├─ Port.tsx              # Port rendering
│  ├─ WirePath.tsx          # Wire path rendering
│  └─ CircuitCanvas.tsx     # Main canvas component
├─ registry/                # Component schema registry
│  ├─ index.ts              # Registry API
│  └─ components/           # Component schema definitions
│     ├─ resistor.json      # Example component schema
│     └─ ...
├─ hooks/                   # React hooks
│  ├─ useCircuit.ts         # Circuit state management
│  └─ usePortPosition.ts    # Port position tracking
├─ ui/                      # Optional UI components
│  ├─ PropertyPanel.tsx     # Component property editor
│  ├─ ComponentPalette.tsx  # Component selection palette
│  └─ CircuitToolbar.tsx    # Actions toolbar
└─ utils/                   # Utility functions
   ├─ getPortPosition.ts    # DOM position helpers
   └─ circuitValidation.ts  # Circuit validation utilities
```

## Roadmap

- [x] Core circuit rendering components
- [x] Component palette and property editor UI
- [x] Wire drawing and connection management  
- [x] Circuit validation and error checking
- [x] Example circuits and documentation
- [ ] Circuit simulation capabilities
- [ ] Export/import functionality (JSON, SVG)
- [ ] Additional component libraries (digital logic, microcontrollers)
- [ ] Integration with popular EDA tools
- [ ] Complete demo application
- [ ] CodeSandbox examples
- [ ] Advanced wire routing algorithms
- [ ] Circuit simulation capabilities
- [ ] Virtualization for large circuits
- [ ] Grouping and subcircuit creation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

Copyright (c) 2023 Sphere Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Performance Optimization

Circuit-Bricks is designed with performance in mind, particularly for rendering large circuits with many components and wires.

### Bundle Size

The core library is lightweight:

- Minified: ~64KB
- Gzipped: ~22KB

### Rendering Optimization

For optimal performance when rendering complex circuits:

1. **Component Memoization**: All components use React.memo to prevent unnecessary re-renders
2. **Virtualization**: For large circuits, consider using a virtualization library to render only visible components
3. **Lazy Loading**: Examples and UI components can be imported using dynamic imports
4. **SVG Optimization**: All SVG paths are optimized for performance and size

Example of optimized rendering for large circuits:

```tsx
import React, { useState, useEffect } from 'react';
import { CircuitCanvas } from 'circuit-bricks';

const OptimizedCircuitView = ({ components, wires }) => {
  // Only re-render visible components based on viewport
  const [visibleArea, setVisibleArea] = useState({ 
    x: 0, y: 0, width: 1000, height: 800 
  });
  
  // Filter to show only components in the viewport
  const visibleComponents = components.filter(component => 
    isInViewport(component.position, visibleArea)
  );
  
  return (
    <CircuitCanvas
      components={visibleComponents}
      wires={wires}
      width="100%"
      height="800px"
    />
  );
};

// Helper function to check if a component is in the viewport
function isInViewport(position, viewport) {
  return (
    position.x >= viewport.x - 50 &&
    position.x <= viewport.x + viewport.width + 50 &&
    position.y >= viewport.y - 50 &&
    position.y <= viewport.y + viewport.height + 50
  );
}
```

## Testing

The Circuit-Bricks library has a comprehensive testing suite to verify component rendering and circuit functionality:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
```

We've added several documentation files to help with testing:

- [TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md): A checklist for manual and automated testing
- [TESTING-SETUP.md](./TESTING-SETUP.md): Documentation of the testing environment setup

The test suite includes:
- Component rendering tests
- Hook functionality tests
- Registry validation tests
- Complex circuit tests
- Circuit validation tests

For more details, see the [TESTING-SETUP.md](./TESTING-SETUP.md) document.

---

This library is under active development. More features and components will be added soon!
