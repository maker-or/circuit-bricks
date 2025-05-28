/**
 * Types specific to LLM integration
 */

import { ComponentInstance, Wire, PortType } from '../schemas/componentSchema';

/**
 * Simplified component information for LLM consumption
 */
export interface ComponentInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  ports: Array<{
    id: string;
    type: PortType;
    label?: string;
  }>;
  properties: Array<{
    key: string;
    label: string;
    type: 'number' | 'boolean' | 'select' | 'text' | 'color';
    default: any;
    unit?: string;
    options?: Array<{ value: any; label: string }>;
  }>;
}

/**
 * Circuit validation result for LLMs
 */
export interface LLMValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Circuit description for LLMs
 */
export interface CircuitDescription {
  summary: string;
  components: Array<{
    id: string;
    type: string;
    name: string;
    position: { x: number; y: number };
    properties: Record<string, any>;
  }>;
  connections: Array<{
    from: { component: string; port: string };
    to: { component: string; port: string };
    description: string;
  }>;
  analysis: {
    totalComponents: number;
    totalConnections: number;
    categories: string[];
    powerSources: string[];
    hasGround: boolean;
  };
}

/**
 * Component search result
 */
export interface ComponentSearchResult {
  component: ComponentInfo;
  relevanceScore: number;
  matchedFields: string[];
}

/**
 * Registry metadata information
 */
export interface RegistryMetadata {
  totalComponents: number;
  categories: string[];
  componentsByCategory: Record<string, number>;
  lastUpdated: string;
}

/**
 * Circuit template (different from existing CircuitDescription)
 */
export interface CircuitTemplate {
  id: string;
  name: string;
  description: string;
  components: ComponentInstance[];
  wires: Wire[];
}

/**
 * Circuit description result (simplified for text-based LLM responses)
 */
export interface CircuitDescriptionSummary {
  summary: string;
  components: string[];
  connections: string[];
  analysis: string;
}

/**
 * Connection suggestion
 */
export interface ConnectionSuggestion {
  from: { componentId: string; portId: string };
  to: { componentId: string; portId: string };
  reason: string;
  confidence: number;
}

/**
 * Quick start information for LLMs
 */
export interface QuickStartInfo {
  totalComponents: number;
  categories: string[];
  popularComponents: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
  }>;
  exampleUsage: string;
}

/**
 * API help information
 */
export interface APIHelp {
  overview: string;
  commonTasks: Array<{
    task: string;
    function: string;
    description: string;
    example: string;
  }>;
  bestPractices: string[];
}

/**
 * API status information
 */
export interface APIStatus {
  isReady: boolean;
  version: string;
  componentsLoaded: number;
  categoriesAvailable: number;
  lastUpdated: string;
  capabilities: string[];
  limitations: string[];
}
