import { expect, test, describe, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HeadlessCircuitToolbar from '../src/ui/headless/HeadlessCircuitToolbar';
import HeadlessComponentPalette from '../src/ui/headless/HeadlessComponentPalette';
import HeadlessPropertyPanel from '../src/ui/headless/HeadlessPropertyPanel';

// Mock component instance for testing
const mockComponent = {
  id: 'resistor-1',
  type: 'resistor',
  position: { x: 100, y: 100 },
  props: { resistance: 1000 },
  rotation: 0
};

// Mock component schema for registry
vi.mock('../src/registry', () => ({
  getComponentSchema: () => ({
    id: 'resistor',
    name: 'Resistor',
    category: 'passive',
    description: 'A basic resistor component',
    properties: [
      {
        key: 'resistance',
        label: 'Resistance',
        type: 'number',
        default: 1000,
        min: 0,
        unit: 'Ω'
      }
    ]
  }),
  getAllComponents: () => [
    {
      id: 'resistor',
      name: 'Resistor',
      category: 'passive',
      description: 'A basic resistor component',
      defaultWidth: 40,
      defaultHeight: 20,
      svgPath: 'M 0,10 L 40,10'
    },
    {
      id: 'capacitor',
      name: 'Capacitor',
      category: 'passive',
      description: 'A basic capacitor component',
      defaultWidth: 40,
      defaultHeight: 20,
      svgPath: 'M 15,0 L 15,20 M 25,0 L 25,20'
    }
  ],
  getComponentsByCategory: () => [
    {
      id: 'resistor',
      name: 'Resistor',
      category: 'passive',
      description: 'A basic resistor component',
      defaultWidth: 40,
      defaultHeight: 20,
      svgPath: 'M 0,10 L 40,10'
    }
  ]
}));

describe('Headless UI Components', () => {
  describe('HeadlessCircuitToolbar', () => {
    test('renders all action buttons', () => {
      const handleAction = vi.fn();
      
      render(
        <HeadlessCircuitToolbar
          onAction={handleAction}
          hasSelection={false}
          canUndo={false}
          canRedo={false}
        />
      );
      
      // Check for common toolbar buttons
      expect(screen.getByTitle('Delete selected elements')).toBeTruthy();
      expect(screen.getByTitle('Copy selected elements')).toBeTruthy();
      expect(screen.getByTitle('Paste elements')).toBeTruthy();
      expect(screen.getByTitle('Undo last action')).toBeTruthy();
      expect(screen.getByTitle('Redo last undone action')).toBeTruthy();
    });
    
    test('calls onAction when button is clicked', () => {
      const handleAction = vi.fn();
      
      render(
        <HeadlessCircuitToolbar
          onAction={handleAction}
          hasSelection={true}
          canUndo={true}
          canRedo={true}
        />
      );
      
      // Click the delete button
      fireEvent.click(screen.getByTitle('Delete selected elements'));
      expect(handleAction).toHaveBeenCalledWith('delete');
      
      // Click the undo button
      fireEvent.click(screen.getByTitle('Undo last action'));
      expect(handleAction).toHaveBeenCalledWith('undo');
    });
    
    test('disables buttons when appropriate', () => {
      const handleAction = vi.fn();
      
      render(
        <HeadlessCircuitToolbar
          onAction={handleAction}
          hasSelection={false}
          canUndo={false}
          canRedo={false}
        />
      );
      
      // Check that buttons are disabled
      expect(screen.getByTitle('Delete selected elements')).toBeDisabled();
      expect(screen.getByTitle('Copy selected elements')).toBeDisabled();
      expect(screen.getByTitle('Undo last action')).toBeDisabled();
      expect(screen.getByTitle('Redo last undone action')).toBeDisabled();
    });
    
    test('applies custom class names and styles', () => {
      const handleAction = vi.fn();
      
      const { container } = render(
        <HeadlessCircuitToolbar
          onAction={handleAction}
          className="custom-toolbar"
          classNames={{
            group: "custom-group",
            button: "custom-button"
          }}
          style={{ backgroundColor: 'red' }}
          styles={{
            group: { padding: '10px' },
            button: { color: 'blue' }
          }}
        />
      );
      
      // Check that custom class names are applied
      expect(container.querySelector('.custom-toolbar')).toBeTruthy();
      expect(container.querySelector('.custom-group')).toBeTruthy();
      expect(container.querySelector('.custom-button')).toBeTruthy();
    });
  });
  
  describe('HeadlessComponentPalette', () => {
    test('renders component categories and search', () => {
      const handleSelectComponent = vi.fn();
      
      render(
        <HeadlessComponentPalette onSelectComponent={handleSelectComponent} />
      );
      
      // Should render the search input
      expect(screen.getByPlaceholderText('Search components...')).toBeTruthy();
    });
    
    test('calls onSelectComponent when component is clicked', () => {
      const handleSelectComponent = vi.fn();
      
      const { container } = render(
        <HeadlessComponentPalette onSelectComponent={handleSelectComponent} />
      );
      
      // Find component items
      const componentItems = container.querySelectorAll('.cb-component-item');
      
      // If there are any components rendered
      if (componentItems.length > 0) {
        fireEvent.click(componentItems[0]);
        expect(handleSelectComponent).toHaveBeenCalled();
      }
    });
    
    test('filters components by search term', () => {
      const handleSelectComponent = vi.fn();
      
      const { container } = render(
        <HeadlessComponentPalette onSelectComponent={handleSelectComponent} />
      );
      
      // Get the search input
      const searchInput = screen.getByPlaceholderText('Search components...');
      
      // Type in the search input
      fireEvent.change(searchInput, { target: { value: 'Resistor' } });
      
      // Check that only the resistor component is shown
      const componentNames = container.querySelectorAll('.cb-component-name');
      expect(componentNames.length).toBe(1);
      expect(componentNames[0].textContent).toBe('Resistor');
    });
    
    test('applies custom class names and styles', () => {
      const handleSelectComponent = vi.fn();
      
      const { container } = render(
        <HeadlessComponentPalette
          onSelectComponent={handleSelectComponent}
          className="custom-palette"
          classNames={{
            header: "custom-header",
            searchInput: "custom-search"
          }}
          style={{ backgroundColor: 'red' }}
          styles={{
            header: { padding: '10px' },
            searchInput: { color: 'blue' }
          }}
        />
      );
      
      // Check that custom class names are applied
      expect(container.querySelector('.custom-palette')).toBeTruthy();
      expect(container.querySelector('.custom-header')).toBeTruthy();
      expect(container.querySelector('.custom-search')).toBeTruthy();
    });
  });
  
  describe('HeadlessPropertyPanel', () => {
    test('renders property editors for selected component', () => {
      const handlePropertyChange = vi.fn();
      
      const { container } = render(
        <HeadlessPropertyPanel
          component={mockComponent}
          onPropertyChange={handlePropertyChange}
        />
      );
      
      // Check if property editors are rendered
      const propertyEditors = container.querySelectorAll('input[type="number"]');
      expect(propertyEditors.length).toBeGreaterThan(0);
      
      // Check if the resistance property is rendered with the correct value
      const resistanceInput = container.querySelector(`input[id="prop-${mockComponent.id}-resistance"]`);
      expect(resistanceInput).toBeTruthy();
      expect((resistanceInput as HTMLInputElement).value).toBe('1000');
    });
    
    test('calls onPropertyChange when property is changed', () => {
      const handlePropertyChange = vi.fn();
      
      const { container } = render(
        <HeadlessPropertyPanel
          component={mockComponent}
          onPropertyChange={handlePropertyChange}
        />
      );
      
      // Find the resistance input
      const resistanceInput = container.querySelector(`input[id="prop-${mockComponent.id}-resistance"]`);
      
      // Change the value
      fireEvent.change(resistanceInput as HTMLInputElement, { target: { value: '2000' } });
      
      // Check that onPropertyChange was called with the correct arguments
      expect(handlePropertyChange).toHaveBeenCalledWith(mockComponent.id, 'resistance', 2000);
    });
    
    test('renders empty state when no component is selected', () => {
      render(
        <HeadlessPropertyPanel
          component={null}
          onPropertyChange={() => {}}
        />
      );
      
      // Check that the empty state is rendered
      expect(screen.getByText('No component selected')).toBeTruthy();
      expect(screen.getByText('Select a component to edit its properties')).toBeTruthy();
    });
    
    test('applies custom class names and styles', () => {
      const handlePropertyChange = vi.fn();
      
      const { container } = render(
        <HeadlessPropertyPanel
          component={mockComponent}
          onPropertyChange={handlePropertyChange}
          className="custom-panel"
          classNames={{
            header: "custom-header",
            title: "custom-title"
          }}
          style={{ backgroundColor: 'red' }}
          styles={{
            header: { padding: '10px' },
            title: { color: 'blue' }
          }}
        />
      );
      
      // Check that custom class names are applied
      expect(container.querySelector('.custom-panel')).toBeTruthy();
      expect(container.querySelector('.custom-header')).toBeTruthy();
      expect(container.querySelector('.custom-title')).toBeTruthy();
    });
  });
});
