# Circuit-Bricks

A React + TypeScript library for creating SVG-based electrical circuit diagrams with a Lego-style component system.

> **⚠️ DEVELOPMENT STATUS:** This library is currently in early development stage and not recommended for production use. APIs may change, features might be incomplete, and there could be significant bugs. Use at your own risk.
## 🤖 Perfect for LLM Integration

Circuit-Bricks is designed from the ground up to work seamlessly with Large Language Models. Create intelligent circuit design applications where users can describe circuits in natural language and see them rendered instantly.

**Quick Start:** Jump to [Quick Start for LLM Integration](#quick-start-for-llm-integration) to get up and running in minutes.

**Key Benefits for LLM Integration:**
- 📋 **Schema-Driven**: Comprehensive component schemas for LLM context
- 🎨 **Instant Visualization**: Real-time circuit rendering with CircuitCanvas
- 🔧 **Validation Built-in**: Automatic circuit validation and error handling
- 🎯 **Educational Focus**: Perfect for learning applications and circuit explanation
- 🌙 **Dark Theme Ready**: Optimized for modern dark UI themes





## Features

- **Modular Component System**: Each electrical element is a self-contained SVG "brick"
- **Infinite Canvas**: Free-flowing design with pan and zoom capabilities for circuits of any size
- **Pure Rendering Core**: Focuses on rendering with optional editing UI components
- **AI-First Design**: Comprehensive LLM integration API for component discovery and circuit generation
- **TypeScript Support**: Fully typed API for better developer experience
- **SVG-Based Rendering**: Vector graphics for crisp rendering at any scale
- **Component Registry**: Extensible system for creating custom circuit elements
- **Customizable UI Components**: Optional UI elements for circuit editing
- **Headless UI Components**: Unstyled components for complete styling flexibility
- **Dual Package Format**: Supports both ESM and CommonJS
- **Runtime Validation**: ZOD schema validation for component schemas and circuit states

## Installation

```bash
# npm
npm install circuit-bricks

# yarn
yarn add circuit-bricks

# pnpm
pnpm add circuit-bricks
```

## Quick Start for LLM Integration

If you're here to integrate Circuit-Bricks with LLMs, here's the fastest way to get started:

### 1. Install Dependencies

```bash
npm install circuit-bricks ai @openrouter/ai-sdk-provider react-markdown
```

### 2. Create API Route

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { getAllComponentSchemas } from 'circuit-bricks/llm';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const schemas = getAllComponentSchemas();

  const result = await streamText({
    model: openrouter('mistralai/mistral-7b-instruct:free'),
    messages,
    system: `You are an electrical engineering expert. Use these schemas: ${JSON.stringify(schemas)}.
    Wrap circuit JSON in "circuit" tags.`,
  });

  return result.toDataStreamResponse();
}
```

### 3. Create Frontend Component

```tsx
// components/CircuitChat.tsx
import { useChat } from 'ai/react';
import { CircuitCanvas } from 'circuit-bricks';

export default function CircuitChat() {
  const [circuit, setCircuit] = useState(null);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      const match = message.content.match(/circuit\s*\n([\s\S]*?)\ncircuit/);
      if (match) setCircuit(JSON.parse(match[1]));
    }
  });

  return (
    <div className="flex h-screen">
      <div className="w-2/5 p-4">
        {/* Chat interface */}
        <form onSubmit={handleSubmit}>
          <input value={input} onChange={handleInputChange}
                 placeholder="Create an LED circuit..." />
        </form>
      </div>
      <div className="w-3/5">
        {circuit && (
          <CircuitCanvas
            components={circuit.components}
            wires={circuit.wires}
            width="100%" height="100%"
          />
        )}
      </div>
    </div>
  );
}
```

That's it! You now have a working LLM-powered circuit designer. See the [LLM Integration API](#llm-integration-api) section for more details.

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
- Runtime validation with ZOD schemas
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
import { registerComponent, validateComponentSchema } from 'circuit-bricks';

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

// Validate the component schema before registering
const validationResult = validateComponentSchema(customComponent);
if (validationResult.success) {
  registerComponent(customComponent);
} else {
  console.error('Invalid component schema:', validationResult.error);
}
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

### Headless UI Components

Circuit-Bricks provides headless (unstyled) versions of all UI components, allowing you to fully customize the appearance using your preferred styling method:

```tsx
import {
  HeadlessPropertyPanel,
  HeadlessComponentPalette,
  HeadlessCircuitToolbar
} from 'circuit-bricks';

