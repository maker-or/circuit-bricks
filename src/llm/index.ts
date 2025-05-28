/**
 * Circuit-Bricks LLM Integration API
 *
 * This module provides a comprehensive API for Large Language Models (LLMs)
 * to interact with the Circuit-Bricks component registry and generate circuits.
 *
 * The API is designed to be intuitive and provide clear, structured responses
 * that LLMs can easily understand and work with.
 */

// Export all types
export * from './types';

// Component Discovery API
export {
  listAvailableComponents,
  getComponentDetails,
  searchComponents,
  getAllCategories,
  listComponentsByCategory
} from './componentDiscovery';

// Registry Metadata API
export {
  getRegistryMetadata,
  getRegistrySummary,
  getComponentDetailedSummary
} from './registryMetadata';

// Circuit Generation API
export {
  generateCircuitTemplate,
  describeCircuit,
  suggestConnections
} from './circuitGeneration';

// Schema API
export {
  getAllComponentSchemas
} from './getAllSchemas';

// Utilities API
export {
  getQuickStart,
  getAPIHelp,
  getAPIStatus
} from './utilities';

// Validation API
export {
  validateCircuitDesign,
  validateComponentInstance,
  validateWireConnection
} from './validation';








