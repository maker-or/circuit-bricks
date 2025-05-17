# Circuit-Bricks Testing Checklist

## Automated Tests

- [x] Component registry tests pass
- [x] Component rendering tests pass
- [x] Hook functionality tests pass
- [x] Circuit validation tests pass

## Component Rendering

- [ ] **Resistor**: Renders correctly with proper terminals
- [ ] **Battery**: Shows positive and negative terminals
- [ ] **LED**: Renders with proper orientation and color support
- [ ] **Capacitor**: Displays with proper polarity indicators
- [ ] **Ground**: Symbol rendered correctly
- [ ] **Switch**: On/off states are visually distinguishable
- [ ] **Transistor**: NPN variant renders correctly with B/C/E terminals
- [ ] **IC**: Renders with proper pin layout
- [ ] **Diode**: Shows with proper cathode/anode markings
- [ ] **Voltage Source**: AC/DC indicator is clear

## Interactive Features

- [ ] Component selection
  - [ ] Clicking a component selects it
  - [ ] Selected component shows visual indicator
  - [ ] Multiple selection works (if implemented)
  - [ ] Canvas click deselects all elements
  
- [ ] Wire interactions
  - [ ] Clicking a wire selects it
  - [ ] Selected wire shows visual indicator (color/thickness)
  - [ ] Connecting ports works correctly
  - [ ] Wire path is visually appropriate

- [ ] Component movement (if implemented)
  - [ ] Dragging moves component
  - [ ] Connected wires update properly
  - [ ] Snap-to-grid works (if implemented)

- [ ] Pan & Zoom Navigation
  - [ ] Canvas can be panned with Alt+drag or middle mouse button
  - [ ] Zoom in/out with Ctrl/⌘+mouse wheel works correctly
  - [ ] Keyboard shortcuts for zoom (Ctrl/⌘+plus, Ctrl/⌘+minus) work
  - [ ] Reset view (Ctrl/⌘+0) restores default view
  - [ ] Arrow key navigation with Alt key works as expected
  - [ ] Grid scales appropriately with zoom level
  - [ ] Minimap shows correct viewport position
  - [ ] Navigation controls are visible and functional
  - [ ] Component selection works correctly at different zoom levels
  - [ ] Wire drawing works correctly with pan/zoom applied
  - [ ] Component position calculations account for pan/zoom

## Component Palette

- [ ] Categories are clearly displayed
- [ ] All components are listed under appropriate categories
- [ ] Component icons/thumbnails are recognizable
- [ ] Clicking a component adds it to the canvas
- [ ] New component position is sensible

## Property Panel

- [ ] Properties display for selected components
- [ ] Numeric inputs
  - [ ] Changing resistance value for resistor updates component
  - [ ] Voltage adjustment for battery updates component
  - [ ] Units are displayed correctly (Ω, V, etc.)
  
- [ ] Boolean inputs
  - [ ] Toggle switches work
  - [ ] On/off state is visually reflected
  
- [ ] Dropdown/select inputs work correctly
- [ ] Color picker works for components that support it (LED)

## Toolbar Actions

- [ ] Delete functionality
  - [ ] Selected component is removed
  - [ ] Selected wire is removed
  - [ ] Connected wires are handled appropriately
  
- [ ] Rotation (if implemented)
  - [ ] Components rotate correctly
  - [ ] Rotation preserves connections
  
- [ ] Copy/paste (if implemented)
  - [ ] Copied component creates identical instance
  - [ ] Pasted component has unique ID
  
- [ ] Undo/redo (if implemented)
  - [ ] Adding component can be undone/redone
  - [ ] Removing component can be undone/redone
  - [ ] Moving component can be undone/redone
  - [ ] Property changes can be undone/redone

## Circuit Validation

- [ ] Invalid connections
  - [ ] Incompatible ports cannot connect
  - [ ] Error message/visual indicator is shown
  
- [ ] Circuit analysis features (if implemented)
  - [ ] Simple voltage/current calculations work
  - [ ] Short circuits are detected
  - [ ] Open circuits are detected

## Browser Compatibility

- [ ] Chrome
  - [ ] Rendering is correct
  - [ ] Interactions work
  
- [ ] Firefox
  - [ ] Rendering is correct
  - [ ] Interactions work
  
- [ ] Safari
  - [ ] Rendering is correct
  - [ ] Interactions work
  
- [ ] Edge
  - [ ] Rendering is correct
  - [ ] Interactions work

## Performance

- [ ] Circuit with 10+ components renders smoothly
- [ ] Wire path calculations are efficient
- [ ] Selection/deselection is responsive
- [ ] Property updates are immediate
- [ ] No memory leaks during extended use

## Accessibility

- [ ] Keyboard navigation works
- [ ] Color contrast is sufficient
- [ ] Screen reader compatibility (ARIA attributes)
- [ ] Text size is adjustable

## Notes

_Document any issues or bugs found during testing here:_

1. **Component Tests**: All component tests are now passing correctly.
2. **Hook Tests**: useCircuit hook API was updated to match the implementation.
3. **Circuit Validation**: 
   - Validation is working with minor issues on simple circuits.
   - The current validation implementation doesn't detect floating components (not connected to anything).
   - The validation doesn't explicitly check for incompatible port types.
4. **Complex Circuits**: New tests for complex circuits help verify multi-component functionality.
5. **TypeScript Setup**: 
   - Fixed SVG element mocks in test setup to properly implement DOMRect, DOMMatrix, and DOMPoint interfaces.
   - Using type assertions to bypass strict type checking for test mocks.
   - Fixed validation test type issues related to issue type comparison.
