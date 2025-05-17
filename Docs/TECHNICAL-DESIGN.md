# Circuit-Bricks Technical Design Document

## Introduction

This document outlines the technical design decisions, architecture, and implementation details of the Circuit-Bricks library. It serves as a reference for developers who want to understand the internals of the library, contribute to its development, or extend its functionality.

## Design Philosophy

Circuit-Bricks was designed with the following principles in mind:

1. **Modularity**: Each component of the system should be self-contained and reusable.
2. **Declarative API**: The API should be declarative and React-friendly.
3. **AI-First Architecture**: The data structures should be easy for AI agents to understand and manipulate.
4. **Extensibility**: The system should be easy to extend with new components and features.
5. **Performance**: The library should perform well even with large circuits.
6. **Type Safety**: TypeScript should be used throughout to ensure type safety and developer experience.

## System Architecture

The system architecture follows a layered approach:

```
┌───────────────────────────────────────────────────────┐
│                    User Interface                     │
│   (PropertyPanel, ComponentPalette, CircuitToolbar)   │
├───────────────────────────────────────────────────────┤
│                  State Management                     │
│              (useCircuit, usePortPosition)            │
├───────────────────────────────────────────────────────┤
│                    Rendering Core                     │
│  (CircuitCanvas, BaseComponent, Brick, Port, WirePath)│
├───────────────────────────────────────────────────────┤
│                   Component Registry                  │
│   (registerComponent, getComponentSchema, etc.)       │
├───────────────────────────────────────────────────────┤
│                    Type Definitions                   │
│  (ComponentSchema, ComponentInstance, Wire, etc.)     │
└───────────────────────────────────────────────────────┘
```

### Type System (types.ts)

The type system forms the foundation of the library, defining the core interfaces that describe circuit components and their relationships. Key types include:

- **`ComponentSchema`**: Defines the structure and behavior of a component type
- **`ComponentInstance`**: Represents an instance of a component in a circuit
- **`Wire`**: Represents a connection between two component ports
- **`PortSchema`**: Defines the structure of a component port
- **`PropertySchema`**: Defines a configurable property of a component
- **`CircuitState`**: Represents the complete state of a circuit

The type system was designed to be both comprehensive and intuitive, allowing for straightforward serialization to/from JSON. This enables AI agents to easily understand and manipulate circuit structures.

### Component Registry (registry/)

The registry system manages component schema definitions and provides methods for registration and retrieval. It's implemented as a singleton that maintains an in-memory map of component schemas.

Design decisions:
- Use of a simple key-value map for performance
- Lazy loading of built-in components
- Runtime registration to support dynamic extensions
- Category-based organization for UI grouping

### Rendering Core (core/)

The rendering core is responsible for visualizing circuit components and wires. It uses SVG for vector-based rendering that scales well and maintains visual fidelity at any zoom level.

#### BaseComponent

`BaseComponent` serves as the foundation for rendering circuit elements. It:
- Accepts a component schema and instance
- Renders SVG elements based on the schema's `svgPath`
- Positions and sizes the component based on instance properties
- Handles selection highlighting
- Renders ports at their specified positions

Design decisions:
- SVG transforms for positioning rather than absolute coordinates
- Support for both simple path data and complete SVG markup
- Use of `vector-effect="non-scaling-stroke"` for consistent stroke widths
- Data attributes for DOM querying

#### Port

The `Port` component renders connection points on components. It:
- Renders a circular SVG element
- Attaches data attributes for DOM querying
- Supports selection highlighting
- Handles click events

Design decisions:
- Simple circle representation for universal applicability
- Data attributes to enable DOM position querying
- Event handling separation from parent component

#### WirePath

`WirePath` renders connections between ports. It:
- Queries the DOM for port positions
- Calculates appropriate path data
- Renders an SVG path element
- Handles selection highlighting

Design decisions:
- DOM querying for accurate positions
- Support for both straight lines and Bezier curves
- Path generation based on port alignment
- Delayed calculation to ensure DOM is ready

#### CircuitCanvas

`CircuitCanvas` is the main container component that:
- Renders the SVG canvas with infinite panning and zooming capabilities
- Manages component and wire layers
- Handles global click events and viewport transformations
- Passes selection state to child components
- Provides visual navigation aids like minimap and grid

