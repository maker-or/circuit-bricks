/**
 * HeadlessPropertyPanel Component
 *
 * A headless (unstyled) component for editing the properties of a circuit component.
 * This component provides all the functionality without any styling, allowing users
 * to apply their own styling using their preferred method.
 */

import React from 'react';
import { ComponentInstance } from '../../schemas/componentSchema';
import { getComponentSchema } from '../../registry';

export interface HeadlessPropertyPanelProps {
  /** The component instance to edit properties for */
  component: ComponentInstance | null;
  /** Callback when a property changes */
  onPropertyChange?: (id: string, key: string, value: any) => void;
  /** Additional class name for the root element */
  className?: string;
  /** Additional class names for sub-components */
  classNames?: {
    /** Class for the empty state container */
    emptyContainer?: string;
    /** Class for the error state container */
    errorContainer?: string;
    /** Class for the header section */
    header?: string;
    /** Class for the title */
    title?: string;
    /** Class for the component ID */
    componentId?: string;
    /** Class for the content section */
    content?: string;
    /** Class for each property item */
    propertyItem?: string;
    /** Class for property labels */
    propertyLabel?: string;
    /** Class for property unit text */
    propertyUnit?: string;
    /** Class for number inputs */
    numberInput?: string;
    /** Class for text inputs */
    textInput?: string;
    /** Class for checkbox containers */
    checkboxContainer?: string;
    /** Class for checkboxes */
    checkbox?: string;
    /** Class for checkbox labels */
    checkboxLabel?: string;
    /** Class for select inputs */
    select?: string;
    /** Class for color input containers */
    colorContainer?: string;
    /** Class for color inputs */
    colorInput?: string;
    /** Class for color text inputs */
    colorTextInput?: string;
    /** Class for the position section */
    positionSection?: string;
    /** Class for position section title */
    positionTitle?: string;
    /** Class for position inputs container */
    positionInputs?: string;
    /** Class for position input groups */
    positionInputGroup?: string;
    /** Class for position labels */
    positionLabel?: string;
    /** Class for position inputs */
    positionInput?: string;
    /** Class for the rotation section */
    rotationSection?: string;
    /** Class for rotation section title */
    rotationTitle?: string;
    /** Class for rotation slider container */
    rotationSlider?: string;
    /** Class for rotation range input */
    rotationRange?: string;
    /** Class for rotation value display */
    rotationValue?: string;
    /** Class for rotation presets container */
    rotationPresets?: string;
    /** Class for rotation preset buttons */
    rotationPresetButton?: string;
  };
  /** Additional inline styles for the root element */
  style?: React.CSSProperties;
  /** Additional inline styles for sub-components */
  styles?: {
    [key: string]: React.CSSProperties;
  };
}

