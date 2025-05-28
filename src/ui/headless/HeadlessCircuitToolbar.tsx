/**
 * HeadlessCircuitToolbar Component
 * 
 * A headless (unstyled) toolbar for circuit operations like delete, copy, etc.
 * This component provides all the functionality without any styling, allowing users
 * to apply their own styling using their preferred method.
 */

import React from 'react';

export type ToolbarAction = 
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

export interface HeadlessCircuitToolbarProps {
  /** Callback when a toolbar action is triggered */
  onAction: (action: ToolbarAction) => void;
  /** Whether there is a selection (affects button states) */
  hasSelection?: boolean;
  /** Whether undo is available */
  canUndo?: boolean;
  /** Whether redo is available */
  canRedo?: boolean;
  /** Whether the grid is currently shown */
  showGrid?: boolean;
  /** Number of validation issues */
  validationIssues?: number;
  /** Additional class name for the root element */
  className?: string;
  /** Additional class names for sub-components */
  classNames?: {
    /** Class for the toolbar container */
    toolbar?: string;
    /** Class for each toolbar group */
    group?: string;
    /** Class for each toolbar button */
    button?: string;
    /** Class for disabled buttons */
    disabledButton?: string;
    /** Class for the validation button */
    validationButton?: string;
    /** Class for the validation button with issues */
    validationButtonWithIssues?: string;
  };
  /** Additional inline styles for the root element */
  style?: React.CSSProperties;
  /** Additional inline styles for sub-components */
  styles?: {
    [key: string]: React.CSSProperties;
  };
}