// Use with custom styling
<HeadlessPropertyPanel
  component={selectedComponent}
  onPropertyChange={handlePropertyChange}
  className="custom-panel"
  classNames={{
    header: "custom-header",
    title: "custom-title"
  }}
  style={{ backgroundColor: '#ffffff' }}
  styles={{
    header: { padding: '16px' },
    title: { fontSize: '18px' }
  }}
/>
```

Headless components provide all the functionality without any styling, giving you complete control over the appearance while maintaining accessibility and behavior. See the [Headless Components](./Docs/HEADLESS-COMPONENTS.md) documentation for more details.

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
  validateCircuit,      // Validate circuit and return issues

  // Validation utilities
  validateComponentSchema, // Validate component schema with ZOD
  validateComponentInstance, // Validate component instance with ZOD
  validateWire,          // Validate wire with ZOD
  validateCircuitState   // Validate circuit state with ZOD
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

## LLM Integration API

Circuit-Bricks provides a comprehensive API specifically designed for Large Language Models (LLMs) to discover components and generate circuits programmatically. This section shows you how to integrate Circuit-Bricks with LLMs to create intelligent circuit design applications.

### Quick Start for LLMs

```typescript
import { getAllComponentSchemas } from 'circuit-bricks/llm';

// Get all component schemas for LLM context
const schemas = getAllComponentSchemas();

// Use schemas to provide context to your LLM
const prompt = `
Available component schemas: ${JSON.stringify(schemas)}
Create a circuit for: LED with current limiting resistor
`;
```

### Complete Integration Example

Here's a complete example showing how to integrate Circuit-Bricks with an LLM API and render the results:

#### 1. Backend API Route (Next.js)

```typescript
// pages/api/chat/route.ts or app/api/chat/route.ts
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import { getAllComponentSchemas } from 'circuit-bricks/llm';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const userQuestion = messages[messages.length - 1]?.content;

  // Get component schemas for LLM context
  const schemas = getAllComponentSchemas();

  const systemPrompt = `
You are an electrical engineering expert. Use these component schemas: ${JSON.stringify(schemas)}

Create circuit diagrams based on user questions. Return your response with:
1. Educational explanation of the circuit
2. Circuit schema wrapped in "circuit" tags

Example circuit format:
circuit
{
  "components": [
    {
      "id": "battery_1",
      "type": "battery",
      "position": { "x": 100, "y": 200 },
      "props": { "voltage": 9 }
    }
  ],
  "wires": [
    {
      "id": "wire_1",
      "from": { "componentId": "battery_1", "portId": "positive" },
      "to": { "componentId": "resistor_1", "portId": "left" }
    }
  ]
}
circuit
  `;

  const result = await streamText({
    model: openrouter('mistralai/mistral-7b-instruct:free'),
    messages,
    system: systemPrompt,
    temperature: 0.3,
  });

  return result.toDataStreamResponse();
}
```

#### 2. Frontend Integration

```tsx
// components/CircuitChat.tsx
import React, { useState } from 'react';
import { useChat } from 'ai/react';
import { CircuitCanvas } from 'circuit-bricks';
import ReactMarkdown from 'react-markdown';