Design decisions:
- Viewport transformation system for infinite canvas
- Layer separation for proper rendering order
- Event delegation for click handling
- Optional grid pattern for visual guidance that adapts to zoom level
- Coordinate conversion between screen and SVG space accounting for transformations
- Separate component and wire rendering for optimization

### State Management (hooks/)

State management is provided through React hooks that offer a clean API for manipulating circuit state.

#### useCircuit

`useCircuit` is the primary hook for managing circuit state. It:
- Manages component and wire collections
- Tracks selection state
- Provides CRUD operations for components and wires
- Handles state transitions

Design decisions:
- Function-based API for Redux-like simplicity
- Immutable state updates for React optimization
- Automatic cleanup of disconnected wires
- Selection state tracking for UI highlighting

#### usePortPosition

`usePortPosition` tracks port positions for wire rendering. It:
- Caches port positions to minimize DOM queries
- Updates positions on dependency changes
- Handles error states gracefully

Design decisions:
- Timeout delay to ensure DOM rendering
- Error handling for missing elements
- Resize listener for viewport changes
- Optimized updates with dependencies

### UI Components (ui/)

UI components provide optional user interface elements for interacting with circuits.

#### PropertyPanel

`PropertyPanel` provides property editing capabilities. It:
- Dynamically renders form controls based on property schemas
- Handles validation and constraints
- Supports different property types
- Communicates changes to parent components

Design decisions:
- Dynamic form generation based on schema
- Immediate validation feedback
- Type-specific input controls
- Responsive layout

#### ComponentPalette

`ComponentPalette` offers a component selection interface. It:
- Groups components by category
- Provides search functionality
- Renders component previews
- Supports component selection

Design decisions:
- Category-based organization
- Search with name and description matching
- SVG preview generation
- Compact layout for space efficiency

#### CircuitToolbar

`CircuitToolbar` provides action buttons for circuit manipulation. It:
- Offers common operations like delete, copy, etc.
- Groups related actions
- Disables unavailable actions
- Communicates actions to parent components

Design decisions:
- Action-based API for flexibility
- Contextual button enablement
- Grouped layout for organization
- Simple icon-based interface

### Utilities (utils/)

Utility functions provide supporting capabilities for the library.

#### getPortPosition

`getPortPosition` retrieves the absolute position of a port in the SVG coordinate system. It:
- Queries the DOM for port elements
- Calculates bounding rectangles
- Transforms coordinates to the SVG coordinate system
- Handles error cases gracefully

Design decisions:
- Data attribute-based querying
- SVG coordinate transformation
- Error reporting for debugging
- null return for missing elements

#### circuitValidation

`circuitValidation` checks for common issues in circuit designs. It:
- Validates wire connections
- Checks for floating ports
- Detects short circuits
- Reports issues with context

Design decisions:
- Issue categorization (error/warning)
- Context-specific reporting (component/wire)
- Graph-based analysis for shorts
- Comprehensive validation rules

## Core Algorithms

### Port Position Calculation

Port positions are critical for wire rendering and are calculated as follows:

```javascript
function getPortPosition(componentId, portId) {
  // Find the port element in the DOM
  const portElement = document.querySelector(
    `[data-component-id="${componentId}"][data-port-id="${portId}"]`
  );
  
  if (!portElement) return null;
  
  // Get the client bounding rect
  const portRect = portElement.getBoundingClientRect();
  
  // Find the SVG root
  let svgRoot = portElement;
  while (svgRoot && !(svgRoot instanceof SVGSVGElement)) {
    svgRoot = svgRoot.parentElement;
  }
  
  if (!svgRoot) return null;
  
  // Get the SVG bounding rect
  const svgRect = svgRoot.getBoundingClientRect();
  
  // Create an SVG point
  const point = svgRoot.createSVGPoint();
  point.x = portRect.x + portRect.width/2 - svgRect.x;
  point.y = portRect.y + portRect.height/2 - svgRect.y;
  
  // Transform to SVG coordinates
  const transformedPoint = point.matrixTransform(
    svgRoot.getScreenCTM().inverse()
  );
  
  return {
    x: transformedPoint.x,
    y: transformedPoint.y
  };
}
```

