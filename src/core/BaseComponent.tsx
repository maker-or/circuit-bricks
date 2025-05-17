/**
 * BaseComponent
 * 
 * A core component that renders SVG for a circuit component based on its schema.
 */

import React from 'react';
import { ComponentSchema, ComponentInstance } from '../types';
import Port from './Port';

export interface BaseComponentProps {
  schema: ComponentSchema;
  component: ComponentInstance;
  onClick?: (event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onPortClick?: (componentId: string, portId: string, event: React.MouseEvent) => void;
  selected?: boolean;
}

const BaseComponent: React.FC<BaseComponentProps> = ({
  schema,
  component,
  onClick,
  onMouseDown,
  onPortClick,
  selected = false
}) => {
  const { id, position, size, rotation = 0 } = component;
  
  // Determine the size to use - from the component instance or defaults
  const width = size?.width || schema.defaultWidth;
  const height = size?.height || schema.defaultHeight;

  // Create a transform for position and optional rotation
  const transform = `translate(${position.x}, ${position.y})${
    rotation ? ` rotate(${rotation} ${width / 2} ${height / 2})` : ''
  }`;

  // Style for the selection outline
  const outlineStyle = selected
    ? {
        stroke: '#4f8ef7',
        strokeWidth: 2,
        strokeDasharray: 'none',
        fill: 'none',
        pointerEvents: 'none' as const,
        vectorEffect: 'non-scaling-stroke' as const,
      }
    : undefined;

  return (
    <g
      transform={transform}
      onClick={onClick}
      onMouseDown={onMouseDown}
      data-component-id={id}
      data-component-type={component.type}
    >
      {/* SVG content from the schema */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${schema.defaultWidth} ${schema.defaultHeight}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* If svgPath is a complete SVG element with tags */}
        {schema.svgPath.startsWith('<svg') ? (
          <g dangerouslySetInnerHTML={{ __html: schema.svgPath }} />
        ) : (
          // Otherwise treat it as a path data string
          <path
            d={schema.svgPath}
            fill="none"
            stroke="black"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {/* Render ports */}
      {schema.ports.map(port => (
        <Port
          key={port.id}
          componentId={id}
          port={port}
          selected={false}
          onClick={(portId, event) => onPortClick?.(id, portId, event)}
        />
      ))}

      {/* Selection outline */}
      {selected && (
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          {...outlineStyle}
        />
      )}
    </g>
  );
};

export default BaseComponent;
