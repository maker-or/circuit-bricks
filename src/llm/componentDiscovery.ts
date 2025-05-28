/**
 * Component Discovery API for LLM Integration
 *
 * This module provides functions that allow LLMs to discover and understand
 * what components are available in the circuit-bricks registry.
 */

import {
  getAllServerComponents,
  getServerComponentSchema,
  getServerComponentsByCategory,
  getServerCategories
} from '../registry/server';
import {
  ComponentInfo,
  ComponentSearchResult
} from './types';

// Define a server-compatible schema type to avoid dependencies
type ServerComponentSchema = {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  ports: Array<{
    id: string;
    x: number;
    y: number;
    type: string;
    label?: string;
  }>;
  properties: Array<{
    key: string;
    label: string;
    type: string;
    unit?: string;
    default: any;
    min?: number;
    max?: number;
    options?: Array<{ value: any; label: string; }>;
  }>;
  svgPath: string;
};

/**
 * Convert a ServerComponentSchema to simplified ComponentInfo for LLM consumption
 */
function schemaToComponentInfo(schema: ServerComponentSchema): ComponentInfo {
  return {
    id: schema.id,
    name: schema.name,
    category: schema.category,
    description: schema.description,
    ports: schema.ports.map(port => ({
      id: port.id,
      type: port.type as any, // Cast to avoid strict type checking
      label: port.label
    })),
    properties: schema.properties.map(prop => ({
      key: prop.key,
      label: prop.label,
      type: prop.type as any, // Cast to avoid strict type checking
      default: prop.default,
      unit: prop.unit,
      options: prop.options?.map(option => ({
        value: option.value,
        label: option.label
      }))
    }))
  };
}

/**
 * List all available components in a format optimized for LLM consumption
 *
 * @returns Array of simplified component information
 */
export function listAvailableComponents(): ComponentInfo[] {
  const allComponents = getAllServerComponents();
  return allComponents.map(schemaToComponentInfo);
}



/**
 * Get detailed information about a specific component
 *
 * @param componentId - The ID of the component to get details for
 * @returns Detailed component information or null if not found
 */
export function getComponentDetails(componentId: string): ComponentInfo | null {
  const schema = getServerComponentSchema(componentId);
  if (!schema) {
    return null;
  }
  return schemaToComponentInfo(schema);
}



/**
 * Search components by name, description, or category
 *
 * @param query - Search query string
 * @returns Array of search results with relevance scores
 */
export function searchComponents(query: string): ComponentSearchResult[] {
  const allComponents = getAllServerComponents();
  const searchTerm = query.toLowerCase();

  const results: ComponentSearchResult[] = [];

  for (const schema of allComponents) {
    const matchedFields: string[] = [];
    let relevanceScore = 0;

    // Check name match (highest priority)
    if (schema.name.toLowerCase().includes(searchTerm)) {
      matchedFields.push('name');
      relevanceScore += 10;
    }

    // Check ID match
    if (schema.id.toLowerCase().includes(searchTerm)) {
      matchedFields.push('id');
      relevanceScore += 8;
    }

    // Check category match
    if (schema.category.toLowerCase().includes(searchTerm)) {
      matchedFields.push('category');
      relevanceScore += 5;
    }

    // Check description match
    if (schema.description.toLowerCase().includes(searchTerm)) {
      matchedFields.push('description');
      relevanceScore += 3;
    }

    // Check property names
    for (const prop of schema.properties) {
      if (prop.label.toLowerCase().includes(searchTerm) ||
          prop.key.toLowerCase().includes(searchTerm)) {
        matchedFields.push('properties');
        relevanceScore += 1;
        break;
      }
    }

    if (relevanceScore > 0) {
      results.push({
        component: schemaToComponentInfo(schema),
        relevanceScore,
        matchedFields
      });
    }
  }

  // Sort by relevance score (highest first)
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Get all unique categories available in the registry
 *
 * @returns Array of category names
 */
export function getAllCategories(): string[] {
  return getServerCategories();
}

/**
 * List components in a specific category
 *
 * @param category - The category to filter by
 * @returns Array of components in the specified category
 */
export function listComponentsByCategory(category: string): ComponentInfo[] {
  const componentsInCategory = getServerComponentsByCategory(category);
  return componentsInCategory.map(schemaToComponentInfo);
}
