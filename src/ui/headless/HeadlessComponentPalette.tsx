/**
 * HeadlessComponentPalette Component
 *
 * A headless (unstyled) component for selecting and adding circuit components to a canvas.
 * This component provides all the functionality without any styling, allowing users
 * to apply their own styling using their preferred method.
 */

import React, { useState, useRef, useEffect } from 'react';
import { getAllComponents, getComponentsByCategory } from '../../registry';
import { ComponentSchema } from '../../schemas/componentSchema';

export interface HeadlessComponentPaletteProps {
  /** Callback when a component is selected */
  onSelectComponent: (componentType: string) => void;
  /** Callback when a component is dragged */
  onDragComponent?: (componentType: string, event: React.DragEvent) => void;
  /** Additional class name for the root element */
  className?: string;
  /** Additional class names for sub-components */
  classNames?: {
    /** Class for the header section */
    header?: string;
    /** Class for the title */
    title?: string;
    /** Class for the search container */
    searchContainer?: string;
    /** Class for the search input */
    searchInput?: string;
    /** Class for the search icon */
    searchIcon?: string;
    /** Class for the clear search button */
    clearSearchButton?: string;
    /** Class for the category tabs container */
    categoryTabs?: string;
    /** Class for the category tabs inner container */
    categoryTabsInner?: string;
    /** Class for each category tab */
    categoryTab?: string;
    /** Class for the active category tab */
    activeCategoryTab?: string;
    /** Class for the component list container */
    componentList?: string;
    /** Class for the empty state container */
    emptyState?: string;
    /** Class for the component item */
    componentItem?: string;
    /** Class for the component icon container */
    componentIcon?: string;
    /** Class for the component details container */
    componentDetails?: string;
    /** Class for the component name */
    componentName?: string;
    /** Class for the component category */
    componentCategory?: string;
    /** Class for the component arrow icon */
    componentArrow?: string;
    /** Class for the left shadow overlay */
    leftShadow?: string;
    /** Class for the right shadow overlay */
    rightShadow?: string;
    /** Class for the top shadow overlay */
    topShadow?: string;
    /** Class for the bottom shadow overlay */
    bottomShadow?: string;
  };
  /** Additional inline styles for the root element */
  style?: React.CSSProperties;
  /** Additional inline styles for sub-components */
  styles?: {
    [key: string]: React.CSSProperties;
  };
}

