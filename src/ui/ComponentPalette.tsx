/**
 * ComponentPalette Component
 *
 * A component for selecting and adding circuit components to a canvas.
 * This is a styled wrapper around the HeadlessComponentPalette component.
 */

import React, { CSSProperties } from 'react';
import HeadlessComponentPalette from './headless/HeadlessComponentPalette';

export interface ComponentPaletteProps {
  onSelectComponent: (componentType: string) => void;
  onDragComponent?: (componentType: string, event: React.DragEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onSelectComponent,
  onDragComponent,
  className = '',
  style = {}
}) => {
  // Root style with user's custom style
  const rootStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#2d3748',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    height: '100%',
    border: '1px solid #1a202c',
    ...style
  };

  // Default styles for the ComponentPalette
  const defaultStyles: Record<string, CSSProperties> = {
    // Header section
    header: {
      padding: '16px',
      borderBottom: '1px solid #1a202c',
      background: '#202938'
    },

    // Title
    title: {
      margin: '0 0 12px 0',
      fontSize: '18px',
      fontWeight: 600,
      color: '#e2e8f0'
    },

    // Search container
    searchContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },

    // Search input
    searchInput: {
      width: '100%',
      padding: '10px 12px 10px 36px',
      fontSize: '14px',
      border: '1px solid #4a5568',
      borderRadius: '8px',
      backgroundColor: '#1a202c',
      color: '#e2e8f0',
      transition: 'all 0.2s ease',
      outline: 'none',
      boxSizing: 'border-box',
      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
    },

    // Search icon
    searchIcon: {
      position: 'absolute',
      left: '12px',
      pointerEvents: 'none',
      color: '#a0aec0'
    },

    // Clear search button
    clearSearchButton: {
      position: 'absolute',
      right: '12px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#a0aec0'
    },

    // Category tabs
    categoryTabs: {
      display: 'flex',
      overflowX: 'auto',
      padding: '0 16px',
      scrollbarWidth: 'none' as const,
      msOverflowStyle: 'none' as const,
      background: '#202938',
      position: 'relative',
      zIndex: 1
    },

    // Category tabs inner
    categoryTabsInner: {
      display: 'flex',
      padding: '8px 0',
      gap: '8px'
    },

    // Category tab
    categoryTab: {
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 500,
      border: 'none',
      background: 'transparent',
      color: '#a0aec0',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
      boxShadow: 'none'
    },

    // Active category tab
    activeCategoryTab: {
      background: '#3182ce',
      color: '#fff',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
    },

    // Component list
    componentList: {
      overflowY: 'auto',
      height: '100%',
      padding: '0 16px 16px',
      position: 'relative',
      zIndex: 1
    },

    // Empty state
    emptyState: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 0',
      color: '#718096',
      textAlign: 'center',
      margin: '16px 0'
    },

    // Component items container
    componentItems: {
      padding: 0,
      margin: '16px 0 0 0',
      display: 'grid',
      gap: '10px'
    },

    // Component item
    componentItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 12px',
      borderRadius: '8px',
      background: '#1a202c',
      border: '1px solid #2d3748',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      gap: '12px',
      listStyle: 'none'
    },

    // Component icon
    componentIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '48px',
      height: '48px',
      borderRadius: '6px',
      background: '#2d3748',
      color: '#a0aec0',
      flexShrink: 0
    },

    // Component details
    componentDetails: {
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden'
    },

    // Component name
    componentName: {
      fontWeight: 500,
      fontSize: '14px',
      color: '#e2e8f0',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      opacity: 0.9
    },

    // Component category
    componentCategory: {
      fontSize: '12px',
      color: '#a0aec0',
      marginTop: '2px',
      opacity: 0.7
    },

    // Component arrow
    componentArrow: {
      marginLeft: 'auto',
      opacity: 0.4,
      flexShrink: 0,
      color: '#718096'
    },

    // Left shadow
    leftShadow: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '16px',
      height: '100%',
      background: 'linear-gradient(to right, rgba(32, 41, 56, 0.9), rgba(32, 41, 56, 0))',
      zIndex: 2,
      pointerEvents: 'none'
    },

    // Right shadow
    rightShadow: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '16px',
      height: '100%',
      background: 'linear-gradient(to left, rgba(32, 41, 56, 0.9), rgba(32, 41, 56, 0))',
      zIndex: 2,
      pointerEvents: 'none'
    },

    // Top shadow
    topShadow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '12px',
      background: 'linear-gradient(to bottom, rgba(45, 55, 72, 0.9), rgba(45, 55, 72, 0))',
      zIndex: 2,
      pointerEvents: 'none'
    },

    // Bottom shadow
    bottomShadow: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '12px',
      background: 'linear-gradient(to top, rgba(45, 55, 72, 0.9), rgba(45, 55, 72, 0))',
      zIndex: 2,
      pointerEvents: 'none'
    }
  };

  return (
    <HeadlessComponentPalette
      onSelectComponent={onSelectComponent}
      onDragComponent={onDragComponent}
      className={className}
      style={rootStyle}
      styles={defaultStyles}
    />
  );
};

export default ComponentPalette;
