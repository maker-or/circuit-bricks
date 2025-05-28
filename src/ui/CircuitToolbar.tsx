/**
 * CircuitToolbar Component
 *
 * A toolbar for circuit operations like delete, copy, etc.
 * This is a styled wrapper around the HeadlessCircuitToolbar component.
 */

import React, { CSSProperties } from 'react';
import HeadlessCircuitToolbar, { ToolbarAction } from './headless/HeadlessCircuitToolbar';

export interface CircuitToolbarProps {
  onAction: (action: ToolbarAction) => void;
  hasSelection?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  showGrid?: boolean;
  validationIssues?: number;
  className?: string;
  style?: React.CSSProperties;
}

const CircuitToolbar: React.FC<CircuitToolbarProps> = ({
  onAction,
  hasSelection = false,
  canUndo = false,
  canRedo = false,
  showGrid = true,
  validationIssues = 0,
  className = '',
  style = {}
}) => {
  // Root style with user's custom style
  const rootStyle: CSSProperties = {
    display: 'flex',
    padding: '8px',
    backgroundColor: '#1a202c',
    borderBottom: '1px solid #2d3748',
    gap: '8px',
    ...style
  };

  // Default styles for the CircuitToolbar
  const defaultStyles: Record<string, CSSProperties> = {
    // Toolbar group
    group: {
      display: 'flex',
      gap: '4px',
      padding: '0 4px',
      borderRight: '1px solid #2d3748',
      marginRight: '4px'
    },

    // Toolbar button
    button: {
      padding: '6px 12px',
      backgroundColor: '#2d3748',
      color: '#e2e8f0',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    // Disabled button
    disabledButton: {
      opacity: 0.5,
      cursor: 'not-allowed',
      backgroundColor: '#2d3748'
    },

    // Validation button
    validationButton: {
      backgroundColor: '#2d3748'
    },

    // Validation button with issues
    validationButtonWithIssues: {
      backgroundColor: '#742a2a',
      color: '#feb2b2'
    }
  };

  return (
    <HeadlessCircuitToolbar
      onAction={onAction}
      hasSelection={hasSelection}
      canUndo={canUndo}
      canRedo={canRedo}
      showGrid={showGrid}
      validationIssues={validationIssues}
      className={className}
      style={rootStyle}
      styles={defaultStyles}
    />
  );
};

export type { ToolbarAction };
export default CircuitToolbar;
