# Headless UI Components

Circuit-Bricks now provides headless (unstyled) versions of all UI components, allowing you to fully customize the appearance of your circuit editor using your preferred styling method (CSS, Tailwind, styled-components, etc.).

## What are Headless Components?

Headless components provide all the functionality and logic of their styled counterparts but without any built-in styling. This gives you complete control over the appearance of your UI while still benefiting from the component's behavior and accessibility features.

## Available Headless Components

Circuit-Bricks provides the following headless components:

- `HeadlessPropertyPanel`: For editing component properties
- `HeadlessComponentPalette`: For selecting components to add to the circuit
- `HeadlessCircuitToolbar`: For circuit operations like delete, copy, etc.

## Using Headless Components

You can import headless components directly from the circuit-bricks package:

```tsx
import { 
  HeadlessPropertyPanel, 
  HeadlessComponentPalette, 
  HeadlessCircuitToolbar 
} from 'circuit-bricks';
```

## Styling Options

Headless components can be styled in several ways:

### 1. Using className Props

All headless components accept a `className` prop for the root element and a `classNames` object for sub-components:

```tsx
<HeadlessPropertyPanel
  component={selectedComponent}
  onPropertyChange={handlePropertyChange}
  className="my-property-panel"
  classNames={{
    header: "my-panel-header",
    title: "my-panel-title",
    content: "my-panel-content"
  }}
/>
```

### 2. Using Inline Styles

You can also use inline styles with the `style` prop for the root element and a `styles` object for sub-components:

```tsx
<HeadlessPropertyPanel
  component={selectedComponent}
  onPropertyChange={handlePropertyChange}
  style={{ border: '1px solid #ccc', borderRadius: '8px' }}
  styles={{
    header: { backgroundColor: '#f5f5f5', padding: '16px' },
    title: { fontSize: '18px', fontWeight: 'bold' },
    content: { padding: '16px' }
  }}
/>
```

### 3. Using CSS/SCSS

You can target the predefined class names in your CSS/SCSS files:

```css
.cb-property-panel {
  border: 1px solid #ccc;
  border-radius: 8px;
}

.cb-property-panel-header {
  background-color: #f5f5f5;
  padding: 16px;
}

.cb-property-panel-title {
  font-size: 18px;
  font-weight: bold;
}

.cb-property-panel-content {
  padding: 16px;
}
```

### 4. Using CSS-in-JS Libraries

You can use styled-components, emotion, or other CSS-in-JS libraries:

```tsx
import styled from 'styled-components';
import { HeadlessPropertyPanel } from 'circuit-bricks';

const StyledPropertyPanel = styled(HeadlessPropertyPanel)`
  border: 1px solid #ccc;
  border-radius: 8px;
  
  .cb-property-panel-header {
    background-color: #f5f5f5;
    padding: 16px;
  }
  
  .cb-property-panel-title {
    font-size: 18px;
    font-weight: bold;
  }
  
  .cb-property-panel-content {
    padding: 16px;
  }
`;

// Then use it in your component
<StyledPropertyPanel
  component={selectedComponent}
  onPropertyChange={handlePropertyChange}
/>
```

### 5. Using Tailwind CSS

You can use Tailwind CSS classes with the `className` and `classNames` props:

```tsx
<HeadlessPropertyPanel
  component={selectedComponent}
  onPropertyChange={handlePropertyChange}
  className="border border-gray-300 rounded-lg overflow-hidden"
  classNames={{
    header: "bg-gray-100 p-4",
    title: "text-lg font-bold text-gray-800",
    content: "p-4"
  }}
/>
```

## Class Names Reference

Each headless component provides a set of predefined class names that you can target in your CSS:

### HeadlessPropertyPanel

- `cb-property-panel`: Root container
- `cb-property-panel-empty`: Empty state container
- `cb-property-panel-error`: Error state container
- `cb-property-panel-header`: Header section
- `cb-property-panel-title`: Title
- `cb-property-panel-component-id`: Component ID
- `cb-property-panel-content`: Content section
- `cb-property-item`: Property item
- `cb-property-label`: Property label
- `cb-property-unit`: Property unit
- `cb-property-number-input`: Number input
- `cb-property-text-input`: Text input
- `cb-property-checkbox-container`: Checkbox container
- `cb-property-checkbox`: Checkbox
- `cb-property-checkbox-label`: Checkbox label
- `cb-property-select`: Select input
- `cb-property-color-container`: Color input container
- `cb-property-color-input`: Color input
- `cb-property-color-text-input`: Color text input
- `cb-property-panel-position`: Position section
- `cb-property-panel-position-title`: Position title
- `cb-property-panel-position-inputs`: Position inputs container
- `cb-property-panel-position-input-group`: Position input group
- `cb-property-panel-position-label`: Position label
- `cb-property-panel-position-input`: Position input
- `cb-property-panel-rotation`: Rotation section
- `cb-property-panel-rotation-title`: Rotation title
- `cb-property-panel-rotation-slider`: Rotation slider
- `cb-property-panel-rotation-range`: Rotation range input
- `cb-property-panel-rotation-value`: Rotation value
- `cb-property-panel-rotation-presets`: Rotation presets
- `cb-property-panel-rotation-preset-button`: Rotation preset button

