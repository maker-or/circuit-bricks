/**
 * Circuit validation utilities
 * 
 * Functions to validate circuit connections and integrity.
 */

import { CircuitState, ComponentInstance, Wire } from '../types';
import { getComponentSchema } from '../registry';

interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  componentId?: string;
  wireId?: string;
}

/**
 * Validate a circuit for common issues
 * 
 * @param circuit - The circuit state to validate
 * @returns Array of validation issues
 */
export function validateCircuit(circuit: CircuitState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Check for missing components in wire connections
  issues.push(...validateWireConnections(circuit));
  
  // Check for floating inputs/outputs
  issues.push(...validateFloatingPorts(circuit));
  
  // Check for short circuits
  issues.push(...validateShortCircuits(circuit));
  
  return issues;
}

/**
 * Validate wire connections to ensure they reference valid components
 */
function validateWireConnections(circuit: CircuitState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const componentIds = new Set(circuit.components.map(c => c.id));
  
  for (const wire of circuit.wires) {
    // Check source component exists
    if (!componentIds.has(wire.from.componentId)) {
      issues.push({
        type: 'error',
        message: `Wire connected to non-existent component ID: ${wire.from.componentId}`,
        wireId: wire.id
      });
    }
    
    // Check destination component exists
    if (!componentIds.has(wire.to.componentId)) {
      issues.push({
        type: 'error',
        message: `Wire connected to non-existent component ID: ${wire.to.componentId}`,
        wireId: wire.id
      });
    }
    
    // Validate port IDs
    const sourceComponent = circuit.components.find(c => c.id === wire.from.componentId);
    const destComponent = circuit.components.find(c => c.id === wire.to.componentId);
    
    if (sourceComponent) {
      const schema = getComponentSchema(sourceComponent.type);
      if (schema && !schema.ports.some(p => p.id === wire.from.portId)) {
        issues.push({
          type: 'error',
          message: `Wire connected to non-existent port: ${wire.from.portId} on component ${sourceComponent.type}`,
          wireId: wire.id
        });
      }
    }
    
    if (destComponent) {
      const schema = getComponentSchema(destComponent.type);
      if (schema && !schema.ports.some(p => p.id === wire.to.portId)) {
        issues.push({
          type: 'error',
          message: `Wire connected to non-existent port: ${wire.to.portId} on component ${destComponent.type}`,
          wireId: wire.id
        });
      }
    }
  }
  
  return issues;
}

/**
 * Check for floating input/output ports that should be connected
 */
function validateFloatingPorts(circuit: CircuitState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const connectedPorts = new Map<string, Set<string>>();
  
  // Build a map of all connected ports
  for (const wire of circuit.wires) {
    if (!connectedPorts.has(wire.from.componentId)) {
      connectedPorts.set(wire.from.componentId, new Set());
    }
    if (!connectedPorts.has(wire.to.componentId)) {
      connectedPorts.set(wire.to.componentId, new Set());
    }
    
    connectedPorts.get(wire.from.componentId)!.add(wire.from.portId);
    connectedPorts.get(wire.to.componentId)!.add(wire.to.portId);
  }
  
  // Check each component for floating ports
  for (const component of circuit.components) {
    const schema = getComponentSchema(component.type);
    if (!schema) continue;
    
    const componentConnectedPorts = connectedPorts.get(component.id) || new Set();
    
    for (const port of schema.ports) {
      if (port.type === 'input' && !componentConnectedPorts.has(port.id)) {
        issues.push({
          type: 'warning',
          message: `Floating input port: ${port.id} on ${schema.name} (${component.id})`,
          componentId: component.id
        });
      }
      
      if (port.type === 'output' && !componentConnectedPorts.has(port.id)) {
        issues.push({
          type: 'warning',
          message: `Floating output port: ${port.id} on ${schema.name} (${component.id})`,
          componentId: component.id
        });
      }
    }
  }
  
  return issues;
}

/**
 * Check for short circuits (multiple outputs connected together)
 */
function validateShortCircuits(circuit: CircuitState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const connectionGraph = new Map<string, Set<string>>();
  
  // Build a connection graph
  for (const wire of circuit.wires) {
    const fromKey = `${wire.from.componentId}-${wire.from.portId}`;
    const toKey = `${wire.to.componentId}-${wire.to.portId}`;
    
    if (!connectionGraph.has(fromKey)) {
      connectionGraph.set(fromKey, new Set());
    }
    if (!connectionGraph.has(toKey)) {
      connectionGraph.set(toKey, new Set());
    }
    
    connectionGraph.get(fromKey)!.add(toKey);
    connectionGraph.get(toKey)!.add(fromKey);
  }
  
  // Create a map of port types
  const portTypes = new Map<string, string>();
  for (const component of circuit.components) {
    const schema = getComponentSchema(component.type);
    if (!schema) continue;
    
    for (const port of schema.ports) {
      portTypes.set(`${component.id}-${port.id}`, port.type);
    }
  }
  
  // Find connected output ports
  const visited = new Set<string>();
  const connectedComponents = [];
  
  // For each port
  for (const [port, connections] of connectionGraph.entries()) {
    if (visited.has(port)) continue;
    
    // Do a BFS to find all connected ports
    const connectedPorts = new Set<string>();
    const queue = [port];
    visited.add(port);
    
    while (queue.length > 0) {
      const currentPort = queue.shift()!;
      connectedPorts.add(currentPort);
      
      for (const connectedPort of connectionGraph.get(currentPort) || []) {
        if (!visited.has(connectedPort)) {
          queue.push(connectedPort);
          visited.add(connectedPort);
        }
      }
    }
    
    // Count output ports in this connected component
    const outputPorts = [...connectedPorts].filter(p => 
      portTypes.get(p) === 'output'
    );
    
    if (outputPorts.length > 1) {
      issues.push({
        type: 'error',
        message: `Short circuit detected: ${outputPorts.length} output ports connected together`,
      });
    }
  }
  
  return issues;
}

export default validateCircuit;
