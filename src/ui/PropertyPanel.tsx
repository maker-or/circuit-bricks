/**
 * PropertyPanel Component
 *
 * A component for editing the properties of a circuit component.
 * This is a styled wrapper around the HeadlessPropertyPanel component.
 */

import React, { CSSProperties } from 'react';
import { ComponentInstance } from '../schemas/componentSchema';
import HeadlessPropertyPanel from './headless/HeadlessPropertyPanel';

export interface PropertyPanelProps {
  component: ComponentInstance | null;
  onPropertyChange?: (id: string, key: string, value: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  component,
  onPropertyChange,
  className = '',
  style = {}
}) => {
  // Root style with user's custom style
  const rootStyle: CSSProperties = {
    backgroundColor: '#1a202c',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    border: '1px solid #2d3748',
    color: '#e2e8f0',
    ...style
  };

  // Default styles for the PropertyPanel
  const defaultStyles: Record<string, CSSProperties> = {
    // Empty state
    emptyContainer: {
      backgroundColor: '#1a202c',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      color: '#a0aec0',
      height: '100%',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgb(21, 25, 32)',
      textAlign: 'center'
    },

    // Error state
    errorContainer: {
      backgroundColor: '#1a202c',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      color: '#f56565',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgb(21, 26, 34)',
      textAlign: 'center'
    },

    // Header section
    header: {
      padding: '16px',
      borderBottom: '1px solid #2d3748',
      background: '#202938'
    },

    // Title
    title: {
      margin: '0 0 4px 0',
      fontSize: '18px',
      fontWeight: 600,
      color: '#e2e8f0'
    },

    // Component ID
    componentId: {
      fontSize: '12px',
      color: '#a0aec0',
      opacity: 0.7
    },

    // Content section
    content: {
      padding: '16px'
    },

    // Property item
    propertyItem: {
      marginBottom: '16px'
    },

    // Property label
    propertyLabel: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: 500,
      color: '#cbd5e0'
    },

    // Property unit
    propertyUnit: {
      marginLeft: '4px',
      color: '#a0aec0',
      fontSize: '12px'
    },

    // Number input
    numberInput: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #4a5568',
      backgroundColor: '#2d3748',
      color: '#e2e8f0',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },

    // Text input
    textInput: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #4a5568',
      backgroundColor: '#2d3748',
      color: '#e2e8f0',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },

    // Checkbox container
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center'
    },

    // Checkbox
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
      accentColor: '#4299e1',
      borderRadius: '4px',
      marginRight: '8px'
    },

    // Checkbox label
    checkboxLabel: {
      fontSize: '14px',
      color: '#cbd5e0'
    },

    // Select input
    select: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #4a5568',
      backgroundColor: '#2d3748',
      color: '#e2e8f0',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a0aec0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px top 50%',
      backgroundSize: '12px auto',
      paddingRight: '30px'
    },

    // Color container
    colorContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },

    // Color input
    colorInput: {
      width: '36px',
      height: '36px',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: 'transparent',
      cursor: 'pointer'
    },

    // Color text input
    colorTextInput: {
      flexGrow: 1,
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #4a5568',
      backgroundColor: '#2d3748',
      color: '#e2e8f0',
      fontSize: '14px'
    },

    // Position section
    positionSection: {
      padding: '0 16px 16px',
      borderTop: '1px solid #2d3748',
      marginTop: '8px'
    },

    // Position title
    positionTitle: {
      fontSize: '16px',
      fontWeight: 500,
      margin: '16px 0 12px',
      color: '#cbd5e0'
    },

    // Position inputs
    positionInputs: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    },

    // Position input group
    positionInputGroup: {
      display: 'flex',
      flexDirection: 'column' as const
    },

    // Position label
    positionLabel: {
      fontSize: '14px',
      fontWeight: 500,
      marginBottom: '6px',
      color: '#cbd5e0'
    },

    // Position input
    positionInput: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #4a5568',
      backgroundColor: '#2d3748',
      color: '#e2e8f0',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease'
    },

    // Rotation section
    rotationSection: {
      padding: '0 16px 16px',
      borderTop: '1px solid #2d3748'
    },

    // Rotation title
    rotationTitle: {
      fontSize: '16px',
      fontWeight: 500,
      margin: '16px 0 12px',
      color: '#cbd5e0'
    },

    // Rotation slider
    rotationSlider: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },

    // Rotation range
    rotationRange: {
      flex: 1,
      height: '6px',
      borderRadius: '3px',
      backgroundColor: '#4a5568',
      appearance: 'none',
      outline: 'none',
      cursor: 'pointer',
      accentColor: '#4299e1'
    },

    // Rotation value
    rotationValue: {
      padding: '6px 10px',
      backgroundColor: '#2d3748',
      borderRadius: '6px',
      border: '1px solid #4a5568',
      fontSize: '14px',
      fontWeight: 500,
      color: '#e2e8f0',
      minWidth: '48px',
      textAlign: 'center'
    },

    // Rotation presets
    rotationPresets: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '8px'
    },

    // Rotation preset button
    rotationPresetButton: {
      background: '#2d3748',
      border: 'none',
      borderRadius: '4px',
      width: '32px',
      height: '24px',
      fontSize: '12px',
      color: '#cbd5e0',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  return (
    <HeadlessPropertyPanel
      component={component}
      onPropertyChange={onPropertyChange}
      className={className}
      style={rootStyle}
      styles={defaultStyles}
    />
  );
};

export default PropertyPanel;
