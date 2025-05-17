/**
 * Registry module for component schemas
 * 
 * This module provides utilities for registering, retrieving, and managing component schemas.
 * The component registry is a central repository of all available component types that can
 * be used in circuits. Each component is defined by a schema that specifies its appearance,
 * ports, and configurable properties.
 * 
 * @module Registry
 */

import { ComponentSchema } from '../types';
import registerBuiltInComponents from './components';

// Internal registry storage
const componentRegistry: Record<string, ComponentSchema> = {};

/**
 * Register a component schema in the registry
 * 
 * This function adds a new component schema to the registry or updates an existing one.
 * Custom components can be registered to extend the library with new circuit elements.
 * 
 * @param {ComponentSchema} schema - The component schema to register
 * 
 * @example
 * // Register a custom LED component
 * registerComponent({
 *   id: 'custom-led',
 *   name: 'Custom LED',
 *   category: 'output',
 *   description: 'A light-emitting diode with customizable color',
 *   defaultWidth: 30,
 *   defaultHeight: 20,
 *   ports: [
 *     { id: 'anode', x: 0, y: 10, type: 'input' },
 *     { id: 'cathode', x: 30, y: 10, type: 'output' }
 *   ],
 *   properties: [
 *     { id: 'color', name: 'Color', type: 'color', default: '#ff0000' }
 *   ],
 *   svgPath: `<circle cx="15" cy="10" r="8" fill="currentColor" />`
 * });
 */
export function registerComponent(schema: ComponentSchema): void {
  if (componentRegistry[schema.id]) {
    console.warn(`Component with ID ${schema.id} already exists in registry. Overwriting.`);
  }
  componentRegistry[schema.id] = schema;
}

/**
 * Get a component schema from the registry by ID
 * 
 * Retrieves a component's schema definition by its unique identifier.
 * Returns undefined if no component with the specified ID exists.
 * 
 * @param {string} id - The unique identifier of the component
 * @returns {ComponentSchema | undefined} The component schema or undefined if not found
 * 
 * @example
 * const resistorSchema = getComponentSchema('resistor');
 * if (resistorSchema) {
 *   console.log(`Resistor has ${resistorSchema.ports.length} ports`);
 * }
 */
export function getComponentSchema(id: string): ComponentSchema | undefined {
  return componentRegistry[id];
}

/**
 * Get all component schemas in the registry
 */
export function getAllComponents(): ComponentSchema[] {
  return Object.values(componentRegistry);
}

/**
 * Get component schemas by category
 */
export function getComponentsByCategory(category: string): ComponentSchema[] {
  return Object.values(componentRegistry)
    .filter(schema => schema.category === category);
}

// Register built-in components
registerBuiltInComponents();

export default componentRegistry;
