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
      <div className="property-panel-empty" style={{
        backgroundColor: '#1a202c',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#a0aec0',
        height: '100%',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #2d3748',
        textAlign: 'center'
      }}>
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.6, marginBottom: '16px' }}
        >
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
        <p style={{ margin: '0', fontSize: '15px', fontWeight: 500 }}>No component selected</p>
        <p style={{ margin: '8px 0 0 0', fontSize: '13px', opacity: 0.7 }}>
          Select a component to edit its properties
        </p>
      </div>
    );
  }

  const schema = getComponentSchema(component.type);
  
  if (!schema) {
    return (
      <div className="property-panel-error" style={{
        backgroundColor: '#1a202c',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f56565',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #2d3748',
        textAlign: 'center'
      }}>
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.8, marginBottom: '16px' }}
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p style={{ margin: '0', fontSize: '15px', fontWeight: 500 }}>
          Error: Unknown component type '{component.type}'
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '13px', opacity: 0.8 }}>
          This component type is not registered in the system
        </p>
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
    <div className="property-panel" style={{
      backgroundColor: '#1a202c',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
      border: '1px solid #2d3748',
      color: '#e2e8f0'
    }}>
      <div className="property-panel-header" style={{
        padding: '16px',
        borderBottom: '1px solid #2d3748',
        background: '#202938'
      }}>
        <h3 style={{
          margin: '0 0 4px 0',
          fontSize: '18px',
          fontWeight: 600,
          color: '#e2e8f0'
        }}>{schema.name} Properties</h3>
        <span className="component-id" style={{
          fontSize: '12px',
          color: '#a0aec0',
          opacity: 0.7
        }}>ID: {component.id}</span>
      </div>
      
      <div className="property-panel-content" style={{
        padding: '16px'
      }}>
        {schema.properties.map(property => {
          const currentValue = component.props[property.key] ?? property.default;
          const inputId = `prop-${component.id}-${property.key}`;
          
          return (
            <div key={property.key} className="property-item" style={{
              marginBottom: '16px'
            }}>
              <label 
                htmlFor={inputId}
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#cbd5e0',
                }}
              >
                {property.label}
                {property.unit && <span className="unit" style={{
                  marginLeft: '4px',
                  color: '#a0aec0',
                  fontSize: '12px'
                }}>{property.unit}</span>}
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
                  style={{
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
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#63b3ed';
                    e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#4a5568';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              )}
              
              {property.type === 'text' && (
                <input
                  id={inputId}
                  type="text"
                  value={currentValue}
                  onChange={e => handleChange(property.key, e)}
                  style={{
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
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#63b3ed';
                    e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#4a5568';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              )}
              
              {property.type === 'boolean' && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={currentValue}
                    onChange={e => handleChange(property.key, e)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#4299e1',
                      borderRadius: '4px',
                      marginRight: '8px'
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#cbd5e0' }}>
                    {currentValue ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              )}
              
              {property.type === 'select' && property.options && (
                <select
                  id={inputId}
                  value={currentValue}
                  onChange={e => handleChange(property.key, e)}
                  style={{
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
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#63b3ed';
                    e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#4a5568';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {property.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              
              {property.type === 'color' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    id={inputId}
                    type="color"
                    value={currentValue}
                    onChange={e => handleChange(property.key, e)}
                    style={{
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      cursor: 'pointer'
                    }}
                  />
                  <input
                    type="text"
                    value={currentValue}
                    onChange={e => handleChange(property.key, e)}
                    style={{
                      flexGrow: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #4a5568',
                      backgroundColor: '#2d3748',
                      color: '#e2e8f0',
                      fontSize: '14px'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#63b3ed';
                      e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.25)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#4a5568';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="property-panel-position" style={{
        padding: '0 16px 16px',
        borderTop: '1px solid #2d3748',
        marginTop: '8px'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: 500,
          margin: '16px 0 12px',
          color: '#cbd5e0'
        }}>Position</h4>
        <div className="position-inputs" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '6px',
              color: '#cbd5e0'
            }}>
              X:
            </label>
            <input
              type="number"
              value={component.position.x}
              onChange={e => onPropertyChange?.(
                component.id,
                'position',
                { ...component.position, x: parseFloat(e.target.value) }
              )}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #4a5568',
                backgroundColor: '#2d3748',
                color: '#e2e8f0',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#63b3ed';
                e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.25)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#4a5568';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '6px',
              color: '#cbd5e0'
            }}>
              Y:
            </label>
            <input
              type="number"
              value={component.position.y}
              onChange={e => onPropertyChange?.(
                component.id,
                'position',
                { ...component.position, y: parseFloat(e.target.value) }
              )}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #4a5568',
                backgroundColor: '#2d3748',
                color: '#e2e8f0',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#63b3ed';
                e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.25)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#4a5568';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
      </div>
      
      {component.rotation !== undefined && (
        <div className="property-panel-rotation" style={{
          padding: '0 16px 16px',
          borderTop: '1px solid #2d3748',
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: 500,
            margin: '16px 0 12px',
            color: '#cbd5e0'
          }}>Rotation</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                backgroundColor: '#4a5568',
                appearance: 'none',
                outline: 'none',
                cursor: 'pointer',
                accentColor: '#4299e1'
              }}
            />
            <div style={{
              padding: '6px 10px',
              backgroundColor: '#2d3748',
              borderRadius: '6px',
              border: '1px solid #4a5568',
              fontSize: '14px',
              fontWeight: 500,
              color: '#e2e8f0',
              minWidth: '48px',
              textAlign: 'center'
            }}>
              {component.rotation}°
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '8px'
          }}>
            {[0, 90, 180, 270, 360].map(angle => (
              <button 
                key={angle} 
                onClick={() => onPropertyChange?.(
                  component.id,
                  'rotation',
                  angle
                )}
                style={{
                  background: component.rotation === angle ? '#4299e1' : '#2d3748',
                  border: 'none',
                  borderRadius: '4px',
                  width: '32px',
                  height: '24px',
                  fontSize: '12px',
                  color: component.rotation === angle ? '#fff' : '#cbd5e0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if(component.rotation !== angle) {
                    e.currentTarget.style.background = '#3a4a61';
                  }
                }}
                onMouseLeave={(e) => {
                  if(component.rotation !== angle) {
                    e.currentTarget.style.background = '#2d3748';
                  }
                }}
              >
                {angle}°
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyPanel;
