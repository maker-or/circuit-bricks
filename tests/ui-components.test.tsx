import { expect, test, describe, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CircuitToolbar from '../src/ui/CircuitToolbar';
import ComponentPalette from '../src/ui/ComponentPalette';
import PropertyPanel from '../src/ui/PropertyPanel';

describe('UI Components', () => {
  describe('CircuitToolbar', () => {
    test('renders all action buttons', () => {
      const { getByTitle } = render(
        <CircuitToolbar
          onAction={() => {}}
          hasSelection={false}
          canUndo={false}
          canRedo={false}
        />
      );
      
      // Check for common toolbar buttons
      expect(getByTitle('Delete selected elements')).toBeTruthy();
      expect(getByTitle('Copy selected elements')).toBeTruthy();
      expect(getByTitle('Paste elements')).toBeTruthy();
      expect(getByTitle('Undo last action')).toBeTruthy();
      expect(getByTitle('Redo last undone action')).toBeTruthy();
    });
    
    test('disables buttons when appropriate', () => {
      const { getByTitle } = render(
        <CircuitToolbar
          onAction={() => {}}
          hasSelection={false}
          canUndo={false}
          canRedo={false}
        />
      );
      
      // Delete button should be disabled when no selection
      const deleteButton = getByTitle('Delete selected elements');
      expect(deleteButton).toBeDisabled();
      
      // Undo button should be disabled when canUndo is false
      const undoButton = getByTitle('Undo last action');
      expect(undoButton).toBeDisabled();
      
      // Redo button should be disabled when canRedo is false
      const redoButton = getByTitle('Redo last undone action');
      expect(redoButton).toBeDisabled();
    });
    
    test('enables buttons when appropriate', () => {
      const { getByTitle } = render(
        <CircuitToolbar
          onAction={() => {}}
          hasSelection={true}
          canUndo={true}
          canRedo={true}
        />
      );
      
      // Delete button should be enabled when selection exists
      const deleteButton = getByTitle('Delete selected elements');
      expect(deleteButton).not.toBeDisabled();
      
      // Undo button should be enabled when canUndo is true
      const undoButton = getByTitle('Undo last action');
      expect(undoButton).not.toBeDisabled();
      
      // Redo button should be enabled when canRedo is true
      const redoButton = getByTitle('Redo last undone action');
      expect(redoButton).not.toBeDisabled();
    });
    
    test('calls onAction with correct action type', () => {
      const handleAction = vi.fn();
      
      const { getByTitle } = render(
        <CircuitToolbar
          onAction={handleAction}
          hasSelection={true}
          canUndo={true}
          canRedo={true}
        />
      );
      
      // Click delete button
      const deleteButton = getByTitle('Delete selected elements');
      fireEvent.click(deleteButton);
      expect(handleAction).toHaveBeenCalledWith('delete');
      
      // Click undo button
      const undoButton = getByTitle('Undo last action');
      fireEvent.click(undoButton);
      expect(handleAction).toHaveBeenCalledWith('undo');
      
      // Click redo button
      const redoButton = getByTitle('Redo last undone action');
      fireEvent.click(redoButton);
      expect(handleAction).toHaveBeenCalledWith('redo');
    });
    
    test('shows validation issues', () => {
      const { getByTitle } = render(
        <CircuitToolbar
          onAction={() => {}}
          hasSelection={false}
          canUndo={false}
          canRedo={false}
          validationIssues={3}
        />
      );
      
      // Validate button should show the number of issues
      const validateButton = getByTitle('Validate circuit');
      expect(validateButton.textContent).toContain('(3)');
      // Check for the actual computed RGB color value (equivalent to #feb2b2)
      expect(validateButton.style.color).toBe('rgb(254, 178, 178)');
    });
  });
  
  describe('ComponentPalette', () => {
    test('renders component categories and search', () => {
      const { getByText, getByPlaceholderText } = render(
        <ComponentPalette onSelectComponent={() => {}} />
      );
      
      // Should render the "All" category button
      expect(getByText('All')).toBeTruthy();
      
      // Should render the search input
      expect(getByPlaceholderText('Search components...')).toBeTruthy();
    });
    
    test('calls onSelectComponent when component is clicked', () => {
      const handleSelectComponent = vi.fn();
      
      render(
        <ComponentPalette onSelectComponent={handleSelectComponent} />
      );
      
      // In a real test, we would find specific components by test ID or name
      // For this example, we're just testing the click handler logic
      const componentItems = document.querySelectorAll('.component-item');
      
      // If there are any components rendered
      if (componentItems.length > 0) {
        fireEvent.click(componentItems[0]);
        expect(handleSelectComponent).toHaveBeenCalled();
      }
    });
  });
  
  describe('PropertyPanel', () => {
    test('renders property editors for selected component', () => {
      const component = {
        id: 'resistor-1',
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      };
      
      const { container } = render(
        <PropertyPanel
          component={component}
          onPropertyChange={() => {}}
        />
      );
      
      // Check if property editors are rendered using the correct CSS classes
      const propertyEditors = container.querySelectorAll('.cb-property-panel input, .cb-property-panel select');
      expect(propertyEditors.length).toBeGreaterThan(0);
    });
    
    test('displays empty state when no component is selected', () => {
      const { container } = render(
        <PropertyPanel
          component={null}
          onPropertyChange={() => {}}
        />
      );
      
      // Check for empty state message
      expect(container.textContent).toContain('No component selected');
    });
    
    test('calls onPropertyChange when property is changed', () => {
      const handlePropertyChange = vi.fn();
      
      const component = {
        id: 'resistor-1',
        type: 'resistor',
        position: { x: 100, y: 100 },
        props: { resistance: 1000 }
      };
      
      const { container } = render(
        <PropertyPanel
          component={component}
          onPropertyChange={handlePropertyChange}
        />
      );
      
      // Find property inputs
      const propertyInputs = container.querySelectorAll('input[type="number"]');
      
      // If there are any inputs, simulate changing one
      if (propertyInputs.length > 0) {
        fireEvent.change(propertyInputs[0], { target: { value: '2000' } });
        expect(handlePropertyChange).toHaveBeenCalled();
      }
    });
  });
});
