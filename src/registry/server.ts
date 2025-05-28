/**
 * Server-side registry module for component schemas
 *
 * This module provides server-side compatible registry functions
 * without any client-side dependencies or "use client" directives.
 * It's specifically designed for use in server-side environments
 * like API routes and LLM integrations.
 */

// Define ComponentSchema interface inline to avoid dependencies
interface ServerComponentSchema {
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
}

// Define component schemas inline to avoid imports
const builtInComponents: ServerComponentSchema[] = [
  {
    "id": "resistor",
    "name": "Resistor",
    "category": "passive",
    "description": "A passive electrical component that limits current flow",
    "defaultWidth": 60,
    "defaultHeight": 20,
    "ports": [
      { "id": "left", "x": 0, "y": 10, "type": "inout" },
      { "id": "right", "x": 60, "y": 10, "type": "inout" }
    ],
    "properties": [
      {
        "key": "resistance",
        "label": "Resistance",
        "type": "number",
        "unit": "Ω",
        "default": 1000,
        "min": 0
      }
    ],
    "svgPath": "M10,10 h10 l5,-5 l10,10 l10,-10 l10,10 l5,-5 h10"
  },
  {
    "id": "capacitor",
    "name": "Capacitor",
    "category": "passive",
    "description": "A passive electrical component that stores electrical energy",
    "defaultWidth": 40,
    "defaultHeight": 30,
    "ports": [
      { "id": "left", "x": 0, "y": 15, "type": "inout" },
      { "id": "right", "x": 40, "y": 15, "type": "inout" }
    ],
    "properties": [
      {
        "key": "capacitance",
        "label": "Capacitance",
        "type": "number",
        "unit": "F",
        "default": 0.000001,
        "min": 0
      }
    ],
    "svgPath": "M15,5 v20 M25,5 v20 M0,15 h15 M25,15 h15"
  },
  {
    "id": "battery",
    "name": "Battery",
    "category": "sources",
    "description": "A source of electrical energy",
    "defaultWidth": 60,
    "defaultHeight": 40,
    "ports": [
      { "id": "positive", "x": 60, "y": 20, "type": "output" },
      { "id": "negative", "x": 0, "y": 20, "type": "output" }
    ],
    "properties": [
      {
        "key": "voltage",
        "label": "Voltage",
        "type": "number",
        "unit": "V",
        "default": 9,
        "min": 0
      }
    ],
    "svgPath": "M10,20 h10 M20,5 v30 M30,10 v20 M40,5 v30 M40,20 h10"
  },
  {
    "id": "ground",
    "name": "Ground",
    "category": "basic",
    "description": "Electrical ground reference point",
    "defaultWidth": 30,
    "defaultHeight": 25,
    "ports": [
      { "id": "terminal", "x": 15, "y": 0, "type": "input" }
    ],
    "properties": [],
    "svgPath": "M15,0 v10 M5,15 h20 M8,20 h14 M11,25 h8"
  },
  {
    "id": "led",
    "name": "LED",
    "category": "semiconductor",
    "description": "Light-emitting diode",
    "defaultWidth": 30,
    "defaultHeight": 20,
    "ports": [
      { "id": "anode", "x": 0, "y": 10, "type": "input" },
      { "id": "cathode", "x": 30, "y": 10, "type": "output" }
    ],
    "properties": [
      {
        "key": "color",
        "label": "Color",
        "type": "select",
        "default": "red",
        "options": [
          { "value": "red", "label": "Red" },
          { "value": "green", "label": "Green" },
          { "value": "blue", "label": "Blue" },
          { "value": "yellow", "label": "Yellow" }
        ]
      }
    ],
    "svgPath": "M0,10 h8 M8,5 l7,5 l-7,5 z M15,5 v10 M22,10 h8"
  }
];

// Server-side registry storage
const serverComponentRegistry: Record<string, ServerComponentSchema> = {};

/**
 * Initialize the server-side registry with built-in components
 */
function initializeServerRegistry(): void {
  // Only initialize once
  if (Object.keys(serverComponentRegistry).length > 0) {
    return;
  }

  // Register built-in components
  for (const schema of builtInComponents) {
    try {
      // Simple validation - just check if required fields exist
      if (schema && schema.id && schema.name && schema.category) {
        serverComponentRegistry[schema.id] = schema;
      } else {
        console.warn(`Invalid component schema ${schema.id}: missing required fields`);
      }
    } catch (error) {
      console.warn(`Failed to register component ${schema.id}:`, error);
    }
  }
}

/**
 * Register a component schema in the server-side registry
 */
export function registerServerComponent(schema: ServerComponentSchema): void {
  initializeServerRegistry();

  // Simple validation - just check if required fields exist
  if (!schema || !schema.id || !schema.name || !schema.category) {
    throw new Error(`Invalid component schema: missing required fields (id, name, category)`);
  }

  if (serverComponentRegistry[schema.id]) {
    console.warn(`Component with ID ${schema.id} already exists in server registry. Overwriting.`);
  }

  serverComponentRegistry[schema.id] = schema;
}

/**
 * Get a component schema from the server-side registry by ID
 */
export function getServerComponentSchema(id: string): ServerComponentSchema | undefined {
  initializeServerRegistry();
  return serverComponentRegistry[id];
}

/**
 * Get all component schemas in the server-side registry
 */
export function getAllServerComponents(): ServerComponentSchema[] {
  initializeServerRegistry();
  return Object.values(serverComponentRegistry);
}

/**
 * Get component schemas by category from the server-side registry
 */
export function getServerComponentsByCategory(category: string): ServerComponentSchema[] {
  initializeServerRegistry();
  return Object.values(serverComponentRegistry)
    .filter(schema => schema.category === category);
}

/**
 * Get all unique categories from the server-side registry
 */
export function getServerCategories(): string[] {
  initializeServerRegistry();
  const allComponents = getAllServerComponents();
  const categories = [...new Set(allComponents.map(schema => schema.category))];
  return categories.sort();
}

export default serverComponentRegistry;
