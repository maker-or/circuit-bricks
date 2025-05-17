/**
 * Core type definitions for Circuit-Bricks library
 */

/**
 * Defines the type of port (input, output, or bidirectional)
 */
export type PortType = 'input' | 'output' | 'inout';

/**
 * Represents a 2D coordinate point
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents width and height dimensions
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Schema definition for a component port
 */
export interface PortSchema {
  id: string;
  x: number;
  y: number;
  type: PortType;
  label?: string;
}

/**
 * Schema definition for a component property
 */
export interface PropertySchema {
  key: string;
  label: string;
  type: 'number' | 'boolean' | 'select' | 'text' | 'color';
  unit?: string;
  options?: Array<{ value: any; label: string }>;
  default: any;
  min?: number;
  max?: number;
}

/**
 * Complete schema definition for a circuit component
 * 
 * The ComponentSchema defines everything about a component type:
 * - Visual representation (SVG path)
 * - Connection points (ports)
 * - Configurable properties
 * - Default dimensions
 * 
 * This schema is used to register components in the component registry
 * and serves as a blueprint for creating component instances.
 */
export interface ComponentSchema {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  ports: PortSchema[];
  properties: PropertySchema[];
  svgPath: string;
}

/**
 * Represents an instance of a component placed on the circuit canvas
 */
export interface ComponentInstance {
  id: string;
  type: string;
  position: Point;
  size?: Size;
  props: Record<string, any>;
  rotation?: number;
}

/**
 * Represents a wire connection between two component ports
 */
export interface Wire {
  id: string;
  from: {
    componentId: string;
    portId: string;
  };
  to: {
    componentId: string;
    portId: string;
  };
  style?: {
    color?: string;
    strokeWidth?: number;
    dashArray?: string;
  };
}

/**
 * Complete state of a circuit including components, wires, and selection
 */
export interface CircuitState {
  components: ComponentInstance[];
  wires: Wire[];
  selectedComponentIds: string[];
  selectedWireIds: string[];
}