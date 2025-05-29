'use client';

import { useState } from 'react';

export default function TestComponentGeneration() {
  const [components, setComponents] = useState(['led', 'capacitor', 'inductor']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testComponentGeneration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-component-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ components }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to generate components');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addComponent = () => {
    setComponents([...components, '']);
  };

  const updateComponent = (index: number, value: string) => {
    const newComponents = [...components];
    newComponents[index] = value;
    setComponents(newComponents);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Component Generation Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Components to Generate</h2>
          
          {components.map((component, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={component}
                onChange={(e) => updateComponent(index, e.target.value)}
                placeholder="Component name (e.g., led, capacitor)"
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
              <button
                onClick={() => removeComponent(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
              >
                Remove
              </button>
            </div>
          ))}
          
          <div className="flex space-x-2 mt-4">
            <button
              onClick={addComponent}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            >
              Add Component
            </button>
            
            <button
              onClick={testComponentGeneration}
              disabled={loading || components.length === 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-white"
            >
              {loading ? 'Generating...' : 'Test Generation'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-red-300 font-medium mb-2">Error</h3>
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h3 className="text-green-300 font-medium mb-2">Success</h3>
              <p className="text-green-400">{result.message}</p>
              <p className="text-green-400">Total components after: {result.totalComponentsAfter}</p>
            </div>

            {result.generatedSchemas && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Generated Schemas</h3>
                <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.generatedSchemas, null, 2)}
                </pre>
              </div>
            )}

            {result.registrationResults && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Registration Results</h3>
                <div className="space-y-2">
                  {result.registrationResults.map((reg: any, index: number) => (
                    <div
                      key={index}
                      className={`p-2 rounded ${
                        reg.status === 'success' 
                          ? 'bg-green-900/20 border border-green-500/30' 
                          : 'bg-red-900/20 border border-red-500/30'
                      }`}
                    >
                      <span className={reg.status === 'success' ? 'text-green-300' : 'text-red-300'}>
                        {reg.id}: {reg.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.rawResponse && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Raw LLM Response</h3>
                <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto max-h-96">
                  {result.rawResponse}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
