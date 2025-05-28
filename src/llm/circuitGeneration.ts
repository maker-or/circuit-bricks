/**
 * Circuit Generation API for LLM Integration
 *
 * This module provides functions for generating and describing circuits
 * based on natural language descriptions.
 */

import { getAllComponents } from '../registry';
import { CircuitState, ComponentInstance, Wire } from '../schemas/componentSchema';
import { CircuitTemplate, CircuitDescriptionSummary, ConnectionSuggestion } from './types';

/**
 * Generate a circuit template from a natural language description
 *
 * @param description - Natural language description of the desired circuit
 * @returns A basic circuit template
 */
export function generateCircuitTemplate(description: string): CircuitTemplate {
  const desc = description.toLowerCase();
  const components: ComponentInstance[] = [];
  const wires: Wire[] = [];
  const allSchemas = getAllComponents();

  // Simple pattern matching for common circuit types
  let componentId = 1;
  let wireId = 1;

  // Always include ground for reference
  if (allSchemas.find(s => s.id === 'ground')) {
    components.push({
      id: `ground_${componentId++}`,
      type: 'ground',
      position: { x: 100, y: 200 },
      props: {}
    });
  }

  // LED circuit patterns
  if (desc.includes('led') || desc.includes('light')) {
    if (allSchemas.find(s => s.id === 'led')) {
      components.push({
        id: `led_${componentId++}`,
        type: 'led',
        position: { x: 200, y: 100 },
        props: { color: '#ff0000' }
      });
    }

    // Add current limiting resistor
    if (allSchemas.find(s => s.id === 'resistor')) {
      components.push({
        id: `resistor_${componentId++}`,
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 330 }
      });
    }

    // Add power source
    if (allSchemas.find(s => s.id === 'battery')) {
      components.push({
        id: `battery_${componentId++}`,
        type: 'battery',
        position: { x: 50, y: 150 },
        props: { voltage: 9 }
      });
    }

    // Create basic connections for LED circuit
    if (components.length >= 3) {
      wires.push({
        id: `wire_${wireId++}`,
        from: { componentId: components[2].id, portId: 'positive' },
        to: { componentId: components[1].id, portId: 'terminal_1' }
      });
      wires.push({
        id: `wire_${wireId++}`,
        from: { componentId: components[1].id, portId: 'terminal_2' },
        to: { componentId: components[0].id, portId: 'anode' }
      });
      wires.push({
        id: `wire_${wireId++}`,
        from: { componentId: components[0].id, portId: 'cathode' },
        to: { componentId: components[2].id, portId: 'negative' }
      });
    }
  }

  // Simple resistor circuit
  else if (desc.includes('resistor') && !desc.includes('led')) {
    if (allSchemas.find(s => s.id === 'resistor')) {
      components.push({
        id: `resistor_${componentId++}`,
        type: 'resistor',
        position: { x: 150, y: 100 },
        props: { resistance: 1000 }
      });
    }

    if (allSchemas.find(s => s.id === 'battery')) {
      components.push({
        id: `battery_${componentId++}`,
        type: 'battery',
        position: { x: 50, y: 150 },
        props: { voltage: 9 }
      });
    }
  }

  // Capacitor circuit
  else if (desc.includes('capacitor') || desc.includes('filter')) {
    if (allSchemas.find(s => s.id === 'capacitor')) {
      components.push({
        id: `capacitor_${componentId++}`,
        type: 'capacitor',
        position: { x: 150, y: 100 },
        props: { capacitance: 100 }
      });
    }

    if (allSchemas.find(s => s.id === 'battery')) {
      components.push({
        id: `battery_${componentId++}`,
        type: 'battery',
        position: { x: 50, y: 150 },
        props: { voltage: 9 }
      });
    }
  }

  // If no specific pattern matched, create a basic circuit with available components
  if (components.length === 1) { // Only ground was added
    const basicComponents = ['resistor', 'battery'];
    for (const compType of basicComponents) {
      if (allSchemas.find(s => s.id === compType)) {
        components.push({
          id: `${compType}_${componentId++}`,
          type: compType,
          position: { x: 100 + components.length * 50, y: 100 },
          props: compType === 'battery' ? { voltage: 9 } : { resistance: 1000 }
        });
      }
    }
  }

  return {
    id: `circuit_${Date.now()}`,
    name: `Generated Circuit: ${description}`,
    description: `Auto-generated circuit based on: "${description}"`,
    components,
    wires
  };
}

