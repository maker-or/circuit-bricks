/**
 * ComponentPalette Component
 * 
 * A component for selecting and adding circuit components to a canvas.
 */

import React, { useState, useRef, useEffect } from 'react';
import { getAllComponents, getComponentsByCategory } from '../registry';
import { ComponentSchema } from '../types';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Get all components and extract unique categories
  const allComponents = getAllComponents();
  const allCategories = Array.from(
    new Set(allComponents.map(comp => comp.category))
  ).sort();
  
  // Filter components based on search and category
  const filteredComponents = activeCategory
    ? getComponentsByCategory(activeCategory)
    : allComponents;
  
  const searchFilteredComponents = searchTerm
    ? filteredComponents.filter(comp => 
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredComponents;
  
  // Refs for scroll shadow effects
  const tabsRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [showTabsLeftShadow, setShowTabsLeftShadow] = useState(false);
  const [showTabsRightShadow, setShowTabsRightShadow] = useState(false);
  const [showListTopShadow, setShowListTopShadow] = useState(false);
  const [showListBottomShadow, setShowListBottomShadow] = useState(false);

  // Handle scroll shadows for tabs
  const handleTabsScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowTabsLeftShadow(scrollLeft > 0);
      setShowTabsRightShadow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Handle scroll shadows for component list
  const handleListScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      setShowListTopShadow(scrollTop > 0);
      setShowListBottomShadow(scrollTop < scrollHeight - clientHeight - 1);
    }
  };

  // Initialize scroll shadows
  useEffect(() => {
    handleTabsScroll();
    handleListScroll();
    
    // Add resize event listener
    window.addEventListener('resize', () => {
      handleTabsScroll();
      handleListScroll();
    });
    
    return () => {
      window.removeEventListener('resize', () => {
        handleTabsScroll();
        handleListScroll();
      });
    };
  }, []);

  return (
    <div 
      className={`component-palette ${className}`} 
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#f8f9fa',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        height: '100%',
        border: '1px solid #eaeef2',
        ...style
      }}
    >
      <div 
        className="palette-header"
        style={{
          padding: '16px',
          borderBottom: '1px solid #eaeef2',
          background: 'white'
        }}
      >
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '18px', 
          fontWeight: 600,
          color: '#2d3748'
        }}>
          Components
        </h3>
        <div style={{ 
          position: 'relative', 
          display: 'flex',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              fontSize: '14px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: '#f8f9fa',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4299e1';
              e.target.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.05), 0 0 0 3px rgba(66, 153, 225, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.05)';
            }}
          />
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a0aec0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: 'absolute',
              left: '12px',
              pointerEvents: 'none'
            }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a0aec0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div style={{ position: 'relative' }}>
        <div 
          ref={tabsRef}
          className="category-tabs"
          style={{
            display: 'flex',
            overflowX: 'auto',
            padding: '0 16px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            background: 'white',
            position: 'relative',
            zIndex: 1
          }}
          onScroll={handleTabsScroll}
        >
          <div style={{ 
            display: 'flex', 
            padding: '8px 0',
            gap: '8px'
          }}>
            <button 
              className={activeCategory === null ? 'active-category' : ''}
              onClick={() => setActiveCategory(null)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                background: activeCategory === null ? '#ebf8ff' : 'transparent',
                color: activeCategory === null ? '#3182ce' : '#4a5568',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: activeCategory === null ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== null) {
                  e.currentTarget.style.background = '#f7fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== null) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              All
            </button>
            {allCategories.map(category => (
              <button
                key={category}
                className={activeCategory === category ? 'active-category' : ''}
                onClick={() => setActiveCategory(category)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                  background: activeCategory === category ? '#ebf8ff' : 'transparent',
                  color: activeCategory === category ? '#3182ce' : '#4a5568',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  boxShadow: activeCategory === category ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeCategory !== category) {
                    e.currentTarget.style.background = '#f7fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== category) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Shadow effects for tab scroll */}
        {showTabsLeftShadow && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '16px',
            height: '100%',
            background: 'linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0))',
            zIndex: 2,
            pointerEvents: 'none'
          }}></div>
        )}
        {showTabsRightShadow && (
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '16px',
            height: '100%',
            background: 'linear-gradient(to left, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0))',
            zIndex: 2,
            pointerEvents: 'none'
          }}></div>
        )}
      </div>
      
      <div style={{ position: 'relative', flex: 1 }}>
        <div 
          ref={listRef}
          className="component-list"
          style={{
            overflowY: 'auto',
            height: '100%',
            padding: '0 16px 16px',
            position: 'relative',
            zIndex: 1
          }}
          onScroll={handleListScroll}
        >
          {searchFilteredComponents.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 0',
              color: '#718096',
              textAlign: 'center',
              margin: '16px 0'
            }}>
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="#cbd5e0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: '12px', opacity: 0.7 }}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                No components found.
              </p>
            </div>
          ) : (
            <div style={{
              padding: 0,
              margin: '16px 0 0 0',
              display: 'grid',
              gap: '10px'
            }}>
              {searchFilteredComponents.map(component => (
                <ComponentListItem
                  key={component.id}
                  component={component}
                  onSelect={() => onSelectComponent(component.id)}
                  onDrag={onDragComponent ? (e) => onDragComponent(component.id, e) : undefined}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Shadow effects for list scroll */}
        {showListTopShadow && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '12px',
            background: 'linear-gradient(to bottom, rgba(248, 249, 250, 0.9), rgba(248, 249, 250, 0))',
            zIndex: 2,
            pointerEvents: 'none'
          }}></div>
        )}
        {showListBottomShadow && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '12px',
            background: 'linear-gradient(to top, rgba(248, 249, 250, 0.9), rgba(248, 249, 250, 0))',
            zIndex: 2,
            pointerEvents: 'none'
          }}></div>
        )}
      </div>
    </div>
  );
};

