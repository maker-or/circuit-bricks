'use client';

import React, { useEffect, useState, useMemo, Component, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ComponentInstance, Wire } from '@sphere-labs/circuit-bricks';
import { type Circuit } from '@/schemas/circuitSchema';

// Dynamic import to avoid SSR issues with circuit-bricks
const DynamicCircuitCanvas = dynamic(() =>
  import('@sphere-labs/circuit-bricks').then(mod => ({ default: mod.CircuitCanvas })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-400">Loading circuit canvas...</p>
      </div>
    </div>
  )
});

/**
 * Transform circuit data from Circuit schema format to circuit-bricks ComponentInstance format
 */
const transformCircuitData = (circuit: Circuit): { components: ComponentInstance[], wires: Wire[] } => {
  try {
    // Transform components to ComponentInstance format
    const components: ComponentInstance[] = (circuit.components || []).map((comp) => ({
      id: comp.id,
      type: comp.type,
      position: comp.position,
      props: comp.props || {},
      rotation: comp.rotation || 0,
      size: comp.size ? { width: comp.size.width, height: comp.size.height } : undefined
    }));

    // Transform wires to circuit-bricks Wire format
    const wires: Wire[] = (circuit.wires || []).map((wire) => ({
      id: wire.id,
      from: wire.from,
      to: wire.to,
      style: wire.style || {}
    }));

    return { components, wires };
  } catch (error) {
    console.error('Error transforming circuit data:', error);
    return { components: [], wires: [] };
  }
};

// Simple Error Boundary component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 CircuitCanvas Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full text-red-500">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">Circuit Rendering Error</div>
            <div className="text-sm text-gray-400">
              {this.state.error?.message || 'Unknown error occurred'}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface CircuitCanvasProps {
  circuit: Circuit | null;
}

export default function CircuitCanvas({ circuit }: CircuitCanvasProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [selectedWireIds, setSelectedWireIds] = useState<string[]>([]);

  // Transform and memoize circuit data
  const { components, wires } = useMemo(() => {
    if (!circuit) {
      return { components: [], wires: [] };
    }

    try {
      const transformed = transformCircuitData(circuit);
      console.log('🔧 Transformed circuit data:', {
        components: transformed.components.length,
        wires: transformed.wires.length,
        originalCircuit: circuit
      });
      return transformed;
    } catch (error) {
      console.error('Error transforming circuit data:', error);
      setError('Invalid circuit data. Please check your circuit definition.');
      return { components: [], wires: [] };
    }
  }, [circuit]);

  // Validate circuit data
  useEffect(() => {
    if (circuit && !components.length) {
      setError('Circuit data must contain at least one component.');
    } else {
      setError(null);
    }
  }, [circuit, components]);

  // Event handlers for circuit interactions
  const handleComponentClick = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedComponentIds(prev =>
      event.ctrlKey || event.metaKey
        ? prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        : [id]
    );
  };

  const handleWireClick = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedWireIds(prev =>
      event.ctrlKey || event.metaKey
        ? prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]
        : [id]
    );
  };

  const handleCanvasClick = () => {
    setSelectedComponentIds([]);
    setSelectedWireIds([]);
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0c0c]">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Circuit Visualization</h2>
        {circuit && (
          <p className="text-gray-400 text-sm mt-1">
            {circuit.name || 'Generated Circuit'}
          </p>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {error ? (
          <div className="flex items-center justify-center h-full bg-red-900/20 border border-red-800">
            <div className="text-center">
              <div className="text-red-400 mb-2">⚠️</div>
              <p className="text-red-300 font-medium">Circuit Error</p>
              <p className="text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        ) : circuit ? (
          <div className="w-full h-full">
            <ErrorBoundary>
              <DynamicCircuitCanvas
                components={components}
                wires={wires}
                selectedComponentIds={selectedComponentIds}
                selectedWireIds={selectedWireIds}
                onComponentClick={handleComponentClick}
                onWireClick={handleWireClick}
                onCanvasClick={handleCanvasClick}
                width="100%"
                height="100%"
                showGrid={true}
                gridSize={20}
                initialZoom={1}
                minZoom={0.25}
                maxZoom={3}
              />
            </ErrorBoundary>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-400 mb-2">No Circuit Generated</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Ask the AI agent to create a circuit and it will appear here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Circuit Info */}
      {circuit && (
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <div className="text-sm text-gray-300">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-gray-500">Components:</span>
                <span className="ml-2 text-white">{components.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Connections:</span>
                <span className="ml-2 text-white">{wires.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Selected:</span>
                <span className="ml-2 text-white">
                  {selectedComponentIds.length + selectedWireIds.length}
                </span>
              </div>
            </div>
            {circuit.description && (
              <div className="mt-2">
                <span className="text-gray-500">Description:</span>
                <p className="text-white text-xs mt-1">{circuit.description}</p>
              </div>
            )}
            {selectedComponentIds.length > 0 && (
              <div className="mt-2">
                <span className="text-gray-500">Selected Components:</span>
                <p className="text-blue-300 text-xs mt-1">
                  {selectedComponentIds.join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
