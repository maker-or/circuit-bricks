/**
 * ZOD schemas for Circuit-Bricks component types
 * 
 * This module provides ZOD schemas for validating component schemas,
 * component instances, wires, and other core types used in the library.
 */

import { z } from 'zod';

/**
 * Schema for port type
 */
export const portTypeSchema = z.enum([

'input', 'output', 'inout', // General types
'positive', 'negative', 'anode', 'cathode',   // Electrical specific
  'collector', 'base', 'emitter', // transistor
  'drain', 'gate', 'source', // MOSFET
  'vcc', 'vdd', 'vss', 'gnd', // power
  'clock', 'reset', 'enable' // digital
]);

/**
 * Schema for a 2D point
 */
export const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

/**
 * Schema for size dimensions
 */
export const sizeSchema = z.object({
  width: z.number(),
  height: z.number(),
});

/**
 * Schema for a component port
 */
export const portSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  type: portTypeSchema,
  label: z.string().optional(),
});

/**
 * Schema for a component property
 */
export const propertySchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(['number', 'boolean', 'select', 'text', 'color']),
  unit: z.string().optional(),
  options: z.array(
    z.object({
      value: z.any(),
      label: z.string(),
    })
  ).optional(),
  default: z.any(),
  min: z.number().optional(),
  max: z.number().optional(),
});

/**
 * Schema for a component definition
 */
export const componentSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  defaultWidth: z.number(),
  defaultHeight: z.number(),
  ports: z.array(portSchema),
  properties: z.array(propertySchema),
  svgPath: z.string(),
});

/**
 * Schema for a component instance
 */
export const componentInstanceSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: pointSchema,
  size: sizeSchema.optional(),
  props: z.record(z.any()),
  rotation: z.number().optional(),
});

/**
 * Schema for a wire connection
 */
export const wireSchema = z.object({
  id: z.string(),
  from: z.object({
    componentId: z.string(),
    portId: z.string(),
  }),
  to: z.object({
    componentId: z.string(),
    portId: z.string(),
  }),
  style: z.object({
    color: z.string().optional(),
    strokeWidth: z.number().optional(),
    dashArray: z.string().optional(),
  }).optional(),
});

/**
 * Schema for the complete circuit state
 */
export const circuitStateSchema = z.object({
  components: z.array(componentInstanceSchema),
  wires: z.array(wireSchema),
  selectedComponentIds: z.array(z.string()),
  selectedWireIds: z.array(z.string()),
});

/**
 * Type for validation issues
 */
export const validationIssueSchema = z.object({
  type: z.enum(['error', 'warning']),
  message: z.string(),
  componentId: z.string().optional(),
  wireId: z.string().optional(),
});

// Export types derived from schemas
export type PortType = z.infer<typeof portTypeSchema>;
export type Point = z.infer<typeof pointSchema>;
export type Size = z.infer<typeof sizeSchema>;
export type PortSchema = z.infer<typeof portSchema>;
export type PropertySchema = z.infer<typeof propertySchema>;
export type ComponentSchema = z.infer<typeof componentSchema>;
export type ComponentInstance = z.infer<typeof componentInstanceSchema>;
export type Wire = z.infer<typeof wireSchema>;
export type CircuitState = z.infer<typeof circuitStateSchema>;
export type ValidationIssue = z.infer<typeof validationIssueSchema>;
