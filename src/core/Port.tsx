/**
 * Port Component
 *
 * Renders a connection port on a circuit component
 */

import React from 'react';
import { PortSchema } from '../schemas/componentSchema';

export interface PortProps {
  componentId: string;
  port: PortSchema;
  selected?: boolean;
  onClick?: (portId: string, event: React.MouseEvent) => void;
}

const Port: React.FC<PortProps> = ({
  componentId,
  port,
  selected = false,
  onClick
}) => {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering component click
    onClick?.(port.id, event);
  };

  return (
    <circle
      cx={port.x}
      cy={port.y}
      r={5}
      fill={selected ? '#4f8ef7' : '#555'}
      stroke="#000"
      strokeWidth={1}
      data-component-id={componentId}
      data-port-id={port.id}
      data-port-type={port.type}
      vectorEffect="non-scaling-stroke"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    />
  );
};

export default Port;
