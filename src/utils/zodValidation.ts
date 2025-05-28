/**
 * ZOD validation utilities for Circuit-Bricks
 * 
 * This module provides functions for validating component schemas, component instances,
 * wires, and circuit states using ZOD schemas.
 */

import { 
  componentSchema, 
  componentInstanceSchema, 
  wireSchema, 
  circuitStateSchema,
  ComponentSchema,
  ComponentInstance,
  Wire,
  CircuitState
} from '../schemas/componentSchema';

/**
 * Validate a component schema
 * 
 * @param schema - The component schema to validate
 * @returns An object with success flag and optional error message
 */
export function validateComponentSchema(schema: unknown): { 
  success: boolean; 
  error?: string;
  data?: ComponentSchema;
} {
  try {
    const validatedSchema = componentSchema.parse(schema);
    return { success: true, data: validatedSchema };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Validate a component instance
 * 
 * @param instance - The component instance to validate
 * @returns An object with success flag and optional error message
 */
export function validateComponentInstance(instance: unknown): {
  success: boolean;
  error?: string;
  data?: ComponentInstance;
} {
  try {
    const validatedInstance = componentInstanceSchema.parse(instance);
    return { success: true, data: validatedInstance };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Validate a wire connection
 * 
 * @param wire - The wire to validate
 * @returns An object with success flag and optional error message
 */
export function validateWire(wire: unknown): {
  success: boolean;
  error?: string;
  data?: Wire;
} {
  try {
    const validatedWire = wireSchema.parse(wire);
    return { success: true, data: validatedWire };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Validate a complete circuit state
 * 
 * @param circuit - The circuit state to validate
 * @returns An object with success flag and optional error message
 */
export function validateCircuitState(circuit: unknown): {
  success: boolean;
  error?: string;
  data?: CircuitState;
} {
  try {
    const validatedCircuit = circuitStateSchema.parse(circuit);
    return { success: true, data: validatedCircuit };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}