const HeadlessCircuitToolbar: React.FC<HeadlessCircuitToolbarProps> = ({
  onAction,
  hasSelection = false,
  canUndo = false,
  canRedo = false,
  showGrid = true,
  validationIssues = 0,
  className = '',
  classNames = {},
  style = {},
  styles = {}
}) => {
  return (
    <div 
      className={`cb-circuit-toolbar ${className}`}
      style={style}
      data-testid="circuit-toolbar"
    >
      <div 
        className={`cb-toolbar-group ${classNames.group || ''}`}
        style={styles.group}
      >
        <button
          className={`cb-toolbar-button ${classNames.button || ''} ${!hasSelection ? `cb-toolbar-button-disabled ${classNames.disabledButton || ''}` : ''}`}
          onClick={() => onAction('delete')}
          disabled={!hasSelection}
          title="Delete selected elements"
          aria-label="Delete selected elements"
          style={!hasSelection ? { ...styles.button, ...styles.disabledButton } : styles.button}
          data-action="delete"
          data-disabled={!hasSelection}
        >
          Delete
        </button>
        <button
          className={`cb-toolbar-button ${classNames.button || ''} ${!hasSelection ? `cb-toolbar-button-disabled ${classNames.disabledButton || ''}` : ''}`}
          onClick={() => onAction('copy')}
          disabled={!hasSelection}
          title="Copy selected elements"
          aria-label="Copy selected elements"
          style={!hasSelection ? { ...styles.button, ...styles.disabledButton } : styles.button}
          data-action="copy"
          data-disabled={!hasSelection}
        >
          Copy
        </button>
        <button
          className={`cb-toolbar-button ${classNames.button || ''}`}
          onClick={() => onAction('paste')}
          title="Paste elements"
          aria-label="Paste elements"
          style={styles.button}
          data-action="paste"
        >
          Paste
        </button>
      </div>
      
      <div 
        className={`cb-toolbar-group ${classNames.group || ''}`}
        style={styles.group}
      >
        <button
          className={`cb-toolbar-button ${classNames.button || ''} ${!canUndo ? `cb-toolbar-button-disabled ${classNames.disabledButton || ''}` : ''}`}
          onClick={() => onAction('undo')}
          disabled={!canUndo}
          title="Undo last action"
          aria-label="Undo last action"
          style={!canUndo ? { ...styles.button, ...styles.disabledButton } : styles.button}
          data-action="undo"
          data-disabled={!canUndo}
        >
          Undo
        </button>
        <button
          className={`cb-toolbar-button ${classNames.button || ''} ${!canRedo ? `cb-toolbar-button-disabled ${classNames.disabledButton || ''}` : ''}`}
          onClick={() => onAction('redo')}
          disabled={!canRedo}
          title="Redo last undone action"
          aria-label="Redo last undone action"
          style={!canRedo ? { ...styles.button, ...styles.disabledButton } : styles.button}
          data-action="redo"
          data-disabled={!canRedo}
        >
          Redo
        </button>
      </div>
      
      <div 
        className={`cb-toolbar-group ${classNames.group || ''}`}
        style={styles.group}
      >
        <button
          className={`cb-toolbar-button ${classNames.button || ''}`}
          onClick={() => onAction('zoom-in')}
          title="Zoom in"
          aria-label="Zoom in"
          style={styles.button}
          data-action="zoom-in"
        >
          Zoom In
        </button>
        <button
          className={`cb-toolbar-button ${classNames.button || ''}`}
          onClick={() => onAction('zoom-out')}
          title="Zoom out"
          aria-label="Zoom out"
          style={styles.button}
          data-action="zoom-out"
        >
          Zoom Out
        </button>
        <button
          className={`cb-toolbar-button ${classNames.button || ''}`}
          onClick={() => onAction('zoom-fit')}
          title="Fit circuit to view"
          aria-label="Fit circuit to view"
          style={styles.button}
          data-action="zoom-fit"
        >
          Fit
        </button>
      </div>
      
      <div 
        className={`cb-toolbar-group ${classNames.group || ''}`}
        style={styles.group}
      >
        <button
          className={`cb-toolbar-button ${classNames.button || ''} ${!hasSelection ? `cb-toolbar-button-disabled ${classNames.disabledButton || ''}` : ''}`}
          onClick={() => onAction('rotate-cw')}
          disabled={!hasSelection}
          title="Rotate clockwise"
          aria-label="Rotate clockwise"
          style={!hasSelection ? { ...styles.button, ...styles.disabledButton } : styles.button}
          data-action="rotate-cw"
          data-disabled={!hasSelection}
        >
          Rotate CW
        </button>
        <button
          className={`cb-toolbar-button ${classNames.button || ''} ${!hasSelection ? `cb-toolbar-button-disabled ${classNames.disabledButton || ''}` : ''}`}
          onClick={() => onAction('rotate-ccw')}
          disabled={!hasSelection}
          title="Rotate counter-clockwise"
          aria-label="Rotate counter-clockwise"
          style={!hasSelection ? { ...styles.button, ...styles.disabledButton } : styles.button}
          data-action="rotate-ccw"
          data-disabled={!hasSelection}
        >
          Rotate CCW
        </button>
      </div>
      
      <div 
        className={`cb-toolbar-group ${classNames.group || ''}`}
        style={styles.group}
      >
        <button
          className={`cb-toolbar-button ${classNames.button || ''} ${validationIssues > 0 ? `cb-toolbar-button-validation-issues ${classNames.validationButtonWithIssues || ''}` : `cb-toolbar-button-validation ${classNames.validationButton || ''}`}`}
          onClick={() => onAction('validate')}
          title="Validate circuit"
          aria-label={`Validate circuit${validationIssues > 0 ? ` (${validationIssues} issues)` : ''}`}
          style={validationIssues > 0 ? { ...styles.button, ...styles.validationButtonWithIssues } : { ...styles.button, ...styles.validationButton }}
          data-action="validate"
          data-issues={validationIssues}
        >
          Validate {validationIssues > 0 ? `(${validationIssues})` : ''}
        </button>
      </div>
      
      <div 
        className={`cb-toolbar-group ${classNames.group || ''}`}
        style={styles.group}
      >
        <button
          className={`cb-toolbar-button ${classNames.button || ''}`}
          onClick={() => onAction('grid-toggle')}
          title={showGrid ? "Hide grid" : "Show grid"}
          aria-label={showGrid ? "Hide grid" : "Show grid"}
          style={styles.button}
          data-action="grid-toggle"
          data-grid-shown={showGrid}
        >
          {showGrid ? "Hide Grid" : "Show Grid"}
        </button>
      </div>
    </div>
  );
};

export default HeadlessCircuitToolbar;