const HeadlessPropertyPanel: React.FC<HeadlessPropertyPanelProps> = ({
  component,
  onPropertyChange,
  className = '',
  classNames = {},
  style = {},
  styles = {}
}) => {
  if (!component) {
    return (
      <div
        className={`cb-property-panel-empty ${classNames.emptyContainer || ''} ${className}`}
        style={style}
        data-testid="property-panel-empty"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
        <p>No component selected</p>
        <p>Select a component to edit its properties</p>
      </div>
    );
  }

  const schema = getComponentSchema(component.type);

  if (!schema) {
    return (
      <div
        className={`cb-property-panel-error ${classNames.errorContainer || ''} ${className}`}
        style={style}
        data-testid="property-panel-error"
        role="alert"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>Error: Unknown component type '{component.type}'</p>
        <p>This component type is not registered in the system</p>
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
    <div
      className={`cb-property-panel ${className}`}
      style={style}
      data-testid="property-panel"
    >
      <div className={`cb-property-panel-header ${classNames.header || ''}`} style={styles.header}>
        <h3 className={`cb-property-panel-title ${classNames.title || ''}`} style={styles.title}>
          {schema.name} Properties
        </h3>
        <span
          className={`cb-property-panel-component-id ${classNames.componentId || ''}`}
          style={styles.componentId}
        >
          ID: {component.id}
        </span>
      </div>

      <div className={`cb-property-panel-content ${classNames.content || ''}`} style={styles.content}>
        {schema.properties.map(property => {
          const currentValue = component.props[property.key] ?? property.default;
          const inputId = `prop-${component.id}-${property.key}`;

          return (
            <div
              key={property.key}
              className={`cb-property-item ${classNames.propertyItem || ''}`}
              style={styles.propertyItem}
              data-property-key={property.key}
            >
              <label
                htmlFor={inputId}
                className={`cb-property-label ${classNames.propertyLabel || ''}`}
                style={styles.propertyLabel}
              >
                {property.label}
                {property.unit && (
                  <span
                    className={`cb-property-unit ${classNames.propertyUnit || ''}`}
                    style={styles.propertyUnit}
                  >
                    {property.unit}
                  </span>
                )}
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
                  className={`cb-property-number-input ${classNames.numberInput || ''}`}
                  style={styles.numberInput}
                  aria-label={`${property.label} ${property.unit || ''}`}
                />
              )}

              {property.type === 'text' && (
                <input
                  id={inputId}
                  type="text"
                  value={currentValue}
                  onChange={e => handleChange(property.key, e)}
                  className={`cb-property-text-input ${classNames.textInput || ''}`}
                  style={styles.textInput}
                  aria-label={property.label}
                />
              )}

              {property.type === 'boolean' && (
                <div
                  className={`cb-property-checkbox-container ${classNames.checkboxContainer || ''}`}
                  style={styles.checkboxContainer}
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={currentValue}
                    onChange={e => handleChange(property.key, e)}
                    className={`cb-property-checkbox ${classNames.checkbox || ''}`}
                    style={styles.checkbox}
                    aria-label={property.label}
                  />
                  <span
                    className={`cb-property-checkbox-label ${classNames.checkboxLabel || ''}`}
                    style={styles.checkboxLabel}
                  >
                    {currentValue ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              )}

              {property.type === 'select' && property.options && (
                <select
                  id={inputId}
                  value={currentValue}
                  onChange={e => handleChange(property.key, e)}
                  className={`cb-property-select ${classNames.select || ''}`}
                  style={styles.select}
                  aria-label={property.label}
                >
                  {property.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {property.type === 'color' && (
                <div
                  className={`cb-property-color-container ${classNames.colorContainer || ''}`}
                  style={styles.colorContainer}
                >
                  <input
                    id={inputId}
                    type="color"
                    value={currentValue}
                    onChange={e => handleChange(property.key, e)}
                    className={`cb-property-color-input ${classNames.colorInput || ''}`}
                    style={styles.colorInput}
                    aria-label={`${property.label} color picker`}
                  />
                  <input
                    type="text"
                    value={currentValue}
                    onChange={e => handleChange(property.key, e)}
                    className={`cb-property-color-text-input ${classNames.colorTextInput || ''}`}
                    style={styles.colorTextInput}
                    aria-label={`${property.label} color value`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Position Section */}
      <div
        className={`cb-property-panel-position ${classNames.positionSection || ''}`}
        style={styles.positionSection}
      >
        <h4
          className={`cb-property-panel-position-title ${classNames.positionTitle || ''}`}
          style={styles.positionTitle}
        >
          Position
        </h4>
        <div
          className={`cb-property-panel-position-inputs ${classNames.positionInputs || ''}`}
          style={styles.positionInputs}
        >
          <div
            className={`cb-property-panel-position-input-group ${classNames.positionInputGroup || ''}`}
            style={styles.positionInputGroup}
          >
            <label
              className={`cb-property-panel-position-label ${classNames.positionLabel || ''}`}
              style={styles.positionLabel}
              htmlFor="position-x"
            >
              X:
            </label>
            <input
              id="position-x"
              type="number"
              value={component.position.x}
              onChange={e => onPropertyChange?.(
                component.id,
                'position',
                { ...component.position, x: parseFloat(e.target.value) }
              )}
              className={`cb-property-panel-position-input ${classNames.positionInput || ''}`}
              style={styles.positionInput}
              aria-label="X position"
            />
          </div>
          <div
            className={`cb-property-panel-position-input-group ${classNames.positionInputGroup || ''}`}
            style={styles.positionInputGroup}
          >
            <label
              className={`cb-property-panel-position-label ${classNames.positionLabel || ''}`}
              style={styles.positionLabel}
              htmlFor="position-y"
            >
              Y:
            </label>
            <input
              id="position-y"
              type="number"
              value={component.position.y}
              onChange={e => onPropertyChange?.(
                component.id,
                'position',
                { ...component.position, y: parseFloat(e.target.value) }
              )}
              className={`cb-property-panel-position-input ${classNames.positionInput || ''}`}
              style={styles.positionInput}
              aria-label="Y position"
            />
          </div>
        </div>
      </div>

      {/* Rotation Section */}
      {component.rotation !== undefined && (
        <div
          className={`cb-property-panel-rotation ${classNames.rotationSection || ''}`}
          style={styles.rotationSection}
        >
          <h4
            className={`cb-property-panel-rotation-title ${classNames.rotationTitle || ''}`}
            style={styles.rotationTitle}
          >
            Rotation
          </h4>
          <div
            className={`cb-property-panel-rotation-slider ${classNames.rotationSlider || ''}`}
            style={styles.rotationSlider}
          >
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
              className={`cb-property-panel-rotation-range ${classNames.rotationRange || ''}`}
              style={styles.rotationRange}
              aria-label="Rotation angle"
            />
            <div
              className={`cb-property-panel-rotation-value ${classNames.rotationValue || ''}`}
              style={styles.rotationValue}
            >
              {component.rotation}°
            </div>
          </div>
          <div
            className={`cb-property-panel-rotation-presets ${classNames.rotationPresets || ''}`}
            style={styles.rotationPresets}
          >
            {[0, 90, 180, 270, 360].map(angle => (
              <button
                key={angle}
                onClick={() => onPropertyChange?.(
                  component.id,
                  'rotation',
                  angle
                )}
                className={`cb-property-panel-rotation-preset-button ${classNames.rotationPresetButton || ''}`}
                style={styles.rotationPresetButton}
                data-active={component.rotation === angle}
                aria-label={`Set rotation to ${angle} degrees`}
                aria-pressed={component.rotation === angle}
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

export default HeadlessPropertyPanel;
