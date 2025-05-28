/**
 * Utility Functions for LLM Integration
 *
 * This module provides helper functions and information for LLMs working
 * with the Circuit-Bricks library.
 */

import { getAllComponents } from '../registry';
import { getRegistryMetadata } from './registryMetadata';
import { QuickStartInfo, APIHelp, APIStatus } from './types';

/**
 * Get quick start information for LLMs new to Circuit-Bricks
 *
 * @returns Quick start guide and essential information
 */
export function getQuickStart(): QuickStartInfo {
  const metadata = getRegistryMetadata();
  const allComponents = getAllComponents();
  
  // Find popular/essential components
  const essentialComponents = ['resistor', 'battery', 'ground', 'led', 'switch'];
  const popularComponents = allComponents
    .filter(comp => essentialComponents.includes(comp.id))
    .map(comp => ({
      id: comp.id,
      name: comp.name,
      description: comp.description,
      category: comp.category
    }));

  return {
    totalComponents: metadata.totalComponents,
    categories: metadata.categories,
    popularComponents,
    exampleUsage: `// Quick Start Example
import { LLM } from 'circuit-bricks';

// 1. Discover available components
const components = LLM.listAvailableComponents();
console.log(\`Found \${components.length} components\`);

// 2. Search for specific components
const resistors = LLM.searchComponents('resistor');

// 3. Generate a simple circuit
const circuit = LLM.generateCircuitTemplate('LED circuit with current limiting resistor');

// 4. Validate the circuit
const validation = LLM.validateCircuitDesign(circuit);
if (!validation.isValid) {
  console.log('Issues found:', validation.errors);
}

// 5. Get a description of the circuit
const description = LLM.describeCircuit(circuit);
console.log(description.summary);`
  };
}

/**
 * Get comprehensive API help for LLMs
 *
 * @returns Detailed API documentation and guidance
 */
export function getAPIHelp(): APIHelp {
  return {
    overview: `Circuit-Bricks LLM Integration API provides a comprehensive set of functions for discovering components, generating circuits, and validating designs. The API is designed to be intuitive for LLMs with clear, structured responses and helpful error messages.`,
    
    commonTasks: [
      {
        task: 'Discover available components',
        function: 'listAvailableComponents()',
        description: 'Get all components with their basic information',
        example: 'const components = LLM.listAvailableComponents();'
      },
      {
        task: 'Search for specific components',
        function: 'searchComponents(query)',
        description: 'Find components by name, description, or category',
        example: 'const results = LLM.searchComponents("resistor");'
      },
      {
        task: 'Get component details',
        function: 'getComponentDetails(id)',
        description: 'Get detailed information about a specific component',
        example: 'const details = LLM.getComponentDetails("resistor");'
      },
      {
        task: 'Generate a circuit',
        function: 'generateCircuitTemplate(description)',
        description: 'Create a circuit from natural language description',
        example: 'const circuit = LLM.generateCircuitTemplate("LED circuit");'
      },
      {
        task: 'Validate a circuit',
        function: 'validateCircuitDesign(circuit)',
        description: 'Check circuit for errors and get suggestions',
        example: 'const validation = LLM.validateCircuitDesign(myCircuit);'
      },
      {
        task: 'Describe a circuit',
        function: 'describeCircuit(circuit)',
        description: 'Get human-readable description of a circuit',
        example: 'const description = LLM.describeCircuit(myCircuit);'
      }
    ],
    
    bestPractices: [
      'Always validate circuits after generation or modification',
      'Use getComponentDetails() to understand component capabilities before using them',
      'Check validation.errors and validation.warnings for circuit issues',
      'Use searchComponents() to find alternatives if needed components don\'t exist',
      'Include ground references in circuits for proper voltage reference',
      'Use descriptive IDs for components to make circuits easier to understand',
      'Consider electrical compatibility when connecting components',
      'Start with simple circuits and gradually add complexity'
    ]
  };
}

/**
 * Get current API status and system information
 *
 * @returns Current status of the LLM API
 */
export function getAPIStatus(): APIStatus {
  const metadata = getRegistryMetadata();
  
  return {
    isReady: true,
    version: '0.1.2', // Should match package.json version
    componentsLoaded: metadata.totalComponents,
    categoriesAvailable: metadata.categories.length,
    lastUpdated: metadata.lastUpdated,
    capabilities: [
      'Component discovery and search',
      'Circuit generation from descriptions',
      'Circuit validation with detailed feedback',
      'Connection suggestions',
      'Registry metadata access',
      'Human-readable circuit descriptions'
    ],
    limitations: [
      'Circuit generation is pattern-based, not AI-powered',
      'Validation is structural, not electrical simulation',
      'Limited to registered component types',
      'Connection suggestions are heuristic-based'
    ]
  };
}
