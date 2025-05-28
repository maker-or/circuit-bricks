/**
 * Registry Metadata System for LLM Integration
 *
 * This module provides metadata about the component registry that helps
 * LLMs (Large Language Models) understand the available components,
 * their categories, and their capabilities.
 */

import { ComponentSchema } from '../schemas/componentSchema';
import { getAllComponents, getComponentsByCategory } from './index';

/**
 * Registry metadata interface
 */
export interface RegistryMetadata {
  /**
   * Total number of components in the registry
   */
  totalComponents: number;

  /**
   * List of all available component categories
   */
  categories: string[];

  /**
   * Map of category to component count
   */
  componentCountByCategory: Record<string, number>;

  /**
   * List of all component IDs
   */
  componentIds: string[];

  /**
   * Map of component ID to component name
   */
  componentNames: Record<string, string>;

  /**
   * Map of component ID to component description
   */
  componentDescriptions: Record<string, string>;

  /**
   * Last updated timestamp
   */
  lastUpdated: string;
}

/**
 * Generate metadata about the component registry
 *
 * This function analyzes the current state of the component registry
 * and generates metadata that can be used by LLMs to understand
 * what components are available.
 *
 * @returns Registry metadata object
 */
export function generateRegistryMetadata(): RegistryMetadata {
  const allComponents = getAllComponents();
  const categories = [...new Set(allComponents.map(c => c.category))];

  const componentCountByCategory: Record<string, number> = {};
  categories.forEach(category => {
    componentCountByCategory[category] = getComponentsByCategory(category).length;
  });

  const componentIds = allComponents.map(c => c.id);

  const componentNames: Record<string, string> = {};
  const componentDescriptions: Record<string, string> = {};

  allComponents.forEach(component => {
    componentNames[component.id] = component.name;
    componentDescriptions[component.id] = component.description;
  });

  return {
    totalComponents: allComponents.length,
    categories,
    componentCountByCategory,
    componentIds,
    componentNames,
    componentDescriptions,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get a summary of a component for LLM consumption
 *
 * @param componentId The ID of the component to summarize
 * @returns A string summary of the component
 */
export function getComponentSummary(component: ComponentSchema): string {
  const portSummary = component.ports.map(port =>
    `- ${port.id} (${port.type}${port.label ? `: ${port.label}` : ''})`
  ).join('\n');

  const propertySummary = component.properties.map(prop => {
    let summary = `- ${prop.key} (${prop.type}): ${prop.label}`;
    if (prop.unit) summary += `, unit: ${prop.unit}`;
    if (prop.default !== undefined) summary += `, default: ${prop.default}`;
    if (prop.min !== undefined) summary += `, min: ${prop.min}`;
    if (prop.max !== undefined) summary += `, max: ${prop.max}`;
    if (prop.options) {
      summary += `, options: [${prop.options.map(o => `${o.value} (${o.label})`).join(', ')}]`;
    }
    return summary;
  }).join('\n');

  return `
Component: ${component.name} (${component.id})
Category: ${component.category}
Description: ${component.description}
Dimensions: ${component.defaultWidth}×${component.defaultHeight}

Ports:
${portSummary}

Properties:
${propertySummary}
  `.trim();
}

/**
 * Generate a complete registry summary for LLM consumption
 *
 * @returns A string summary of the entire registry
 */
export function generateRegistrySummary(): string {
  const metadata = generateRegistryMetadata();
  const allComponents = getAllComponents();

  const categorySummaries = metadata.categories.map(category => {
    const components = getComponentsByCategory(category);
    const componentList = components.map(c => `- ${c.name} (${c.id}): ${c.description}`).join('\n');

    return `
## ${category.charAt(0).toUpperCase() + category.slice(1)} Components (${components.length})
${componentList}
    `.trim();
  }).join('\n\n');

  return `
# Circuit-Bricks Component Registry

Total components: ${metadata.totalComponents}
Last updated: ${metadata.lastUpdated}

${categorySummaries}
  `.trim();
}