### HeadlessComponentPalette

- `cb-component-palette`: Root container
- `cb-component-palette-header`: Header section
- `cb-component-palette-title`: Title
- `cb-component-palette-search-container`: Search container
- `cb-component-palette-search-input`: Search input
- `cb-component-palette-search-icon`: Search icon
- `cb-component-palette-clear-search`: Clear search button
- `cb-component-palette-category-tabs`: Category tabs container
- `cb-component-palette-category-tabs-inner`: Category tabs inner container
- `cb-component-palette-category-tab`: Category tab
- `cb-component-palette-category-tab-active`: Active category tab
- `cb-component-palette-component-list`: Component list container
- `cb-component-palette-empty-state`: Empty state container
- `cb-component-item`: Component item
- `cb-component-icon`: Component icon
- `cb-component-details`: Component details
- `cb-component-name`: Component name
- `cb-component-category`: Component category
- `cb-component-arrow`: Component arrow
- `cb-component-palette-left-shadow`: Left shadow
- `cb-component-palette-right-shadow`: Right shadow
- `cb-component-palette-top-shadow`: Top shadow
- `cb-component-palette-bottom-shadow`: Bottom shadow

### HeadlessCircuitToolbar

- `cb-circuit-toolbar`: Root container
- `cb-toolbar-group`: Toolbar group
- `cb-toolbar-button`: Toolbar button
- `cb-toolbar-button-disabled`: Disabled button
- `cb-toolbar-button-validation`: Validation button
- `cb-toolbar-button-validation-issues`: Validation button with issues

## Data Attributes

Headless components also provide data attributes that you can use for more specific styling:

### HeadlessPropertyPanel

- `data-property-key`: The key of the property (on property items)

### HeadlessComponentPalette

- `data-active`: Whether a category tab is active
- `data-component-id`: The ID of the component (on component items)
- `data-component-type`: The type of the component (on component items)
- `data-component-category`: The category of the component (on component items)

### HeadlessCircuitToolbar

- `data-action`: The action of the button
- `data-disabled`: Whether the button is disabled
- `data-issues`: The number of validation issues
- `data-grid-shown`: Whether the grid is shown

## Accessibility

All headless components are built with accessibility in mind:

- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader announcements

## Example: Creating a Custom Styled Component

Here's an example of creating a custom styled component using the headless component:

```tsx
import React from 'react';
import { HeadlessPropertyPanel } from 'circuit-bricks';

export interface CustomPropertyPanelProps {
  component: ComponentInstance | null;
  onPropertyChange?: (id: string, key: string, value: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

const CustomPropertyPanel: React.FC<CustomPropertyPanelProps> = ({
  component,
  onPropertyChange,
  className = '',
  style = {}
}) => {
  // Custom styles
  const customStyles = {
    root: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      color: '#1a202c',
      ...style
    },
    header: {
      padding: '16px',
      borderBottom: '1px solid #e2e8f0',
      background: '#f7fafc'
    },
    title: {
      margin: '0 0 4px 0',
      fontSize: '18px',
      fontWeight: 600,
      color: '#2d3748'
    },
    // Add more custom styles as needed
  };

  return (
    <HeadlessPropertyPanel
      component={component}
      onPropertyChange={onPropertyChange}
      className={className}
      style={customStyles.root}
      styles={customStyles}
    />
  );
};

export default CustomPropertyPanel;
```

## Migrating from Styled to Headless Components

If you're currently using the styled components and want to migrate to headless components, follow these steps:

1. Replace imports:
   ```tsx
   // Before
   import { PropertyPanel } from 'circuit-bricks';
   
   // After
   import { HeadlessPropertyPanel } from 'circuit-bricks';
   ```

2. Add your custom styling:
   ```tsx
   <HeadlessPropertyPanel
     component={selectedComponent}
     onPropertyChange={handlePropertyChange}
     className="your-custom-class"
     // Add more styling as needed
   />
   ```

3. Test thoroughly to ensure all functionality works as expected with your custom styling.

## Conclusion

Headless components give you complete control over the appearance of your circuit editor while maintaining all the functionality and accessibility features. Whether you prefer CSS, Tailwind, styled-components, or any other styling method, you can now create a fully customized circuit editor that matches your application's design system.