Key considerations:
- DOM querying reliability
- SVG coordinate transformation accuracy
- Performance implications of frequent calls
- Error handling for missing elements

### Wire Path Generation

Wire paths are generated based on port positions and orientation:

```javascript
function generatePath(from, to) {
  // For horizontal wires
  if (Math.abs(from.y - to.y) < 20) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
  
  // For vertical wires
  const midX = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
}
```

Key considerations:
- Path readability and simplicity
- Natural look for different orientations
- Support for different connection angles
- Minimal control points for performance

### Circuit Validation

Circuit validation uses a multi-pass approach:

1. **Connection Validation**: Checks if wire endpoints connect to valid components and ports
2. **Float Detection**: Identifies inputs/outputs that should be connected but aren't
3. **Short Circuit Detection**: Identifies multiple output ports connected together

The short circuit detection uses a graph-based approach:
1. Build a connection graph where nodes are ports and edges are wires
2. Perform connected component analysis using BFS
3. Check each connected component for multiple output ports

Key considerations:
- Comprehensive validation criteria
- Performance with large circuits
- Helpful error messages
- Graph algorithm efficiency

## Implementation Challenges

### SVG Rendering Consistency

Challenge: Ensuring consistent rendering across browsers and zoom levels.

Solution:
- Use of `vector-effect="non-scaling-stroke"` for stroke widths
- Consistent coordinate spaces for positioning
- Browser-specific workarounds for known issues
- SVG viewBox configuration for proper scaling

### Port Position Accuracy

Challenge: Accurately determining port positions for wire connections.

Solution:
- DOM querying with data attributes
- SVG coordinate transformation
- Delayed calculation to ensure DOM rendering
- Caching positions for performance

### State Management Complexity

Challenge: Managing complex circuit state with interdependencies.

Solution:
- Centralized state management with useCircuit
- Immutable updates for predictable behavior
- Clean API for state manipulation
- Automatic cleanup of dependent entities

### Component Scaling and Rotation

Challenge: Properly scaling and rotating components while maintaining port positions.

Solution:
- SVG transforms for positioning and rotation
- Coordinate system transformations
- Port position calculation in transformed space
- Vector effects for consistent rendering

## Future Enhancements

### Performance Optimization

- Virtualization for large circuits
- Memoization of rendered components
- Selective updates for partial changes
- WebWorker-based validation for complex circuits

### Feature Enhancements

- Undo/redo system
- Grouping and sub-circuits
- Wire routing algorithms
- Simulation capabilities
- Copy/paste with keyboard shortcuts

### UI Improvements

- Drag-and-drop component addition
- Multi-selection capabilities
- Grid snapping
- Wire manipulation handles
- Zoom and pan controls

### API Enhancements

- Circuit export/import formats
- Theme customization
- Event system for external integrations
- Plugin architecture for extensions

## Conclusion

The Circuit-Bricks library implements a comprehensive system for creating interactive circuit diagrams using React and SVG. The modular architecture, type-safe API, and AI-friendly design provide a solid foundation for building circuit-based applications. The technical decisions outlined in this document aim to balance functionality, performance, and developer experience to create a versatile and powerful library.

---

## Appendix: Key Class/Component Responsibilities

| Component/Class | Primary Responsibility | Key Methods/Props |
|----------------|------------------------|-------------------|
| `CircuitCanvas` | Main container and rendering with infinite canvas | `components`, `wires`, `onComponentClick`, `initialZoom`, `minZoom`, `maxZoom` |
| `BaseComponent` | SVG rendering of components | `schema`, `component`, `onClick` |
| `Brick` | Schema lookup and error handling | `component`, `onClick`, `selected` |
| `Port` | Connection point rendering | `componentId`, `port`, `onClick` |
| `WirePath` | Wire connection rendering | `wire`, `components`, `onClick` |
| `useCircuit` | Circuit state management | `addComponent`, `updateComponent`, `removeComponent` |
| `usePortPosition` | Port position tracking | `from`, `to`, `error` |
| `Registry` | Component schema management | `registerComponent`, `getComponentSchema` |
| `PropertyPanel` | Property editing UI | `component`, `onPropertyChange` |
| `ComponentPalette` | Component selection UI | `onSelectComponent` |
| `CircuitToolbar` | Circuit operation UI | `onAction`, `hasSelection` |
