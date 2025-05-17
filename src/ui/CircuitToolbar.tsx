/**
 * CircuitToolbar Component
 * 
 * A toolbar for circuit operations like delete, copy, etc.
 */

import React from 'react';

type ToolbarAction = 
  | 'delete'
  | 'copy'
  | 'paste'
  | 'undo'
  | 'redo'
  | 'zoom-in'
  | 'zoom-out'
  | 'zoom-fit'
  | 'grid-toggle'
  | 'rotate-cw'
  | 'rotate-ccw'
  | 'validate';

export interface CircuitToolbarProps {
  onAction: (action: ToolbarAction) => void;
  hasSelection?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  showGrid?: boolean;
  validationIssues?: number;
}

const CircuitToolbar: React.FC<CircuitToolbarProps> = ({
  onAction,
  hasSelection = false,
  canUndo = false,
  canRedo = false,
  showGrid = true,
  validationIssues = 0
}) => {
  return (
    <div className="circuit-toolbar">
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={() => onAction('delete')}
          disabled={!hasSelection}
          title="Delete selected elements"
        >
          Delete
        </button>
        <button
          className="toolbar-button"
          onClick={() => onAction('copy')}
          disabled={!hasSelection}
          title="Copy selected elements"
        >
          Copy
        </button>
        <button
          className="toolbar-button"
          onClick={() => onAction('paste')}
          title="Paste elements"
        >
          Paste
        </button>
      </div>
      
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={() => onAction('undo')}
          disabled={!canUndo}
          title="Undo last action"
        >
          Undo
        </button>
        <button
          className="toolbar-button"
          onClick={() => onAction('redo')}
          disabled={!canRedo}
          title="Redo last undone action"
        >
          Redo
        </button>
      </div>
      
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={() => onAction('zoom-in')}
          title="Zoom in"
        >
          Zoom In
        </button>
        <button
          className="toolbar-button"
          onClick={() => onAction('zoom-out')}
          title="Zoom out"
        >
          Zoom Out
        </button>
        <button
          className="toolbar-button"
          onClick={() => onAction('zoom-fit')}
          title="Fit circuit to view"
        >
          Fit
        </button>
      </div>
      
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={() => onAction('rotate-cw')}
          disabled={!hasSelection}
          title="Rotate clockwise"
        >
          Rotate CW
        </button>
        <button
          className="toolbar-button"
          onClick={() => onAction('rotate-ccw')}
          disabled={!hasSelection}
          title="Rotate counter-clockwise"
        >
          Rotate CCW
        </button>
      </div>
      
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={() => onAction('validate')}
          title="Validate circuit"
          style={{ 
            color: validationIssues > 0 ? 'red' : 'inherit'
          }}
        >
          Validate {validationIssues > 0 ? `(${validationIssues})` : ''}
        </button>
      </div>
      
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={() => onAction('grid-toggle')}
          title={showGrid ? "Hide grid" : "Show grid"}
        >
          {showGrid ? "Hide Grid" : "Show Grid"}
        </button>
      </div>
    </div>
  );
};

export default CircuitToolbar;