/**
 * Generate a human-readable description of a circuit
 *
 * @param circuit - The circuit to describe
 * @returns Detailed circuit description
 */
export function describeCircuit(circuit: CircuitTemplate | CircuitState): CircuitDescriptionSummary {
  const components = circuit.components;
  const wires = circuit.wires;
  const allSchemas = getAllComponents();

  const componentDescriptions: string[] = [];
  const connectionDescriptions: string[] = [];

  // Describe components
  for (const comp of components) {
    const schema = allSchemas.find(s => s.id === comp.type);
    if (schema) {
      let desc = `${schema.name} (${comp.id})`;
      if (Object.keys(comp.props).length > 0) {
        const propStrs = Object.entries(comp.props).map(([key, value]) => `${key}: ${value}`);
        desc += ` with properties: ${propStrs.join(', ')}`;
      }
      componentDescriptions.push(desc);
    }
  }

  // Describe connections
  for (const wire of wires) {
    const fromComp = components.find(c => c.id === wire.from.componentId);
    const toComp = components.find(c => c.id === wire.to.componentId);
    if (fromComp && toComp) {
      connectionDescriptions.push(
        `${fromComp.type}(${fromComp.id}).${wire.from.portId} → ${toComp.type}(${toComp.id}).${wire.to.portId}`
      );
    }
  }

  // Generate analysis
  let analysis = `This circuit contains ${components.length} component${components.length !== 1 ? 's' : ''} and ${wires.length} connection${wires.length !== 1 ? 's' : ''}. `;

  const componentTypes = [...new Set(components.map(c => c.type))];
  if (componentTypes.includes('battery') || componentTypes.includes('voltage-source')) {
    analysis += 'It includes a power source. ';
  }
  if (componentTypes.includes('ground')) {
    analysis += 'It has a ground reference. ';
  }
  if (componentTypes.includes('resistor')) {
    analysis += 'It uses resistors for current control. ';
  }
  if (componentTypes.includes('led')) {
    analysis += 'It includes LED indicators. ';
  }
  if (componentTypes.includes('capacitor')) {
    analysis += 'It uses capacitors for filtering or energy storage. ';
  }

  return {
    summary: `Circuit with ${components.length} components including: ${componentTypes.join(', ')}`,
    components: componentDescriptions,
    connections: connectionDescriptions,
    analysis
  };
}

/**
 * Suggest connections between components in a circuit
 *
 * @param components - Array of components to analyze for connections
 * @returns Array of connection suggestions
 */
export function suggestConnections(components: ComponentInstance[]): ConnectionSuggestion[] {
  const suggestions: ConnectionSuggestion[] = [];
  const allSchemas = getAllComponents();

  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const comp1 = components[i];
      const comp2 = components[j];
      
      const schema1 = allSchemas.find(s => s.id === comp1.type);
      const schema2 = allSchemas.find(s => s.id === comp2.type);

      if (!schema1 || !schema2) continue;

      // Suggest power connections
      if (comp1.type === 'battery' && comp2.type !== 'ground') {
        if (schema1.ports.find(p => p.id === 'positive') && schema2.ports.find(p => p.type === 'input' || p.type === 'inout')) {
          suggestions.push({
            from: { componentId: comp1.id, portId: 'positive' },
            to: { componentId: comp2.id, portId: schema2.ports.find(p => p.type === 'input' || p.type === 'inout')!.id },
            reason: 'Connect power source positive terminal to component input',
            confidence: 0.8
          });
        }
      }

      // Suggest ground connections
      if (comp2.type === 'ground') {
        const outputPort = schema1.ports.find(p => p.type === 'output' || p.type === 'inout');
        if (outputPort) {
          suggestions.push({
            from: { componentId: comp1.id, portId: outputPort.id },
            to: { componentId: comp2.id, portId: 'terminal' },
            reason: 'Connect component output to ground reference',
            confidence: 0.7
          });
        }
      }

      // Suggest series connections for resistors and LEDs
      if (comp1.type === 'resistor' && comp2.type === 'led') {
        suggestions.push({
          from: { componentId: comp1.id, portId: 'terminal_2' },
          to: { componentId: comp2.id, portId: 'anode' },
          reason: 'Connect resistor output to LED anode for current limiting',
          confidence: 0.9
        });
      }
    }
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}
