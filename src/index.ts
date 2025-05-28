/**
 * Circuit-Bricks - A modular, Lego-style SVG circuit component system for React
 *
 * @package circuit-bricks
 * @version 0.1.0
 * @license MIT
 * @author Sphere Labs
 */

// Export types from ZOD schemas (single source of truth)
export {
  componentSchema,
  portSchema,
  propertySchema,
  wireSchema,
  circuitStateSchema,
  validationIssueSchema,
  // Export derived types
  type PortType,
  type Point,
  type Size,
  type PortSchema,
  type PropertySchema,
  type ComponentSchema,
  type ComponentInstance,
  type Wire,
  type CircuitState,
  type ValidationIssue
} from './schemas/componentSchema';

// Core components
export { default as CircuitCanvas } from './core/CircuitCanvas';
export { default as SSRSafeCircuitCanvas } from './core/SSRSafeCircuitCanvas';
export { default as Brick } from './core/Brick';
export { default as BaseComponent } from './core/BaseComponent';
export { default as Port } from './core/Port';
export { default as WirePath } from './core/WirePath';

// Hooks
export { default as useCircuit } from './hooks/useCircuit';
export { default as usePortPosition, useSinglePortPosition } from './hooks/usePortPosition';

// UI Components
export { default as PropertyPanel } from './ui/PropertyPanel';
export { default as ComponentPalette } from './ui/ComponentPalette';
export { default as CircuitToolbar } from './ui/CircuitToolbar';
export type { ToolbarAction } from './ui/CircuitToolbar';

// Headless UI Components
export { default as HeadlessPropertyPanel } from './ui/headless/HeadlessPropertyPanel';
export { default as HeadlessComponentPalette } from './ui/headless/HeadlessComponentPalette';
export { default as HeadlessCircuitToolbar } from './ui/headless/HeadlessCircuitToolbar';
export type { ToolbarAction as HeadlessToolbarAction } from './ui/headless/HeadlessCircuitToolbar';

// Examples
export { default as SimpleCircuitExample } from './examples/SimpleCircuitExample';
export { default as InteractiveCircuitExample } from './examples/InteractiveCircuitExample';
export { default as VoltageRegulatorExample } from './examples/VoltageRegulatorExample';
export { default as TimerCircuitExample } from './examples/TimerCircuitExample';

// Utilities
export { validateCircuit } from './utils/circuitValidation';
export { getPortPosition } from './utils/getPortPosition';
export {
  validateComponentSchema,
  validateComponentInstance,
  validateWire,
  validateCircuitState
} from './utils/zodValidation';

// SSR and Browser Compatibility Utilities
export * from './utils/ssrUtils';

// Performance Monitoring Utilities
export * from './utils/performanceUtils';

// Touch and Mobile Utilities
export * from './utils/touchUtils';

// Responsive Design Utilities
export * from './utils/responsiveUtils';

// Registry utilities
export {
  registerComponent,
  getComponentSchema,
  getAllComponents,
  getComponentsByCategory
} from './registry';

// Registry metadata utilities
export {
  generateRegistryMetadata,
  generateRegistrySummary,
  getComponentSummary
} from './registry/metadata';

// LLM Integration API
export * as LLM from './llm';

/**
 * Current package version
 * @public
 */
export const version = '0.1.0';