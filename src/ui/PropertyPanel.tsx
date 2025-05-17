/**
 * PropertyPanel Component
 * 
 * A component for editing the properties of a circuit component.
 */

import React from 'react';
import { ComponentInstance } from '../types';
import { getComponentSchema } from '../registry';

export interface PropertyPanelProps {
  component: ComponentInstance | null;
  onPropertyChange?: (id: string, key: string, value: any) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  component,
  onPropertyChange
}) => {
  if (!component) {
    return (
      <div className="property-panel-empty">
        <p>No component selected</p>
      </div>
    );
  }

  const schema = getComponentSchema(component.type);
  
  if (!schema) {
    return (
      <div className="property-panel-error">
        <p>Error: Unknown component type '{component.type}'</p>
      </div>
    );
  }

  const handleChange = (
    key: string,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const property = schema.properties.find(prop => prop.key === key);
    if (!property) return;

    let value: any = event.target.value;
    
    // Convert value based on property type
    if (property.type === 'number') {
      value = parseFloat(value);
      
      // Validate min/max if specified
      if (property.min !== undefined && value < property.min) {
        value = property.min;
      }
      if (property.max !== undefined && value > property.max) {
        value = property.max;
      }
    } else if (property.type === 'boolean') {
      value = (event.target as HTMLInputElement).checked;
    }

    onPropertyChange?.(component.id, key, value);
  };

  return (
    <div className="property-panel">
      <div className="property-panel-header">
        <h3>{schema.name} Properties</h3>
        <span className="component-id">ID: {component.id}</span>
      </div>
      
      <div className="property-panel-content">
        {schema.properties.map(property => {
          const currentValue = component.props[property.key] ?? property.default;
          const inputId = `prop-${component.id}-${property.key}`;
          
          return (
            <div key={property.key} className="property-item">
              <label htmlFor={inputId}>
                {property.label}
                {property.unit && <span className="unit">{property.unit}</span>}
              </label>
              
              {property.type === 'number' && (
                <input
                  id={inputId}
                  type="number"
                  value={currentValue}
                  onChange={e => handleChange(property.key, e)}
                  min={property.min}
                  max={property.max}
                  step="any"
                />
              )}
              
              {property.type === 'text' && (
                <input
                  id={inputId}
                  type="text"
                  value={currentValue}
                  onChange={e => handleChange(property.key, e)}
                />
              )}
              
              {property.type === 'boolean' && (
                <input
                  id={inputId}
                  type="checkbox"
                  checked={currentValue}
                  onChange={e => handleChange(property.key, e)}
                />
              )}
              
              {property.type === 'select' && property.options && (
                <select
                  id={inputId}
                  value={currentValue}
                  onChange={e => handleChange(property.key, e)}
                >
                  {property.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              
              {property.type === 'color' && (
                <input
                  id={inputId}
                  type="color"
                  value={currentValue}
                  onChange={e => handleChange(property.key, e)}
                />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="property-panel-position">
        <h4>Position</h4>
        <div className="position-inputs">
          <label>
            X:
            <input
              type="number"
              value={component.position.x}
              onChange={e => onPropertyChange?.(
                component.id,
                'position',
                { ...component.position, x: parseFloat(e.target.value) }
              )}
            />
          </label>
          <label>
            Y:
            <input
              type="number"
              value={component.position.y}
              onChange={e => onPropertyChange?.(
                component.id,
                'position',
                { ...component.position, y: parseFloat(e.target.value) }
              )}
            />
          </label>
        </div>
      </div>
      
      {component.rotation !== undefined && (
        <div className="property-panel-rotation">
          <h4>Rotation</h4>
          <input
            type="range"
            min="0"
            max="360"
            step="90"
            value={component.rotation}
            onChange={e => onPropertyChange?.(
              component.id,
              'rotation',
              parseFloat(e.target.value)
            )}
          />
          <span>{component.rotation}°</span>
        </div>
      )}
    </div>
  );
};

export default PropertyPanel;
