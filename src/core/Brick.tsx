/**
 * Brick Component
 * 
 * A wrapper around BaseComponent that handles schema lookup and error states.
 */

import React from 'react';
import { ComponentInstance } from '../types';
import { getComponentSchema } from '../registry';
import BaseComponent from './BaseComponent';

export interface BrickProps {
  component: ComponentInstance;
  onClick?: (event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onPortClick?: (componentId: string, portId: string, event: React.MouseEvent) => void;
  selected?: boolean;
}

const Brick: React.FC<BrickProps> = ({
  component,
  onClick,
  onMouseDown,
  onPortClick,
  selected = false
}) => {
  const schema = getComponentSchema(component.type);
  
  // Handle missing schema with a placeholder component
  if (!schema) {
    console.warn(`No schema found for component type: ${component.type}`);
    return (
      <g 
        transform={`translate(${component.position.x}, ${component.position.y})`}
        onClick={onClick}
        onMouseDown={onMouseDown}
        data-component-id={component.id}
        data-component-type="unknown"
      >
        <rect 
          width={100} 
          height={50} 
          fill="red" 
          stroke="black" 
          strokeWidth={1.5}
          strokeDasharray="5,5"
          vectorEffect="non-scaling-stroke"
        />
        <text 
          x={50} 
          y={25} 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fill="white"
          fontFamily="sans-serif"
          fontSize="12px"
        >
          Unknown: {component.type}
        </text>
      </g>
    );
  }
  
  // Render the component with its schema
  return (
    <BaseComponent 
      schema={schema}
      component={component}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onPortClick={onPortClick}
      selected={selected}
    />
  );
};

export default Brick;
