/**
 * LLM-Friendly Validation Functions
 *
 * This module provides validation functions optimized for LLM consumption
 * with clear, human-readable error messages and suggestions.
 */

import { CircuitState, ComponentInstance, Wire } from '../schemas/componentSchema';
import { getComponentSchema } from '../registry';
import { validateCircuit } from '../utils/circuitValidation';
import { LLMValidationResult } from './types';

/**
 * Validate a circuit design with LLM-friendly output
 *
 * @param circuit - The circuit state to validate
 * @returns Validation result with clear messages
 */
export function validateCircuitDesign(circuit: CircuitState): LLMValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Validate component existence and schemas
  for (const component of circuit.components) {
    const schema = getComponentSchema(component.type);

    if (!schema) {
      errors.push(`Component type "${component.type}" (ID: ${component.id}) is not registered in the component registry.`);
      continue;
    }

    // Validate component properties
    for (const prop of schema.properties) {
      const value = component.props[prop.key];

      if (value === undefined && prop.default === undefined) {
        warnings.push(`Component "${component.id}" is missing required property "${prop.label}" (${prop.key}).`);
      }

      // Type validation
      if (value !== undefined) {
        switch (prop.type) {
          case 'number':
            if (typeof value !== 'number') {
              errors.push(`Property "${prop.label}" of component "${component.id}" must be a number, got ${typeof value}.`);
            } else {
              if (prop.min !== undefined && value < prop.min) {
                errors.push(`Property "${prop.label}" of component "${component.id}" must be at least ${prop.min}, got ${value}.`);
              }
              if (prop.max !== undefined && value > prop.max) {
                errors.push(`Property "${prop.label}" of component "${component.id}" must be at most ${prop.max}, got ${value}.`);
              }
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`Property "${prop.label}" of component "${component.id}" must be a boolean, got ${typeof value}.`);
            }
            break;
          case 'select':
            if (prop.options && !prop.options.some(opt => opt.value === value)) {
              const validOptions = prop.options.map(opt => opt.value).join(', ');
              errors.push(`Property "${prop.label}" of component "${component.id}" must be one of: ${validOptions}, got ${value}.`);
            }
            break;
        }
      }
    }
  }

  // Validate wire connections
  for (const wire of circuit.wires) {
    const fromComponent = circuit.components.find(c => c.id === wire.from.componentId);
    const toComponent = circuit.components.find(c => c.id === wire.to.componentId);

    if (!fromComponent) {
      errors.push(`Wire "${wire.id}" references non-existent source component "${wire.from.componentId}".`);
      continue;
    }

    if (!toComponent) {
      errors.push(`Wire "${wire.id}" references non-existent destination component "${wire.to.componentId}".`);
      continue;
    }

    const fromSchema = getComponentSchema(fromComponent.type);
    const toSchema = getComponentSchema(toComponent.type);

    if (!fromSchema || !toSchema) {
      continue; // Already reported above
    }

    // Validate port existence
    const fromPort = fromSchema.ports.find(p => p.id === wire.from.portId);
    const toPort = toSchema.ports.find(p => p.id === wire.to.portId);

    if (!fromPort) {
      errors.push(`Wire "${wire.id}" references non-existent port "${wire.from.portId}" on component "${fromComponent.id}" (${fromSchema.name}).`);
    }

    if (!toPort) {
      errors.push(`Wire "${wire.id}" references non-existent port "${wire.to.portId}" on component "${toComponent.id}" (${toSchema.name}).`);
    }

    // Validate port compatibility
    if (fromPort && toPort) {
      if (fromPort.type === 'input' && toPort.type === 'input') {
        warnings.push(`Wire "${wire.id}" connects two input ports, which may not be electrically valid.`);
      }

      if (fromPort.type === 'output' && toPort.type === 'output') {
        warnings.push(`Wire "${wire.id}" connects two output ports, which may cause conflicts.`);
      }
    }
  }

  // Circuit-level validation
  const powerSources = circuit.components.filter(comp => {
    const schema = getComponentSchema(comp.type);
    return schema?.category === 'power' ||
           schema?.id === 'battery' ||
           schema?.id === 'voltage-source';
  });

  const grounds = circuit.components.filter(comp => {
    const schema = getComponentSchema(comp.type);
    return schema?.id === 'ground';
  });

  if (powerSources.length === 0) {
    warnings.push('Circuit has no power sources. Consider adding a battery or voltage source.');
  }

  if (grounds.length === 0) {
    warnings.push('Circuit has no ground connection. This may cause issues in real circuits.');
  }

  if (powerSources.length > 1) {
    warnings.push(`Circuit has ${powerSources.length} power sources. Ensure they are properly isolated or connected.`);
  }

  // Check for isolated components
  const connectedComponents = new Set<string>();
  for (const wire of circuit.wires) {
    connectedComponents.add(wire.from.componentId);
    connectedComponents.add(wire.to.componentId);
  }

  for (const component of circuit.components) {
    if (!connectedComponents.has(component.id)) {
      warnings.push(`Component "${component.id}" is not connected to any other components.`);
    }
  }

  // Generate suggestions
  if (powerSources.length > 0 && grounds.length === 0) {
    suggestions.push('Add a ground component to complete the circuit.');
  }

  if (circuit.components.length > 0 && circuit.wires.length === 0) {
    suggestions.push('Add wire connections between components to create a functional circuit.');
  }

  // Check for common circuit patterns and suggest improvements dynamically
  const componentsByCategory = circuit.components.reduce((acc, comp) => {
    const schema = getComponentSchema(comp.type);
    if (schema) {
      if (!acc[schema.category]) acc[schema.category] = [];
      acc[schema.category].push(comp);
    }
    return acc;
  }, {} as Record<string, ComponentInstance[]>);

  // Dynamic LED + resistor check
  const outputComponents = componentsByCategory['output'] || [];
  const passiveComponents = componentsByCategory['passive'] || [];

  const hasLEDLikeComponent = outputComponents.some(comp => {
    const schema = getComponentSchema(comp.type);
    return schema?.name.toLowerCase().includes('led') ||
           schema?.description.toLowerCase().includes('light') ||
           schema?.description.toLowerCase().includes('diode');
  });

  const hasCurrentLimitingComponent = passiveComponents.some(comp => {
    const schema = getComponentSchema(comp.type);
    return schema?.name.toLowerCase().includes('resistor') ||
           schema?.description.toLowerCase().includes('resistance') ||
           schema?.description.toLowerCase().includes('current limiting');
  });

  if (hasLEDLikeComponent && !hasCurrentLimitingComponent && powerSources.length > 0) {
    suggestions.push('Consider adding a current-limiting component (like a resistor) in series with light-emitting components to prevent damage.');
  }

  // Use existing circuit validation for additional checks
  try {
    const existingValidation = validateCircuit(circuit);
    for (const issue of existingValidation) {
      if (issue.type === 'error') {
        errors.push(issue.message);
      } else if (issue.type === 'warning') {
        warnings.push(issue.message);
      }
    }
  } catch (error) {
    // If existing validation fails, add it as an error
    errors.push(`Circuit validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Validate a single component instance
 *
 * @param component - The component instance to validate
 * @returns Validation result
 */
export function validateComponentInstance(component: ComponentInstance): LLMValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const schema = getComponentSchema(component.type);

  if (!schema) {
    errors.push(`Component type "${component.type}" is not registered.`);
    return { isValid: false, errors, warnings, suggestions };
  }

  // Validate required properties
  for (const prop of schema.properties) {
    const value = component.props[prop.key];

    if (value === undefined && prop.default === undefined) {
      warnings.push(`Missing property "${prop.label}" (${prop.key}).`);
    }
  }

  // Validate position
  if (typeof component.position.x !== 'number' || typeof component.position.y !== 'number') {
    errors.push('Component position must have numeric x and y coordinates.');
  }

  // Validate ID
  if (!component.id || typeof component.id !== 'string') {
    errors.push('Component must have a valid string ID.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Validate a wire connection
 *
 * @param wire - The wire to validate
 * @param components - Array of components in the circuit
 * @returns Validation result
 */
export function validateWireConnection(wire: Wire, components: ComponentInstance[]): LLMValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const fromComponent = components.find(c => c.id === wire.from.componentId);
  const toComponent = components.find(c => c.id === wire.to.componentId);

  if (!fromComponent) {
    errors.push(`Source component "${wire.from.componentId}" not found.`);
  }

  if (!toComponent) {
    errors.push(`Destination component "${wire.to.componentId}" not found.`);
  }

  if (fromComponent && toComponent) {
    const fromSchema = getComponentSchema(fromComponent.type);
    const toSchema = getComponentSchema(toComponent.type);

    if (fromSchema && toSchema) {
      const fromPort = fromSchema.ports.find(p => p.id === wire.from.portId);
      const toPort = toSchema.ports.find(p => p.id === wire.to.portId);

      if (!fromPort) {
        errors.push(`Port "${wire.from.portId}" not found on ${fromSchema.name}.`);
      }

      if (!toPort) {
        errors.push(`Port "${wire.to.portId}" not found on ${toSchema.name}.`);
      }

      if (fromPort && toPort) {
        if (fromPort.type === 'input' && toPort.type === 'input') {
          warnings.push('Connecting two input ports may not be electrically valid.');
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}