const HeadlessComponentPalette: React.FC<HeadlessComponentPaletteProps> = ({
  onSelectComponent,
  onDragComponent,
  className = '',
  classNames = {},
  style = {},
  styles = {}
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
    const handleResize = () => {
      handleTabsScroll();
      handleListScroll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className={`cb-component-palette ${className}`}
      style={style}
      data-testid="component-palette"
    >
      <div
        className={`cb-component-palette-header ${classNames.header || ''}`}
        style={styles.header}
      >
        <h3
          className={`cb-component-palette-title ${classNames.title || ''}`}
          style={styles.title}
        >
          Components
        </h3>
        <div
          className={`cb-component-palette-search-container ${classNames.searchContainer || ''}`}
          style={styles.searchContainer}
        >
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`cb-component-palette-search-input ${classNames.searchInput || ''}`}
            style={styles.searchInput}
            aria-label="Search components"
          />
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cb-component-palette-search-icon ${classNames.searchIcon || ''}`}
            style={styles.searchIcon}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className={`cb-component-palette-clear-search ${classNames.clearSearchButton || ''}`}
              style={styles.clearSearchButton}
              aria-label="Clear search"
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
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="cb-component-palette-tabs-wrapper">
        <div
          ref={tabsRef}
          className={`cb-component-palette-category-tabs ${classNames.categoryTabs || ''}`}
          style={styles.categoryTabs}
          onScroll={handleTabsScroll}
        >
          <div
            className={`cb-component-palette-category-tabs-inner ${classNames.categoryTabsInner || ''}`}
            style={styles.categoryTabsInner}
          >
            <button
              className={`cb-component-palette-category-tab ${activeCategory === null ? 'cb-component-palette-category-tab-active' : ''} ${classNames.categoryTab || ''} ${activeCategory === null ? classNames.activeCategoryTab || '' : ''}`}
              onClick={() => setActiveCategory(null)}
              style={activeCategory === null ? { ...styles.categoryTab, ...styles.activeCategoryTab } : styles.categoryTab}
              data-active={activeCategory === null}
              aria-pressed={activeCategory === null}
            >
              All
            </button>
            {allCategories.map(category => (
              <button
                key={category}
                className={`cb-component-palette-category-tab ${activeCategory === category ? 'cb-component-palette-category-tab-active' : ''} ${classNames.categoryTab || ''} ${activeCategory === category ? classNames.activeCategoryTab || '' : ''}`}
                onClick={() => setActiveCategory(category)}
                style={activeCategory === category ? { ...styles.categoryTab, ...styles.activeCategoryTab } : styles.categoryTab}
                data-active={activeCategory === category}
                aria-pressed={activeCategory === category}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Shadow effects for tab scroll */}
        {showTabsLeftShadow && (
          <div
            className={`cb-component-palette-left-shadow ${classNames.leftShadow || ''}`}
            style={styles.leftShadow}
            aria-hidden="true"
          ></div>
        )}
        {showTabsRightShadow && (
          <div
            className={`cb-component-palette-right-shadow ${classNames.rightShadow || ''}`}
            style={styles.rightShadow}
            aria-hidden="true"
          ></div>
        )}
      </div>

      <div className="cb-component-palette-list-wrapper">
        <div
          ref={listRef}
          className={`cb-component-palette-component-list ${classNames.componentList || ''}`}
          style={styles.componentList}
          onScroll={handleListScroll}
        >
          {searchFilteredComponents.length === 0 ? (
            <div
              className={`cb-component-palette-empty-state ${classNames.emptyState || ''}`}
              style={styles.emptyState}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <p>No components found.</p>
            </div>
          ) : (
            <div className="cb-component-palette-component-items">
              {searchFilteredComponents.map(component => (
                <HeadlessComponentListItem
                  key={component.id}
                  component={component}
                  onSelect={() => onSelectComponent(component.id)}
                  onDrag={onDragComponent ? (e) => onDragComponent(component.id, e) : undefined}
                  classNames={classNames}
                  styles={styles}
                />
              ))}
            </div>
          )}
        </div>

        {/* Shadow effects for list scroll */}
        {showListTopShadow && (
          <div
            className={`cb-component-palette-top-shadow ${classNames.topShadow || ''}`}
            style={styles.topShadow}
            aria-hidden="true"
          ></div>
        )}
        {showListBottomShadow && (
          <div
            className={`cb-component-palette-bottom-shadow ${classNames.bottomShadow || ''}`}
            style={styles.bottomShadow}
            aria-hidden="true"
          ></div>
        )}
      </div>
    </div>
  );
};

interface HeadlessComponentListItemProps {
  component: ComponentSchema;
  onSelect: () => void;
  onDrag?: (event: React.DragEvent) => void;
  classNames?: HeadlessComponentPaletteProps['classNames'];
  styles?: HeadlessComponentPaletteProps['styles'];
}

const HeadlessComponentListItem: React.FC<HeadlessComponentListItemProps> = ({
  component,
  onSelect,
  onDrag,
  classNames = {},
  styles = {}
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
      className={`cb-component-item ${classNames.componentItem || ''}`}
      onClick={onSelect}
      title={component.description}
      draggable={true}
      onDragStart={handleDragStart}
      style={styles.componentItem}
      data-component-id={component.id}
      // data-component-type={component.type}
      data-component-category={component.category}
    >
      <div
        className={`cb-component-icon ${classNames.componentIcon || ''}`}
        style={styles.componentIcon}
      >
        <svg
          width="32"
          height="32"
          viewBox={`0 0 ${component.defaultWidth} ${component.defaultHeight}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
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
        className={`cb-component-details ${classNames.componentDetails || ''}`}
        style={styles.componentDetails}
      >
        <span
          className={`cb-component-name ${classNames.componentName || ''}`}
          style={styles.componentName}
        >
          {component.name}
        </span>
        <span
          className={`cb-component-category ${classNames.componentCategory || ''}`}
          style={styles.componentCategory}
        >
          {component.category}
        </span>
      </div>
      <div
        className={`cb-component-arrow ${classNames.componentArrow || ''}`}
        style={styles.componentArrow}
        aria-hidden="true"
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

export default HeadlessComponentPalette;