const CircuitChat = () => {
  const [circuit, setCircuit] = useState(null);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      // Extract circuit from LLM response
      const circuitMatch = message.content.match(/circuit\s*\n([\s\S]*?)\ncircuit/);
      if (circuitMatch) {
        try {
          const circuitData = JSON.parse(circuitMatch[1]);
          setCircuit(circuitData);
        } catch (error) {
          console.error('Failed to parse circuit:', error);
        }
      }
    }
  });

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Chat Panel */}
      <div className="w-2/5 flex flex-col border-r border-gray-700">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`${
              message.role === 'user' ? 'text-blue-300' : 'text-gray-100'
            }`}>
              <div className="font-semibold mb-1">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <ReactMarkdown className="prose prose-invert">
                {message.content.replace(/circuit\s*\n[\s\S]*?\ncircuit/g, '[Circuit Generated]')}
              </ReactMarkdown>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about circuits... (e.g., 'Create an LED circuit')"
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
          />
        </form>
      </div>

      {/* Circuit Visualization Panel */}
      <div className="w-3/5 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Circuit Diagram</h2>
        </div>
        <div className="flex-1 bg-gray-800">
          {circuit ? (
            <CircuitCanvas
              components={circuit.components || []}
              wires={circuit.wires || []}
              width="100%"
              height="100%"
              showGrid={true}
              gridSize={20}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Ask a question to generate a circuit diagram
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircuitChat;
```

### Key LLM Integration Functions

**Schema Access:**
- `getAllComponentSchemas()` - Get all component schemas for LLM context

**Component Discovery:**
- `listAvailableComponents()` - Get all available components
- `searchComponents(query)` - Search components by name/description
- `getComponentDetails(id)` - Get detailed component information

**Validation:**
- `validateCircuitDesign(circuit)` - Validate circuits with clear error messages
- `validateComponentInstance(component)` - Validate individual components

### Best Practices for LLM Integration

1. **Provide Schema Context**: Always include component schemas in your LLM prompts
2. **Use Structured Output**: Request circuits in JSON format for easy parsing
3. **Handle Errors Gracefully**: Implement error boundaries for circuit rendering
4. **Validate Generated Circuits**: Use validation functions before rendering
5. **Educational Focus**: Combine circuit generation with educational explanations

### Environment Setup

```bash
# Install required dependencies
npm install ai @openrouter/ai-sdk-provider react-markdown

# Set up environment variables
OPENROUTER_API_KEY=your_api_key_here
```

For comprehensive LLM integration documentation, see the [AI Agent Guide](./Docs/AI-AGENT-GUIDE.md).

## CircuitCanvas for LLM-Generated Circuits

The `CircuitCanvas` component is perfect for rendering circuits generated by LLMs. Here are specific patterns and tips for LLM integration:

### Dynamic Circuit Rendering

```tsx
import React, { useState, useEffect } from 'react';
import { CircuitCanvas } from 'circuit-bricks';

const LLMCircuitRenderer = ({ circuitData, error }) => {
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  const [renderError, setRenderError] = useState(null);

  useEffect(() => {
    if (circuitData) {
      try {
        // Validate and set circuit data
        setComponents(circuitData.components || []);
        setWires(circuitData.wires || []);
        setRenderError(null);
      } catch (err) {
        setRenderError('Failed to parse circuit data');
        console.error('Circuit parsing error:', err);
      }
    }
  }, [circuitData]);

  if (error || renderError) {
    return (
      <div className="flex items-center justify-center h-full bg-red-900/20 border border-red-800">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️</div>
          <p className="text-red-300 font-medium">Circuit Error</p>
          <p className="text-red-400 text-sm mt-1">{error || renderError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-900">
      <CircuitCanvas
        components={components}
        wires={wires}
        width="100%"
        height="100%"
        showGrid={true}
        gridSize={20}
        onComponentClick={(id) => console.log('Component clicked:', id)}
        onWireClick={(id) => console.log('Wire clicked:', id)}
      />
    </div>
  );
};
```

### Split-Screen Layout (Recommended)

```tsx
const CircuitChatApp = () => {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Chat Panel - 40% */}
      <div className="w-2/5 border-r border-gray-700">
        <ChatInterface />
      </div>

      {/* Circuit Panel - 60% */}
      <div className="w-3/5">
        <CircuitCanvas
          components={generatedComponents}
          wires={generatedWires}
          width="100%"
          height="100%"
          showGrid={true}
        />
      </div>
    </div>
  );
};
```

### Loading States and Error Handling

```tsx
const CircuitVisualization = ({ isGenerating, circuit, error }) => {
  if (isGenerating) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-400">Generating circuit...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-900/20">
        <div className="text-center">
          <p className="text-red-300">Failed to generate circuit</p>
          <p className="text-red-400 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!circuit) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Ask a question to generate a circuit diagram
      </div>
    );
  }

  return (
    <CircuitCanvas
      components={circuit.components}
      wires={circuit.wires}
      width="100%"
      height="100%"
      showGrid={true}
    />
  );
};
```

### Circuit Validation Before Rendering

```tsx
import { validateCircuitDesign } from 'circuit-bricks/llm';

