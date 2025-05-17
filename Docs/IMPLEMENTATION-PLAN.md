# Circuit-Bricks Implementation Plan

This document outlines the step-by-step plan for implementing the React + TypeScript "Circuit-Bricks" library that provides a Lego-style SVG circuit component system.

## 1. Project Setup (Day 1)

- [x] Initialize project with TypeScript and Rolldown
- [ ] Configure package.json with proper metadata and scripts
- [ ] Set up TypeScript configuration for ESM and CJS outputs
- [ ] Configure Rolldown for bundling
- [ ] Add necessary React dependencies

## 2. Core Type System (Day 1-2)

- [ ] Define basic interfaces in `types.ts`:
  - Component schemas and instances
  - Wire interfaces
  - Port schemas and properties
  - Circuit state types

## 3. Registry Implementation (Day 2-3)

- [ ] Create registry manager for component schemas
- [ ] Implement component registration system
- [ ] Build first few component schemas (resistor, capacitor, battery)
- [ ] Add utility functions for registry access

## 4. Core Components (Day 3-5)

- [ ] Create BaseComponent.tsx for SVG rendering
- [ ] Implement Port.tsx for connection points
- [ ] Build Brick.tsx as a schema-to-component mapper
- [ ] Develop WirePath.tsx for wire visualization
- [ ] Implement CircuitCanvas.tsx as the main container

## 5. Hooks and Utilities (Day 5-7)

- [ ] Create useCircuit.ts for state management
- [ ] Implement getPortPosition.ts utility
- [ ] Build circuit manipulation utilities
- [ ] Develop selection and highlighting hooks

## 6. UI Components (Optional, Day 7-9)

- [ ] Create property panel for component editing
- [ ] Implement component palette for selection
- [ ] Develop circuit toolbar for actions
- [ ] Add drag-and-drop capabilities

## 7. Testing and Documentation (Day 9-10)

- [ ] Write unit tests for core functionality
- [ ] Create example circuits
- [ ] Document API and usage patterns
- [ ] Update README with installation and quick start

## 8. Publishing (Day 10)

- [ ] Finalize build process
- [ ] Test in a sample application
- [ ] Publish to npm as `circuit-bricks`
- [ ] Create demo site (optional)

## Technical Considerations

### Core Focus Areas

1. **SVG Rendering Quality**
   - Use `vector-effect="non-scaling-stroke"` for consistent line rendering
   - Ensure proper scaling and transformations
   - Maintain crisp appearance at different zoom levels

2. **Component Architecture**
   - Keep rendering components pure
   - Separate state management from rendering
   - Ensure proper prop typing

3. **Wire Pathfinding**
   - Handle port position calculation efficiently
   - Support straight lines and bezier curves
   - Manage overlapping wires gracefully

4. **Error Handling**
   - Validate component schemas
   - Handle missing or invalid entries gracefully
   - Provide useful console warnings/errors

### Performance Considerations

- Use React.memo for rendering optimization
- Minimize DOM queries for port positions
- Consider using requestAnimationFrame for animations
- Implement virtualization for large circuits

### Extensibility Points

- Component registry should allow runtime additions
- Wire rendering should support custom path generators
- Styling should be customizable via themes/CSS vars
- Event system should allow for custom handlers

## Dependencies

- react/react-dom: Peer dependencies
- TypeScript: Type safety
- Rolldown: Modern bundling
- (Optional) Vitest: Testing framework

## Implementation Sequence

This implementation follows a "core-out" approach, starting with the basic rendering engine and schema definition, then building up to the full interactive system with UI components. Each phase builds on the previous one while maintaining a working system at each step.
