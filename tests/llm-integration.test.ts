/**
 * Tests for LLM Integration API
 */

import { describe, it, expect } from 'vitest';
import { LLM } from '../src/index';

describe('LLM Integration API', () => {
  describe('Component Discovery', () => {
    it('should list all available components', () => {
      const components = LLM.listAvailableComponents();
      
      expect(Array.isArray(components)).toBe(true);
      expect(components.length).toBeGreaterThan(0);
      
      // Check that each component has required fields
      components.forEach(component => {
        expect(component).toHaveProperty('id');
        expect(component).toHaveProperty('name');
        expect(component).toHaveProperty('category');
        expect(component).toHaveProperty('description');
        expect(component).toHaveProperty('ports');
        expect(component).toHaveProperty('properties');
        expect(Array.isArray(component.ports)).toBe(true);
        expect(Array.isArray(component.properties)).toBe(true);
      });
    });

    it('should get components by category', () => {
      const categories = LLM.getAllCategories();
      expect(categories.length).toBeGreaterThan(0);
      
      const firstCategory = categories[0];
      const componentsInCategory = LLM.listComponentsByCategory(firstCategory);
      
      expect(Array.isArray(componentsInCategory)).toBe(true);
      componentsInCategory.forEach(component => {
        expect(component.category).toBe(firstCategory);
      });
    });

    it('should get component details by ID', () => {
      const allComponents = LLM.listAvailableComponents();
      const firstComponent = allComponents[0];
      
      const details = LLM.getComponentDetails(firstComponent.id);
      
      expect(details).not.toBeNull();
      expect(details?.id).toBe(firstComponent.id);
      expect(details?.name).toBe(firstComponent.name);
    });

    it('should return null for non-existent component', () => {
      const details = LLM.getComponentDetails('non-existent-component');
      expect(details).toBeNull();
    });

    it('should search components', () => {
      const results = LLM.searchComponents('resistor');
      
      expect(Array.isArray(results)).toBe(true);
      
      if (results.length > 0) {
        results.forEach(result => {
          expect(result).toHaveProperty('component');
          expect(result).toHaveProperty('relevanceScore');
          expect(result).toHaveProperty('matchedFields');
          expect(result.relevanceScore).toBeGreaterThan(0);
        });
      }
    });

    it('should get registry metadata', () => {
      const metadata = LLM.getRegistryMetadata();
      
      expect(metadata).toHaveProperty('totalComponents');
      expect(metadata).toHaveProperty('categories');
      expect(metadata).toHaveProperty('componentsByCategory');
      expect(metadata).toHaveProperty('lastUpdated');
      
      expect(metadata.totalComponents).toBeGreaterThan(0);
      expect(Array.isArray(metadata.categories)).toBe(true);
      expect(typeof metadata.componentsByCategory).toBe('object');
    });

    it('should generate registry summary', () => {
      const summary = LLM.getRegistrySummary();
      
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
      expect(summary).toContain('Circuit-Bricks Component Registry');
    });

    it('should get detailed component summary', () => {
      const allComponents = LLM.listAvailableComponents();
      const firstComponent = allComponents[0];
      
      const summary = LLM.getComponentDetailedSummary(firstComponent.id);
      
      expect(typeof summary).toBe('string');
      expect(summary).toContain(firstComponent.name);
      expect(summary).toContain('Ports');
    });
  });

  describe('Circuit Generation', () => {
    it('should generate circuit template from description', () => {
      const template = LLM.generateCircuitTemplate('LED circuit');
      
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('components');
      expect(template).toHaveProperty('wires');
      
      expect(Array.isArray(template.components)).toBe(true);
      expect(Array.isArray(template.wires)).toBe(true);
    });

    it('should describe a circuit', () => {
      const template = LLM.generateCircuitTemplate('LED circuit');
      const description = LLM.describeCircuit(template);
      
      expect(description).toHaveProperty('summary');
      expect(description).toHaveProperty('components');
      expect(description).toHaveProperty('connections');
      expect(description).toHaveProperty('analysis');
      
      expect(typeof description.summary).toBe('string');
      expect(Array.isArray(description.components)).toBe(true);
      expect(Array.isArray(description.connections)).toBe(true);
    });

    it('should suggest connections for components', () => {
      const template = LLM.generateCircuitTemplate('LED circuit');
      const suggestions = LLM.suggestConnections(template.components);
      
      expect(Array.isArray(suggestions)).toBe(true);
      
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('from');
        expect(suggestion).toHaveProperty('to');
        expect(suggestion).toHaveProperty('reason');
        expect(suggestion).toHaveProperty('confidence');
        
        expect(suggestion.confidence).toBeGreaterThan(0);
        expect(suggestion.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Validation', () => {
    it('should validate circuit design', () => {
      const template = LLM.generateCircuitTemplate('LED circuit');
      const validation = LLM.validateCircuitDesign(template);
      
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('suggestions');
      
      expect(typeof validation.isValid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);
      expect(Array.isArray(validation.warnings)).toBe(true);
      expect(Array.isArray(validation.suggestions)).toBe(true);
    });

    it('should validate component instance', () => {
      const template = LLM.generateCircuitTemplate('LED circuit');
      const firstComponent = template.components[0];
      
      const validation = LLM.validateComponentInstance(firstComponent);
      
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('suggestions');
    });

    it('should validate wire connection', () => {
      const template = LLM.generateCircuitTemplate('LED circuit');
      
      if (template.wires.length > 0) {
        const firstWire = template.wires[0];
        const validation = LLM.validateWireConnection(firstWire, template.components);
        
        expect(validation).toHaveProperty('isValid');
        expect(validation).toHaveProperty('errors');
        expect(validation).toHaveProperty('warnings');
        expect(validation).toHaveProperty('suggestions');
      }
    });
  });

  describe('Utility Functions', () => {
    it('should provide quick start information', () => {
      const quickStart = LLM.getQuickStart();
      
      expect(quickStart).toHaveProperty('totalComponents');
      expect(quickStart).toHaveProperty('categories');
      expect(quickStart).toHaveProperty('popularComponents');
      expect(quickStart).toHaveProperty('exampleUsage');
      
      expect(quickStart.totalComponents).toBeGreaterThan(0);
      expect(Array.isArray(quickStart.categories)).toBe(true);
      expect(Array.isArray(quickStart.popularComponents)).toBe(true);
      expect(typeof quickStart.exampleUsage).toBe('string');
    });

    it('should provide API help', () => {
      const help = LLM.getAPIHelp();
      
      expect(help).toHaveProperty('overview');
      expect(help).toHaveProperty('commonTasks');
      expect(help).toHaveProperty('bestPractices');
      
      expect(typeof help.overview).toBe('string');
      expect(Array.isArray(help.commonTasks)).toBe(true);
      expect(Array.isArray(help.bestPractices)).toBe(true);
    });

    it('should provide API status', () => {
      const status = LLM.getAPIStatus();
      
      expect(status).toHaveProperty('isReady');
      expect(status).toHaveProperty('version');
      expect(status).toHaveProperty('componentsLoaded');
      expect(status).toHaveProperty('categoriesAvailable');
      expect(status).toHaveProperty('lastUpdated');
      
      expect(typeof status.isReady).toBe('boolean');
      expect(typeof status.version).toBe('string');
      expect(typeof status.componentsLoaded).toBe('number');
      expect(typeof status.categoriesAvailable).toBe('number');
    });
  });

  describe('Integration with existing registry', () => {
    it('should work with built-in components', () => {
      const components = LLM.listAvailableComponents();
      
      // Check for some expected built-in components
      const componentIds = components.map(c => c.id);
      expect(componentIds).toContain('resistor');
      expect(componentIds).toContain('battery');
      expect(componentIds).toContain('ground');
    });

    it('should provide consistent data across functions', () => {
      const allComponents = LLM.listAvailableComponents();
      const metadata = LLM.getRegistryMetadata();
      
      expect(allComponents.length).toBe(metadata.totalComponents);
      
      const categoriesFromComponents = [...new Set(allComponents.map(c => c.category))];
      expect(categoriesFromComponents.sort()).toEqual(metadata.categories.sort());
    });
  });
});