const ValidatedCircuitRenderer = ({ circuitData }) => {
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    if (circuitData) {
      const validation = validateCircuitDesign(circuitData);
      setValidationResult(validation);
    }
  }, [circuitData]);

  if (validationResult && !validationResult.isValid) {
    return (
      <div className="p-4 bg-yellow-900/20 border border-yellow-800">
        <h3 className="text-yellow-300 font-medium mb-2">Circuit Validation Issues</h3>
        <ul className="text-yellow-400 text-sm space-y-1">
          {validationResult.errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <CircuitCanvas
      components={circuitData.components}
      wires={circuitData.wires}
      width="100%"
      height="100%"
      showGrid={true}
    />
  );
};
```

### Styling Tips for Dark Themes

Circuit-Bricks works great with dark themes. The default wire color is white, which provides good contrast:

```css
/* Custom styling for dark theme integration */
.circuit-container {
  background-color: #0c0c0c; /* Dark background */
  border: 1px solid #374151; /* Gray border */
}

/* Grid styling for dark themes */
.circuit-canvas svg {
  background-color: transparent;
}
```

## Documentation

For comprehensive documentation, please check these files:

- [Technical Design](./TECHNICAL-DESIGN.md): Architecture and implementation details
- [Component Schemas](./COMPONENT-SCHEMAS.md): Component schema reference and examples
- [ZOD Schemas](./ZOD-SCHEMAS.md): ZOD schema validation reference and examples
- [Documentation](./DOCUMENTATION.md): Complete API reference and usage guide
- [Headless Components](./Docs/HEADLESS-COMPONENTS.md): Guide to using unstyled components

## Project Structure

```
src/
├─ index.ts                 # Main exports
├─ schemas/                 # ZOD schema definitions (single source of truth)
│  └─ componentSchema.ts    # ZOD schemas and derived TypeScript types
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
│  ├─ CircuitToolbar.tsx    # Actions toolbar
│  └─ headless/             # Headless (unstyled) components
│     ├─ HeadlessPropertyPanel.tsx
│     ├─ HeadlessComponentPalette.tsx
│     └─ HeadlessCircuitToolbar.tsx
└─ utils/                   # Utility functions
   ├─ getPortPosition.ts    # DOM position helpers
   ├─ circuitValidation.ts  # Circuit validation utilities
   └─ zodValidation.ts      # ZOD schema validation utilities
```

## Roadmap

- [x] Core circuit rendering components
- [x] Component palette and property editor UI
- [x] Wire drawing and connection management
- [x] Circuit validation and error checking
- [x] Example circuits and documentation
- [x] ZOD schema validation for components and circuits
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

Copyright (c) 2025 Harshith Paupuleti

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
SOFTWARE. CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
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
- ZOD schema validation tests

For more details, see the [TESTING-SETUP.md](./TESTING-SETUP.md) document.

---

This library is under active development. More features and components will be added soon!