interface ComponentListItemProps {
  component: ComponentSchema;
  onSelect: () => void;
  onDrag?: (event: React.DragEvent) => void;
}

const ComponentListItem: React.FC<ComponentListItemProps> = ({ 
  component, 
  onSelect,
  onDrag 
}) => {
  const handleDragStart = (event: React.DragEvent) => {
    // Set data to be dragged
    event.dataTransfer.setData('application/circuit-component', component.id);
    event.dataTransfer.effectAllowed = 'copy';
    
    // Create a custom drag image
    const dragImg = document.createElement('div');
    dragImg.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 ${component.defaultWidth} ${component.defaultHeight}">
        <path 
          d="${component.svgPath}"
          fill="none"
          stroke="#333"
          stroke-width="2"
        />
      </svg>
    `;
    dragImg.style.position = 'absolute';
    dragImg.style.top = '-1000px';
    document.body.appendChild(dragImg);
    
    event.dataTransfer.setDragImage(dragImg, 20, 20);
    
    // Custom onDrag handler
    onDrag?.(event);
    
    // Clean up after drag operation
    setTimeout(() => {
      document.body.removeChild(dragImg);
    }, 0);
  };
  
  return (
    <li 
      className="component-item"
      onClick={onSelect}
      title={component.description}
      draggable={true}
      onDragStart={handleDragStart}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 12px',
        borderRadius: '8px',
        background: 'white',
        border: '1px solid #edf2f7',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        gap: '12px'
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)';
        target.style.transform = 'translateY(-1px)';
        target.style.borderColor = '#e2e8f0';
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
        target.style.transform = 'translateY(0)';
        target.style.borderColor = '#edf2f7';
      }}
    >
      <div 
        className="component-icon"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          borderRadius: '6px',
          background: '#f7fafc',
          color: '#4a5568',
          flexShrink: 0
        }}
      >
        <svg 
          width="32" 
          height="32"
          viewBox={`0 0 ${component.defaultWidth} ${component.defaultHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <path 
            d={component.svgPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div 
        className="component-details"
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <span 
          className="component-name"
          style={{
            fontWeight: 500,
            fontSize: '14px',
            color: '#2d3748',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            opacity: 0.85
          }}
        >
          {component.name}
        </span>
        <span 
          className="component-category"
          style={{
            fontSize: '12px',
            color: '#718096',
            marginTop: '2px',
            opacity: 0.7
          }}
        >
          {component.category}
        </span>
      </div>
      <div 
        style={{
          marginLeft: 'auto', 
          opacity: 0.4,
          flexShrink: 0,
          color: '#718096'
        }}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    </li>
  );
};

export default ComponentPalette;
