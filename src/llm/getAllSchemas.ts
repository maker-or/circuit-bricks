/**
 * Simple tool to get all component schema information for LLM
 * 
 * This tool returns all the schema definitions from componentSchema.ts
 */

import {
  portTypeSchema,
  pointSchema,
  sizeSchema,
  portSchema,
  propertySchema,
  componentSchema,
  componentInstanceSchema,
  wireSchema,
  circuitStateSchema,
  validationIssueSchema
} from '../schemas/componentSchema';

/**
 * Get all component schema information
 * 
 * Returns all the Zod schemas and their structure from componentSchema.ts
 * 
 * @returns Object containing all schema definitions
 */
export function getAllComponentSchemas() {
  return {
    portTypeSchema,
    pointSchema,
    sizeSchema,
    portSchema,
    propertySchema,
    componentSchema,
    componentInstanceSchema,
    wireSchema,
    circuitStateSchema,
    validationIssueSchema,
    
    // Schema descriptions for LLM understanding
    descriptions: {
      portTypeSchema: "Enum of all available port types: input, output, inout, positive, negative, anode, cathode, collector, base, emitter, drain, gate, source, vcc, vdd, vss, gnd, clock, reset, enable",
      pointSchema: "2D point with x and y coordinates (numbers)",
      sizeSchema: "Size dimensions with width and height (numbers)",
      portSchema: "Component port with id (string), x (number), y (number), type (portType), optional label (string)",
      propertySchema: "Component property with key (string), label (string), type (number|boolean|select|text|color), optional unit (string), optional options array, default value, optional min/max (numbers)",
      componentSchema: "Complete component definition with id (string), name (string), category (string), description (string), defaultWidth (number), defaultHeight (number), ports array, properties array, svgPath (string)",
      componentInstanceSchema: "Component instance with id (string), type (string), position (point), optional size, props (record), optional rotation (number)",
      wireSchema: "Wire connection with id (string), from (componentId, portId), to (componentId, portId), optional style (color, strokeWidth, dashArray)",
      circuitStateSchema: "Complete circuit with components array, wires array, selectedComponentIds array, selectedWireIds array",
      validationIssueSchema: "Validation issue with type (error|warning), message (string), optional componentId, optional wireId"
    }
  };
}
