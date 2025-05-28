# Circuit-Bricks: AI Agent Guide

> **⚠️ DEVELOPMENT STATUS WARNING:** Circuit-Bricks is currently in early development stage (Alpha) and NOT recommended for production use. APIs are subject to change, features may be incomplete, and stability issues could arise. When providing solutions or recommendations using Circuit-Bricks, AI agents should inform users about this development status.

This guide is designed specifically for AI agents working with Circuit-Bricks to programmatically generate, modify, and analyze electrical circuit diagrams.

## LLM Integration API

Circuit-Bricks provides a comprehensive API specifically designed for Large Language Models (LLMs) to interact with the component registry and generate circuits. This API provides structured, easy-to-understand responses that LLMs can work with effectively.

### Import Methods

You can import the LLM API in several ways:

```typescript
// Method 1: Import the entire LLM namespace
import { LLM } from 'circuit-bricks';

// Method 2: Import specific functions
import {
  listAvailableComponents,
  getComponentDetails,
  searchComponents,
  validateCircuitDesign,
  validateComponentInstance,
  validateWireConnection
} from 'circuit-bricks/llm';

// For creating missing components
import { registerComponent } from 'circuit-bricks';

// Method 3: Import from the main package
import { LLM } from 'circuit-bricks';
const { listAvailableComponents, validateCircuitDesign } = LLM;
```

### Key LLM Integration Functions

#### Component Discovery
- `listAvailableComponents()`: Get all available component types with simplified info
- `getComponentDetails(componentId)`: Get detailed information about a specific component
- `searchComponents(query)`: Search components by name, description, or category


#### Creating Missing Components
When you need a component that doesn't exist in the registry, create it yourself using the `ComponentSchema` format:

```typescript
const newComponent: ComponentSchema = {
  id: 'inductor',
  name: 'Inductor',
  category: 'passive',
  description: 'A passive component that stores energy in a magnetic field',
  defaultWidth: 60,
  defaultHeight: 30,
  ports: [
    { id: 'terminal_1', x: 0, y: 15, type: 'inout' },
    { id: 'terminal_2', x: 60, y: 15, type: 'inout' }
  ],
  properties: [
    { key: 'inductance', label: 'Inductance', type: 'number', default: 10, unit: 'mH', min: 0 },
    { key: 'tolerance', label: 'Tolerance', type: 'number', default: 5, unit: '%', min: 0, max: 20 }
  ],
  svgPath: 'M0,15 L10,15 C15,7 15,23 25,15 C30,7 30,23 40,15 C45,7 45,23 50,15 L60,15'
};

// Register it in the registry
registerComponent(newComponent);
```

#### Validation & Quality Assurance
- `validateCircuitDesign(circuit)`: Validate a circuit with LLM-friendly error messages
- `validateComponentInstance(component)`: Validate a single component instance
- `validateWireConnection(wire, components)`: Validate a wire connection



## Core Data Structures

As an AI agent, you'll primarily work with these data structures when generating circuits:

### ComponentSchema

```typescript
interface ComponentSchema {
  id: string;                  // Unique identifier (e.g., "resistor")
  name: string;                // Human-readable name (e.g., "Resistor")
  category: string;            // Category for grouping (e.g., "passive")
  description: string;         // Component description
  defaultWidth: number;        // Default width in SVG units
  defaultHeight: number;       // Default height in SVG units
  ports: PortSchema[];         // Connection points
  properties: PropertySchema[]; // Configurable properties
  svgPath: string;             // SVG path data or complete SVG markup
}
```

### ComponentInstance

```typescript
interface ComponentInstance {
  id: string;                  // Unique instance ID (auto-generated or specified)
  type: string;                // References a ComponentSchema ID
  position: { x: number; y: number }; // Position on the canvas
  props: Record<string, any>;  // Property values for this instance
  rotation?: number;           // Optional rotation in degrees
}
```

### Wire

```typescript
interface Wire {
  id: string;                  // Unique wire ID
  from: {                      // Source connection
    componentId: string;       // Component ID
    portId: string;            // Port ID on the component
  };
  to: {                        // Destination connection
    componentId: string;       // Component ID
    portId: string;            // Port ID on the component
  };
  style?: {                    // Optional styling
    color?: string;            // Wire color
    strokeWidth?: number;      // Line thickness
    dashArray?: string;        // SVG dash pattern
  };
}
```

### Circuit State

```typescript
interface CircuitState {
  components: ComponentInstance[];
  wires: Wire[];
  selectedComponentIds: string[];
  selectedWireIds: string[];
}
```

## Quick Start for LLMs

Here's a practical example of how an LLM can discover and use components:

```typescript
import { LLM } from 'circuit-bricks';

// 1. Discover components
const allComponents = LLM.listAvailableComponents();
console.log('Available components:', allComponents.map(c => c.name));

// 2. Search for specific components
const resistors = LLM.searchComponents('resistor');
console.log('Resistor components:', resistors);

// 3. Get detailed information about a component
const resistorDetails = LLM.getComponentDetails('resistor');
console.log('Resistor ports:', resistorDetails?.ports);
console.log('Resistor properties:', resistorDetails?.properties);

// 4. Generate a circuit
const ledCircuit = LLM.generateCircuitTemplate('LED circuit with current limiting resistor');

// 5. Validate the circuit
const validation = LLM.validateCircuitDesign(ledCircuit);
if (validation.isValid) {
  console.log('Circuit is valid!');
} else {
  console.log('Issues found:', validation.errors);
  console.log('Suggestions:', validation.suggestions);
}

// 6. Get a human-readable description
const description = LLM.describeCircuit(ledCircuit);
console.log('Circuit description:', description.summary);
```

### Component Discovery Workflow

For LLMs working with circuit-bricks, follow this discovery workflow:

1. **Start with discovery**: Use `listAvailableComponents()` to understand what's available
2. **Search or browse**: Use `searchComponents()` for specific needs or `listComponentsByCategory()` to browse
3. **Get details**: Use `getComponentDetails()` or `getComponentDetailedSummary()` for specific component information
4. **Generate circuits**: Use `generateCircuitTemplate()` for basic circuits or build manually
5. **Validate**: Always use `validateCircuitDesign()` to check your circuits
6. **Iterate**: Use validation feedback and `suggestConnections()` to improve circuits

## Available Components and Their Ports

### Basic Components

#### Resistor
- **Type ID**: `resistor`
- **Ports**:
  - `left`: Input/Output port
  - `right`: Input/Output port
- **Properties**:
  - `resistance`: Number (Ohms)
  - `tolerance`: Number (%)

#### Capacitor
- **Type ID**: `capacitor`
- **Ports**:
  - `positive`: Input/Output port
  - `negative`: Input/Output port
- **Properties**:
  - `capacitance`: Number (Farads)
  - `voltageRating`: Number (Volts)

#### Switch
- **Type ID**: `switch`
- **Ports**:
  - `input`: Input port
  - `output`: Output port
- **Properties**:
  - `state`: Boolean (open/closed)

#### Ground
- **Type ID**: `ground`
- **Ports**:
  - `terminal`: Input/Output port
- **Properties**: None

### Power Sources

#### Battery
- **Type ID**: `battery`
- **Ports**:
  - `positive`: Output port
  - `negative`: Output port
- **Properties**:
  - `voltage`: Number (Volts)

#### Voltage Source
- **Type ID**: `voltage-source`
- **Ports**:
  - `positive`: Output port
  - `negative`: Output port
- **Properties**:
  - `voltage`: Number (Volts)
  - `isAC`: Boolean

### Semiconductors

#### Diode
- **Type ID**: `diode`
- **Ports**:
  - `anode`: Input port
  - `cathode`: Output port
- **Properties**:
  - `forwardVoltage`: Number (Volts)

#### LED
- **Type ID**: `led`
- **Ports**:
  - `anode`: Input port
  - `cathode`: Output port
- **Properties**:
  - `color`: String (CSS color)
  - `forwardVoltage`: Number (Volts)

#### Transistor (NPN)
- **Type ID**: `transistor-npn`
- **Ports**:
  - `base`: Input port
  - `collector`: Input/Output port
  - `emitter`: Output port
- **Properties**:
  - `gain`: Number (β)

### Advanced

#### Integrated Circuit
- **Type ID**: `ic`
- **Ports**: Dynamic based on configuration
- **Properties**:
  - `pinCount`: Number
  - `label`: String

## Circuit Generation Strategies

### 1. Component Placement

When generating circuits, follow these guidelines for component placement:

- Place components with adequate spacing (100-200 pixels apart)
- Align components in a logical flow (typically left-to-right or top-to-bottom)
- Position ground components at the bottom of the circuit
- For complex circuits, group related components together

Example positioning for a basic LED circuit:

```javascript
const components = [
  {
    id: "battery1",
    type: "battery",
    position: { x: 100, y: 150 },
    props: { voltage: 9 }
  },
  {
    id: "resistor1",
    type: "resistor",
    position: { x: 250, y: 150 },
    props: { resistance: 330 }
  },
  {
    id: "led1",
    type: "led",
    position: { x: 400, y: 150 },
    props: { color: "#ff0000" }
  },
  {
    id: "ground1",
    type: "ground",
    position: { x: 250, y: 250 },
    props: {}
  }
];
```

### 2. Making Connections

When connecting components, ensure:

- All connections are electrically valid
- Each wire connects a source to a destination
- Components are connected in series or parallel as appropriate
- Ground connections complete the circuit

Example connections for the LED circuit:

