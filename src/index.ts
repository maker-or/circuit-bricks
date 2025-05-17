/**
 * Circuit-Bricks - A modular, Lego-style SVG circuit component system for React
 * 
 * @package circuit-bricks
 * @version 0.1.0
 * @license MIT
 * @author Sphere Labs
 */

// Export types
export * from './types';

// Core components
export { default as CircuitCanvas } from './core/CircuitCanvas';
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

// Examples
export { default as SimpleCircuitExample } from './examples/SimpleCircuitExample';
export { default as InteractiveCircuitExample } from './examples/InteractiveCircuitExample';
export { default as VoltageRegulatorExample } from './examples/VoltageRegulatorExample';
export { default as TimerCircuitExample } from './examples/TimerCircuitExample';

// Utilities
export { validateCircuit } from './utils/circuitValidation';
export { getPortPosition } from './utils/getPortPosition';

// Registry utilities
export {
  registerComponent,
  getComponentSchema,
  getAllComponents,
  getComponentsByCategory
} from './registry';

/**
 * Current package version
 * @public
 */
export const version = '0.1.0';