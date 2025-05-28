/**
 * Registry Metadata API for LLM Integration
 *
 * This module provides metadata about the component registry for LLM consumption.
 */

import { getAllServerComponents } from '../registry/server';
import { RegistryMetadata } from './types';

/**
 * Get comprehensive metadata about the component registry
 *
 * @returns Registry metadata including counts, categories, and organization
 */
export function getRegistryMetadata(): RegistryMetadata {
  const allComponents = getAllServerComponents();
  const categorySet = new Set(allComponents.map(schema => schema.category));
  const categories = Array.from(categorySet).sort();

  const componentsByCategory: Record<string, number> = {};
  for (const category of categories) {
    componentsByCategory[category] = allComponents.filter(schema => schema.category === category).length;
  }

  return {
    totalComponents: allComponents.length,
    categories,
    componentsByCategory,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Generate a human-readable summary of the component registry
 *
 * @returns A comprehensive text summary of the registry
 */
export function getRegistrySummary(): string {
  const metadata = getRegistryMetadata();
  const allComponents = getAllServerComponents();

  let summary = `# Circuit-Bricks Component Registry Summary

## Overview
The Circuit-Bricks component registry contains ${metadata.totalComponents} components organized into ${metadata.categories.length} categories.

## Categories and Components:
`;

  for (const category of metadata.categories) {
    const categoryComponents = allComponents.filter(schema => schema.category === category);
    summary += `\n### ${category.charAt(0).toUpperCase() + category.slice(1)} (${categoryComponents.length} components)
`;
    for (const component of categoryComponents) {
      summary += `- **${component.name}** (${component.id}): ${component.description}
`;
    }
  }

  summary += `
## Component Capabilities
Total ports across all components: ${allComponents.reduce((total, comp) => total + comp.ports.length, 0)}
Total configurable properties: ${allComponents.reduce((total, comp) => total + comp.properties.length, 0)}

## Popular Components
Based on common circuit patterns, the most frequently used components are:
- Resistor: Essential for current limiting and voltage division
- Battery/Voltage Source: Power supply components
- Ground: Reference point for circuits
- LED: Visual output indicator
- Switch: User input control

Last updated: ${metadata.lastUpdated}
`;

  return summary;
}

/**
 * Get a detailed summary for a specific component
 *
 * @param componentId - The ID of the component to summarize
 * @returns Detailed component summary or null if not found
 */
export function getComponentDetailedSummary(componentId: string): string | null {
  const allComponents = getAllServerComponents();
  const component = allComponents.find(schema => schema.id === componentId);

  if (!component) {
    return null;
  }

  let summary = `# ${component.name} (${component.id})

## Description
${component.description}

## Category
${component.category.charAt(0).toUpperCase() + component.category.slice(1)}

## Physical Properties
- Default Width: ${component.defaultWidth}px
- Default Height: ${component.defaultHeight}px

## Ports (${component.ports.length} total)
`;

  for (const port of component.ports) {
    summary += `- **${port.id}** (${port.type}): Located at (${port.x}, ${port.y})${port.label ? ` - ${port.label}` : ''}
`;
  }

  if (component.properties.length > 0) {
    summary += `
## Configurable Properties (${component.properties.length} total)
`;
    for (const prop of component.properties) {
      let propLine = `- **${prop.label}** (${prop.key}): ${prop.type}`;
      if (prop.default !== undefined) {
        propLine += `, default: ${prop.default}`;
      }
      if (prop.unit) {
        propLine += ` ${prop.unit}`;
      }
      if (prop.min !== undefined || prop.max !== undefined) {
        propLine += ` (range: ${prop.min ?? 'unlimited'} to ${prop.max ?? 'unlimited'})`;
      }
      summary += propLine + '\n';
    }
  } else {
    summary += `
## Configurable Properties
This component has no configurable properties.
`;
  }

  summary += `
## Usage Notes
This component can be connected to other components through its ${component.ports.length} port${component.ports.length !== 1 ? 's' : ''}. `;

  if (component.ports.some(p => p.type === 'input')) {
    summary += 'It has input ports that can receive signals from other components. ';
  }
  if (component.ports.some(p => p.type === 'output')) {
    summary += 'It has output ports that can send signals to other components. ';
  }
  if (component.ports.some(p => p.type === 'inout')) {
    summary += 'It has bidirectional ports that can both send and receive signals. ';
  }

  return summary;
}