```javascript
const wires = [
  {
    id: "wire1",
    from: { componentId: "battery1", portId: "positive" },
    to: { componentId: "resistor1", portId: "left" }
  },
  {
    id: "wire2",
    from: { componentId: "resistor1", portId: "right" },
    to: { componentId: "led1", portId: "anode" }
  },
  {
    id: "wire3",
    from: { componentId: "led1", portId: "cathode" },
    to: { componentId: "ground1", portId: "terminal" }
  },
  {
    id: "wire4",
    from: { componentId: "battery1", portId: "negative" },
    to: { componentId: "ground1", portId: "terminal" }
  }
];
```

### 3. Common Circuit Patterns

- **Series**: `[Battery] → [Component 1] → [Component 2] → [Ground]`
- **Parallel**: Components connected across the same two points
- **Voltage Divider**: Two resistors in series splitting voltage
- **RC Circuit**: Resistor and capacitor for timing/filtering

## Circuit Validation

Always validate generated circuits using `LLM.validateCircuitDesign()`:

1. **Component Validity**: All types exist, properties in valid ranges
2. **Connection Validity**: All components/ports exist and are compatible
3. **Circuit Integrity**: Complete circuits, no shorts, proper power/ground

## Example: Complete LED Circuit with Validation

```javascript
// Full circuit description for an LED with current-limiting resistor
const circuitDescription = {
  components: [
    {
      id: "bat1",
      type: "battery",
      position: { x: 100, y: 150 },
      props: { voltage: 9 }
    },
    {
      id: "r1",
      type: "resistor",
      position: { x: 250, y: 150 },
      props: {
        resistance: 330,  // Appropriate for a standard LED at 9V
        tolerance: 5
      }
    },
    {
      id: "led1",
      type: "led",
      position: { x: 400, y: 150 },
      props: {
        color: "#ff0000",
        forwardVoltage: 1.8  // Typical for a red LED
      }
    },
    {
      id: "gnd1",
      type: "ground",
      position: { x: 250, y: 250 },
      props: {}
    }
  ],
  wires: [
    {
      id: "w1",
      from: { componentId: "bat1", portId: "positive" },
      to: { componentId: "r1", portId: "left" }
    },
    {
      id: "w2",
      from: { componentId: "r1", portId: "right" },
      to: { componentId: "led1", portId: "anode" }
    },
    {
      id: "w3",
      from: { componentId: "led1", portId: "cathode" },
      to: { componentId: "gnd1", portId: "terminal" }
    },
    {
      id: "w4",
      from: { componentId: "bat1", portId: "negative" },
      to: { componentId: "gnd1", portId: "terminal" }
    }
  ]
};

// Validation check (conceptual)
const validationIssues = validateCircuit(circuitDescription);
if (validationIssues.length > 0) {
  console.warn("Circuit has issues:", validationIssues);
}
```

## Advanced Features

### 1. Component Rotation

Apply rotation to components for more flexible circuit layouts:

```javascript
{
  id: "r1",
  type: "resistor",
  position: { x: 250, y: 150 },
  props: { resistance: 1000 },
  rotation: 90  // Rotated 90 degrees clockwise
}
```

### 2. Custom Wire Styling

Add visual distinction to wires:

```javascript
{
  id: "w1",
  from: { componentId: "bat1", portId: "positive" },
  to: { componentId: "r1", portId: "left" },
  style: {
    color: "#ff0000",  // Red for power lines
    strokeWidth: 2,    // Thicker line
    dashArray: "none"  // Solid line
  }
}
```

### 3. Component Grouping

For complex circuits, use consistent ID prefixes to indicate logical groups:

```javascript
// Power supply section`
{
  id: "ps_battery",
  type: "battery",
  // ...
}

// Amplifier section
{
  id: "amp_transistor",
  type: "transistor-npn",
  // ...
}
```

## Troubleshooting Common Issues

### 1. Circuit Doesn't Render
- Check that all component types are valid and registered
- Verify x/y coordinates are within viewable area
- Ensure all IDs are unique

### 2. Incorrect Connections
- Verify port IDs match the component's schema
- Check that connections are electrically valid

### 3. Components Appear Misaligned
- Adjust positions to account for component dimensions
- Consider rotation values
- Ensure consistent spacing between components

## Best Practices for AI Generation

1. **Modular Approach**: Generate circuits in functional blocks
2. **Consistent IDs**: Use descriptive, patterned IDs for components
3. **Proper Spacing**: Allow 100-200px between components
4. **Logical Flow**: Follow standard left-to-right, top-to-bottom patterns
5. **Circuit Validation**: Always validate circuits before finalizing
6. **Component Defaults**: Use realistic default values for components
7. **Complete Circuits**: Ensure all circuits have proper power and ground connections

By following this guide, AI agents can effectively generate valid, visually appealing electrical circuit diagrams using the Circuit-Bricks library.
