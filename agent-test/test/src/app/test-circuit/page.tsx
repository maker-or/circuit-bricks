'use client';

import { useState, useEffect } from 'react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { type Circuit } from '@/schemas/circuitSchema';

export default function TestCircuitPage() {
  const [circuitMarkdown, setCircuitMarkdown] = useState<string>('');
  const [currentCircuit, setCurrentCircuit] = useState<Circuit | null>(null);

  useEffect(() => {
    // Fetch the test circuit
    fetch('/api/test-circuit')
      .then(response => response.text())
      .then(markdown => {
        console.log('📄 Fetched test circuit markdown:', markdown);
        setCircuitMarkdown(markdown);
      })
      .catch(error => {
        console.error('❌ Failed to fetch test circuit:', error);
      });
  }, []);

  const handleCircuitGenerated = (circuit: Circuit) => {
    console.log('🎯 Test page received circuit:', circuit);
    setCurrentCircuit(circuit);
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Circuit Rendering Test</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Test Circuit Status</h2>
          <div className="text-sm text-gray-300">
            <p>Markdown loaded: {circuitMarkdown ? 'Yes' : 'No'}</p>
            <p>Circuit generated: {currentCircuit ? 'Yes' : 'No'}</p>
            {currentCircuit && (
              <div className="mt-2">
                <p>Components: {currentCircuit.components?.length || 0}</p>
                <p>Wires: {currentCircuit.wires?.length || 0}</p>
              </div>
            )}
          </div>
        </div>

        {circuitMarkdown && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Rendered Circuit</h2>
            <MarkdownRenderer 
              content={circuitMarkdown} 
              onCircuitGenerated={handleCircuitGenerated}
            />
          </div>
        )}
      </div>
    </div>
  );
}
